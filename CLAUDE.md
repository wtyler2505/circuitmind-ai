# CLAUDE.md

## Quick Start

1. `npm install && npm run dev` → localhost:3000
2. Set `GEMINI_API_KEY` in `.env.local`
3. Read `types.ts` first, then `App.tsx` for provider nesting

## Commands

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build (Vite)
npm run preview      # Preview production build
npm test             # Run tests (vitest)
npm run test:watch   # Watch mode tests
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier format all files
npm run format:check # Check formatting
npm run test:visual  # Playwright screenshot tests
```

## Project Structure

Flat root layout (no `src/` directory). All code lives at project root:

```
├── App.tsx              # Root component (20 context providers)
├── types.ts             # All TypeScript interfaces (290 LOC)
├── index.tsx            # React entry point
├── index.css            # Global styles
├── components/          # 108 files across 8+ subdirectories
├── services/            # 82 files across 12 subdirectories
├── hooks/               # 46 files (40 hooks + 6 action handlers)
├── contexts/            # 19 React Context providers
├── server/              # Express 5 + SQLite backend (port 3001)
├── conductor/           # Spec-driven dev (product vision, tracks)
├── data/                # Initial inventory, tutorials
├── styles/              # Color definitions
├── ref/                 # 12 reference docs (architecture, APIs, patterns)
├── docs/                # Extended documentation (18 subdirectories)
├── tests/               # Test setup and utilities
├── scripts/             # Build/audit utility scripts
├── public/              # Static assets (UI, parts, mediapipe)
├── fritzing-parts/      # 10k+ Fritzing part library
└── .braingrid/          # BrainGrid spec-driven dev integration
```

## Critical Files

| Priority | File | Why |
|----------|------|-----|
| 1 | types.ts | All interfaces (ActionType, ElectronicComponent, WiringDiagram, etc.) |
| 2 | App.tsx | Root orchestration, 20 nested context providers |
| 3 | contexts/*.tsx | Domain state (19 contexts) |
| 4 | services/gemini/ | Modular AI integration (5 core + 11 feature files) |
| 5 | services/componentValidator.ts | Inventory ↔ diagram consistency (502 LOC) |
| 6 | services/storage.ts | Dual persistence: localStorage + IndexedDB (324 LOC) |
| 7 | hooks/useAIActions.ts | Action dispatch hub (~250 LOC) |
| 8 | hooks/actions/*.ts | Handler registry (6 files, ~500 LOC) |
| 9 | hooks/useConversations.ts | Conversation CRUD + persistence (349 LOC) |
| 10 | hooks/useInventorySync.ts | Inventory-diagram auto-sync (225 LOC) |
| 11 | services/aiMetricsService.ts | AI latency/success tracking |
| 12 | ref/*.md | Detailed reference docs (12 files) |

## Architecture

**State**: React Context API (20 providers) + App.tsx coordination. No Redux.

### Context Providers (nesting order from App.tsx)

| Context | Purpose |
|---------|---------|
| LayoutContext | UI layout, sidebars, modes, focus |
| AssistantStateContext | AI generation mode, image size, deep thinking |
| HealthContext | System health (CPU, memory, frame rate) |
| AuthContext | Authentication & session |
| UserContext | User profile & preferences |
| ToastProvider | Toast notification system (from hooks/useToast) |
| NotificationContext | Alert notifications |
| DashboardContext | Dashboard widget layout |
| MacroContext | Action macro recording/playback |
| InventoryContext | Component library (source of truth) |
| AdvancedInventoryContext | Catalog/location-aware inventory (server-backed) |
| SyncContext | Cross-device sync state |
| ConversationContext | Chat sessions (wraps useConversations) |
| DiagramContext | Diagram state + undo/redo history |
| SelectionContext | Multi-select state |
| TelemetryContext | Event tracking & analytics |
| HUDContext | Heads-up display content |
| SimulationContext | Circuit simulation state |
| VoiceAssistantContext | Voice I/O, live audio mode |
| TutorialContext | Tutorial progression |

### Persistence

- `inventory` → `localStorage.cm_inventory` + IndexedDB `INVENTORY` store
- `history` → `localStorage.cm_autosave` (undo/redo)
- `conversations` → IndexedDB `CONVERSATIONS` + `MESSAGES` stores
- `parts` → IndexedDB (binary FZPZ cache)
- `api key` → `localStorage.cm_gemini_api_key`
- `liveSessionRef` → useRef (not useState!)

### Z-Index Layers

Canvas(0) < Header(10) < Chat(20) < Inventory(40) < Modals(50)

## Services Architecture

**82 files** organized by domain:

| Directory | Files | Purpose |
|-----------|-------|---------|
| services/gemini/ | 16 | AI integration core (client, prompts, parsers, 11 features) |
| services/api/ | 4 | API gateway, dispatcher, tokens, events |
| services/analytics/ | 1 | Project-wide analytics |
| services/config/ | 1 | Runtime configuration |
| services/error/ | 1 | Diagnostics hub |
| services/feedback/ | 1 | User correction handling |
| services/gesture/ | 2 | Gesture engine + metrics |
| services/localization/ | 2 | i18n + unit conversion |
| services/logging/ | 1 | Audit logging |
| services/search/ | 1 | Full-text search indexing |
| services/viz/ | 1 | Data visualization engine |
| services/ (root) | ~40 | Core services (storage, auth, simulation, collab, etc.) |

### Gemini Service Modules (services/gemini/)

**Core**: `client.ts` (singleton), `types.ts` (schemas), `prompts.ts` (templates), `parsers.ts` (response extraction)

**Features** (services/gemini/features/):
`bom.ts`, `chat.ts`, `components.ts`, `datasheets.ts`, `hud.ts`, `media.ts`, `predictions.ts`, `simulation.ts`, `suggestions.ts`, `versioning.ts`, `wiring.ts`

## Gemini Models (from services/gemini/client.ts)

| Constant | Model | Used For |
|----------|-------|----------|
| WIRING | gemini-2.5-pro | Wiring diagram generation (accuracy) |
| CHAT | gemini-2.5-flash | Default chat (speed) |
| CONTEXT_CHAT_DEFAULT | gemini-2.5-flash | Context-aware chat (speed) |
| CONTEXT_CHAT_COMPLEX | gemini-2.5-pro | Complex chat queries (accuracy) |
| VISION | gemini-2.5-pro | Image analysis |
| IMAGE | gemini-2.5-flash | Multimodal input |
| IMAGE_GEN | imagen-3.0-generate-001 | Image generation |
| THUMBNAIL | imagen-3.0-generate-001 | Thumbnail generation |
| VIDEO | veo-2.0-generate-001 | Video generation |
| TTS | gemini-2.5-flash-tts | Text-to-speech |
| AUDIO_REALTIME | gemini-2.5-flash-live | Live audio streaming |
| AUDIO_TRANSCRIPTION | gemini-2.5-flash | Audio transcription |
| EMBEDDING | text-embedding-004 | Semantic search/RAG |
| CODE_GEN | gemini-2.5-pro | Three.js code generation |
| THINKING | gemini-2.5-flash | Deep thinking mode |
| SMART_FILL / PART_FINDER / AUTO_ID | gemini-2.5-flash | Component intelligence |
| ASSIST_EDITOR / SUGGEST_PROJECTS | gemini-2.5-flash | Editor AI chat, project suggestions |

## Hooks & Action System

### Action Handler Registry

```
ActionIntent → useAIActions.execute()
  → getHandler(action.type)        // hooks/actions/index.ts
  → handler(payload, context)      // domain-specific handler
  → HandlerResult { success, error }
  → auditService.log() + metrics
```

**Handler modules** (hooks/actions/):

- `diagramHandlers.ts` — addComponent, removeComponent, clearCanvas, createConnection, removeConnection
- `canvasHandlers.ts` — highlight, centerOn, zoomTo, panTo, resetView, highlightWire
- `navHandlers.ts` — openInventory, closeInventory, openSettings, closeSettings, openComponentEditor, switchGenerationMode
- `appControlHandlers.ts` — undo, redo, saveDiagram, loadDiagram, setUserLevel, learnFact, analyzeVisuals

### AI Autonomy

Actions classified as safe/unsafe in `types.ts:ACTION_SAFETY`. Safe actions (viewport, UI) auto-execute; unsafe actions (diagram mutations) require user confirmation. Configurable via `useAutonomySettings`.

## Key Patterns

**Inventory = Single Source of Truth** — `componentValidator.ts` enforces consistency. `useInventorySync` auto-syncs diagram components when inventory changes:

```typescript
// InventoryContext - source of truth
updateItem(updated);

// DiagramContext - synced automatically by useInventorySync
updateDiagram(curr => ({
  ...curr,
  components: curr.components.map(c => c.id === updated.id ? updated : c)
}));
```

**Missing Pin** — AI hallucinates pin → red pulsing dot (not crash)

**Dual-Layer Persistence** — localStorage for small/fast data, IndexedDB for large structures. `storage.ts` handles quota exceeded by migrating to IndexedDB.

**Code Splitting** — Vendor chunks: react, three, @google/genai, framer-motion, markdown. Lazy-loaded: ComponentEditorModal, ThreeViewer.

## Critical Pitfalls

| Issue | Rule |
|-------|------|
| Gemini Schema | OBJECT types MUST have `properties: {...}` |
| Reload Race | Add 100ms delay before `window.location.reload()` |
| Component Sync | Update BOTH inventory AND diagram (or use useInventorySync) |
| WebSocket | Use `useRef` not `useState` for liveSession |
| Veo URLs | Append `&key=API_KEY` to video URLs |
| Provider Order | Context nesting in App.tsx matters — diagram depends on inventory |
| IndexedDB Quota | storage.ts handles gracefully, but test with large datasets |

**Full details**: See [ref/pitfalls.md](ref/pitfalls.md)

## Complexity Hotspots

| File | LOC | Status |
|------|-----|--------|
| components/diagram/Diagram3DView.tsx | ~1950 | 🔴 Largest component |
| components/DiagramCanvas.tsx | ~1380 | 🔴 Core canvas, complex |
| components/ComponentEditorModal.tsx | ~1320 | 🟡 Multi-tab editor |
| services/threePrimitives.ts | ~1260 | 🟡 3D shape generators |
| components/MainLayout.tsx | ~1020 | 🟡 Root orchestrator |
| components/SettingsPanel.tsx | ~1000 | 🟡 7 sub-panels |
| components/Inventory.tsx | ~980 | 🟡 Could extract subcomponents |
| components/diagram/DiagramNode.tsx | ~1010 | 🟡 SVG node rendering |
| components/diagram/componentShapes.ts | ~700 | 🟡 40+ shape definitions |
| services/componentValidator.ts | ~500 | ✅ Well-structured |
| services/gemini/ | 16 files | ✅ Refactored, modular |
| hooks/useAIActions.ts | ~250 | ✅ Refactored (was 523) |

## Component Hierarchy

```
MainLayout (orchestrator)
├── AppHeader
├── DiagramCanvas
│   ├── DiagramNode[], Wire[]
│   ├── Diagram3DView → ThreeViewer (lazy)
│   ├── PredictiveGhost, NeuralCursor, TacticalHUD
│   ├── DiffOverlay, ConflictResolver, MismatchMarker
│   └── RemoteCursor (collaboration)
├── Inventory (sidebar)
│   ├── InventoryList → InventoryItem[]
│   ├── BOMModal, MacroPanel
│   └── HardwareTerminal
├── ChatPanel (sidebar)
│   ├── ConversationSwitcher
│   ├── ChatMessage[] (memoized)
│   └── AssistantTabs
├── ComponentEditorModal (lazy)
├── SettingsPanel (7 sub-panels)
├── DashboardView (widget grid)
└── Layout overlays (OmniSearch, SimControls, MentorOverlay, etc.)
```

## Code Style

- **Formatter**: Prettier (semi, single quotes, 2-space indent, 100 print width, trailing commas ES5)
- **Linter**: ESLint with TypeScript, React, React Hooks plugins
- **TypeScript**: ES2022 target, ESNext modules, bundler resolution, path alias `@/*` → root
- **CSS**: Tailwind CSS v4 with custom cyber theme (neon cyan/purple/green/amber)
- **Fonts**: Space Grotesk (headings), JetBrains Mono (code)
- **Testing**: Vitest + jsdom + @testing-library/react; Playwright for visual tests

## Performance Optimizations (Applied)

- **Bundle**: 414KB → 150KB gzip (lazy loading, Tailwind build-time purge)
- **Code Splitting**: vendor-react, vendor-three, vendor-ai, vendor-ui, vendor-markdown chunks
- **Lazy Loading**: ComponentEditorModal, ThreeViewer in separate chunks
- **Memory**: ThreeViewer scene disposal, MediaRecorder cleanup
- **Rendering**: ChatMessage memoized, DiagramCanvas useMemo, Inventory React.memo
- **Chunk limit**: 400KB warning threshold

## Reference Docs

| File | Content |
|------|---------|
| [ref/architecture.md](ref/architecture.md) | System design, data flow |
| [ref/services.md](ref/services.md) | Service APIs |
| [ref/components.md](ref/components.md) | Component APIs |
| [ref/contexts.md](ref/contexts.md) | Context providers |
| [ref/hooks.md](ref/hooks.md) | Custom hooks |
| [ref/patterns.md](ref/patterns.md) | Design patterns |
| [ref/types.md](ref/types.md) | TypeScript interfaces |
| [ref/features.md](ref/features.md) | Feature documentation |
| [ref/product.md](ref/product.md) | Product overview & roadmap |
| [ref/pitfalls.md](ref/pitfalls.md) | Gotchas & common mistakes |
| [ref/visual-analysis-tools.md](ref/visual-analysis-tools.md) | OCR, diffing, a11y, CV tools |

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.3 | UI framework |
| @google/genai | 1.34.0 | Gemini AI SDK |
| three | 0.182.0 | 3D graphics |
| framer-motion | 12.29.0 | Animations |
| yjs + y-webrtc | 13.6.29 | Real-time collaboration (CRDT) |
| i18next | 25.8.0 | Internationalization |
| @mediapipe/tasks-vision | 0.10.32 | Gesture recognition |
| isomorphic-git | 1.36.2 | In-browser Git |
| recharts | 3.7.0 | Charts/graphs |
| virtua | 0.48.3 | List virtualization |

## Agent Teams - Project File Ownership

When using agent teams on this project, teammates MUST own non-overlapping file sets. Use these boundaries:

| Domain | Files Owned | Good Teammate Name |
|--------|-------------|-------------------|
| UI Components | `components/*.tsx` (not diagram/) | `ui-dev` |
| Canvas/Diagram | `components/DiagramCanvas.tsx`, `components/diagram/` | `canvas-dev` |
| 3D/ThreeViewer | `components/ThreeViewer.tsx`, `services/three*.ts` | `3d-dev` |
| State/Contexts | `contexts/*.tsx` | `state-dev` |
| Hooks/Actions | `hooks/*.ts`, `hooks/actions/` | `hooks-dev` |
| AI/Gemini | `services/gemini/`, `services/aiMetricsService.ts`, `services/geminiService.ts` | `ai-dev` |
| Services (other) | `services/*.ts` (not gemini/, three*) | `services-dev` |
| Testing | `tests/`, `components/__tests__/`, `services/__tests__/` | `test-dev` |
| Styles/Config | `styles/`, `tailwind.config.js`, `vite.config.ts`, `tsconfig.json` | `config-dev` |

**Common team compositions:**

**Feature work (3-4 teammates):**

```
Create an agent team. Spawn teammates:
- ui-dev: owns components/ (builds the UI)
- state-dev: owns contexts/ and hooks/ (wires state)
- ai-dev: owns services/gemini/ (handles AI integration)
- test-dev: owns tests/ (writes test coverage)
Require plan approval for state-dev and ai-dev.
```

**Refactoring (2-3 teammates):**

```
Create an agent team. Spawn teammates:
- refactor-dev: owns the files being refactored
- test-dev: writes/updates tests for refactored code
- reviewer: read-only, reviews changes and challenges approaches
Use delegate mode for the lead.
```

**Debugging (3-5 teammates):**

```
Create an agent team to investigate [issue]. Spawn teammates for
competing hypotheses. Have them challenge each other's theories.
```

**Key context to include in spawn prompts:**

- State lives in React Context (`contexts/*.tsx`), NOT Redux
- Dual-sync pattern: inventory AND diagram must stay in sync (see `hooks/useInventorySync.ts`)
- Gemini schemas: OBJECT types MUST have `properties: {}`
- `liveSessionRef` uses `useRef`, NOT `useState`
- Z-Index layers: Canvas(0) < Header(10) < Chat(20) < Inventory(40) < Modals(50)

<!-- BEGIN BRAINGRID INTEGRATION -->
## BrainGrid Integration

Spec-driven development: turn ideas into AI-ready tasks.

**Slash Commands:**

| Command                     | Description                   |
| --------------------------- | ----------------------------- |
| `/specify [prompt]`         | Create AI-refined requirement |
| `/breakdown [req-id]`       | Break into tasks              |
| `/build [req-id]`           | Get implementation plan       |
| `/save-requirement [title]` | Save plan as requirement      |

**Workflow:**

```bash
/specify "Add auth"  # → REQ-123
/breakdown REQ-123   # → tasks
/build REQ-123       # → plan
```

**Task Commands:**

```bash
braingrid task list -r REQ-123      # List tasks
braingrid task show TASK-456        # Show task details
braingrid task update TASK-456 --status COMPLETED
```

**Auto-detection:** Project from `.braingrid/project.json`, requirement from branch (`feature/REQ-123-*`).

**Full documentation:** [.braingrid/README.md](./.braingrid/README.md)

<!-- END BRAINGRID INTEGRATION -->

## Project Reference

@.ref/project-dna.md
