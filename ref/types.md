# CircuitMind AI - Types Reference

## Core Data Types

### ElectronicComponent
```typescript
interface ElectronicComponent {
  id: string;
  name: string;
  type: 'microcontroller' | 'sensor' | 'actuator' | 'power' | 'other';
  description: string;
  pins?: string[];
  quantity?: number;
  lowStock?: boolean;
  datasheetUrl?: string;
  imageUrl?: string;
  threeCode?: string;      // Generated Three.js mesh code
  threeDModelUrl?: string; // URL to GLB/GLTF model
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
  // Canvas (safe)
  | 'highlight' | 'centerOn' | 'zoomTo' | 'resetView' | 'highlightWire'
  // Navigation (safe)
  | 'openInventory' | 'closeInventory' | 'openSettings' | 'closeSettings'
  | 'openComponentEditor' | 'switchGenerationMode'
  // Diagram (unsafe)
  | 'addComponent' | 'removeComponent' | 'createConnection' | 'removeConnection'
  // Form (unsafe)
  | 'fillField' | 'saveComponent';
```

### ActionIntent
```typescript
interface ActionIntent {
  type: ActionType;
  payload: Record<string, unknown>;
  label: string;  // Human-readable button text
  safe: boolean;  // Auto-execute vs ask
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
  recentActions: string[];
  activeView: 'canvas' | 'component-editor' | 'inventory' | 'settings';
  inventorySummary: string;
}
```

### AIAutonomySettings
```typescript
interface AIAutonomySettings {
  autoExecuteSafeActions: boolean;
  customSafeActions: ActionType[];
  customUnsafeActions: ActionType[];
}
```

---

## Chat Types

### ChatMessage (Legacy)
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  diagramData?: WiringDiagram;
  image?: string;
  video?: string;
  groundingSources?: GroundingSource[];
  audioResponse?: string;
}
```

### EnhancedChatMessage
```typescript
interface EnhancedChatMessage extends ChatMessage {
  conversationId: string;
  linkedComponents: ComponentReference[];
  suggestedActions: ActionIntent[];
  executedActions?: ExecutedAction[];
  linkedDiagramId?: string;
  thinkingContent?: string;
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
  isPrimary?: boolean;
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
  mentionStart: number;
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
  snapshotBefore?: unknown;
}
```

### ExecutedAction
```typescript
interface ExecutedAction {
  type: string;
  success: boolean;
  auto: boolean;
  timestamp: number;
  error?: string;
}
```
