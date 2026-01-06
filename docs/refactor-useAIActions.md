# Refactor Plan: useAIActions.ts

**Current:** 523 lines, CCN 41
**Target:** <150 lines main hook, CCN <10

## Problem Analysis

```
useAIActions.ts (523 lines)
├── Helper functions (1-51) ✓ OK
├── Interfaces (52-105) ✓ OK  
├── useAIActions hook (107-523) ❌ GOD FUNCTION
    ├── executeAction (136-406) - 270 lines, 14 switch cases
    ├── execute wrapper (408-426)
    ├── confirm/reject (428-442)
    ├── undo (444-455)
    └── shortcuts (457-499) - trivial wrappers
```

## Refactor Strategy

### Phase 1: Extract Action Handlers

Create handler modules by category:

```
hooks/
├── useAIActions.ts          # Main orchestrator (slim)
├── actions/
│   ├── index.ts             # Handler registry
│   ├── canvasHandlers.ts    # highlight, centerOn, zoomTo, resetView, highlightWire
│   ├── navHandlers.ts       # openInventory, closeSettings, etc.
│   └── diagramHandlers.ts   # addComponent, removeComponent, connections
```

**Handler interface:**
```typescript
type ActionHandler<T = unknown> = (
  payload: T,
  context: ActionContext
) => Promise<{ success: boolean; error?: string }>;

interface ActionContext {
  canvasRef: React.RefObject<DiagramCanvasRef>;
  diagram: WiringDiagram | null;
  inventory: ElectronicComponent[];
  updateDiagram: (d: WiringDiagram) => void;
  setIsInventoryOpen: (open: boolean) => void;
  // ... etc
}
```

**Registry pattern:**
```typescript
// actions/index.ts
export const actionHandlers: Record<ActionType, ActionHandler> = {
  highlight: canvasHandlers.highlight,
  centerOn: canvasHandlers.centerOn,
  zoomTo: canvasHandlers.zoomTo,
  // ...
};

// Usage in useAIActions:
const handler = actionHandlers[action.type];
if (!handler) throw new Error(`Unknown action: ${action.type}`);
return handler(action.payload, context);
```

### Phase 2: Split Hook Responsibilities

```typescript
// useActionExecution.ts - Core logic
export function useActionExecution(context: ActionContext) {
  return { execute, confirmAction, rejectAction };
}

// useActionHistory.ts - History + undo
export function useActionHistory() {
  return { actionHistory, canUndo, undo };
}

// useAutonomySettings.ts - Settings management
export function useAutonomySettings() {
  return { autonomySettings, updateAutonomySettings };
}

// useAIActions.ts - Thin orchestrator
export function useAIActions(options: UseAIActionsOptions) {
  const settings = useAutonomySettings();
  const history = useActionHistory();
  const execution = useActionExecution(context, settings, history);
  
  return {
    ...execution,
    ...history,
    ...settings,
    // shortcuts inline or separate hook
  };
}
```

### Phase 3: Simplify Shortcuts

Current shortcuts are trivial:
```typescript
const openInventory = useCallback(() => {
  setIsInventoryOpen(true);
}, [setIsInventoryOpen]);
```

Option A: Inline them (if only used in this hook)
Option B: Keep but don't wrap in useCallback (they're just setState calls)
Option C: Remove from hook, let consumers call directly

## File Breakdown After Refactor

| File | Lines | CCN | Purpose |
|------|-------|-----|---------|
| useAIActions.ts | ~80 | <5 | Orchestrator |
| useActionExecution.ts | ~60 | <8 | Execute/confirm/reject |
| useActionHistory.ts | ~40 | <5 | History + undo |
| useAutonomySettings.ts | ~30 | <3 | Settings |
| actions/canvasHandlers.ts | ~60 | <5 | Canvas actions |
| actions/navHandlers.ts | ~40 | <5 | Navigation actions |
| actions/diagramHandlers.ts | ~100 | <8 | Diagram mutations |
| actions/index.ts | ~20 | <2 | Registry |
| **Total** | ~430 | - | Same functionality, distributed |

## Execution Order

1. [ ] Create `hooks/actions/` directory
2. [ ] Extract canvas handlers (lowest risk)
3. [ ] Extract nav handlers
4. [ ] Extract diagram handlers (most complex - has undo logic)
5. [ ] Create handler registry
6. [ ] Refactor executeAction to use registry
7. [ ] Extract useAutonomySettings
8. [ ] Extract useActionHistory
9. [ ] Slim down main hook
10. [ ] Verify all tests pass
11. [ ] Update imports in App.tsx

## Risk Mitigation

- Keep original file as `.backup` until verified
- Refactor one handler category at a time
- Run app after each phase
- Existing tests in `components/__tests__/` should catch regressions

## Success Criteria

- [ ] Main hook <150 lines
- [ ] No function >50 lines
- [ ] CCN <10 for all files
- [ ] All existing functionality preserved
- [ ] No new dependencies added
