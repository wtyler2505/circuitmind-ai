import { useEffect, useRef } from 'react';
import type { AssistantTabType } from '../components/layout/assistant/AssistantTabs';
import { gestureMetricsService } from '../services/gesture/GestureMetricsService';
import type { DiagramCanvasRef } from '../components/DiagramCanvas';

interface GestureResult {
  landmarks: Array<Array<{ x: number; y: number; z: number }>>;
}

interface UseGestureTrackingParams {
  isNeuralLinkActive: boolean;
  gestureResult: GestureResult | null;
  isHandEngaged: boolean | undefined;
  assistantTab: AssistantTabType;
  setAssistantTab: (tab: AssistantTabType) => void;
  canvasRef: React.RefObject<DiagramCanvasRef | null>;
  toast: {
    info: (msg: string, duration?: number, action?: unknown, id?: string) => void;
  };
}

export function useGestureTracking({
  isNeuralLinkActive,
  gestureResult,
  isHandEngaged,
  assistantTab,
  setAssistantTab,
  canvasRef,
  toast,
}: UseGestureTrackingParams): void {
  const isPinchingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastHandPosRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);
  const swipeCooldownRef = useRef<number>(0);
  const lastElementRef = useRef<Element | null>(null);
  const lastElementPosRef = useRef<{ x: number; y: number } | null>(null);

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
    const distance = Math.sqrt(dx * dx + dy * dy);
    const isCurrentlyPinching = distance < 0.1;

    // 2. Detect Palm (Panning / Swiping)
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const isPalmOpen =
      indexTip.y < landmarks[6].y &&
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
      ? Math.sqrt(
          Math.pow(clientX - lastElementPosRef.current.x, 2) +
            Math.pow(clientY - lastElementPosRef.current.y, 2)
        )
      : Infinity;

    if (distFromLastSearch > 10 || !currentElement) {
      currentElement = document.elementFromPoint(clientX, clientY);
      lastElementRef.current = currentElement;
      lastElementPosRef.current = { x: clientX, y: clientY };
    }

    // 3. Detect Swipe (Mode Changes)
    handleSwipe(
      isPalmOpen,
      isCurrentlyPinching,
      indexTip,
      lastHandPosRef,
      swipeCooldownRef,
      assistantTab,
      setAssistantTab,
      toast
    );

    const createSyntheticEvent = (type: string) =>
      new PointerEvent(type, {
        clientX,
        clientY,
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse',
        buttons: 1,
        isPrimary: true,
        view: window,
        detail: 1,
        screenX: clientX,
        screenY: clientY,
      });

    const dispatchSafeEvent = (element: Element | null, type: string) => {
      if (!element) return;

      const originalSet = element.setPointerCapture;
      const originalRelease = element.releasePointerCapture;

      element.setPointerCapture = () => {};
      element.releasePointerCapture = () => {};

      try {
        const event = createSyntheticEvent(type);
        element.dispatchEvent(event);
      } catch (e) {
        console.warn('Synthetic event dispatch failed:', e);
      } finally {
        element.setPointerCapture = originalSet;
        element.releasePointerCapture = originalRelease;
      }
    };

    // Handle Panning Start/Move/End
    if (isPalmOpen && !isCurrentlyPinching) {
      if (!isPanningRef.current) {
        isPanningRef.current = true;
        dispatchSafeEvent(currentElement, 'pointerdown');
      } else {
        dispatchSafeEvent(currentElement, 'pointermove');
      }
    } else if (isPanningRef.current) {
      isPanningRef.current = false;
      dispatchSafeEvent(currentElement, 'pointerup');
    }

    // Handle Pinch Start/Move/End
    if (isCurrentlyPinching && !isPanningRef.current) {
      if (!isPinchingRef.current) {
        const startTime = performance.now();
        isPinchingRef.current = true;

        if (currentElement) {
          dispatchSafeEvent(currentElement, 'pointerdown');
          gestureMetricsService.logMetric({
            gestureType: 'PINCH_SELECT',
            confidence: 1 - distance,
            success: true,
            latencyMs: performance.now() - startTime,
          });
        }
      } else {
        dispatchSafeEvent(currentElement, 'pointermove');
      }
    } else if (!isCurrentlyPinching && isPinchingRef.current) {
      isPinchingRef.current = false;
      dispatchSafeEvent(currentElement, 'pointerup');
    }
  }, [isNeuralLinkActive, gestureResult, isHandEngaged, assistantTab, setAssistantTab, toast, canvasRef]);
}

function handleSwipe(
  isPalmOpen: boolean,
  isCurrentlyPinching: boolean,
  indexTip: { x: number; y: number },
  lastHandPosRef: React.MutableRefObject<{ x: number; y: number; timestamp: number } | null>,
  swipeCooldownRef: React.MutableRefObject<number>,
  assistantTab: AssistantTabType,
  setAssistantTab: (tab: AssistantTabType) => void,
  toast: { info: (msg: string, duration?: number, action?: unknown, id?: string) => void }
): void {
  if (isPalmOpen && !isCurrentlyPinching) {
    const now = performance.now();
    if (lastHandPosRef.current && now > swipeCooldownRef.current) {
      const deltaX = indexTip.x - lastHandPosRef.current.x;
      const deltaTime = now - lastHandPosRef.current.timestamp;
      const velocity = deltaX / deltaTime;

      if (Math.abs(velocity) > 0.001) {
        const direction = velocity > 0 ? 'left' : 'right';
        const tabs: AssistantTabType[] = ['chat', 'bootcamp', 'history', 'analytics', 'audit'];
        const currentIndex = tabs.indexOf(assistantTab);

        if (direction === 'left' && currentIndex < tabs.length - 1) {
          setAssistantTab(tabs[currentIndex + 1]);
          toast.info(`Tab: ${tabs[currentIndex + 1]}`, 1000, undefined, 'swipe-tab');
          swipeCooldownRef.current = now + 800;
        } else if (direction === 'right' && currentIndex > 0) {
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
}
