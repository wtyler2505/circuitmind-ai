import { useCallback, useState, useMemo } from 'react';
import { ActionIntent, ElectronicComponent } from '../types';
import { DiagramCanvasRef, HighlightOptions } from '../components/DiagramCanvas';
import { getHandler, ActionContext } from './actions';
import { useAutonomySettings } from './useAutonomySettings';
import { useActionHistory, ActionResult } from './useActionHistory';
import { useInventory } from '../contexts/InventoryContext';
import { useDiagram } from '../contexts/DiagramContext';
import { useLayout } from '../contexts/LayoutContext';
import { useAssistantState } from '../contexts/AssistantStateContext';
import { useConversationContext } from '../contexts/ConversationContext';
import { useMacros } from '../contexts/MacroContext';
import { engineeringMetricsService } from '../services/aiMetricsService';
import { usePermissions } from './usePermissions';
import { auditService } from '../services/logging/auditService';
import { PredictiveAction } from '../services/predictionEngine';

export type { ActionResult } from './useActionHistory';

export interface UseAIActionsOptions {
  canvasRef: React.RefObject<DiagramCanvasRef | null>; // Updated type to match nullable ref
  setSelectedComponent: (component: ElectronicComponent | null) => void;
}

export function useAIActions(options: UseAIActionsOptions) {
  const { canvasRef, setSelectedComponent } = options;

  // Contexts
  const { inventory, setInventory } = useInventory();
  const { diagram, updateDiagram, undo: handleUndo, redo: handleRedo, saveToQuickSlot: saveDiagram, loadFromQuickSlot: loadDiagram } = useDiagram();
  const { setInventoryOpen, setSettingsOpen } = useLayout();
  const { setGenerationMode, pushActionDelta } = useAssistantState();
  const { activeConversationId } = useConversationContext();

  const [pendingActions, setPendingActions] = useState<ActionIntent[]>([]);
  const [stagedActions, setStagedActions] = useState<PredictiveAction[]>([]);
  const { autonomySettings, updateAutonomySettings, isActionSafe } = useAutonomySettings();
  const { actionHistory, addToHistory, recordUndo, undo, canUndo } = useActionHistory(updateDiagram);
  const { isRecording, addRecordedStep } = useMacros();
  const perms = usePermissions();

  // Execute action via handler registry
  const executeAction = useCallback(async (action: ActionIntent, auto: boolean): Promise<ActionResult> => {
    // 0. Permission Check
    if (action.type === 'addComponent' || action.type === 'removeComponent' || action.type === 'clearCanvas') {
      if (!perms.canModifyDiagram) {
        return { action, success: false, timestamp: Date.now(), auto, error: 'Access Denied: Insufficient Permissions' };
      }
    }
    if (action.type === 'openInventory') {
      if (!perms.canEditInventory) {
        // Observers can see inventory but maybe not edit? 
        // For now let's be strict if we want to guard the tab
      }
    }

    // ...
    // context building omitted for brevity in replace
    const context: ActionContext = {
      canvasRef: canvasRef as React.RefObject<DiagramCanvasRef>, // Cast for compatibility with handler types
      inventory, diagram, setInventory,
      setIsInventoryOpen: setInventoryOpen,
      setIsSettingsOpen: setSettingsOpen,
      setSelectedComponent,
      setGenerationMode, updateDiagram, activeConversationId,
      recordUndo,
      // App Controls
      handleUndo, handleRedo, saveDiagram, loadDiagram
    };

    const result: ActionResult = {
      action,
      success: false,
      timestamp: Date.now(),
      auto,
    }

    try {
      const handler = getHandler(action.type);
      if (!handler) {
        result.error = `Unknown action type: ${action.type}`;
        auditService.log('error', 'action-handler', `Unknown action type: ${action.type}`);
      } else {
        const handlerResult = await handler(action.payload, context);
        result.success = handlerResult.success;
        result.error = handlerResult.error;
        
        if (!result.success) {
          auditService.log('warn', 'action-handler', `Action failed: ${action.type}`, { error: result.error });
        }
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : 'Unknown error';
      auditService.log('error', 'action-handler', `Action crashed: ${action.type}`, { error: result.error });
    }

    if (result.success) {
      auditService.log('info', 'action-handler', `Action executed: ${action.type}`, { label: action.label, auto });
      engineeringMetricsService.logEvent('action_execute', { type: action.type, label: action.label });
      if (isRecording) {
        addRecordedStep(action);
      }
      pushActionDelta({
        type: action.type,
        targetId: (action.payload['componentId'] || action.payload['nodeId'] || action.payload['id']) as string | undefined,
        description: action.label
      });
    }

    addToHistory(result);
    return result;
  }, [
    canvasRef, inventory, diagram, setInventory,
    setInventoryOpen, setSettingsOpen, setSelectedComponent,
    setGenerationMode, updateDiagram, activeConversationId,
    recordUndo, addToHistory, handleUndo, handleRedo, saveDiagram, loadDiagram, pushActionDelta
  ]);

  // Staged Actions (Predictions)
  const acceptStagedAction = useCallback(async (id: string) => {
    const prediction = stagedActions.find((a) => a.id === id);
    if (prediction) {
      setStagedActions((prev) => prev.filter((a) => a.id !== id));
      return await executeAction(prediction.action, false);
    }
  }, [stagedActions, executeAction]);

  const rejectStagedAction = useCallback((id: string) => {
    setStagedActions((prev) => prev.filter((a) => a.id !== id));
  }, [stagedActions]);

  const clearStagedActions = useCallback(() => setStagedActions([]), []);
  const stageActions = useCallback((actions: PredictiveAction[]) => setStagedActions(actions), []);

  // Main execute - checks autonomy settings
  const execute = useCallback(async (action: ActionIntent): Promise<ActionResult> => {
    const safe = action.safe ?? isActionSafe(action.type);

    if (safe && autonomySettings.autoExecuteSafeActions) {
      return executeAction(action, true);
    } else {
      setPendingActions((prev) => [...prev, action]);
      return {
        action,
        success: false,
        timestamp: Date.now(),
        auto: false,
        error: 'Awaiting user confirmation',
      };
    }
  }, [autonomySettings, isActionSafe, executeAction]);

  const confirmAction = useCallback(async (action: ActionIntent): Promise<ActionResult> => {
    setPendingActions((prev) => prev.filter((a) => a !== action));
    return executeAction(action, false);
  }, [executeAction]);

  const rejectAction = useCallback((action: ActionIntent) => {
    setPendingActions((prev) => prev.filter((a) => a !== action));
  }, []);

  const clearPendingActions = useCallback(() => setPendingActions([]), []);

  // Convenience shortcuts (direct canvas calls)
  const highlightComponent = useCallback((id: string, opts?: HighlightOptions) => {
    canvasRef.current?.highlightComponent(id, opts);
  }, [canvasRef]);

  const centerOnComponent = useCallback((id: string) => {
    canvasRef.current?.centerOnComponent(id);
  }, [canvasRef]);

  const zoomTo = useCallback((level: number) => {
    canvasRef.current?.setZoom(level);
  }, [canvasRef]);

  const resetView = useCallback(() => {
    canvasRef.current?.resetView();
  }, [canvasRef]);

  const openInventory = useCallback(() => setInventoryOpen(true), [setInventoryOpen]);
  const closeInventory = useCallback(() => setInventoryOpen(false), [setInventoryOpen]);
  const openSettings = useCallback(() => setSettingsOpen(true), [setSettingsOpen]);
  const closeSettings = useCallback(() => setSettingsOpen(false), [setSettingsOpen]);

  const openComponentEditor = useCallback((componentId: string) => {
    const component = inventory.find((c) => c.id === componentId);
    if (component) setSelectedComponent(component);
  }, [inventory, setSelectedComponent]);

  const switchGenerationMode = useCallback((mode: 'chat' | 'image' | 'video') => {
    setGenerationMode(mode);
  }, [setGenerationMode]);

  return useMemo(() => ({
    execute,
    pendingActions,
    confirmAction,
    rejectAction,
    clearPendingActions,
    stagedActions,
    acceptStagedAction,
    rejectStagedAction,
    clearStagedActions,
    stageActions,
    canUndo,
    undo,
    actionHistory,
    highlightComponent,
    centerOnComponent,
    zoomTo,
    resetView,
    openInventory,
    closeInventory,
    openSettings,
    closeSettings,
    openComponentEditor,
    switchGenerationMode,
    autonomySettings,
    updateAutonomySettings,
  }), [
    execute,
    pendingActions,
    confirmAction,
    rejectAction,
    clearPendingActions,
    stagedActions,
    acceptStagedAction,
    rejectStagedAction,
    clearStagedActions,
    stageActions,
    canUndo,
    undo,
    actionHistory,
    highlightComponent,
    centerOnComponent,
    zoomTo,
    resetView,
    openInventory,
    closeInventory,
    openSettings,
    closeSettings,
    openComponentEditor,
    switchGenerationMode,
    autonomySettings,
    updateAutonomySettings,
  ]);
}

// Re-export for backwards compatibility
export { saveAutonomySettings } from './useAutonomySettings';