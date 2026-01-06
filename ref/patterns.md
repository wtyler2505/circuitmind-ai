# CircuitMind AI - Design Patterns

## State Patterns

### Undo/Redo Pattern

```typescript
const [history, setHistory] = useState<{
  past: WiringDiagram[];
  present: WiringDiagram | null;
  future: WiringDiagram[];
}>({ past: [], present: null, future: [] });

const updateDiagram = useCallback((newDiagram) => {
  setHistory(curr => ({
    past: curr.present ? [...curr.past, curr.present] : curr.past,
    present: newDiagram,
    future: []  // Clear redo stack on new action
  }));
}, []);
```

### Dual Component Sync Pattern

When editing components, always update both locations:
```typescript
// 1. Update inventory (master source)
setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));

// 2. Update diagram components (active instance)
updateDiagram(history.present ? {
  ...history.present,
  components: history.present.components.map(c => 
    c.id === updated.id ? updated : c
  )
} : null);
```

### useRef for WebSocket

Live session uses ref instead of state to prevent re-render disconnections:
```typescript
const liveSessionRef = useRef<LiveSession | null>(null);
// NOT: const [liveSession, setLiveSession] = useState(...)
```

---

## AI Patterns

### Structured Response Schema

Gemini requires OBJECT types to have non-empty `properties`:
```typescript
// ✅ CORRECT - payload as string
payloadJson: { 
  type: Type.STRING, 
  description: "JSON-encoded action parameters" 
}

// ❌ WRONG - empty object fails validation
payload: { 
  type: Type.OBJECT, 
  description: "Action parameters" 
}
```

### Safe/Unsafe Action Pattern

```typescript
// Default classifications
const ACTION_SAFETY: Record<ActionType, boolean> = {
  highlight: true,      // Safe - just visual
  addComponent: false,  // Unsafe - modifies diagram
};

// User can override via settings
if (settings.customSafeActions.includes(actionType)) return true;
if (settings.customUnsafeActions.includes(actionType)) return false;
return ACTION_SAFETY[actionType];
```

### Context-Aware Chat Pattern

```typescript
const response = await chatWithContext(
  content,
  chatHistory,
  aiContext,  // Current app state
  { enableProactive: true }
);

// Response includes actionable suggestions
for (const action of response.suggestedActions) {
  if (isSafe) await aiActions.execute(action);
}
```

---

## Storage Patterns

### localStorage with Delayed Reload

```typescript
// Problem: reload() may fire before localStorage.setItem() completes
localStorage.setItem('key', value);
window.location.reload();  // ❌ Race condition

// Solution: Add delay
localStorage.setItem('key', value);
setTimeout(() => window.location.reload(), 100);  // ✅ Safe
```

### IndexedDB Transaction Pattern

```typescript
const tx = db.transaction([STORES.CONVERSATIONS, STORES.MESSAGES], 'readwrite');
const convStore = tx.objectStore(STORES.CONVERSATIONS);
const msgStore = tx.objectStore(STORES.MESSAGES);

// Multiple operations in single transaction
convStore.delete(id);
const msgIndex = msgStore.index('conversationId');
const cursor = msgIndex.openCursor(IDBKeyRange.only(id));
cursor.onsuccess = (event) => {
  if (cursor.result) {
    cursor.result.delete();
    cursor.result.continue();
  }
};

tx.oncomplete = () => resolve();
```

---

## Canvas Patterns

### Smart Wire Routing

```typescript
// Try Bezier curve first
const dx = toX - fromX;
if (Math.abs(dx) > 50) {
  // Standard curve works
  return `M ${fromX} ${fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toX} ${toY}`;
}
// Fallback: zig-zag path when curve would loop back
return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
```

### Missing Pin Indicator

```typescript
const pinDef = component.pins?.find(p => p === pinName);
if (!pinDef) {
  // Render red pulsing dot instead of crashing
  return <circle cx={x} cy={y + height} r={4} fill="red" className="animate-pulse" />;
}
```

---

## Hook Patterns

### useConversations Hook

Provides CRUD operations for IndexedDB conversations:
```typescript
const {
  conversations,
  activeConversationId,
  messages,
  createConversation,
  switchConversation,
  addMessage,
} = useConversations();
```

### useAIActions Hook

Provides action execution with undo support:
```typescript
const {
  execute,          // Execute action (checks autonomy)
  pendingActions,   // Actions awaiting confirmation
  confirmAction,
  undo,
  highlightComponent,  // Shortcut methods
  openInventory,
} = useAIActions(options);
```

---

## Video URL Pattern

Veo video URLs require API key appended:
```typescript
// Raw URL from API (returns 403)
const rawUrl = response.generatedSamples[0].video.uri;

// Fixed URL with key
const fixedUrl = `${rawUrl}&key=${apiKey}`;
```
