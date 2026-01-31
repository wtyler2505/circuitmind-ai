export interface Point {
  x: number;
  y: number;
}

export interface TempWireState {
  startNodeId: string;
  startPin: string;
  startX: number;
  startY: number;
}

export interface DiagramState {
  // View State
  zoom: number;
  pan: Point;
  
  // Interaction State
  interactionMode: 'idle' | 'panning' | 'dragging_node' | 'creating_wire';
  lastPointerPos: Point;
  activeNodeId: string | null; // Node being dragged
  
  // Layout State
  nodePositions: Map<string, Point>;
  
  // Wire Creation State
  tempWire: TempWireState | null;
  cursorPos: Point; // Diagram coordinates
  
  // Wire Editing State
  editingWireIndex: number | null;
  wireLabelInput: string;
  wireLabelPos: Point;
  
  // UI State
  hoveredNodeId: string | null;
  isDragOver: boolean;
}

export const INITIAL_STATE: DiagramState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  interactionMode: 'idle',
  lastPointerPos: { x: 0, y: 0 },
  activeNodeId: null,
  nodePositions: new Map(),
  tempWire: null,
  cursorPos: { x: 0, y: 0 },
  editingWireIndex: null,
  wireLabelInput: '',
  wireLabelPos: { x: 0, y: 0 },
  hoveredNodeId: null,
  isDragOver: false,
};

export type DiagramAction =
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'ZOOM_IN'; payload: number } // delta
  | { type: 'ZOOM_OUT'; payload: number } // delta
  | { type: 'SET_PAN'; payload: Point }
  | { type: 'RESET_VIEW' }
  | { type: 'START_PAN'; payload: Point } // pointer pos
  | { type: 'START_DRAG_NODE'; payload: { nodeId: string; pointerPos: Point } }
  | { type: 'POINTER_MOVE'; payload: { pointerPos: Point; diagramPos: Point; snapToGrid?: boolean; gridSize?: number } }
  | { type: 'POINTER_UP' }
  | { type: 'START_WIRE'; payload: TempWireState }
  | { type: 'SET_NODE_POSITIONS'; payload: Map<string, Point> }
  | { type: 'UPDATE_NODE_POSITION'; payload: { nodeId: string; x: number; y: number } }
  | { type: 'SET_HOVERED_NODE'; payload: string | null }
  | { type: 'SET_DRAG_OVER'; payload: boolean }
  | { type: 'START_EDIT_WIRE'; payload: { index: number; description: string; position: Point } }
  | { type: 'UPDATE_WIRE_LABEL'; payload: string }
  | { type: 'CANCEL_EDIT_WIRE' }
  | { type: 'SAVE_EDIT_WIRE' }; // Logic handled in component, this just clears state

// Helper for clamping zoom
const clampZoom = (z: number) => Math.max(0.2, Math.min(4, z));

// Helper for grid snapping
const snap = (val: number, size: number) => Math.round(val / size) * size;

export function diagramReducer(state: DiagramState, action: DiagramAction): DiagramState {
  switch (action.type) {
    case 'SET_ZOOM':
      return { ...state, zoom: clampZoom(action.payload) };
      
    case 'ZOOM_IN':
      return { ...state, zoom: clampZoom(state.zoom + action.payload) };
      
    case 'ZOOM_OUT':
      return { ...state, zoom: clampZoom(state.zoom - action.payload) }; // payload is positive delta
      
    case 'SET_PAN':
      return { ...state, pan: action.payload };
      
    case 'RESET_VIEW':
      return { ...state, zoom: 1, pan: { x: 0, y: 0 } };
      
    case 'START_PAN':
      return {
        ...state,
        interactionMode: 'panning',
        lastPointerPos: action.payload,
        editingWireIndex: null, // Close edit on background click
      };
      
    case 'START_DRAG_NODE':
      return {
        ...state,
        interactionMode: 'dragging_node',
        activeNodeId: action.payload.nodeId,
        lastPointerPos: action.payload.pointerPos,
      };
      
    case 'POINTER_MOVE': {
      const { pointerPos, diagramPos, snapToGrid, gridSize = 10 } = action.payload; // Default 10px grid
      const dx = pointerPos.x - state.lastPointerPos.x;
      const dy = pointerPos.y - state.lastPointerPos.y;
      
      const newState = {
        ...state,
        lastPointerPos: pointerPos,
        cursorPos: diagramPos,
      };
      
      if (state.interactionMode === 'panning') {
        newState.pan = {
          x: state.pan.x + dx,
          y: state.pan.y + dy,
        };
      } else if (state.interactionMode === 'dragging_node' && state.activeNodeId) {
        const currentPos = state.nodePositions.get(state.activeNodeId);
        if (currentPos) {
          // Calculate new position based on delta
          let newX = currentPos.x + dx / state.zoom;
          let newY = currentPos.y + dy / state.zoom;
          
          if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }
          
          // Collision detection placeholder
          // In a full implementation, we would check intersection with other rects here
          // and prevent update if overlapping.
          
          const newPositions = new Map(state.nodePositions);
          newPositions.set(state.activeNodeId, { x: newX, y: newY });
          newState.nodePositions = newPositions;
        }
      }
      
      return newState;
    }
      
    case 'POINTER_UP':
      return {
        ...state,
        interactionMode: 'idle',
        activeNodeId: null,
        tempWire: null,
      };
      
    case 'START_WIRE':
      return {
        ...state,
        interactionMode: 'creating_wire',
        tempWire: action.payload,
      };
      
    case 'SET_NODE_POSITIONS':
      return { ...state, nodePositions: action.payload };
      
    case 'UPDATE_NODE_POSITION': {
      const newPositions = new Map(state.nodePositions);
      newPositions.set(action.payload.nodeId, { x: action.payload.x, y: action.payload.y });
      return { ...state, nodePositions: newPositions };
    }
      
    case 'SET_HOVERED_NODE':
      return { ...state, hoveredNodeId: action.payload };
      
    case 'SET_DRAG_OVER':
      return { ...state, isDragOver: action.payload };
      
    case 'START_EDIT_WIRE':
      return {
        ...state,
        editingWireIndex: action.payload.index,
        wireLabelInput: action.payload.description,
        wireLabelPos: action.payload.position,
      };
      
    case 'UPDATE_WIRE_LABEL':
      return { ...state, wireLabelInput: action.payload };
      
    case 'CANCEL_EDIT_WIRE':
    case 'SAVE_EDIT_WIRE':
      return {
        ...state,
        editingWireIndex: null,
        wireLabelInput: '',
      };
      
    default:
      return state;
  }
}
