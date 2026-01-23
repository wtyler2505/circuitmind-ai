export interface ElectronicComponent {
  id: string;
  sourceInventoryId?: string; // Links diagram instance to inventory source (for sync)
  name: string;
  type: 'microcontroller' | 'sensor' | 'actuator' | 'power' | 'other';
  description: string;
  pins?: string[];
  quantity?: number; // New field
  lowStock?: boolean; // New field for bulk actions
  datasheetUrl?: string; // New field for documentation
  imageUrl?: string;
  threeCode?: string; // Generated javascript code for Three.js mesh
  threeDModelUrl?: string; // URL to a GLB/GLTF model
}

export interface WireConnection {
  fromComponentId: string;
  fromPin: string;
  toComponentId: string;
  toPin: string;
  description: string;
  color?: string;
}

export interface WiringDiagram {
  title: string;
  components: ElectronicComponent[];
  connections: WireConnection[];
  explanation: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  diagramData?: WiringDiagram;
  image?: string; // Base64 string of the image
  video?: string; // URL of the generated video
  groundingSources?: GroundingSource[];
  audioResponse?: string; // Base64 audio string for TTS
}

// =====================================
// AI Actions
// =====================================

export type ActionType = 
  // Viewport
  | 'highlight'
  | 'centerOn'
  | 'zoomTo'
  | 'panTo'
  | 'resetView'
  | 'highlightWire'
  
  // UI State
  | 'openInventory'
  | 'openSettings'
  | 'toggleSidebar'
  | 'setTheme'
  | 'openComponentEditor'
  | 'closeInventory'
  | 'closeSettings'
  | 'switchGenerationMode'
  
  // Project State
  | 'undo'
  | 'redo'
  | 'saveDiagram'
  | 'loadDiagram'
  
  // Diagram Editing
  | 'addComponent'
  | 'updateComponent' // Generic update
  | 'removeComponent'
  | 'clearCanvas'
  | 'createConnection'
  | 'removeConnection'
  
  // Forms (Legacy/Specific)
  | 'fillField'
  | 'saveComponent'
  
  // User Profile
  | 'setUserLevel' // AI decides to change user level
  | 'learnFact'
  
  // Vision
  | 'analyzeVisuals';

// Default safe/unsafe classification for actions
export const ACTION_SAFETY: Record<ActionType, boolean> = {
  // Canvas - safe
  highlight: true,
  centerOn: true,
  zoomTo: true,
  panTo: true,
  resetView: true,
  highlightWire: true,
  
  // UI - safe
  openInventory: true,
  closeInventory: true,
  openSettings: true,
  closeSettings: true,
  toggleSidebar: true,
  setTheme: true,
  openComponentEditor: true,
  switchGenerationMode: true,
  
  // Project - safeish
  undo: true,
  redo: true,
  saveDiagram: true,
  loadDiagram: false,
  
  // Diagram - unsafe
  addComponent: false,
  updateComponent: false,
  removeComponent: false,
  clearCanvas: false,
  createConnection: false,
  removeConnection: false,
  
  // Forms - unsafe
  fillField: false,
  saveComponent: false,
  
  // Profile - safe
  setUserLevel: true,
  learnFact: true,
  
  // Vision - safe (read only)
  analyzeVisuals: true,
};

// Reference to a component mentioned in chat
export interface ComponentReference {
  componentId: string;
  componentName: string;
  mentionStart: number; // Character position in content
  mentionEnd: number;
}

// AI action intent with payload
export interface ActionIntent {
  type: ActionType;
  payload: Record<string, unknown>;
  label: string; // Human-readable button text
  safe: boolean; // Determines auto-execute vs ask
}

// Executed action result (for tracking what AI did)
export interface ExecutedAction {
  type: string;
  success: boolean;
  auto: boolean; // Was it auto-executed?
  timestamp: number;
  error?: string;
}

// Enhanced chat message with AI integration
export interface EnhancedChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;

  // Rich content (same as ChatMessage)
  diagramData?: WiringDiagram;
  image?: string;
  video?: string;
  groundingSources?: GroundingSource[];
  audioResponse?: string;

  // AI Integration fields
  linkedComponents: ComponentReference[];
  suggestedActions: ActionIntent[];
  executedActions?: ExecutedAction[];
  
  // Metrics
  metricId?: string;

  // Context at time of message
  linkedDiagramId?: string;
  thinkingContent?: string; // For deep thinking mode
  isStreaming?: boolean;
}

// Conversation session
export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  isPrimary?: boolean; // For the main continuous thread (stored as 1/0 for IndexedDB indexing)
  lastMessagePreview?: string;
  tags?: string[];
}

// Action record for undo support
export interface ActionRecord {
  id: string;
  timestamp: number;
  type: ActionType;
  payload: Record<string, unknown>;
  conversationId?: string;
  undoable: boolean;
  snapshotBefore?: unknown; // State before action for undo
}

// Context passed to AI for awareness
export interface ActionDelta {
  timestamp: number;
  type: string;
  targetId?: string;
  description: string;
}

export interface AIContext {
  currentDiagramId?: string;
  currentDiagramTitle?: string;
  componentCount: number;
  connectionCount: number;
  selectedComponentId?: string;
  selectedComponentName?: string;
  activeSelectionPath?: string; // e.g., "esp32-1.pins.GPIO13"
  componentList?: string[]; // List of "id: name" for context awareness
  recentActions: string[];
  recentHistory?: ActionDelta[];
  activeView: 'canvas' | 'component-editor' | 'inventory' | 'settings';
  inventorySummary: string;
  userProfile?: any; // Avoiding circular dependency for now, or use loose typing
  viewport?: string;
}

// AI autonomy settings (stored in localStorage)
export interface AIAutonomySettings {
  autoExecuteSafeActions: boolean;
  customSafeActions: ActionType[]; // Actions user marked as safe
  customUnsafeActions: ActionType[]; // Actions user marked as unsafe
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}