# CircuitMind AI - Hooks Reference

Custom React hooks for state management and business logic.

## useConversations (346 LOC)

**Location**: `hooks/useConversations.ts`

Manages chat conversations with IndexedDB persistence.

### Interface

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

### Usage

```typescript
const {
  conversations,
  messages,
  createConversation,
  addMessage
} = useConversations();

// Create new conversation
const id = await createConversation('My Circuit Design');

// Add message
await addMessage({
  id: crypto.randomUUID(),
  conversationId: id,
  role: 'user',
  content: 'Design a LED circuit',
  timestamp: Date.now()
});
```

---

## useAIActions

**Location**: `hooks/useAIActions.ts`

Dispatches AI-suggested actions with safety checks.

### Interface

```typescript
interface UseAIActionsOptions {
  canvasRef: RefObject<DiagramCanvasRef>;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
  onOpenInventory?: () => void;
  onOpenSettings?: () => void;
  diagram: WiringDiagram | null;
  inventory: ElectronicComponent[];
}

interface UseAIActionsReturn {
  execute: (action: ActionIntent) => Promise<ActionResult>;
  pendingActions: ActionIntent[];
  confirmAction: (id: string) => Promise<void>;
  rejectAction: (id: string) => void;
  clearPending: () => void;
}
```

### Action Routing

Actions are routed to handlers in `hooks/actions/`:

| Action Type | Handler | Safety |
|-------------|---------|--------|
| highlight | highlightHandler | Safe |
| centerOn | viewHandler | Safe |
| zoomTo | viewHandler | Safe |
| resetView | viewHandler | Safe |
| openInventory | uiHandler | Safe |
| addComponent | componentHandler | Unsafe |
| removeComponent | componentHandler | Unsafe |
| createConnection | connectionHandler | Unsafe |
| deleteConnection | connectionHandler | Unsafe |

### Usage

```typescript
const aiActions = useAIActions({
  canvasRef,
  onDiagramUpdate: updateDiagram,
  diagram,
  inventory
});

// Execute action (auto-checks safety)
const result = await aiActions.execute({
  type: 'highlight',
  targetId: 'comp-1',
  payloadJson: JSON.stringify({ color: 'cyan', pulse: true })
});

// Handle pending unsafe actions
aiActions.pendingActions.forEach(action => {
  // Show confirmation UI
});
await aiActions.confirmAction(actionId);
```

---

## useAutonomySettings

**Location**: `hooks/useAutonomySettings.ts`

Manages AI action safety classifications.

### Interface

```typescript
interface AIAutonomySettings {
  customSafeActions: ActionType[];    // User-marked as safe
  customUnsafeActions: ActionType[];  // User-marked as unsafe
  requireConfirmationForAll: boolean; // Override: confirm everything
}

interface UseAutonomySettingsReturn {
  settings: AIAutonomySettings;
  isSafe: (actionType: ActionType) => boolean;
  markAsSafe: (actionType: ActionType) => void;
  markAsUnsafe: (actionType: ActionType) => void;
  resetToDefaults: () => void;
}
```

### Default Classifications

```typescript
const ACTION_SAFETY: Record<ActionType, boolean> = {
  highlight: true,
  centerOn: true,
  zoomTo: true,
  resetView: true,
  openInventory: true,
  closeInventory: true,
  addComponent: false,
  removeComponent: false,
  createConnection: false,
  deleteConnection: false,
  modifyComponent: false,
  generateDiagram: false,
};
```

### Persistence

Saves to `localStorage.cm_ai_autonomy`

---

## useActionHistory

**Location**: `hooks/useActionHistory.ts`

Tracks action history for undo support.

### Interface

```typescript
interface ActionRecord {
  id: string;
  type: ActionType;
  timestamp: number;
  conversationId?: string;
  before: unknown;  // State before action
  after: unknown;   // State after action
}

interface UseActionHistoryReturn {
  record: (action: ActionRecord) => Promise<void>;
  getRecent: (limit?: number) => Promise<ActionRecord[]>;
  undo: (id: string) => Promise<unknown>;  // Returns 'before' state
}
```

---

## useInventorySync

**Location**: `hooks/useInventorySync.ts`

Automatically syncs diagram components with inventory changes.

### Purpose

Inventory is the **single source of truth**. When inventory items are updated (pins changed, name updated, etc.), the diagram's component instances must reflect those changes.

### Interface

```typescript
interface UseInventorySyncOptions {
  inventory: ElectronicComponent[];
  diagram: WiringDiagram | null;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
}

// No return value - works via side effects
```

### Sync Logic

```typescript
// When inventory changes:
// 1. Find matching components in diagram by ID
// 2. Update diagram components with new inventory data
// 3. Preserve diagram-specific data (position, connections)

useEffect(() => {
  if (!diagram) return;

  const inventoryMap = new Map(inventory.map(i => [i.id, i]));
  const needsUpdate = diagram.components.some(dc => {
    const invItem = inventoryMap.get(dc.id);
    return invItem && !isEqual(dc, invItem);
  });

  if (needsUpdate) {
    onDiagramUpdate({
      ...diagram,
      components: diagram.components.map(dc =>
        inventoryMap.get(dc.id) || dc
      )
    });
  }
}, [inventory, diagram]);
```

---

## useToast

**Location**: `hooks/useToast.tsx`

Lightweight toast notification system.

### Interface

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;  // Default: 3000ms
}

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

### Usage

```typescript
const { toast, success, error } = useToast();

// Quick methods
success('Component added!');
error('Failed to save');
warning('Low stock');

// Custom
toast('Processing...', 'info', 5000);
```

### Styling

Matches app's dark theme:
- Success: Green border
- Error: Red border
- Warning: Yellow/orange border
- Info: Cyan border

---

## Action Handlers (hooks/actions/)

Modular action handlers extracted from useAIActions.

### Structure

```
hooks/actions/
├── index.ts           # Handler registry + exports
├── highlightHandler.ts
├── viewHandler.ts
├── componentHandler.ts
├── connectionHandler.ts
└── uiHandler.ts
```

### Handler Interface

```typescript
interface ActionContext {
  canvasRef: RefObject<DiagramCanvasRef>;
  diagram: WiringDiagram | null;
  inventory: ElectronicComponent[];
  onDiagramUpdate: (diagram: WiringDiagram) => void;
  onOpenInventory?: () => void;
  onOpenSettings?: () => void;
}

interface ActionHandler {
  (action: ActionIntent, context: ActionContext): Promise<ActionResult>;
}

interface ActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
}
```

### Registry Pattern

```typescript
// hooks/actions/index.ts
const handlers: Record<ActionType, ActionHandler> = {
  highlight: highlightHandler,
  centerOn: viewHandler,
  zoomTo: viewHandler,
  // ...
};

export const getHandler = (type: ActionType): ActionHandler | null => {
  return handlers[type] || null;
};
```
