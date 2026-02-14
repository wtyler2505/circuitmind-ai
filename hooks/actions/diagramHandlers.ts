import { ActionContext, HandlerResult } from './types';
import { ElectronicComponent, ActionRecord } from '../../types';

const generateId = () => `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface AddComponentPayload {
  component: ElectronicComponent;
  x?: number;
  y?: number;
}

interface RemoveComponentPayload {
  componentId: string;
}

interface UpdateComponentPayload {
  componentId: string;
  updates?: Partial<ElectronicComponent>;
  component?: Partial<ElectronicComponent>;
}

interface CreateConnectionPayload {
  fromComponentId: string;
  fromPin: string;
  toComponentId: string;
  toPin: string;
  color?: string;
  description?: string;
}

interface RemoveConnectionPayload {
  wireIndex: number;
}

export async function addComponent(
  payload: AddComponentPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { component, x, y } = payload;
  const { diagram, updateDiagram, canvasRef, activeConversationId, recordUndo } = context;

  if (!diagram) {
    return { success: false, error: 'No active diagram' };
  }

  const undoRecord: ActionRecord = {
    id: generateId(),
    timestamp: Date.now(),
    type: 'addComponent',
    payload: { componentId: component.id },
    conversationId: activeConversationId || undefined,
    undoable: true,
    snapshotBefore: JSON.parse(JSON.stringify(diagram)),
  };

  // Deep clone to ensure isolation from inventory
  const newComponent = JSON.parse(JSON.stringify({
    ...component,
    id: `${component.id}-${Date.now()}`,
    sourceInventoryId: component.id
  }));

  updateDiagram({
    ...diagram,
    components: [...diagram.components, newComponent],
  });

  if (x !== undefined && y !== undefined) {
    canvasRef.current?.setComponentPosition(newComponent.id, x, y);
  }

  await recordUndo(undoRecord);
  return { success: true };
}

export async function updateComponent(
  payload: UpdateComponentPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { componentId, updates, component } = payload;
  const { diagram, updateDiagram, activeConversationId, recordUndo } = context;

  if (!diagram) {
    return { success: false, error: 'No active diagram' };
  }

  if (!componentId) {
    return { success: false, error: 'Missing componentId' };
  }

  const target = diagram.components.find((c) => c.id === componentId);
  if (!target) {
    return { success: false, error: 'Component not found in diagram' };
  }

  const patch = updates || component || {};
  if (Object.keys(patch).length === 0) {
    return { success: false, error: 'No update fields provided' };
  }

  const undoRecord: ActionRecord = {
    id: generateId(),
    timestamp: Date.now(),
    type: 'updateComponent',
    payload: { componentId, patch },
    conversationId: activeConversationId || undefined,
    undoable: true,
    snapshotBefore: JSON.parse(JSON.stringify(diagram)),
  };

  updateDiagram({
    ...diagram,
    components: diagram.components.map((c) => (c.id === componentId ? { ...c, ...patch } : c)),
  });

  await recordUndo(undoRecord);
  return { success: true };
}

export async function removeComponent(
  payload: RemoveComponentPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { componentId } = payload;
  const { diagram, updateDiagram, activeConversationId, recordUndo } = context;

  if (!diagram) {
    return { success: false, error: 'No active diagram' };
  }

  const undoRecord: ActionRecord = {
    id: generateId(),
    timestamp: Date.now(),
    type: 'removeComponent',
    payload: { componentId },
    conversationId: activeConversationId || undefined,
    undoable: true,
    snapshotBefore: JSON.parse(JSON.stringify(diagram)),
  };

  updateDiagram({
    ...diagram,
    components: diagram.components.filter((c) => c.id !== componentId),
    connections: diagram.connections.filter(
      (conn) => conn.fromComponentId !== componentId && conn.toComponentId !== componentId
    ),
  });

  await recordUndo(undoRecord);
  return { success: true };
}

export async function createConnection(
  payload: CreateConnectionPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { fromComponentId, fromPin, toComponentId, toPin, color, description } = payload;
  const { diagram, updateDiagram, activeConversationId, recordUndo } = context;

  if (!diagram) {
    return { success: false, error: 'No active diagram' };
  }

  const undoRecord: ActionRecord = {
    id: generateId(),
    timestamp: Date.now(),
    type: 'createConnection',
    payload: { fromComponentId, fromPin, toComponentId, toPin },
    conversationId: activeConversationId || undefined,
    undoable: true,
    snapshotBefore: JSON.parse(JSON.stringify(diagram)),
  };

  updateDiagram({
    ...diagram,
    connections: [
      ...diagram.connections,
      {
        fromComponentId,
        fromPin,
        toComponentId,
        toPin,
        color: color || '#00f3ff',
        description: description || 'Connection',
      },
    ],
  });

  await recordUndo(undoRecord);
  return { success: true };
}

export async function removeConnection(
  payload: RemoveConnectionPayload,
  context: ActionContext
): Promise<HandlerResult> {
  const { wireIndex } = payload;
  const { diagram, updateDiagram, activeConversationId, recordUndo } = context;

  if (!diagram || wireIndex < 0 || wireIndex >= diagram.connections.length) {
    return { success: false, error: 'Invalid wire index' };
  }

  const undoRecord: ActionRecord = {
    id: generateId(),
    timestamp: Date.now(),
    type: 'removeConnection',
    payload: { wireIndex, connection: diagram.connections[wireIndex] },
    conversationId: activeConversationId || undefined,
    undoable: true,
    snapshotBefore: JSON.parse(JSON.stringify(diagram)),
  };

  updateDiagram({
    ...diagram,
    connections: diagram.connections.filter((_, i) => i !== wireIndex),
  });

  await recordUndo(undoRecord);
  return { success: true };
}

export async function clearCanvas(
  _payload: Record<string, unknown>,
  context: ActionContext
): Promise<HandlerResult> {
  const { diagram, updateDiagram, activeConversationId, recordUndo } = context;

  if (!diagram) {
    return { success: false, error: 'No active diagram' };
  }

  const undoRecord: ActionRecord = {
    id: generateId(),
    timestamp: Date.now(),
    type: 'clearCanvas',
    payload: {},
    conversationId: activeConversationId || undefined,
    undoable: true,
    snapshotBefore: JSON.parse(JSON.stringify(diagram)),
  };

  updateDiagram({
    ...diagram,
    components: [],
    connections: [],
  });

  await recordUndo(undoRecord);
  return { success: true };
}
