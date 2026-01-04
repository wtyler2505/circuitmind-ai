import React, { useState, useRef, useCallback, lazy, Suspense, useEffect } from 'react';
import { AppLayout } from './layout/AppLayout';
import { AppHeader } from './layout/AppHeader';
import { StatusRail } from './layout/StatusRail';
import Inventory from './Inventory';
import AssistantSidebar from './AssistantSidebar';
import ChatPanel from './ChatPanel';
import DiagramCanvas, { DiagramCanvasRef } from './DiagramCanvas';

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

// Hooks & Services
import { useAIActions } from '../hooks/useAIActions';
import { useToast } from '../hooks/useToast';
import { useInventorySync } from '../hooks/useInventorySync';
import { buildAIContext } from '../services/aiContextBuilder';
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
    useDeepThinking, setUseDeepThinking 
  } = useAssistantState();
  const conversationManager = useConversationContext();

  const toast = useToast();

  // Local State (Controllers)
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<ElectronicComponent | null>(null);
  const [modalContent, setModalContent] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [aiContext, setAIContext] = useState<AIContext | null>(null);
  const [proactiveSuggestions, setProactiveSuggestions] = useState<string[]>([]);

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
    setSelectedComponent,
  });

  // Sync Inventory <-> Diagram
  useInventorySync(inventory, diagram, updateDiagram, {
    autoSync: true,
    devLogging: process.env.NODE_ENV === 'development',
  });

  // Handle Voice Transcription
  useEffect(() => {
    if (lastTranscription) {
      handleSendEnhancedMessage(lastTranscription);
      clearTranscription();
    }
  }, [lastTranscription]);

  // AI Context Builder
  useEffect(() => {
    const updateContext = async () => {
      const zoom = canvasRef.current?.getZoom() || 1;
      const pan = canvasRef.current?.getPan() || { x: 0, y: 0 };

      const context = await buildAIContext({
        diagram,
        inventory,
        selectedComponentId: selectedComponent?.id,
        activeView: selectedComponent
          ? 'component-editor'
          : isSettingsOpen
            ? 'settings'
            : 'canvas',
        viewport: { zoom, x: pan.x, y: pan.y }
      });
      setAIContext(context);
    };
    updateContext();
  }, [diagram, inventory, selectedComponent, isSettingsOpen]);

  // Proactive Suggestions
  useEffect(() => {
    const generateSuggestions = async () => {
      if (!aiContext || !diagram) return;
      try {
        const suggestions = await generateProactiveSuggestions(
          aiContext,
          diagram.components,
          diagram.connections
        );
        setProactiveSuggestions(suggestions);
      } catch (error) {
        console.error("Failed to generate suggestions:", error);
      }
    };
    const timeout = setTimeout(generateSuggestions, 2000);
    return () => clearTimeout(timeout);
  }, [aiContext, diagram]);

  // Component Actions
  const handleComponentClick = useCallback(async (component: ElectronicComponent) => {
    setSelectedComponent(component);
    const explain = await explainComponent(component.name);
    setModalContent(explain);
  }, []);

  const handleGenerate3D = useCallback(async (customPrompt?: string) => {
    if (!selectedComponent) return;
    setIsGenerating3D(true);
    try {
      const code = await generateComponent3DCode(selectedComponent.name, selectedComponent.type, customPrompt);
      const updated = { ...selectedComponent, threeCode: code };
      setSelectedComponent(updated);
      // Update in Inventory and Diagram (via sync or explicit update)
      setInventory((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      updateDiagram((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          components: prev.components.map((c) => (c.id === updated.id ? updated : c)),
        };
      });
      toast.success('3D Model generated!');
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : '3D generation failed';
      toast.error(errorMsg);
    } finally {
      setIsGenerating3D(false);
    }
  }, [selectedComponent, setInventory, updateDiagram, toast]);

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

  const handleChatComponentClick = useCallback((componentId: string) => {
    canvasRef.current?.highlightComponent(componentId, {
      color: '#00f3ff',
      duration: 3000,
      pulse: true,
    });
    canvasRef.current?.centerOnComponent(componentId, 1.2);
    const component = inventory.find((c) => c.id === componentId) || 
                      diagram?.components.find((c) => c.id === componentId);
    if (component) setSelectedComponent(component);
  }, [inventory, diagram]);

  // Listen for Visual Analysis
  useEffect(() => {
    const handleVisualAnalysis = (event: Event) => {
        const customEvent = event as CustomEvent<{ image: string }>;
        const { image } = customEvent.detail;
        if (image) {
            handleSendEnhancedMessage(
                "I've captured a snapshot of the current circuit layout. Please analyze it for visual organization, clutter, and improvements.",
                { base64: image, type: 'image' }
            );
        }
    };
    window.addEventListener('cm:visual-analysis', handleVisualAnalysis);
    return () => window.removeEventListener('cm:visual-analysis', handleVisualAnalysis);
  }, [handleSendEnhancedMessage]);

  return (
    <AppLayout
      inventory={<Inventory onSelect={handleComponentClick} />}
      assistant={
        <AssistantSidebar>
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
            className="bg-slate-950/80 border-slate-800 rounded-l-2xl rounded-r-none h-full"
            // Header actions for AssistantSidebar are inside ChatPanel in old design
            // We can keep them there or move to AssistantSidebar.
            // Let's keep them in ChatPanel for now (passed via headerActions prop if needed, 
            // but ChatPanel logic handles pin/close internally via props... wait)
            // ChatPanel headerActions were passed in App.tsx.
            // I need to implement the toggle buttons here.
            headerActions={
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAssistantPinned(!assistantPinned);
                    if (!isAssistantOpen) setAssistantOpen(true);
                  }}
                  className={`h-10 w-10 inline-flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ${assistantPinned ? 'text-neon-green' : 'text-slate-400 hover:text-neon-cyan'}`}
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
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            }
          />
        </AssistantSidebar>
      }
      header={<AppHeader />}
      statusRail={<StatusRail />}
      modals={
        <>
          {selectedComponent && (
            <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 text-neon-cyan">Loading...</div>}>
              <ComponentEditorModal
                component={selectedComponent}
                onClose={() => setSelectedComponent(null)}
                onSave={(updated) => {
                  setInventory(inventory.map((i) => (i.id === updated.id ? updated : i)));
                  // Sync logic handles diagram update if we update inventory
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
      <DiagramCanvas
        ref={setCanvasRef}
        diagram={diagram}
        onComponentClick={handleComponentClick}
        onDiagramUpdate={updateDiagram}
        onComponentDrop={useCallback((component, x, y) => {
          const newInstance = {
            ...component,
            id: `${component.id}-${Date.now()}`,
            sourceInventoryId: component.id,
          };
          updateDiagram((prev) => {
            const current = prev || { title: 'Untitled', components: [], connections: [], explanation: '' };
            return {
              ...current,
              components: [...current.components, newInstance],
            };
          });
        }, [updateDiagram])}
        onGenerate3D={useCallback(async (component) => {
           setIsGenerating3D(true);
           try {
             const code = await generateComponent3DCode(component.name, component.type);
             const updated = { ...component, threeCode: code };
             setInventory(prev => prev.map(c => c.id === updated.id ? updated : c));
             toast.success('Generated 3D');
           } catch (e) {
             toast.error('Failed 3D Gen');
           } finally {
             setIsGenerating3D(false);
           }
        }, [setInventory, toast])}
      />
    </AppLayout>
  );
};
