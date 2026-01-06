import { DiagramCanvasRef } from '../../components/DiagramCanvas';
import { ElectronicComponent, WiringDiagram, ActionRecord } from '../../types';

/**
 * Context passed to all action handlers
 */
export interface ActionContext {
  canvasRef: React.RefObject<DiagramCanvasRef>;
  inventory: ElectronicComponent[];
  diagram: WiringDiagram | null;
  setInventory: React.Dispatch<React.SetStateAction<ElectronicComponent[]>>;
  setIsInventoryOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setSelectedComponent: (component: ElectronicComponent | null) => void;
  setGenerationMode: (mode: 'chat' | 'image' | 'video') => void;
  updateDiagram: (diagram: WiringDiagram) => void;
  activeConversationId?: string | null;
  recordUndo: (record: ActionRecord) => Promise<void>;
  // App Control
  handleUndo: () => void;
  handleRedo: () => void;
  saveDiagram: () => void;
  loadDiagram: () => void;
}

/**
 * Result returned by action handlers
 */
export interface HandlerResult {
  success: boolean;
  error?: string;
}

/**
 * Generic action handler type
 */
export type ActionHandler<T = unknown> = (
  payload: T,
  context: ActionContext
) => Promise<HandlerResult>;
