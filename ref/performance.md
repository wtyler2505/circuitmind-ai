# CircuitMind AI - Performance Reference

> Documented from `vite.config.ts`, lazy-loading patterns, and simulation architecture.

## Build Configuration

**Bundler**: Vite 6 with Rollup
**Chunk size warning**: 400KB (configured in `vite.config.ts`)

## Code Splitting (Vendor Chunks)

Configured in `vite.config.ts > build.rollupOptions.output.manualChunks`:

| Chunk Name | Packages Included | Purpose |
|------------|-------------------|---------|
| `vendor-react` | react, react-dom | Core React runtime |
| `vendor-three` | three | 3D rendering engine |
| `vendor-ai` | @google/genai | Gemini AI SDK |
| `vendor-ui` | framer-motion | Animation library |
| `vendor-markdown` | react-markdown, remark-gfm, remark-breaks | Markdown rendering |
| `vendor-collab` | yjs, y-webrtc | Real-time collaboration (CRDT) |
| `vendor-git` | isomorphic-git, @isomorphic-git/* | In-browser Git |
| `vendor-charts` | recharts | Chart/graph library |
| `vendor-i18n` | i18next, react-i18next | Internationalization |
| `vendor-pdf` | jspdf | PDF generation |
| `vendor-math` | mathjs | Math library (MNA solver) |
| `vendor-grid` | react-grid-layout | Dashboard widget grid |
| `vendor-zip` | jszip | ZIP handling (FZPZ parts) |
| `vendor-xml` | xml-js | XML parsing (FZPZ parts) |

### Application Service Chunks

| Chunk Name | Source | Purpose |
|------------|--------|---------|
| `app-gemini` | services/gemini/* | AI service modules |
| `app-simulation` | services/simulation/*, services/simulationEngine | MNA engine |

## Lazy-Loaded Components

These components are loaded on demand via `React.lazy()`:

| Component | Trigger |
|-----------|---------|
| `ComponentEditorModal` | User double-clicks a component |
| `ThreeViewer` | User opens 3D view or component 3D tab |

## PWA Configuration

**Plugin**: vite-plugin-pwa with Workbox

### Service Worker Caching

| Pattern | Strategy | Cache Name | Max Entries | TTL |
|---------|----------|------------|-------------|-----|
| Google Fonts | CacheFirst | google-fonts-cache | 10 | 365 days |
| Images (png/jpg/svg/webp) | CacheFirst | images-cache | 60 | 30 days |
| JS/CSS | StaleWhileRevalidate | static-resources | 50 | 7 days |

**Per-file size limit**: 3MB (workbox `maximumFileSizeToCacheInBytes`)
**Navigate fallback**: `index.html` (SPA routing)

### PWA Manifest

- Name: CircuitMind AI
- Theme color: `#050508`
- Display: standalone
- Icons: `/assets/ui/logo.png` (192x192, 512x512)

## MNA Simulation Worker Pattern

The Modified Nodal Analysis (MNA) circuit simulation runs in a dedicated Web Worker to prevent UI lag.

### Architecture

```
Main Thread                          Web Worker
     |                                    |
     |--- simulationWorkerBridge.ts ------>|
     |    (postMessage)                   |
     |                                    |--- simulationWorker.worker.ts
     |                                    |    |
     |                                    |    +-- mnaGraphBuilder.ts     (build circuit graph)
     |                                    |    +-- mnaMatrixAssembler.ts  (assemble MNA matrix)
     |                                    |    +-- mnaSolver.ts           (solve via LU decomposition)
     |                                    |    +-- mnaErrorDetector.ts    (detect errors)
     |                                    |    +-- mnaResultFormatter.ts  (format results)
     |                                    |    +-- componentValueExtractor.ts (extract values)
     |                                    |
     |<--- postMessage (results) ---------|
```

### Key Implementation Details

- `mathjs lusolve()` returns Matrix object -- MUST call `.valueOf()` before array indexing
- Ground node = 0, non-ground nodes sequential from 1 (1-indexed in matrix = nodeNum-1)
- Floating node BFS propagates through component internals
- Stamp functions skip ground entries (row/column eliminated)
- LED modeled as voltage source (Vf) + series resistor on same auxiliary variable
- Component models identified via `component.type` + name regex patterns

### Files (services/simulation/)

| File | LOC (approx) | Purpose |
|------|-------------|---------|
| `mnaSolver.ts` | Core solver | DC analysis via LU decomposition |
| `mnaMatrixAssembler.ts` | Matrix assembly | Stamp-based MNA matrix construction |
| `mnaGraphBuilder.ts` | Graph builder | Circuit topology from diagram |
| `mnaErrorDetector.ts` | Error detection | Floating nodes, short circuits |
| `mnaResultFormatter.ts` | Formatting | Human-readable simulation results |
| `componentValueExtractor.ts` | Value extraction | Electrical values from component data |
| `simulationWorker.worker.ts` | Web Worker | Worker entry point |
| `simulationWorkerBridge.ts` | Bridge | Main thread <-> Worker communication |
| `types.ts` | Types | Simulation-specific TypeScript types |
| `workerTypes.ts` | Worker types | Message types for Worker protocol |

## Runtime Optimizations

### Component Memoization

| Component | Technique |
|-----------|-----------|
| `ChatMessage` | `React.memo` to prevent re-render on parent state changes |
| `DiagramCanvas` | `useMemo` for derived data |
| `Inventory` | `React.memo` wrapper |
| `InventoryList` | Virtualized via `virtua` (VList) |

### Three.js Memory Management

- Scene disposal on ThreeViewer unmount (geometry, material, texture cleanup)
- MediaRecorder cleanup on voice/video recording end
- URL.createObjectURL cached in ref Map, revoked on unmount

### Vite Dev Optimizations

- Path alias: `@/*` maps to project root
- `axe-core` excluded from production via empty module replacement
- Node polyfills for Buffer, global, process (vite-plugin-node-polyfills)

## Environment Variables

Configured in `vite.config.ts > define`:

```javascript
'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
```

Loaded from `.env.local` via `loadEnv(mode, '.', '')`.

## Test Configuration

- **Framework**: Vitest 4 with jsdom environment
- **Setup**: `./tests/setup.tsx`
- **Globals**: enabled
- **Clear mocks**: enabled
- **Concurrent**: disabled (`sequence: { concurrent: false }`) to prevent axe-core race conditions

## Performance Targets

| Metric | Target |
|--------|--------|
| Canvas FPS | 60 FPS with <50 components |
| Inventory hydration | <100ms (manifest-first) |
| Gzip bundle (initial) | ~150KB |
| Chunk warning threshold | 400KB |
| SW per-file cache limit | 3MB |
