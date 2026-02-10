# CircuitMind AI - Services Reference

**82 files** organized by domain across `services/` and 12 subdirectories.

## Service Directory

```
services/
├── gemini/                      # AI integration (modular)
│   ├── client.ts               # Singleton API client + model constants
│   ├── types.ts                # Gemini-specific type schemas
│   ├── prompts.ts              # Prompt templates
│   ├── parsers.ts              # Response extraction
│   ├── contextLimits.ts        # Token limit handling
│   ├── index.ts                # Barrel exports
│   └── features/               # Feature modules (11 files)
│       ├── bom.ts              # Bill of Materials generation
│       ├── chat.ts             # Chat operations
│       ├── components.ts       # Component AI features
│       ├── datasheets.ts       # Datasheet processing
│       ├── hud.ts              # HUD content generation
│       ├── media.ts            # Image/video/audio generation
│       ├── predictions.ts      # Predictive suggestions
│       ├── simulation.ts       # Simulation-related AI
│       ├── suggestions.ts      # Proactive suggestions
│       ├── versioning.ts       # Version management
│       └── wiring.ts           # Diagram generation
│
├── simulation/                  # MNA circuit simulation engine (10 files)
│   ├── mnaSolver.ts            # DC analysis via LU decomposition
│   ├── mnaMatrixAssembler.ts   # Stamp-based MNA matrix construction
│   ├── mnaGraphBuilder.ts      # Circuit topology from diagram
│   ├── mnaErrorDetector.ts     # Floating nodes, short circuits
│   ├── mnaResultFormatter.ts   # Human-readable results
│   ├── componentValueExtractor.ts # Electrical values from component data
│   ├── simulationWorker.worker.ts # Web Worker entry point
│   ├── simulationWorkerBridge.ts  # Main thread <-> Worker bridge
│   ├── types.ts                # Simulation-specific types
│   └── workerTypes.ts          # Worker message types
│
├── api/                         # API gateway layer (4 files)
│   ├── apiGateway.ts           # Centralized API gateway
│   ├── apiDispatcher.ts        # Request dispatching
│   ├── tokenService.ts         # Token management
│   └── events.ts               # API event system
│
├── analytics/                   # Analytics (1 file)
│   └── projectAnalyzer.ts      # Project-wide analytics
│
├── config/                      # Configuration (1 file)
│   └── configManager.ts        # Runtime configuration manager
│
├── error/                       # Error handling (1 file)
│   └── diagnosticsHub.ts       # Error diagnostics hub
│
├── feedback/                    # User feedback (1 file)
│   └── correctionService.ts    # User correction handling
│
├── gesture/                     # Gesture recognition (2 files)
│   ├── GestureEngine.ts        # MediaPipe gesture engine
│   └── GestureMetricsService.ts # Gesture metrics
│
├── localization/                # Internationalization (2 files)
│   ├── i18n.ts                 # i18next configuration
│   └── unitConverter.ts        # Unit conversion (metric/imperial)
│
├── logging/                     # Audit logging (1 file)
│   └── auditService.ts         # Action audit trail
│
├── search/                      # Search (1 file)
│   └── searchIndexer.ts        # Full-text search indexing (MiniSearch)
│
├── viz/                         # Visualization (1 file)
│   └── vizEngine.ts            # Data visualization engine
│
├── __tests__/                   # Service tests
│
├── storage.ts                   # Dual persistence (localStorage + IndexedDB)
├── componentValidator.ts        # Inventory-diagram consistency (502 LOC)
├── aiContextBuilder.ts          # AI context construction
├── aiMetricsService.ts          # AI latency/success tracking
├── responseParser.ts            # AI response parsing
├── geminiService.ts             # Legacy Gemini service facade
├── exportService.ts             # Export to PDF/CSV/JSON
├── bomService.ts                # Bill of Materials service
├── authService.ts               # Authentication service
├── apiKeyStorage.ts             # API key storage management
├── captureService.ts            # Component capture service
├── circuitAnalysisService.ts    # Circuit analysis
├── collabService.ts             # Collaboration service (Yjs)
├── commandHistory.ts            # Command history tracking
├── connectivityService.ts       # Network connectivity service
├── datasetService.ts            # Dataset management
├── datasheetProcessor.ts        # Datasheet processing
├── diagramDiffService.ts        # Diagram diff service
├── diagramDiff.ts               # Diagram diff utilities
├── fzpzLoader.ts                # Fritzing FZPZ file loader
├── gitService.ts                # In-browser Git (isomorphic-git)
├── healthMonitor.ts             # System health monitoring
├── inventoryApiClient.ts        # Server inventory API client
├── knowledgeService.ts          # Knowledge base service
├── liveAudio.ts                 # WebSocket live audio streaming
├── macroEngine.ts               # Action macro engine
├── offlineQueue.ts              # Offline operation queue
├── partStorageService.ts        # Part binary storage (IndexedDB)
├── peerDiscoveryService.ts      # WebRTC peer discovery
├── predictionEngine.ts          # AI prediction engine
├── questService.ts              # Quest/tutorial progression
├── ragService.ts                # RAG (retrieval-augmented generation)
├── securityAuditor.ts           # Client-side security auditing
├── serialService.ts             # Hardware serial communication
├── simulationEngine.ts          # Simulation engine coordinator
├── standardsService.ts          # IPC-7351 package standards
├── syncManager.ts               # Sync state management
├── syncService.ts               # Sync operations
├── transactionQueue.ts          # Transaction queue
├── tutorialValidator.ts         # Tutorial validation
├── userProfileService.ts        # User profile service
├── visionAnalysisService.ts     # Vision analysis service
├── webRTCService.ts             # WebRTC service
├── threeCodeRunner.ts           # Three.js code execution
├── threeCodeRunner.worker.ts    # Three.js code runner Web Worker
├── threeCodeValidator.ts        # Three.js code validation/sandboxing
├── threePrimitives.ts           # 3D primitive library (1257 LOC)
└── threeWorkerPolyfill.ts       # Web Worker polyfills for Three.js
```

---

## Gemini Service (services/gemini/)

Modular AI integration. Refactored from monolithic 923-line file.

### client.ts -- API Client & Model Routing

```typescript
export const MODELS = {
  WIRING: 'gemini-2.5-pro',
  CHAT: 'gemini-2.5-flash',
  VISION: 'gemini-2.5-pro',
  IMAGE: 'gemini-2.5-flash',               // Multimodal input
  IMAGE_GEN: 'imagen-3.0-generate-001',     // Image generation
  VIDEO: 'veo-2.0-generate-001',            // Video generation
  THINKING: 'gemini-2.5-flash',             // Deep thinking mode
  THUMBNAIL: 'imagen-3.0-generate-001',     // Thumbnail generation
  SMART_FILL: 'gemini-2.5-flash',
  ASSIST_EDITOR: 'gemini-2.5-flash',
  AUTO_ID: 'gemini-2.5-flash',
  PART_FINDER: 'gemini-2.5-flash',
  SUGGEST_PROJECTS: 'gemini-2.5-flash',
  TTS: 'gemini-2.5-flash-tts',             // Text-to-speech
  AUDIO_TRANSCRIPTION: 'gemini-2.5-flash',
  AUDIO_REALTIME: 'gemini-2.5-flash-live', // Live audio streaming
  EMBEDDING: 'text-embedding-004',           // Semantic search/RAG
  CODE_GEN: 'gemini-2.5-pro',               // Three.js code generation
  CONTEXT_CHAT_DEFAULT: 'gemini-2.5-flash',
  CONTEXT_CHAT_COMPLEX: 'gemini-2.5-pro',
};
```

**API Key Resolution**: localStorage `cm_gemini_api_key` > `process.env.API_KEY` (build-time injected).

**Singleton Pattern**: `getAIClient()` returns cached `GoogleGenAI` instance. `resetAIClient()` clears cache (used on key change).

### features/chat.ts -- Chat Operations

| Function | Purpose |
|----------|---------|
| `chatWithAI(content, history, attachment?, deepThinking?)` | General chat |
| `chatWithContext(content, history, context, options)` | Context-aware chat with actions |

Returns structured response with `message`, `componentMentions[]`, `suggestedActions[]`, `proactiveSuggestion`.

### features/wiring.ts -- Diagram Generation

```typescript
generateWiringDiagram(
  prompt: string,
  inventoryContext: string
): Promise<WiringDiagram>
```

Uses `gemini-2.5-pro` with structured output schema. Injects inventory context for component matching.

### features/components.ts -- Component AI Features

| Function | Purpose |
|----------|---------|
| `explainComponent(name)` | Get detailed component explanation |
| `smartFillComponent(name, type?)` | Auto-fill specs using Google Search |
| `assistComponentEditor(history, component, instruction)` | Editor AI assistant |
| `augmentComponentData(partialName)` | Identify from partial info |
| `findComponentSpecs(query)` | Search for component specs |
| `identifyComponentFromImage(base64)` | Identify component from photo |
| `generateComponent3DCode(name, type, instructions?)` | Generate Three.js code |

### features/media.ts -- Image/Video/Audio

| Function | Purpose |
|----------|---------|
| `generateConceptImage(prompt, size, aspectRatio)` | Concept art (imagen-3.0-generate-001) |
| `generateCircuitVideo(prompt, aspectRatio, imageBase64?)` | Video (veo-2.0-generate-001) |
| `transcribeAudio(audioBase64)` | Speech-to-text |
| `generateSpeech(text)` | Text-to-speech (gemini-2.5-flash-tts) |

**Veo URL fix**: Veo video URLs require `&key=API_KEY` appended.

### Other Feature Modules

| File | Purpose |
|------|---------|
| `features/suggestions.ts` | Proactive suggestions based on app state |
| `features/predictions.ts` | Predictive component/connection suggestions |
| `features/bom.ts` | Bill of Materials generation |
| `features/datasheets.ts` | Datasheet lookup and processing |
| `features/hud.ts` | HUD content generation |
| `features/simulation.ts` | Simulation-related AI assistance |
| `features/versioning.ts` | Version/change management |

### contextLimits.ts -- Token Limit Handling

Context truncation and overflow detection for Gemini API calls.

---

## storage.ts -- Dual Persistence Layer

Database: `CircuitMindDB` v2 (IndexedDB)

### Key Functions

| Function | Purpose |
|----------|---------|
| `initDB()` | Initialize/upgrade database |
| `saveInventoryToDB(items)` | Bulk save (clear + add all) |
| `loadInventoryFromDB()` | Load all items |
| `saveConversation(conv)` | Upsert conversation |
| `listConversations(limit?)` | Get recent conversations |
| `saveMessage(msg)` | Save chat message |
| `loadMessages(convId)` | Load conversation messages |
| `deleteConversation(id)` | Delete with all messages |
| `recordAction(action)` | Log for undo support |
| `getRecentActions(limit)` | Get action history |

### IndexedDB Stores

| Store | Data |
|-------|------|
| `INVENTORY` | Component library |
| `CONVERSATIONS` | Chat sessions |
| `MESSAGES` | Chat messages (indexed by `conversationId`) |
| Parts cache | Binary FZPZ data |

---

## componentValidator.ts (502 LOC)

Validates component data integrity and inventory-diagram consistency.

| Function | Purpose |
|----------|---------|
| `validateComponent(component)` | Full validation with errors/warnings |
| `validatePins(pins)` | Pin array validation |
| `validateConnections(connections, components)` | Connection integrity |
| `checkDuplicatePins(pins)` | Find duplicate pin names |

---

## aiContextBuilder.ts -- AI Context Construction

Builds context objects for AI awareness of app state.

| Function | Purpose |
|----------|---------|
| `buildAIContext(options)` | Returns `AIContext` with diagram, inventory, selection info |
| `buildContextPrompt(context)` | Converts AIContext to text for Gemini prompt |

---

## aiMetricsService.ts -- AI Metrics

Tracks AI operation latency and success rates.

```typescript
aiMetricsService.logMetric({
  model: 'gemini-2.5-flash',
  operation: 'chatWithContext',
  latencyMs: 1234,
  success: true
});

const stats = aiMetricsService.getStats('chatWithContext');
// { avgLatency, successRate, totalCalls }
```

---

## threePrimitives.ts (1257 LOC)

Library of reusable Three.js primitives for AI-generated 3D models.

| Primitive | Purpose |
|-----------|---------|
| `createPCB(w, h, d)` | Green PCB base |
| `createChip(w, h, d)` | IC package |
| `createPin(count, pitch)` | Pin array |
| `createUSB(type)` | USB connectors |
| `createCapacitor(type)` | Various capacitor types |
| `createLED(color)` | LED with glow effect |
| `createButton()` | Tactile button |
| `createHeader(pins, rows)` | Pin headers |

---

## liveAudio.ts -- WebSocket Live Audio

Real-time audio streaming to Gemini Live (gemini-2.5-flash-live).

Uses `nextStartTime` for gapless playback. `liveSessionRef` uses `useRef` not `useState`.

---

## Simulation Services

### simulationEngine.ts -- Coordinator

Orchestrates the MNA simulation pipeline via Web Worker.

### simulation/ -- MNA Engine (10 files)

See [performance.md](./performance.md) for the full worker architecture diagram.

| File | Purpose |
|------|---------|
| `mnaSolver.ts` | DC analysis via LU decomposition |
| `mnaMatrixAssembler.ts` | Stamp-based MNA matrix construction |
| `mnaGraphBuilder.ts` | Circuit topology from diagram |
| `mnaErrorDetector.ts` | Floating nodes, short circuits |
| `mnaResultFormatter.ts` | Human-readable simulation results |
| `componentValueExtractor.ts` | Electrical values from component data |
| `simulationWorker.worker.ts` | Web Worker entry point |
| `simulationWorkerBridge.ts` | Main thread <-> Worker communication |
| `types.ts` | Simulation-specific types |
| `workerTypes.ts` | Worker message protocol types |

Key gotcha: `mathjs lusolve()` returns Matrix object -- MUST call `.valueOf()` before array indexing.

---

## Three.js Services

| File | Purpose |
|------|---------|
| `threePrimitives.ts` | 3D primitive library (1257 LOC) |
| `threeCodeRunner.ts` | Execute AI-generated Three.js code |
| `threeCodeRunner.worker.ts` | Web Worker for sandboxed execution |
| `threeCodeValidator.ts` | Validate/sanitize Three.js code |
| `threeWorkerPolyfill.ts` | Worker polyfills for Three.js |

---

## Other Services

| File | Purpose |
|------|---------|
| `exportService.ts` | Export diagrams to PDF/CSV/JSON |
| `bomService.ts` | Bill of Materials operations |
| `authService.ts` | Authentication |
| `apiKeyStorage.ts` | API key management |
| `captureService.ts` | Component capture (photo/voice/file) |
| `circuitAnalysisService.ts` | Circuit analysis |
| `collabService.ts` | Yjs collaboration |
| `commandHistory.ts` | Command history |
| `connectivityService.ts` | Network connectivity |
| `datasetService.ts` | Dataset management |
| `datasheetProcessor.ts` | Datasheet processing |
| `diagramDiffService.ts` | Diagram diff operations |
| `diagramDiff.ts` | Diff utilities |
| `fzpzLoader.ts` | Fritzing FZPZ file loading |
| `gitService.ts` | In-browser Git (isomorphic-git) |
| `healthMonitor.ts` | System health monitoring |
| `inventoryApiClient.ts` | Server inventory API client |
| `knowledgeService.ts` | Knowledge base |
| `macroEngine.ts` | Action macro recording/playback |
| `offlineQueue.ts` | Offline operation queue |
| `partStorageService.ts` | Part binary storage (IndexedDB) |
| `peerDiscoveryService.ts` | WebRTC peer discovery |
| `predictionEngine.ts` | AI prediction engine |
| `questService.ts` | Quest/tutorial progression |
| `ragService.ts` | RAG (retrieval-augmented generation) |
| `responseParser.ts` | AI response parsing |
| `securityAuditor.ts` | Client-side security auditing |
| `serialService.ts` | Hardware serial communication |
| `standardsService.ts` | IPC-7351 package standards |
| `syncManager.ts` | Sync state management |
| `syncService.ts` | Sync operations |
| `transactionQueue.ts` | Transaction queue |
| `tutorialValidator.ts` | Tutorial validation |
| `userProfileService.ts` | User profile management |
| `visionAnalysisService.ts` | Vision analysis |
| `webRTCService.ts` | WebRTC operations |
