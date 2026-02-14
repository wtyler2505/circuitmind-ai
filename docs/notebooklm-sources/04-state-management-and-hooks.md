# 04 -- State Management, Hooks, and Action System

> Source of truth for how CircuitMind AI manages application state. Covers all 17 React Context providers, 24+ custom hooks, the action handler registry, undo/redo, persistence patterns, and the inventory-to-diagram sync lifecycle.

---

## Table of Contents

1. [State Architecture Overview](#1-state-architecture-overview)
2. [Context Provider Catalog (All 17)](#2-context-provider-catalog)
3. [Custom Hooks Catalog (All 24)](#3-custom-hooks-catalog)
4. [Action Handler Registry](#4-action-handler-registry)
5. [Undo/Redo System](#5-undoredo-system)
6. [AI Autonomy and Action Safety](#6-ai-autonomy-and-action-safety)
7. [Inventory-Diagram Sync Lifecycle](#7-inventorydiagram-sync-lifecycle)
8. [State Persistence Patterns](#8-state-persistence-patterns)
9. [Canvas State Machine](#9-canvas-state-machine)
10. [Cross-Cutting Concerns](#10-cross-cutting-concerns)

---

## 1. State Architecture Overview

CircuitMind AI uses **React Context API** exclusively -- there is no Redux, Zustand, Jotai, or any external state library. State is distributed across 17 domain-specific context providers that nest in a load-bearing order inside `App.tsx`. Changing the nesting order can cause runtime errors because downstream contexts depend on upstream ones being initialized first.

### Provider Nesting Order (from App.tsx, outermost to innermost)

```
LayoutProvider
  AssistantStateProvider
    HealthProvider
      AuthProvider
        UserProvider
          NotificationProvider
            DashboardProvider
              MacroProvider
                InventoryProvider          <-- Source of truth for components
                  ConversationProvider
                    DiagramProvider         <-- Depends on InventoryProvider
                      SelectionProvider
                        TelemetryProvider
                          HUDProvider
                            SimulationProvider
                              VoiceAssistantProvider
                                TutorialProvider
```

**Why nesting order matters:** DiagramProvider must be inside InventoryProvider because the `useInventorySync` hook (used in `MainLayout`) reads from both contexts and syncs changes from inventory into the diagram. If inventory is not available when diagram mounts, the sync breaks.

### State Categories

| Category | Contexts | Persistence |
|----------|----------|-------------|
| UI Layout | LayoutContext | localStorage |
| AI Configuration | AssistantStateContext | localStorage |
| System Health | HealthContext | None (ephemeral) |
| Auth/User | AuthContext, UserContext | localStorage + service |
| Notifications | NotificationContext | None (ephemeral) |
| Dashboard | DashboardContext | localStorage |
| Macros | MacroContext | localStorage |
| Data (Core) | InventoryContext, DiagramContext, ConversationContext | localStorage + IndexedDB |
| Selection | SelectionContext | None (ephemeral) |
| Analytics | TelemetryContext | Batched to service |
| HUD | HUDContext | None (ephemeral) |
| Simulation | SimulationContext | None (ephemeral) |
| Voice | VoiceAssistantContext | None (refs) |
| Tutorial | TutorialContext | localStorage |

---

## 2. Context Provider Catalog

### 2.1 LayoutContext

**File:** `contexts/LayoutContext.tsx`
**Consumer hook:** `useLayout()`
**Purpose:** Controls all UI layout state -- sidebar visibility, pinning, widths, UI mode, focus mode, performance mode, neural link toggle.

**State Shape:**

```typescript
interface LayoutContextType {
  // Mode
  activeMode: UIMode;                    // 'design' | 'wiring' | 'debug'
  setActiveMode: (mode: UIMode) => void;

  // Inventory Sidebar
  isInventoryOpen: boolean;
  setInventoryOpen: (open: boolean) => void;
  inventoryPinned: boolean;
  setInventoryPinned: (pinned: boolean) => void;
  inventoryWidth: number;                // Range: 280-520px
  setInventoryWidth: (width: number) => void;

  // Assistant Sidebar
  isAssistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  assistantPinned: boolean;
  setAssistantPinned: (pinned: boolean) => void;
  assistantWidth: number;                // Range: 300-560px
  setAssistantWidth: (width: number) => void;

  // Settings
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  settingsInitialTab: 'api' | 'profile' | 'ai' | 'layout' | 'dev' | 'config' | 'diagnostics' | 'locale';
  setSettingsInitialTab: (tab: ...) => void;

  // Focus Mode
  isFocusMode: boolean;
  setFocusMode: (focus: boolean) => void;

  // Active Sidebar
  activeSidebar: 'inventory' | 'assistant' | 'none';
  setActiveSidebar: (sidebar: ...) => void;

  // Performance Mode
  lowPerformanceMode: boolean;
  setLowPerformanceMode: (enabled: boolean) => void;

  // Neural Link (Gesture Control)
  neuralLinkEnabled: boolean;
  setNeuralLinkEnabled: (enabled: boolean) => void;

  // Constants
  inventoryDefaultWidth: number;         // 360
  assistantDefaultWidth: number;         // 380
}
```

**Initialization:** All layout values are hydrated from localStorage on mount. Keys used: `cm_active_mode`, `cm_inventory_open_default`, `cm_inventory_pinned_default`, `cm_inventory_width`, `cm_assistant_open_default`, `cm_assistant_pinned_default`, `cm_assistant_width`, `cm_low_performance_mode`, `cm_neural_link_enabled`.

**Mode Switching:** When `setActiveMode` is called, the current layout is snapshot-saved to `cm_layout_snapshot_{currentMode}`, then the target mode's snapshot is restored (or defaults applied). This means switching from "design" to "wiring" and back preserves each mode's sidebar arrangement.

**Side Effects:**
- Adds CSS class `mode-{design|wiring|debug}` to `document.body`
- Adds/removes `low-performance` class to `document.body`
- All state changes persisted to localStorage via `storageService.setItem()`

---

### 2.2 AssistantStateContext

**File:** `contexts/AssistantStateContext.tsx`
**Consumer hook:** `useAssistantState()`
**Purpose:** Controls AI generation mode, image size settings, aspect ratio, and deep thinking toggle.

**State Shape:**

```typescript
interface AssistantStateContextType {
  generationMode: 'chat' | 'image' | 'video';
  setGenerationMode: (mode: 'chat' | 'image' | 'video') => void;
  imageSize: '1K' | '2K' | '4K';
  setImageSize: (size: '1K' | '2K' | '4K') => void;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  setAspectRatio: (ratio: string) => void;
  useDeepThinking: boolean;
  setUseDeepThinking: (enabled: boolean) => void;
}
```

**Persistence:** `generationMode` persisted to `cm_generation_mode`, `useDeepThinking` to `cm_deep_thinking`. Image size and aspect ratio are session-only.

---

### 2.3 HealthContext

**File:** `contexts/HealthContext.tsx`
**Consumer hook:** `useHealth()`
**Purpose:** Monitors system health metrics -- CPU pressure, memory usage, frame rate. Used by the TacticalHUD overlay and low-performance mode toggle.

**State Shape:**

```typescript
interface HealthContextType {
  cpuPressure: number;           // 0-100, from Performance Observer API
  memoryUsageMB: number;         // From performance.memory (Chrome-only)
  frameRate: number;             // Measured via requestAnimationFrame
  isHealthy: boolean;            // Derived: all metrics within thresholds
}
```

**Initialization:** Uses `PerformanceObserver` API for CPU pressure. Memory polled from `performance.memory` (Chrome extension). Frame rate computed from a rolling `requestAnimationFrame` counter. All ephemeral -- no persistence.

---

### 2.4 AuthContext

**File:** `contexts/AuthContext.tsx`
**Consumer hook:** `useAuth()`
**Purpose:** Authentication state and session management.

**State Shape:**

```typescript
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

**Persistence:** Auth tokens stored via `authService` which uses localStorage under `cm_auth_token` and `cm_refresh_token`. Session refresh runs on mount and periodically.

---

### 2.5 UserContext

**File:** `contexts/UserContext.tsx`
**Consumer hook:** `useUser()`
**Purpose:** User profile preferences -- experience level, preferred units, theme, locale.

**State Shape:**

```typescript
interface UserContextType {
  profile: UserProfile | null;
  experienceLevel: 'beginner' | 'intermediate' | 'pro';
  setExperienceLevel: (level: string) => void;
  preferredUnits: 'metric' | 'imperial';
  setPreferredUnits: (units: string) => void;
  locale: string;
  setLocale: (locale: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}
```

**Persistence:** Stored via `userProfileService` which persists to localStorage under `cm_user_profile`.

---

### 2.6 NotificationContext

**File:** `contexts/NotificationContext.tsx`
**Consumer hook:** `useNotifications()`
**Purpose:** Toast/alert notification system. Provides `toast.info()`, `toast.success()`, `toast.error()`, `toast.warning()` methods.

**State Shape:**

```typescript
interface NotificationContextType {
  notifications: Toast[];
  addNotification: (toast: Omit<Toast, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

interface Toast {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;        // ms, 0 = persistent
  action?: { label: string; onClick: () => void };
}
```

**Persistence:** None -- toasts are ephemeral and auto-dismiss after their duration.

---

### 2.7 DashboardContext

**File:** `contexts/DashboardContext.tsx`
**Consumer hook:** `useDashboard()`
**Purpose:** Manages the dashboard view widget grid layout -- which widgets are visible, their positions, and sizes.

**State Shape:**

```typescript
interface DashboardContextType {
  isDashboardVisible: boolean;
  setIsDashboardVisible: (visible: boolean) => void;
  widgets: DashboardWidget[];
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  addWidget: (widget: DashboardWidget) => void;
  removeWidget: (id: string) => void;
  resetLayout: () => void;
}
```

**Persistence:** Widget layout saved to `cm_dashboard_layout` in localStorage.

---

### 2.8 MacroContext

**File:** `contexts/MacroContext.tsx`
**Consumer hook:** `useMacros()`
**Purpose:** Records and plays back sequences of user actions as macros.

**State Shape:**

```typescript
interface MacroContextType {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => string;        // Returns macro ID
  playMacro: (id: string) => Promise<void>;
  macros: MacroDefinition[];
  deleteMacro: (id: string) => void;
  renameMacro: (id: string, name: string) => void;
}

interface MacroDefinition {
  id: string;
  name: string;
  steps: MacroStep[];
  createdAt: number;
}
```

**Persistence:** Macros stored in `cm_macros` localStorage key. Recording state is ephemeral.

---

### 2.9 InventoryContext (SOURCE OF TRUTH)

**File:** `contexts/InventoryContext.tsx`
**Consumer hook:** `useInventory()`
**Purpose:** The single source of truth for the component library. ALL component data flows from here. Diagram components are copies that sync back from this context.

**State Shape:**

```typescript
interface InventoryContextType {
  inventory: ElectronicComponent[];
  setInventory: React.Dispatch<React.SetStateAction<ElectronicComponent[]>>;
  updateItem: (component: ElectronicComponent) => void;
  removeItem: (id: string) => void;
  addItem: (component: ElectronicComponent) => void;
  importInventory: (components: ElectronicComponent[]) => void;
  isLoading: boolean;
}
```

**Initialization:** On mount, loads from `localStorage.cm_inventory`. If empty, falls back to IndexedDB `INVENTORY` store. If both empty, loads default components from `data/initialInventory.ts`.

**Persistence (Dual-Layer):**
- **localStorage:** `cm_inventory` -- written on every state change via `useEffect`
- **IndexedDB:** `INVENTORY` store -- written as backup, used for quota-exceeded fallback

**The `updateItem` function** performs a shallow merge: finds the component by ID and replaces it. This triggers `useInventorySync` in consuming components which propagates the change to the diagram.

---

### 2.10 ConversationContext

**File:** `contexts/ConversationContext.tsx`
**Consumer hook:** `useConversation()`
**Purpose:** Wraps `useConversations` hook to provide conversation CRUD operations and message persistence.

**State Shape:**

```typescript
interface ConversationContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: EnhancedChatMessage[];
  createConversation: (title?: string) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  switchConversation: (id: string) => Promise<void>;
  addMessage: (msg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'>) => Promise<EnhancedChatMessage>;
  updateMessage: (id: string, updates: Partial<EnhancedChatMessage>) => void;
  isLoading: boolean;
}
```

**Persistence:** Conversations stored in IndexedDB `CONVERSATIONS` store. Messages stored in IndexedDB `MESSAGES` store. Active conversation ID stored in `localStorage.cm_active_conversation`.

---

### 2.11 DiagramContext

**File:** `contexts/DiagramContext.tsx`
**Consumer hook:** `useDiagram()`
**Purpose:** Manages the active wiring diagram state, including components, connections, and undo/redo history.

**State Shape:**

```typescript
interface DiagramContextType {
  diagram: WiringDiagram | null;
  updateDiagram: (diagram: WiringDiagram) => void;
  clearDiagram: () => void;
  isLoading: boolean;
  // Undo/Redo (from useActionHistory)
  canUndo: boolean;
  undo: () => Promise<void>;
  actionHistory: ActionResult[];
  recordUndo: (record: ActionRecord) => Promise<void>;
}
```

**The `WiringDiagram` type:**

```typescript
interface WiringDiagram {
  id: string;
  title: string;
  description: string;
  components: ElectronicComponent[];    // Deep copies from inventory
  connections: WireConnection[];
}

interface WireConnection {
  fromComponentId: string;
  fromPin: string;
  toComponentId: string;
  toPin: string;
  description: string;
  color: string;
}
```

**Persistence:** `cm_autosave` in localStorage. Autosave runs on every `updateDiagram` call via `useEffect`.

**Undo system:** Uses `useActionHistory` hook internally. Each mutation creates an `ActionRecord` with `snapshotBefore` (full diagram state before mutation). Undo replaces the diagram with `snapshotBefore`. Stack kept in-memory via `useRef<ActionRecord[]>`.

---

### 2.12 SelectionContext

**File:** `contexts/SelectionContext.tsx`
**Consumer hook:** `useSelection()`
**Purpose:** Tracks which component or selection path is currently active on the canvas. Used by HUD, canvas highlights, and context menus.

**State Shape:**

```typescript
interface SelectionContextType {
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  activeSelectionPath: string | undefined;      // e.g., "esp32-1.pins.GPIO13"
  setActiveSelectionPath: (path: string | undefined) => void;
  selectedComponentIds: string[];               // Multi-select
  toggleMultiSelect: (id: string) => void;
  clearMultiSelect: () => void;
}
```

**Persistence:** None -- ephemeral. Selection is purely UI state that resets on page reload.

---

### 2.13 TelemetryContext

**File:** `contexts/TelemetryContext.tsx`
**Consumer hook:** `useTelemetry()`
**Purpose:** Event tracking and analytics collection. Batches events and sends to analytics service.

**State Shape:**

```typescript
interface TelemetryContextType {
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  trackError: (error: Error, context?: string) => void;
  trackTiming: (name: string, durationMs: number) => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}
```

**Persistence:** Events batched in memory, flushed to `analyticsService` periodically. Telemetry enabled/disabled flag stored in `cm_telemetry_enabled`.

---

### 2.14 HUDContext

**File:** `contexts/HUDContext.tsx`
**Consumer hook:** `useHUD()`
**Purpose:** Manages heads-up display fragments -- floating information panels that appear on the canvas during hover, security warnings, and AI suggestions.

**State Shape:**

```typescript
interface HUDFragment {
  id: string;
  targetId: string;               // Component/pin the fragment points to
  type: 'info' | 'tip' | 'warning' | 'action';
  content: string;
  position: { x: number; y: number };
  priority: number;               // 1 = high, 3 = low
}

interface HUDContextType {
  fragments: HUDFragment[];
  addFragment: (fragment: Omit<HUDFragment, 'id'> & { id?: string }) => string;
  removeFragment: (id: string) => void;
  clearFragments: () => void;
  isHUDVisible: boolean;
  setHUDVisible: (visible: boolean) => void;
}
```

**Persistence:** None -- fragments are ephemeral. HUD visibility toggle stored in `cm_hud_visible`.

---

### 2.15 SimulationContext

**File:** `contexts/SimulationContext.tsx`
**Consumer hook:** `useSimulation()`
**Purpose:** Circuit simulation state -- running/stopped, live data from simulated components, simulation parameters.

**State Shape:**

```typescript
interface SimulationContextType {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  liveData: Record<string, { value: string | number | boolean }>;
  updateLiveData: (key: string, value: { value: string | number | boolean }) => void;
  simulationSpeed: number;                  // 0.1x to 10x
  setSimulationSpeed: (speed: number) => void;
  stepCount: number;
}
```

**Persistence:** None -- simulation state is fully ephemeral. Resets on page reload.

---

### 2.16 VoiceAssistantContext

**File:** `contexts/VoiceAssistantContext.tsx`
**Consumer hook:** `useVoiceAssistant()`
**Purpose:** Voice I/O for live audio mode using Gemini's real-time audio API. Manages microphone capture, WebSocket connection, and audio playback.

**State Shape:**

```typescript
interface VoiceAssistantContextType {
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  isConnected: boolean;
  transcript: string;
  isSpeaking: boolean;
  error: string | null;
}
```

**Critical implementation detail:** The WebSocket connection (`liveSessionRef`) uses `useRef`, NOT `useState`. This avoids re-render loops when the WebSocket reference changes. This is a documented pitfall in the project.

**Persistence:** None -- voice state is fully ephemeral.

---

### 2.17 TutorialContext

**File:** `contexts/TutorialContext.tsx`
**Consumer hook:** `useTutorial()`
**Purpose:** Tutorial progression system -- tracks which tutorial steps the user has completed and manages step-by-step onboarding flows.

**State Shape:**

```typescript
interface TutorialContextType {
  activeTutorial: string | null;
  currentStep: number;
  totalSteps: number;
  startTutorial: (tutorialId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
  completedTutorials: string[];
  isStepHighlighted: (elementId: string) => boolean;
}
```

**Persistence:** Completed tutorial IDs stored in `cm_tutorials_completed` localStorage key.

---

## 3. Custom Hooks Catalog

### 3.1 useAIActions (Action Dispatch Hub)

**File:** `hooks/useAIActions.ts` (~250 LOC)
**Purpose:** Central orchestration hub for AI-suggested actions. Receives `ActionIntent` from AI responses, routes them through the handler registry, and tracks execution results.

**Parameters:** Takes an `ActionContext` object (canvas ref, inventory, diagram, update functions, etc.)

**Return Value:**

```typescript
{
  execute: (action: ActionIntent) => Promise<{ success: boolean; error?: string }>;
  stagedActions: ActionIntent[];
  stageActions: (actions: ActionIntent[]) => void;
  clearStaged: () => void;
  autonomySettings: AIAutonomySettings;
  updateAutonomySettings: (updates: Partial<AIAutonomySettings>) => void;
  isActionSafe: (actionType: ActionType) => boolean;
}
```

**Flow:**
1. AI responds with `suggestedActions: ActionIntent[]`
2. `stageActions()` queues them for display in the chat UI
3. When user clicks an action (or auto-execute is enabled for safe actions), `execute()` is called
4. `execute()` calls `getHandler(action.type)` from the registry
5. Handler receives `(payload, actionContext)` and returns `HandlerResult`
6. Result is logged to `addToHistory()` and `auditService.log()`

**Contexts read:** InventoryContext, DiagramContext, SelectionContext, LayoutContext
**Contexts written:** DiagramContext (via updateDiagram), InventoryContext (via setInventory)

---

### 3.2 useConversations (Conversation CRUD + Persistence)

**File:** `hooks/useConversations.ts` (349 LOC)
**Purpose:** Full CRUD for chat conversations and messages, with IndexedDB persistence.

**Return Value:**

```typescript
{
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: EnhancedChatMessage[];
  createConversation: (title?: string) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  switchConversation: (id: string) => Promise<void>;
  addMessage: (msg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'>) => Promise<EnhancedChatMessage>;
  updateMessage: (id: string, updates: Partial<EnhancedChatMessage>) => void;
  isLoading: boolean;
}
```

**Persistence:** Uses IndexedDB via `services/storage.ts`:
- `CONVERSATIONS` store: conversation metadata (id, title, createdAt, updatedAt)
- `MESSAGES` store: individual messages keyed by conversationId index

**Side Effects:** Auto-creates a default conversation on first mount if none exist.

---

### 3.3 useInventorySync (Inventory-to-Diagram Sync)

**File:** `hooks/useInventorySync.ts` (225 LOC)
**Purpose:** Watches inventory changes and propagates them into the active diagram. Ensures diagram components stay in sync with the inventory (source of truth).

**Parameters:**

```typescript
useInventorySync(
  inventory: ElectronicComponent[],
  diagram: WiringDiagram | null,
  updateDiagram: (diagram: WiringDiagram) => void
): void
```

**Return Value:** None (void) -- operates via side effects only.

**Sync Logic:**
1. When `inventory` changes, iterates through `diagram.components`
2. For each diagram component with a `sourceInventoryId`, finds the matching inventory item
3. If the inventory item was updated (name, pins, description, etc.), replaces the diagram component with updated data while preserving position
4. If the inventory item was deleted, optionally removes or marks the diagram component as orphaned
5. Calls `updateDiagram()` with the synced result

**Contexts read:** None directly (receives values as params)
**Side effects:** Writes to DiagramContext via `updateDiagram`

---

### 3.4 useCanvasExport

**File:** `hooks/useCanvasExport.ts` (171 LOC)
**Purpose:** Exports the SVG canvas as SVG or PNG files.

**Parameters:** `(svgRef: React.RefObject<SVGSVGElement>, diagram: WiringDiagram | null)`

**Return Value:**

```typescript
{
  svgExportStatus: 'idle' | 'exporting' | 'done' | 'error';
  pngExportStatus: 'idle' | 'exporting' | 'done' | 'error';
  handleExportSVG: () => void;
  handleExportPNG: () => void;
  getSnapshotBlob: () => Promise<Blob | null>;    // For AI visual analysis
}
```

**Side Effects:** Creates temporary canvas elements, triggers file downloads via `<a>` click. PNG exports at 2x resolution. `getSnapshotBlob` creates a 1024px-wide PNG for AI analysis without triggering download.

---

### 3.5 useCanvasHUD

**File:** `hooks/useCanvasHUD.ts` (62 LOC)
**Purpose:** Manages HUD fragment display on component/pin hover events.

**Parameters:** `(containerRef: React.RefObject<HTMLDivElement>)`

**Return Value:**

```typescript
{
  handleComponentEnter: (e: MouseEvent, component: ElectronicComponent) => void;
  handleComponentLeave: (e: MouseEvent, component: ElectronicComponent) => void;
  handlePinEnter: (e: MouseEvent, componentId: string, pin: string) => void;
  handlePinLeave: (e: MouseEvent, componentId: string, pin: string) => void;
}
```

**Contexts read:** HUDContext (addFragment, removeFragment), SelectionContext (setActiveSelectionPath)
**Internal state:** `activeFragments` ref (Map<string, string>) tracks which fragment IDs correspond to which component/pin IDs.

---

### 3.6 useCanvasHighlights

**File:** `hooks/useCanvasHighlights.ts` (113 LOC)
**Purpose:** Manages visual highlights on components and wires with configurable color, duration, and pulse animation.

**Return Value:**

```typescript
{
  highlightedComponents: Map<string, HighlightState>;
  highlightedWires: Map<number, HighlightState>;
  highlightComponent: (componentId: string, options?: HighlightOptions) => void;
  clearHighlight: (componentId?: string) => void;     // Undefined = clear all
  highlightWire: (wireIndex: number, options?: HighlightOptions) => void;
  clearWireHighlight: (wireIndex?: number) => void;
}

interface HighlightOptions {
  color?: string;      // Default: '#00f3ff' for components, '#ff00ff' for wires
  duration?: number;   // Default: 3000ms, 0 = permanent
  pulse?: boolean;     // Default: true
}
```

**Internal state:** Two `Map` state variables with timer cleanup. Each highlight entry stores a `timerId` for auto-removal after duration.

---

### 3.7 useCanvasInteraction

**File:** `hooks/useCanvasInteraction.ts` (183 LOC)
**Purpose:** Handles all pointer events on the canvas -- panning, node dragging, wheel zoom, keyboard navigation, and drag-and-drop from inventory.

**Parameters:**

```typescript
interface UseCanvasInteractionArgs {
  state: DiagramState;
  dispatch: React.Dispatch<DiagramAction>;
  diagram: WiringDiagram | null;
  selectedComponentId?: string | null;
  snapToGrid: boolean;
  containerRectRef: React.MutableRefObject<DOMRect | null>;
  onComponentDrop?: (component: ElectronicComponent, x: number, y: number) => void;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
  onBackgroundClick?: () => void;
}
```

**Return Value:**

```typescript
{
  getDiagramPos: (clientX: number, clientY: number) => { x: number; y: number };
  handleWheel: (e: React.WheelEvent) => void;
  handlePointerDown: (e: React.PointerEvent, nodeId?: string) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
}
```

**Key behaviors:**
- **Pointer Move** is throttled with `requestAnimationFrame` to prevent event flooding
- **Keyboard navigation** supports arrow keys for panning (no selection) or moving selected component. Shift+Arrow for fine-grained 1px movement. Implements WCAG 2.1 AA SC 2.1.1.
- **Drag-and-Drop** parses `application/json` from dataTransfer, applies grid snapping if enabled (10px grid)
- **Background click** detection: if pointer up occurs without dragging or panning, triggers `onBackgroundClick` to deselect

---

### 3.8 useCanvasLayout

**File:** `hooks/useCanvasLayout.ts` (237 LOC)
**Purpose:** Manages node positioning, auto-layout for new components, viewport virtualization, filtering, and minimap calculations.

**Parameters:** `{ state, dispatch, diagram, containerRef, searchQuery, filterType }`

**Return Value:**

```typescript
{
  viewportSize: { width: number; height: number };
  containerRectRef: React.MutableRefObject<DOMRect | null>;
  filteredComponents: ElectronicComponent[];
  diagramBounds: { minX, minY, maxX, maxY, width, height };
  renderComponents: ElectronicComponent[];        // After virtualization cull
  renderConnections: { conn: WireConnection; index: number }[];
  uniqueColors: string[];                          // For SVG marker definitions
  handleMinimapClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}
```

**Key behaviors:**
- **Auto-layout:** Places new components by type (power at x=100, microcontrollers at x=400, others at x=700), stacking vertically with 200px spacing and collision avoidance
- **Virtualization:** When component count exceeds 100, only renders components within viewport bounds + 240px padding
- **Search-to-pan:** When `searchQuery` matches a component, pans canvas to center on it and highlights it
- **Viewport tracking:** Uses `ResizeObserver` with 16ms debounce

---

### 3.9 useCanvasWiring

**File:** `hooks/useCanvasWiring.ts` (136 LOC)
**Purpose:** Handles wire creation, deletion, and label editing on the canvas.

**Return Value:**

```typescript
{
  handlePinPointerDown: (e, nodeId, pin, isRightSide) => void;
  handlePinPointerUp: (e, nodeId, pin) => void;
  handleWireEditClick: (index: number) => void;
  handleWireDelete: (index: number) => void;
  handleWireLabelSave: () => void;
}
```

**Wire creation flow:**
1. User pointer-down on a pin: starts temp wire (`START_WIRE` dispatch)
2. Pointer moves: `cursorPos` in state updates, temp wire follows cursor
3. User pointer-up on another pin: creates `WireConnection`, adds to diagram
4. Duplicate detection: checks if connection already exists before adding

---

### 3.10 useChatHandler

**File:** `hooks/useChatHandler.ts` (268 LOC)
**Purpose:** Orchestrates AI chat interactions -- routes messages through appropriate generation mode (chat, image, video), handles diagram generation, and triggers AI autonomy execution.

**Parameters:** 12 parameters including `generationMode`, `inventory`, `aiContext`, `aiActions`, `conversationManager`, `updateDiagram`

**Return Value:** `handleSendEnhancedMessage: (content: string, attachment?: {...}) => Promise<void>`

**Message routing:**
- `generationMode === 'image'`: Calls `generateEditedImage()` or `generateConceptImage()`
- `generationMode === 'video'`: Calls `generateCircuitVideo()`
- `generationMode === 'chat'`:
  - If message contains "diagram" or "circuit": calls `generateWiringDiagram()` and updates diagram
  - If `aiContext` available: calls `chatWithContext()` for context-aware response
  - Otherwise: calls `chatWithAI()` for basic chat

**Autonomy trigger:** After a context-aware chat response, if `autoExecuteSafeActions` is enabled, iterates through `suggestedActions` and auto-executes safe ones via `aiActions.execute()`.

---

### 3.11 useDiagram3DScene

**File:** `hooks/useDiagram3DScene.ts` (377 LOC)
**Purpose:** Initializes the full Three.js scene for 3D diagram view -- renderer, camera, lighting, post-processing, controls, and render loop.

**Parameters:** `(containerRef: React.RefObject<HTMLDivElement>)`

**Return Value (SceneRefs):**

```typescript
{
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
  sceneRef: React.RefObject<THREE.Scene | null>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.RefObject<OrbitControls | null>;
  composerRef: React.RefObject<EffectComposer | null>;
  componentsGroupRef: React.RefObject<THREE.Group | null>;
  wiresGroupRef: React.RefObject<THREE.Group | null>;
  telemetryGroupRef: React.RefObject<THREE.Group | null>;
  envMapRef: React.RefObject<THREE.Texture | null>;
}
```

**Scene setup:** 3-point lighting (key/fill/rim), metallic ground plane with grid, PMREM environment map, UnrealBloomPass + FXAAShader post-processing, 30fps cap render loop via `requestAnimationFrame`, OrbitControls with damping, LOD updates per frame.

**Cleanup:** Full disposal of renderer, controls, composer, environment map, and all scene children via `disposeObject` traversal.

---

### 3.12 useDiagram3DSync

**File:** `hooks/useDiagram3DSync.ts` (243 LOC)
**Purpose:** Synchronizes the 2D diagram data into 3D Three.js scene objects. Creates LOD components, wires with CatmullRom curves, and labels.

**Parameters:** `(diagram, positions, sceneRefs)`
**Return Value:** `missingModels: ElectronicComponent[]` -- components that lack `threeCode` or `threeDModelUrl`

**Side Effects:** Clears and rebuilds all 3D objects when diagram or positions change. Applies environment maps to MeshPhysicalMaterial. Centers camera on component group.

---

### 3.13 useDiagram3DTelemetry

**File:** `hooks/useDiagram3DTelemetry.ts` (108 LOC)
**Purpose:** Renders live simulation data as floating 3D sprites above component pins.

**Parameters:** `(liveData, diagram, positions, sceneRefs)`
**Return Value:** None (void)

**Side Effects:** Creates `THREE.Sprite` objects with canvas-rendered text showing pin values (e.g., "HIGH", "3.3V"). Green for HIGH/1, cyan for other values. Sprites positioned at pin coordinates with y-offset of 15 units.

---

### 3.14 useEditorAIChat

**File:** `hooks/useEditorAIChat.ts` (215 LOC)
**Purpose:** Manages the AI chat assistant inside the ComponentEditorModal. Can auto-fill form fields, find images, and trigger 3D generation.

**Return Value:**

```typescript
interface UseEditorAIChatReturn {
  showAiChat: boolean;
  setShowAiChat: (show: boolean) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  handleSendChat: (overrideInput?: string) => Promise<void>;
  selectFoundImage: (url: string) => void;
  handleAction: (action: string) => Promise<void>;
}
```

**Key behavior:** Calls `assistComponentEditor()` which returns `{ updates, reply, foundImages, suggestedActions }`. The `updates` object is applied to form fields via `applyUpdates()`, which calls individual setters for each field that changed.

---

### 3.15 useEditorFormState

**File:** `hooks/useEditorFormState.ts` (124 LOC)
**Purpose:** Manages form state for the ComponentEditorModal -- tracks all editable fields and detects dirty state.

**Parameters:** `(component: ElectronicComponent)`

**Return Value:**

```typescript
interface EditorFormState {
  editedName: string; setEditedName: (name: string) => void;
  editedType: ComponentType; setEditedType: (type: ComponentType) => void;
  editedDescription: string; setEditedDescription: (desc: string) => void;
  editedPins: string; setEditedPins: (pins: string) => void;
  editedDatasheetUrl: string; setEditedDatasheetUrl: (url: string) => void;
  editedThreeDModelUrl: string; setEditedThreeDModelUrl: (url: string) => void;
  editedImageUrl: string; setEditedImageUrl: (url: string) => void;
  editedQuantity: number; setEditedQuantity: (qty: number) => void;
  editedPrecisionLevel: 'draft' | 'masterpiece'; setEditedPrecisionLevel: (...) => void;
  hasChanges: boolean;
}
```

**Also exports:** `buildSavePayload(component, formState) => ElectronicComponent` -- constructs the final component object from form state for saving.

**Side effects:** Resets all fields when the input `component` changes. Tracks `hasChanges` by comparing each field against the original component values.

---

### 3.16 useFocusTrap

**File:** `hooks/useFocusTrap.ts` (123 LOC)
**Purpose:** WCAG 2.1 AA SC 2.4.3 focus trap for modals/dialogs. Tab/Shift+Tab cycles through focusable elements. Escape triggers close callback.

**Parameters:**

```typescript
interface UseFocusTrapOptions {
  enabled?: boolean;          // Default: true
  onClose?: () => void;       // Escape key handler
  autoFocus?: boolean;        // Default: true, focuses first element on mount
}
```

**Return Value:** `containerRef: React.RefObject<T>` -- attach to the modal/dialog container element.

**Behavior:**
- Saves `document.activeElement` on mount, restores it on unmount
- Queries all focusable elements via `FOCUSABLE_SELECTOR` (a[href], button, input, select, textarea, [tabindex], [contenteditable])
- Filters out `display:none` and `visibility:hidden` elements
- Auto-focuses first focusable element via `requestAnimationFrame`

---

### 3.17 useGestureTracking

**File:** `hooks/useGestureTracking.ts` (211 LOC)
**Purpose:** Translates MediaPipe hand landmark data into canvas interactions (pinch=select/drag, palm=pan, swipe=tab switch).

**Parameters:** `{ isNeuralLinkActive, gestureResult, isHandEngaged, assistantTab, setAssistantTab, canvasRef, toast }`
**Return Value:** None (void)

**Gesture mappings:**
- **Pinch** (index+thumb distance < 0.1): Dispatches `pointerdown`/`pointermove`/`pointerup` events
- **Open Palm**: Dispatches pan events
- **Horizontal Swipe** (velocity > 0.001): Switches assistant tabs (chat, bootcamp, history, analytics, audit)

**Performance optimization:** `elementFromPoint()` calls are throttled -- only re-queries when cursor moves >10px from last query position.

---

### 3.18 useKeyboardShortcuts

**File:** `hooks/useKeyboardShortcuts.ts` (71 LOC)
**Purpose:** Global keyboard shortcuts that work outside of text inputs.

**Shortcuts:**
| Key | Action |
|-----|--------|
| `Ctrl/Cmd+K` | Toggle OmniSearch |
| `H` | Toggle HUD visibility |
| `F` | Toggle Focus Mode |
| `D` | Toggle Dashboard/Canvas view |

**Parameters:** State values and setters for HUD, focus mode, dashboard, search.
**Side effects:** Adds `window.addEventListener('keydown', ...)` on mount, removes on unmount. Skips when target is input/textarea/contentEditable.

---

### 3.19 useMainLayoutActions

**File:** `hooks/useMainLayoutActions.ts` (219 LOC)
**Purpose:** Aggregates all action handlers used by MainLayout -- component info, selection, context menus, search results, 3D generation, drag-drop, duplication, deletion.

**Parameters:** `{ canvasRef: React.RefObject<DiagramCanvasRef> }`

**Return Value:**

```typescript
{
  // State
  inventory, setInventory, diagram, updateDiagram,
  selectedComponent, setSelectedComponent,
  modalContent, contextMenu, setContextMenu, isGenerating3D,

  // Handlers
  handleOpenComponentInfo,         // Opens editor + explains component via AI
  handleComponentSelect,           // Sets canvas selection
  handleComponentContextMenu,      // Shows right-click menu
  handleCanvasBackgroundClick,     // Deselects all
  handleSearchSelect,              // OmniSearch result click -> highlight + center
  handleChatComponentClick,        // Chat component mention click -> highlight + center
  handleGenerate3D,                // Triggers AI 3D code generation
  handleComponentDrop,             // Inventory drag-and-drop to canvas
  handleComponentDoubleClick,      // Opens component info
  handleContextMenuDuplicate,      // Duplicates component on canvas
  handleContextMenuDelete,         // Removes component + associated wires
}
```

**Contexts read:** InventoryContext, DiagramContext, SelectionContext
**Contexts written:** DiagramContext (updateDiagram), InventoryContext (updateItem)

---

### 3.20 useNeuralLinkEffects

**File:** `hooks/useNeuralLinkEffects.ts` (73 LOC)
**Purpose:** Side-effect manager for the gesture tracking system -- starts/stops neural link, registers visual context provider for camera, shows loading/error toasts.

**Parameters:** Neural link lifecycle functions, toast API
**Return Value:** None (void)
**Side effects:** Calls `startNeuralLink()` / `stopNeuralLink()` based on `neuralLinkEnabled`. Registers camera snapshot provider for AI visual context.

---

### 3.21 useSearchIndex

**File:** `hooks/useSearchIndex.ts` (41 LOC)
**Purpose:** Indexes inventory components and diagram components into the full-text search engine (MiniSearch) for OmniSearch.

**Parameters:** `{ inventory, diagram }`
**Return Value:** None (void)
**Side effects:** On every inventory/diagram change, builds an `IndexedDocument[]` array and calls `searchIndexer.index(docs)`. Documents categorized as `'component'` or `'diagram'`.

---

### 3.22 useSecurityAudit

**File:** `hooks/useSecurityAudit.ts` (54 LOC)
**Purpose:** Runs circuit safety audit on diagram changes and displays critical violations as HUD warning fragments.

**Parameters:** `{ diagram, addFragment, removeFragment }`
**Return Value:** None (void)
**Side effects:** Calls `securityAuditor.auditCircuitSafety(diagram)` on every diagram change. Filters for `severity === 'high' | 'critical'` violations. Adds HUD warning fragments for active violations, removes fragments for resolved violations.

---

### 3.23 useAIContextBuilder

**File:** `hooks/useAIContextBuilder.ts` (85 LOC)
**Purpose:** Builds and maintains the `AIContext` object that gives the AI awareness of the current application state.

**Parameters:** `{ diagram, inventory, canvasSelectionId, selectedComponent, isSettingsOpen, recentHistory, activeSelectionPath, canvasRef, isLoading, aiActions }`

**Return Value:** `AIContext | null`

**AIContext shape:**

```typescript
interface AIContext {
  currentDiagramId?: string;
  currentDiagramTitle?: string;
  componentCount: number;
  connectionCount: number;
  selectedComponentId?: string;
  selectedComponentName?: string;
  activeSelectionPath?: string;
  componentList?: string[];
  recentActions: string[];
  recentHistory?: ActionDelta[];
  activeView: 'canvas' | 'component-editor' | 'settings';
  viewport: { zoom: number; x: number; y: number };
}
```

**Proactive prediction loop:** 1.5 seconds after context changes, calls `predictionEngine.predict(aiContext)` and stages predicted actions via `aiActions.stageActions()`.

---

### 3.24 useAutonomySettings

**File:** `hooks/useAutonomySettings.ts` (51 LOC)
**Purpose:** Manages AI autonomy configuration -- which actions auto-execute and which require user confirmation.

**Return Value:**

```typescript
{
  autonomySettings: AIAutonomySettings;
  updateAutonomySettings: (updates: Partial<AIAutonomySettings>) => void;
  isActionSafe: (actionType: ActionType) => boolean;
}
```

**Safety resolution order:**
1. `customSafeActions` (user override) -> true
2. `customUnsafeActions` (user override) -> false
3. `ACTION_SAFETY[actionType]` (default from types.ts) -> boolean

**Persistence:** `cm_ai_autonomy` localStorage key.

---

### 3.25 useActionHistory

**File:** `hooks/useActionHistory.ts` (44 LOC)
**Purpose:** Tracks executed action results and manages the undo stack.

**Return Value:**

```typescript
{
  actionHistory: ActionResult[];        // Last 50 actions
  addToHistory: (result: ActionResult) => void;
  recordUndo: (record: ActionRecord) => Promise<void>;
  undo: () => Promise<void>;
  canUndo: boolean;
}
```

**Undo implementation:** Uses `useRef<ActionRecord[]>` for the undo stack. `recordUndo` pushes to the ref stack AND persists via `storage.recordAction()`. `undo` pops the last record, restores `snapshotBefore` via `updateDiagram()`, and deletes the record from storage.

---

## 4. Action Handler Registry

**Location:** `hooks/actions/`

### Registry Architecture

```
hooks/actions/
  index.ts              # Registry map + getHandler()
  types.ts              # ActionContext, HandlerResult, ActionHandler<T> types
  canvasHandlers.ts     # 6 handlers (viewport operations)
  navHandlers.ts        # 6 handlers (UI navigation)
  diagramHandlers.ts    # 5 handlers (diagram mutations)
  appControlHandlers.ts # 7 handlers (app-level operations)
```

### ActionContext (passed to every handler)

```typescript
interface ActionContext {
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
  handleUndo: () => void;
  handleRedo: () => void;
  saveDiagram: () => void;
  loadDiagram: () => void;
}
```

### Complete Handler Map

| Action Type | Handler | Module | Safe? |
|-------------|---------|--------|-------|
| `highlight` | `canvas.highlight` | canvasHandlers | Yes |
| `centerOn` | `canvas.centerOn` | canvasHandlers | Yes |
| `zoomTo` | `canvas.zoomTo` | canvasHandlers | Yes |
| `panTo` | `canvas.panTo` | canvasHandlers | Yes |
| `resetView` | `canvas.resetView` | canvasHandlers | Yes |
| `highlightWire` | `canvas.highlightWire` | canvasHandlers | Yes |
| `openInventory` | `nav.openInventory` | navHandlers | Yes |
| `closeInventory` | `nav.closeInventory` | navHandlers | Yes |
| `openSettings` | `nav.openSettings` | navHandlers | Yes |
| `closeSettings` | `nav.closeSettings` | navHandlers | Yes |
| `openComponentEditor` | `nav.openComponentEditor` | navHandlers | Yes |
| `switchGenerationMode` | `nav.switchGenerationMode` | navHandlers | Yes |
| `addComponent` | `diagram.addComponent` | diagramHandlers | **No** |
| `removeComponent` | `diagram.removeComponent` | diagramHandlers | **No** |
| `clearCanvas` | `diagram.clearCanvas` | diagramHandlers | **No** |
| `createConnection` | `diagram.createConnection` | diagramHandlers | **No** |
| `removeConnection` | `diagram.removeConnection` | diagramHandlers | **No** |
| `undo` | `app.handleUndo` | appControlHandlers | Yes |
| `redo` | `app.handleRedo` | appControlHandlers | Yes |
| `saveDiagram` | `app.handleSaveDiagram` | appControlHandlers | Yes |
| `loadDiagram` | `app.handleLoadDiagram` | appControlHandlers | **No** |
| `setUserLevel` | `app.handleSetUserLevel` | appControlHandlers | Yes |
| `learnFact` | `app.handleLearnFact` | appControlHandlers | Yes |
| `analyzeVisuals` | `app.handleAnalyzeVisuals` | appControlHandlers | Yes |

### Handler Details

**Canvas Handlers** -- All delegate to `canvasRef.current` methods:
- `highlight(componentId, { color, duration, pulse })` -- highlights a component
- `centerOn(componentId, zoom)` -- pans canvas to center on component
- `zoomTo(level)` -- sets zoom level
- `panTo(x, y)` -- sets pan position
- `resetView()` -- resets zoom and pan to defaults
- `highlightWire(wireIndex, { color, duration, pulse })` -- highlights a wire

**Navigation Handlers** -- Set UI state:
- `openInventory` / `closeInventory` -- toggles inventory sidebar
- `openSettings` / `closeSettings` -- toggles settings panel
- `openComponentEditor(componentId)` -- finds component in inventory, opens editor modal
- `switchGenerationMode(mode)` -- changes between chat/image/video

**Diagram Handlers** -- Mutate diagram state with undo support:
- `addComponent({ component, x, y })` -- deep clones component, assigns new ID, adds to diagram
- `removeComponent({ componentId })` -- removes component + all associated connections
- `createConnection({ fromComponentId, fromPin, toComponentId, toPin, color, description })` -- adds wire
- `removeConnection({ wireIndex })` -- removes wire by index
- `clearCanvas()` -- removes all components and connections

Each diagram handler:
1. Creates an `ActionRecord` with `snapshotBefore` (full diagram deep clone)
2. Performs the mutation via `updateDiagram()`
3. Calls `recordUndo(undoRecord)` to persist undo capability

**App Control Handlers:**
- `undo` / `redo` -- delegates to context functions
- `saveDiagram` / `loadDiagram` -- delegates to context functions
- `setUserLevel({ level })` -- calls `userProfileService.updateExperience()`
- `learnFact({ content })` -- calls `userProfileService.addFact()`
- `analyzeVisuals` -- captures canvas snapshot, emits `cm:visual-analysis` custom event with base64 image

---

## 5. Undo/Redo System

### Architecture

The undo system uses a **snapshot-based approach** rather than command/event sourcing.

```
User/AI Action
  -> Diagram Handler (diagramHandlers.ts)
    -> Deep clone current diagram as snapshotBefore
    -> Perform mutation
    -> Push ActionRecord to undo stack
    -> Persist ActionRecord to IndexedDB via storage.recordAction()

Undo
  -> Pop ActionRecord from stack
  -> Replace diagram with snapshotBefore
  -> Delete ActionRecord from IndexedDB via storage.deleteAction()
```

### ActionRecord Structure

```typescript
interface ActionRecord {
  id: string;                    // Generated: "action-{timestamp}-{random}"
  timestamp: number;
  type: ActionType;
  payload: Record<string, unknown>;
  conversationId?: string;       // Links to which chat conversation triggered it
  undoable: boolean;
  snapshotBefore?: unknown;      // Full WiringDiagram before mutation
}
```

### Limitations

- **No redo stack:** Once an action is undone, the forward state is lost. The `handleRedo` function exists in the context interface but redo functionality is not yet implemented.
- **Memory usage:** Each undo record contains a full deep clone of the diagram. Large diagrams with many components will consume significant memory.
- **Stack size:** The `undoStackRef` is unbounded. The `actionHistory` (for display) is capped at 50 entries.
- **Persistence:** Undo records are persisted to IndexedDB but the in-memory stack (`useRef`) is lost on page reload.

---

## 6. AI Autonomy and Action Safety

### ACTION_SAFETY Classification

Every `ActionType` has a default safety classification in `types.ts`:

**Safe (auto-executable):**
- Canvas: highlight, centerOn, zoomTo, panTo, resetView, highlightWire
- UI: openInventory, closeInventory, openSettings, closeSettings, toggleSidebar, setTheme, openComponentEditor, switchGenerationMode
- Project: undo, redo, saveDiagram
- Profile: setUserLevel, learnFact
- Vision: analyzeVisuals

**Unsafe (requires user confirmation):**
- Diagram: addComponent, updateComponent, removeComponent, clearCanvas, createConnection, removeConnection
- Project: loadDiagram
- Forms: fillField, saveComponent

### User Override System

Users can override default safety classifications via `useAutonomySettings`:

```typescript
interface AIAutonomySettings {
  autoExecuteSafeActions: boolean;       // Master toggle for auto-execution
  customSafeActions: ActionType[];       // User-promoted actions
  customUnsafeActions: ActionType[];     // User-demoted actions
}
```

**Resolution order:**
1. Check `customSafeActions` -> true
2. Check `customUnsafeActions` -> false
3. Fall back to `ACTION_SAFETY[type]`

### Auto-Execution Flow

In `useChatHandler.ts`, after receiving an AI response with `suggestedActions`:

```
For each suggestedAction:
  1. Check if autoExecuteSafeActions is enabled
  2. Resolve safety: custom overrides > defaults
  3. If safe: immediately call aiActions.execute(action)
  4. If unsafe: display in chat UI as clickable button for user confirmation
```

---

## 7. Inventory-Diagram Sync Lifecycle

### The Golden Rule

**Inventory is the single source of truth.** The diagram contains deep copies of components. When inventory changes, the diagram MUST be updated to reflect those changes.

### Sync Flow

```
InventoryContext (source of truth)
  |
  | updateItem(component)
  v
useInventorySync (hooks/useInventorySync.ts)
  |
  | Watches: inventory, diagram
  | For each diagram.component with sourceInventoryId:
  |   - Find matching inventory item
  |   - If updated: merge changes, preserve position
  |   - If deleted: mark orphaned / remove
  |
  v
DiagramContext (synced copy)
  |
  | updateDiagram(syncedDiagram)
  v
Canvas re-renders with updated data
```

### Component Identity

When a component is dragged from inventory to the canvas:
1. `handleComponentDrop` creates a deep clone with a new ID: `comp-{timestamp}`
2. The original inventory item ID is preserved as `sourceInventoryId`
3. When the AI adds a component via `diagramHandlers.addComponent()`, the same pattern applies: new ID with `sourceInventoryId` pointing back to inventory

This means:
- Multiple copies of the same inventory component can exist on the canvas
- Each has a unique `id` for diagram purposes
- All share the same `sourceInventoryId` for sync purposes

### What Gets Synced

| Field | Synced from Inventory? |
|-------|----------------------|
| name | Yes |
| type | Yes |
| description | Yes |
| pins | Yes |
| imageUrl | Yes |
| threeCode | Yes |
| datasheetUrl | Yes |
| position | **No** (preserved from diagram) |
| id | **No** (unique per diagram instance) |

---

## 8. State Persistence Patterns

### Dual-Layer Persistence

CircuitMind AI uses two persistence layers:

| Layer | Technology | Use Case | Size Limit |
|-------|-----------|----------|------------|
| Fast | localStorage | Small data, preferences, layout | ~5MB |
| Large | IndexedDB | Conversations, messages, binary parts | ~50MB+ |

### localStorage Keys

| Key | Data | Context |
|-----|------|---------|
| `cm_inventory` | ElectronicComponent[] JSON | InventoryContext |
| `cm_autosave` | WiringDiagram JSON | DiagramContext |
| `cm_active_mode` | UIMode string | LayoutContext |
| `cm_inventory_open_default` | boolean string | LayoutContext |
| `cm_inventory_pinned_default` | boolean string | LayoutContext |
| `cm_inventory_width` | number string | LayoutContext |
| `cm_assistant_open_default` | boolean string | LayoutContext |
| `cm_assistant_pinned_default` | boolean string | LayoutContext |
| `cm_assistant_width` | number string | LayoutContext |
| `cm_low_performance_mode` | boolean string | LayoutContext |
| `cm_neural_link_enabled` | boolean string | LayoutContext |
| `cm_layout_snapshot_{mode}` | LayoutSnapshot JSON | LayoutContext |
| `cm_generation_mode` | string | AssistantStateContext |
| `cm_deep_thinking` | boolean string | AssistantStateContext |
| `cm_active_conversation` | string (ID) | ConversationContext |
| `cm_gemini_api_key` | string | Settings |
| `cm_ai_autonomy` | AIAutonomySettings JSON | useAutonomySettings |
| `cm_dashboard_layout` | DashboardWidget[] JSON | DashboardContext |
| `cm_macros` | MacroDefinition[] JSON | MacroContext |
| `cm_tutorials_completed` | string[] JSON | TutorialContext |
| `cm_telemetry_enabled` | boolean string | TelemetryContext |
| `cm_hud_visible` | boolean string | HUDContext |
| `cm_user_profile` | UserProfile JSON | UserContext |

### IndexedDB Stores

| Store | Key | Data | Context |
|-------|-----|------|---------|
| `INVENTORY` | auto | ElectronicComponent[] | InventoryContext (backup) |
| `CONVERSATIONS` | id | Conversation | ConversationContext |
| `MESSAGES` | id, indexed by conversationId | EnhancedChatMessage | ConversationContext |
| `ACTION_RECORDS` | id | ActionRecord | useActionHistory |

### Quota Exceeded Handling

`services/storage.ts` wraps all localStorage writes. If `QuotaExceededError` is thrown:
1. Migrates the data to IndexedDB
2. Clears the localStorage entry
3. Logs the migration event
4. Future reads check IndexedDB as fallback

---

## 9. Canvas State Machine

The canvas uses a `useReducer`-based state machine defined in `components/diagram/diagramState.ts`.

### State Shape

```typescript
interface DiagramState {
  // View
  zoom: number;                    // Range: 0.2 - 4.0
  pan: Point;                      // { x, y } pixel offset

  // Interaction
  interactionMode: 'idle' | 'panning' | 'dragging_node' | 'creating_wire';
  lastPointerPos: Point;
  activeNodeId: string | null;

  // Layout
  nodePositions: Map<string, Point>;

  // Wire Creation
  tempWire: TempWireState | null;
  cursorPos: Point;

  // Wire Editing
  editingWireIndex: number | null;
  wireLabelInput: string;
  wireLabelPos: Point;

  // UI
  hoveredNodeId: string | null;
  isDragOver: boolean;
}
```

### State Transitions

```
IDLE
  -> START_PAN(pointerPos)           -> PANNING
  -> START_DRAG_NODE(nodeId, pos)    -> DRAGGING_NODE
  -> START_WIRE(startNodeId, pin)    -> CREATING_WIRE

PANNING
  -> POINTER_MOVE(pos)               -> updates pan offset
  -> POINTER_UP                      -> IDLE

DRAGGING_NODE
  -> POINTER_MOVE(pos)               -> updates nodePositions[activeNodeId]
  -> POINTER_UP                      -> IDLE

CREATING_WIRE
  -> POINTER_MOVE(pos)               -> updates cursorPos (wire follows cursor)
  -> POINTER_UP                      -> IDLE (tempWire cleared)
```

### Actions

| Action | Payload | Effect |
|--------|---------|--------|
| `SET_ZOOM` | number | Clamp to 0.2-4.0 |
| `ZOOM_IN` | delta | zoom + delta, clamped |
| `ZOOM_OUT` | delta | zoom - delta, clamped |
| `SET_PAN` | Point | Direct pan set |
| `RESET_VIEW` | - | zoom=1, pan={0,0} |
| `START_PAN` | Point | mode='panning', clears wire edit |
| `START_DRAG_NODE` | {nodeId, Point} | mode='dragging_node' |
| `POINTER_MOVE` | {pointerPos, diagramPos, snapToGrid, gridSize} | Panning: updates pan. Dragging: updates node position. Always updates cursorPos. |
| `POINTER_UP` | - | mode='idle', clears activeNodeId, clears tempWire |
| `START_WIRE` | TempWireState | mode='creating_wire' |
| `SET_NODE_POSITIONS` | Map | Bulk position update |
| `UPDATE_NODE_POSITION` | {nodeId, x, y} | Single position update |
| `SET_HOVERED_NODE` | string or null | Hover highlight |
| `SET_DRAG_OVER` | boolean | Inventory drop target indicator |
| `START_EDIT_WIRE` | {index, description, Point} | Opens wire label editor |
| `UPDATE_WIRE_LABEL` | string | Updates editing label text |
| `CANCEL_EDIT_WIRE` / `SAVE_EDIT_WIRE` | - | Clears editing state |

---

## 10. Cross-Cutting Concerns

### Provider Dependencies

Some hooks and components consume multiple contexts simultaneously:

| Consumer | Contexts Read | Contexts Written |
|----------|--------------|-----------------|
| useMainLayoutActions | Inventory, Diagram, Selection | Diagram, Inventory |
| useAIActions | Inventory, Diagram, Selection, Layout | Diagram, Inventory, Layout |
| useChatHandler | AssistantState, Inventory | Diagram (via updateDiagram) |
| useCanvasHUD | HUD, Selection | HUD, Selection |
| useSecurityAudit | HUD | HUD |
| useAIContextBuilder | Diagram, Inventory, Selection | None (returns value) |

### Re-render Optimization

- `LayoutContext` value is wrapped in `useMemo` to prevent unnecessary re-renders
- `DiagramCanvas` uses `useMemo` for filtered components and connections
- `ChatMessage` is wrapped in `React.memo`
- Canvas pointer move events are throttled with `requestAnimationFrame`
- `useCanvasLayout` viewport resize uses `ResizeObserver` with 16ms debounce

### Error Boundaries

Each context provider includes error handling in its initialization:
- localStorage reads are wrapped in try/catch with fallback defaults
- IndexedDB reads include error handling with localStorage fallback
- AI service calls in hooks use try/catch with error toast notifications

### State Isolation

The diagram contains **deep clones** of inventory components (via `JSON.parse(JSON.stringify(...))` in `diagramHandlers.addComponent`). This prevents accidental mutation of the inventory source of truth when modifying diagram components. The sync flow (useInventorySync) is the only sanctioned path for inventory changes to reach the diagram.
