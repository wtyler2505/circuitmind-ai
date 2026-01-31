import React, { useState, useRef, useCallback, lazy, Suspense, useEffect } from 'react';
import { AppLayout } from './layout/AppLayout';
import { AppHeader } from './layout/AppHeader';
import { StatusRail } from './layout/StatusRail';
import Inventory from './Inventory';
import AssistantSidebar from './AssistantSidebar';
import ChatPanel from './ChatPanel';
import DiagramCanvas, { DiagramCanvasRef } from './DiagramCanvas';
import { NeuralCursor } from './diagram/NeuralCursor';
import { TacticalHUD } from './diagram/TacticalHUD';
import { SimControls } from './layout/SimControls';
import { MentorOverlay } from './layout/MentorOverlay';
import { BootcampPanel } from './layout/BootcampPanel';
import { ProjectTimeline } from './layout/ProjectTimeline';
import { DebugWorkbench } from './layout/DebugWorkbench';
import { AnalyticsDashboard } from './layout/AnalyticsDashboard';
import { SystemLogViewer } from './layout/SystemLogViewer';
import { DashboardView } from './dashboard/DashboardView';
import { Gatekeeper } from './auth/Gatekeeper';
import { CyberToast } from './layout/CyberToast';
import { OmniSearch } from './layout/OmniSearch';
import ErrorBoundary from './ErrorBoundary';

import SettingsPanel from './SettingsPanel';

// Lazy Components
const ComponentEditorModal = lazy(() => import('./ComponentEditorModal'));
// const SettingsPanel = lazy(() => import('./SettingsPanel'));

// Contexts
import { useInventory } from '../contexts/InventoryContext';
import { useDiagram } from '../contexts/DiagramContext';
import { useVoiceAssistant } from '../contexts/VoiceAssistantContext';
import { useLayout } from '../contexts/LayoutContext';
import { useAssistantState } from '../contexts/AssistantStateContext';
import { useConversationContext } from '../contexts/ConversationContext';
import { useHUD } from '../contexts/HUDContext';
import { useSelection } from '../contexts/SelectionContext';

// Hooks & Services
import { useAIActions } from '../hooks/useAIActions';
import { useToastApi } from '../hooks/useToast';
import { useNeuralLink } from '../hooks/useNeuralLink';
import { gestureMetricsService } from '../services/gesture/GestureMetricsService';
import { securityAuditor } from '../services/securityAuditor';
import { searchIndexer, type IndexedDocument } from '../services/search/searchIndexer';
import { predictionEngine } from '../services/predictionEngine';
import { buildAIContext } from '../services/aiContextBuilder';
import { chatWithAI, chatWithContext } from '../services/gemini/features/chat';
import { generateEditedImage, generateConceptImage, generateCircuitVideo } from '../services/gemini/features/media';
import { generateWiringDiagram } from '../services/gemini/features/wiring';
import { explainComponent, generateComponent3DCode } from '../services/gemini/features/components';
import useInventorySync from '../hooks/useInventorySync';
import { useSync } from '../hooks/useSync';

// UI Components
import { AssistantTabs, type AssistantTabType } from './layout/assistant/AssistantTabs';

// Types
import { 
  type ElectronicComponent, 
  type AIContext, 
  type EnhancedChatMessage,
  ACTION_SAFETY 
} from '../types';
// ... (imports)
export const MainLayout: React.FC = () => {
  // Contexts
  const { 
    isInventoryOpen: _isInventoryOpen, 
    setInventoryOpen: _setInventoryOpen,
    isAssistantOpen,
    setAssistantOpen,
    assistantPinned,
    setAssistantPinned,
    isFocusMode,
    setFocusMode,
    activeSidebar: _activeSidebar,
    setActiveSidebar: _setActiveSidebar,
    inventoryWidth: _inventoryWidth,
    setInventoryWidth: _setInventoryWidth,
    assistantWidth: _assistantWidth,
    setAssistantWidth: _setAssistantWidth,
    settingsInitialTab,
    isSettingsOpen,
    setSettingsOpen,
    neuralLinkEnabled
  } = useLayout();

  const toast = useToastApi();

  const [assistantTab, setAssistantTab] = useState<AssistantTabType>('chat');
  const [proactiveSuggestions] = useState<string[]>([]);

  // Neural Link (Gestures)
  const { 
    isActive: isNeuralLinkActive, 
    isInitializing: isNeuralLinkLoading,
    startTracking: startNeuralLink, 
    stopTracking: stopNeuralLink,
    result: gestureResult,
    getSnapshotBlob: getCameraSnapshot,
    isEngaged: isHandEngaged,
    error: neuralLinkError
  } = useNeuralLink();

  useEffect(() => {
    if (neuralLinkEnabled) {
      startNeuralLink();
    } else {
      stopNeuralLink();
    }
  }, [neuralLinkEnabled, startNeuralLink, stopNeuralLink]);

  const { inventory, setInventory } = useInventory();
  const { diagram, updateDiagram } = useDiagram();
  const { 
    isRecording, startRecording, stopRecording, 
    loadingText: audioLoadingText, isProcessingAudio,
    registerVisualContextProvider, unregisterVisualContextProvider, 
    lastTranscription, clearTranscription
  } = useVoiceAssistant();

  const { 
    generationMode, setGenerationMode, 
    imageSize, setImageSize, 
    aspectRatio, setAspectRatio, 
    useDeepThinking, setUseDeepThinking,
    recentHistory
  } = useAssistantState();

  const { 
    selectedComponentId: canvasSelectionId, 
    setSelectedComponentId: setCanvasSelectionId,
    activeSelectionPath
  } = useSelection();

  const conversationManager = useConversationContext();
  
  const { 
    isVisible: hudIsVisible, 
    setVisible: setHudVisible, 
    addFragment, 
    removeFragment 
  } = useHUD();

  // Register Camera visual context
  useEffect(() => {
    if (isNeuralLinkActive) {
      registerVisualContextProvider('camera', getCameraSnapshot);
    } else {
      unregisterVisualContextProvider('camera');
    }
    return () => unregisterVisualContextProvider('camera');
  }, [isNeuralLinkActive, getCameraSnapshot, registerVisualContextProvider, unregisterVisualContextProvider]);

  const loadingToastId = useRef<string | null>(null);
  useEffect(() => {
    if (isNeuralLinkLoading) {
      if (!loadingToastId.current) {
        loadingToastId.current = 'neural-link-loading';
        toast.info('Neural Link: Loading tracking engine...', 0, undefined, loadingToastId.current);
      }
    } else if (loadingToastId.current) {
      toast.removeToast(loadingToastId.current);
      toast.success('Neural Link: Ready', 2000, undefined, 'neural-link-ready');
      loadingToastId.current = null;
    }
  }, [isNeuralLinkLoading, toast]);

  useEffect(() => {
    if (neuralLinkError) {
      // Use a stable ID for the error to prevent spamming
      toast.error(`Neural Link Error: ${neuralLinkError}`, 5000, undefined, 'neural-link-error');
    }
  }, [neuralLinkError, toast]);

  const isPinchingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastHandPosRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);
  const swipeCooldownRef = useRef<number>(0);
  const lastElementRef = useRef<Element | null>(null);
  const lastElementPosRef = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    if (!isNeuralLinkActive || !gestureResult || gestureResult.landmarks.length === 0) {
      lastHandPosRef.current = null;
      lastElementRef.current = null;
      lastElementPosRef.current = null;
      return;
    }

    const landmarks = gestureResult.landmarks[0];
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];

    // 1. Detect Pinch (Selection / Drag) - Use 2D distance for stability
    const dx = indexTip.x - thumbTip.x;
    const dy = indexTip.y - thumbTip.y;
    const distance = Math.sqrt(dx*dx + dy*dy);

    const isCurrentlyPinching = distance < 0.1;

    // 2. Detect Palm (Panning / Swiping)
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    const isPalmOpen = indexTip.y < landmarks[6].y && 
                       middleTip.y < landmarks[10].y && 
                       ringTip.y < landmarks[14].y && 
                       pinkyTip.y < landmarks[18].y;

    const rect = canvasRef.current?.getContainerRect();
    if (!rect) return;

    const clientX = rect.left + (1 - indexTip.x) * rect.width;
    const clientY = rect.top + indexTip.y * rect.height;

    // Throttle elementFromPoint (Forced Reflow optimization)
    let currentElement = lastElementRef.current;
    const distFromLastSearch = lastElementPosRef.current 
      ? Math.sqrt(Math.pow(clientX - lastElementPosRef.current.x, 2) + Math.pow(clientY - lastElementPosRef.current.y, 2))
      : Infinity;

    if (distFromLastSearch > 10 || !currentElement) {
      currentElement = document.elementFromPoint(clientX, clientY);
      lastElementRef.current = currentElement;
      lastElementPosRef.current = { x: clientX, y: clientY };
    }

    // 3. Detect Swipe (Mode Changes)
    if (isPalmOpen && !isCurrentlyPinching) {
      const now = performance.now();
      if (lastHandPosRef.current && now > swipeCooldownRef.current) {
        const deltaX = indexTip.x - lastHandPosRef.current.x;
        const deltaTime = now - lastHandPosRef.current.timestamp;
        const velocity = deltaX / deltaTime;

        // Velocity threshold for swipe
        if (Math.abs(velocity) > 0.001) { 
          const direction = velocity > 0 ? 'left' : 'right';
          const tabs: AssistantTabType[] = ['chat', 'bootcamp', 'history', 'analytics', 'audit'];
          const currentIndex = tabs.indexOf(assistantTab);
          
          if (direction === 'left' && currentIndex < tabs.length - 1) {
            console.log("Gesture: Swipe Left");
            setAssistantTab(tabs[currentIndex + 1]);
            toast.info(`Tab: ${tabs[currentIndex + 1]}`, 1000, undefined, 'swipe-tab');
            swipeCooldownRef.current = now + 800;
          } else if (direction === 'right' && currentIndex > 0) {
            console.log("Gesture: Swipe Right");
            setAssistantTab(tabs[currentIndex - 1]);
            toast.info(`Tab: ${tabs[currentIndex - 1]}`, 1000, undefined, 'swipe-tab');
            swipeCooldownRef.current = now + 800;
          }
        }
      }
      lastHandPosRef.current = { x: indexTip.x, y: indexTip.y, timestamp: now };
    } else {
      lastHandPosRef.current = null;
    }

    const createSyntheticEvent = (type: string) => new PointerEvent(type, {
      clientX, clientY, bubbles: true, cancelable: true, pointerId: 1, // Use standard pointerId
      pointerType: 'mouse', buttons: 1, isPrimary: true, view: window,
      detail: 1, screenX: clientX, screenY: clientY
    });

    const dispatchSafeEvent = (element: Element | null, type: string) => {
      if (!element) return;
      
      // Temporarily monkey-patch setPointerCapture/releasePointerCapture 
      // because synthetic events don't have a real pointerId that browsers accept for capture.
      const originalSet = element.setPointerCapture;
      const originalRelease = element.releasePointerCapture;
      
      // Some libs check for these before calling
      element.setPointerCapture = () => {};
      element.releasePointerCapture = () => {};
      
      try {
        const event = createSyntheticEvent(type);
        element.dispatchEvent(event);
      } catch (e) {
        console.warn('Synthetic event dispatch failed:', e);
      } finally {
        // Restore original methods
        element.setPointerCapture = originalSet;
        element.releasePointerCapture = originalRelease;
      }
    };

    // Handle Panning Start/Move/End
    if (isPalmOpen && !isCurrentlyPinching) {
      if (!isPanningRef.current) {
        console.log(`Gesture: Pan Start at (${Math.round(clientX)}, ${Math.round(clientY)}) on`, currentElement?.tagName);
        isPanningRef.current = true;
        dispatchSafeEvent(currentElement, 'pointerdown');
      } else {
        dispatchSafeEvent(currentElement, 'pointermove');
      }
    } else if (isPanningRef.current) {
      console.log("Gesture: Pan End");
      isPanningRef.current = false;
      dispatchSafeEvent(currentElement, 'pointerup');
    }

    // Handle Pinch Start/Move/End
    if (isCurrentlyPinching && !isPanningRef.current) {
      if (!isPinchingRef.current) {
        console.log(`Gesture: Pinch Start at (${Math.round(clientX)}, ${Math.round(clientY)}) on`, currentElement?.tagName);
        const startTime = performance.now();
        isPinchingRef.current = true;
        
        if (currentElement) {
          dispatchSafeEvent(currentElement, 'pointerdown');
          gestureMetricsService.logMetric({
            gestureType: 'PINCH_SELECT', confidence: 1 - distance, success: true,
            latencyMs: performance.now() - startTime
          });
        }
      } else {
        dispatchSafeEvent(currentElement, 'pointermove');
      }
    } else if (!isCurrentlyPinching && isPinchingRef.current) {
      console.log("Gesture: Pinch End");
      isPinchingRef.current = false;
      dispatchSafeEvent(currentElement, 'pointerup');
    }
  }, [isNeuralLinkActive, gestureResult, isHandEngaged, assistantTab, setAssistantTab, toast]);

  // Real-time Security Audit loop
  const activeSecurityFragments = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!diagram) return;
    
    const violations = securityAuditor.auditCircuitSafety(diagram);
    const criticals = violations.filter(v => v.severity === 'high' || v.severity === 'critical');
    
    const currentBatch = new Set<string>();
    if (criticals.length > 0) {
      criticals.forEach(v => {
        const fragId = `sec-warn-${v.location}`;
        currentBatch.add(fragId);
        addFragment({
          id: fragId,
          targetId: v.location,
          type: 'warning',
          content: `SAFETY RISK: ${v.message}`,
          position: { x: 50, y: 50 },
          priority: 1
        });
        activeSecurityFragments.current.add(fragId);
      });
    }

    // Cleanup fragments that are no longer active
    activeSecurityFragments.current.forEach(id => {
      if (!currentBatch.has(id)) {
        removeFragment(id);
        activeSecurityFragments.current.delete(id);
      }
    });
  }, [diagram, addFragment, removeFragment]);

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
  const [modalContent, setModalContent] = useState<string>('');
  const [aiContext, setAIContext] = useState<AIContext | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; componentId: string } | null>(null);
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Canvas Ref
  const canvasRef = useRef<DiagramCanvasRef>(null);
  const setCanvasRef = useCallback((node: DiagramCanvasRef | null) => {
    // Update ref
    (canvasRef as React.MutableRefObject<DiagramCanvasRef | null>).current = node;
    // Register with Voice Assistant
    if (node) {
      registerVisualContextProvider('canvas', node.getSnapshotBlob);
    } else {
      unregisterVisualContextProvider('canvas');
    }
  }, [registerVisualContextProvider, unregisterVisualContextProvider]);

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
  }, [hudIsVisible, setHudVisible, isFocusMode, setFocusMode, isDashboardVisible, setIsDashboardVisible, isSearchOpen, setIsSearchOpen, toast]);

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
    aiContext, aiActions, useDeepThinking, conversationManager, updateDiagram
  ]);

  // Handle Voice Transcription
  useEffect(() => {
    if (lastTranscription) {
      handleSendEnhancedMessage(lastTranscription);
      clearTranscription();
    }
  }, [lastTranscription, handleSendEnhancedMessage, clearTranscription]);

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
  }, [aiContext, aiActions, isLoading]);

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
  }, [setCanvasSelectionId]);

  const handleComponentContextMenu = useCallback((componentId: string, x: number, y: number) => {
    setCanvasSelectionId(componentId); // Select on right click too
    setContextMenu({ x, y, componentId });
  }, [setCanvasSelectionId]);

  const handleCanvasBackgroundClick = useCallback(() => {
    setCanvasSelectionId(null);
    setContextMenu(null);
  }, [setCanvasSelectionId]);

  const handleSearchSelect = useCallback((doc: IndexedDocument) => {
    setIsSearchOpen(false);
    if (doc.category === 'component' || doc.category === 'diagram') {
      const id = doc.category === 'component' ? doc.reference.id : doc.reference;
      canvasRef.current?.highlightComponent(id, { color: '#00f3ff', duration: 3000, pulse: true });
      canvasRef.current?.centerOnComponent(id, 1.2);
      setCanvasSelectionId(id);
    }
  }, [setCanvasSelectionId]);

  // ... (Chat logic)

  const handleChatComponentClick = useCallback((componentId: string) => {
    canvasRef.current?.highlightComponent(componentId, {
      color: '#00f3ff',
      duration: 3000,
      pulse: true,
    });
    canvasRef.current?.centerOnComponent(componentId, 1.2);
    setCanvasSelectionId(componentId); // Update selection
  }, [setCanvasSelectionId]);

  // ... (Visual Analysis listener)

  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const { updateItem } = useInventory(); // Destructure updateItem

  const handleGenerate3D = useCallback(async (name?: string, type?: string, prompt?: string, imageUrl?: string, precision?: 'draft' | 'masterpiece') => {
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
        precisionLevel: targetPrecision
      } as ElectronicComponent;
      
      // Update local state for immediate modal feedback
      setSelectedComponent(updated);
      
      // Sync to global inventory using context helper
      updateItem(updated);
      
      // If part of diagram, update diagram too
      if (diagram?.components.some(c => c.id === updated.id)) {
        updateDiagram({
          ...diagram,
          components: diagram.components.map(c => c.id === updated.id ? updated : c)
        });
      }
      
      toast.success(isRegenerate ? '3D Geometry Refined' : '3D Geometry Synthesized');
    } catch (error) {
      console.error('3D Generation Error:', error);
      toast.error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating3D(false);
    }
  }, [selectedComponent, diagram, updateDiagram, updateItem, toast]);


  const handleComponentDrop = useCallback((component: ElectronicComponent, x: number, y: number) => {
    if (!diagram) return;
    const newComponent = { ...component, id: `comp-${Date.now()}`, position: { x, y } };
    updateDiagram({
      ...diagram,
      components: [...diagram.components, newComponent]
    });
  }, [diagram, updateDiagram]);

  const handleComponentDoubleClick = useCallback((component: ElectronicComponent) => {
    handleOpenComponentInfo(component);
  }, [handleOpenComponentInfo]);

  return (
    <AppLayout
      inventory={<Inventory onSelect={handleOpenComponentInfo} />}
      assistant={
        <AssistantSidebar>
          <ErrorBoundary>
            <div className="flex flex-col h-full overflow-hidden">
              <AssistantTabs 
                activeTab={assistantTab} 
                onTabChange={setAssistantTab} 
              />

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
                    isExpanded={isAssistantOpen}
                    onToggleExpand={() => setAssistantOpen(!isAssistantOpen)}
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
                ) : assistantTab === 'analytics' ? (
                  <AnalyticsDashboard />
                ) : (
                  <SystemLogViewer />
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
          {/* <Suspense fallback={null}> */}
            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={() => setSettingsOpen(false)}
              autonomySettings={aiActions.autonomySettings}
              onAutonomySettingsChange={aiActions.updateAutonomySettings}
              initialTab={settingsInitialTab}
            />
          {/* </Suspense> */}
        </>
      }
    >
      <TacticalHUD />
      <MentorOverlay />
      {isDashboardVisible ? (
        <DashboardView />
      ) : (
          <>
            <DiagramCanvas
              ref={setCanvasRef}
              diagram={diagram}
              selectedComponentId={canvasSelectionId}
              stagedActions={aiActions.stagedActions}
              onStagedActionAccept={aiActions.acceptStagedAction}
              onStagedActionReject={aiActions.rejectStagedAction}
              onComponentSelect={handleComponentSelect}
              onComponentContextMenu={handleComponentContextMenu}
              onComponentDoubleClick={handleComponentDoubleClick}
              onDiagramUpdate={updateDiagram}
              onComponentDrop={handleComponentDrop}
              onBackgroundClick={handleCanvasBackgroundClick}
              onGenerate3D={async (comp) => {
                handleComponentDoubleClick(comp);
                await handleGenerate3D(comp.name, comp.type);
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
      {contextMenu && (
        <div 
          className="fixed z-50 bg-cyber-black panel-surface border border-neon-cyan/20 shadow-2xl py-1 min-w-[180px] panel-frame animate-fade-in-right"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1 flex items-center gap-2">
            <div className="w-1 h-1 bg-neon-cyan animate-pulse" />
            Component Actions
          </div>
          <button 
            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors flex items-center gap-2 group"
            onClick={() => {
              const comp = diagram?.components.find(c => c.id === contextMenu.componentId);
              if (comp) handleOpenComponentInfo(comp);
            }}
          >
            <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors flex items-center gap-2 group"
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
            <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            Duplicate
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors flex items-center gap-2 group"
            onClick={() => {
               const comp = diagram?.components.find(c => c.id === contextMenu.componentId);
               if (comp) handleOpenComponentInfo(comp); 
            }}
          >
            <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
            Generate 3D
          </button>
          <div className="h-px bg-white/5 my-1 mx-2" />
          <button 
            className="w-full text-left px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 group"
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
            <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
