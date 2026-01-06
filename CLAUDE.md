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
| 2        | App.tsx                        | Centralized state (838 LOC)          |
| 3        | services/geminiService.ts      | AI integration (934 LOC)             |
| 4        | services/aiMetricsService.ts   | AI Latency/Success tracking          |
| 5        | services/circuitAnalysis.ts    | Rule-based verification              |
| 6        | hooks/useAIActions.ts          | Action dispatch hub                  |
| 7        | hooks/actions/\*.ts            | Handler registry (✅ refactored)     |
| 8        | hooks/useConversations.ts      | Conversation state                   |
| 9        | services/responseParser.ts     | AI response parsing                  |
| 10       | ref/\*.md                      | Detailed docs                        |

## Architecture

**State**: Centralized in App.tsx (no Redux/Context)

- `inventory` → `localStorage.cm_inventory`
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

**Dual Component Sync** - When editing:

```typescript
setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
updateDiagram({
  ...diagram,
  components: diagram.components.map((c) => (c.id === id ? updated : c)),
});
```

**Missing Pin** - AI hallucinates pin → red pulsing dot (not crash)

## Reference Docs

| File                                                         | Content                      |
| ------------------------------------------------------------ | ---------------------------- |
| [ref/architecture.md](ref/architecture.md)                   | System design, data flow     |
| [ref/services.md](ref/services.md)                           | Service APIs                 |
| [ref/components.md](ref/components.md)                       | Component APIs               |
| [ref/patterns.md](ref/patterns.md)                           | Design patterns              |
| [ref/types.md](ref/types.md)                                 | TypeScript interfaces        |
| [ref/pitfalls.md](ref/pitfalls.md)                           | Gotchas & common mistakes    |
| [ref/visual-analysis-tools.md](ref/visual-analysis-tools.md) | OCR, diffing, a11y, CV tools |

## ⚠️ Complexity Hotspots

| File                      | LOC | Status                         |
| ------------------------- | --- | ------------------------------ |
| services/geminiService.ts | 934 | 🟡 Monolithic, monitor         |
| components/Inventory.tsx  | 936 | 🟡 Could extract subcomponents |
| hooks/useAIActions.ts     | 153 | ✅ Refactored (was 523)        |

## Performance Optimizations (Applied)

- **Bundle**: 414KB → 150KB gzip (lazy loading, Tailwind build-time)
- **Code Splitting**: ThreeViewer, Modals in separate chunks
- **Memory**: ThreeViewer scene disposal, MediaRecorder cleanup
- **Rendering**: ChatMessage memoized, DiagramCanvas useMemo

