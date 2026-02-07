import { useCallback, useEffect, useRef } from 'react';
import { WiringDiagram, ElectronicComponent, WireConnection } from '../types';
import { DiagramState, DiagramAction } from '../components/diagram/diagramState';
import { COMPONENT_WIDTH, COMPONENT_HEIGHT } from '../components/diagram';

export interface CanvasInteractionConfig {
  dispatch: React.Dispatch<DiagramAction>;
  state: Pick<
    DiagramState,
    | 'pan'
    | 'zoom'
    | 'nodePositions'
    | 'interactionMode'
    | 'tempWire'
    | 'editingWireIndex'
    | 'wireLabelInput'
    | 'cursorPos'
  >;
  diagram: WiringDiagram | null;
  containerRectRef: React.MutableRefObject<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>;
  snapToGrid: boolean;
  gridSize: number;
  selectedComponentId?: string | null;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
  onComponentDrop?: (component: ElectronicComponent, x: number, y: number) => void;
  onBackgroundClick?: () => void;
}

export interface CanvasInteractionHandlers {
  getDiagramPos: (clientX: number, clientY: number) => { x: number; y: number };
  handleWheel: (e: React.WheelEvent) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  handlePointerDown: (e: React.PointerEvent, nodeId?: string) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handlePinPointerDown: (
    e: React.PointerEvent,
    nodeId: string,
    pin: string,
    isRightSide: boolean
  ) => void;
  handlePinPointerUp: (e: React.PointerEvent, nodeId: string, pin: string) => void;
  handleWireEditClick: (index: number) => void;
  handleWireDelete: (index: number) => void;
  handleWireLabelSave: () => void;
}

export function useCanvasInteraction(config: CanvasInteractionConfig): CanvasInteractionHandlers {
  const {
    dispatch,
    state,
    diagram,
    containerRectRef,
    snapToGrid,
    gridSize,
    selectedComponentId,
    onDiagramUpdate,
    onComponentDrop,
    onBackgroundClick,
  } = config;

  // RAF id for throttling pointer moves
  const rafId = useRef<number | null>(null);

  // Helper to calculate cursor position in diagram coordinates
  const getDiagramPos = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRectRef.current;
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - state.pan.x) / state.zoom,
        y: (clientY - rect.top - state.pan.y) / state.zoom,
      };
    },
    [state.pan, state.zoom, containerRectRef]
  );

  // Zoom via mouse wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.stopPropagation();
      const scaleFactor = 0.1;
      if (e.deltaY > 0) dispatch({ type: 'ZOOM_OUT', payload: scaleFactor });
      else dispatch({ type: 'ZOOM_IN', payload: scaleFactor });
    },
    [dispatch]
  );

  // Arrow key navigation (canvas pan or component nudge)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle if not in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Canvas Movement
      if (!selectedComponentId) {
        const step = 20;
        if (e.key === 'ArrowUp')
          dispatch({ type: 'SET_PAN', payload: { x: state.pan.x, y: state.pan.y - step } });
        if (e.key === 'ArrowDown')
          dispatch({ type: 'SET_PAN', payload: { x: state.pan.x, y: state.pan.y + step } });
        if (e.key === 'ArrowLeft')
          dispatch({ type: 'SET_PAN', payload: { x: state.pan.x - step, y: state.pan.y } });
        if (e.key === 'ArrowRight')
          dispatch({ type: 'SET_PAN', payload: { x: state.pan.x + step, y: state.pan.y } });
      } else if (diagram) {
        // Component Movement
        const step = e.shiftKey ? 10 : 1;
        const comp = diagram.components.find((c) => c.id === selectedComponentId);

        if (comp && onDiagramUpdate) {
          const newComponents = diagram.components.map((c) => {
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
    },
    [selectedComponentId, diagram, onDiagramUpdate, state.pan, state.nodePositions, dispatch]
  );

  // Bind keydown listener to window
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Start drag/pan
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, nodeId?: string) => {
      e.stopPropagation();
      try {
        (e.target as Element).setPointerCapture(e.pointerId);
      } catch (_err) {
        // Ignore errors from synthetic events (Neural Link)
      }
      const pointerPos = { x: e.clientX, y: e.clientY };

      if (nodeId) {
        dispatch({ type: 'START_DRAG_NODE', payload: { nodeId, pointerPos } });
      } else {
        dispatch({ type: 'START_PAN', payload: pointerPos });
      }
    },
    [dispatch]
  );

  // Pointer tracking with RAF throttling
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Capture coordinates before the event potentially gets recycled
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rafId.current) return;

      rafId.current = window.requestAnimationFrame(() => {
        const pointerPos = { x: clientX, y: clientY };
        const diagramPos = getDiagramPos(clientX, clientY);
        dispatch({
          type: 'POINTER_MOVE',
          payload: { pointerPos, diagramPos, snapToGrid, gridSize },
        });
        rafId.current = null;
      });
    },
    [getDiagramPos, snapToGrid, gridSize, dispatch]
  );

  // End interaction
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch (_err) {
        // Ignore errors from synthetic events
      }
      const wasDragging = state.interactionMode === 'dragging_node';
      const wasPanning = state.interactionMode === 'panning';
      if (!wasDragging && !wasPanning && onBackgroundClick) {
        // Check if we clicked on background (svg or container)
        // Actually DiagramNode stops propagation, so if we reach here it should be background
        // BUT we need to ensure we didn't just finish a drag
        onBackgroundClick();
      }
      dispatch({ type: 'POINTER_UP' });
    },
    [state.interactionMode, onBackgroundClick, dispatch]
  );

  // Component DnD handlers
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      dispatch({ type: 'SET_DRAG_OVER', payload: true });
    },
    [dispatch]
  );

  const handleDragLeave = useCallback(() => {
    dispatch({ type: 'SET_DRAG_OVER', payload: false });
  }, [dispatch]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
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
            x = Math.round(x / gridSize) * gridSize;
            y = Math.round(y / gridSize) * gridSize;
          }
          onComponentDrop(component, x, y);
        } catch (_err) {
          console.error('Drop failed', _err);
        }
      }
    },
    [state.pan, state.zoom, snapToGrid, gridSize, onComponentDrop, containerRectRef, dispatch]
  );

  // Wire creation handlers
  const handlePinPointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string, pin: string, isRightSide: boolean) => {
      e.stopPropagation();
      e.preventDefault();
      if (!diagram) return;
      const pos = state.nodePositions.get(nodeId);
      if (!pos) return;
      const startNode = diagram.components.find((n) => n.id === nodeId);
      const pinIndex = (startNode?.pins || []).indexOf(pin);
      const pinY = pos.y + 40 + pinIndex * 15;
      const pinX = isRightSide ? pos.x + COMPONENT_WIDTH : pos.x;
      dispatch({
        type: 'START_WIRE',
        payload: { startNodeId: nodeId, startPin: pin, startX: pinX, startY: pinY },
      });
    },
    [diagram, state.nodePositions, dispatch]
  );

  const handlePinPointerUp = useCallback(
    (e: React.PointerEvent, nodeId: string, pin: string) => {
      e.stopPropagation();
      if (!diagram || !state.tempWire) return;
      if (state.tempWire.startNodeId === nodeId && state.tempWire.startPin === pin) {
        dispatch({ type: 'POINTER_UP' });
        return;
      }

      const exists = diagram.connections.some(
        (c) =>
          (c.fromComponentId === state.tempWire!.startNodeId &&
            c.fromPin === state.tempWire!.startPin &&
            c.toComponentId === nodeId &&
            c.toPin === pin) ||
          (c.toComponentId === state.tempWire!.startNodeId &&
            c.toPin === state.tempWire!.startPin &&
            c.fromComponentId === nodeId &&
            c.fromPin === pin)
      );

      if (!exists) {
        const newConnection: WireConnection = {
          fromComponentId: state.tempWire.startNodeId,
          fromPin: state.tempWire.startPin,
          toComponentId: nodeId,
          toPin: pin,
          description: 'New Wire',
          color: '#00f3ff',
        };
        onDiagramUpdate({
          ...diagram,
          connections: [...diagram.connections, newConnection],
        });
      }
      dispatch({ type: 'POINTER_UP' });
    },
    [diagram, state.tempWire, onDiagramUpdate, dispatch]
  );

  // Wire editing handlers
  const handleWireEditClick = useCallback(
    (index: number) => {
      if (!diagram) return;
      const conn = diagram.connections[index];
      if (!conn) return;

      const startPos = state.nodePositions.get(conn.fromComponentId);
      const endPos = state.nodePositions.get(conn.toComponentId);
      if (startPos && endPos) {
        const startComp = diagram.components.find((c) => c.id === conn.fromComponentId);
        const endComp = diagram.components.find((c) => c.id === conn.toComponentId);
        let x1 = startPos.x,
          y1 = startPos.y;
        const startPinIdx = (startComp?.pins || []).indexOf(conn.fromPin);
        if (startPinIdx !== -1) {
          x1 += endPos.x < startPos.x ? 0 : COMPONENT_WIDTH;
          y1 += 40 + startPinIdx * 15;
        } else {
          x1 += COMPONENT_WIDTH / 2;
          y1 += COMPONENT_HEIGHT + 10;
        }

        let x2 = endPos.x,
          y2 = endPos.y;
        const endPinIdx = (endComp?.pins || []).indexOf(conn.toPin);
        if (endPinIdx !== -1) {
          x2 += endPos.x < startPos.x ? COMPONENT_WIDTH : 0;
          y2 += 40 + endPinIdx * 15;
        } else {
          x2 += COMPONENT_WIDTH / 2;
          y2 += COMPONENT_HEIGHT + 10;
        }
        dispatch({
          type: 'START_EDIT_WIRE',
          payload: {
            index,
            description: conn.description || '',
            position: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
          },
        });
      }
    },
    [diagram, state.nodePositions, dispatch]
  );

  const handleWireDelete = useCallback(
    (index: number) => {
      if (!diagram || !onDiagramUpdate) return;
      const updatedConnections = diagram.connections.filter((_, i) => i !== index);
      onDiagramUpdate({ ...diagram, connections: updatedConnections });
    },
    [diagram, onDiagramUpdate]
  );

  const handleWireLabelSave = useCallback(() => {
    if (state.editingWireIndex === null || !diagram || !onDiagramUpdate) return;
    const updatedConnections = diagram.connections.map((conn, i) =>
      i === state.editingWireIndex ? { ...conn, description: state.wireLabelInput } : conn
    );
    onDiagramUpdate({ ...diagram, connections: updatedConnections });
    dispatch({ type: 'SAVE_EDIT_WIRE' });
  }, [state.editingWireIndex, state.wireLabelInput, diagram, onDiagramUpdate, dispatch]);

  return {
    getDiagramPos,
    handleWheel,
    handleKeyDown,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePinPointerDown,
    handlePinPointerUp,
    handleWireEditClick,
    handleWireDelete,
    handleWireLabelSave,
  };
}
