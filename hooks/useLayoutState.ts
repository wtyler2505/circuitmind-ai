/**
 * useLayoutState - Manages local UI state and component interaction handlers for MainLayout.
 *
 * Extracts local state management from MainLayout to reduce component complexity.
 * Encapsulates panel visibility, component selection, context menus, keyboard shortcuts,
 * 3D generation coordination, and modal state.
 *
 * Accepts context-provided values as params and returns state variables + handlers
 * that MainLayout needs for rendering and event wiring.
 */

import { useState, useCallback, useEffect } from 'react';
import type { RefObject } from 'react';
import type { DiagramCanvasRef } from '../components/DiagramCanvas';
import type { AssistantTabType } from '../components/layout/assistant/AssistantTabs';
import type { IndexedDocument } from '../services/search/searchIndexer';
import { explainComponent, generateComponent3DCode } from '../services/gemini/features/components';
import type { ElectronicComponent, AIContext, WiringDiagram } from '../types';

// ============================================
// Types
// ============================================

export interface ContextMenuState {
  x: number;
  y: number;
  componentId: string;
}

/** Minimal toast API subset used by this hook */
interface ToastApi {
  info: (message: string, duration?: number, action?: unknown, id?: string) => void;
  success: (message: string, duration?: number, action?: unknown, id?: string) => void;
  error: (message: string, duration?: number, action?: unknown, id?: string) => void;
}

export interface UseLayoutStateParams {
  /** Ref to the diagram canvas for highlight/center operations */
  canvasRef: RefObject<DiagramCanvasRef | null>;

  /** Current diagram state */
  diagram: WiringDiagram | null;
  /** Update the diagram (accepts concrete diagram or updater function) */
  updateDiagram: (
    d: WiringDiagram | null | ((current: WiringDiagram | null) => WiringDiagram | null)
  ) => void;

  /** Current inventory items */
  inventory: ElectronicComponent[];
  /** Replace entire inventory array (used for modal save) */
  setInventory: (items: ElectronicComponent[]) => void;
  /** Update a single inventory item */
  updateItem: (item: ElectronicComponent) => void;

  /** Set the selected component ID on the canvas (from SelectionContext) */
  setCanvasSelectionId: (id: string | null) => void;

  /** HUD visibility state (from HUDContext) */
  hudIsVisible: boolean;
  setHudVisible: (visible: boolean) => void;

  /** Focus mode state (from LayoutContext) */
  isFocusMode: boolean;
  setFocusMode: (focus: boolean) => void;

  /** Toast notification API */
  toast: ToastApi;
}

// ============================================
// Hook
// ============================================

export function useLayoutState(params: UseLayoutStateParams) {
  const {
    canvasRef,
    diagram,
    updateDiagram,
    inventory,
    setInventory,
    updateItem,
    setCanvasSelectionId,
    hudIsVisible,
    setHudVisible,
    isFocusMode,
    setFocusMode,
    toast,
  } = params;

  // ── State ──────────────────────────────────────────────────────────

  const [assistantTab, setAssistantTab] = useState<AssistantTabType>('chat');
  const [proactiveSuggestions] = useState<string[]>([]);

  // Loading / progress
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Component editor modal
  const [selectedComponent, setSelectedComponent] = useState<ElectronicComponent | null>(null);
  const [modalContent, setModalContent] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);

  // AI context (built from diagram + viewport)
  const [aiContext, setAIContext] = useState<AIContext | null>(null);

  // Right-click context menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Overlay / panel toggles
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ── Keyboard Shortcuts ─────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      )
        return;

      if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }

      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setHudVisible(!hudIsVisible);
        toast.info(!hudIsVisible ? 'HUD ENABLED' : 'HUD DISABLED');
      }

      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setFocusMode(!isFocusMode);
        toast.info(!isFocusMode ? 'FOCUS MODE ON' : 'FOCUS MODE OFF');
      }

      if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsDashboardVisible(!isDashboardVisible);
        toast.info(!isDashboardVisible ? 'DASHBOARD VIEW' : 'CANVAS VIEW');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hudIsVisible,
    setHudVisible,
    isFocusMode,
    setFocusMode,
    isDashboardVisible,
    setIsDashboardVisible,
    isSearchOpen,
    setIsSearchOpen,
    toast,
  ]);

  // ── Component Interaction Handlers ─────────────────────────────────

  const handleOpenComponentInfo = useCallback(async (component: ElectronicComponent) => {
    setSelectedComponent(component);
    const explain = await explainComponent(component.name);
    setModalContent(explain);
    setContextMenu(null);
  }, []);

  const handleComponentSelect = useCallback(
    (componentId: string) => {
      setCanvasSelectionId(componentId);
      setContextMenu(null);
    },
    [setCanvasSelectionId]
  );

  const handleComponentContextMenu = useCallback(
    (componentId: string, x: number, y: number) => {
      setCanvasSelectionId(componentId);
      setContextMenu({ x, y, componentId });
    },
    [setCanvasSelectionId]
  );

  const handleCanvasBackgroundClick = useCallback(() => {
    setCanvasSelectionId(null);
    setContextMenu(null);
  }, [setCanvasSelectionId]);

  const handleSearchSelect = useCallback(
    (doc: IndexedDocument) => {
      setIsSearchOpen(false);
      if (doc.category === 'component' || doc.category === 'diagram') {
        const id = doc.category === 'component'
          ? (doc.reference as { id: string }).id
          : (doc.reference as string);
        canvasRef.current?.highlightComponent(id, {
          color: '#00f3ff',
          duration: 3000,
          pulse: true,
        });
        canvasRef.current?.centerOnComponent(id, 1.2);
        setCanvasSelectionId(id);
      }
    },
    [setCanvasSelectionId, canvasRef]
  );

  const handleChatComponentClick = useCallback(
    (componentId: string) => {
      canvasRef.current?.highlightComponent(componentId, {
        color: '#00f3ff',
        duration: 3000,
        pulse: true,
      });
      canvasRef.current?.centerOnComponent(componentId, 1.2);
      setCanvasSelectionId(componentId);
    },
    [setCanvasSelectionId, canvasRef]
  );

  const handleComponentDoubleClick = useCallback(
    (component: ElectronicComponent) => {
      handleOpenComponentInfo(component);
    },
    [handleOpenComponentInfo]
  );

  const handleComponentDrop = useCallback(
    (component: ElectronicComponent, x: number, y: number) => {
      if (!diagram) return;
      const newComponent = { ...component, id: `comp-${Date.now()}`, position: { x, y } };
      updateDiagram({
        ...diagram,
        components: [...diagram.components, newComponent],
      });
    },
    [diagram, updateDiagram]
  );

  // ── 3D Generation ─────────────────────────────────────────────────

  const handleGenerate3D = useCallback(
    async (
      name?: string,
      type?: string,
      prompt?: string,
      imageUrl?: string,
      precision?: 'draft' | 'masterpiece'
    ) => {
      if (!selectedComponent && !name) return;

      const targetName = name || selectedComponent?.name || '';
      const targetType = type || selectedComponent?.type || 'other';
      const targetImage = imageUrl || selectedComponent?.imageUrl;
      const targetPrecision = precision || selectedComponent?.precisionLevel || 'draft';
      const isRegenerate = Boolean(selectedComponent?.threeCode);

      setIsGenerating3D(true);
      toast.info(isRegenerate ? 'Regenerating 3D Geometry...' : 'Synthesizing 3D Geometry...');

      try {
        const code = await generateComponent3DCode(
          targetName,
          targetType,
          prompt,
          true, // Always bypass cache when explicitly requested from button
          targetImage,
          targetPrecision
        );

        const updated = {
          ...(selectedComponent || {}),
          name: targetName,
          type: targetType as ElectronicComponent['type'],
          threeCode: code,
          precisionLevel: targetPrecision,
        } as ElectronicComponent;

        // Update local state for immediate modal feedback
        setSelectedComponent(updated);

        // Sync to global inventory using context helper
        updateItem(updated);

        // If part of diagram, update diagram too
        if (diagram?.components.some((c) => c.id === updated.id)) {
          updateDiagram({
            ...diagram,
            components: diagram.components.map((c) => (c.id === updated.id ? updated : c)),
          });
        }

        toast.success(isRegenerate ? '3D Geometry Refined' : '3D Geometry Synthesized');
      } catch (error) {
        console.error('3D Generation Error:', error);
        toast.error(
          `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsGenerating3D(false);
      }
    },
    [selectedComponent, diagram, updateDiagram, updateItem, toast]
  );

  // ── Modal Handlers ─────────────────────────────────────────────────

  const handleComponentSave = useCallback(
    (updated: ElectronicComponent) => {
      setInventory(inventory.map((i) => (i.id === updated.id ? updated : i)));
      setSelectedComponent(null);
    },
    [inventory, setInventory]
  );

  const handleCloseComponentEditor = useCallback(() => {
    setSelectedComponent(null);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // ── Context Menu Action Handlers ───────────────────────────────────

  const handleContextMenuDuplicate = useCallback(() => {
    if (!contextMenu || !diagram) return;
    const comp = diagram.components.find((c) => c.id === contextMenu.componentId);
    if (comp) {
      const newComp = {
        ...comp,
        id: `${comp.sourceInventoryId || 'comp'}-${Date.now()}`,
        name: `${comp.name} (Copy)`,
      };
      updateDiagram({
        ...diagram,
        components: [...diagram.components, newComp],
      });
      setContextMenu(null);
    }
  }, [contextMenu, diagram, updateDiagram]);

  const handleContextMenuDelete = useCallback(() => {
    if (!contextMenu || !diagram) return;
    const newDiagram = {
      ...diagram,
      components: diagram.components.filter((c) => c.id !== contextMenu.componentId),
      connections: diagram.connections.filter(
        (c) =>
          c.fromComponentId !== contextMenu.componentId &&
          c.toComponentId !== contextMenu.componentId
      ),
    };
    updateDiagram(newDiagram);
    setContextMenu(null);
  }, [contextMenu, diagram, updateDiagram]);

  // ── Return ─────────────────────────────────────────────────────────

  return {
    // Tab state
    assistantTab,
    setAssistantTab,
    proactiveSuggestions,

    // Loading state (setters exposed for use in handleSendEnhancedMessage)
    isLoading,
    setIsLoading,
    loadingText,
    setLoadingText,

    // Component editor modal
    selectedComponent,
    setSelectedComponent,
    modalContent,
    isGenerating3D,

    // AI context
    aiContext,
    setAIContext,

    // Context menu
    contextMenu,
    setContextMenu,

    // Overlay visibility
    isDashboardVisible,
    setIsDashboardVisible,
    isSearchOpen,
    setIsSearchOpen,

    // Component interaction handlers
    handleOpenComponentInfo,
    handleComponentSelect,
    handleComponentContextMenu,
    handleCanvasBackgroundClick,
    handleSearchSelect,
    handleChatComponentClick,
    handleComponentDoubleClick,
    handleComponentDrop,
    handleGenerate3D,
    handleComponentSave,
    handleCloseComponentEditor,
    handleCloseSearch,

    // Context menu action handlers
    handleContextMenuDuplicate,
    handleContextMenuDelete,
  };
}
