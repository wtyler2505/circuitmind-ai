# CircuitMind AI -- Exhaustive Services Catalog

> Generated 2026-02-08. Covers every file under `services/` (77 files across 12 subdirectories).

---

## Table of Contents

1. [Gemini AI Core (services/gemini/)](#1-gemini-ai-core)
2. [Gemini Feature Modules (services/gemini/features/)](#2-gemini-feature-modules)
3. [API Layer (services/api/)](#3-api-layer)
4. [Storage & Persistence (services/storage.ts)](#4-storage--persistence)
5. [Component Validation (services/componentValidator.ts)](#5-component-validation)
6. [AI Context Builder (services/aiContextBuilder.ts)](#6-ai-context-builder)
7. [AI Metrics (services/aiMetricsService.ts)](#7-ai-metrics)
8. [API Key Storage (services/apiKeyStorage.ts)](#8-api-key-storage)
9. [Authentication (services/authService.ts)](#9-authentication)
10. [BOM Service (services/bomService.ts)](#10-bom-service)
11. [Circuit Analysis (services/circuitAnalysisService.ts)](#11-circuit-analysis)
12. [Collaboration (services/collabService.ts)](#12-collaboration)
13. [Connectivity (services/connectivityService.ts)](#13-connectivity)
14. [Dataset Service (services/datasetService.ts)](#14-dataset-service)
15. [Datasheet Processor (services/datasheetProcessor.ts)](#15-datasheet-processor)
16. [Diagram Diff (services/diagramDiff.ts)](#16-diagram-diff)
17. [FZPZ Loader (services/fzpzLoader.ts)](#17-fzpz-loader)
18. [Gemini Service Facade (services/geminiService.ts)](#18-gemini-service-facade)
19. [Git Service (services/gitService.ts)](#19-git-service)
20. [Health Monitor (services/healthMonitor.ts)](#20-health-monitor)
21. [Knowledge Service (services/knowledgeService.ts)](#21-knowledge-service)
22. [Live Audio (services/liveAudio.ts)](#22-live-audio)
23. [Macro Engine (services/macroEngine.ts)](#23-macro-engine)
24. [Part Storage Service (services/partStorageService.ts)](#24-part-storage-service)
25. [Peer Discovery (services/peerDiscoveryService.ts)](#25-peer-discovery)
26. [Prediction Engine (services/predictionEngine.ts)](#26-prediction-engine)
27. [RAG Service (services/ragService.ts)](#27-rag-service)
28. [Response Parser (services/responseParser.ts)](#28-response-parser)
29. [Security Auditor (services/securityAuditor.ts)](#29-security-auditor)
30. [Serial Service (services/serialService.ts)](#30-serial-service)
31. [Simulation Engine (services/simulationEngine.ts)](#31-simulation-engine)
32. [Standards Service (services/standardsService.ts)](#32-standards-service)
33. [Sync Service (services/syncService.ts)](#33-sync-service)
34. [Three.js Code Validator (services/threeCodeValidator.ts)](#34-threejs-code-validator)
35. [Three.js Code Runner (services/threeCodeRunner.ts)](#35-threejs-code-runner)
36. [Three.js Primitives (services/threePrimitives.ts)](#36-threejs-primitives)
37. [Tutorial Validator (services/tutorialValidator.ts)](#37-tutorial-validator)
38. [User Profile Service (services/userProfileService.ts)](#38-user-profile-service)
39. [Vision Analysis (services/visionAnalysisService.ts)](#39-vision-analysis)
40. [WebRTC Service (services/webRTCService.ts)](#40-webrtc-service)
41. [Subdirectory Services](#41-subdirectory-services)
    - [Analytics (services/analytics/)](#analytics)
    - [Config (services/config/)](#config)
    - [Error (services/error/)](#error)
    - [Feedback (services/feedback/)](#feedback)
    - [Gesture (services/gesture/)](#gesture)
    - [Localization (services/localization/)](#localization)
    - [Logging (services/logging/)](#logging)
    - [Search (services/search/)](#search)
    - [Visualization (services/viz/)](#viz)

---

## 1. Gemini AI Core

### services/gemini/client.ts (~75 LOC)

**Purpose**: Singleton Gemini AI client with model constant definitions.

**Exported Constants**:
- `MODELS` -- Object mapping 20 model roles to Gemini model IDs:
  | Constant | Model ID | Usage |
  |----------|----------|-------|
  | `WIRING` | `gemini-2.5-pro` | Wiring diagram generation (accuracy) |
  | `CHAT` | `gemini-2.5-flash` | Default chat (speed) |
  | `CONTEXT_CHAT_COMPLEX` | `gemini-2.5-pro` | Complex chat queries |
  | `VISION` | `gemini-2.5-pro` | Image analysis |
  | `IMAGE` | `gemini-2.5-flash` | Multimodal input |
  | `IMAGE_GEN` | `imagen-3.0-generate-001` | Image generation |
  | `THUMBNAIL` | `imagen-3.0-generate-001` | Thumbnail generation |
  | `VIDEO` | `veo-2.0-generate-001` | Video generation |
  | `THINKING` | `gemini-2.5-flash` | Deep thinking mode |
  | `TTS` | `gemini-2.5-flash-tts` | Text-to-speech |
  | `AUDIO_TRANSCRIPTION` | `gemini-2.5-flash` | Audio transcription |
  | `AUDIO_REALTIME` | `gemini-2.5-flash-live` | Live audio streaming |
  | `EMBEDDING` | `text-embedding-004` | Semantic search / RAG |
  | `CODE_GEN` | `gemini-2.5-pro` | Three.js code generation |
  | `SMART_FILL` | `gemini-2.5-flash` | Component auto-complete |
  | `PART_FINDER` | `gemini-2.5-flash` | Part search |
  | `AUTO_ID` | `gemini-2.5-flash` | Component identification |
  | `ASSIST_EDITOR` | `gemini-2.5-flash` | Editor assistance |
  | `SUGGEST_PROJECTS` | `gemini-2.5-flash` | Project suggestions |
  | `CONTEXT_CHAT_DEFAULT` | `gemini-2.5-flash` | Default context chat |

**Exported Functions**:
- `getApiKey(): string` -- Retrieves API key from localStorage (`cm_gemini_api_key`) or `process.env.API_KEY`
- `getAIClient(): GoogleGenAI` -- Returns singleton GoogleGenAI instance; lazy-initializes on first call
- `resetAIClient(): void` -- Nullifies singleton, forcing re-initialization on next call

**Exported Types**:
- `APIError` -- Extends `Error` with optional `status?: number`

**Side Effects**: Reads from localStorage (`cm_gemini_api_key`). Declares `window.aistudio` global augmentation for AI Studio debugging.

**Dependencies**: `@google/genai`

---

### services/gemini/types.ts (~100 LOC)

**Purpose**: Type definitions for Gemini SDK interactions and response schemas.

**Exported Types**:
- `GeminiTextPart` -- `{ text: string }`
- `GeminiInlineDataPart` -- `{ inlineData: { mimeType: string; data: string } }`
- `GeminiPart` -- Union of `GeminiTextPart | GeminiInlineDataPart`
- `GeminiChatMessage` -- `{ role: 'user' | 'model'; parts: GeminiPart[] }`
- `GeminiTool` -- `{ googleSearch?: Record<string, unknown>; codeExecution?: Record<string, unknown> }`
- `GeminiConfig` -- Extends `GenerateContentConfig` with `imageConfig?`, `thinkingConfig?`
- `ParsedAIResponse` -- Full structured AI response with message, actions, mentions, proactive suggestions
- `AISuggestedAction` -- `{ type: ActionType; label: string; payloadJson?: string; payload?: unknown }`
- `AIComponentMention` -- `{ componentId: string; componentName: string }`

**Exported Constants**:
- `WIRING_SCHEMA` -- Gemini SDK `Schema` for wiring diagram JSON responses
- `CHAT_RESPONSE_SCHEMA` -- Gemini SDK `Schema` for structured chat responses
- `SMART_FILL_SCHEMA` -- Schema for component auto-fill
- `PART_FINDER_SCHEMA` -- Schema for part search results
- `AUTO_ID_SCHEMA` -- Schema for image-based component identification
- `ASSIST_EDITOR_SCHEMA` -- Schema for editor assistant responses
- `SUGGEST_PROJECTS_SCHEMA` -- Schema for project suggestions

**Dependencies**: `@google/genai` (Schema, Type), `../../types` (ActionType, ComponentReference)

---

### services/gemini/prompts.ts (~120 LOC)

**Purpose**: All prompt templates used across AI features.

**Exported Functions**:
- `formatInventoryContext(inventory: ElectronicComponent[]): string` -- Formats component list as "ID:xxx - Name (type) [Pins: a, b, c]" string

**Exported Constants**:
- `PROMPTS` -- Object containing prompt templates:
  - `WIRING_SYSTEM(inventoryStr: string): string` -- Expert electronics engineer system prompt
  - `EXPLAIN_COMPONENT(name: string): string` -- Component explanation request
  - `SMART_FILL(name: string, type?: string): string` -- Auto-fill technical details
  - `ASSIST_EDITOR(currentComponentJson: string, userInstruction: string): string` -- Editor AI assistant
  - `AUGMENT_COMPONENT(name: string): string` -- Component identification
  - `FIND_COMPONENT(query: string): string` -- Part finder search
  - `IDENTIFY_IMAGE: string` -- Image-based component identification
  - `SUGGEST_PROJECTS(items: string): string` -- Project idea generation
  - `CHAT_SYSTEM: string` -- Default chat system instruction
  - `TRANSCRIBE_AUDIO: string` -- Audio transcription instruction
  - `GENERATE_THUMBNAIL(name: string): string` -- Imagen thumbnail prompt
  - `buildContextPrompt(context: AIContext): string` -- Builds full context string for context-aware chat

**Dependencies**: `../aiContextBuilder`, `../knowledgeService`, `../ragService`, `../../types`

---

### services/gemini/parsers.ts (~100 LOC)

**Purpose**: Response extraction and normalization from Gemini API responses.

**Exported Functions**:
- `normalizeProactiveSuggestions(input: unknown): string[]` -- Extracts up to 3 suggestion strings from varied AI output formats
- `parseJSONResponse<T>(text: string): T` -- Parses JSON from AI text, stripping markdown code fences
- `extractComponentMentions(parsedMentions: AIComponentMention[] | undefined, messageText: string): ComponentReference[]` -- Maps AI mentions to `ComponentReference` with text position indices
- `extractSuggestedActions(parsedActions: AISuggestedAction[] | undefined): ActionIntent[]` -- Normalizes suggested actions, parsing payload JSON strings

**Error Handling**: `parseJSONResponse` strips markdown fences then throws descriptive error on parse failure. `extractSuggestedActions` silently falls back to `{ componentId: payloadJson }` if JSON parse fails.

**Dependencies**: `../../types` (ActionIntent, ActionType, ComponentReference)

---

### services/gemini/index.ts

**Purpose**: Re-export barrel file for the gemini module.

---

## 2. Gemini Feature Modules

### services/gemini/features/bom.ts

**Purpose**: AI-powered Bill of Materials enhancement.

**Exported Functions**:
- `generateAIBOM(diagram, inventory, apiKey)` -- Uses Gemini to generate enhanced BOM with estimated pricing and sourcing suggestions

**Dependencies**: `../client`, `../types`, `../../../types`

---

### services/gemini/features/chat.ts

**Purpose**: Core chat functionality with context-aware AI responses.

**Exported Functions**:
- `sendChatMessage(message, history, context, config)` -- Sends a message to Gemini with conversation history and application context. Returns `ParsedAIResponse` with structured message, actions, mentions, and proactive suggestions.
- `sendContextAwareChat(message, history, context, isComplex)` -- Routes to `CONTEXT_CHAT_DEFAULT` or `CONTEXT_CHAT_COMPLEX` model based on complexity flag.

**Side Effects**: Network calls to Gemini API. Metrics logged via `engineeringMetricsService`.

**Dependencies**: `../client`, `../types`, `../prompts`, `../../aiMetricsService`

---

### services/gemini/features/components.ts

**Purpose**: Component intelligence -- smart-fill, part finder, auto-identification.

**Exported Functions**:
- `smartFillComponent(name, type?)` -- Auto-fills component details (description, pins, datasheet URL) using Gemini
- `findComponents(query)` -- Searches for components matching a query, returns 3-5 results
- `identifyComponentFromImage(base64Image)` -- Uses Gemini Vision to identify a component from a photo
- `augmentComponent(name)` -- Enriches component data with standard type, description, pins
- `assistEditor(componentJson, instruction)` -- AI editor assistant with Google Search grounding

**Dependencies**: `../client`, `../types`, `../prompts`

---

### services/gemini/features/datasheets.ts

**Purpose**: AI-powered datasheet analysis and extraction.

**Exported Functions**:
- `analyzeDatasheet(pdfBase64, componentName)` -- Extracts pin configuration, specifications, and application notes from a datasheet PDF via Gemini Vision

**Dependencies**: `../client`

---

### services/gemini/features/hud.ts

**Purpose**: HUD (Heads-Up Display) content generation.

**Exported Functions**:
- `generateHUDContent(diagram, selectedComponent)` -- Generates contextual HUD tooltips and status information for the selected component and circuit state

**Dependencies**: `../client`, `../types`

---

### services/gemini/features/media.ts

**Purpose**: Media generation -- images, thumbnails, video, audio.

**Exported Functions**:
- `generateComponentImage(name, style?)` -- Generates component image via Imagen 3
- `generateThumbnail(name)` -- Generates product-style thumbnail photo
- `generateVideo(prompt)` -- Generates video via Veo 2.0 (returns URL that needs `&key=API_KEY` appended)
- `textToSpeech(text, voiceConfig?)` -- Generates speech audio via Gemini TTS
- `transcribeAudio(audioBase64)` -- Transcribes audio using Gemini Flash

**Dependencies**: `../client`, `../prompts`

---

### services/gemini/features/predictions.ts

**Purpose**: Predictive component suggestions.

**Exported Functions**:
- `predictNextComponent(diagram, inventory, recentActions)` -- Predicts what component the user might add next based on context
- `suggestProjects(inventoryItems)` -- Suggests creative projects buildable with current inventory

**Dependencies**: `../client`, `../prompts`

---

### services/gemini/features/simulation.ts

**Purpose**: AI-enhanced circuit simulation analysis.

**Exported Functions**:
- `analyzeSimulationResults(diagram, simResults)` -- Uses Gemini to provide natural-language analysis of simulation output, identifying issues and suggesting fixes

**Dependencies**: `../client`, `../../simulationEngine`

---

### services/gemini/features/suggestions.ts

**Purpose**: Proactive AI suggestions and recommendations.

**Exported Functions**:
- `generateSuggestions(diagram, inventory, userLevel)` -- Generates contextual suggestions: wiring improvements, missing components, best practices
- `generateComponentSuggestions(selectedComponent, diagram)` -- Suggests how to use or connect a specific component

**Dependencies**: `../client`, `../types`

---

### services/gemini/features/versioning.ts

**Purpose**: AI-powered project versioning and diff analysis.

**Exported Functions**:
- `generateVersionSummary(oldDiagram, newDiagram)` -- Generates natural-language diff summary between two diagram versions
- `suggestCommitMessage(changes)` -- AI-generated commit messages for diagram checkpoints

**Dependencies**: `../client`

---

### services/gemini/features/wiring.ts

**Purpose**: AI wiring diagram generation (the core creative feature).

**Exported Functions**:
- `generateWiringDiagram(prompt, inventory, config?)` -- Generates a complete `WiringDiagram` JSON from natural-language prompt using Gemini Pro with structured output (WIRING_SCHEMA). Uses `formatInventoryContext` to include existing components.

**Dependencies**: `../client`, `../types`, `../prompts`, `../../aiMetricsService`

---

## 3. API Layer

### services/api/apiGateway.ts (~53 LOC)

**Purpose**: Virtual REST API gateway for external tool integration.

**Exported Functions**:
- `initAPIGateway(getContext: () => GatewayContext): void` -- Registers three virtual endpoints:
  - `GET /v1/projects` -- Returns git history
  - `GET /v1/inventory` -- Returns current inventory
  - `POST /v1/actions` -- Executes an ActionIntent (requires admin token for unsafe actions)

**Types**:
- `GatewayContext` -- `{ inventory: unknown[]; executeAction: (action: ActionIntent, auto: boolean) => Promise<{ success: boolean; error?: string }> }`

**Side Effects**: Calls `apiDispatcher.register()` to wire routes. Uses `tokenService.validateToken()` for auth.

**Dependencies**: `./apiDispatcher`, `./tokenService`, `../gitService`, `../../types`

---

### services/api/apiDispatcher.ts (~37 LOC)

**Purpose**: Virtual HTTP request dispatcher (no real network -- all in-memory routing).

**Exported Types**:
- `APIRequest` -- `{ method: 'GET' | 'POST' | 'DELETE' | 'PUT'; path: string; body?: unknown; headers: Record<string, string> }`
- `APIResponse` -- `{ status: number; body: unknown }`

**Exported Singleton**:
- `apiDispatcher` -- Instance of `APIDispatcher` class
  - `dispatch(req: APIRequest): Promise<APIResponse>` -- Routes request to matching handler, returns 404 if not found
  - `register(method, path, handler): void` -- Registers a handler for `"METHOD /path"` key

---

### services/api/events.ts (~38 LOC)

**Purpose**: Application event bus with webhook support.

**Type**:
- `AppEvent` -- `'save' | 'simulation_pass' | 'low_stock' | 'action_execute'`

**Exported Singleton**:
- `appEvents` -- Instance of `AppEventEmitter`:
  - `on(event: AppEvent, callback: (data: unknown) => void): void` -- Subscribe to events
  - `emit(event: AppEvent, data: unknown): void` -- Emit event to listeners and trigger webhooks

**Side Effects**: Reads webhooks from `localStorage` key `cm_webhooks`. Sends fire-and-forget POST requests to registered webhook URLs.

---

### services/api/tokenService.ts (~58 LOC)

**Purpose**: API token management for virtual REST API authentication.

**Exported Types**:
- `APIToken` -- `{ id: string; name: string; secret: string; role: 'admin' | 'engineer'; createdAt: number }`

**Exported Singleton**:
- `tokenService` -- Instance of `TokenService`:
  - `generateToken(name: string, role: 'admin' | 'engineer'): APIToken` -- Creates token with `cm_` prefix secret
  - `validateToken(secret: string): APIToken | null` -- Finds token by secret
  - `getTokens(): APIToken[]` -- Returns all tokens
  - `revokeToken(id: string): void` -- Removes token by ID

**Storage**: localStorage key `cm_api_tokens`

---

## 4. Storage & Persistence

### services/storage.ts (~325 LOC)

**Purpose**: Dual-layer persistence -- localStorage wrapper with quota protection AND IndexedDB for structured data.

**IndexedDB Configuration**:
- Database: `CircuitMindDB`, Version 3
- Stores: `inventory` (keyPath: id), `app_state` (keyPath: key), `action_history` (keyPath: id), `conversations` (keyPath: id), `messages` (keyPath: id, index: conversationId), `parts` (keyPath: id)

**Exported -- localStorage Wrapper**:
- `storageService.setItem(key: string, value: string): boolean` -- Saves to localStorage with quota handling
- `storageService.getItem(key: string): string | null` -- Reads from localStorage
- `storageService.handleQuotaExceeded(key, value): boolean` -- Purges 3D code cache, then prunes inventory images

**Exported -- Action History (IndexedDB)**:
- `recordAction(action: ActionRecord): Promise<void>` -- Sanitizes and stores action record
- `getRecentActions(limit?: number): Promise<ActionRecord[]>` -- Returns most recent actions (default 10), sorted by timestamp descending
- `deleteAction(id: string): Promise<void>` -- Removes single action

**Exported -- Conversations (IndexedDB)**:
- `saveConversation(conv: Conversation): Promise<void>` -- Upserts conversation
- `listConversations(limit?: number): Promise<Conversation[]>` -- Lists conversations sorted by `updatedAt` descending (default 50)
- `deleteConversation(id: string): Promise<void>` -- Deletes conversation AND all its messages (cascade)
- `getPrimaryConversation(): Promise<Conversation | null>` -- Returns conversation with `isPrimary: true`
- `saveMessage(msg: EnhancedChatMessage): Promise<void>` -- Stores chat message
- `loadMessages(conversationId: string): Promise<EnhancedChatMessage[]>` -- Loads messages for conversation, sorted by timestamp ascending

**Exported -- Inventory (IndexedDB)**:
- `saveInventoryToDB(items: ElectronicComponent[]): Promise<void>` -- Clears store and re-writes all items
- `loadInventoryFromDB(): Promise<ElectronicComponent[]>` -- Returns all inventory items

**Internal Helper**:
- `sanitizeForDB(obj: unknown)` -- Uses `structuredClone` with JSON fallback for circular references; drops non-serializable values

**Error Handling**: Quota exceeded triggers progressive purge (3D cache first, then inventory images). All IndexedDB operations have Promise-based error propagation.

---

## 5. Component Validation

### services/componentValidator.ts (~502 LOC)

**Purpose**: Enforces 100% consistency between inventory (source of truth) and diagram canvas.

**Exported Types**:
- `ComponentMismatch` -- `{ diagramComponentId, diagramComponentName, inventoryId, field: 'name'|'type'|'pins'|'description'|'missing'|'orphaned', expected, actual, severity: 'error'|'warning' }`
- `ValidationResult` -- `{ isValid: boolean; mismatches: ComponentMismatch[]; orphanedCount; syncedCount; totalChecked }`
- `ComponentUsage` -- `{ inventoryId, inDiagramCount, hasActiveConnections, connectionCount, inSavedDiagrams, onlyInDrafts, diagramIds }`
- `OrphanAction` -- `'block' | 'warn' | 'cascade'`

**Exported Functions**:
- `validateDiagramInventoryConsistency(diagram, inventory): ValidationResult` -- Checks every diagram component against inventory; detects orphans, name/type/pin mismatches
- `analyzeUsage(inventoryId, currentDiagram, savedDiagrams?): ComponentUsage` -- Determines how a component is used across all diagrams
- `determineOrphanAction(inventoryId, currentDiagram, savedDiagrams?): { action: OrphanAction; reason: string; usage: ComponentUsage }` -- Decision logic: block if wired, warn if in saved diagrams, cascade if only in drafts
- `migrateLegacyDiagram(diagram, inventory): { diagram: WiringDiagram; repairedCount: number }` -- Maps legacy IDs (e.g., "mcu" -> "mcu-arduino-uno-r3") to new semantic IDs
- `syncComponentWithInventory(diagramComp, inventory): ElectronicComponent` -- Syncs single diagram component fields from inventory source
- `syncDiagramWithInventory(diagram, inventory): { diagram: WiringDiagram; changeCount: number }` -- Syncs all diagram components
- `removeOrphanedComponents(diagram, inventory): { diagram: WiringDiagram; removedIds: string[] }` -- Removes components whose inventory source no longer exists, plus their connections
- `verifyModelDimensions(model, expected): { score: number; deviations: string[] }` -- Validates 3D model dimensions against expected values (10% width/length, 20% height tolerance)

**Algorithm**: Inventory-first comparison using `Map<id, ElectronicComponent>`. Legacy ID migration via hardcoded `LEGACY_ID_MAP`. Pin comparison is order-independent (Set equality). Orphan cascade also removes dangling wire connections.

---

## 6. AI Context Builder

### services/aiContextBuilder.ts (~150 LOC)

**Purpose**: Builds comprehensive context objects for context-aware AI responses.

**Exported Types**:
- `BuildContextOptions` -- `{ diagram, inventory, selectedComponentId?, activeView?, viewport?, recentHistory?, activeSelectionPath?, includeDetailedDiagram?, includeFullInventory? }`

**Exported Functions**:
- `buildAIContext(options: BuildContextOptions): Promise<AIContext>` -- Assembles full context including:
  - Inventory summary (type counts)
  - Recent actions (last 5)
  - User profile (expertise, preferences)
  - Relevant correction lessons from feedback history
  - Selected component details
  - Diagram state
- `buildContextPrompt(context: AIContext): string` -- Serializes `AIContext` into a prompt-friendly string

**Dependencies**: `./storage` (getRecentActions), `./userProfileService`, `./feedback/correctionService`

---

## 7. AI Metrics

### services/aiMetricsService.ts (~100 LOC)

**Purpose**: Tracks AI performance (latency, success rate) and engineering events.

**Exported Types**:
- `AIMetric` -- `{ id, timestamp, model, operation, latencyMs, success, userSatisfaction?, error? }`
- `EngineeringEvent` -- `{ id, timestamp, type: 'action_execute'|'diagram_update'|'ai_suggestion_accept'|'ai_suggestion_reject'|'checkpoint_created', payload }`

**Exported Singleton**:
- `engineeringMetricsService`:
  - `logAiMetric(metric): string` -- Logs metric, returns ID. Cap: 1000 entries with FIFO rotation.
  - `getAverageLatency(operation?): number` -- Average latency in ms, optionally filtered by operation
  - `getSuccessRate(operation?): number` -- Success percentage, optionally filtered
  - `logEvent(type, payload): void` -- Logs engineering event. Cap: 1000 entries.
  - `getAiMetrics(): AIMetric[]` -- Returns all stored metrics
  - `getEvents(): EngineeringEvent[]` -- Returns all stored events
  - `recordAiFeedback(metricId, score): void` -- Attaches user satisfaction score to a metric

**Storage**: localStorage keys `cm_ai_metrics`, `cm_eng_events`

---

## 8. API Key Storage

### services/apiKeyStorage.ts (~32 LOC)

**Purpose**: Dedicated localStorage operations for Gemini API key.

**Exported Functions**:
- `getStoredApiKey(): string | null` -- Retrieves from localStorage key `cm_gemini_api_key`
- `setStoredApiKey(key: string): void` -- Stores trimmed key; removes if empty; verifies save with read-back

---

## 9. Authentication

### services/authService.ts (~100 LOC)

**Purpose**: PIN-based authentication using Web Crypto API (PBKDF2).

**Exported Types**:
- `UserRole` -- `'admin' | 'engineer' | 'observer'`
- `User` -- `{ id: string; name: string; role: UserRole }`
- `Session` -- `{ token: string; user: User; expiresAt: number }`

**Exported Singleton**:
- `authService`:
  - `hashPin(pin: string, salt: Uint8Array): Promise<string>` -- PBKDF2 with 100,000 iterations, SHA-256
  - `setupMasterPin(pin: string): Promise<void>` -- Generates random 16-byte salt, stores hash and salt
  - `validatePin(pin: string): Promise<User | null>` -- Compares hash against stored value
  - `getCurrentSession(): Session | null` -- Returns active session
  - `isAuthenticated(): boolean` -- Checks session validity

**Storage**: localStorage keys `cm_auth_hash`, `cm_auth_salt`

**Security**: PBKDF2 with 100,000 iterations prevents brute-force. Salt is randomly generated per setup.

---

## 10. BOM Service

### services/bomService.ts (~65 LOC)

**Purpose**: Bill of Materials generation from diagram + inventory.

**Exported Types**:
- `BOMItem` -- `{ id, name, quantity, type, mpn?, estimatedPrice?, datasheetUrl?, inInventory: boolean, currentStock: number }`
- `BOMReport` -- `{ title, timestamp, items: BOMItem[], totalEstimatedCost }`

**Exported Singleton**:
- `bomService.generateBOM(diagram: WiringDiagram, inventory: ElectronicComponent[]): BOMReport`
  - Groups diagram components by `sourceInventoryId`
  - Aggregates quantities
  - Cross-references inventory for stock levels, MPN, pricing
  - Calculates total estimated cost

---

## 11. Circuit Analysis

### services/circuitAnalysisService.ts (~100 LOC)

**Purpose**: Rule-based circuit validation and analysis.

**Exported Types**:
- `CircuitIssue` -- `{ severity: 'critical'|'warning'|'info'; componentId?; message; recommendation? }`
- `CircuitAnalysisReport` -- `{ isValid; issues: CircuitIssue[]; metrics: { componentCount, connectionCount, powerNets, estimatedCost? } }`

**Exported**:
- `circuitAnalysisService.analyze(diagram: WiringDiagram): CircuitAnalysisReport`
  - Checks: floating (unconnected) components, missing power/GND on MCUs, no power source, mixed 3.3V/5V logic level warnings
  - Builds connectivity map from wiring connections

---

## 12. Collaboration

### services/collabService.ts (~57 LOC)

**Purpose**: Real-time collaboration via Yjs CRDT + WebRTC.

**Exported Singleton**:
- `collabService`:
  - `joinRoom(roomId: string, onUpdate: (diagram: WiringDiagram) => void): void` -- Creates Y.Doc, connects via `WebrtcProvider` to signaling server (`ws://localhost:4444`), observes shared `diagram` map
  - `updateSharedState(diagram: WiringDiagram): void` -- Writes diagram fields to Y.Map in a transaction
  - `leaveRoom(): void` -- Destroys provider and doc
  - `getPresence(): Awareness | undefined` -- Returns awareness instance for cursor sharing

**Dependencies**: `yjs` (Y.Doc, Y.Map), `y-webrtc` (WebrtcProvider)

---

## 13. Connectivity

### services/connectivityService.ts (~48 LOC)

**Purpose**: Network connectivity monitoring.

**Exported Singleton**:
- `connectivityService`:
  - `onStatusChange(listener: (isOnline: boolean) => void): () => void` -- Subscribe to online/offline events; returns unsubscribe function
  - `getIsOnline(): boolean` -- Current status
  - `checkApiReachability(): Promise<boolean>` -- HEAD request to Gemini API endpoint (no-cors mode)

**Side Effects**: Registers `window.addEventListener('online'/'offline')` on construction.

---

## 14. Dataset Service

### services/datasetService.ts

**Purpose**: Manages training datasets for AI fine-tuning from user correction history.

**Exported Functions**:
- `exportTrainingData()` -- Exports correction lessons in JSONL format suitable for model fine-tuning

**Dependencies**: `./feedback/correctionService`

---

## 15. Datasheet Processor

### services/datasheetProcessor.ts

**Purpose**: Processes and extracts information from component datasheets.

**Dependencies**: `./gemini/features/datasheets`

---

## 16. Diagram Diff

### services/diagramDiff.ts

**Purpose**: Computes structural differences between two diagram versions.

**Exported Functions**:
- `computeDiagramDiff(oldDiagram, newDiagram)` -- Returns added/removed/modified components and connections

**Dependencies**: `../types`

---

## 17. FZPZ Loader

### services/fzpzLoader.ts

**Purpose**: Loads and parses Fritzing `.fzpz` part files (ZIP archives containing XML + SVG).

**Exported Functions**:
- `loadFZPZ(arrayBuffer: ArrayBuffer)` -- Parses ZIP, extracts part metadata, SVG views (breadboard, schematic, PCB), and connector definitions

**Dependencies**: Uses JSZip or similar ZIP library for extraction.

---

## 18. Gemini Service Facade

### services/geminiService.ts

**Purpose**: High-level facade that re-exports and wraps Gemini feature modules into a single API surface used by hooks and components.

**Exported Functions**: Wraps all functions from `gemini/features/*` with error handling and metrics logging.

**Dependencies**: All `services/gemini/features/*` modules, `./aiMetricsService`

---

## 19. Git Service

### services/gitService.ts

**Purpose**: In-browser Git operations via isomorphic-git for project versioning.

**Exported Singleton**:
- `gitService`:
  - `init()` -- Initializes in-memory filesystem and git repo
  - `writeFile(path, content)` -- Writes file to virtual FS
  - `readFile(path)` -- Reads file from virtual FS
  - `commit(message)` -- Stages all and commits
  - `log()` -- Returns commit history
  - `push(url)` -- Pushes to remote URL
  - `pull(url)` -- Pulls from remote URL

**Dependencies**: `isomorphic-git`, `@nicolo-ribaudo/chokidar` (or similar in-memory FS)

---

## 20. Health Monitor

### services/healthMonitor.ts

**Purpose**: System health monitoring -- CPU, memory, frame rate.

**Exported Functions**:
- `getHealthMetrics()` -- Returns current CPU usage, memory consumption, and FPS via `performance.memory` and `requestAnimationFrame` timing

**Side Effects**: Uses `performance.memory` (Chrome-only API).

---

## 21. Knowledge Service

### services/knowledgeService.ts

**Purpose**: Local knowledge base for component facts and user-learned information.

**Exported Singleton**:
- `knowledgeService`:
  - `addFact(content: string)` -- Stores a knowledge fact
  - `getRelevantFacts(query: string)` -- Retrieves facts relevant to a query
  - `getAllFacts()` -- Returns all stored facts

**Storage**: localStorage-based persistence.

---

## 22. Live Audio

### services/liveAudio.ts

**Purpose**: Real-time bidirectional audio streaming via Gemini Live Audio API.

**Key Implementation**:
- Uses `gemini-2.5-flash-live` model for real-time audio
- WebSocket-based session management
- `MediaRecorder` for capturing user audio
- Audio output via Web Audio API (`AudioContext`)
- Session stored as `useRef` (not `useState`) to avoid React re-render issues

**Exported Functions**:
- `createLiveSession(config)` -- Establishes WebSocket connection to Gemini Live API
- `sendAudioChunk(session, chunk)` -- Streams audio data to the API
- `closeLiveSession(session)` -- Cleanly closes the WebSocket

**Side Effects**: DOM (MediaRecorder, AudioContext), Network (WebSocket to Gemini Live API)

---

## 23. Macro Engine

### services/macroEngine.ts

**Purpose**: Records and replays user action sequences (macros).

**Exported Singleton**:
- `macroEngine`:
  - `startRecording()` -- Begins capturing ActionIntents
  - `stopRecording()` -- Returns recorded macro sequence
  - `recordAction(action: ActionIntent)` -- Appends action to current recording
  - `playMacro(macro, executeAction)` -- Replays a sequence of actions with delay

---

## 24. Part Storage Service

### services/partStorageService.ts

**Purpose**: IndexedDB-based binary cache for FZPZ parts and thumbnails.

**Exported Singleton**:
- `partStorageService`:
  - `savePart(id, data: ArrayBuffer)` -- Stores binary FZPZ data
  - `getPart(id): Promise<ArrayBuffer | null>` -- Retrieves cached part
  - `saveThumbnail(id, dataUrl: string)` -- Stores generated thumbnail
  - `getThumbnail(id): Promise<string | null>` -- Retrieves cached thumbnail

**Storage**: IndexedDB `parts` store in `CircuitMindDB`

---

## 25. Peer Discovery

### services/peerDiscoveryService.ts

**Purpose**: Discovers peers on local network for device-to-device sync.

**Exported Types**:
- `PeerNode` -- `{ deviceId, name, lastIp, pairingStatus: 'paired'|'pending'|'blocked', lastSyncHash }`

---

## 26. Prediction Engine

### services/predictionEngine.ts

**Purpose**: Local (non-AI) heuristic engine for predicting user next actions.

**Exported Functions**:
- `predictNextActions(diagram, inventory, recentActions)` -- Uses frequency analysis and pattern matching on recent action history to predict next likely component additions or wiring operations

---

## 27. RAG Service

### services/ragService.ts

**Purpose**: Retrieval-Augmented Generation using Gemini text embeddings.

**Exported Singleton**:
- `ragService`:
  - `indexDocuments(docs: { id: string; text: string }[])` -- Generates embeddings for documents using `text-embedding-004` model
  - `query(text: string, topK?: number)` -- Finds most similar documents via cosine similarity
  - `clear()` -- Resets the index

**Algorithm**: Cosine similarity between query embedding and stored document embeddings.

**Dependencies**: `./gemini/client` (for EMBEDDING model)

---

## 28. Response Parser

### services/responseParser.ts

**Purpose**: Legacy response parser (superseded by `gemini/parsers.ts` but still used in some code paths).

---

## 29. Security Auditor

### services/securityAuditor.ts

**Purpose**: Client-side security audit for detecting common web vulnerabilities.

**Exported Functions**:
- `runSecurityAudit()` -- Checks for: XSS vectors in stored data, CSP headers, mixed content, exposed API keys in localStorage, insecure WebSocket connections

**Returns**: Array of security findings with severity levels.

---

## 30. Serial Service

### services/serialService.ts (~181 LOC)

**Purpose**: Web Serial API integration for reading data from physical microcontrollers.

**Exported Types**:
- `TelemetryPacket` -- `{ componentId: string; pin?: string; value: string|number|boolean; unit?: string; timestamp: number }`
- `SerialOptions` -- `{ baudRate: number }`

**Exported Singleton**:
- `serialService`:
  - `requestPort(): Promise<boolean>` -- Prompts user to select a serial port (Web Serial API)
  - `openPort(options?: SerialOptions): Promise<void>` -- Opens port (default 115200 baud) and starts read loop
  - `onData(callback: (packet: TelemetryPacket) => void)` -- Register for parsed telemetry packets
  - `onRawData(callback: (data: string) => void)` -- Register for raw serial line output
  - `close(): Promise<void>` -- Stops read loop and closes port

**Protocol Parser** (3 patterns):
1. `COMP_ID:PIN:VALUE` (e.g., "esp32:13:1")
2. `PIN:VALUE` (e.g., "13:HIGH") -- uses `componentId: 'auto'`
3. `KEY=VALUE` (e.g., "TEMP=24.5") -- uses `componentId: 'auto'`

**Side Effects**: Navigator Serial API access, DOM (TextDecoderStream).

---

## 31. Simulation Engine

### services/simulationEngine.ts (~120 LOC)

**Purpose**: Lightweight DC nodal analysis and logic propagation for circuit simulation.

**Exported Types**:
- `SimNodeState` -- `{ voltage: number; current: number; logicState: 'HIGH'|'LOW'|'FLOATING'|'ERROR' }`
- `SimulationResult` -- `{ pinStates: Record<string, SimNodeState>; isShortCircuit: boolean; warnings: string[] }`

**Exported Singleton**:
- `simulationEngine.solve(diagram: WiringDiagram): SimulationResult`
  1. Initializes all pins to FLOATING (0V, 0A)
  2. Builds net adjacency map from connections
  3. Identifies power components, propagates voltage via stack-based BFS
  4. Detects conflicts (pin with two different voltages -> ERROR state)

**Algorithm**: Stack-based flood-fill propagation through net adjacency graph. Pin states keyed as `"componentId:pinName"`.

---

## 32. Standards Service

### services/standardsService.ts (~97 LOC)

**Purpose**: IPC-7351 package dimensions and known board component maps.

**Exported Types**:
- `IPCPackage` -- `{ body_width, body_length, height, pitch?, pin_count, pin_type: 'gullwing'|'through-hole'|'chip' }`
- `BoardComponentMap` -- `{ name, width, length, components: Array<{ type, name, x, z, rotation?, params? }> }`

**Exported**:
- `standardsService.getPackage(name: string): IPCPackage | null` -- Looks up package by exact name, then normalized name, then substring match
- `standardsService.getBoardMap(name: string): BoardComponentMap | null` -- Returns known board layout (Arduino Uno R3, ESP32 DevKit V1, Raspberry Pi Pico)

**Static Data**: Three pre-defined board maps with precise component placement coordinates (in mm).

---

## 33. Sync Service

### services/syncService.ts (~77 LOC)

**Purpose**: Device-to-device sync using in-browser Git.

**Exported Types**: Uses `PeerNode` from `./peerDiscoveryService`

**Exported Singleton**:
- `syncService`:
  - `snapshot(data: { diagram, inventory }): Promise<string | null>` -- Serializes state to JSON files and commits to local git; returns SHA
  - `pushToPeer(peer: PeerNode): Promise<void>` -- Pushes git history to peer URL (`http://{ip}:3000/git`)
  - `pullFromPeer(peer: PeerNode): Promise<{ diagram, inventory }>` -- Pulls from peer and deserializes state
  - `getHistory(): Promise<CommitLog[]>` -- Returns git commit log

**Dependencies**: `./gitService`

---

## 34. Three.js Code Validator

### services/threeCodeValidator.ts (~65 LOC)

**Purpose**: Security sandbox for AI-generated Three.js code.

**Exported Types**:
- `ValidationResult` -- `{ valid: boolean; errors: string[] }`

**Exported Functions**:
- `validateThreeCode(code: string): ValidationResult`
  - **Forbidden patterns** (17 regex): `eval`, `Function`, dynamic `import`, `require`, `fetch`, `XMLHttpRequest`, `WebSocket`, `window`, `document`, `localStorage`, `sessionStorage`, `cookie`, `postMessage`, `self[`, `globalThis`, `Process`, `child_process`, `__proto__`, `constructor[`
  - **Required patterns**: Must use `THREE.` or `Primitives.` or `Materials.`
  - **Size limit**: 50KB max

---

## 35. Three.js Code Runner

### services/threeCodeRunner.ts (~32 LOC)

**Purpose**: Executes validated Three.js code in a Web Worker with timeout.

**Exported Functions**:
- `executeInWorker(code: string): Promise<any>` -- Spawns a Web Worker, sends code, returns result JSON. 5-second timeout kills the worker (prevents infinite loops). Worker is terminated after each execution.

**Dependencies**: `./threeCodeRunner.worker` (Vite worker import)

---

## 36. Three.js Primitives

### services/threePrimitives.ts (~1258 LOC)

**Purpose**: High-fidelity 3D electronic component primitives library using PBR (Physically Based Rendering) and IPC-7351 dimensions.

**Exported -- Material System** (`Materials` object):
- `IC_BODY(color?)` -- Epoxy IC body (roughness 0.75, metalness 0.05, clearcoat)
- `GOLD()` -- Gold-plated pins (metalness 1.0, roughness 0.15)
- `SILVER()` -- Nickel/silver plating
- `ALUMINUM()` -- Polished aluminum (heatsinks)
- `COPPER()` -- Raw copper (traces)
- `SILICON()` -- Exposed die (glassy)
- `SOLDER()` -- Tin/solder
- `PCB(color?)` -- FR4 substrate with solder mask (transmission, clearcoat)
- `GLASS(color?)` -- LEDs/displays (95% transmission)
- `PLASTIC(color?)` -- Connectors
- `IC_MARKING_LIGHT()` / `IC_MARKING_DARK()` -- Silkscreen markings
- `RESISTOR_BODY(color?)` / `CAPACITOR_BODY(color?)` -- Passive component bodies

All materials use `getCachedMaterial()` for memory efficiency.

**Exported -- Geometry Primitives** (`Primitives` object, 30+ functions):
- `createICBody(width, length, height, color?)` -- Beveled IC with pin-1 indicator
- `createSolderFillet(width, length, height?)` -- Concave solder wicking profile
- `createHeatsink(width?, length?, height?, finCount?)` -- Aluminum with dissipation fins
- `createInductorCoil(radius?, thickness?, turns?)` -- Toroid with copper wire turns
- `createFluxResidue(width, length)` -- Semi-transparent flux plane
- `createSilkscreenLogo(text, color?)` -- Text marking on PCB
- `createGullwingLead(width?)` -- SMD L-shaped pin with solder fillet
- `createDipPin(width?, length?)` -- Through-hole pin
- `createBgaBall(diameter)` -- BGA solder ball
- `createPinRow(count, pitch, length, side, type?)` -- Row of pins (gullwing/dip/ball) with metadata
- `createCylinderBody(radius, height, color?)` -- Electrolytic capacitor with polarity stripe
- `createHeader(count, pitch, height?, rows?)` -- Pin header with gold pins and plastic housing
- `createUSBPort(type?)` -- USB Type-B port
- `createDCJack()` -- DC barrel jack
- `createOscillator(width?, length?)` -- Crystal oscillator
- `createButton(color?)` -- Tactile switch
- `createLabel(text, size?, color?)` -- Laser-etched label with bump map
- `createPCB(width, length, color?, procedural?)` -- PCB base with optional procedural trace textures
- `createSMDResistor(width?, length?, height?)` -- SMD resistor with terminations
- `createSMDCapacitor(width?, length?, height?)` -- SMD capacitor
- `createLED(radius?, color?)` -- Through-hole LED with dome and legs
- `createBondWire(start, end)` -- Ultra-fine gold wire arc
- `createLeadFrame(width, length)` -- Delidded IC lead frame
- `createUSB_C_Port()` -- USB-C with rounded metal housing and plastic tongue
- `createJSTConnector(pins?)` -- JST-XH style connector
- `createWire(start, end, color?, radius?)` -- Catmull-Rom curve wire with sag
- `createVia(diameter?)` -- PCB via
- `createThroughHolePad(outerDia?, innerDia?)` -- Plated hole with gold rings
- `applyVariability(obj, intensity?)` -- Manufacturing imperfection randomization
- `createPolarityMark(radius, height)` -- Capacitor polarity stripe
- `createMountingHole(diameter?)` -- Board mounting hole
- `createCrystal(width?, length?, height?)` -- HC-49/U crystal with leads
- `getICPinPosition(pinIndex, totalPins, pitch, width, length)` -- Pin coordinate calculator
- `createLayout(boardWidth, boardLength)` -- Layout engine with semantic anchors and `place()`/`distribute()` helpers

**AI Hallucination Aliases** (maps common AI guesses to correct functions):
- `createIC` -> `createICBody`
- `createResistor` -> `createSMDResistor`
- `createCapacitor` -> `createSMDCapacitor`
- `createPinHeader` -> `createHeader`
- `createSilkscreenText` -> `createLabel`
- `createBarrelJack` -> `createDCJack`
- `createVoltageRegulator` -> generic IC + pins
- `createShieldedModule` -> aluminum box
- `createTactileSwitch` -> `createButton`
- `createTextLabel` / `createICLabel` -> `createLabel`

**Exported Utility**:
- `disposeCaches()` -- Disposes all cached materials and textures (memory cleanup)

**Internal**:
- `createPCBTextures(width, length)` -- Procedural trace/via texture generation ("Turtle Router" algorithm) with normal maps and specular maps
- `createWearTexture()` -- Scratches and dust spots for realism
- `safeNum(val, def)` -- Safe number parser with fallback

---

## 37. Tutorial Validator

### services/tutorialValidator.ts (~16 LOC)

**Purpose**: Validates tutorial step completion conditions.

**Exported Functions**:
- `validateStep(step: TutorialStep, diagram: WiringDiagram | null, inventory: ElectronicComponent[]): boolean` -- Evaluates `step.condition({ diagram, inventory })` with error handling

---

## 38. User Profile Service

### services/userProfileService.ts (~167 LOC)

**Purpose**: User profile management with IndexedDB persistence.

**Exported Types**:
- `ExpertiseLevel` -- `'beginner' | 'intermediate' | 'pro'`
- `ThemePreference` -- `'cyber' | 'industrial' | 'minimal'`
- `AITone` -- `'sass' | 'technical' | 'concise'`
- `UserProfile` -- `{ id, name, expertise, preferences: { theme, wiringColors, aiTone }, stats: { projectsCreated, componentsMastered } }`

**Exported Singleton**:
- `userProfileService`:
  - `getProfile(id: string): Promise<UserProfile | undefined>`
  - `getAllProfiles(): Promise<UserProfile[]>`
  - `saveProfile(profile: UserProfile): Promise<void>`
  - `createProfile(name, expertise?): Promise<UserProfile>` -- Creates with `crypto.randomUUID()`, default cyber theme, standard wiring colors (VCC=red, GND=black, SDA=green, SCL=yellow)
  - `getActiveProfileId(): string | null` -- From localStorage
  - `getActiveProfile(): Promise<UserProfile>` -- Gets active or creates "Default User"
  - `switchProfile(id: string): void` -- Updates localStorage active profile ID
  - `updatePreferences(id, updates): Promise<UserProfile>` -- Partial preferences merge
  - `updateExperience(level: ExpertiseLevel): Promise<void>`
  - `addFact(content: string): Promise<void>` -- Adds to `componentsMastered` list

**Storage**: IndexedDB database `CircuitMindProfiles`, store `profiles`. Active profile ID in localStorage `cm_active_profile_id`.

---

## 39. Vision Analysis

### services/visionAnalysisService.ts (~82 LOC)

**Purpose**: Compares physical bench photos to digital wiring diagrams using Gemini Vision.

**Exported Types**:
- `VisionErrorReport` -- `{ type: 'mismatch'|'missing'|'potential_short'|'neatness'; severity: 'low'|'medium'|'high'; componentId?; pinName?; description; remedy }`

**Exported Singleton**:
- `visionAnalysisService`:
  - `captureBenchSnapshot(video: HTMLVideoElement): Promise<string>` -- Captures frame, compresses to JPEG (0.8 quality), returns base64
  - `compareRealityToPlan(base64Image, diagram): Promise<VisionErrorReport[]>` -- Sends image + diagram JSON to `CONTEXT_CHAT_COMPLEX` model; returns structured error array

**Side Effects**: DOM (canvas element for video frame capture), Network (Gemini Vision API).

---

## 40. WebRTC Service

### services/webRTCService.ts (~61 LOC)

**Purpose**: Peer-to-peer data channel for git-sync and direct communication.

**Exported Singleton**:
- `webRTCService`:
  - `createOffer(): Promise<string>` -- Creates RTCPeerConnection with Google STUN server, creates data channel "git-sync", returns SDP offer JSON
  - `acceptOffer(offerStr: string): Promise<string>` -- Accepts remote offer, returns SDP answer JSON
  - `acceptAnswer(answerStr: string): Promise<void>` -- Completes handshake
  - `send(data: string | ArrayBuffer | Blob | ArrayBufferView): void` -- Sends data on open channel

**ICE Configuration**: `stun:stun.l.google.com:19302`

---

## 41. Subdirectory Services

### Analytics

#### services/analytics/projectAnalyzer.ts (~48 LOC)

**Purpose**: Calculates project complexity and utility scorecard.

**Exported Types**:
- `ProjectScorecard` -- `{ totalComponents, connectionDensity, aiAcceptanceRate, engineeringVelocity }`

**Exported Singleton**:
- `projectAnalyzer.analyze(diagram: WiringDiagram | null): ProjectScorecard`
  - `connectionDensity` = connections / components
  - `aiAcceptanceRate` = accepts / (accepts + rejects) * 100
  - `engineeringVelocity` = events / hours

**Dependencies**: `../aiMetricsService` (for engineering events)

---

### Config

#### services/config/configManager.ts (~56 LOC)

**Purpose**: Workspace configuration serialization/deserialization (YAML format).

**Exported Types**:
- `WorkspaceConfig` -- `{ version, metadata: { name, environment: 'home'|'work'|'lab' }, ui, ai, standards }`

**Exported Singleton**:
- `configManager`:
  - `serialize(data: unknown): string` -- Converts to YAML, scrubs API keys (replaces with `********`)
  - `deserialize(content: string): WorkspaceConfig | null` -- Parses YAML, validates structure

**Dependencies**: `js-yaml`

---

### Error

#### services/error/diagnosticsHub.ts (~80 LOC)

**Purpose**: Global error capture and bug report generation.

**Exported Types**:
- `CaughtError` -- `{ id, message, stack?, timestamp, source, recovered }`

**Exported Singleton**:
- `diagnosticsHub`:
  - `init()` -- Installs `window.onerror` and `window.onunhandledrejection` handlers. Filters out ResizeObserver loop warnings.
  - `reportError(error): string` -- Logs to audit service with sanitized stack traces (removes local file paths). Returns error ID.
  - `generateBugReport()` -- Returns `{ version, userAgent, logs: AuditLog[50], timestamp }`

**Dependencies**: `../logging/auditService`

---

### Feedback

#### services/feedback/correctionService.ts (~80 LOC)

**Purpose**: Captures and retrieves user corrections to AI responses for learning.

**Exported Types**:
- `InteractionLesson` -- `{ id, contextType: 'wiring'|'chat'|'3d', userPrompt, originalResponse, correction, tags, timestamp }`

**Exported Singleton**:
- `correctionService`:
  - `addLesson(lesson: Omit<InteractionLesson, 'id'|'timestamp'>): void` -- Stores new correction
  - `getRelevantLessons(query: string, limit?: number): InteractionLesson[]` -- Keyword-matching retrieval (prompt text + tag matching), returns top N by relevance score
  - `exportDataset(): string` -- JSONL format of user/assistant message pairs for fine-tuning

**Storage**: localStorage key `cm_lessons`

---

### Gesture

#### services/gesture/GestureEngine.ts (~104 LOC)

**Purpose**: Hand gesture recognition via MediaPipe in a Web Worker.

**Exported Types**:
- `HandLandmark` -- `{ x, y, z: number }`
- `GestureResult` -- `{ landmarks, worldLandmarks, handedness, timestamp }`

**Exported Singleton**:
- `gestureEngine`:
  - `init(): Promise<void>` -- Creates Web Worker (`/assets/mediapipe/gestureWorker.js`), waits for `INIT_COMPLETE` message. 15-second timeout.
  - `onLandmarks(listener: GestureListener): () => void` -- Subscribe to landmark results; returns unsubscribe function
  - `processFrame(video: HTMLVideoElement): Promise<void>` -- Captures frame as `ImageBitmap`, transfers to worker. Skips if already processing (backpressure).
  - `dispose()` -- Terminates worker, clears listeners

#### services/gesture/GestureMetricsService.ts (~68 LOC)

**Purpose**: Tracks gesture recognition performance metrics.

**Exported Types**:
- `GestureMetric` -- `{ id, timestamp, gestureType, confidence, success, latencyMs, metadata? }`

**Exported Singleton**:
- `gestureMetricsService`:
  - `logMetric(metric): Promise<void>` -- Buffers in memory, auto-flushes to storage every 10 entries
  - `flush(): Promise<void>` -- Writes buffered metrics to storage (cap: 100 entries)
  - `getSummary(): Promise<{ totalActions, accuracy, averageLatency } | null>`

**Storage**: Via `storageService` key `cm_gesture_metrics`

---

### Localization

#### services/localization/i18n.ts (~22 LOC)

**Purpose**: Internationalization setup using i18next.

**Configuration**:
- Backend: HTTP backend loading from `/locales/{{lng}}.json`
- Language detection: `i18next-browser-languagedetector`
- Fallback language: `en`
- Interpolation escaping disabled (React handles XSS)

**Dependencies**: `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-http-backend`

#### services/localization/unitConverter.ts (~36 LOC)

**Purpose**: Physical unit conversion for electronics measurements.

**Exported Types**:
- `MeasurementSystem` -- `'metric' | 'imperial'`
- `SymbolStandard` -- `'ieee' | 'iec'`

**Exported Singleton**:
- `unitConverter`:
  - `convert(value, from: 'mm'|'mils'|'inch', to: 'mm'|'mils'|'inch'): number` -- Normalizes to mm, then converts to target. Conversion factors: 1 mil = 0.0254 mm, 1 inch = 25.4 mm.
  - `format(value, system: MeasurementSystem): string` -- Formats as "X.XX mm" (metric) or "X mils" / "X.XXX in" (imperial, mils for values < 1000)
  - `getResistorSymbol(standard: SymbolStandard): string` -- Returns `'ZIGZAG'` (IEEE) or `'BOX'` (IEC)

---

### Logging

#### services/logging/auditService.ts (~68 LOC)

**Purpose**: Structured audit logging with secret masking.

**Exported Types**:
- `LogLevel` -- `'debug' | 'info' | 'warn' | 'error'`
- `AuditLog` -- `{ id, timestamp, level, source, message, data? }`

**Exported Singleton**:
- `auditService`:
  - `log(level, source, message, data?): void` -- Creates log entry with masked secrets, saves to localStorage. Error-level also writes to `console.error`.
  - `getLogs(): AuditLog[]` -- Returns all logs
  - `clear(): void` -- Resets log store

**Secret Masking**: Regex patterns for `cm_[a-z0-9]{16}` (tokens) and `AIza[0-9A-Za-z-_]{35}` (Google API keys).

**Storage**: localStorage key `cm_audit_logs`. Rotation: keeps last 1000 entries.

---

### Search

#### services/search/searchIndexer.ts (~53 LOC)

**Purpose**: Full-text search across components, diagrams, knowledge, and actions.

**Exported Types**:
- `SearchableCategory` -- `'component' | 'diagram' | 'knowledge' | 'action'`
- `IndexedDocument` -- `{ id, category, title, body, tags?, reference? }`

**Exported Singleton**:
- `searchIndexer`:
  - `index(docs: IndexedDocument[]): void` -- Rebuilds entire index (calls `removeAll()` then `addAll()`)
  - `search(query: string, category?: SearchableCategory): IndexedDocument[]` -- Fuzzy prefix search with 2x title boost and 0.2 fuzziness. Optional category filter.
  - `clear(): void` -- Resets index

**Configuration**: Fields: `title`, `body`, `tags`. Stored fields: `category`, `title`, `body`, `reference`. Title boost: 2x. Fuzzy: 0.2. Prefix: true.

**Dependencies**: `minisearch`

**Known Gotcha**: MiniSearch `SearchResult` type does not include stored fields at the TypeScript level, requiring `any` cast for the filter callback.

---

### Viz

#### services/viz/vizEngine.ts (~50 LOC)

**Purpose**: High-frequency data visualization engine with ring buffer.

**Exported Types**:
- `WaveformPoint` -- `{ t: number; v: number }`

**Exported Singleton**:
- `vizEngine`:
  - `addData(streamId: string, value: number): void` -- Appends to named stream buffer (max 500 points, FIFO)
  - `getBuffer(streamId: string): WaveformPoint[]` -- Returns current buffer contents

**Exported Hook**:
- `useDataStream(streamId: string, refreshRate?: number): WaveformPoint[]` -- React hook that polls `vizEngine.getBuffer()` at specified refresh rate (default 60 Hz) via `setInterval`

---

## Cross-Service Dependency Map

| Service | Depends On |
|---------|-----------|
| gemini/features/* | gemini/client, gemini/types, gemini/prompts, aiMetricsService |
| apiGateway | apiDispatcher, tokenService, gitService |
| storage | types (ElectronicComponent, ActionRecord, Conversation, EnhancedChatMessage) |
| componentValidator | types (ElectronicComponent, WiringDiagram, WireConnection) |
| aiContextBuilder | storage, userProfileService, feedback/correctionService |
| collabService | yjs, y-webrtc |
| syncService | gitService |
| visionAnalysisService | gemini/client |
| diagnosticsHub | logging/auditService |
| gestureMetricsService | storage |
| projectAnalyzer | aiMetricsService |
| configManager | js-yaml |
| searchIndexer | minisearch |
| simulationEngine | types |
| bomService | types |
| circuitAnalysisService | types |
| threePrimitives | three |
| threeCodeRunner | threeCodeRunner.worker |
| i18n | i18next, react-i18next, i18next-browser-languagedetector, i18next-http-backend |

---

## Storage Key Reference

| localStorage Key | Service | Content |
|-----------------|---------|---------|
| `cm_gemini_api_key` | apiKeyStorage, gemini/client | Gemini API key |
| `cm_inventory` | storageService | Component inventory JSON |
| `cm_autosave` | (various) | Diagram undo/redo history |
| `cm_api_tokens` | tokenService | API token array |
| `cm_webhooks` | api/events | Webhook configuration |
| `cm_ai_metrics` | aiMetricsService | AI performance metrics |
| `cm_eng_events` | aiMetricsService | Engineering events |
| `cm_lessons` | correctionService | User correction history |
| `cm_gesture_metrics` | gestureMetricsService | Gesture performance |
| `cm_audit_logs` | auditService | Audit log entries |
| `cm_auth_hash` | authService | PBKDF2 PIN hash |
| `cm_auth_salt` | authService | PBKDF2 salt (base64) |
| `cm_active_profile_id` | userProfileService | Active user profile ID |

| IndexedDB Database | Store | Service |
|-------------------|-------|---------|
| `CircuitMindDB` (v3) | `inventory` | storage.ts |
| | `app_state` | storage.ts |
| | `action_history` | storage.ts |
| | `conversations` | storage.ts |
| | `messages` | storage.ts |
| | `parts` | partStorageService |
| `CircuitMindProfiles` (v1) | `profiles` | userProfileService |

---

## Singleton Instance Summary

Every service below is instantiated once and exported as a module-level constant:

| Export Name | Class | File |
|------------|-------|------|
| `aiClientInstance` | GoogleGenAI (lazy) | gemini/client.ts |
| `apiDispatcher` | APIDispatcher | api/apiDispatcher.ts |
| `appEvents` | AppEventEmitter | api/events.ts |
| `tokenService` | TokenService | api/tokenService.ts |
| `storageService` | (object literal) | storage.ts |
| `engineeringMetricsService` | EngineeringMetricsService | aiMetricsService.ts |
| `authService` | AuthService | authService.ts |
| `bomService` | BOMService | bomService.ts |
| `circuitAnalysisService` | (object literal) | circuitAnalysisService.ts |
| `collabService` | CollabService | collabService.ts |
| `connectivityService` | ConnectivityService | connectivityService.ts |
| `correctionService` | CorrectionService | feedback/correctionService.ts |
| `gestureEngine` | GestureEngine | gesture/GestureEngine.ts |
| `gestureMetricsService` | GestureMetricsService | gesture/GestureMetricsService.ts |
| `configManager` | ConfigManager | config/configManager.ts |
| `diagnosticsHub` | DiagnosticsHub | error/diagnosticsHub.ts |
| `auditService` | AuditService | logging/auditService.ts |
| `searchIndexer` | SearchIndexer | search/searchIndexer.ts |
| `vizEngine` | VizEngine | viz/vizEngine.ts |
| `serialService` | SerialService | serialService.ts |
| `simulationEngine` | SimulationEngine | simulationEngine.ts |
| `standardsService` | (object literal) | standardsService.ts |
| `syncService` | SyncService | syncService.ts |
| `userProfileService` | UserProfileService | userProfileService.ts |
| `visionAnalysisService` | VisionAnalysisService | visionAnalysisService.ts |
| `webRTCService` | WebRTCService | webRTCService.ts |
| `projectAnalyzer` | ProjectAnalyzer | analytics/projectAnalyzer.ts |
| `unitConverter` | UnitConverter | localization/unitConverter.ts |
| `ragService` | RAGService | ragService.ts |
| `partStorageService` | PartStorageService | partStorageService.ts |

---

*End of Services Catalog*
