# 08 - Data Models and Persistence

> Complete reference for every TypeScript interface, persistence mechanism, validation rule, and data migration pattern in CircuitMind AI.

---

## 1. Core Type System (`types.ts` -- 290 LOC)

All shared interfaces live in `types.ts` at the project root. No interfaces are scattered in component files. This is the single vocabulary for the entire application.

### 1.1 ElectronicComponent

The fundamental data model for every component in inventory and diagram.

```typescript
interface ElectronicComponent {
  id: string;                        // Unique identifier (e.g. "mcu-arduino-uno-r3")
  sourceInventoryId?: string;        // Links diagram instance back to inventory source for sync
  name: string;                      // Human-readable name (e.g. "Arduino Uno R3")
  type: 'microcontroller' | 'sensor' | 'actuator' | 'power' | 'other';
  description: string;               // Textual description of the component
  pins?: string[];                   // Array of pin names (e.g. ["GPIO13", "VCC", "GND"])
  quantity?: number;                 // Stock quantity for BOM/inventory management
  lowStock?: boolean;                // Flag for bulk action triggers
  datasheetUrl?: string;             // Link to external datasheet
  imageUrl?: string;                 // Component image (can be data URL or HTTP URL)
  fzpzUrl?: string;                  // URL to the .fzpz Fritzing part asset
  threeCode?: string;                // Generated JavaScript code for Three.js mesh rendering
  threeDModelUrl?: string;           // URL to a GLB/GLTF 3D model
  precisionLevel?: 'draft' | 'masterpiece'; // 3D generation fidelity setting

  // 2D Engine Upgrade (Fritzing Parity)
  fzpzSource?: ArrayBuffer;          // Raw binary .fzpz data if imported
  footprint?: ComponentFootprint;    // Parsed pin layout for 2D rendering
  internalBuses?: Array<string[]>;   // Internal pin groups (e.g. breadboard rails)
}
```

**Key invariant**: `sourceInventoryId` links a diagram instance to its inventory source. When a component is placed on the canvas, a new ElectronicComponent is created with a unique `id` (suffixed) but `sourceInventoryId` pointing to the inventory item. The inventory version is always the source of truth.

### 1.2 ComponentFootprint

Defines the physical pin layout for 2D rendering, parsed from FZPZ files.

```typescript
interface ComponentFootprint {
  width: number;    // In 0.1-inch units
  height: number;   // In 0.1-inch units
  pins: {
    id: string;            // Pin identifier matching ElectronicComponent.pins
    x: number;             // X offset relative to component origin
    y: number;             // Y offset relative to component origin
    svgElementId?: string; // Link to the corresponding SVG element in the FZPZ visual
  }[];
}
```

### 1.3 WireConnection

Represents a single wire between two component pins.

```typescript
interface WireConnection {
  fromComponentId: string;   // Source component ID (diagram instance ID)
  fromPin: string;           // Source pin name
  toComponentId: string;     // Destination component ID (diagram instance ID)
  toPin: string;             // Destination pin name
  description: string;       // Human-readable description (e.g. "5V power")
  color?: string;            // Wire color for rendering (CSS color)
  path?: WirePoint[];        // Bezier control points for wire routing
}
```

### 1.4 WirePoint

Control point for Bezier wire routing paths.

```typescript
interface WirePoint {
  x: number;
  y: number;
  handleIn?: { dx: number; dy: number };   // Incoming curve control handle
  handleOut?: { dx: number; dy: number };  // Outgoing curve control handle
}
```

### 1.5 WiringDiagram

The top-level diagram structure, combining components and their connections.

```typescript
interface WiringDiagram {
  title: string;                        // Diagram name
  components: ElectronicComponent[];    // All components placed on canvas
  connections: WireConnection[];        // All wires between components
  explanation: string;                  // AI-generated or user explanation of the diagram
}
```

**Persistence**: The current diagram is autosaved to `localStorage` key `cm_autosave` as serialized JSON. Quick-save goes to `savedDiagram`.

### 1.6 ChatMessage (Legacy)

Original chat message format, still used by some older code paths.

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;                    // Unix milliseconds
  diagramData?: WiringDiagram;          // Embedded diagram from AI generation
  image?: string;                       // Base64 encoded image
  video?: string;                       // URL of generated video
  groundingSources?: GroundingSource[]; // Web search citations
  audioResponse?: string;              // Base64 audio for TTS
}
```

### 1.7 GroundingSource

Citation from Gemini's grounded search feature.

```typescript
interface GroundingSource {
  title: string;   // Source page title
  uri: string;     // Source URL
}
```

### 1.8 EnhancedChatMessage

The primary message format used by the conversation system. Extends ChatMessage with AI action integration.

```typescript
interface EnhancedChatMessage {
  id: string;                          // Unique ID (generated as timestamp-random)
  conversationId: string;              // Foreign key to Conversation
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;                   // Unix milliseconds

  // Rich content (same fields as ChatMessage)
  diagramData?: WiringDiagram;
  image?: string;
  video?: string;
  groundingSources?: GroundingSource[];
  audioResponse?: string;

  // AI Integration fields
  linkedComponents: ComponentReference[];   // Components mentioned in message text
  suggestedActions: ActionIntent[];         // AI-suggested actions for the user
  executedActions?: ExecutedAction[];       // Actions that were auto-executed

  // Metrics
  metricId?: string;                       // Links to AIMetric for latency tracking

  // Context at time of message
  linkedDiagramId?: string;                // Diagram state snapshot reference
  thinkingContent?: string;                // Deep thinking chain-of-thought output
  isStreaming?: boolean;                   // True while message is being streamed
}
```

**Storage**: Messages are persisted in IndexedDB `messages` store, indexed by `conversationId`.

### 1.9 Conversation

Represents a chat session containing multiple messages.

```typescript
interface Conversation {
  id: string;                    // Unique ID (generated as timestamp-random)
  title: string;                 // Display title (auto-generated from first user message)
  createdAt: number;             // Unix milliseconds
  updatedAt: number;             // Last activity timestamp
  messageCount: number;          // Running count of messages
  isPrimary?: boolean;           // True for the main continuous thread (stored as 1/0 in IndexedDB)
  lastMessagePreview?: string;   // First 100 chars of last message for list display
  tags?: string[];               // User-assigned tags
}
```

**Storage**: Conversations are persisted in IndexedDB `conversations` store with keyPath `id`.

### 1.10 ComponentReference

Identifies a component mentioned in chat message text, enabling inline component linking.

```typescript
interface ComponentReference {
  componentId: string;    // ID of the referenced component
  componentName: string;  // Display name of the component
  mentionStart: number;   // Character offset in message content (start)
  mentionEnd: number;     // Character offset in message content (end)
}
```

---

## 2. AI Action System Types

### 2.1 ActionType

Union type enumerating all possible AI-triggerable actions, organized by domain:

```typescript
type ActionType =
  // Viewport (read-only canvas operations)
  | 'highlight' | 'centerOn' | 'zoomTo' | 'panTo' | 'resetView' | 'highlightWire'
  // UI State (sidebar/panel toggles)
  | 'openInventory' | 'openSettings' | 'toggleSidebar' | 'setTheme'
  | 'openComponentEditor' | 'closeInventory' | 'closeSettings' | 'switchGenerationMode'
  // Project State (undo/save/load)
  | 'undo' | 'redo' | 'saveDiagram' | 'loadDiagram'
  // Diagram Editing (mutations -- require confirmation)
  | 'addComponent' | 'updateComponent' | 'removeComponent'
  | 'clearCanvas' | 'createConnection' | 'removeConnection'
  // Forms
  | 'fillField' | 'saveComponent'
  // User Profile
  | 'setUserLevel' | 'learnFact'
  // Vision
  | 'analyzeVisuals';
```

### 2.2 ACTION_SAFETY Constant

Maps every ActionType to a boolean indicating whether it can be auto-executed without user confirmation.

```typescript
const ACTION_SAFETY: Record<ActionType, boolean> = {
  // Safe (auto-execute): viewport, UI state, undo/redo, save, profile, vision
  highlight: true,    centerOn: true,     zoomTo: true,      panTo: true,
  resetView: true,    highlightWire: true, openInventory: true, closeInventory: true,
  openSettings: true, closeSettings: true, toggleSidebar: true, setTheme: true,
  openComponentEditor: true, switchGenerationMode: true,
  undo: true,         redo: true,         saveDiagram: true,
  setUserLevel: true, learnFact: true,    analyzeVisuals: true,

  // Unsafe (require confirmation): diagram mutations, forms, load
  loadDiagram: false,    addComponent: false,    updateComponent: false,
  removeComponent: false, clearCanvas: false,     createConnection: false,
  removeConnection: false, fillField: false,      saveComponent: false,
};
```

**Runtime behavior**: Safe actions auto-execute when suggested by AI. Unsafe actions render as clickable buttons in the chat for the user to approve. Users can override these defaults via `AIAutonomySettings`.

### 2.3 ActionIntent

Represents an AI-suggested action with its payload and safety classification.

```typescript
interface ActionIntent {
  type: ActionType;                    // Which action to perform
  payload: Record<string, unknown>;    // Action-specific parameters
  label: string;                       // Human-readable button text
  safe: boolean;                       // Whether to auto-execute
}
```

### 2.4 ExecutedAction

Records the result of an action that was executed (for audit trail).

```typescript
interface ExecutedAction {
  type: string;        // ActionType that was executed
  success: boolean;    // Whether execution succeeded
  auto: boolean;       // Was it auto-executed (safe) or user-approved?
  timestamp: number;   // When it was executed
  error?: string;      // Error message if failed
}
```

### 2.5 ActionRecord

Full action record stored in IndexedDB for undo/redo support and history.

```typescript
interface ActionRecord {
  id: string;                          // Unique record ID
  timestamp: number;                   // When recorded
  type: ActionType;                    // Action type
  payload: Record<string, unknown>;    // Action parameters
  conversationId?: string;             // Conversation that triggered it
  undoable: boolean;                   // Whether this action supports undo
  snapshotBefore?: unknown;            // State snapshot before action (for undo)
}
```

**Storage**: Stored in IndexedDB `action_history` store with keyPath `id`.

### 2.6 AIContext

Context object passed to Gemini to give the AI awareness of current application state.

```typescript
interface AIContext {
  currentDiagramId?: string;
  currentDiagramTitle?: string;
  componentCount: number;
  connectionCount: number;
  selectedComponentId?: string;
  selectedComponentName?: string;
  activeSelectionPath?: string;       // e.g. "esp32-1.pins.GPIO13"
  componentList?: string[];           // Array of "id: name" strings
  recentActions: string[];            // Human-readable recent action descriptions
  recentHistory?: ActionDelta[];      // Structured recent action records
  activeView: 'canvas' | 'component-editor' | 'inventory' | 'settings';
  inventorySummary: string;           // Comma-separated inventory item names
  userProfile?: unknown;              // Current user profile data
  relevantLessons?: unknown[];        // AI memory/learned facts
  viewport?: string;                  // Current viewport description
}
```

### 2.7 ActionDelta

Lightweight action description for the AI context history buffer.

```typescript
interface ActionDelta {
  timestamp: number;
  type: string;          // Action type identifier
  targetId?: string;     // Component/connection affected
  description: string;   // Human-readable description
}
```

### 2.8 AIAutonomySettings

User-configurable overrides for action safety classification.

```typescript
interface AIAutonomySettings {
  autoExecuteSafeActions: boolean;       // Global toggle for auto-execution
  customSafeActions: ActionType[];       // Actions user marked as safe (override defaults)
  customUnsafeActions: ActionType[];     // Actions user marked as unsafe (override defaults)
}
```

**Storage**: Stored in localStorage (key not explicitly defined in types, managed by `useAutonomySettings` hook).

---

## 3. Persistence Layer (`services/storage.ts` -- 325 LOC)

The persistence layer is dual-layer: localStorage for small/fast data, IndexedDB for large structured data.

### 3.1 IndexedDB Configuration

**Database name**: `CircuitMindDB`
**Database version**: `3`

| Store | Key Path | Indexes | Purpose |
|-------|----------|---------|---------|
| `inventory` | `id` | None | ElectronicComponent records |
| `app_state` | `key` | None | Generic key-value app state |
| `action_history` | `id` | None | ActionRecord audit trail |
| `conversations` | `id` | None | Conversation metadata |
| `messages` | `id` | `conversationId` (non-unique) | EnhancedChatMessage records |
| `parts` | `id` | None | Binary FZPZ data and cached SVGs |

**Version migration**: The `onupgradeneeded` handler uses `if (!db.objectStoreNames.contains(...))` guards, so each store is created once and preserved across version upgrades. No destructive migrations.

### 3.2 localStorage Keys (Complete Registry)

| Key | Type | Source | Description |
|-----|------|--------|-------------|
| `cm_inventory` | `string` (JSON) | InventoryContext | Serialized ElectronicComponent array -- primary inventory storage |
| `cm_autosave` | `string` (JSON) | DiagramContext | Serialized WiringDiagram -- current diagram with undo/redo present state |
| `savedDiagram` | `string` (JSON) | DiagramContext | Quick-save slot: `{ diagram: WiringDiagram, timestamp: number }` |
| `cm_gemini_api_key` | `string` | SettingsPanel | Gemini API key (plaintext) |
| `cm_active_mode` | `string` | LayoutContext | UI mode: `'design'`, `'wiring'`, or `'debug'` |
| `cm_inventory_open_default` | `string` | LayoutContext | Boolean as string: whether inventory sidebar defaults open |
| `cm_inventory_pinned_default` | `string` | LayoutContext | Boolean as string: whether inventory sidebar is pinned |
| `cm_inventory_width` | `string` | LayoutContext | Integer as string: inventory sidebar pixel width (280-520) |
| `cm_assistant_open_default` | `string` | LayoutContext | Boolean as string: whether assistant sidebar defaults open |
| `cm_assistant_pinned_default` | `string` | LayoutContext | Boolean as string: whether assistant sidebar is pinned |
| `cm_assistant_width` | `string` | LayoutContext | Integer as string: assistant sidebar pixel width (300-560) |
| `cm_layout_snapshot_design` | `string` (JSON) | LayoutContext | LayoutSnapshot for design mode |
| `cm_layout_snapshot_wiring` | `string` (JSON) | LayoutContext | LayoutSnapshot for wiring mode |
| `cm_layout_snapshot_debug` | `string` (JSON) | LayoutContext | LayoutSnapshot for debug mode |
| `cm_low_performance_mode` | `string` | LayoutContext | Boolean as string: performance degradation mode |
| `cm_neural_link_enabled` | `string` | LayoutContext | Boolean as string: gesture recognition toggle |
| `cm_dashboard_widgets` | `string` (JSON) | DashboardContext | Serialized DashboardWidget array |
| `cm_macros` | `string` (JSON) | MacroContext | Serialized MacroWorkflow array |
| `cm_ai_metrics` | `string` (JSON) | aiMetricsService | AIMetric array (capped at 1000 entries) |
| `cm_eng_events` | `string` (JSON) | aiMetricsService | EngineeringEvent array (capped at 1000 entries) |
| `cm_auth_hash` | `string` | authService | PBKDF2-derived hash of master PIN |
| `cm_auth_salt` | `string` | authService | Base64-encoded 16-byte PBKDF2 salt |
| `cm_active_profile_id` | `string` | userProfileService | UUID of the currently active user profile |
| `cm_3d_code_cache_*` | `string` | ThreeViewer | Cached Three.js code generation results (purged on quota exceeded) |

### 3.3 localStorage Wrapper (`storageService`)

The `storageService` object wraps `localStorage` with quota protection:

```typescript
storageService.setItem(key: string, value: string): boolean
storageService.getItem(key: string): string | null
storageService.handleQuotaExceeded(key: string, value: string): boolean
```

**Quota exceeded handling** (multi-phase):

1. **Phase 1 -- Purge 3D code cache**: Removes all keys matching `cm_3d_code_cache_*`
2. **Phase 2 -- Prune inventory images**: If the failing key is `cm_inventory`, strips `imageUrl` values over 5000 characters and nullifies all `threeCode` fields
3. **Phase 3 -- Failure**: Returns `false` if still over quota

**DOMException detection**: Catches error codes `22`, `1014`, and error names `QuotaExceededError` and `NS_ERROR_DOM_QUOTA_REACHED` (Firefox compatibility).

### 3.4 IndexedDB Sanitization

All objects written to IndexedDB pass through `sanitizeForDB()`:

1. **Primary path**: `window.structuredClone(obj)` -- handles circular references and most structured types
2. **Fallback path**: `JSON.stringify()` with circular reference detection (replaces circular refs with `'[Circular]'`), then `JSON.parse()` to get a clean object
3. **Failure path**: Returns `null` and logs error; the record is silently skipped

### 3.5 IndexedDB Operations -- Inventory

```typescript
saveInventoryToDB(items: ElectronicComponent[]): Promise<void>
```
Clears the entire `inventory` store, then writes each item individually. This is a full replace, not an upsert.

```typescript
loadInventoryFromDB(): Promise<ElectronicComponent[]>
```
Returns all items from the `inventory` store. Returns empty array if none found.

### 3.6 IndexedDB Operations -- Conversations

```typescript
saveConversation(conv: Conversation): Promise<void>
```
Upserts a conversation record (IndexedDB `put` semantics).

```typescript
listConversations(limit: number = 50): Promise<Conversation[]>
```
Returns all conversations sorted by `updatedAt` descending, limited to `limit`.

```typescript
deleteConversation(id: string): Promise<void>
```
Deletes the conversation AND all its messages (cascading delete via `conversationId` index cursor).

```typescript
getPrimaryConversation(): Promise<Conversation | null>
```
Scans the first 100 conversations for one with `isPrimary === true`.

### 3.7 IndexedDB Operations -- Messages

```typescript
saveMessage(msg: EnhancedChatMessage): Promise<void>
```
Upserts a message record.

```typescript
loadMessages(conversationId: string): Promise<EnhancedChatMessage[]>
```
Queries the `conversationId` index and returns messages sorted by `timestamp` ascending.

### 3.8 IndexedDB Operations -- Action History

```typescript
recordAction(action: ActionRecord): Promise<void>
```
Writes an action record for the audit trail.

```typescript
getRecentActions(limit: number = 10): Promise<ActionRecord[]>
```
Returns all actions sorted by `timestamp` descending, limited to `limit`.

```typescript
deleteAction(id: string): Promise<void>
```
Removes a single action record.

---

## 4. Part Storage Service (`services/partStorageService.ts`)

Manages binary FZPZ part files in the `parts` store of `CircuitMindDB`.

### 4.1 CachedPart Interface

```typescript
interface CachedPart {
  id: string;              // Same as ElectronicComponent.id
  binary: ArrayBuffer;     // Raw .fzpz file contents
  thumbnail?: string;      // Data URL for component thumbnail
  breadboardSvg?: string;  // Extracted breadboard view SVG
  schematicSvg?: string;   // Extracted schematic view SVG
  lastUsed: number;        // Timestamp for cache eviction
}
```

### 4.2 API

```typescript
partStorageService.savePart(part: CachedPart): Promise<void>
partStorageService.getPart(id: string): Promise<CachedPart | null>
partStorageService.hasPart(id: string): Promise<boolean>
partStorageService.removePart(id: string): Promise<void>
```

**Note**: This service opens `CircuitMindDB` without specifying a version, relying on the main `storage.ts` having already created the `parts` store.

### 4.3 Lazy Loading Pattern

The `InventoryContext.loadPartData(id)` method implements a lazy loading chain:

1. Check if component already has `fzpzSource` and `footprint` in memory -- return immediately
2. Check IndexedDB cache via `partStorageService.getPart(id)` -- load binary, re-parse footprint if missing
3. Fetch from `comp.fzpzUrl` via HTTP -- parse with `FzpzLoader`, save to IndexedDB cache, update inventory item

---

## 5. Component Validator (`services/componentValidator.ts` -- 502 LOC)

Ensures 100% consistency between inventory (source of truth) and diagram (derived data).

### 5.1 Validation Types

```typescript
interface ComponentMismatch {
  diagramComponentId: string;
  diagramComponentName: string;
  inventoryId: string | undefined;
  field: 'name' | 'type' | 'pins' | 'description' | 'missing' | 'orphaned';
  expected: unknown;      // What inventory says
  actual: unknown;        // What diagram has
  severity: 'error' | 'warning';
}

interface ValidationResult {
  isValid: boolean;       // True only if zero mismatches
  mismatches: ComponentMismatch[];
  orphanedCount: number;  // Components with no inventory source
  syncedCount: number;    // Components that match perfectly
  totalChecked: number;   // Total diagram components checked
}
```

### 5.2 Validation Rules

`validateDiagramInventoryConsistency(diagram, inventory)` checks every diagram component:

| Check | Severity | Trigger |
|-------|----------|---------|
| Orphaned (no `sourceInventoryId` + no ID prefix match) | `warning` | Component has no traceable inventory source |
| Missing (deleted from inventory) | `error` | `sourceInventoryId` exists but inventory item is gone |
| Name mismatch | `error` | `diagramComp.name !== inventoryComp.name` |
| Type mismatch | `error` | `diagramComp.type !== inventoryComp.type` |
| Pins mismatch | `error` | Set comparison of pin arrays (order-independent) |

**Lookup strategy**: Uses `sourceInventoryId` first. If absent (legacy data), extracts the base ID by splitting on `-` and taking the first segment, then looks up by that prefix.

### 5.3 Usage Analysis

```typescript
interface ComponentUsage {
  inventoryId: string;
  inDiagramCount: number;          // How many diagrams use this component
  hasActiveConnections: boolean;   // Does any instance have wires?
  connectionCount: number;         // Total wire count across all instances
  inSavedDiagrams: boolean;        // Used in any saved (non-current) diagram?
  onlyInDrafts: boolean;           // True if only in current/unsaved diagram
  diagramIds: string[];            // Names of diagrams containing this component
}
```

`analyzeUsage(inventoryId, currentDiagram, savedDiagrams)` searches across all diagrams for instances of the given inventory item, counting connections and categorizing usage.

### 5.4 Orphan Handling Strategy

`determineOrphanAction(inventoryId, currentDiagram, savedDiagrams)` returns:

```typescript
type OrphanAction = 'block' | 'warn' | 'cascade';
```

| Condition | Action | Behavior |
|-----------|--------|----------|
| Component has active wire connections | `block` | Deletion blocked entirely; user must remove wires first |
| Component exists in saved diagrams | `warn` | User warned and asked to confirm cross-diagram removal |
| Component only in current/draft diagram, no connections | `cascade` | Auto-remove from diagram without confirmation |
| Component not used in any diagram | `cascade` | Safe to delete |

### 5.5 Sync Functions

**`syncComponentWithInventory(diagramComp, inventory)`**: Syncs a single diagram component, copying `name`, `type`, `description`, `pins`, `datasheetUrl`, and `imageUrl` from the inventory source while preserving the diagram instance's `id`.

**`syncDiagramWithInventory(diagram, inventory)`**: Applies `syncComponentWithInventory` to every component in the diagram. Returns `{ diagram, changeCount }`.

**`removeOrphanedComponents(diagram, inventory)`**: Removes diagram components whose inventory source no longer exists. Also cascades to remove connections referencing removed components. Returns `{ diagram, removedIds }`.

### 5.6 Legacy Migration

**`LEGACY_ID_MAP`**: Maps old-style IDs to new semantic IDs:

```typescript
const LEGACY_ID_MAP = {
  'mcu': 'mcu-arduino-uno-r3',
  'mcu1': 'mcu-arduino-uno-r3',
  'pot': 'other-potentiometer',
  'pot1': 'other-potentiometer',
  'servo': 'actuator-servo',
  'servo1': 'actuator-servo',
  'sensor': 'sensor-hcsr04',
  'hcsr04': 'sensor-hcsr04',
  'dht11': 'sensor-dht11',
  'lcd': 'display-lcd1602',
};
```

**`migrateLegacyDiagram(diagram, inventory)`**: Repairs legacy diagrams by:
1. Checking if `sourceInventoryId` is already valid
2. Looking up `LEGACY_ID_MAP` by base ID or component name
3. Falling back to exact name match in inventory
4. Returns `{ diagram, repairedCount }`

**Migration runs once** on mount in `DiagramContext`, gated by a `useRef(false)` flag.

### 5.7 3D Model Validation

```typescript
verifyModelDimensions(model, expected): { score: number; deviations: string[] }
```

Compares 3D model dimensions against expected values. Width and length tolerance is 10%, height tolerance is 20%. Score is `max(0, 1 - deviations * 0.3)`.

---

## 6. Collaboration Data (Yjs CRDT)

### 6.1 CollabService (`services/collabService.ts`)

Uses `Yjs` with `y-webrtc` provider for real-time collaboration.

**Shared document structure**:
- `Y.Doc` contains a single shared map: `doc.getMap('diagram')`
- The shared map is a flat `Y.Map<unknown>` where top-level keys mirror `WiringDiagram` fields (`title`, `components`, `connections`, `explanation`)

**Room joining**:
```typescript
collabService.joinRoom(roomId: string, onUpdate: (diagram: WiringDiagram) => void)
```

**State updates**:
```typescript
collabService.updateSharedState(diagram: WiringDiagram)
```
Runs inside `doc.transact()` for atomic updates. Iterates over `Object.entries(diagram)` and sets each key on the shared map.

**Signaling server**: `ws://localhost:4444` (local development default).

**Presence/awareness**: Exposed via `collabService.getPresence()` which returns the `WebrtcProvider.awareness` object for cursor tracking.

---

## 7. Authentication & User Profile Data

### 7.1 Auth Types (`services/authService.ts`)

```typescript
type UserRole = 'admin' | 'engineer' | 'observer';

interface User {
  id: string;      // e.g. "owner"
  name: string;    // e.g. "Owner"
  role: UserRole;
}

interface Session {
  token: string;       // crypto.randomUUID()
  user: User;
  expiresAt: number;   // Timestamp + 3600000 (1 hour)
}
```

**PIN storage**: The master PIN is hashed with PBKDF2 (100,000 iterations, SHA-256) and stored as:
- `cm_auth_hash` -- Base64-encoded derived key
- `cm_auth_salt` -- Base64-encoded 16-byte random salt

**Session management**: In-memory only (not persisted). Session expires after 1 hour. Currently single-user: valid PIN always returns `{ id: 'owner', name: 'Owner', role: 'admin' }`.

### 7.2 Role Permissions

```typescript
const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  admin:    { canEditInventory: true,  canModifyDiagram: true,  canViewAPIKeys: true,  canDeleteData: true  },
  engineer: { canEditInventory: true,  canModifyDiagram: true,  canViewAPIKeys: false, canDeleteData: false },
  observer: { canEditInventory: false, canModifyDiagram: false, canViewAPIKeys: false, canDeleteData: false },
};
```

### 7.3 User Profile (`services/userProfileService.ts`)

Stored in a separate IndexedDB database: `CircuitMindProfiles` (version 1, store: `profiles`).

```typescript
type ExpertiseLevel = 'beginner' | 'intermediate' | 'pro';
type ThemePreference = 'cyber' | 'industrial' | 'minimal';
type AITone = 'sass' | 'technical' | 'concise';

interface UserProfile {
  id: string;                     // crypto.randomUUID()
  name: string;
  expertise: ExpertiseLevel;
  preferences: {
    theme: ThemePreference;
    wiringColors: Record<string, string>;  // e.g. { "VCC": "#ff0000", "GND": "#000000" }
    aiTone: AITone;
  };
  stats: {
    projectsCreated: number;
    componentsMastered: string[];  // Component names the user has "mastered"
  };
}
```

**Default profile**: Created automatically on first load with name `'Default User'`, expertise `'intermediate'`, theme `'cyber'`, and preset wiring colors for VCC, GND, SDA, SCL.

**Active profile tracking**: `localStorage` key `cm_active_profile_id` stores the UUID of the current profile.

---

## 8. Context Provider State Shapes

All application state is managed through 17 React Context providers. Each defines its own state shape.

### 8.1 LayoutContext State

```typescript
interface LayoutSnapshot {
  isInventoryOpen: boolean;
  isAssistantOpen: boolean;
  inventoryPinned: boolean;
  assistantPinned: boolean;
  inventoryWidth: number;
  assistantWidth: number;
}

// Full state shape:
{
  activeMode: 'design' | 'wiring' | 'debug';
  isInventoryOpen: boolean;
  inventoryPinned: boolean;
  inventoryWidth: number;           // Clamped to [280, 520]
  isAssistantOpen: boolean;
  assistantPinned: boolean;
  assistantWidth: number;           // Clamped to [300, 560]
  isSettingsOpen: boolean;
  settingsInitialTab: 'api' | 'profile' | 'ai' | 'layout' | 'dev' | 'config' | 'diagnostics' | 'locale';
  isFocusMode: boolean;
  activeSidebar: 'inventory' | 'assistant' | 'none';
  lowPerformanceMode: boolean;
  neuralLinkEnabled: boolean;
  inventoryDefaultWidth: 360;       // Constant
  assistantDefaultWidth: 380;       // Constant
}
```

**Mode switching**: When `setActiveMode` is called, the current layout state is snapshot-saved to `cm_layout_snapshot_{mode}` and the new mode's snapshot is loaded (or defaults applied).

### 8.2 DiagramContext State (Undo/Redo)

```typescript
interface HistoryState {
  past: WiringDiagram[];      // Stack of previous states
  present: WiringDiagram | null;  // Current diagram
  future: WiringDiagram[];    // Stack of undone states (for redo)
}
```

`updateDiagram()` pushes the current `present` onto `past` and clears `future`. `undo()` pops from `past`, `redo()` pops from `future`.

### 8.3 SelectionContext State

```typescript
{
  selectedComponentId: string | null;    // ID of the selected canvas component
  activeSelectionPath: string | undefined; // Drill-down path, e.g. "esp32-1.pins.GPIO13"
}
```

### 8.4 AssistantStateContext State

```typescript
{
  generationMode: 'chat' | 'image' | 'video';
  imageSize: '1K' | '2K' | '4K';
  aspectRatio: string;               // e.g. "16:9"
  useDeepThinking: boolean;
  recentHistory: ActionDelta[];      // Ring buffer of last 10 actions
}
```

### 8.5 HealthContext State

```typescript
interface HealthMetrics {
  fps: number;            // Measured via requestAnimationFrame loop
  memoryUsed: number;     // MB, from performance.memory (Chrome only)
  memoryLimit: number;    // MB, from performance.memory
  aiLatency: number;      // ms, last recorded AI request latency
  status: 'healthy' | 'warning' | 'critical';
}
```

**Status thresholds**:
- `warning`: FPS < 30 OR memory usage > 80%
- `critical`: FPS < 15 OR memory usage > 95%

**Auto-degradation**: If FPS < 25 for 5 consecutive seconds, `lowPerformanceMode` is enabled automatically.

### 8.6 HUDContext State

```typescript
interface HUDFragment {
  id: string;
  targetId: string;                    // Component or Pin ID to anchor to
  type: 'info' | 'warning' | 'tip';
  content: string;                     // Markdown content
  position: { x: number; y: number };  // Canvas coordinates
  priority: number;                    // 1 = persistent, 2+ = auto-dismiss after 5s
}

// State: HUDFragment[] + isVisible: boolean
```

### 8.7 NotificationContext State

```typescript
interface AppNotification {
  id: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;           // Auto-dismiss time in ms (default: 5000, 0 = persistent)
  action?: {
    label: string;
    onClick: () => void;
  };
  linkedObjectId?: string;     // Reference to related object
}

// State: { notifications: AppNotification[], history: AppNotification[] }
// History capped at 100 entries
```

### 8.8 DashboardContext State

```typescript
interface WidgetLayout {
  i: string;    // Widget ID (must match DashboardWidget.id)
  x: number;    // Grid column
  y: number;    // Grid row
  w: number;    // Width in grid units
  h: number;    // Height in grid units
}

interface DashboardWidget {
  id: string;
  type: string;        // Widget type identifier (e.g. "vitals", "terminal")
  layout: WidgetLayout;
  props?: any;         // Widget-specific configuration
}

// Default widgets: vitals (4x2) and terminal (8x4)
```

### 8.9 MacroContext State

```typescript
interface WorkflowStep {
  id: string;
  action: ActionIntent;
  description: string;
  delay?: number;       // Milliseconds between steps
}

interface MacroWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  author: 'user' | 'ai' | 'system';
  created: number;      // Timestamp
}

// State: { isRecording, recordedSteps: WorkflowStep[], savedMacros: MacroWorkflow[] }
```

### 8.10 SimulationContext State

```typescript
interface SimNodeState {
  voltage: number;
  current: number;
  logicState: 'HIGH' | 'LOW' | 'FLOATING' | 'ERROR';
}

interface SimulationResult {
  pinStates: Record<string, SimNodeState>;  // Key: "componentId:pin"
  isShortCircuit: boolean;
  warnings: string[];
}

// State: { result: SimulationResult | null, isSimulating: boolean }
// Simulation runs at 2Hz (every 500ms) when active
// Also runs a single tick on every diagram change
```

### 8.11 TelemetryContext State

```typescript
interface TelemetryPacket {
  componentId: string;               // Source component or "auto"
  pin?: string;                      // Pin identifier
  value: string | number | boolean;  // Sensor/output value
  unit?: string;                     // Unit label (e.g. "C", "V")
  timestamp: number;
}

// State: {
//   liveData: Record<string, TelemetryPacket>,  // Key: "compId:pin"
//   isConnected: boolean,
//   rawLogs: string[]   // Last 500 serial log lines, formatted as "[HH:MM:SS] line"
// }
```

**Serial protocol parsing** supports three formats:
- `COMP_ID:PIN:VALUE` (3 parts, colon-separated)
- `PIN:VALUE` (2 parts, colon-separated; componentId defaults to `"auto"`)
- `KEY=VALUE` (equals-separated; componentId defaults to `"auto"`)

### 8.12 TutorialContext State

```typescript
interface TutorialStep {
  id: string;
  title: string;
  instructions: string;          // Markdown instructions
  mentorTip?: string;            // Optional tip from the AI mentor
  targetElementId?: string;      // DOM element to highlight
  condition: (state: { diagram: WiringDiagram | null; inventory: ElectronicComponent[] }) => boolean;
}

interface TutorialQuest {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  steps: TutorialStep[];
}

// State: { activeQuest, currentStepIndex, completedSteps: string[] }
```

**Auto-validation**: When a quest is active, the provider runs `validateStep()` on every diagram/inventory change. When a step's condition returns true, it auto-advances after 800ms.

### 8.13 VoiceAssistantContext State

```typescript
{
  isRecording: boolean;
  isProcessingAudio: boolean;
  loadingText: string;                  // "Transcribing...", "Thinking..."
  isLiveActive: boolean;                // Live audio streaming mode
  liveStatus: string;                   // "disconnected", "connected", "error"
  lastTranscription: string | null;     // Most recent transcription result
}
```

**Critical pattern**: `liveSessionRef` uses `useRef`, NOT `useState`. This avoids re-renders on every WebSocket state change.

---

## 9. Engineering Metrics Data

### 9.1 AIMetric

```typescript
interface AIMetric {
  id: string;                     // crypto.randomUUID()
  timestamp: number;
  model: string;                  // Gemini model used (e.g. "gemini-2.5-flash")
  operation: string;              // Operation type (e.g. "chat", "wiring", "image")
  latencyMs: number;              // Request duration in milliseconds
  success: boolean;
  userSatisfaction?: number;      // 1-5 rating from user feedback
  error?: string;                 // Error message when success=false
}
```

**Storage**: `localStorage` key `cm_ai_metrics`, capped at 1000 entries (oldest removed when exceeded).

### 9.2 EngineeringEvent

```typescript
interface EngineeringEvent {
  id: string;
  timestamp: number;
  type: 'action_execute' | 'diagram_update' | 'ai_suggestion_accept' | 'ai_suggestion_reject' | 'checkpoint_created';
  payload: Record<string, unknown>;
}
```

**Storage**: `localStorage` key `cm_eng_events`, capped at 1000 entries.

---

## 10. Inventory-Diagram Sync Pipeline

This is the most critical data flow in the application.

### 10.1 Write Path (Inventory Change)

```
User edits component in inventory
  -> InventoryContext.updateItem(updated)
  -> useEffect persists to localStorage cm_inventory
  -> useInventorySync detects change via JSON snapshot comparison
  -> syncDiagramWithInventory() copies name, type, pins, description
  -> DiagramContext.updateDiagram(syncedDiagram)
  -> useEffect persists to localStorage cm_autosave
```

### 10.2 Read Path (Application Load)

```
App mounts
  -> InventoryContext loads from localStorage cm_inventory (or INITIAL_INVENTORY fallback)
  -> DiagramContext loads from localStorage cm_autosave
  -> DiagramContext runs migrateLegacyDiagram() once (gated by useRef flag)
  -> useInventorySync runs initial sync (no debounce on first run)
  -> Subsequent inventory changes trigger debounced sync (300ms default)
```

### 10.3 Debouncing

- **First sync after mount**: Immediate (no debounce)
- **Subsequent syncs**: 300ms debounce (configurable via `debounceMs` option)
- **Dev validation**: 500ms delay after diagram changes (development mode only)
- **Inventory snapshot comparison**: JSON.stringify of `{ id, name, type, pins }` per item, compared by string equality to avoid unnecessary syncs

---

## 11. Separate IndexedDB Databases

The application uses two separate IndexedDB databases:

| Database | Version | Stores | Purpose |
|----------|---------|--------|---------|
| `CircuitMindDB` | 3 | `inventory`, `app_state`, `action_history`, `conversations`, `messages`, `parts` | Primary application data |
| `CircuitMindProfiles` | 1 | `profiles` | User profiles and preferences |

This separation means profile data is isolated from application data and survives a `CircuitMindDB` reset.

---

## 12. Data Migration Patterns

### 12.1 Legacy ID Migration

The `LEGACY_ID_MAP` in `componentValidator.ts` handles old-format component IDs (e.g., `"mcu"` to `"mcu-arduino-uno-r3"`). Migration runs once per app load via `DiagramContext`.

### 12.2 Message Format Migration

The `migrateMessage()` function in `hooks/useConversations.ts` converts old `ChatMessage` objects to `EnhancedChatMessage` by adding:
- `conversationId` (required parameter)
- `linkedComponents: []`
- `suggestedActions: []`
- Preserving all original fields

### 12.3 IndexedDB Schema Versioning

The DB version is currently `3`. The `onupgradeneeded` handler is additive only -- it creates stores that do not yet exist using `if (!db.objectStoreNames.contains(...))` guards. No stores are ever deleted or restructured.

### 12.4 No Explicit Version Tracking

There is no application-level data version field on stored objects. Backwards compatibility is handled by optional fields (TypeScript `?` marker) and the additive migration approach. Missing fields resolve to `undefined` at read time and are handled gracefully by consuming code.

---

## 13. Global Window Extensions

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

This supports Google AI Studio integration for API key selection when the app is running within the AI Studio environment.
