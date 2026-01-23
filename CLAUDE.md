# CLAUDE.md

## Quick Start

1. `npm install && npm run dev` → localhost:3000
2. Set `GEMINI_API_KEY` in `.env.local`
3. Read `types.ts` first, then `App.tsx:1-150` for state

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run preview  # Preview build
```

## Critical Files

| Priority | File                           | Why                                  |
| -------- | ------------------------------ | ------------------------------------ |
| 1        | types.ts                       | All interfaces                       |
| 2        | App.tsx                        | Root orchestration                   |
| 3        | contexts/*.tsx                 | Domain state (6 contexts)            |
| 4        | services/gemini/               | Modular AI integration               |
| 5        | services/aiMetricsService.ts   | AI Latency/Success tracking          |
| 6        | hooks/useAIActions.ts          | Action dispatch hub                  |
| 7        | hooks/actions/*.ts             | Handler registry (refactored)        |
| 8        | hooks/useConversations.ts      | Conversation state                   |
| 9        | hooks/useInventorySync.ts      | Inventory-diagram sync               |
| 10       | ref/*.md                       | Detailed docs                        |

## Architecture

**State**: React Context API + App.tsx coordination

| Context | Purpose |
|---------|---------|
| DiagramContext | Diagram state + undo/redo |
| InventoryContext | Component library |
| LayoutContext | UI layout + sidebars |
| ConversationContext | Chat session |
| AssistantStateContext | AI status |
| VoiceAssistantContext | Voice I/O |

**Persistence**:
- `inventory` → `localStorage.cm_inventory` + IndexedDB
- `history` → `localStorage.cm_autosave` (undo/redo)
- `liveSessionRef` → useRef (not useState!)

**Z-Index**: Canvas(0) < Header(10) < Chat(20) < Inventory(40) < Modals(50)

## ⚠️ Critical Pitfalls

| Issue          | Rule                                              |
| -------------- | ------------------------------------------------- |
| Gemini Schema  | OBJECT types MUST have `properties: {...}`        |
| Reload Race    | Add 100ms delay before `window.location.reload()` |
| Component Sync | Update BOTH inventory AND diagram                 |
| WebSocket      | Use `useRef` not `useState` for liveSession       |
| Veo URLs       | Append `&key=API_KEY` to video URLs               |

**Full details**: See [ref/pitfalls.md](ref/pitfalls.md)

## Gemini Models

| Task            | Model                           | Strategy |
| --------------- | ------------------------------- | -------- |
| Wiring diagrams | gemini-2.5-pro                  | Accuracy |
| Chat            | gemini-2.5-flash                | Speed    |
| Chat (Complex)  | gemini-2.5-pro                  | Accuracy |
| Images          | gemini-2.5-flash-image          | Speed    |
| Concept Art     | gemini-3-pro-image-preview      | Quality  |
| Video           | veo-3.1-fast-generate-preview   | Speed    |

## Key Patterns

**Dual Component Sync** - When editing (handled by `useInventorySync`):

```typescript
// InventoryContext - source of truth
updateItem(updated);

// DiagramContext - synced automatically
updateDiagram(curr => ({
  ...curr,
  components: curr.components.map(c => c.id === updated.id ? updated : c)
}));
```

**Missing Pin** - AI hallucinates pin → red pulsing dot (not crash)

## Reference Docs

| File                                                         | Content                      |
| ------------------------------------------------------------ | ---------------------------- |
| [ref/architecture.md](ref/architecture.md)                   | System design, data flow     |
| [ref/services.md](ref/services.md)                           | Service APIs                 |
| [ref/components.md](ref/components.md)                       | Component APIs               |
| [ref/contexts.md](ref/contexts.md)                           | Context providers            |
| [ref/hooks.md](ref/hooks.md)                                 | Custom hooks                 |
| [ref/patterns.md](ref/patterns.md)                           | Design patterns              |
| [ref/types.md](ref/types.md)                                 | TypeScript interfaces        |
| [ref/pitfalls.md](ref/pitfalls.md)                           | Gotchas & common mistakes    |
| [ref/visual-analysis-tools.md](ref/visual-analysis-tools.md) | OCR, diffing, a11y, CV tools |

## ⚠️ Complexity Hotspots

| File                           | LOC  | Status                          |
| ------------------------------ | ---- | ------------------------------- |
| components/diagram/Diagram3DView.tsx | 1833 | 🟡 Largest component            |
| components/DiagramCanvas.tsx   | 1227 | 🟡 Core canvas, complex         |
| components/ComponentEditorModal.tsx | 1159 | 🟡 Multi-tab editor            |
| components/Inventory.tsx       | 987  | 🟡 Could extract subcomponents  |
| services/gemini/               | 10 files | ✅ Refactored (was 934 LOC) |
| hooks/useAIActions.ts          | 153  | ✅ Refactored (was 523)         |

## Performance Optimizations (Applied)

- **Bundle**: 414KB → 150KB gzip (lazy loading, Tailwind build-time)
- **Code Splitting**: ThreeViewer, Modals in separate chunks
- **Memory**: ThreeViewer scene disposal, MediaRecorder cleanup
- **Rendering**: ChatMessage memoized, DiagramCanvas useMemo
