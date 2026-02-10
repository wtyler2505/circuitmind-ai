# CircuitMind AI - Contexts Reference

React Context providers for domain-specific state management. 19 context files in `contexts/` plus `ToastProvider` in `hooks/useToast.tsx` = 20 providers nested in `App.tsx`.

## Provider Hierarchy (from App.tsx)

Providers are nested in a load-bearing order. Diagram depends on inventory being loaded first.

```tsx
<LayoutProvider>
  <AssistantStateProvider>
    <HealthProvider>
      <AuthProvider>
        <UserProvider>
          <ToastProvider>
            <NotificationProvider>
              <DashboardProvider>
                <MacroProvider>
                  <InventoryProvider initialData={INITIAL_INVENTORY}>
                    <AdvancedInventoryProvider>
                      <SyncProvider>
                        <ConversationProvider>
                          <DiagramProvider>
                            <SelectionProvider>
                              <TelemetryProvider>
                                <HUDProvider>
                                  <SimulationProvider>
                                    <VoiceAssistantProvider>
                                      <TutorialProvider>
                                        <MainLayout />
                                      </TutorialProvider>
                                    </VoiceAssistantProvider>
                                  </SimulationProvider>
                                </HUDProvider>
                              </TelemetryProvider>
                            </SelectionProvider>
                          </DiagramProvider>
                        </ConversationProvider>
                      </SyncProvider>
                    </AdvancedInventoryProvider>
                  </InventoryProvider>
                </MacroProvider>
              </DashboardProvider>
            </NotificationProvider>
          </ToastProvider>
        </UserProvider>
      </AuthProvider>
    </HealthProvider>
  </AssistantStateProvider>
</LayoutProvider>
```

---

## All 20 Providers

| # | Context | File | Hook | Purpose |
|---|---------|------|------|---------|
| 1 | LayoutContext | `contexts/LayoutContext.tsx` | `useLayout()` | UI layout, sidebars, modes, focus |
| 2 | AssistantStateContext | `contexts/AssistantStateContext.tsx` | `useAssistantState()` | AI generation mode, image size, deep thinking |
| 3 | HealthContext | `contexts/HealthContext.tsx` | `useHealth()` | System health (CPU, memory, frame rate) |
| 4 | AuthContext | `contexts/AuthContext.tsx` | `useAuth()` | Authentication & session |
| 5 | UserContext | `contexts/UserContext.tsx` | `useUser()` | User profile & preferences |
| 6 | ToastProvider | `hooks/useToast.tsx` | `useToast()` | Toast notification system |
| 7 | NotificationContext | `contexts/NotificationContext.tsx` | `useNotifications()` | Alert notifications |
| 8 | DashboardContext | `contexts/DashboardContext.tsx` | `useDashboard()` | Dashboard widget layout |
| 9 | MacroContext | `contexts/MacroContext.tsx` | `useMacro()` | Action macro recording/playback |
| 10 | InventoryContext | `contexts/InventoryContext.tsx` | `useInventory()` | Component library (source of truth) |
| 11 | AdvancedInventoryContext | `contexts/AdvancedInventoryContext.tsx` | `useAdvancedInventory()` | Server-backed catalog/location-aware inventory |
| 12 | SyncContext | `contexts/SyncContext.tsx` | `useSync()` | Cross-device sync state |
| 13 | ConversationContext | `contexts/ConversationContext.tsx` | `useConversationContext()` | Chat sessions (wraps useConversations) |
| 14 | DiagramContext | `contexts/DiagramContext.tsx` | `useDiagram()` | Diagram state + undo/redo history |
| 15 | SelectionContext | `contexts/SelectionContext.tsx` | `useSelection()` | Multi-select state |
| 16 | TelemetryContext | `contexts/TelemetryContext.tsx` | `useTelemetry()` | Event tracking & analytics |
| 17 | HUDContext | `contexts/HUDContext.tsx` | `useHUD()` | Heads-up display content |
| 18 | SimulationContext | `contexts/SimulationContext.tsx` | `useSimulation()` | Circuit simulation state |
| 19 | VoiceAssistantContext | `contexts/VoiceAssistantContext.tsx` | `useVoiceAssistant()` | Voice I/O, live audio mode |
| 20 | TutorialContext | `contexts/TutorialContext.tsx` | `useTutorial()` | Tutorial progression |

---

## Key Context APIs

### InventoryContext (Source of Truth)

**Location**: `contexts/InventoryContext.tsx`
**Hook**: `useInventory()`

Manages the component library with CRUD operations. This is the **single source of truth** for components -- diagram syncs FROM inventory via `useInventorySync`.

```typescript
interface InventoryContextType {
  inventory: ElectronicComponent[];
  setInventory: React.Dispatch<React.SetStateAction<ElectronicComponent[]>>;
  addItem: (item: ElectronicComponent) => void;
  updateItem: (item: ElectronicComponent) => void;
  removeItem: (id: string) => void;
  removeMany: (ids: string[]) => void;
  updateMany: (items: ElectronicComponent[]) => void;
}
```

**Persistence**: Auto-saves to `localStorage.cm_inventory` on changes. Accepts optional `initialData` prop for seeding.

---

### DiagramContext

**Location**: `contexts/DiagramContext.tsx`
**Hook**: `useDiagram()`

Manages the active wiring diagram with undo/redo history.

```typescript
interface DiagramContextType {
  diagram: WiringDiagram | null;
  history: {
    past: WiringDiagram[];
    present: WiringDiagram | null;
    future: WiringDiagram[];
  };
  updateDiagram: (newDiagram: DiagramUpdater) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveToQuickSlot: () => void;
  loadFromQuickSlot: () => void;
}

type DiagramUpdater = WiringDiagram | null | ((current: WiringDiagram | null) => WiringDiagram | null);
```

**Persistence**: Auto-saves to `localStorage.cm_autosave`. Quick slot: `localStorage.savedDiagram`.

---

### LayoutContext

**Location**: `contexts/LayoutContext.tsx`
**Hook**: `useLayout()`

Manages UI layout state: sidebars, panels, modals.

```typescript
interface LayoutContextType {
  // Inventory sidebar
  isInventoryOpen: boolean;
  setInventoryOpen: (open: boolean) => void;
  inventoryPinned: boolean;
  setInventoryPinned: (pinned: boolean) => void;
  inventoryWidth: number;
  setInventoryWidth: (width: number) => void;

  // Assistant sidebar
  isAssistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  assistantPinned: boolean;
  setAssistantPinned: (pinned: boolean) => void;
  assistantWidth: number;
  setAssistantWidth: (width: number) => void;

  // Settings modal
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  // Constants
  inventoryDefaultWidth: number;  // 360px
  assistantDefaultWidth: number;  // 380px
}
```

**Width Constraints**:

| Panel | Default | Min | Max |
|-------|---------|-----|-----|
| Inventory | 360px | 280px | 520px |
| Assistant | 380px | 300px | 560px |

---

### ConversationContext

**Location**: `contexts/ConversationContext.tsx`
**Hook**: `useConversationContext()`

Provides active conversation ID and switching functionality.

```typescript
interface ConversationContextType {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}
```

---

### AssistantStateContext

**Location**: `contexts/AssistantStateContext.tsx`
**Hook**: `useAssistantState()`

Tracks AI assistant status and generation mode.

---

### VoiceAssistantContext

**Location**: `contexts/VoiceAssistantContext.tsx`
**Hook**: `useVoiceAssistant()`

Manages voice input/output state for live audio features. Uses `useRef` (not `useState`) for `liveSessionRef`.

---

### SimulationContext

**Location**: `contexts/SimulationContext.tsx`
**Hook**: `useSimulation()`

Circuit simulation state including MNA results, running status, and error state.

---

### SelectionContext

**Location**: `contexts/SelectionContext.tsx`
**Hook**: `useSelection()`

Multi-select state for canvas components.

---

### Other Contexts

| Context | Purpose |
|---------|---------|
| HealthContext | System health monitoring (CPU, memory, frame rate) |
| AuthContext | Authentication and session management |
| UserContext | User profile, preferences, skill level |
| NotificationContext | Alert notification queue |
| DashboardContext | Dashboard widget layout (react-grid-layout) |
| MacroContext | Action macro recording and playback |
| AdvancedInventoryContext | Server-backed catalog and location-aware inventory |
| SyncContext | Cross-device sync state (Yjs/WebRTC) |
| TelemetryContext | Event tracking and analytics |
| HUDContext | Heads-up display content |
| TutorialContext | Tutorial/quest progression |

---

## Cross-Context Communication

### Dual Component Sync

When editing a component, update both inventory AND diagram:

```typescript
const { updateItem } = useInventory();
const { updateDiagram, diagram } = useDiagram();

const saveChanges = (updated: ElectronicComponent) => {
  // 1. Update inventory (source of truth)
  updateItem(updated);

  // 2. Update diagram's component instance
  updateDiagram(curr => ({
    ...curr,
    components: curr.components.map(c =>
      c.id === updated.id ? updated : c
    )
  }));
};
```

The `useInventorySync` hook automates this pattern.
