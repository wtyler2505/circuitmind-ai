# CircuitMind AI - Contexts Reference

React Context providers for domain-specific state management.

## DiagramContext

**Location**: `contexts/DiagramContext.tsx`
**Hook**: `useDiagram()`

Manages the active wiring diagram with undo/redo history.

### Interface

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

// DiagramUpdater supports functional updates
type DiagramUpdater = WiringDiagram | null | ((current: WiringDiagram | null) => WiringDiagram | null);
```

### Usage

```typescript
const { diagram, updateDiagram, undo, canUndo } = useDiagram();

// Direct update
updateDiagram({ ...diagram, title: 'New Title' });

// Functional update (safer for concurrent updates)
updateDiagram(current => ({
  ...current,
  components: [...current.components, newComponent]
}));
```

### Persistence

- Auto-saves to `localStorage.cm_autosave` on changes
- Loads from localStorage on initialization
- Quick slot: `localStorage.savedDiagram`

---

## InventoryContext

**Location**: `contexts/InventoryContext.tsx`
**Hook**: `useInventory()`

Manages the component library with CRUD operations.

### Interface

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

### Usage

```typescript
const { inventory, addItem, updateItem, removeMany } = useInventory();

// Add new component
addItem({
  id: crypto.randomUUID(),
  name: 'New Sensor',
  type: 'sensor',
  pins: ['VCC', 'GND', 'OUT'],
  quantity: 1
});

// Bulk operations
removeMany(['id1', 'id2', 'id3']);
updateMany(updatedItems);
```

### Persistence

- Auto-saves to `localStorage.cm_inventory` on changes
- Accepts optional `initialData` prop for seeding

---

## LayoutContext

**Location**: `contexts/LayoutContext.tsx`
**Hook**: `useLayout()`

Manages UI layout state: sidebars, panels, modals.

### Interface

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

### Width Constraints

| Panel | Default | Min | Max |
|-------|---------|-----|-----|
| Inventory | 360px | 280px | 520px |
| Assistant | 380px | 300px | 560px |

### Persistence Keys

| Key | Purpose |
|-----|---------|
| `cm_inventory_open_default` | Inventory open state |
| `cm_inventory_pinned_default` | Inventory pinned state |
| `cm_inventory_width` | Inventory panel width |
| `cm_assistant_open_default` | Assistant open state |
| `cm_assistant_pinned_default` | Assistant pinned state |
| `cm_assistant_width` | Assistant panel width |

---

## ConversationContext

**Location**: `contexts/ConversationContext.tsx`
**Hook**: `useConversationContext()`

Provides active conversation ID and switching functionality.

### Interface

```typescript
interface ConversationContextType {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}
```

### Usage

```typescript
const { activeConversationId, setActiveConversationId } = useConversationContext();

// Switch conversation
setActiveConversationId('conv-123');
```

---

## AssistantStateContext

**Location**: `contexts/AssistantStateContext.tsx`
**Hook**: `useAssistantState()`

Tracks AI assistant status and pending actions.

### Interface

```typescript
interface AssistantStateContextType {
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  pendingActions: ActionIntent[];
  setPendingActions: (actions: ActionIntent[]) => void;
  lastError: string | null;
  setLastError: (error: string | null) => void;
}
```

### Usage

```typescript
const { isProcessing, pendingActions } = useAssistantState();

// Show loading indicator while AI processes
{isProcessing && <Spinner />}

// Display pending actions for user approval
{pendingActions.map(action => <ActionCard key={action.id} action={action} />)}
```

---

## VoiceAssistantContext

**Location**: `contexts/VoiceAssistantContext.tsx`
**Hook**: `useVoiceAssistant()`

Manages voice input/output state for live audio features.

### Interface

```typescript
interface VoiceAssistantContextType {
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (playing: boolean) => void;
  transcription: string;
  setTranscription: (text: string) => void;
  liveSession: LiveSession | null;
  setLiveSession: (session: LiveSession | null) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  setConnectionStatus: (status: ConnectionStatus) => void;
}
```

### Usage

```typescript
const {
  isRecording,
  setIsRecording,
  liveSession,
  connectionStatus
} = useVoiceAssistant();

// Start recording
const startRecording = async () => {
  if (!liveSession) {
    const session = new LiveSession(setConnectionStatus);
    await session.connect();
    setLiveSession(session);
  }
  setIsRecording(true);
};
```

---

## Provider Hierarchy

Recommended provider nesting order in `App.tsx`:

```tsx
<LayoutProvider>
  <InventoryProvider initialData={INITIAL_INVENTORY}>
    <DiagramProvider>
      <ConversationContext.Provider value={...}>
        <AssistantStateContext.Provider value={...}>
          <VoiceAssistantContext.Provider value={...}>
            <MainLayout />
          </VoiceAssistantContext.Provider>
        </AssistantStateContext.Provider>
      </ConversationContext.Provider>
    </DiagramProvider>
  </InventoryProvider>
</LayoutProvider>
```

---

## Cross-Context Communication

Some operations require coordinating between contexts:

### Dual Component Sync

When editing a component, update both inventory AND diagram:

```typescript
// In ComponentEditorModal or similar
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
