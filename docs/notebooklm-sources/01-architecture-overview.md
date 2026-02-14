# CircuitMind AI -- Architecture Overview

> Exhaustive architecture documentation for the CircuitMind AI project.
> Generated 2026-02-08. This document is self-contained and designed for use as a NotebookLM source.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [System Bootstrapping](#2-system-bootstrapping)
3. [Context Provider Architecture](#3-context-provider-architecture)
4. [Module Dependency Graph](#4-module-dependency-graph)
5. [Data Flow Architecture](#5-data-flow-architecture)
6. [Design Decisions and Rationale](#6-design-decisions-and-rationale)
7. [Code Splitting Architecture](#7-code-splitting-architecture)
8. [PWA Architecture](#8-pwa-architecture)
9. [Real-Time Collaboration Architecture](#9-real-time-collaboration-architecture)
10. [AI Integration Architecture](#10-ai-integration-architecture)
11. [Error Handling Architecture](#11-error-handling-architecture)
12. [Security Architecture](#12-security-architecture)
13. [Performance Architecture](#13-performance-architecture)
14. [Persistence Architecture](#14-persistence-architecture)
15. [Action System Architecture](#15-action-system-architecture)
16. [Component Hierarchy](#16-component-hierarchy)
17. [Z-Index Layer Map](#17-z-index-layer-map)

---

## 1. Project Identity

**CircuitMind AI** is a browser-based electronic circuit design tool with AI assistance. It runs entirely client-side as a React 19 Single Page Application bundled with Vite 6.

| Attribute | Value |
|-----------|-------|
| Framework | React 19.2.3 (no Next.js -- pure SPA) |
| Language | TypeScript 5.x (ES2022 target, bundler module resolution) |
| Bundler | Vite 6.x |
| AI Backend | Google Gemini (15+ model configurations via @google/genai 1.34) |
| 3D Engine | Three.js 0.182 (lazy-loaded) |
| Collaboration | Yjs 13.6 + y-webrtc (CRDT-based real-time sync) |
| Styling | Tailwind CSS v4 with custom cyberpunk theme |
| Testing | Vitest + jsdom + @testing-library/react; Playwright for visual tests |
| Source Files | 231 files, flat root layout (no `src/` directory) |
| Dev Server Port | 3000 |

### Why No `src/` Directory

The codebase uses a flat root layout. All source code lives directly under the project root with subdirectories for organization (`components/`, `services/`, `hooks/`, `contexts/`, `data/`, `styles/`). The Vite config uses `@` as a path alias pointing to the project root:

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, '.'),
  }
}
```

This means imports like `@/services/storage` resolve to `/home/wtyler/circuitmind-ai/services/storage`. The flat layout reduces nesting depth and makes it immediately obvious where files live relative to the project root.

---

## 2. System Bootstrapping

The application boots through a three-stage pipeline: HTML shell, React mount, and provider initialization.

### Stage 1: HTML Shell (`index.html`)

```
index.html
  |-- Loads Google Fonts (IBM Plex Sans Condensed + IBM Plex Mono)
  |-- Declares import map for ESM dependencies (react, three, @google/genai)
  |-- Links index.css
  |-- Renders inline boot loader animation (cyberpunk themed: pulsing logo + scanning bar)
  |-- Skip-to-content link (<a href="#main-content">) for accessibility
  |-- Mounts <script type="module" src="/index.tsx">
```

The boot loader is an inline `<div id="initial-loader">` with CSS keyframe animations placed inside `<div id="root">`. React replaces this entire subtree when it mounts, providing an instant visual transition from loading to app.

Key detail: The import map in `index.html` provides browser-native ESM resolution for React, Three.js, and Genai. Vite overrides these during development but they serve as fallbacks for direct module loading.

### Stage 2: React Entry Point (`index.tsx`)

```typescript
// index.tsx execution flow:
1. Polyfill Buffer for isomorphic-git (window.Buffer)
2. Define GlobalErrorBoundary class component
3. Conditionally load axe-core for dev-only accessibility auditing
4. Find #root element (throw if missing)
5. Create React root with createRoot()
6. Render: StrictMode > GlobalErrorBoundary > ToastProvider > App
```

**Buffer Polyfill**: isomorphic-git (used for in-browser Git operations) requires the Node.js `Buffer` API. This is polyfilled at the top level before any other code runs:

```typescript
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}
```

**GlobalErrorBoundary**: A class-based React error boundary that catches uncaught errors from anywhere in the component tree. When triggered, it renders a full-screen red-on-black "SYSTEM FAILURE" diagnostic screen showing the error message, stack trace, and a "REBOOT SYSTEM" button that calls `window.location.reload()`. This is the last line of defense against unrecoverable crashes.

**axe-core Accessibility Auditing**: In development mode only (`import.meta.env.DEV`), axe-core is dynamically imported and runs an automated accessibility audit 2 seconds after initial render. Violations are logged as grouped console warnings. In production, axe-core is aliased to an empty module via Vite config to eliminate it from the bundle entirely:

```typescript
// vite.config.ts
resolve: {
  alias: {
    ...(mode === 'production' ? { 'axe-core': path.resolve(__dirname, 'scripts/empty-module.js') } : {}),
  }
}
```

**Render Tree at this level**:
```
React.StrictMode
  GlobalErrorBoundary
    ToastProvider          <-- note: ToastProvider appears TWICE (here and inside App.tsx)
      App
```

The ToastProvider at this level is the outermost one, ensuring toast notifications work even if something fails deep in the provider tree.

### Stage 3: App Component and Provider Initialization (`App.tsx`)

```typescript
export default function App() {
  useEffect(() => {
    diagnosticsHub.init();   // Register global error/rejection handlers
  }, []);

  return (
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
  );
}
```

The `diagnosticsHub.init()` call registers `window.onerror` and `window.onunhandledrejection` handlers that route all uncaught errors to the audit logging service. This runs once on mount.

The only child of the entire provider tree is `<MainLayout />`, which is the root UI component that orchestrates all visible elements.

---

## 3. Context Provider Architecture

CircuitMind uses 17 React Context providers (plus ToastProvider) instead of a centralized state management library like Redux. Each provider owns a specific domain of application state.

### Provider Nesting Order and Dependencies

The nesting order in `App.tsx` is **load-bearing** -- it is not arbitrary. Inner providers can access outer providers via hooks, but not vice versa. The order encodes a dependency graph:

```
Layer 1 (Foundation -- no dependencies on other providers):
  LayoutProvider          -- UI layout state, sidebar widths, modes
  AssistantStateProvider  -- AI generation mode, image size, deep thinking toggle

Layer 2 (System monitors -- depend on Layer 1):
  HealthProvider          -- FPS, memory, AI latency (depends on LayoutProvider for setLowPerformanceMode)

Layer 3 (Auth & User -- independent domain):
  AuthProvider            -- PIN-based authentication, sessions, RBAC
  UserProvider            -- User profile, preferences, theme selection

Layer 4 (UI Infrastructure -- needs auth/user context):
  ToastProvider           -- Toast notification state and API
  NotificationProvider    -- Persistent notification history
  DashboardProvider       -- Widget grid layout

Layer 5 (Automation):
  MacroProvider           -- Action recording and playback

Layer 6 (Core Data -- the critical dependency chain):
  InventoryProvider       -- SINGLE SOURCE OF TRUTH for components
  ConversationProvider    -- Chat sessions and messages
  DiagramProvider         -- Wiring diagram state + undo/redo (DEPENDS ON InventoryProvider)

Layer 7 (Features -- depend on core data):
  SelectionProvider       -- Multi-select state for canvas
  TelemetryProvider       -- Hardware serial data
  HUDProvider             -- Heads-up display fragments

Layer 8 (Advanced features -- depend on diagram):
  SimulationProvider      -- Circuit simulation (DEPENDS ON DiagramProvider + NotificationProvider)
  VoiceAssistantProvider  -- Voice I/O, live audio streaming
  TutorialProvider        -- Guided tutorials (DEPENDS ON DiagramProvider + InventoryProvider)
```

### Critical Dependency: Inventory -> Diagram

The most important dependency in the entire system is that **DiagramProvider depends on InventoryProvider**. Inside `DiagramContext.tsx`:

```typescript
export const DiagramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { inventory } = useInventory();  // <-- reads from InventoryProvider
  // ...
  useEffect(() => {
    if (migrationRan.current || inventory.length === 0 || !history.present) return;
    const { diagram: migrated, repairedCount } = migrateLegacyDiagram(history.present, inventory);
    // ...
  }, [inventory, history.present]);
```

DiagramProvider calls `useInventory()` to access the inventory for legacy diagram migration. If InventoryProvider were nested inside DiagramProvider, this would throw a "useInventory must be used within an InventoryProvider" error.

Similarly, `SimulationProvider` uses `useDiagram()` and `useNotify()`, so it must be nested inside both DiagramProvider and NotificationProvider. `TutorialProvider` uses both `useDiagram()` and `useInventory()`.

### Complete Provider Reference Table

| # | Provider | Hook | Persistence | Key State |
|---|----------|------|-------------|-----------|
| 1 | LayoutProvider | `useLayout()` | localStorage (multiple keys) | activeMode, sidebar open/pinned/width, focus mode, performance mode, neural link toggle |
| 2 | AssistantStateProvider | `useAssistantState()` | None (session only) | generationMode ('chat'/'image'/'video'), imageSize, aspectRatio, deepThinking, recentHistory buffer (last 10 actions) |
| 3 | HealthProvider | `useHealth()` | None | FPS, memory usage, AI latency, health status ('healthy'/'warning'/'critical') |
| 4 | AuthProvider | `useAuth()` | localStorage (PIN hash + salt) | currentUser, isLocked, isSetup, RBAC permissions |
| 5 | UserProvider | `useUser()` | localStorage via userProfileService | user profile, preferences, expertise level, theme |
| 6 | ToastProvider | `useToast()` / `useToastApi()` | None | Active toast notifications (auto-dismiss) |
| 7 | NotificationProvider | `useNotify()` | None (session only) | Active notifications + history (last 100) |
| 8 | DashboardProvider | `useDashboard()` | localStorage `cm_dashboard_widgets` | Widget grid layout, edit mode |
| 9 | MacroProvider | `useMacros()` | localStorage `cm_macros` | Recording state, recorded steps, saved macros |
| 10 | InventoryProvider | `useInventory()` | localStorage `cm_inventory` + IndexedDB | Component library (source of truth), FZPZ lazy loading |
| 11 | ConversationProvider | `useConversationContext()` | IndexedDB (CONVERSATIONS + MESSAGES stores) | Conversation list, active conversation, messages |
| 12 | DiagramProvider | `useDiagram()` | localStorage `cm_autosave` | Wiring diagram, undo/redo history (past/present/future) |
| 13 | SelectionProvider | `useSelection()` | None | Selected component ID, active selection path |
| 14 | TelemetryProvider | `useTelemetry()` | None | Live hardware data keyed by `componentId:pin`, serial connection state, raw logs |
| 15 | HUDProvider | `useHUD()` | None | HUD fragments (info/warning/tip overlays), visibility toggle |
| 16 | SimulationProvider | `useSimulation()` | None | Simulation result, isSimulating flag, 2Hz tick loop |
| 17 | VoiceAssistantProvider | `useVoiceAssistant()` | None | Recording state, live mode (WebSocket), visual context providers, transcription |
| 18 | TutorialProvider | `useTutorial()` | None | Active quest, current step, auto-validation loop |

### Provider Implementation Patterns

All providers follow a consistent pattern:

1. **Create context** with `createContext<T | undefined>(undefined)`
2. **Provider component** manages state via `useState` and `useCallback`
3. **Export hook** that throws descriptive error if used outside provider:
   ```typescript
   export const useXxx = () => {
     const context = useContext(XxxContext);
     if (context === undefined) {
       throw new Error('useXxx must be used within an XxxProvider');
     }
     return context;
   };
   ```
4. **Memoization**: Several providers (Layout, Notification, HUD) use `React.useMemo` on their context value object to prevent unnecessary re-renders

---

## 4. Module Dependency Graph

### Top-Level Import Flow

```
index.html
  --> index.tsx
        --> App.tsx
              --> contexts/*.tsx (17 providers)
              --> components/MainLayout.tsx
                    --> components/layout/AppLayout.tsx (structural shell)
                    --> components/DiagramCanvas.tsx (SVG canvas)
                    --> components/Inventory.tsx (component library)
                    --> components/AssistantSidebar.tsx (chat panel wrapper)
                    --> components/layout/assistant/AssistantContent.tsx (chat UI)
                    --> lazy(() => import('./ComponentEditorModal'))
                    --> lazy(() => import('./SettingsPanel'))
                    --> hooks/*.ts (13+ hooks for behavior)
```

### Context Dependency Map

Which contexts consume which other contexts:

```
HealthProvider        --> useLayout()
DiagramProvider       --> useInventory()
SimulationProvider    --> useDiagram(), useNotify()
TutorialProvider      --> useDiagram(), useInventory()
```

All other providers are independent (they do not consume sibling contexts). However, many providers depend on singleton services:

```
LayoutProvider        --> storageService
InventoryProvider     --> storageService, FzpzLoader, partStorageService
ConversationProvider  --> useConversations hook --> storage.ts (IndexedDB operations)
DiagramProvider       --> storageService, componentValidator
AuthProvider          --> authService
UserProvider          --> userProfileService
TelemetryProvider     --> serialService, vizEngine
SimulationProvider    --> simulationEngine
VoiceAssistantProvider --> LiveSession (liveAudio.ts), transcribeAudio (geminiService.ts)
MacroProvider         --> macroEngine
```

### Service Dependency Map

Services are mostly standalone singletons, but some have inter-dependencies:

```
services/gemini/client.ts (singleton)
  --> used by all services/gemini/features/*.ts
  --> used by services/geminiService.ts (legacy facade)

services/storage.ts
  --> used by InventoryContext, DiagramContext, LayoutContext
  --> provides IndexedDB operations for conversations, messages, actions, inventory

services/error/diagnosticsHub.ts
  --> uses services/logging/auditService.ts

services/api/apiGateway.ts
  --> uses services/api/apiDispatcher.ts
  --> uses services/api/tokenService.ts
  --> uses services/gitService.ts

services/componentValidator.ts
  --> used by DiagramContext (migration)
  --> used by useInventorySync hook

services/collabService.ts
  --> uses yjs + y-webrtc
```

---

## 5. Data Flow Architecture

### Primary Data Flow: User Interaction to State Update

```
User Action (click, type, drag)
  |
  v
Component Event Handler (e.g., DiagramCanvas.onComponentSelect)
  |
  v
MainLayout callback (via useMainLayoutActions hook)
  |
  v
Context update function (e.g., useDiagram().updateDiagram)
  |
  v
React state update --> re-render --> UI updates
  |
  v
Persistence side-effect (useEffect writes to localStorage/IndexedDB)
```

### AI Chat Data Flow

```
User types message in AssistantContent
  |
  v
handleSendEnhancedMessage (from useChatHandler hook)
  |
  v
Build AI context (useAIContextBuilder) -- includes diagram state, inventory, selection
  |
  v
Call Gemini API (services/gemini/features/chat.ts)
  |
  v
Parse response (services/gemini/parsers.ts)
  |-- Extract diagram data (WiringDiagram)
  |-- Extract action intents (ActionIntent[])
  |-- Extract component references (ComponentReference[])
  |
  v
Create EnhancedChatMessage with all extracted data
  |
  v
conversationManager.addMessage() --> IndexedDB persistence
  |
  v
If diagram data present --> updateDiagram() --> DiagramContext
  |
  v
If action intents present --> check ACTION_SAFETY classification
  |-- Safe actions --> auto-execute via aiActions.execute()
  |-- Unsafe actions --> present as buttons for user confirmation
```

### Inventory-Diagram Sync Flow

The inventory is the single source of truth. When inventory changes, the diagram must sync:

```
InventoryContext.updateItem(component)
  |
  v
useInventorySync hook detects inventory change (via JSON snapshot comparison)
  |
  v
Debounced sync (300ms default, immediate on first sync)
  |
  v
componentValidator.syncDiagramWithInventory(diagram, inventory)
  |-- Matches diagram components to inventory by sourceInventoryId
  |-- Updates name, type, pins, description from inventory source
  |-- Returns { diagram: syncedDiagram, changeCount }
  |
  v
If changeCount > 0 --> updateDiagram(syncedDiagram) --> DiagramContext
  |
  v
Dev-mode validation: validateDiagramInventoryConsistency() logs warnings for mismatches
```

### Telemetry Data Flow (Hardware Integration)

```
Physical hardware (Arduino, ESP32, etc.)
  |
  v
Web Serial API (navigator.serial)
  |
  v
serialService.onData() callback
  |
  v
TelemetryProvider state update (liveData map keyed by "componentId:pin")
  |
  v
vizEngine.addData() for real-time charting
  |
  v
UI components read useTelemetry().liveData
```

---

## 6. Design Decisions and Rationale

### Why React Context Over Redux

CircuitMind uses 17 domain-specific React Context providers instead of a Redux store. The rationale:

1. **Domain isolation**: Each context owns exactly one domain (inventory, diagram, layout, auth). Changes to one domain do not trigger re-renders in unrelated domains.
2. **No boilerplate**: No action types, reducers, selectors, or middleware. Each provider is a self-contained module with its own hooks.
3. **Colocation**: State, persistence logic, and derived computations live together in each context file rather than being scattered across actions/reducers/selectors.
4. **Tree-shakeable**: Unused contexts can be removed without affecting others. Redux stores are monolithic.
5. **React 19 compatibility**: React 19's rendering improvements work well with Context. The `useMemo` pattern on context values prevents unnecessary re-renders.

The tradeoff: the 18-level nesting in App.tsx is visually deep, and inter-context dependencies must be carefully managed through nesting order. This is mitigated by the clear dependency documentation.

### Why Flat Directory Layout (No src/)

1. **Simplicity**: One fewer level of nesting in every import path.
2. **Vite default**: Vite projects commonly use project root as source root.
3. **Path alias**: The `@` alias resolves to root, making imports like `@/services/storage` unambiguous.

### Why Dual Persistence (localStorage + IndexedDB)

The application stores data in two tiers:

| Tier | Storage | Used For | Why |
|------|---------|----------|-----|
| Hot | localStorage | Layout preferences, API key, inventory JSON, diagram autosave, macros | Synchronous access, fast reads, simple key-value |
| Cold | IndexedDB | Conversations, messages, action history, binary FZPZ parts | Structured queries, large payloads, binary data, no 5MB limit |

localStorage has a 5-10MB quota (browser-dependent). The `storageService` wrapper handles quota exceeded errors by: (1) purging 3D code caches, then (2) pruning large image URLs from inventory items. If both fail, the operation is silently dropped.

IndexedDB (`CircuitMindDB`, version 3) has six object stores: `inventory`, `app_state`, `action_history`, `conversations`, `messages`, `parts`. The `messages` store has an index on `conversationId` for efficient conversation loading.

### Why These Specific Lazy Loading Boundaries

Two components are lazy-loaded:

```typescript
const ComponentEditorModal = lazy(() => import('./ComponentEditorModal'));
const SettingsPanel = lazy(() => import('./SettingsPanel'));
```

These were chosen because:
1. **ComponentEditorModal** (~1320 LOC) is only opened when editing a specific component. Most users spend the majority of their time on the canvas.
2. **SettingsPanel** (~1000 LOC with 7 sub-panels) is opened infrequently.
3. Both are modal overlays, so the brief Suspense fallback is acceptable UX.
4. Together they reduce initial bundle by approximately 50-80KB gzipped.

ThreeViewer is also effectively lazy-loaded because it only renders inside Diagram3DView, which itself is conditionally rendered.

---

## 7. Code Splitting Architecture

### Vendor Chunks

Vite's Rollup configuration defines 10 manual chunks that split vendor dependencies:

```typescript
// vite.config.ts
manualChunks: {
  'vendor-react':     ['react', 'react-dom'],
  'vendor-three':     ['three'],
  'vendor-ai':        ['@google/genai'],
  'vendor-ui':        ['framer-motion'],
  'vendor-markdown':  ['react-markdown', 'remark-gfm', 'remark-breaks'],
  'vendor-collab':    ['yjs', 'y-webrtc'],
  'vendor-git':       ['isomorphic-git', '@isomorphic-git/lightning-fs'],
  'vendor-charts':    ['recharts'],
  'vendor-i18n':      ['i18next', 'i18next-browser-languagedetector', 'i18next-http-backend', 'react-i18next'],
  'vendor-pdf':       ['jspdf'],
}
```

Each chunk is loaded independently and cached separately by the browser. The chunk size warning limit is 400KB (`chunkSizeWarningLimit: 400`).

### Application Code Chunks

Beyond vendor chunks, Vite automatically creates chunks for:
- **Lazy-loaded components**: ComponentEditorModal and SettingsPanel each get their own chunk
- **Shared modules**: Code shared between lazy chunks is extracted into common chunks

### Chunk Loading Strategy

```
Initial page load:
  index.html --> index.tsx chunk
  vendor-react chunk (React, ReactDOM)
  vendor-ui chunk (framer-motion, used in AppLayout)
  Main application chunk (all eagerly imported components)

On demand:
  vendor-three (when 3D view is opened)
  vendor-ai (when first AI request is made)
  vendor-markdown (when chat messages with markdown render)
  vendor-collab (when collaboration room is joined)
  vendor-git (when git operations are used)
  vendor-charts (when dashboard/telemetry charts render)
  vendor-i18n (on any i18next usage)
  vendor-pdf (when BOM export to PDF is triggered)
  ComponentEditorModal chunk (on component double-click)
  SettingsPanel chunk (on settings open)
```

---

## 8. PWA Architecture

CircuitMind is a Progressive Web App configured via `vite-plugin-pwa`.

### Service Worker Strategy

```typescript
// vite.config.ts PWA config
VitePWA({
  registerType: 'autoUpdate',  // SW updates automatically without user prompt
  // ...
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,webp,svg}'],
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,  // 3MB per-file limit
    navigateFallback: 'index.html',  // SPA routing support
    // ...
  }
})
```

Key decisions:
- **autoUpdate**: The service worker updates silently. Users always get the latest version without a refresh prompt.
- **3MB file limit**: Prevents caching of very large assets that would bloat the SW cache.
- **navigateFallback**: All navigation requests fall back to `index.html`, enabling client-side routing.

### Runtime Caching Rules

| URL Pattern | Strategy | Cache Name | Max Entries | Max Age |
|-------------|----------|-----------|-------------|---------|
| `fonts.googleapis.com/*` | CacheFirst | google-fonts-cache | 10 | 365 days |
| `*.png, *.jpg, *.svg, *.gif, *.webp` | CacheFirst | images-cache | 60 | 30 days |
| `*.js, *.css` | StaleWhileRevalidate | static-resources | 50 | 7 days |

**CacheFirst** (fonts, images): Serve from cache immediately; only fetch from network if not cached. Best for assets that rarely change.

**StaleWhileRevalidate** (JS, CSS): Serve from cache immediately AND fetch update from network in background. Next request gets the updated version. Balances speed with freshness.

### PWA Manifest

```json
{
  "name": "CircuitMind AI",
  "short_name": "CircuitMind",
  "description": "Intelligent Engineering OS for Electronics Prototyping",
  "theme_color": "#050508",
  "background_color": "#050508",
  "display": "standalone"
}
```

The `standalone` display mode makes the installed PWA look like a native app (no browser chrome). The dark theme colors (#050508) match the cyberpunk aesthetic.

---

## 9. Real-Time Collaboration Architecture

### CRDT Foundation

Collaboration is built on Yjs, a CRDT (Conflict-free Replicated Data Type) library. CRDTs guarantee that concurrent edits from multiple users will converge to the same state without conflict resolution.

### Architecture

```
User A's Browser                    User B's Browser
  |                                    |
  v                                    v
CollabService                      CollabService
  |                                    |
  v                                    v
Y.Doc (local CRDT document)       Y.Doc (local CRDT document)
  |                                    |
  v                                    v
WebrtcProvider  <-- WebRTC p2p -->  WebrtcProvider
  |                                    |
  v                                    v
Signaling Server (ws://localhost:4444 or public fallback)
```

### Implementation (`services/collabService.ts`)

```typescript
class CollabService {
  private doc: Y.Doc | null = null;
  private provider: WebrtcProvider | null = null;
  private sharedDiagram: Y.Map<unknown> | null = null;

  joinRoom(roomId: string, onUpdate: (diagram: WiringDiagram) => void) {
    this.doc = new Y.Doc();
    this.provider = new WebrtcProvider(roomId, this.doc, {
      signaling: ['ws://localhost:4444']
    });
    this.sharedDiagram = this.doc.getMap('diagram');
    this.sharedDiagram.observe(() => {
      const diagram = this.sharedDiagram?.toJSON() as WiringDiagram;
      if (diagram) onUpdate(diagram);
    });
  }

  updateSharedState(diagram: WiringDiagram) {
    this.doc?.transact(() => {
      for (const [key, value] of Object.entries(diagram)) {
        this.sharedDiagram?.set(key, value);
      }
    });
  }
}
```

The shared state is a `Y.Map` named `'diagram'` containing the full `WiringDiagram` object. Updates are wrapped in `doc.transact()` for atomic batching. The `observe()` callback fires whenever any peer modifies the shared map.

### Presence / Awareness

The `WebrtcProvider.awareness` API (from Yjs) enables presence features like remote cursors. This is exposed via `collabService.getPresence()` and consumed by the `RemoteCursor` component in DiagramCanvas.

---

## 10. AI Integration Architecture

### Model Configuration

All AI model constants are defined in `services/gemini/client.ts`:

| Constant | Model | Purpose |
|----------|-------|---------|
| WIRING | gemini-2.5-pro | Wiring diagram generation (highest accuracy) |
| CHAT | gemini-2.5-flash | Default chat responses (speed optimized) |
| CONTEXT_CHAT_COMPLEX | gemini-2.5-pro | Complex queries requiring deeper reasoning |
| VISION | gemini-2.5-pro | Image analysis |
| IMAGE | gemini-2.5-flash | Multimodal input processing |
| IMAGE_GEN | imagen-3.0-generate-001 | Image generation |
| THUMBNAIL | imagen-3.0-generate-001 | Component thumbnail generation |
| VIDEO | veo-2.0-generate-001 | Video generation |
| TTS | gemini-2.5-flash-tts | Text-to-speech |
| AUDIO_REALTIME | gemini-2.5-flash-live | Live audio streaming (WebSocket) |
| AUDIO_TRANSCRIPTION | gemini-2.5-flash | Audio-to-text transcription |
| EMBEDDING | text-embedding-004 | Semantic search / RAG |
| CODE_GEN | gemini-2.5-pro | Three.js code generation |
| THINKING | gemini-2.5-flash | Deep thinking mode |
| SMART_FILL / PART_FINDER / AUTO_ID | gemini-2.5-flash | Component intelligence features |

### Client Singleton

```typescript
let aiClientInstance: GoogleGenAI | null = null;

export const getAIClient = (): GoogleGenAI => {
  if (!aiClientInstance) {
    const apiKey = getApiKey();
    aiClientInstance = new GoogleGenAI({ apiKey });
  }
  return aiClientInstance;
};

export const resetAIClient = () => {
  aiClientInstance = null;
};
```

The API key is resolved in priority order: (1) `localStorage.cm_gemini_api_key` (user-configured), (2) `process.env.API_KEY` (from `.env.local` via Vite define).

### Feature Module Architecture

AI features are organized into 11 domain-specific modules under `services/gemini/features/`:

| Module | Features |
|--------|----------|
| `chat.ts` | Chat completion, context-aware responses, streaming |
| `wiring.ts` | Wiring diagram generation from natural language |
| `components.ts` | Component identification, smart fill, part finding |
| `media.ts` | Image generation, video generation, TTS |
| `suggestions.ts` | Proactive suggestions based on diagram state |
| `predictions.ts` | Predictive actions (ghost components) |
| `simulation.ts` | AI-assisted circuit simulation analysis |
| `datasheets.ts` | Datasheet extraction and summarization |
| `hud.ts` | HUD content generation (tips, warnings) |
| `bom.ts` | Bill of Materials generation |
| `versioning.ts` | Version comparison and change analysis |

Each module imports from `services/gemini/client.ts` for the AI client and from `services/gemini/prompts.ts` for prompt templates. Response parsing is centralized in `services/gemini/parsers.ts`.

### AI Context Building

Before every AI request, `useAIContextBuilder` constructs an `AIContext` object:

```typescript
interface AIContext {
  currentDiagramId?: string;
  currentDiagramTitle?: string;
  componentCount: number;
  connectionCount: number;
  selectedComponentId?: string;
  selectedComponentName?: string;
  activeSelectionPath?: string;
  componentList?: string[];
  recentActions: string[];
  recentHistory?: ActionDelta[];
  activeView: 'canvas' | 'component-editor' | 'inventory' | 'settings';
  inventorySummary: string;
  userProfile?: unknown;
  relevantLessons?: unknown[];
  viewport?: string;
}
```

This context is injected into every AI prompt so Gemini understands the current state of the workspace.

### Action Safety Classification

AI responses can include `ActionIntent` objects -- instructions for the AI to manipulate the workspace. Each action type has a safety classification in `types.ts`:

```typescript
export const ACTION_SAFETY: Record<ActionType, boolean> = {
  // Safe (auto-execute):
  highlight: true, centerOn: true, zoomTo: true, panTo: true, resetView: true,
  openInventory: true, closeInventory: true, openSettings: true, closeSettings: true,
  undo: true, redo: true, saveDiagram: true,
  setUserLevel: true, learnFact: true, analyzeVisuals: true,

  // Unsafe (require user confirmation):
  addComponent: false, removeComponent: false, clearCanvas: false,
  createConnection: false, removeConnection: false,
  fillField: false, saveComponent: false, loadDiagram: false,
};
```

Safe actions (viewport changes, UI navigation) auto-execute. Unsafe actions (diagram mutations) are presented as buttons that the user must click to confirm. Users can override these classifications via `useAutonomySettings`.

---

## 11. Error Handling Architecture

### Three-Layer Error Defense

```
Layer 1: GlobalErrorBoundary (index.tsx)
  -- Catches React rendering errors from entire component tree
  -- Shows full-screen diagnostic with stack trace
  -- "REBOOT SYSTEM" button reloads the page

Layer 2: DiagnosticsHub (services/error/diagnosticsHub.ts)
  -- Registers window.onerror for uncaught JS errors
  -- Registers window.onunhandledrejection for promise rejections
  -- Filters noise (ResizeObserver loop warnings)
  -- Routes errors to auditService for logging
  -- Sanitizes stack traces (removes local file paths for privacy)

Layer 3: Service-level try/catch
  -- Individual services handle their own errors
  -- Context providers catch initialization failures (e.g., localStorage parse errors)
  -- AI services catch API errors and return graceful fallbacks
```

### Error Patterns in Contexts

Every context provider that reads from localStorage wraps the read in try/catch with a fallback:

```typescript
const [inventoryWidth, setInventoryWidth] = useState(() => {
  try {
    const saved = localStorage.getItem('cm_inventory_width');
    const parsed = saved ? Number.parseInt(saved, 10) : inventoryDefaultWidth;
    if (!Number.isFinite(parsed)) return inventoryDefaultWidth;
    return clampWidth(parsed, inventoryWidthRange.min, inventoryWidthRange.max);
  } catch {
    return inventoryDefaultWidth;
  }
});
```

This pattern ensures the app always boots even if localStorage is corrupted, full, or unavailable.

### Bug Report Generation

```typescript
diagnosticsHub.generateBugReport()
// Returns:
{
  version: '1.0.0',
  userAgent: navigator.userAgent,
  logs: auditService.getLogs().slice(-50),  // Last 50 audit entries
  timestamp: Date.now()
}
```

---

## 12. Security Architecture

### Authentication: PIN-Based with PBKDF2

The auth system uses a local PIN (not username/password) with cryptographic hashing:

```
User enters PIN
  |
  v
authService.validatePin(pin)
  |
  v
Load stored salt from localStorage (cm_auth_salt)
  |
  v
PBKDF2 key derivation:
  - Algorithm: PBKDF2
  - Hash: SHA-256
  - Iterations: 100,000
  - Salt: 16 random bytes (generated at setup)
  - Output: AES-GCM 256-bit key (exported as base64)
  |
  v
Compare derived hash with stored hash (cm_auth_hash)
  |
  v
If match --> create session (1-hour expiry, random UUID token)
```

### Role-Based Access Control (RBAC)

Three roles with escalating permissions:

| Permission | admin | engineer | observer |
|------------|-------|----------|----------|
| canEditInventory | yes | yes | no |
| canModifyDiagram | yes | yes | no |
| canViewAPIKeys | yes | no | no |
| canDeleteData | yes | no | no |

Permissions are enforced at the action execution level in `useAIActions`:

```typescript
if (action.type === 'addComponent' || action.type === 'removeComponent') {
  if (!perms.canModifyDiagram) {
    return { success: false, error: 'Access Denied: Insufficient Permissions' };
  }
}
```

### API Key Management

- **Storage**: Gemini API key is stored in `localStorage.cm_gemini_api_key`
- **Fallback**: Environment variable `GEMINI_API_KEY` from `.env.local` (injected at build time via Vite `define`)
- **Exposure prevention**: The `canViewAPIKeys` permission gate prevents observer-role users from seeing API keys in settings

### AI Code Sandboxing

AI-generated Three.js code is executed in a sandboxed environment:

1. **Validation** (`services/threeCodeValidator.ts`): Code is checked against a whitelist/blacklist:
   - **Forbidden patterns**: `eval()`, `Function()`, `import()`, `require()`, `fetch()`, `XMLHttpRequest`, `WebSocket`, `window`, `document`, `localStorage`, `sessionStorage`, `cookie`, `postMessage`, `__proto__`, `constructor[`
   - **Required patterns**: Must contain `THREE.` and `Primitives.` or `Materials.` references
2. **Execution**: Validated code runs in a Web Worker (separate thread, limited DOM access)
3. **Scope restriction**: Only `THREE`, `Primitives`, and `Materials` objects are available in the execution scope

### Virtual API Layer

The `apiGateway.ts` provides a virtual REST API for external tool integration:

```
GET  /v1/projects   --> git log (requires Bearer token)
GET  /v1/inventory  --> current inventory (requires Bearer token)
POST /v1/actions    --> execute action intent (requires Bearer token)
```

All endpoints require a valid Bearer token validated by `tokenService`. External tools can only trigger safe actions unless the token has admin privileges.

---

## 13. Performance Architecture

### Memoization Strategy

| Component/Hook | Technique | Why |
|----------------|-----------|-----|
| MainLayout | `React.memo(MainLayoutComponent)` | Root orchestrator; prevents full re-render on context changes it doesn't consume |
| ChatMessage | `React.memo` | Messages are immutable once rendered; list can have hundreds of items |
| LayoutContext value | `React.useMemo` on entire value object | Layout changes propagate to every consumer; memoization prevents false re-renders |
| NotificationContext value | `React.useMemo` | Same pattern |
| HUDContext value | `React.useMemo` | Same pattern |
| useInventorySync | `useRef` for previous inventory snapshot | Avoids re-syncing when inventory reference changes but content hasn't |
| DiagramProvider.updateDiagram | Reference equality check: `if (curr.present === resolvedDiagram) return curr` | Prevents pushing identical states to undo history |

### Auto-Degradation

The HealthProvider monitors FPS via `requestAnimationFrame` counting:

```typescript
// HealthMonitor calculates FPS every second
// HealthProvider polls every 1 second
if (currentMetrics.fps < 25) {
  lowFpsCount++;
  if (lowFpsCount >= 5) {  // 5 consecutive seconds of low FPS
    setLowPerformanceMode(true);  // via LayoutContext
  }
} else {
  lowFpsCount = 0;
}
```

When `lowPerformanceMode` is enabled, the `low-performance` CSS class is added to `document.body`. Components can use this class to disable animations, reduce visual effects, and simplify rendering.

Status thresholds:
- **healthy**: FPS >= 30, memory < 80%
- **warning**: FPS < 30 OR memory > 80%
- **critical**: FPS < 15 OR memory > 95%

### List Virtualization

The Inventory component uses `virtua` (v0.48.3) for list virtualization, only rendering visible items in the component library. This is critical because the inventory can contain hundreds of components.

### Lazy Loading

Beyond the two explicit `React.lazy()` boundaries (ComponentEditorModal, SettingsPanel), Three.js content is effectively lazy because:
1. `vendor-three` chunk is only loaded when ThreeViewer renders
2. ThreeViewer only renders inside Diagram3DView
3. Diagram3DView is conditionally rendered based on view mode

### Bundle Size Targets

| Metric | Target | Achieved |
|--------|--------|----------|
| Gzipped initial load | < 200KB | ~150KB |
| Chunk warning threshold | 400KB | Configured in vite.config.ts |
| SW cache per-file limit | 3MB | Configured in workbox |
| Total bundle (pre-gzip) | < 500KB | ~414KB |

---

## 14. Persistence Architecture

### Storage Map

| Data | Primary Storage | Key/Store | Backup | Access Pattern |
|------|----------------|-----------|--------|----------------|
| Inventory | localStorage | `cm_inventory` | IndexedDB `inventory` store | Read on boot, write on every change |
| Diagram | localStorage | `cm_autosave` | None | Write on every state change |
| Saved diagram | localStorage | `savedDiagram` | None | Manual save/load (quick slot) |
| API key | localStorage | `cm_gemini_api_key` | Environment variable | Read on first AI request |
| Layout state | localStorage | `cm_inventory_open_default`, `cm_assistant_*`, `cm_active_mode`, etc. | None | Read on boot, write per preference change |
| Performance mode | localStorage | `cm_low_performance_mode` | None | Toggle |
| Neural link | localStorage | `cm_neural_link_enabled` | None | Toggle |
| Dashboard widgets | localStorage | `cm_dashboard_widgets` | None | Read on boot, write on layout change |
| Macros | localStorage | `cm_macros` | None | Read on boot, write on save |
| Auth hash | localStorage | `cm_auth_hash` + `cm_auth_salt` | None | Read on login |
| Conversations | IndexedDB | `conversations` store | None | CRUD operations |
| Messages | IndexedDB | `messages` store (indexed by conversationId) | None | Load per conversation switch |
| Action history | IndexedDB | `action_history` store | None | Append on action, read for undo |
| Binary parts | IndexedDB | `parts` store | None | Cache for FZPZ binary data |
| Layout snapshots | localStorage | `cm_layout_snapshot_{mode}` | None | Save/restore per UI mode |

### IndexedDB Schema

Database: `CircuitMindDB`, Version: 3

| Store | Key Path | Indexes |
|-------|----------|---------|
| `inventory` | `id` | None |
| `app_state` | `key` | None |
| `action_history` | `id` | None |
| `conversations` | `id` | None |
| `messages` | `id` | `conversationId` (non-unique) |
| `parts` | `id` | None |

### Quota Protection

The `storageService.setItem()` method catches `QuotaExceededError` and attempts recovery:

1. **First pass**: Purge all `cm_3d_code_cache_*` keys from localStorage
2. **Second pass** (if saving inventory): Strip large `imageUrl` values (>5000 chars) and `threeCode` from all inventory items
3. **Fallback**: Silent failure (returns `false`)

### Data Sanitization for IndexedDB

Before writing to IndexedDB, all objects pass through `sanitizeForDB()`:

1. **Try `structuredClone()`**: Native deep clone that handles most types
2. **Fallback to JSON round-trip**: Strips circular references (replaced with `'[Circular]'`), functions, and non-serializable objects

---

## 15. Action System Architecture

### Handler Registry Pattern

Actions are routed through a registry of handler functions:

```
ActionIntent { type, payload, label, safe }
  |
  v
useAIActions.execute(action)
  |
  v
getHandler(action.type) --> looks up in actionHandlers registry
  |
  v
handler(payload, context) --> domain-specific handler function
  |
  v
HandlerResult { success, error }
  |
  v
Post-processing: audit log, metrics, macro recording, action delta
```

### Handler Modules

```typescript
// hooks/actions/index.ts
export const actionHandlers: Partial<Record<ActionType, ActionHandler>> = {
  // Canvas (6 handlers)
  highlight, centerOn, zoomTo, panTo, resetView, highlightWire,

  // Navigation (6 handlers)
  openInventory, closeInventory, openSettings, closeSettings,
  openComponentEditor, switchGenerationMode,

  // Diagram Mutation (5 handlers)
  addComponent, removeComponent, clearCanvas, createConnection, removeConnection,

  // App Control (7 handlers)
  undo, redo, saveDiagram, loadDiagram, setUserLevel, learnFact, analyzeVisuals,
};
```

Each handler receives a `payload` (action-specific data) and an `ActionContext` object containing references to all the state and dispatch functions it might need:

```typescript
interface ActionContext {
  canvasRef: React.RefObject<DiagramCanvasRef>;
  inventory: ElectronicComponent[];
  diagram: WiringDiagram | null;
  setInventory: React.Dispatch<...>;
  setIsInventoryOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setSelectedComponent: (component: ElectronicComponent | null) => void;
  setGenerationMode: (mode: GenerationMode) => void;
  updateDiagram: (diagram: DiagramUpdater) => void;
  activeConversationId: string | null;
  recordUndo: (type: string, snapshotBefore: unknown) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  saveDiagram: () => void;
  loadDiagram: () => void;
}
```

### Action Lifecycle

1. **Permission check**: RBAC enforcement for diagram mutations
2. **Handler lookup**: `getHandler(action.type)` from registry
3. **Execution**: `handler(payload, context)` returns `{ success, error }`
4. **Audit logging**: `auditService.log()` records the action
5. **Metrics**: `engineeringMetricsService.logEvent()` tracks action usage
6. **Macro recording**: If recording, `addRecordedStep(action)` captures the action
7. **Action delta**: `pushActionDelta()` adds to recent history buffer (for AI context)
8. **History tracking**: `addToHistory(result)` for undo support

---

## 16. Component Hierarchy

```
index.tsx
  React.StrictMode
    GlobalErrorBoundary
      ToastProvider
        App
          [17 Context Providers]
            MainLayout (memo)
              AppLayout (structural shell)
                |-- Left Sidebar: Inventory
                |     |-- InventoryItem[] (virtualized list)
                |     |-- BOMModal
                |     |-- MacroPanel
                |     |-- HardwareTerminal
                |
                |-- Header: AppHeader
                |     |-- Mode switcher (design/wiring/debug)
                |     |-- CollaboratorList
                |     |-- ProjectTimeline
                |     |-- SecurityReport
                |
                |-- Main Canvas Area:
                |     |-- TacticalHUD (overlay)
                |     |-- MentorOverlay (tutorial)
                |     |-- DashboardView (toggle) OR:
                |     |-- DiagramCanvas (SVG)
                |     |     |-- DiagramNode[] (per component)
                |     |     |-- Wire[] (per connection)
                |     |     |-- Diagram3DView (toggle) --> ThreeViewer (lazy)
                |     |     |-- PredictiveGhost
                |     |     |-- NeuralCursor (gesture tracking)
                |     |     |-- DiffOverlay
                |     |     |-- ConflictResolver
                |     |     |-- MismatchMarker
                |     |     |-- RemoteCursor (collaboration)
                |     |-- NeuralCursor (when neural link active)
                |     |-- ContextMenuOverlay (right-click)
                |
                |-- Right Sidebar: AssistantSidebar
                |     |-- AssistantContent
                |     |     |-- AssistantTabs (chat/history/explore)
                |     |     |-- ConversationSwitcher
                |     |     |-- ChatMessage[] (memoized)
                |     |     |-- Generation mode controls
                |     |     |-- Voice recording controls
                |
                |-- Status Rail: StatusRail (bottom bar)
                |
                |-- Modals:
                |     |-- SimControls (simulation panel)
                |     |-- ComponentEditorModal (lazy, Suspense)
                |     |-- SettingsPanel (lazy, Suspense)
                |
                |-- Global Overlays:
                      |-- Gatekeeper (auth lock screen)
                      |-- CyberToast (toast notifications)
                      |-- OmniSearch (Cmd+K search)
```

---

## 17. Z-Index Layer Map

Visual elements are stacked using z-index values that follow a deliberate hierarchy:

| Layer | Z-Index | Elements |
|-------|---------|----------|
| Canvas | 0 | DiagramCanvas SVG, DiagramNode, Wire |
| Header | 10 | AppHeader bar |
| Chat/Assistant | 20 | AssistantSidebar, AssistantContent |
| SimControls | 30 | Simulation control panel (fixed bottom center) |
| Inventory | 40 | Inventory sidebar |
| Modals | 50 | ComponentEditorModal, SettingsPanel, OmniSearch |
| GlobalErrorBoundary | 50 | Full-screen error diagnostic (when triggered) |
| Boot Loader | 9999 | Initial loading animation (replaced on mount) |

This ordering ensures that modals always appear above sidebars, sidebars above the canvas, and the error boundary can cover everything.

---

## Appendix A: Environment Variables

| Variable | Source | Purpose |
|----------|--------|---------|
| `GEMINI_API_KEY` | `.env.local` | Gemini AI API key (injected as `process.env.API_KEY` and `process.env.GEMINI_API_KEY` via Vite `define`) |
| `import.meta.env.DEV` | Vite (automatic) | Gates dev-only features: axe-core auditing, dev validation in useInventorySync |
| `import.meta.env.MODE` | Vite (automatic) | Controls production alias for axe-core |

## Appendix B: Node Polyfills

The `vite-plugin-node-polyfills` plugin provides browser shims for:
- `Buffer` (required by isomorphic-git)
- `global` (required by various Node-oriented packages)
- `process` (required for `process.env` references)

These are injected at build time so Node.js-oriented libraries work in the browser.

## Appendix C: TypeScript Configuration Highlights

| Setting | Value | Purpose |
|---------|-------|---------|
| `target` | ES2022 | Modern syntax (top-level await, class fields) |
| `module` | ESNext | ES module output |
| `moduleResolution` | bundler | Vite-optimized resolution |
| `paths.@/*` | `./*` | Root path alias |
| `jsx` | react-jsx | React 19 JSX transform |

## Appendix D: Key File Sizes

| File | LOC | Role |
|------|-----|------|
| components/diagram/Diagram3DView.tsx | ~1950 | Largest component (Three.js 3D canvas) |
| components/DiagramCanvas.tsx | ~1380 | Core SVG canvas |
| components/ComponentEditorModal.tsx | ~1320 | Multi-tab component editor |
| services/threePrimitives.ts | ~1260 | 3D shape generator library |
| components/MainLayout.tsx | ~608 | Root orchestrator (refactored from ~1014) |
| components/SettingsPanel.tsx | ~1000 | 7 sub-panels |
| components/Inventory.tsx | ~980 | Component library sidebar |
| components/diagram/DiagramNode.tsx | ~1010 | SVG node rendering |
| services/componentValidator.ts | ~502 | Inventory-diagram consistency |
| types.ts | ~290 | All TypeScript interfaces |
