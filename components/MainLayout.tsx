import React, { useState, useRef, useCallback, lazy, Suspense, useEffect, memo } from 'react';
import { AppLayout } from './layout/AppLayout';
import { AppHeader } from './layout/AppHeader';
import { StatusRail } from './layout/StatusRail';
import Inventory from './Inventory';
import AssistantSidebar from './AssistantSidebar';
import DiagramCanvas, { DiagramCanvasRef } from './DiagramCanvas';
import { NeuralCursor } from './diagram/NeuralCursor';
import { TacticalHUD } from './diagram/TacticalHUD';
import { SimControls } from './layout/SimControls';
import { MentorOverlay } from './layout/MentorOverlay';
import { DashboardView } from './dashboard/DashboardView';
import { Gatekeeper } from './auth/Gatekeeper';
import { CyberToast } from './layout/CyberToast';
import { OmniSearch } from './layout/OmniSearch';
import { ContextMenuOverlay } from './layout/ContextMenuOverlay';
import { AssistantContent } from './layout/assistant/AssistantContent';

// Lazy Components
const ComponentEditorModal = lazy(() => import('./ComponentEditorModal'));
const SettingsPanel = lazy(() => import('./SettingsPanel'));
const InventoryMgmtView = lazy(() => import('./inventory-mgmt/InventoryMgmtView'));

// Contexts
import { useVoiceAssistant } from '../contexts/VoiceAssistantContext';
import { useLayout } from '../contexts/LayoutContext';
import { useAssistantState } from '../contexts/AssistantStateContext';
import { useConversationContext } from '../contexts/ConversationContext';
import { useHUD } from '../contexts/HUDContext';
import { useSelection } from '../contexts/SelectionContext';

// Hooks
import { useAIActions } from '../hooks/useAIActions';
import { useToastApi } from '../hooks/useToast';
import { useNeuralLink } from '../hooks/useNeuralLink';
import { useNeuralLinkEffects } from '../hooks/useNeuralLinkEffects';
import { useGestureTracking } from '../hooks/useGestureTracking';
import { useSecurityAudit } from '../hooks/useSecurityAudit';
import { useSearchIndex } from '../hooks/useSearchIndex';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useChatHandler } from '../hooks/useChatHandler';
import { useAIContextBuilder } from '../hooks/useAIContextBuilder';
import { useMainLayoutActions } from '../hooks/useMainLayoutActions';
import useInventorySync from '../hooks/useInventorySync';
import { useSync } from '../hooks/useSync';

// UI Components
import type { AssistantTabType } from './layout/assistant/AssistantTabs';

const MainLayoutComponent: React.FC = () => {
  // Layout Context
  const {
    isAssistantOpen,
    setAssistantOpen,
    assistantPinned,
    setAssistantPinned,
    isFocusMode,
    setFocusMode,
    settingsInitialTab,
    isSettingsOpen,
    setSettingsOpen,
    neuralLinkEnabled,
    activeView,
    setActiveView,
  } = useLayout();

  const toast = useToastApi();
  const [assistantTab, setAssistantTab] = useState<AssistantTabType>('chat');
  const [proactiveSuggestions] = useState<string[]>([]);

  // Canvas Ref
  const canvasRef = useRef<DiagramCanvasRef>(null);

  // Voice Assistant
  const {
    isRecording,
    startRecording,
    stopRecording,
    loadingText: audioLoadingText,
    isProcessingAudio,
    registerVisualContextProvider,
    unregisterVisualContextProvider,
    lastTranscription,
    clearTranscription,
  } = useVoiceAssistant();

  const setCanvasRef = useCallback(
    (node: DiagramCanvasRef | null) => {
      (canvasRef as React.MutableRefObject<DiagramCanvasRef | null>).current = node;
      if (node) {
        registerVisualContextProvider('canvas', node.getSnapshotBlob);
      } else {
        unregisterVisualContextProvider('canvas');
      }
    },
    [registerVisualContextProvider, unregisterVisualContextProvider]
  );

  // Extracted actions hook (callbacks, component state, context menu)
  const actions = useMainLayoutActions({ canvasRef });

  // AI Actions
  const aiActions = useAIActions({
    canvasRef,
    setSelectedComponent: actions.setSelectedComponent,
  });

  // Neural Link
  const {
    isActive: isNeuralLinkActive,
    isInitializing: isNeuralLinkLoading,
    startTracking: startNeuralLink,
    stopTracking: stopNeuralLink,
    result: gestureResult,
    getSnapshotBlob: getCameraSnapshot,
    isEngaged: isHandEngaged,
    error: neuralLinkError,
  } = useNeuralLink();

  useNeuralLinkEffects({
    neuralLinkEnabled,
    startNeuralLink,
    stopNeuralLink,
    isNeuralLinkActive,
    isNeuralLinkLoading,
    neuralLinkError,
    getCameraSnapshot,
    registerVisualContextProvider,
    unregisterVisualContextProvider,
    toast,
  });

  useGestureTracking({
    isNeuralLinkActive,
    gestureResult,
    isHandEngaged,
    assistantTab,
    setAssistantTab,
    canvasRef,
    toast,
  });

  // Assistant State
  const {
    generationMode,
    setGenerationMode,
    imageSize,
    setImageSize,
    aspectRatio,
    setAspectRatio,
    useDeepThinking,
    setUseDeepThinking,
    recentHistory,
  } = useAssistantState();

  const { selectedComponentId: canvasSelectionId, activeSelectionPath } = useSelection();
  const conversationManager = useConversationContext();
  const { isVisible: hudIsVisible, setVisible: setHudVisible, addFragment, removeFragment } = useHUD();

  // Side-effect hooks
  useSecurityAudit({ diagram: actions.diagram, addFragment, removeFragment });
  useSearchIndex({ inventory: actions.inventory, diagram: actions.diagram });
  useInventorySync(actions.inventory, actions.diagram, actions.updateDiagram, { autoSync: true });
  useSync();

  // Local UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const isDashboardVisible = activeView === 'dashboard';
  const setIsDashboardVisible = useCallback((visible: boolean) => {
    setActiveView(visible ? 'dashboard' : 'canvas');
  }, [setActiveView]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useKeyboardShortcuts({
    hudIsVisible,
    setHudVisible,
    isFocusMode,
    setFocusMode,
    isDashboardVisible,
    setIsDashboardVisible,
    isSearchOpen,
    setIsSearchOpen,
    toast,
  });

  const aiContext = useAIContextBuilder({
    diagram: actions.diagram,
    inventory: actions.inventory,
    canvasSelectionId,
    selectedComponent: actions.selectedComponent,
    isSettingsOpen,
    recentHistory,
    activeSelectionPath,
    canvasRef,
    isLoading,
    aiActions,
  });

  const handleSendEnhancedMessage = useChatHandler({
    isLoading,
    setIsLoading,
    setLoadingText,
    generationMode,
    imageSize,
    aspectRatio,
    inventory: actions.inventory,
    aiContext,
    aiActions,
    useDeepThinking,
    conversationManager,
    updateDiagram: actions.updateDiagram,
  });

  // Handle Voice Transcription
  useEffect(() => {
    if (lastTranscription) {
      handleSendEnhancedMessage(lastTranscription);
      clearTranscription();
    }
  }, [lastTranscription, handleSendEnhancedMessage, clearTranscription]);

  // Search select wrapper (also closes search)
  const handleSearchSelect = useCallback(
    (doc: Parameters<typeof actions.handleSearchSelect>[0]) => {
      setIsSearchOpen(false);
      actions.handleSearchSelect(doc);
    },
    [actions.handleSearchSelect]
  );

  // Pin toggle
  const handleTogglePin = useCallback(() => {
    setAssistantPinned(!assistantPinned);
    if (!isAssistantOpen) setAssistantOpen(true);
  }, [assistantPinned, isAssistantOpen, setAssistantPinned, setAssistantOpen]);

  // Close assistant
  const handleCloseAssistant = useCallback(() => {
    setAssistantPinned(false);
    setAssistantOpen(false);
  }, [setAssistantPinned, setAssistantOpen]);

  return (
    <AppLayout
      inventory={<Inventory onSelect={actions.handleOpenComponentInfo} />}
      assistant={
        <AssistantSidebar>
          <AssistantContent
            assistantTab={assistantTab}
            onTabChange={setAssistantTab}
            conversationManager={conversationManager}
            onSendMessage={handleSendEnhancedMessage}
            isLoading={isLoading || isProcessingAudio}
            loadingText={loadingText || audioLoadingText}
            onComponentClick={actions.handleChatComponentClick}
            onActionClick={(action) => aiActions.execute(action)}
            context={aiContext}
            proactiveSuggestions={proactiveSuggestions}
            generationMode={generationMode}
            onModeChange={setGenerationMode}
            useDeepThinking={useDeepThinking}
            onDeepThinkingChange={setUseDeepThinking}
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            imageSize={imageSize}
            onImageSizeChange={setImageSize}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            isExpanded={isAssistantOpen}
            onToggleExpand={() => setAssistantOpen(!isAssistantOpen)}
            isPinned={assistantPinned}
            onTogglePin={handleTogglePin}
            onClose={handleCloseAssistant}
          />
        </AssistantSidebar>
      }
      header={<AppHeader />}
      statusRail={<StatusRail />}
      modals={
        <>
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30">
            <SimControls />
          </div>
          {actions.selectedComponent && (
            <Suspense
              fallback={
                <div className="fixed inset-0 bg-black/50 z-50 text-neon-cyan">Loading...</div>
              }
            >
              <ComponentEditorModal
                component={actions.selectedComponent}
                onClose={() => actions.setSelectedComponent(null)}
                onSave={(updated) => {
                  actions.setInventory(actions.inventory.map((i) => (i.id === updated.id ? updated : i)));
                  actions.setSelectedComponent(null);
                }}
                explanation={actions.modalContent}
                isGenerating3D={actions.isGenerating3D}
                onGenerate3D={actions.handleGenerate3D}
              />
            </Suspense>
          )}
          <Suspense fallback={null}>
            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={() => setSettingsOpen(false)}
              autonomySettings={aiActions.autonomySettings}
              onAutonomySettingsChange={aiActions.updateAutonomySettings}
              initialTab={settingsInitialTab}
            />
          </Suspense>
        </>
      }
    >
      <TacticalHUD />
      <MentorOverlay />
      {activeView === 'inventory-mgmt' ? (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400">Loading Inventory Management...</div>}>
          <InventoryMgmtView onClose={() => setActiveView('canvas')} />
        </Suspense>
      ) : isDashboardVisible ? (
        <DashboardView />
      ) : (
        <>
          <DiagramCanvas
            ref={setCanvasRef}
            diagram={actions.diagram}
            selectedComponentId={canvasSelectionId}
            stagedActions={aiActions.stagedActions}
            onStagedActionAccept={aiActions.acceptStagedAction}
            onStagedActionReject={aiActions.rejectStagedAction}
            onComponentSelect={actions.handleComponentSelect}
            onComponentContextMenu={actions.handleComponentContextMenu}
            onComponentDoubleClick={actions.handleComponentDoubleClick}
            onDiagramUpdate={actions.updateDiagram}
            onComponentDrop={actions.handleComponentDrop}
            onBackgroundClick={actions.handleCanvasBackgroundClick}
            onGenerate3D={async (comp) => {
              actions.handleComponentDoubleClick(comp);
              await actions.handleGenerate3D(comp.name, comp.type);
            }}
          />
          {isNeuralLinkActive && (
            <NeuralCursor
              landmarks={gestureResult?.landmarks[0] || null}
              isEngaged={isHandEngaged || false}
              containerRect={canvasRef.current?.getContainerRect() || null}
            />
          )}
        </>
      )}
      {actions.contextMenu && (
        <ContextMenuOverlay
          contextMenu={actions.contextMenu}
          diagram={actions.diagram}
          onEdit={actions.handleOpenComponentInfo}
          onDuplicate={actions.handleContextMenuDuplicate}
          onGenerate3D={actions.handleOpenComponentInfo}
          onDelete={actions.handleContextMenuDelete}
          onClose={() => actions.setContextMenu(null)}
        />
      )}
      <Gatekeeper />
      <CyberToast />
      <OmniSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleSearchSelect}
      />
    </AppLayout>
  );
};

export const MainLayout = memo(MainLayoutComponent);
