import { useCallback, useEffect, useRef } from 'react';
import type { ElectronicComponent, WiringDiagram, WireConnection } from '../types';
import type { DiagramState, DiagramAction } from '../components/diagram/diagramState';
import { COMPONENT_WIDTH, COMPONENT_HEIGHT } from '../components/diagram';

const GRID_SIZE = 10;

interface UseCanvasInteractionArgs {
  state: DiagramState;
  dispatch: React.Dispatch<DiagramAction>;
  diagram: WiringDiagram | null;
  selectedComponentId?: string | null;
  snapToGrid: boolean;
  containerRectRef: React.MutableRefObject<{ left: number; top: number; width: number; height: number } | null>;
  onComponentDrop?: (component: ElectronicComponent, x: number, y: number) => void;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
  onBackgroundClick?: () => void;
}

export function useCanvasInteraction({
  state,
  dispatch,
  diagram,
  selectedComponentId,
  snapToGrid,
  containerRectRef,
  onComponentDrop,
  onDiagramUpdate,
  onBackgroundClick,
}: UseCanvasInteractionArgs) {
  const rafId = useRef<number | null>(null);

  const getDiagramPos = useCallback((clientX: number, clientY: number) => {
    const rect = containerRectRef.current;
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - state.pan.x) / state.zoom,
      y: (clientY - rect.top - state.pan.y) / state.zoom,
    };
  }, [state.pan, state.zoom, containerRectRef]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    const scaleFactor = 0.1;
    if (e.deltaY > 0) dispatch({ type: 'ZOOM_OUT', payload: scaleFactor });
    else dispatch({ type: 'ZOOM_IN', payload: scaleFactor });
  }, [dispatch]);

  // Keyboard navigation (WCAG 2.1 AA SC 2.1.1 - keyboard accessible)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!arrowKeys.includes(e.key)) return;

    // Prevent page scrolling while moving components or panning
    e.preventDefault();

    if (!selectedComponentId) {
      const step = 20;
      if (e.key === 'ArrowUp') dispatch({ type: 'SET_PAN', payload: { x: state.pan.x, y: state.pan.y - step } });
      if (e.key === 'ArrowDown') dispatch({ type: 'SET_PAN', payload: { x: state.pan.x, y: state.pan.y + step } });
      if (e.key === 'ArrowLeft') dispatch({ type: 'SET_PAN', payload: { x: state.pan.x - step, y: state.pan.y } });
      if (e.key === 'ArrowRight') dispatch({ type: 'SET_PAN', payload: { x: state.pan.x + step, y: state.pan.y } });
    } else if (diagram) {
      const step = e.shiftKey ? 10 : 1;
      const comp = diagram.components.find((c) => c.id === selectedComponentId);
      if (comp && onDiagramUpdate) {
        const newComponents = diagram.components.map(c => {
          if (c.id === selectedComponentId) {
            const pos = state.nodePositions.get(c.id) || { x: 0, y: 0 };
            let nx = pos.x;
            let ny = pos.y;
            if (e.key === 'ArrowUp') ny -= step;
            if (e.key === 'ArrowDown') ny += step;
            if (e.key === 'ArrowLeft') nx -= step;
            if (e.key === 'ArrowRight') nx += step;
            return { ...c, position: { x: nx, y: ny } };
          }
          return c;
        });
        onDiagramUpdate({ ...diagram, components: newComponents });
      }
    }
  }, [selectedComponentId, diagram, onDiagramUpdate, state.pan, state.nodePositions, dispatch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Pointer events
  const handlePointerDown = useCallback((e: React.PointerEvent, nodeId?: string) => {
    e.stopPropagation();
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch (_err) { /* synthetic events */ }
    const pointerPos = { x: e.clientX, y: e.clientY };

    if (nodeId) {
      dispatch({ type: 'START_DRAG_NODE', payload: { nodeId, pointerPos } });
    } else {
      dispatch({ type: 'START_PAN', payload: pointerPos });
    }
  }, [dispatch]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafId.current) return;
    rafId.current = window.requestAnimationFrame(() => {
      const pointerPos = { x: clientX, y: clientY };
      const diagramPos = getDiagramPos(clientX, clientY);
      dispatch({
        type: 'POINTER_MOVE',
        payload: { pointerPos, diagramPos, snapToGrid, gridSize: GRID_SIZE },
      });
      rafId.current = null;
    });
  }, [getDiagramPos, snapToGrid, dispatch]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (rafId.current) {
      window.cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch (_err) { /* synthetic events */ }
    const wasDragging = state.interactionMode === 'dragging_node';
    const wasPanning = state.interactionMode === 'panning';
    if (!wasDragging && !wasPanning && onBackgroundClick) {
      onBackgroundClick();
    }
    dispatch({ type: 'POINTER_UP' });
  }, [state.interactionMode, onBackgroundClick, dispatch]);

  // Drag and drop from inventory
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dispatch({ type: 'SET_DRAG_OVER', payload: true });
  }, [dispatch]);

  const handleDragLeave = useCallback(() => {
    dispatch({ type: 'SET_DRAG_OVER', payload: false });
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_DRAG_OVER', payload: false });
    const componentData = e.dataTransfer.getData('application/json');
    if (componentData && containerRectRef.current && onComponentDrop) {
      try {
        const component = JSON.parse(componentData) as ElectronicComponent;
        const rect = containerRectRef.current;
        let x = (e.clientX - rect.left - state.pan.x) / state.zoom;
        let y = (e.clientY - rect.top - state.pan.y) / state.zoom;
        x -= COMPONENT_WIDTH / 2;
        y -= COMPONENT_HEIGHT / 2;
        if (snapToGrid) {
          x = Math.round(x / GRID_SIZE) * GRID_SIZE;
          y = Math.round(y / GRID_SIZE) * GRID_SIZE;
        }
        onComponentDrop(component, x, y);
      } catch (_err) {
        console.error('Drop failed', _err);
      }
    }
  }, [state.pan, state.zoom, snapToGrid, onComponentDrop, containerRectRef, dispatch]);

  return {
    getDiagramPos,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
