import { useCallback } from 'react';
import type { WiringDiagram, WireConnection } from '../types';
import type { DiagramState, DiagramAction } from '../components/diagram/diagramState';
import {
  calculateWireEndpoints,
  calculateWireMidpoint,
  resolvePinEndpointWithFallback,
} from '../components/diagram';
import type { PinSide } from '../components/diagram';

interface UseCanvasWiringArgs {
  state: DiagramState;
  dispatch: React.Dispatch<DiagramAction>;
  diagram: WiringDiagram | null;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
}

export function useCanvasWiring({
  state,
  dispatch,
  diagram,
  onDiagramUpdate,
}: UseCanvasWiringArgs) {
  const handlePinPointerDown = useCallback((
    e: React.PointerEvent,
    nodeId: string,
    pin: string,
    pinSide: PinSide
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (!diagram) return;
    const pos = state.nodePositions.get(nodeId);
    if (!pos) return;
    const startNode = diagram.components.find((n) => n.id === nodeId);
    const endpoint = resolvePinEndpointWithFallback(startNode, pin, pos, pinSide);
    dispatch({
      type: 'START_WIRE',
      payload: {
        startNodeId: nodeId,
        startPin: pin,
        startX: endpoint.x,
        startY: endpoint.y,
      },
    });
  }, [diagram, state.nodePositions, dispatch]);

  const handlePinPointerUp = useCallback((e: React.PointerEvent, nodeId: string, pin: string) => {
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
  }, [diagram, state.tempWire, onDiagramUpdate, dispatch]);

  const handleWireEditClick = useCallback((index: number) => {
    if (!diagram) return;
    const conn = diagram.connections[index];
    if (!conn) return;

    const startPos = state.nodePositions.get(conn.fromComponentId);
    const endPos = state.nodePositions.get(conn.toComponentId);
    if (startPos && endPos) {
      const startComp = diagram.components.find(c => c.id === conn.fromComponentId);
      const endComp = diagram.components.find(c => c.id === conn.toComponentId);
      const endpoints = calculateWireEndpoints(conn, startComp, endComp, startPos, endPos);
      const midpoint = calculateWireMidpoint(endpoints, conn.path);
      dispatch({
        type: 'START_EDIT_WIRE',
        payload: {
          index,
          description: conn.description || '',
          position: midpoint,
        },
      });
    }
  }, [diagram, state.nodePositions, dispatch]);

  const handleWireDelete = useCallback((index: number) => {
    if (!diagram || !onDiagramUpdate) return;
    const updatedConnections = diagram.connections.filter((_, i) => i !== index);
    onDiagramUpdate({ ...diagram, connections: updatedConnections });
  }, [diagram, onDiagramUpdate]);

  const handleWireLabelSave = useCallback(() => {
    if (state.editingWireIndex === null || !diagram || !onDiagramUpdate) return;
    const updatedConnections = diagram.connections.map((conn, i) =>
      i === state.editingWireIndex ? { ...conn, description: state.wireLabelInput } : conn
    );
    onDiagramUpdate({ ...diagram, connections: updatedConnections });
    dispatch({ type: 'SAVE_EDIT_WIRE' });
  }, [state.editingWireIndex, state.wireLabelInput, diagram, onDiagramUpdate, dispatch]);

  return {
    handlePinPointerDown,
    handlePinPointerUp,
    handleWireEditClick,
    handleWireDelete,
    handleWireLabelSave,
  };
}
