# CircuitMind AI - Types Reference

> All types defined in `types.ts` (359 LOC).

## Core Data Types

### ElectronicComponent
```typescript
interface ElectronicComponent {
  id: string;
  sourceInventoryId?: string; // Links diagram instance to inventory source (for sync)
  name: string;
  type: 'microcontroller' | 'sensor' | 'actuator' | 'power' | 'other';
  description: string;
  pins?: string[];
  quantity?: number;
  lowStock?: boolean;
  datasheetUrl?: string;
  imageUrl?: string;
  fzpzUrl?: string;           // URL to the .fzpz asset
  threeCode?: string;          // Generated Three.js mesh code
  threeDModelUrl?: string;     // URL to GLB/GLTF model
  precisionLevel?: 'draft' | 'masterpiece'; // 3D generation fidelity

  // Electrical properties for MNA simulation
  electrical?: {
    resistance?: number;       // Ohms
    forwardVoltage?: number;   // Volts (LEDs, diodes)
    maxCurrent?: number;       // Amps
    outputVoltage?: number;    // Volts (voltage sources, regulators)
    inputImpedance?: number;   // Ohms (MCU inputs)
  };

  // 2D Engine (Fritzing Parity)
  fzpzSource?: ArrayBuffer;    // Original source if imported
  footprint?: ComponentFootprint;
  internalBuses?: Array<string[]>; // e.g. [['pin1', 'pin2', 'pin3']] for breadboard rails
}
```

### WirePoint
```typescript
interface WirePoint {
  x: number;
  y: number;
  handleIn?: { dx: number; dy: number };   // For curvature control
  handleOut?: { dx: number; dy: number };
}
```

### ComponentFootprint
```typescript
interface ComponentFootprint {
  width: number;   // in 0.1" units
  height: number;
  pins: {
    id: string;
    x: number;     // Relative to component origin
    y: number;
    svgElementId?: string; // Link to the FZPZ visual
  }[];
}
```

### WireConnection
```typescript
interface WireConnection {
  fromComponentId: string;
  fromPin: string;
  toComponentId: string;
  toPin: string;
  description: string;
  color?: string;
  path?: WirePoint[];   // For Bezier wire routing
}
```

### WiringDiagram
```typescript
interface WiringDiagram {
  title: string;
  components: ElectronicComponent[];
  connections: WireConnection[];
  explanation: string;
}
```

---

## AI Integration Types

### ActionType
```typescript
type ActionType =
  // Viewport
  | 'highlight' | 'centerOn' | 'zoomTo' | 'panTo' | 'resetView' | 'highlightWire'
  // UI State
  | 'openInventory' | 'openSettings' | 'toggleSidebar' | 'setTheme'
  | 'openComponentEditor' | 'closeInventory' | 'closeSettings' | 'switchGenerationMode'
  // Project State
  | 'undo' | 'redo' | 'saveDiagram' | 'loadDiagram'
  // Diagram Editing
  | 'addComponent' | 'updateComponent' | 'removeComponent'
  | 'clearCanvas' | 'createConnection' | 'removeConnection'
  // Forms
  | 'fillField' | 'saveComponent'
  // User Profile
  | 'setUserLevel' | 'learnFact'
  // Vision
  | 'analyzeVisuals';
```

### ACTION_SAFETY
```typescript
const ACTION_SAFETY: Record<ActionType, boolean> = {
  // Canvas - safe
  highlight: true, centerOn: true, zoomTo: true, panTo: true,
  resetView: true, highlightWire: true,
  // UI - safe
  openInventory: true, closeInventory: true, openSettings: true,
  closeSettings: true, toggleSidebar: true, setTheme: true,
  openComponentEditor: true, switchGenerationMode: true,
  // Project - mixed
  undo: true, redo: true, saveDiagram: true, loadDiagram: false,
  // Diagram - unsafe
  addComponent: false, updateComponent: false, removeComponent: false,
  clearCanvas: false, createConnection: false, removeConnection: false,
  // Forms - unsafe
  fillField: false, saveComponent: false,
  // Profile - safe
  setUserLevel: true, learnFact: true,
  // Vision - safe (read only)
  analyzeVisuals: true,
};
```

### ActionIntent
```typescript
interface ActionIntent {
  type: ActionType;
  payload: Record<string, unknown>;
  label: string;   // Human-readable button text
  safe: boolean;   // Determines auto-execute vs ask
}
```

### AIContext
```typescript
interface AIContext {
  currentDiagramId?: string;
  currentDiagramTitle?: string;
  componentCount: number;
  connectionCount: number;
  selectedComponentId?: string;
  selectedComponentName?: string;
  activeSelectionPath?: string;    // e.g., "esp32-1.pins.GPIO13"
  componentList?: string[];        // List of "id: name" for context awareness
  recentActions: string[];
  recentHistory?: ActionDelta[];
  activeView: 'canvas' | 'component-editor' | 'inventory' | 'settings' | 'inventory-mgmt';
  inventorySummary: string;
  userProfile?: unknown;
  relevantLessons?: unknown[];
  viewport?: string;
}
```

### ActionDelta
```typescript
interface ActionDelta {
  timestamp: number;
  type: string;
  targetId?: string;
  description: string;
}
```

### AIAutonomySettings
```typescript
interface AIAutonomySettings {
  autoExecuteSafeActions: boolean;
  customSafeActions: ActionType[];    // User-marked as safe
  customUnsafeActions: ActionType[];  // User-marked as unsafe
}
```

---

## Chat Types

### ChatMessage (Base)
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  diagramData?: WiringDiagram;
  image?: string;              // Base64 string
  video?: string;              // URL of generated video
  groundingSources?: GroundingSource[];
  audioResponse?: string;      // Base64 audio for TTS
}
```

### EnhancedChatMessage
```typescript
interface EnhancedChatMessage {
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
  thinkingContent?: string;    // For deep thinking mode
  isStreaming?: boolean;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  isPrimary?: boolean;         // Main continuous thread (stored as 1/0 for IndexedDB)
  lastMessagePreview?: string;
  tags?: string[];
}
```

---

## Support Types

### ComponentReference
```typescript
interface ComponentReference {
  componentId: string;
  componentName: string;
  mentionStart: number;   // Character position in content
  mentionEnd: number;
}
```

### GroundingSource
```typescript
interface GroundingSource {
  title: string;
  uri: string;
}
```

### ActionRecord
```typescript
interface ActionRecord {
  id: string;
  timestamp: number;
  type: ActionType;
  payload: Record<string, unknown>;
  conversationId?: string;
  undoable: boolean;
  snapshotBefore?: unknown;   // State before action for undo
}
```

### ExecutedAction
```typescript
interface ExecutedAction {
  type: string;
  success: boolean;
  auto: boolean;               // Was it auto-executed?
  timestamp: number;
  error?: string;
}
```

---

## Quest/Tutorial Types

### Quest
```typescript
interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];          // quest IDs
  componentsRequired: string[];     // component types needed
  validationRules: QuestValidationRule[];
  estimatedMinutes: number;
  pointsReward: number;
  badge?: string;
  category: 'basics' | 'circuits' | 'programming' | 'advanced';
}
```

### QuestValidationRule
```typescript
interface QuestValidationRule {
  type: 'component_placed' | 'wire_connected' | 'simulation_run' | 'component_count' | 'specific_connection';
  target?: string;
  count?: number;
  description: string;
}
```

### UserProgress
```typescript
interface UserProgress {
  completedQuests: string[];
  currentQuestId: string | null;
  skillLevel: number;
  totalPoints: number;
  badgesEarned: string[];
  tutorialsCompleted: string[];
  startedAt: string;           // ISO date
  lastActivityAt: string;      // ISO date
}
```

### TutorialStep
```typescript
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  instructions?: string;       // Alias for description (used by BootcampPanel)
  targetSelector?: string;     // CSS selector for highlight
  targetElementId?: string;    // Alternative element targeting
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'drag' | 'type' | 'observe';
  mentorTip?: string;
  completionCheck?: () => boolean;
  condition?: (state: { diagram: WiringDiagram | null; inventory: ElectronicComponent[] }) => boolean;
}
```

### Tutorial
```typescript
interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  steps: TutorialStep[];
  prerequisiteQuest?: string;
  estimatedMinutes: number;
}
```

---

## Global Augmentations

```typescript
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
```
