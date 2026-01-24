import React, { useState, useRef, useCallback, lazy, Suspense, useEffect } from 'react';
import { AppLayout } from './layout/AppLayout';
import { AppHeader } from './layout/AppHeader';
import { StatusRail } from './layout/StatusRail';
import Inventory from './Inventory';
import AssistantSidebar from './AssistantSidebar';
import ChatPanel from './ChatPanel';
import DiagramCanvas, { DiagramCanvasRef } from './DiagramCanvas';
import { TacticalHUD } from './diagram/TacticalHUD';
import { SimControls } from './layout/SimControls';
import { HardwareTerminal } from './layout/HardwareTerminal';
import { MentorOverlay } from './layout/MentorOverlay';
import { BootcampPanel } from './layout/BootcampPanel';
import { ProjectTimeline } from './layout/ProjectTimeline';
import { DebugWorkbench } from './layout/DebugWorkbench';
import { AnalyticsDashboard } from './layout/AnalyticsDashboard';
import { DashboardView } from './dashboard/DashboardView';
import { Gatekeeper } from './auth/Gatekeeper';
import { CyberToast } from './layout/CyberToast';
import { OmniSearch } from './layout/OmniSearch';
import ErrorBoundary from './ErrorBoundary';

// Lazy Components
const ComponentEditorModal = lazy(() => import('./ComponentEditorModal'));
const SettingsPanel = lazy(() => import('./SettingsPanel'));

// Contexts
import { useInventory } from '../contexts/InventoryContext';
import { useDiagram } from '../contexts/DiagramContext';
import { useVoiceAssistant } from '../contexts/VoiceAssistantContext';
import { useLayout } from '../contexts/LayoutContext';
import { useAssistantState } from '../contexts/AssistantStateContext';
import { useConversationContext } from '../contexts/ConversationContext';
import { useHUD } from '../contexts/HUDContext';

// Hooks & Services
import { useAIActions } from '../hooks/useAIActions';
import { useToast } from '../hooks/useToast';
import { useInventorySync } from '../hooks/useInventorySync';
import { useSync } from '../hooks/useSync';
import { buildAIContext } from '../services/aiContextBuilder';
import { securityAuditor } from '../services/securityAuditor';
import { searchIndexer, IndexedDocument } from '../services/search/searchIndexer';
import {
  explainComponent,
  generateComponent3DCode,
  generateWiringDiagram,
  generateEditedImage,
  generateConceptImage,
  generateCircuitVideo,
  chatWithContext,
  chatWithAI,
  generateProactiveSuggestions,
} from '../services/geminiService';
import { ElectronicComponent, EnhancedChatMessage, AIContext, ACTION_SAFETY } from '../types';

export const MainLayout: React.FC = () => {
  // Contexts
  const { inventory, setInventory } = useInventory(); // Needed for sync/generation
  const { diagram, updateDiagram } = useDiagram();
  const { 
    isRecording, startRecording, stopRecording, 
    loadingText: audioLoadingText, isProcessingAudio,
    registerVisualContextProvider, lastTranscription, clearTranscription
  } = useVoiceAssistant();
  const { isSettingsOpen, setSettingsOpen, assistantPinned, isAssistantOpen, setAssistantPinned, setAssistantOpen } = useLayout();
  const { 
    generationMode, setGenerationMode, 
    imageSize, setImageSize, 
    aspectRatio, setAspectRatio, 
    useDeepThinking, setUseDeepThinking,
    recentHistory, activeSelectionPath 
  } = useAssistantState();
  const conversationManager = useConversationContext();
  const { isVisible: isHUDVisible, setVisible: setHUDVisible, addFragment, clearHUD } = useHUD();
  const { isFocusMode, setFocusMode } = useLayout();

  const toast = useToast();

  // Real-time Security Audit loop
  useEffect(() => {
    if (!diagram) return;
    
    const violations = securityAuditor.auditCircuitSafety(diagram);
    const criticals = violations.filter(v => v.severity === 'high' || v.severity === 'critical');
    
    if (criticals.length > 0) {
      criticals.forEach(v => {
        addFragment({
          targetId: v.location,
          type: 'warning',
          content: `SAFETY RISK: ${v.message}`,
          position: { x: 50, y: 50 }, // Fixed for global warnings or dynamic if location matches component
          priority: 1
        });
      });
    } else {
      // Clear safety warnings if resolved (HUD decay handles this mostly but we can be explicit)
    }
  }, [diagram, addFragment]);

  // Global Search Indexing loop
  useEffect(() => {
    const docs: IndexedDocument[] = [];

    // 1. Index Inventory
    inventory.forEach(c => {
      docs.push({
        id: `inv-${c.id}`,
        category: 'component',
        title: c.name,
        body: c.description,
        tags: [c.type, ...(c.pins || [])],
        reference: c
      });
    });

    // 2. Index Diagram
    if (diagram) {
      diagram.components.forEach(c => {
        docs.push({
          id: `diag-comp-${c.id}`,
          category: 'diagram',
          title: `Project: ${c.name}`,
          body: `Part of ${diagram.title}. Pins: ${c.pins?.join(', ')}`,
          reference: c.id
        });
      });
    }

    searchIndexer.index(docs);
  }, [inventory, diagram]);

  // Local State (Controllers)
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<ElectronicComponent | null>(null); // For Modal
  const [canvasSelectionId, setCanvasSelectionId] = useState<string | null>(null); // For Canvas Visual Selection
  const [modalContent, setModalContent] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [aiContext, setAIContext] = useState<AIContext | null>(null);
  const [proactiveSuggestions, setProactiveSuggestions] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; componentId: string } | null>(null);
  const [assistantTab, setAssistantTab] = useState<'chat' | 'bootcamp' | 'history' | 'diagnostic' | 'analytics'>('chat');
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Canvas Ref
  const canvasRef = useRef<DiagramCanvasRef>(null);
  const setCanvasRef = useCallback((node: DiagramCanvasRef | null) => {
    // Update ref
    (canvasRef as React.MutableRefObject<DiagramCanvasRef | null>).current = node;
    // Register with Voice Assistant
    if (node) {
      registerVisualContextProvider(node.getSnapshotBlob);
    }
  }, [registerVisualContextProvider]);

  // AI Actions Hook
  const aiActions = useAIActions({
    canvasRef,
    setSelectedComponent, // Still controls modal for AI actions
  });

  // Sync Inventory <-> Diagram
  useInventorySync(inventory, diagram, updateDiagram, {
    autoSync: true,
    devLogging: process.env.NODE_ENV === 'development',
  });

  // Git-based Auto-snapshot
  useSync();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) return;
      
      if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }

      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setHUDVisible(!isHUDVisible);
        toast.show(isHUDVisible ? 'HUD DISABLED' : 'HUD ENABLED', 'info');
      }

      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setFocusMode(!isFocusMode);
        toast.show(isFocusMode ? 'FOCUS MODE OFF' : 'FOCUS MODE ON', 'info');
      }

      if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsDashboardVisible(!isDashboardVisible);
        toast.show(isDashboardVisible ? 'CANVAS VIEW' : 'DASHBOARD VIEW', 'info');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHUDVisible, setHUDVisible, toast]);

  // Main Chat Handler
  const handleSendEnhancedMessage = useCallback(async (
    content: string,
    attachment?: { base64: string; type: 'image' | 'video' | 'document'; name?: string }
  ) => {
    if ((!content.trim() && !attachment) || isLoading) return;

    const attachmentData = attachment?.base64;

    const userEnhancedMsg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'> = {
      role: 'user',
      content,
      linkedComponents: [],
      suggestedActions: [],
      image: attachment?.type === 'image' ? attachmentData : undefined,
      video: attachment?.type === 'video' ? attachmentData : undefined,
    };

    const sentUserMessage = await conversationManager.addMessage(userEnhancedMsg);

    setIsLoading(true);
    setLoadingText('Thinking...');

    try {
      // Reconstruct history
      const conversationMessages = conversationManager.messages.filter(
        (msg) => msg.conversationId === sentUserMessage.conversationId
      );
      const chatHistory = conversationMessages
        .filter((msg) => msg.role === 'user' || msg.role === 'model')
        .map((msg) => ({
          role: msg.role as 'user' | 'model',
          parts: [{ text: msg.content }],
        }));

      if (generationMode === 'image') {
        setLoadingText('Generating Image...');
        let imgData = '';
        if (attachment?.type === 'image' && attachmentData) {
          imgData = await generateEditedImage(attachmentData, content);
        } else {
          imgData = await generateConceptImage(content, imageSize, aspectRatio);
        }
        await conversationManager.addMessage({
          role: 'model',
          content: `Generated image for "${content}"`,
          linkedComponents: [],
          suggestedActions: [],
          image: imgData,
        });
      } else if (generationMode === 'video') {
        setLoadingText('Generating Video...');
        const videoAspect = aspectRatio === '9:16' ? '9:16' : '16:9';
        const videoUrl = await generateCircuitVideo(content, videoAspect, attachmentData);
        await conversationManager.addMessage({
          role: 'model',
          content: `Video generated for "${content}"`,
          linkedComponents: [],
          suggestedActions: [],
          video: videoUrl,
        });
      } else {
        // Chat Mode
        const isDiagramRequest = content.toLowerCase().includes('diagram') || content.toLowerCase().includes('circuit');

        if (isDiagramRequest) {
          setLoadingText('Designing Circuit...');
          const newDiagram = await generateWiringDiagram(content, inventory);
          updateDiagram(newDiagram);
          await conversationManager.addMessage({
            role: 'model',
            content: `Here is the wiring diagram for: ${newDiagram.title}.`,
            linkedComponents: newDiagram.components.map((c) => ({
              componentId: c.id,
              componentName: c.name,
              mentionStart: 0,
              mentionEnd: 0,
            })),
            suggestedActions: [
              { type: 'highlight', payload: {}, label: 'Highlight all', safe: true },
              { type: 'zoomTo', payload: { level: 1 }, label: 'Fit view', safe: true },
            ],
            diagramData: newDiagram,
          });
        } else if (aiContext) {
          setLoadingText('Analyzing...');
          const response = await chatWithContext(content, chatHistory, aiContext, {
            enableProactive: true,
            attachmentBase64: attachmentData,
            attachmentType: attachment?.type,
          });

          await conversationManager.addMessage({
            role: 'model',
            content: response.text,
            linkedComponents: response.componentMentions,
            suggestedActions: response.suggestedActions,
            groundingSources: response.groundingSources,
            metricId: response.metricId,
          });

          // Autonomy
          if (aiActions.autonomySettings.autoExecuteSafeActions) {
            for (const action of response.suggestedActions) {
              const isSafe = aiActions.autonomySettings.customSafeActions.includes(action.type)
                ? true
                : aiActions.autonomySettings.customUnsafeActions.includes(action.type)
                  ? false
                  : (ACTION_SAFETY[action.type] ?? false);

              if (isSafe) await aiActions.execute(action);
            }
          }
        } else {
          setLoadingText('Analyzing...');
          const { text, groundingSources } = await chatWithAI(
            content,
            chatHistory,
            attachmentData,
            attachment?.type === 'video' ? 'video' : 'image',
            useDeepThinking
          );
          await conversationManager.addMessage({
            role: 'model',
            content: text,
            linkedComponents: [],
            suggestedActions: [],
            groundingSources,
          });
        }
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await conversationManager.addMessage({
        role: 'system',
        content: `Error: ${errorMessage}`,
        linkedComponents: [],
        suggestedActions: [],
      });
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  }, [
    isLoading, generationMode, imageSize, aspectRatio, inventory, 
    aiContext, aiActions, useDeepThinking, conversationManager, updateDiagram, toast
  ]);

  // Handle Voice Transcription
  useEffect(() => {
    if (lastTranscription) {
      handleSendEnhancedMessage(lastTranscription);
      clearTranscription();
    }
  }, [lastTranscription, handleSendEnhancedMessage]);

  // AI Context Builder
  useEffect(() => {
    const updateContext = async () => {
      const zoom = canvasRef.current?.getZoom() || 1;
      const pan = canvasRef.current?.getPan() || { x: 0, y: 0 };

      const context = await buildAIContext({
        diagram,
        inventory,
        selectedComponentId: canvasSelectionId, // Use canvas selection for context
        activeView: selectedComponent
          ? 'component-editor'
          : isSettingsOpen
            ? 'settings'
            : 'canvas',
        viewport: { zoom, x: pan.x, y: pan.y },
        recentHistory,
        activeSelectionPath
      });
      setAIContext(context);
    };
    updateContext();
  }, [diagram, inventory, canvasSelectionId, selectedComponent, isSettingsOpen, recentHistory, activeSelectionPath]);

  // Proactive Prediction Loop
  useEffect(() => {
    const runPredictions = async () => {
      if (!aiContext || isLoading) return;
      
      // Heuristic: Only predict if we have components but few wires
      if (aiContext.componentCount > 0) {
        const predictions = await predictionEngine.predict(aiContext);
        aiActions.stageActions(predictions);
      }
    };

    const timer = setTimeout(runPredictions, 1500); // 1s debounce for stability
    return () => clearTimeout(timer);
  }, [aiContext, aiActions.stageActions, isLoading]);

  // ... (Proactive Suggestions logic remains)

  // Component Actions
  const handleOpenComponentInfo = useCallback(async (component: ElectronicComponent) => {
    setSelectedComponent(component);
    const explain = await explainComponent(component.name);
    setModalContent(explain);
    setContextMenu(null); // Close context menu if open
  }, []);

  const handleComponentSelect = useCallback((componentId: string) => {
    setCanvasSelectionId(componentId);
    setContextMenu(null); // Close context menu on select
  }, []);

  const handleComponentContextMenu = useCallback((componentId: string, x: number, y: number) => {
    setCanvasSelectionId(componentId); // Select on right click too
    setContextMenu({ x, y, componentId });
  }, []);

  const handleCanvasBackgroundClick = useCallback(() => {
    setCanvasSelectionId(null);
    setContextMenu(null);
  }, []);

  const handleSearchSelect = useCallback((doc: IndexedDocument) => {
    setIsSearchOpen(false);
    if (doc.category === 'component' || doc.category === 'diagram') {
      const id = doc.category === 'component' ? doc.reference.id : doc.reference;
      canvasRef.current?.highlightComponent(id, { color: '#00f3ff', duration: 3000, pulse: true });
      canvasRef.current?.centerOnComponent(id, 1.2);
      setCanvasSelectionId(id);
    }
  }, []);

  const handleGenerate3D = useCallback(async (customPrompt?: string) => {
    // ... (rest of logic)
  }, [selectedComponent, setInventory, updateDiagram, toast]);

  // ... (Chat logic)

  const handleChatComponentClick = useCallback((componentId: string) => {
    canvasRef.current?.highlightComponent(componentId, {
      color: '#00f3ff',
      duration: 3000,
      pulse: true,
    });
    canvasRef.current?.centerOnComponent(componentId, 1.2);
    setCanvasSelectionId(componentId); // Update selection
  }, []);

  // ... (Visual Analysis listener)

  return (
    <AppLayout
      inventory={<Inventory onSelect={handleOpenComponentInfo} />}
      assistant={
        <AssistantSidebar>
          <ErrorBoundary>
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex bg-slate-900 border-b border-white/5 shrink-0">
                <button
                  onClick={() => setAssistantTab('chat')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
                    assistantTab === 'chat'
                      ? 'border-neon-cyan text-white bg-white/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ASSISTANT
                </button>
                <button
                  onClick={() => setAssistantTab('bootcamp')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
                    assistantTab === 'bootcamp'
                      ? 'border-neon-purple text-white bg-white/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  BOOTCAMP
                </button>
                <button
                  onClick={() => setAssistantTab('history')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
                    assistantTab === 'history'
                      ? 'border-neon-amber text-white bg-white/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  HISTORY
                </button>
                <button
                  onClick={() => setAssistantTab('diagnostic')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
                    assistantTab === 'diagnostic'
                      ? 'border-red-500 text-white bg-white/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  DIAGNOSTIC
                </button>
                <button
                  onClick={() => setAssistantTab('analytics')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
                    assistantTab === 'analytics'
                      ? 'border-neon-cyan text-white bg-white/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ANALYTICS
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                {assistantTab === 'chat' ? (
                  <ChatPanel
                    conversations={conversationManager.conversations}
                    activeConversationId={conversationManager.activeConversationId}
                    messages={conversationManager.messages}
                    onSwitchConversation={conversationManager.switchConversation}
                    onCreateConversation={conversationManager.createConversation}
                    onDeleteConversation={conversationManager.deleteConversation}
                    onRenameConversation={conversationManager.renameConversation}
                    onSendMessage={handleSendEnhancedMessage}
                    isLoading={isLoading || isProcessingAudio}
                    loadingText={loadingText || audioLoadingText}
                    onComponentClick={handleChatComponentClick}
                    onActionClick={(action) => aiActions.execute(action)}
                    context={aiContext || undefined}
                    proactiveSuggestions={proactiveSuggestions}
                    onSuggestionClick={(s) => handleSendEnhancedMessage(s)}
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
                    className="h-full border-none rounded-none"
                    headerActions={
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAssistantPinned(!assistantPinned);
                            if (!isAssistantOpen) setAssistantOpen(true);
                          }}
                          className={`h-10 w-10 inline-flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${assistantPinned ? 'text-neon-green' : 'text-slate-400 hover:text-neon-cyan'}`}
                          aria-label={assistantPinned ? 'Unpin assistant sidebar' : 'Pin assistant sidebar'}
                          title={assistantPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                        >
                          {assistantPinned ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0v6a3 3 0 01-3 3H6a2 2 0 01-2-2v-6a3 3 0 013-3zM8 16v2M12 16v2M16 16v2" /></svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAssistantPinned(false);
                            setAssistantOpen(false);
                          }}
                          className="h-10 w-10 inline-flex items-center justify-center rounded text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
                          aria-label="Close assistant sidebar"
                          title="Close assistant"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      </div>
                    }
                  />
                ) : assistantTab === 'bootcamp' ? (
                  <BootcampPanel />
                ) : assistantTab === 'history' ? (
                  <ProjectTimeline />
                ) : assistantTab === 'diagnostic' ? (
                  <DebugWorkbench />
                ) : (
                  <AnalyticsDashboard />
                )}
              </div>


            </div>
          </ErrorBoundary>
        </AssistantSidebar>
      }
      header={<AppHeader />}
      statusRail={<StatusRail />}
      modals={
        <>
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30">
            <SimControls />
          </div>
          {selectedComponent && (
            <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 text-neon-cyan">Loading...</div>}>
              <ComponentEditorModal
                component={selectedComponent}
                onClose={() => setSelectedComponent(null)}
                onSave={(updated) => {
                  setInventory(inventory.map((i) => (i.id === updated.id ? updated : i)));
                  setSelectedComponent(null);
                }}
                explanation={modalContent}
                isGenerating3D={isGenerating3D}
                onGenerate3D={handleGenerate3D}
              />
            </Suspense>
          )}
          <Suspense fallback={null}>
            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={() => setSettingsOpen(false)}
              autonomySettings={aiActions.autonomySettings}
              onAutonomySettingsChange={aiActions.updateAutonomySettings}
            />
          </Suspense>
        </>
      }
    >
      <TacticalHUD />
      <MentorOverlay />
      {isDashboardVisible ? (
        <DashboardView />
      ) : (
        <DiagramCanvas
          ref={setCanvasRef}
          diagram={diagram}
          selectedComponentId={canvasSelectionId}
          stagedActions={aiActions.stagedActions}
          onStagedActionAccept={aiActions.acceptStagedAction}
          onStagedActionReject={aiActions.rejectStagedAction}
          onComponentSelect={handleComponentSelect}
          onComponentContextMenu={handleComponentContextMenu}
          onComponentDoubleClick={handleOpenComponentInfo}
          onBackgroundClick={handleCanvasBackgroundClick}
          onDiagramUpdate={updateDiagram}
          onComponentDrop={/*...*/ undefined}
          onGenerate3D={/*...*/ undefined}
        />
      )}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-slate-900 border border-slate-700 shadow-xl rounded-md py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => {
              const comp = diagram?.components.find(c => c.id === contextMenu.componentId);
              if (comp) handleOpenComponentInfo(comp);
            }}
          >
            Edit
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => {
               const comp = diagram?.components.find(c => c.id === contextMenu.componentId);
               if (comp) {
                   const newComp = {
                       ...comp,
                       id: `${comp.sourceInventoryId || 'comp'}-${Date.now()}`,
                       name: `${comp.name} (Copy)`
                   };
                   updateDiagram({
                       ...diagram!,
                       components: [...diagram!.components, newComp],
                   });
                   setContextMenu(null);
               }
            }}
          >
            Duplicate
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => {
               const comp = diagram?.components.find(c => c.id === contextMenu.componentId);
               if (comp) handleOpenComponentInfo(comp); // Open modal which has 3D gen
            }}
          >
            Generate 3D
          </button>
          <div className="h-px bg-slate-700 my-1" />
          <button 
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300"
            onClick={() => {
               const newDiagram = {
                   ...diagram!,
                   components: diagram!.components.filter(c => c.id !== contextMenu.componentId),
                   connections: diagram!.connections.filter(c => c.fromComponentId !== contextMenu.componentId && c.toComponentId !== contextMenu.componentId)
               };
               updateDiagram(newDiagram);
               setContextMenu(null);
            }}
          >
            Delete
          </button>
        </div>
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
