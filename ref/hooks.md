# CircuitMind AI - Hooks Reference

Custom React hooks for state management and business logic. **40 hooks** in `hooks/` plus **6 action handler files** in `hooks/actions/`.

## Hook Directory

```
hooks/
├── actions/                    # Action handler registry
│   ├── index.ts               # Handler registry + getHandler()
│   ├── types.ts               # ActionHandler type definitions
│   ├── canvasHandlers.ts      # highlight, centerOn, zoomTo, panTo, resetView, highlightWire
│   ├── navHandlers.ts         # openInventory, closeInventory, openSettings, closeSettings, openComponentEditor, switchGenerationMode
│   ├── diagramHandlers.ts     # addComponent, removeComponent, clearCanvas, createConnection, removeConnection
│   └── appControlHandlers.ts  # undo, redo, saveDiagram, loadDiagram, setUserLevel, learnFact, analyzeVisuals
│
├── __tests__/                 # Hook tests
│
├── useAIActions.ts            # Action dispatch hub (250 LOC)
├── useAIContextBuilder.ts     # Builds AI context from app state
├── useActionHistory.ts        # Action history for undo support
├── useAutonomySettings.ts     # AI action safety classifications
├── useCanvasExport.ts         # Canvas export (PNG/SVG/PDF)
├── useCanvasHighlights.ts     # Canvas highlight state management
├── useCanvasHUD.ts            # Canvas HUD state
├── useCanvasInteraction.ts    # Canvas drag/drop/select interactions
├── useCanvasLayout.ts         # Canvas layout and positioning
├── useCanvasWiring.ts         # Wire drawing and editing
├── useChatHandler.ts          # Chat message sending and receiving
├── useClickOutside.ts         # Click outside detection
├── useConnectivity.ts         # Online/offline connectivity state
├── useConversations.ts        # Conversation CRUD + IndexedDB (349 LOC)
├── useDiagram3DScene.ts       # Three.js scene management
├── useDiagram3DSync.ts        # 3D diagram sync with 2D state
├── useDiagram3DTelemetry.ts   # 3D performance telemetry
├── useEditorAIChat.ts         # Component editor AI chat
├── useEditorFormState.ts      # Component editor form state
├── useEditorModalHandlers.ts  # Component editor modal handlers
├── useFocusTrap.ts            # Focus trap for modals
├── useGestureTracking.ts      # MediaPipe gesture tracking
├── useHoverBehavior.ts        # Hover delay and behavior
├── useInventoryApi.ts         # Server-backed inventory API calls
├── useInventorySync.ts        # Inventory-diagram auto-sync (444 LOC)
├── useKeyboardShortcuts.ts    # Global keyboard shortcuts
├── useMainLayoutActions.ts    # MainLayout action handlers
├── useNeuralLink.ts           # Neural link AI feedback
├── useNeuralLinkEffects.ts    # Neural link visual effects
├── useOfflineSync.ts          # Offline sync queue
├── usePermissions.ts          # Permission checking
├── useResizeHandler.ts        # Window/panel resize handler
├── useSearchIndex.ts          # Full-text search indexing
├── useSecurityAudit.ts        # Client-side security auditing
├── useSync.ts                 # Yjs CRDT sync
├── useToast.tsx               # Toast notification system (provides ToastProvider)
├── useVoiceRecorder.ts        # Voice recording
└── useWebcam.ts               # Webcam capture
```

---

## Core Hooks

### useConversations (349 LOC)

**Location**: `hooks/useConversations.ts`

Manages chat conversations with IndexedDB persistence.

```typescript
interface UseConversationsReturn {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: EnhancedChatMessage[];
  isLoading: boolean;
  createConversation: (title?: string) => Promise<string>;
  switchConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  addMessage: (message: EnhancedChatMessage) => Promise<void>;
  updateMessage: (id: string, updates: Partial<EnhancedChatMessage>) => Promise<void>;
  clearMessages: () => Promise<void>;
}
```

---

### useAIActions (250 LOC)

**Location**: `hooks/useAIActions.ts`

Dispatches AI-suggested actions with safety checks. Routes actions to handlers in `hooks/actions/`.

```typescript
interface UseAIActionsReturn {
  execute: (action: ActionIntent) => Promise<ActionResult>;
  pendingActions: ActionIntent[];
  confirmAction: (id: string) => Promise<void>;
  rejectAction: (id: string) => void;
  clearPending: () => void;
}
```

### Action Routing (from hooks/actions/index.ts)

| Action Type | Handler File | Safety |
|-------------|-------------|--------|
| highlight, centerOn, zoomTo, panTo, resetView, highlightWire | `canvasHandlers.ts` | Safe |
| openInventory, closeInventory, openSettings, closeSettings, openComponentEditor, switchGenerationMode | `navHandlers.ts` | Safe |
| addComponent, removeComponent, clearCanvas, createConnection, removeConnection | `diagramHandlers.ts` | Unsafe |
| undo, redo, saveDiagram, loadDiagram | `appControlHandlers.ts` | Mixed |
| setUserLevel, learnFact, analyzeVisuals | `appControlHandlers.ts` | Safe |

---

### useInventorySync (444 LOC)

**Location**: `hooks/useInventorySync.ts`

Automatically syncs diagram components with inventory changes. Inventory is the **single source of truth**.

```typescript
interface UseInventorySyncOptions {
  inventory: ElectronicComponent[];
  diagram: WiringDiagram | null;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
}

// No return value - works via side effects
```

---

### useAutonomySettings

**Location**: `hooks/useAutonomySettings.ts`

Manages AI action safety classifications. Users can override default safe/unsafe settings.

```typescript
interface UseAutonomySettingsReturn {
  settings: AIAutonomySettings;
  isSafe: (actionType: ActionType) => boolean;
  markAsSafe: (actionType: ActionType) => void;
  markAsUnsafe: (actionType: ActionType) => void;
  resetToDefaults: () => void;
}
```

**Persistence**: `localStorage.cm_ai_autonomy`

---

### useToast

**Location**: `hooks/useToast.tsx`

Lightweight toast notification system. Also exports `ToastProvider` (context provider #6 in App.tsx).

```typescript
interface UseToastReturn {
  toasts: Toast[];
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
```

---

### useActionHistory

**Location**: `hooks/useActionHistory.ts`

Tracks action history for undo support via IndexedDB.

---

## Canvas Hooks (Extracted from DiagramCanvas)

These hooks were extracted from the original monolithic DiagramCanvas.tsx during refactoring:

| Hook | Purpose |
|------|---------|
| `useCanvasInteraction.ts` | Drag/drop, selection, pan/zoom interactions |
| `useCanvasLayout.ts` | Component positioning and layout |
| `useCanvasWiring.ts` | Wire drawing and editing |
| `useCanvasHighlights.ts` | Highlight state management |
| `useCanvasHUD.ts` | Canvas heads-up display state |
| `useCanvasExport.ts` | Canvas export (PNG/SVG/PDF) |

---

## 3D Hooks

| Hook | Purpose |
|------|---------|
| `useDiagram3DScene.ts` | Three.js scene lifecycle management |
| `useDiagram3DSync.ts` | Sync 3D view with 2D diagram state |
| `useDiagram3DTelemetry.ts` | 3D rendering performance telemetry |

---

## Editor Hooks

| Hook | Purpose |
|------|---------|
| `useEditorFormState.ts` | Component editor form field state |
| `useEditorAIChat.ts` | AI chat within the component editor |
| `useEditorModalHandlers.ts` | Modal open/close/save handlers |

---

## AI/ML Hooks

| Hook | Purpose |
|------|---------|
| `useAIContextBuilder.ts` | Builds `AIContext` from current app state for Gemini |
| `useChatHandler.ts` | Handles chat message sending/receiving with Gemini |
| `useNeuralLink.ts` | Neural link AI feedback system |
| `useNeuralLinkEffects.ts` | Visual effects for neural link |
| `useGestureTracking.ts` | MediaPipe gesture recognition |

---

## Infrastructure Hooks

| Hook | Purpose |
|------|---------|
| `useClickOutside.ts` | Detect clicks outside a ref element |
| `useFocusTrap.ts` | Trap keyboard focus within modals |
| `useKeyboardShortcuts.ts` | Global keyboard shortcut registration |
| `useResizeHandler.ts` | Window and panel resize handling |
| `useHoverBehavior.ts` | Hover delay and behavior control |
| `useConnectivity.ts` | Online/offline connectivity detection |
| `usePermissions.ts` | Permission checking for actions |

---

## Data/Sync Hooks

| Hook | Purpose |
|------|---------|
| `useInventoryApi.ts` | Server-backed inventory CRUD via REST API |
| `useSearchIndex.ts` | Full-text search index (MiniSearch) |
| `useSync.ts` | Yjs CRDT real-time sync |
| `useOfflineSync.ts` | Offline operation queue |
| `useSecurityAudit.ts` | Client-side security auditing |

---

## Media Hooks

| Hook | Purpose |
|------|---------|
| `useVoiceRecorder.ts` | Voice recording and audio capture |
| `useWebcam.ts` | Webcam capture for component identification |

---

## Layout Hook

| Hook | Purpose |
|------|---------|
| `useMainLayoutActions.ts` | MainLayout action routing and coordination |

---

## Action Handler Interface

```typescript
// hooks/actions/types.ts
interface ActionContext {
  canvasRef: RefObject<DiagramCanvasRef>;
  diagram: WiringDiagram | null;
  inventory: ElectronicComponent[];
  onDiagramUpdate: (diagram: WiringDiagram) => void;
  onOpenInventory?: () => void;
  onOpenSettings?: () => void;
}

type ActionHandler<T = unknown> = (
  action: ActionIntent,
  context: ActionContext
) => Promise<ActionResult>;

interface ActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
}
```

### Registry Pattern

```typescript
// hooks/actions/index.ts
import * as canvas from './canvasHandlers';
import * as nav from './navHandlers';
import * as diagram from './diagramHandlers';
import * as app from './appControlHandlers';

export const actionHandlers: Partial<Record<ActionType, ActionHandler<any>>> = {
  highlight: canvas.highlight,
  centerOn: canvas.centerOn,
  zoomTo: canvas.zoomTo,
  panTo: canvas.panTo,
  resetView: canvas.resetView,
  highlightWire: canvas.highlightWire,
  openInventory: nav.openInventory,
  closeInventory: nav.closeInventory,
  openSettings: nav.openSettings,
  closeSettings: nav.closeSettings,
  openComponentEditor: nav.openComponentEditor,
  switchGenerationMode: nav.switchGenerationMode,
  addComponent: diagram.addComponent,
  removeComponent: diagram.removeComponent,
  clearCanvas: diagram.clearCanvas,
  createConnection: diagram.createConnection,
  removeConnection: diagram.removeConnection,
  undo: app.handleUndo,
  redo: app.handleRedo,
  saveDiagram: app.handleSaveDiagram,
  loadDiagram: app.handleLoadDiagram,
  setUserLevel: app.handleSetUserLevel,
  learnFact: app.handleLearnFact,
  analyzeVisuals: app.handleAnalyzeVisuals,
};

export function getHandler(type: ActionType): ActionHandler<unknown> | undefined {
  return actionHandlers[type] as ActionHandler<unknown> | undefined;
}
```
