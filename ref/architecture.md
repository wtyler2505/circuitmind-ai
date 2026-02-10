# CircuitMind AI - System Architecture

## Overview

CircuitMind AI is an AI-powered electronics prototyping workspace built with:
- **Frontend**: React 19 + TypeScript 5.8 + Vite 6
- **Backend**: Express 5 + better-sqlite3 on port 3001
- **AI**: Google Gemini (2.5 Pro/Flash, Imagen 3, Veo 2, TTS) via @google/genai 1.34
- **3D Rendering**: Three.js 0.182
- **Collaboration**: Yjs 13.6 + y-webrtc (CRDT)
- **Storage**: IndexedDB + localStorage (client), SQLite (server)
- **State**: React Context API (20 providers in App.tsx)

## Directory Structure

```
circuitmind-ai/
├── App.tsx              # Root: 20 context providers nested
├── index.tsx            # React entry point
├── types.ts             # All TypeScript interfaces (354 LOC)
├── index.css            # Tailwind v4 + cyber theme (795 LOC)
│
├── components/          # React UI components
│   ├── diagram/         # Diagram-specific components
│   │   ├── 3d/                   # Three.js helpers (6 files)
│   │   ├── canvas/               # Canvas sub-components (8 files)
│   │   ├── parts/                # Breadboard, FzpzVisual
│   │   ├── wiring/               # BezierWire
│   │   ├── Diagram3DView.tsx     # Three.js 3D canvas
│   │   ├── DiagramNode.tsx       # Component nodes
│   │   ├── componentShapes.ts    # SVG shape definitions
│   │   ├── Wire.tsx              # Connection rendering
│   │   ├── ConflictResolver.tsx  # Merge conflict UI
│   │   ├── DiffOverlay.tsx       # Diagram diff visualization
│   │   ├── MismatchMarker.tsx    # Inventory mismatch indicator
│   │   ├── NeuralCursor.tsx      # MediaPipe gesture cursor
│   │   ├── PinTooltip.tsx        # Pin hover tooltip
│   │   ├── PredictiveGhost.tsx   # AI prediction overlay
│   │   ├── RemoteCursor.tsx      # Collaboration cursors
│   │   └── TacticalHUD.tsx       # Real-time data overlays
│   │
│   ├── inventory/       # Inventory sidebar components
│   │   ├── BOMModal.tsx          # Bill of materials
│   │   ├── InventoryAddForm.tsx  # Add component form
│   │   ├── InventoryItem.tsx     # Single item card
│   │   ├── InventoryList.tsx     # Virtualized list
│   │   ├── InventoryToolsPanel.tsx # Tools panel
│   │   ├── MacroPanel.tsx        # Macro recording UI
│   │   └── inventoryUtils.ts     # Utility functions
│   │
│   ├── inventory-mgmt/  # Full inventory management view (12 files)
│   │   ├── CaptureWizard.tsx     # AI capture workflow
│   │   ├── ExportPanel.tsx       # Export to CSV/JSON/PDF
│   │   ├── FileUploadCapture.tsx # File-based capture
│   │   ├── InventoryBrowser.tsx  # Browse/filter catalog
│   │   ├── InventoryDetail.tsx   # Single item detail
│   │   ├── InventoryMgmtView.tsx # Root management view
│   │   ├── LocationManager.tsx   # Storage location tree
│   │   ├── ReviewQueue.tsx       # AI-identified review queue
│   │   ├── StockAdjuster.tsx     # Stock quantity controls
│   │   ├── SyncStatusBar.tsx     # Sync status indicator
│   │   ├── VoiceRecorder.tsx     # Voice note capture
│   │   └── WebcamCapture.tsx     # Camera capture
│   │
│   ├── layout/          # Layout components (20 files)
│   │   ├── assistant/            # AssistantContent, AssistantTabs
│   │   ├── AppHeader.tsx         # Top header bar
│   │   ├── AppLayout.tsx         # Main wrapper
│   │   ├── AnalyticsDashboard.tsx # Analytics view
│   │   ├── BootcampPanel.tsx     # Learning bootcamp
│   │   ├── CollaboratorList.tsx  # P2P collaborators
│   │   ├── CommsLog.tsx          # Communications log
│   │   ├── ContextMenuOverlay.tsx # Right-click menu
│   │   ├── CyberToast.tsx        # Styled toast
│   │   ├── DebugWorkbench.tsx    # Debug tools
│   │   ├── HardwareTerminal.tsx  # Serial terminal
│   │   ├── MentorOverlay.tsx     # Tutorial mentor
│   │   ├── ModeSelector.tsx      # Mode switcher
│   │   ├── OmniSearch.tsx        # Global search
│   │   ├── ProjectTimeline.tsx   # Project history
│   │   ├── SecurityReport.tsx    # Security report
│   │   ├── SimControls.tsx       # Simulation controls
│   │   ├── StatusRail.tsx        # Status indicator rail
│   │   ├── SystemLogViewer.tsx   # System log viewer
│   │   └── SystemVitals.tsx      # System health vitals
│   │
│   ├── dashboard/       # Dashboard widget system (8 files)
│   │   ├── DashboardView.tsx     # Widget grid layout
│   │   ├── WidgetWrapper.tsx     # Widget container
│   │   ├── WidgetLibrary.tsx     # Available widgets
│   │   ├── OscilloscopeWidget.tsx # Oscilloscope
│   │   ├── LogicAnalyzerWidget.tsx # Logic analyzer
│   │   ├── HeatmapWidget.tsx     # Heatmap
│   │   ├── AnalogGauge.tsx       # Analog gauge
│   │   └── Sparkline.tsx         # Sparkline chart
│   │
│   ├── auth/            # Auth components
│   │   ├── Gatekeeper.tsx        # Auth gate
│   │   └── PermissionGuard.tsx   # Permission wrapper
│   │
│   ├── settings/        # Settings sub-panels (7 files)
│   │   ├── ConfigPortal.tsx      # Configuration portal
│   │   ├── DeveloperPortal.tsx   # Developer tools
│   │   ├── DiagnosticsView.tsx   # System diagnostics
│   │   ├── LocalizationSettings.tsx # i18n settings
│   │   ├── PartsManager.tsx      # Parts management
│   │   ├── ProfileSettings.tsx   # User profile
│   │   └── SyncPanel.tsx         # Sync settings
│   │
│   ├── __tests__/       # Component tests (9 files)
│   │
│   ├── AssistantSidebar.tsx      # AI assistant sidebar
│   ├── ChatMessage.tsx           # Message renderer
│   ├── ChatPanel.tsx             # AI chat interface
│   ├── ComponentEditorModal.tsx  # Multi-tab component editor (lazy)
│   ├── ConversationSwitcher.tsx  # Conversation list
│   ├── DiagramCanvas.tsx         # 2D SVG diagram
│   ├── ErrorBoundary.tsx         # Error handling
│   ├── IconButton.tsx            # Reusable icon button
│   ├── Inventory.tsx             # Component library sidebar
│   ├── MainLayout.tsx            # Main app layout orchestrator
│   ├── SettingsPanel.tsx         # Settings modal (7 sub-panels)
│   └── ThreeViewer.tsx           # 3D model viewer (lazy)
│
├── contexts/            # 19 React Context providers
│   ├── AdvancedInventoryContext.tsx  # Server-backed catalog/locations
│   ├── AssistantStateContext.tsx     # AI generation mode, image size
│   ├── AuthContext.tsx               # Authentication & session
│   ├── ConversationContext.tsx       # Chat sessions
│   ├── DashboardContext.tsx          # Widget layout
│   ├── DiagramContext.tsx            # Diagram + undo/redo
│   ├── HUDContext.tsx                # Heads-up display content
│   ├── HealthContext.tsx             # System health monitoring
│   ├── InventoryContext.tsx          # Component library (source of truth)
│   ├── LayoutContext.tsx             # UI layout, sidebars, modes
│   ├── MacroContext.tsx              # Action macro recording
│   ├── NotificationContext.tsx       # Alert notifications
│   ├── SelectionContext.tsx          # Multi-select state
│   ├── SimulationContext.tsx         # Circuit simulation state
│   ├── SyncContext.tsx               # Cross-device sync
│   ├── TelemetryContext.tsx          # Event tracking
│   ├── TutorialContext.tsx           # Tutorial progression
│   ├── UserContext.tsx               # User profile & preferences
│   └── VoiceAssistantContext.tsx     # Voice I/O, live audio
│
├── hooks/               # 40+ custom React hooks
│   ├── actions/         # Action handler registry (6 files)
│   │   ├── index.ts              # Handler registry
│   │   ├── types.ts              # Handler types
│   │   ├── canvasHandlers.ts     # highlight, centerOn, zoomTo, panTo, resetView, highlightWire
│   │   ├── navHandlers.ts        # openInventory, closeInventory, openSettings, etc.
│   │   ├── diagramHandlers.ts    # addComponent, removeComponent, clearCanvas, connections
│   │   └── appControlHandlers.ts # undo, redo, save, load, setUserLevel, learnFact, analyzeVisuals
│   ├── useAIActions.ts           # AI action dispatcher
│   ├── useAIContextBuilder.ts    # AI context construction hook
│   ├── useActionHistory.ts       # Action history for undo
│   ├── useAutonomySettings.ts    # AI safety classification
│   ├── useCanvasExport.ts        # Canvas export functionality
│   ├── useCanvasHUD.ts           # Canvas HUD overlays
│   ├── useCanvasHighlights.ts    # Highlight management
│   ├── useCanvasInteraction.ts   # Canvas interaction handlers
│   ├── useCanvasLayout.ts        # Canvas layout logic
│   ├── useCanvasWiring.ts        # Wire drawing logic
│   ├── useChatHandler.ts         # Chat message handling
│   ├── useClickOutside.ts        # Click outside detection
│   ├── useConnectivity.ts        # Network connectivity
│   ├── useConversations.ts       # Conversation CRUD + IndexedDB
│   ├── useDiagram3DScene.ts      # 3D scene management
│   ├── useDiagram3DSync.ts       # 3D/2D sync
│   ├── useDiagram3DTelemetry.ts  # 3D telemetry
│   ├── useEditorAIChat.ts        # Editor AI assistant
│   ├── useEditorFormState.ts     # Editor form state
│   ├── useEditorModalHandlers.ts # Editor modal handlers
│   ├── useFocusTrap.ts           # Focus trap for modals
│   ├── useGestureTracking.ts     # MediaPipe gesture tracking
│   ├── useHoverBehavior.ts       # Hover behavior
│   ├── useInventoryApi.ts        # Server inventory API
│   ├── useInventorySync.ts       # Inventory-diagram sync
│   ├── useKeyboardShortcuts.ts   # Keyboard shortcuts
│   ├── useMainLayoutActions.ts   # Main layout action handlers
│   ├── useNeuralLink.ts          # Neural-Link gesture system
│   ├── useNeuralLinkEffects.ts   # Neural-Link visual effects
│   ├── useOfflineSync.ts         # Offline sync queue
│   ├── usePermissions.ts         # Permission management
│   ├── useResizeHandler.ts       # Panel resize handling
│   ├── useSearchIndex.ts         # Full-text search indexing
│   ├── useSecurityAudit.ts       # Security audit hook
│   ├── useSync.ts                # Yjs sync
│   ├── useToast.tsx              # Toast notifications (also exports ToastProvider)
│   ├── useVoiceRecorder.ts       # Voice recording
│   └── useWebcam.ts              # Webcam access
│
├── services/            # 82+ business logic files
│   ├── gemini/          # Modular Gemini integration (16 files)
│   │   ├── client.ts             # API client + 18 model constants
│   │   ├── contextLimits.ts      # Token limit handling
│   │   ├── features/             # 11 feature modules
│   │   │   ├── bom.ts            # BOM generation
│   │   │   ├── chat.ts           # Chat operations
│   │   │   ├── components.ts     # Component AI features
│   │   │   ├── datasheets.ts     # Datasheet processing
│   │   │   ├── hud.ts            # HUD data generation
│   │   │   ├── media.ts          # Image/video generation
│   │   │   ├── predictions.ts    # AI predictions
│   │   │   ├── simulation.ts     # Simulation analysis
│   │   │   ├── suggestions.ts    # Proactive suggestions
│   │   │   ├── versioning.ts     # Version tracking
│   │   │   └── wiring.ts         # Diagram generation
│   │   ├── index.ts              # Re-exports
│   │   ├── parsers.ts            # Response parsing
│   │   ├── prompts.ts            # Prompt templates
│   │   └── types.ts              # AI-specific types
│   │
│   ├── simulation/      # MNA simulation engine (10 files)
│   │   ├── componentValueExtractor.ts # Extract electrical values
│   │   ├── mnaErrorDetector.ts        # Error detection
│   │   ├── mnaGraphBuilder.ts         # Circuit graph construction
│   │   ├── mnaMatrixAssembler.ts      # MNA matrix assembly
│   │   ├── mnaResultFormatter.ts      # Result formatting
│   │   ├── mnaSolver.ts               # Core MNA solver
│   │   ├── simulationWorker.worker.ts # Web Worker
│   │   ├── simulationWorkerBridge.ts  # Worker communication bridge
│   │   ├── types.ts                   # Simulation types
│   │   └── workerTypes.ts             # Worker message types
│   │
│   ├── api/             # API layer (4 files)
│   │   ├── apiDispatcher.ts      # Request dispatcher
│   │   ├── apiGateway.ts         # API gateway
│   │   ├── events.ts             # Event system
│   │   └── tokenService.ts       # Token management
│   │
│   ├── analytics/       # projectAnalyzer.ts
│   ├── config/          # configManager.ts
│   ├── error/           # diagnosticsHub.ts
│   ├── feedback/        # correctionService.ts
│   ├── gesture/         # GestureEngine.ts, GestureMetricsService.ts
│   ├── localization/    # i18n.ts, unitConverter.ts
│   ├── logging/         # auditService.ts
│   ├── search/          # searchIndexer.ts
│   ├── viz/             # vizEngine.ts
│   │
│   ├── storage.ts                # Dual persistence (localStorage + IndexedDB)
│   ├── componentValidator.ts     # Component data validation
│   ├── exportService.ts          # PDF/CSV/JSON export
│   ├── aiContextBuilder.ts       # AI context construction
│   ├── aiMetricsService.ts       # AI latency/success tracking
│   ├── geminiService.ts          # Legacy Gemini facade
│   ├── threePrimitives.ts        # 3D primitive library
│   ├── threeCodeValidator.ts     # 3D code sandboxing
│   ├── threeCodeRunner.ts        # 3D code execution
│   ├── threeCodeRunner.worker.ts # 3D code Web Worker
│   ├── threeWorkerPolyfill.ts    # Worker polyfills
│   ├── liveAudio.ts              # WebSocket live audio
│   ├── fzpzLoader.ts             # FZPZ part loader
│   ├── partStorageService.ts     # Part IndexedDB cache
│   ├── inventoryApiClient.ts     # Server inventory HTTP client
│   ├── securityAuditor.ts        # Security audit service
│   ├── collabService.ts          # Yjs collaboration
│   ├── webRTCService.ts          # WebRTC P2P
│   ├── syncService.ts            # Sync coordination
│   ├── syncManager.ts            # Sync state management
│   ├── transactionQueue.ts       # Offline transaction queue
│   ├── offlineQueue.ts           # Offline operation queue
│   └── ... (40+ more services)
│
├── server/              # Express 5 backend (port 3001)
│   ├── index.ts                  # Server entry point
│   ├── db/                       # Database
│   │   ├── database.ts           # better-sqlite3 connection
│   │   └── schema.sql            # Table definitions (4 tables + FTS5)
│   ├── routes/                   # 9 route modules
│   │   ├── catalog.ts            # /api/catalog (CRUD)
│   │   ├── inventory.ts          # /api/inventory (CRUD)
│   │   ├── locations.ts          # /api/locations (tree CRUD)
│   │   ├── stockMoves.ts         # /api/stock-moves (audit trail)
│   │   ├── search.ts             # /api/search (FTS5)
│   │   ├── export.ts             # /api/export/json, /api/export/csv
│   │   ├── migrate.ts            # /api/migrate (frontend import)
│   │   ├── identify.ts           # /api/identify (AI vision)
│   │   └── stt.ts                # /api/stt (speech-to-text)
│   ├── middleware/               # 4 middleware
│   │   ├── cors.ts               # CORS (open for dev)
│   │   ├── securityHeaders.ts    # Security headers
│   │   ├── validation.ts         # Zod validation
│   │   └── errorHandler.ts       # Global error handler
│   └── services/                 # Server-side AI
│       ├── aiIdentifier.ts       # AI identifier interface
│       ├── geminiVision.ts       # Gemini vision provider
│       ├── claudeVision.ts       # Claude vision provider
│       └── transcriber.ts        # Audio transcription
│
├── data/                # Initial data
│   └── initialInventory.ts       # Default components
│
├── tests/               # Test setup
├── scripts/             # Build/audit scripts
├── public/              # Static assets
├── .github/workflows/   # CI/CD (security.yml)
└── ref/                 # Technical reference docs
```

## State Management

### 20 Context Providers (App.tsx nesting order)

```tsx
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
                    <AdvancedInventoryProvider>
                      <SyncProvider>
                        <ConversationProvider>
                          <DiagramProvider>
                            <SelectionProvider>
                              <TelemetryProvider>
                                <HUDProvider>
                                  <SimulationProvider>
                                    <VoiceAssistantProvider>
                                      <TutorialProvider>
                                        <MainLayout />
```

**Nesting order is load-bearing**: DiagramProvider depends on InventoryProvider being loaded first. AdvancedInventoryProvider and SyncProvider wrap inside InventoryProvider.

### Persistence

| Store | Type | Key/DB |
|-------|------|--------|
| Inventory | IndexedDB + localStorage | `CircuitMindDB.inventory`, `cm_inventory` |
| Diagrams | localStorage | `cm_autosave` |
| Conversations | IndexedDB | `CircuitMindDB.conversations/messages` |
| Settings | localStorage | `cm_gemini_api_key`, `cm_autonomy_settings` |
| Server catalog | SQLite | `server/data/circuitmind.db` |

### Critical Pattern: Dual Component Sync

When editing components, update BOTH locations:
1. `InventoryContext` - Source of truth for library
2. Active diagram components - Current instance

The `useInventorySync` hook handles this automatically.

## Data Flow

```
User Input
    |
    +---> Canvas Interaction --> DiagramContext --> State Update --> Re-render
    |
    +---> Chat Input --> Gemini Service --> Structured Response
                                                |
                          +---------------------+---------------------+
                          v                                           v
                    Safe Actions                                Unsafe Actions
                    (auto-execute)                              (need confirmation)
                          |                                           |
                          v                                           v
                    Canvas Updates                              Pending Queue
                    (highlight, zoom)                           (user approves)
```

## Z-Index Layers

| Layer | Z-Index | Element |
|-------|---------|---------|
| Canvas | z-0 | Background diagram |
| Header | z-10 | Top bar |
| Chat | z-20 | Bottom panel |
| Inventory | z-40 | Slide-out sidebar |
| Modals | z-50 | Overlays |

## AI Integration Architecture

### Gemini Service (Modular)

Located at `services/gemini/` (16 files):

| Module | Purpose |
|--------|---------|
| `client.ts` | API client, 18 model constants, key management |
| `contextLimits.ts` | Token limit handling, context truncation |
| `features/bom.ts` | BOM generation |
| `features/chat.ts` | Chat operations |
| `features/components.ts` | Smart fill, 3D code gen |
| `features/datasheets.ts` | Datasheet processing |
| `features/hud.ts` | HUD data generation |
| `features/media.ts` | Image/video generation |
| `features/predictions.ts` | AI predictions |
| `features/simulation.ts` | Simulation analysis |
| `features/suggestions.ts` | Proactive AI suggestions |
| `features/versioning.ts` | Version tracking |
| `features/wiring.ts` | Diagram generation |
| `prompts.ts` | Prompt templates |
| `parsers.ts` | Response parsing |
| `types.ts` | AI-specific type definitions |

### Model Routing (from client.ts)

| Constant | Model | Used For |
|----------|-------|----------|
| WIRING | gemini-2.5-pro | Wiring diagram generation (accuracy) |
| CHAT | gemini-2.5-flash | Default chat (speed) |
| CONTEXT_CHAT_DEFAULT | gemini-2.5-flash | Context-aware chat (speed) |
| CONTEXT_CHAT_COMPLEX | gemini-2.5-pro | Complex queries (accuracy) |
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
| ASSIST_EDITOR / SUGGEST_PROJECTS | gemini-2.5-flash | Editor AI, suggestions |

### Action System

Actions classified by safety in `types.ts:ACTION_SAFETY`:

**Safe Actions** (auto-execute):
- highlight, centerOn, zoomTo, panTo, resetView, highlightWire
- openInventory, closeInventory, openSettings, closeSettings
- toggleSidebar, setTheme, openComponentEditor, switchGenerationMode
- undo, redo, saveDiagram, setUserLevel, learnFact, analyzeVisuals

**Unsafe Actions** (need confirmation):
- addComponent, updateComponent, removeComponent, clearCanvas
- createConnection, removeConnection
- loadDiagram, fillField, saveComponent

Customizable via `useAutonomySettings`.

## Server Architecture

Express 5 backend on port 3001, SQLite database via better-sqlite3.

### Database Tables (schema.sql)

| Table | Purpose |
|-------|---------|
| `catalog_item` | Master parts catalog (name, type, pins, specs, AI metadata) |
| `inventory_lot` | Physical stock tied to catalog items + locations |
| `location` | Hierarchical storage (bins, drawers, shelves) |
| `stock_move` | Immutable audit trail of quantity changes |
| `catalog_fts` | FTS5 virtual table for full-text search |

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| CRUD | `/api/catalog` | Parts catalog management |
| CRUD | `/api/inventory` | Inventory lot management |
| CRUD | `/api/locations` | Location tree management |
| GET/POST | `/api/stock-moves` | Stock movement audit trail |
| GET | `/api/search?q=` | FTS5 full-text search |
| GET | `/api/export/json` | Full database dump |
| GET | `/api/export/csv` | BOM-style CSV export |
| POST | `/api/migrate` | Import from frontend inventory |
| POST | `/api/identify` | AI component identification (multipart) |
| POST | `/api/stt` | Speech-to-text (multipart audio) |

### Middleware Stack

1. `securityHeaders` - X-Content-Type-Options, X-Frame-Options, XSS, Referrer-Policy, Permissions-Policy
2. `corsMiddleware` - Open CORS for dev (lock down for production)
3. `express.json` - 50MB limit
4. `express.urlencoded` - 50MB limit
5. Route handlers with Zod validation via `validateBody` / `validateQuery`
6. `errorHandler` - Global error handler (last in chain)

## Storage Architecture

### Client-Side: IndexedDB (CircuitMindDB v2)

| Store | Key | Indexes | Purpose |
|-------|-----|---------|---------|
| `inventory` | `id` | - | Component library |
| `app_state` | `key` | - | Diagrams, settings |
| `conversations` | `id` | `updatedAt`, `isPrimary` | Chat sessions |
| `messages` | `id` | `conversationId`, `timestamp` | Chat messages |
| `action_history` | `id` | `timestamp`, `conversationId` | Undo support |

### Client-Side: localStorage Keys

| Key | Purpose |
|-----|---------|
| `cm_inventory` | Component library backup |
| `cm_autosave` | Current diagram autosave |
| `cm_gemini_api_key` | User's API key |
| `cm_autonomy_settings` | AI action permissions |
| `savedDiagram` | Quick save slot |

### Server-Side: SQLite

Database at `server/data/circuitmind.db` with WAL mode. FTS5 triggers auto-sync catalog changes to full-text search index.
