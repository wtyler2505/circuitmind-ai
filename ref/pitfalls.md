# CircuitMind AI - Pitfalls & Gotchas

## Critical Issues (Will Break Things)

### 1. Gemini Schema Validation
```typescript
// ❌ WRONG - 400 error
payload: { type: Type.OBJECT, description: "..." }

// ✅ CORRECT - use STRING for dynamic payloads
payloadJson: { type: Type.STRING, description: "JSON-encoded..." }
```
**Rule**: OBJECT types MUST have non-empty `properties: {...}`

### 2. localStorage Reload Race
```typescript
// ❌ WRONG - race condition
localStorage.setItem('key', value);
window.location.reload();

// ✅ CORRECT - wait for write
localStorage.setItem('key', value);
setTimeout(() => window.location.reload(), 100);
```

### 3. Component Dual Sync
When editing components, update BOTH locations:
```typescript
// 1. Update inventory (master)
setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));

// 2. Update diagram (instance)
updateDiagram({
  ...diagram,
  components: diagram.components.map(c => c.id === updated.id ? updated : c)
});
```
**Forgetting one = stale data bugs**

### 4. WebSocket useRef
```typescript
// ❌ WRONG - re-render disconnects WebSocket
const [liveSession, setLiveSession] = useState<LiveSession | null>(null);

// ✅ CORRECT - stable reference
const liveSessionRef = useRef<LiveSession | null>(null);
```

### 5. Veo Video URLs
```typescript
// Raw URL returns 403
const rawUrl = response.generatedSamples[0].video.uri;

// Must append API key
const fixedUrl = `${rawUrl}&key=${apiKey}`;
```

---

## Common Mistakes

### State Updates
- Don't mutate state directly (use spread operator)
- Don't forget `useCallback` deps array
- Don't use stale closures in async handlers

### IndexedDB
- Transactions auto-commit when idle
- Can't reuse transactions after they commit
- Always handle `onerror` events

### SVG Canvas
- Coordinates are absolute (not CSS pixels)
- Transform origin matters for scaling
- Z-order is DOM order (no z-index)

### Three.js
- Dispose of geometries/materials to prevent leaks
- Don't call `new Function()` with user input
- OrbitControls need `enableDamping` for smooth feel

---

## Testing Gaps (TODO)

| Area | Risk | Priority |
|------|------|----------|
| geminiService.ts | API changes break silently | HIGH |
| storage.ts | Data corruption possible | HIGH |
| DiagramCanvas | Layout regressions | MEDIUM |
| AI actions | Wrong component modified | MEDIUM |

---

## Performance Traps

1. **App.tsx re-renders** - Large component, many state changes
2. **Diagram with 50+ components** - SVG gets sluggish
3. **Inventory search** - No debounce on filter
4. **IndexedDB on every message** - Could batch writes
