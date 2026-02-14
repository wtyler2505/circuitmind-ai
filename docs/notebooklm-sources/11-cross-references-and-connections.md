# 11 -- Cross-References and Connections

> Maps every relationship between documented elements across all Phase 1 docs. Enables tracing any feature end-to-end through the codebase.
> Generated 2026-02-08.

---

## Table of Contents

1. [Component to Hook Dependencies](#1-component-to-hook-dependencies)
2. [Hook to Service Dependencies](#2-hook-to-service-dependencies)
3. [Service to Service Dependencies](#3-service-to-service-dependencies)
4. [Context to Component Consumer Map](#4-context-to-component-consumer-map)
5. [Type to Usage Map](#5-type-to-usage-map)
6. [Feature to File Map](#6-feature-to-file-map)
7. [Data Flow Chains](#7-data-flow-chains)
8. [Event Propagation Paths](#8-event-propagation-paths)
9. [Error Bubbling Chains](#9-error-bubbling-chains)
10. [AI Feature to Model to Service Map](#10-ai-feature-to-model-to-service-map)
11. [State Sync Paths](#11-state-sync-paths)
12. [Import Cluster Map](#12-import-cluster-map)

---

## 1. Component to Hook Dependencies

Which components consume which hooks. Verified from actual import statements.

### MainLayout (components/MainLayout.tsx)

| Hook | Purpose in MainLayout |
|------|----------------------|
| `useLayout()` | Sidebar visibility, pinning, focus mode, settings open, neural link toggle |
| `useVoiceAssistant()` | Recording state, start/stop recording, visual context registration |
| `useAssistantState()` | Generation mode, deep thinking toggle, recent action history |
| `useConversationContext()` | Active conversation, conversation manager |
| `useHUD()` | HUD fragments, visibility toggle, add/remove fragment |
| `useSelection()` | Selected component ID for canvas |
| `useAIActions()` | Action execution, staged actions, autonomy settings |
| `useToastApi()` | Toast notification methods |
| `useNeuralLink()` | Gesture recognition activation |
| `useNeuralLinkEffects()` | Gesture-driven side effects |
| `useGestureTracking()` | Gesture result processing for canvas/assistant |
| `useSecurityAudit()` | Circuit safety violation detection, HUD fragment creation |
| `useSearchIndex()` | Full-text search indexing of inventory and diagram |
| `useKeyboardShortcuts()` | Global keyboard shortcut registration |
| `useChatHandler()` | AI chat message sending, streaming responses |
| `useAIContextBuilder()` | AI context construction for Gemini requests |
| `useMainLayoutActions()` | Component edit, duplicate, delete, 3D generation |
| `useInventorySync()` | Inventory-to-diagram auto-sync |
| `useSync()` | Periodic snapshot to sync service |

### DiagramCanvas (components/DiagramCanvas.tsx)

| Hook | Purpose |
|------|---------|
| `useCanvasInteraction()` | Zoom, pan, drag, SVG viewport transforms |
| `useCanvasLayout()` | Component positioning, grid snapping |
| `useCanvasWiring()` | Wire creation/deletion via drag between pins |
| `useCanvasHighlights()` | Component/wire highlight animations |
| `useCanvasHUD()` | Canvas-level HUD fragment management |
| `useCanvasExport()` | SVG/PNG export functionality |

### ComponentEditorModal (components/ComponentEditorModal.tsx)

| Hook | Purpose |
|------|---------|
| `useEditorFormState()` | Form field state management (name, type, pins, etc.) |
| `useEditorAIChat()` | AI chat within the editor (assistComponentEditor) |
| `useEditorModalHandlers()` | Save, cancel, image upload handlers |
| `useFocusTrap()` | Focus trap within modal for accessibility |

### Diagram3DView (components/diagram/Diagram3DView.tsx)

| Hook | Purpose |
|------|---------|
| `useDiagram3DScene()` | Three.js scene initialization and lifecycle |
| `useDiagram3DSync()` | Sync diagram state changes into 3D scene |
| `useDiagram3DTelemetry()` | Live telemetry overlay on 3D components |

### SettingsPanel (components/SettingsPanel.tsx)

| Hook | Purpose |
|------|---------|
| `useLayout()` | Settings open state, initial tab |
| `useAuth()` | Authentication state for API key visibility |
| `useUser()` | User profile editing |
| `useFocusTrap()` | Focus trap within settings panel |
| `useAutonomySettings()` | AI autonomy preference editing |

### Inventory (components/Inventory.tsx)

| Hook | Purpose |
|------|---------|
| `useInventory()` | Component library CRUD |
| `useLayout()` | Sidebar width, open/pinned state |
| `useDiagram()` | Diagram access for BOM generation |
| `useHoverBehavior()` | Sidebar auto-hide on hover |
| `useResizeHandler()` | Drag-to-resize sidebar |

### AssistantContent (components/layout/assistant/AssistantContent.tsx)

| Hook | Purpose |
|------|---------|
| `useConversationContext()` | Messages, conversation switching |
| `useAssistantState()` | Generation mode, image size, deep thinking |
| `useVoiceAssistant()` | Voice recording controls |
| `useLayout()` | Assistant sidebar state |
| `useResizeHandler()` | Drag-to-resize sidebar |

---

## 2. Hook to Service Dependencies

Which hooks call which services. Verified from actual import statements.

| Hook | Services Used | Purpose |
|------|--------------|---------|
| `useAIActions` | `engineeringMetricsService`, `auditService` | Logs action execution to metrics and audit trail |
| `useAIContextBuilder` | `aiContextBuilder`, `predictionEngine` | Builds AIContext object, gets predictive actions |
| `useChatHandler` | `gemini/features/chat`, `gemini/features/media`, `gemini/features/wiring` | Routes AI requests to correct feature module |
| `useInventorySync` | `componentValidator` | Validates and syncs diagram with inventory changes |
| `useSearchIndex` | `searchIndexer` (search/searchIndexer) | Indexes inventory and diagram for OmniSearch |
| `useSecurityAudit` | `securityAuditor` | Audits circuit safety, creates HUD warnings |
| `useMainLayoutActions` | `gemini/features/components` | explainComponent, generateComponent3DCode |
| `useEditorAIChat` | `geminiService` (facade) | assistComponentEditor for in-editor AI chat |
| `useGestureTracking` | `gestureMetricsService` (gesture/) | Gesture event telemetry |
| `useSync` | `syncService` | Periodic diagram/inventory snapshots |
| `useNeuralLink` | `@mediapipe/tasks-vision` | MediaPipe hand tracking |
| `useConversations` | `storage.ts` (IndexedDB ops) | Conversation/message CRUD persistence |
| `useActionHistory` | `storage.ts` | Action record persistence for undo |
| `usePermissions` | `authService` | RBAC permission checks |
| `useAutonomySettings` | (localStorage direct) | AI autonomy preference persistence |

---

## 3. Service to Service Dependencies

Inter-service dependency graph. Verified from import statements.

```
services/gemini/client.ts (SINGLETON)
  ^-- services/gemini/features/*.ts (all 11 feature modules)
  ^-- services/gemini/parsers.ts
  ^-- services/gemini/prompts.ts
  ^-- services/geminiService.ts (legacy facade)

services/storage.ts
  ^-- contexts/InventoryContext.tsx
  ^-- contexts/DiagramContext.tsx
  ^-- contexts/LayoutContext.tsx
  ^-- hooks/useConversations.ts
  ^-- hooks/useActionHistory.ts

services/componentValidator.ts
  ^-- contexts/DiagramContext.tsx (migrateLegacyDiagram)
  ^-- hooks/useInventorySync.ts (validate + sync)

services/error/diagnosticsHub.ts
  --> services/logging/auditService.ts

services/api/apiGateway.ts
  --> services/api/apiDispatcher.ts
  --> services/api/tokenService.ts
  --> services/gitService.ts

services/ragService.ts
  --> services/knowledgeService.ts
  --> services/geminiService.ts (embedText)

services/healthMonitor.ts
  ^-- contexts/HealthContext.tsx

services/simulationEngine.ts
  ^-- contexts/SimulationContext.tsx

services/authService.ts
  ^-- contexts/AuthContext.tsx

services/userProfileService.ts
  ^-- contexts/UserContext.tsx

services/collabService.ts
  --> yjs + y-webrtc (external)
  ^-- DiagramCanvas (via props)

services/macroEngine.ts
  ^-- contexts/MacroContext.tsx

services/search/searchIndexer.ts
  --> minisearch (external)
  ^-- hooks/useSearchIndex.ts

services/securityAuditor.ts
  ^-- hooks/useSecurityAudit.ts

services/predictionEngine.ts
  ^-- hooks/useAIContextBuilder.ts

services/liveAudio.ts
  --> @google/genai (LiveSession)
  ^-- contexts/VoiceAssistantContext.tsx

services/tutorialValidator.ts
  ^-- contexts/TutorialContext.tsx

services/threeCodeValidator.ts
  ^-- services/threeCodeRunner.ts

services/threeCodeRunner.ts
  --> services/threeCodeRunner.worker.ts (Web Worker)
  --> services/threeCodeValidator.ts

services/threePrimitives.ts
  ^-- ThreeViewer (passed to worker scope)

services/fzpzLoader.ts
  ^-- contexts/InventoryContext.tsx

services/partStorageService.ts
  ^-- contexts/InventoryContext.tsx

services/serialService.ts
  ^-- contexts/TelemetryContext.tsx

services/viz/vizEngine.ts
  ^-- contexts/TelemetryContext.tsx

services/aiMetricsService.ts
  ^-- hooks/useAIActions.ts
  ^-- various services for metric recording
```

### Dependency Direction Legend
- `-->` means "imports from" (this service depends on that one)
- `^--` means "is consumed by" (that module imports this service)

---

## 4. Context to Component Consumer Map

Which contexts feed which components. Based on hook usage in components.

| Context | Hook | Components That Consume It |
|---------|------|---------------------------|
| LayoutContext | `useLayout()` | MainLayout, AppLayout, AppHeader, Inventory, AssistantContent, AssistantSidebar, SettingsPanel, DashboardView, StatusRail, OmniSearch |
| AssistantStateContext | `useAssistantState()` | MainLayout, AssistantContent, ChatMessage |
| HealthContext | `useHealth()` | TacticalHUD, StatusRail, SystemVitals widget |
| AuthContext | `useAuth()` | Gatekeeper, SettingsPanel, AppHeader |
| UserContext | `useUser()` | SettingsPanel, ChatMessage (AI tone), AppHeader |
| NotificationContext | `useNotify()` | SimulationProvider (context-level), CyberToast, AppHeader |
| DashboardContext | `useDashboard()` | DashboardView, WidgetWrapper, AppHeader (toggle) |
| MacroContext | `useMacros()` | MacroPanel (in Inventory), MainLayout (recording state) |
| InventoryContext | `useInventory()` | MainLayout, Inventory, InventoryItem, BOMModal, ComponentEditorModal, TutorialProvider (context-level) |
| ConversationContext | `useConversationContext()` | MainLayout, AssistantContent, ConversationSwitcher, ChatMessage |
| DiagramContext | `useDiagram()` | MainLayout, DiagramCanvas, DiagramNode, Wire, Diagram3DView, SimulationProvider (context-level), TutorialProvider (context-level), Inventory (for BOM), PredictiveGhost |
| SelectionContext | `useSelection()` | MainLayout, DiagramCanvas, DiagramNode, ComponentEditorModal |
| TelemetryContext | `useTelemetry()` | TelemetryOverlay (on DiagramNode), HardwareTerminal, StatusRail, OscilloscopeWidget |
| HUDContext | `useHUD()` | MainLayout, TacticalHUD, DiagramCanvas (via useCanvasHUD) |
| SimulationContext | `useSimulation()` | SimControls, PinStatusDot (on DiagramNode), Wire (color by state) |
| VoiceAssistantContext | `useVoiceAssistant()` | MainLayout, AssistantContent (recording controls) |
| TutorialContext | `useTutorial()` | MentorOverlay, StatusRail |

### Context Cross-Dependencies (Context consuming Context)

```
HealthProvider        --> useLayout()        [for setLowPerformanceMode]
DiagramProvider       --> useInventory()     [for legacy migration]
SimulationProvider    --> useDiagram()       [for diagram data]
                      --> useNotify()        [for short-circuit warnings]
TutorialProvider      --> useDiagram()       [for step validation]
                      --> useInventory()     [for step validation]
```

All other contexts are independent of sibling contexts.

---

## 5. Type to Usage Map

Where each interface from `types.ts` is used across the codebase.

| Interface | Contexts | Hooks | Services | Components |
|-----------|----------|-------|----------|------------|
| `ElectronicComponent` | InventoryContext, DiagramContext, TutorialContext | useAIActions, useInventorySync, useMainLayoutActions, useChatHandler, useAIContextBuilder, useEditorFormState, useSearchIndex | componentValidator, gemini/features/*, bomService, securityAuditor, aiContextBuilder, storage | Inventory, InventoryItem, DiagramNode, ComponentEditorModal, BOMModal |
| `WiringDiagram` | DiagramContext | useInventorySync, useChatHandler, useAIContextBuilder, useCanvasExport, useSecurityAudit, useSearchIndex, useSync | componentValidator, gemini/features/wiring, bomService, collabService, storage, securityAuditor, diagramDiff, simulationEngine | DiagramCanvas, Diagram3DView, Wire, PredictiveGhost |
| `WireConnection` | DiagramContext | useCanvasWiring | componentValidator, simulationEngine, securityAuditor | Wire, BezierWire, DiagramCanvas |
| `WirePoint` | (embedded in WireConnection) | useCanvasWiring | (none directly) | BezierWire |
| `EnhancedChatMessage` | ConversationContext | useConversations, useChatHandler | storage (IndexedDB) | ChatMessage, AssistantContent |
| `Conversation` | ConversationContext | useConversations | storage (IndexedDB) | ConversationSwitcher |
| `ChatMessage` (legacy) | (none directly) | useConversations (migration) | storage | ChatMessage (fallback) |
| `ActionType` | (none) | useAIActions, useAutonomySettings, useActionHistory | (none) | ChatMessage (action buttons) |
| `ActionIntent` | (none) | useAIActions, useChatHandler | predictionEngine, gemini/parsers, apiGateway | ChatMessage, PredictiveGhost |
| `ExecutedAction` | (none) | useAIActions | (none) | ChatMessage (execution status) |
| `AIContext` | (none) | useAIContextBuilder | aiContextBuilder, gemini/features/chat | (none -- passed to services) |
| `ActionDelta` | AssistantStateContext | useAIActions, useAIContextBuilder | (none) | (none -- internal to AI context) |
| `AIAutonomySettings` | (none) | useAutonomySettings | (none) | SettingsPanel (AI sub-panel) |
| `ComponentReference` | (none) | useChatHandler | gemini/parsers | ChatMessage (inline component links) |
| `GroundingSource` | (none) | (none) | gemini/parsers | ChatMessage (citation rendering) |
| `ACTION_SAFETY` | (none) | useAIActions, useChatHandler | (none) | ChatMessage (button rendering) |
| `ComponentFootprint` | InventoryContext | (none) | fzpzLoader | DiagramNode (FzpzVisual) |

---

## 6. Feature to File Map

For each user-facing feature, every file involved.

### 6.1 AI Chat

```
User types message
  --> components/layout/assistant/AssistantContent.tsx  (UI input)
  --> hooks/useChatHandler.ts                          (orchestrator)
  --> hooks/useAIContextBuilder.ts                     (builds AIContext)
  --> services/aiContextBuilder.ts                     (AIContext construction logic)
  --> services/gemini/features/chat.ts                 (chatWithAI / chatWithContext)
  --> services/gemini/client.ts                        (getAIClient singleton)
  --> services/gemini/prompts.ts                       (prompt templates)
  --> services/gemini/parsers.ts                       (response extraction)
  --> services/gemini/types.ts                         (JSON schemas for structured output)
  --> hooks/useConversations.ts                        (message persistence)
  --> services/storage.ts                              (IndexedDB operations)
  --> components/ChatMessage.tsx                        (message rendering)
  --> hooks/useAIActions.ts                            (action execution if actions returned)
  --> hooks/actions/index.ts                           (handler registry)
  --> hooks/actions/{diagramHandlers,canvasHandlers,navHandlers,appControlHandlers}.ts
  --> services/aiMetricsService.ts                     (latency tracking)
  --> services/logging/auditService.ts                 (audit trail)
  --> types.ts                                         (EnhancedChatMessage, ActionIntent, AIContext)
```

### 6.2 Wiring Diagram Generation

```
AI generates diagram from natural language
  --> hooks/useChatHandler.ts                          (detects diagram request)
  --> services/gemini/features/wiring.ts               (generateWiringDiagram)
  --> services/gemini/client.ts                        (MODELS.WIRING = gemini-2.5-pro)
  --> services/gemini/prompts.ts                       (wiring prompt template)
  --> services/gemini/parsers.ts                       (extractDiagramData)
  --> services/gemini/types.ts                         (WIRING_DIAGRAM_SCHEMA)
  --> contexts/DiagramContext.tsx                       (updateDiagram)
  --> hooks/useInventorySync.ts                        (sync new components to inventory)
  --> services/componentValidator.ts                   (validation)
  --> components/DiagramCanvas.tsx                      (SVG rendering)
  --> components/diagram/DiagramNode.tsx                 (component nodes)
  --> components/diagram/Wire.tsx                       (wire rendering)
  --> components/diagram/wiring/BezierWire.tsx          (bezier path calculation)
  --> types.ts                                         (WiringDiagram, WireConnection, ElectronicComponent)
```

### 6.3 Component Inventory Management

```
User adds/edits/deletes component
  --> components/Inventory.tsx                         (list UI, add/remove buttons)
  --> components/inventory/InventoryItem.tsx            (individual item rendering)
  --> components/ComponentEditorModal.tsx               (edit form)
  --> hooks/useEditorFormState.ts                      (form state)
  --> hooks/useEditorAIChat.ts                         (AI assist in editor)
  --> hooks/useEditorModalHandlers.ts                  (save/cancel)
  --> hooks/useFocusTrap.ts                            (modal accessibility)
  --> contexts/InventoryContext.tsx                     (addItem, updateItem, removeItem)
  --> hooks/useInventorySync.ts                        (auto-sync to diagram)
  --> services/componentValidator.ts                   (orphan detection, cascade rules)
  --> services/storage.ts                              (localStorage + IndexedDB persistence)
  --> services/partStorageService.ts                   (FZPZ binary cache)
  --> services/fzpzLoader.ts                           (parse .fzpz files)
  --> types.ts                                         (ElectronicComponent, ComponentFootprint)
```

### 6.4 3D Visualization

```
User toggles 3D view
  --> components/diagram/Diagram3DView.tsx             (3D canvas wrapper)
  --> components/ThreeViewer.tsx                        (Three.js renderer, lazy loaded)
  --> hooks/useDiagram3DScene.ts                       (scene init, camera, lights)
  --> hooks/useDiagram3DSync.ts                        (sync diagram changes to 3D meshes)
  --> hooks/useDiagram3DTelemetry.ts                   (live data overlay on 3D)
  --> services/threePrimitives.ts                      (3D shape generators)
  --> services/threeCodeValidator.ts                   (AI code safety check)
  --> services/threeCodeRunner.ts                      (sandboxed execution)
  --> services/threeCodeRunner.worker.ts               (Web Worker for code exec)
  --> services/gemini/features/components.ts           (generateComponent3DCode)
  --> services/gemini/client.ts                        (MODELS.CODE_GEN = gemini-2.5-pro)
  --> vendor-three chunk                               (three.js library)
```

### 6.5 Circuit Simulation

```
User enables simulation mode
  --> components/layout/SimControls.tsx                (simulation panel UI)
  --> contexts/SimulationContext.tsx                   (simulation state, 2Hz tick loop)
  --> services/simulationEngine.ts                    (circuit solver)
  --> contexts/DiagramContext.tsx                      (diagram data for solver)
  --> contexts/NotificationContext.tsx                 (short-circuit warnings)
  --> components/diagram/DiagramNode.tsx               (PinStatusDot overlay)
  --> components/diagram/Wire.tsx                     (wire color by simulation state)
  --> services/gemini/features/simulation.ts          (AI simulation analysis)
  --> types.ts                                        (SimNodeState, SimulationResult)
```

### 6.6 Voice Assistant

```
User clicks microphone
  --> contexts/VoiceAssistantContext.tsx              (recording state, live mode)
  --> services/liveAudio.ts                          (LiveSession WebSocket)
  --> services/gemini/features/media.ts              (transcribeAudio, generateSpeech)
  --> services/gemini/client.ts                      (MODELS.TTS, MODELS.AUDIO_REALTIME)
  --> hooks/useChatHandler.ts                        (feeds transcription to chat)
  --> components/layout/assistant/AssistantContent.tsx (recording controls UI)
```

### 6.7 Real-Time Collaboration

```
User joins collaboration room
  --> services/collabService.ts                      (Y.Doc, WebrtcProvider)
  --> yjs / y-webrtc (external)                      (CRDT sync)
  --> contexts/DiagramContext.tsx                     (diagram state sync)
  --> components/diagram/RemoteCursor.tsx             (remote cursor rendering)
  --> components/layout/CollaboratorList.tsx          (presence display)
  --> services/peerDiscoveryService.ts               (room discovery)
  --> vendor-collab chunk                            (yjs + y-webrtc)
```

### 6.8 Hardware Telemetry

```
User connects hardware via Serial
  --> services/serialService.ts                      (Web Serial API)
  --> contexts/TelemetryContext.tsx                   (live data state)
  --> services/viz/vizEngine.ts                      (real-time charting)
  --> components/diagram/DiagramNode.tsx              (TelemetryOverlay)
  --> components/dashboard/HardwareTerminal.tsx       (serial terminal)
  --> components/dashboard/OscilloscopeWidget.tsx     (oscilloscope display)
```

### 6.9 OmniSearch (Cmd+K)

```
User presses Ctrl+K
  --> components/layout/OmniSearch.tsx               (search modal UI)
  --> hooks/useSearchIndex.ts                        (index builder)
  --> services/search/searchIndexer.ts               (MiniSearch full-text engine)
  --> hooks/useKeyboardShortcuts.ts                  (shortcut registration)
  --> types.ts                                       (ElectronicComponent, WiringDiagram for indexing)
```

### 6.10 Authentication and Security

```
App loads with lock screen
  --> components/auth/Gatekeeper.tsx                 (PIN entry UI)
  --> contexts/AuthContext.tsx                        (auth state, session)
  --> services/authService.ts                        (PBKDF2 PIN hashing, session management)
  --> hooks/usePermissions.ts                        (RBAC permission checks)
  --> hooks/useSecurityAudit.ts                      (circuit safety scanning)
  --> services/securityAuditor.ts                    (violation detection)
  --> components/layout/SecurityReport.tsx            (audit report display)
```

### 6.11 Tutorials / Guided Quests

```
User starts a tutorial
  --> contexts/TutorialContext.tsx                    (quest state, auto-validation)
  --> services/tutorialValidator.ts                   (step condition evaluation)
  --> components/layout/MentorOverlay.tsx              (step instructions UI)
  --> data/tutorials.ts                               (quest definitions)
  --> contexts/DiagramContext.tsx                      (diagram state for validation)
  --> contexts/InventoryContext.tsx                    (inventory state for validation)
```

### 6.12 BOM (Bill of Materials) Export

```
User opens BOM modal
  --> components/inventory/BOMModal.tsx               (BOM table UI)
  --> services/bomService.ts                         (BOM generation from diagram)
  --> services/gemini/features/bom.ts                (AI part detail lookup)
  --> vendor-pdf chunk (jspdf)                       (PDF export)
  --> types.ts                                       (WiringDiagram, ElectronicComponent)
```

---

## 7. Data Flow Chains

Complete paths from user action to persistence and back.

### 7.1 Chat Message Flow

```
User types message in AssistantContent
  --> AssistantContent.handleSend()
    --> useChatHandler.handleSendEnhancedMessage()
      --> useAIContextBuilder.context  [reads: diagram, inventory, selection, history]
      --> chatWithContext(message, context)  [services/gemini/features/chat.ts]
        --> getAIClient()  [services/gemini/client.ts]
        --> GEMINI API CALL (MODELS.CHAT or MODELS.CONTEXT_CHAT_COMPLEX)
        --> parsers.extractActions()  [services/gemini/parsers.ts]
        --> parsers.extractDiagramData()
      --> conversationManager.addMessage(enhancedMessage)
        --> storage.saveMessage()  [IndexedDB: messages store]
        --> storage.saveConversation()  [IndexedDB: conversations store]
      --> IF diagramData: updateDiagram()
        --> DiagramContext state update
        --> localStorage.setItem('cm_autosave')
      --> IF actionIntents: check ACTION_SAFETY
        --> Safe: aiActions.execute() --> handler() --> auditService.log()
        --> Unsafe: render as buttons in ChatMessage
  --> ChatMessage renders response with markdown, actions, citations
```

### 7.2 Inventory Edit Flow

```
User double-clicks component in Inventory
  --> Inventory.handleComponentClick()
    --> MainLayout.setEditingComponent(component)
      --> ComponentEditorModal opens (lazy loaded)
        --> useEditorFormState initializes fields from component
        --> User edits fields
        --> User clicks Save
          --> useEditorModalHandlers.handleSave()
            --> InventoryContext.updateItem(editedComponent)
              --> setState(newInventory)
              --> useEffect: storageService.setItem('cm_inventory', JSON.stringify(inventory))
              --> useEffect: saveInventoryToDB(inventory)  [IndexedDB backup]
            --> useInventorySync detects change (JSON snapshot comparison)
              --> componentValidator.syncDiagramWithInventory()
                --> Copies name, type, pins, description from inventory to diagram instances
              --> IF changeCount > 0: DiagramContext.updateDiagram(syncedDiagram)
                --> localStorage.setItem('cm_autosave', JSON.stringify(diagram))
```

### 7.3 Component Deletion Flow

```
User clicks delete on InventoryItem
  --> InventoryContext.removeItem(id)
    --> componentValidator.determineOrphanAction(id, diagram, savedDiagrams)
      --> IF 'block': show toast "Remove wires first"  [return, no deletion]
      --> IF 'warn': show confirmation dialog
      --> IF 'cascade': proceed
    --> componentValidator.removeOrphanedComponents(diagram, inventory)
      --> Removes diagram components whose inventory source is gone
      --> Cascades: removes connections referencing removed components
    --> DiagramContext.updateDiagram(cleanedDiagram)
    --> InventoryContext.setInventory(filtered)
    --> Persistence: localStorage + IndexedDB updated
```

### 7.4 Undo/Redo Flow

```
User presses Ctrl+Z
  --> useKeyboardShortcuts.handleKeyDown('z')
    --> useAIActions context: handleUndo()
      --> DiagramContext.undo()
        --> history.past.pop() --> history.present (restore)
        --> previous present --> history.future.push()
        --> localStorage.setItem('cm_autosave', JSON.stringify(newPresent))
  --> DiagramCanvas re-renders with restored diagram
  --> useInventorySync: no change (inventory is source of truth, not affected by undo)
```

### 7.5 Application Boot Flow

```
Browser loads index.html
  --> index.tsx executes
    --> Buffer polyfill installed
    --> GlobalErrorBoundary wraps tree
    --> axe-core loaded (dev only, 2s delay)
    --> App.tsx renders
      --> diagnosticsHub.init()  [window.onerror, onunhandledrejection]
      --> 17 Context Providers initialize in order:
        1. LayoutProvider: reads cm_active_mode, cm_inventory_*, cm_assistant_* from localStorage
        2. AssistantStateProvider: reads cm_generation_mode, cm_deep_thinking
        3. HealthProvider: starts requestAnimationFrame FPS counter
        4. AuthProvider: checks cm_auth_hash existence
        5. UserProvider: loads profile from CircuitMindProfiles IndexedDB
        6-8. Toast/Notification/Dashboard: initialize state
        9. MacroProvider: reads cm_macros from localStorage
        10. InventoryProvider: reads cm_inventory (falls back to INITIAL_INVENTORY)
        11. ConversationProvider: loads conversations from IndexedDB
        12. DiagramProvider: reads cm_autosave, runs migrateLegacyDiagram() once
        13-18. Selection/Telemetry/HUD/Simulation/Voice/Tutorial: initialize
      --> MainLayout mounts
        --> useInventorySync runs first sync (immediate, no debounce)
        --> useSearchIndex indexes inventory + diagram
        --> useSecurityAudit scans diagram for violations
        --> useKeyboardShortcuts registers global handlers
        --> Gatekeeper checks auth state (shows lock screen if needed)
```

---

## 8. Event Propagation Paths

How events flow through the system.

### 8.1 Canvas Component Selection

```
User clicks DiagramNode
  --> DiagramNode.onClick(e)
    --> DiagramCanvas.handleComponentSelect(componentId)
      --> SelectionContext.setSelectedComponentId(componentId)
        --> MainLayout re-reads selection
        --> TacticalHUD highlights component
        --> useAIContextBuilder includes selectedComponentId in next AI request
```

### 8.2 Wire Creation

```
User drags from Pin A to Pin B
  --> useCanvasWiring.handlePinDragStart(fromComponent, fromPin)
    --> (mouse moves, rendering temp wire)
  --> useCanvasWiring.handlePinDrop(toComponent, toPin)
    --> DiagramContext.updateDiagram(diagram => ({
        ...diagram,
        connections: [...diagram.connections, newConnection]
      }))
    --> localStorage.setItem('cm_autosave', ...)
    --> SimulationContext: if simulating, runs tick on diagram change
    --> useSecurityAudit: re-scans for violations
```

### 8.3 Mode Switching (Design/Wiring/Debug)

```
User clicks mode button in AppHeader
  --> LayoutContext.setActiveMode(newMode)
    --> Saves current layout to cm_layout_snapshot_{currentMode}
    --> Loads target layout from cm_layout_snapshot_{newMode}
    --> document.body.classList: remove old mode class, add new
    --> IF debug mode: SimulationContext.setSimulating(true)
    --> IF wiring mode: Canvas focuses on wire tools
    --> IF design mode: Canvas focuses on component placement
```

### 8.4 AI Action Execution

```
AI suggests action in chat response
  --> ChatMessage renders ActionIntent as button
    --> IF safe && autoExecute: execute immediately
    --> IF unsafe: user clicks button
  --> useAIActions.execute(action)
    --> usePermissions.checkPermission(action.type)
      --> IF denied: return { success: false, error: 'Access Denied' }
    --> getHandler(action.type)  [hooks/actions/index.ts]
    --> handler(payload, actionContext)
      --> e.g. diagramHandlers.addComponent: updateDiagram(...)
    --> auditService.log(action)
    --> engineeringMetricsService.logEvent('action_execute', ...)
    --> useMacros: if recording, addRecordedStep(action)
    --> pushActionDelta(action)  [for AI context history]
```

### 8.5 Collaboration Update (Remote Peer)

```
Remote peer modifies diagram
  --> y-webrtc delivers update via WebRTC data channel
  --> Y.Doc applies CRDT merge
  --> collabService.sharedDiagram.observe() callback fires
    --> onUpdate(diagram: WiringDiagram)
      --> DiagramContext.updateDiagram(remoteDiagram)
        --> Canvas re-renders with merged state
        --> useSecurityAudit re-scans
        --> SimulationContext runs tick if active
  --> awareness update arrives
    --> RemoteCursor repositions
    --> CollaboratorList updates presence
```

---

## 9. Error Bubbling Chains

Where errors originate and how they propagate.

### Layer 1: GlobalErrorBoundary (index.tsx)

```
Any uncaught React rendering error
  --> GlobalErrorBoundary.componentDidCatch(error, info)
    --> Renders full-screen "SYSTEM FAILURE" diagnostic
    --> Shows error message + stack trace
    --> "REBOOT SYSTEM" button: window.location.reload()
```

### Layer 2: DiagnosticsHub (services/error/diagnosticsHub.ts)

```
Uncaught JS error (non-React)
  --> window.onerror handler
    --> diagnosticsHub.handleError(error)
      --> FILTER: skip ResizeObserver loop warnings
      --> auditService.log({ severity: 'error', message, sanitizedStack })
      --> error stored in internal caughtErrors array

Unhandled Promise rejection
  --> window.onunhandledrejection handler
    --> diagnosticsHub.handleUnhandledRejection(event)
      --> auditService.log({ severity: 'error', ... })
```

### Layer 3: Service-Level Error Handling

```
Gemini API call fails
  --> services/gemini/features/*.ts: try/catch
    --> Logs error via console.error
    --> Returns fallback (empty diagram, error message, null)
    --> aiMetricsService.record({ success: false, error: message })
    --> Caller (hook) surfaces error to UI via toast or chat message

localStorage quota exceeded
  --> storageService.setItem() catches QuotaExceededError
    --> Phase 1: purge cm_3d_code_cache_*
    --> Phase 2: prune inventory imageUrl/threeCode
    --> Phase 3: silent failure (returns false)

IndexedDB operation fails
  --> storage.ts: try/catch in each operation
    --> Logs error via console.error
    --> Returns fallback (empty array, null)
    --> App continues with in-memory state
```

### Error Surface Points (Where Users See Errors)

| Error Type | Surface | Component |
|------------|---------|-----------|
| React crash | Full-screen diagnostic | GlobalErrorBoundary |
| AI API failure | Toast notification + chat error message | CyberToast, ChatMessage |
| Network offline | Connectivity toast | CyberToast (via connectivityService) |
| Auth failure | Gatekeeper stays locked | Gatekeeper |
| Simulation short circuit | Notification + HUD warning | NotificationContext, TacticalHUD |
| Security violation | HUD warning fragment | TacticalHUD (via useSecurityAudit) |
| Storage quota | Silent degradation | (no visible error, graceful fallback) |

---

## 10. AI Feature to Model to Service Map

Which AI features use which Gemini models, via which service files.

| AI Feature | Model Constant | Model ID | Service File |
|------------|---------------|----------|-------------|
| Standard chat | CHAT | gemini-2.5-flash | gemini/features/chat.ts |
| Complex chat (long context, comparisons, code) | CONTEXT_CHAT_COMPLEX | gemini-2.5-pro | gemini/features/chat.ts |
| Default context chat | CONTEXT_CHAT_DEFAULT | gemini-2.5-flash | gemini/features/chat.ts |
| Deep thinking mode | THINKING | gemini-2.5-flash | gemini/features/chat.ts |
| Wiring diagram generation | WIRING | gemini-2.5-pro | gemini/features/wiring.ts |
| Component explanation | CHAT | gemini-2.5-flash | gemini/features/components.ts |
| Smart fill (auto-complete) | SMART_FILL | gemini-2.5-flash | gemini/features/components.ts |
| Editor assistance | ASSIST_EDITOR | gemini-2.5-flash | gemini/features/components.ts |
| Component auto-identification | AUTO_ID | gemini-2.5-flash | gemini/features/components.ts |
| Part finder | PART_FINDER | gemini-2.5-flash | gemini/features/components.ts |
| Image analysis (multimodal) | IMAGE | gemini-2.5-flash | gemini/features/components.ts |
| 3D code generation | CODE_GEN | gemini-2.5-pro | gemini/features/components.ts |
| Code review | CHAT | gemini-2.5-flash | gemini/features/components.ts |
| Image generation | IMAGE_GEN | imagen-3.0-generate-001 | gemini/features/media.ts |
| Edited image generation | IMAGE_GEN | imagen-3.0-generate-001 | gemini/features/media.ts |
| Video generation | VIDEO | veo-2.0-generate-001 | gemini/features/media.ts |
| Text-to-speech | TTS | gemini-2.5-flash-tts | gemini/features/media.ts |
| Audio transcription | AUDIO_TRANSCRIPTION | gemini-2.5-flash | gemini/features/media.ts |
| Semantic embeddings | EMBEDDING | text-embedding-004 | gemini/features/media.ts |
| Live audio streaming | AUDIO_REALTIME | gemini-2.5-flash-live | services/liveAudio.ts |
| HUD fragment generation | PART_FINDER | gemini-2.5-flash | gemini/features/hud.ts |
| Predictive actions | PART_FINDER | gemini-2.5-flash | gemini/features/predictions.ts |
| Simulation analysis | CONTEXT_CHAT_DEFAULT | gemini-2.5-flash | gemini/features/simulation.ts |
| Project suggestions | SUGGEST_PROJECTS | gemini-2.5-flash | gemini/features/suggestions.ts |
| Proactive suggestions | CONTEXT_CHAT_DEFAULT | gemini-2.5-flash | gemini/features/suggestions.ts |
| BOM part lookup | PART_FINDER | gemini-2.5-flash | gemini/features/bom.ts |
| Datasheet extraction | CONTEXT_CHAT_DEFAULT | gemini-2.5-flash | gemini/features/datasheets.ts |
| Version summarization | CONTEXT_CHAT_DEFAULT | gemini-2.5-flash | gemini/features/versioning.ts |
| Diagram description (a11y) | (via getAIClient) | gemini-2.5-flash | services/geminiService.ts |
| RAG embeddings | (via embedText) | text-embedding-004 | services/ragService.ts |

### Model Usage Summary

| Model ID | Features Count | Speed/Accuracy Profile |
|----------|---------------|----------------------|
| gemini-2.5-flash | 18+ | Fast, used for most features |
| gemini-2.5-pro | 4 | Accuracy-critical: wiring, complex chat, vision, 3D code gen |
| imagen-3.0-generate-001 | 2 | Image/thumbnail generation |
| veo-2.0-generate-001 | 1 | Video generation |
| gemini-2.5-flash-tts | 1 | Text-to-speech |
| gemini-2.5-flash-live | 1 | Live audio streaming (WebSocket) |
| text-embedding-004 | 2 | Semantic search and RAG |

---

## 11. State Sync Paths

How state flows between providers and systems.

### 11.1 Inventory to Diagram Sync (THE Critical Path)

```
InventoryContext (source of truth)
  |  updateItem(component)
  |  useEffect --> localStorage cm_inventory
  |  useEffect --> IndexedDB inventory store
  v
useInventorySync (in MainLayout)
  |  JSON snapshot comparison (id, name, type, pins per item)
  |  300ms debounce (immediate on first sync)
  v
componentValidator.syncDiagramWithInventory()
  |  Match by sourceInventoryId
  |  Copy: name, type, description, pins, datasheetUrl, imageUrl
  v
DiagramContext.updateDiagram(syncedDiagram)
  |  Push current to undo history
  |  useEffect --> localStorage cm_autosave
  v
Canvas re-renders with synced component data
```

### 11.2 Health to Layout Auto-Degradation

```
HealthProvider
  |  requestAnimationFrame FPS counter (every 1s)
  |  IF fps < 25 for 5 consecutive seconds:
  v
LayoutContext.setLowPerformanceMode(true)
  |  localStorage cm_low_performance_mode = 'true'
  |  document.body.classList.add('low-performance')
  v
CSS media query: .low-performance disables animations
Components check lowPerformanceMode for rendering optimizations
```

### 11.3 Diagram to Simulation Sync

```
DiagramContext
  |  diagram state changes
  v
SimulationContext (reads useDiagram())
  |  useEffect: runs simulationEngine.solve(diagram) on change
  |  IF isSimulating: 2Hz interval tick
  v
SimulationResult { pinStates, isShortCircuit, warnings }
  |
  v
Components read useSimulation():
  - PinStatusDot: shows HIGH/LOW/FLOATING/ERROR color
  - Wire: shows voltage-colored wire
  - SimControls: displays warnings
  - NotificationContext: shows short-circuit alert
```

### 11.4 Selection to AI Context Sync

```
SelectionContext
  |  setSelectedComponentId(id)
  v
useAIContextBuilder (in MainLayout)
  |  Includes selectedComponentId, selectedComponentName in AIContext
  v
Next AI request carries full selection context
  |  Gemini knows which component user is focused on
  v
AI response may reference or act on selected component
```

### 11.5 Conversation State Flow

```
ConversationProvider
  |  useConversations hook manages:
  |    - conversations: Conversation[] (from IndexedDB)
  |    - activeConversation: Conversation | null
  |    - messages: EnhancedChatMessage[] (from IndexedDB, per conversation)
  v
On conversation switch:
  |  loadMessages(conversationId) from IndexedDB
  |  Clear current messages, load new set
  v
On new message:
  |  saveMessage(msg) to IndexedDB messages store
  |  saveConversation(updated) to IndexedDB conversations store
  |  Update message count, lastMessagePreview, updatedAt
  v
AssistantContent / ChatMessage renders from messages array
```

### 11.6 Macro Recording Flow

```
MacroContext.startRecording()
  |
  v
useAIActions.execute(action) -- if recording, captures action
  |  MacroContext.addRecordedStep(action as WorkflowStep)
  v
MacroContext.stopRecording()
  |  Creates MacroWorkflow from recorded steps
  |  Saves to localStorage cm_macros
  v
MacroContext.playMacro(workflow)
  |  Iterates steps with optional delays
  |  Calls useAIActions.execute() for each step
```

---

## 12. Import Cluster Map

Major module clusters and their cross-dependencies.

### Cluster Diagram

```
+-------------------+     +--------------------+     +-------------------+
|   UI COMPONENTS   |     |   STATE (CONTEXTS) |     |     SERVICES      |
|                   |     |                    |     |                   |
| MainLayout  ------+---->| LayoutContext      |     | storage.ts        |
| DiagramCanvas     |     | DiagramContext  ---+---->| componentValidator |
| Inventory         |     | InventoryContext   |     | gemini/client.ts  |
| AssistantContent  |     | ConversationCtx    |     | gemini/features/* |
| ComponentEditor   |     | SimulationCtx -----+---->| simulationEngine  |
| SettingsPanel     |     | VoiceAssistantCtx -+---->| liveAudio.ts      |
| Diagram3DView     |     | TutorialCtx -------+---->| tutorialValidator |
| Gatekeeper        |     | AuthCtx -----------+---->| authService.ts    |
| TacticalHUD       |     | HealthCtx ---------+---->| healthMonitor.ts  |
| OmniSearch        |     | TelemetryCtx ------+---->| serialService.ts  |
+--------+----------+     +-------+----+-------+     +--------+----------+
         |                         |    |                      |
         |    +--------------------+    |                      |
         |    |                         |                      |
         v    v                         v                      v
+-------------------+     +--------------------+     +-------------------+
|      HOOKS        |     |      TYPES.TS      |     |    EXTERNAL       |
|                   |     |                    |     |                   |
| useAIActions      |     | ElectronicComponent|     | @google/genai     |
| useChatHandler    |     | WiringDiagram      |     | three.js          |
| useInventorySync  |     | EnhancedChatMessage|     | yjs + y-webrtc    |
| useAIContextBuilder|    | ActionType         |     | framer-motion     |
| useMainLayoutActions|   | ActionIntent       |     | minisearch        |
| useSearchIndex    |     | AIContext           |     | i18next           |
| useSecurityAudit  |     | ACTION_SAFETY       |     | @mediapipe        |
| useKeyboardShortcuts|   |                    |     | recharts          |
| useCanvasInteraction|   |                    |     | isomorphic-git    |
| actions/*.ts      |     |                    |     | jspdf             |
+-------------------+     +--------------------+     +-------------------+
```

### Import Clusters by Feature Domain

**Canvas Cluster** (tight coupling, all in components/diagram/ and hooks/useCanvas*):
```
DiagramCanvas
  --> useCanvasInteraction, useCanvasLayout, useCanvasWiring,
      useCanvasHighlights, useCanvasHUD, useCanvasExport
  --> DiagramNode, Wire, PredictiveGhost, NeuralCursor, Diagram3DView
  --> contexts: DiagramContext, SelectionContext, LayoutContext
```

**AI Cluster** (services/gemini/ + hooks):
```
gemini/client.ts (singleton root)
  --> gemini/features/*.ts (11 modules)
  --> gemini/prompts.ts, gemini/parsers.ts, gemini/types.ts
  --> geminiService.ts (legacy facade)
  --> useChatHandler (orchestrator)
  --> useAIContextBuilder + aiContextBuilder.ts
  --> useAIActions + hooks/actions/*.ts
  --> aiMetricsService.ts (observability)
```

**Persistence Cluster**:
```
storage.ts (core)
  --> InventoryContext (localStorage + IndexedDB)
  --> DiagramContext (localStorage)
  --> ConversationContext (IndexedDB via useConversations)
  --> LayoutContext (localStorage)
  --> MacroContext (localStorage)
  --> DashboardContext (localStorage)
partStorageService.ts
  --> InventoryContext (FZPZ binary cache)
userProfileService.ts (separate DB: CircuitMindProfiles)
  --> UserContext
```

**3D Cluster** (lazy-loaded):
```
Diagram3DView --> ThreeViewer
  --> useDiagram3DScene, useDiagram3DSync, useDiagram3DTelemetry
  --> threePrimitives.ts, threeCodeValidator.ts, threeCodeRunner.ts
  --> threeCodeRunner.worker.ts (Web Worker sandbox)
  --> gemini/features/components.ts (CODE_GEN)
  --> vendor-three chunk
```

**Collaboration Cluster**:
```
collabService.ts --> yjs, y-webrtc, peerDiscoveryService
  --> DiagramCanvas (RemoteCursor)
  --> CollaboratorList
  --> vendor-collab chunk
```

**Security Cluster**:
```
authService.ts --> AuthContext --> Gatekeeper
usePermissions --> useAIActions (RBAC gate)
securityAuditor.ts --> useSecurityAudit --> HUD fragments
threeCodeValidator.ts --> threeCodeRunner.ts (sandbox)
apiGateway.ts --> tokenService.ts (bearer token validation)
```

---

## Appendix A: Quick Lookup Tables

### Which file handles what action type?

| Action Type | Handler File | Handler Function |
|------------|-------------|-----------------|
| highlight | hooks/actions/canvasHandlers.ts | highlight |
| centerOn | hooks/actions/canvasHandlers.ts | centerOn |
| zoomTo | hooks/actions/canvasHandlers.ts | zoomTo |
| panTo | hooks/actions/canvasHandlers.ts | panTo |
| resetView | hooks/actions/canvasHandlers.ts | resetView |
| highlightWire | hooks/actions/canvasHandlers.ts | highlightWire |
| openInventory | hooks/actions/navHandlers.ts | openInventory |
| closeInventory | hooks/actions/navHandlers.ts | closeInventory |
| openSettings | hooks/actions/navHandlers.ts | openSettings |
| closeSettings | hooks/actions/navHandlers.ts | closeSettings |
| openComponentEditor | hooks/actions/navHandlers.ts | openComponentEditor |
| switchGenerationMode | hooks/actions/navHandlers.ts | switchGenerationMode |
| addComponent | hooks/actions/diagramHandlers.ts | addComponent |
| removeComponent | hooks/actions/diagramHandlers.ts | removeComponent |
| clearCanvas | hooks/actions/diagramHandlers.ts | clearCanvas |
| createConnection | hooks/actions/diagramHandlers.ts | createConnection |
| removeConnection | hooks/actions/diagramHandlers.ts | removeConnection |
| undo | hooks/actions/appControlHandlers.ts | undo |
| redo | hooks/actions/appControlHandlers.ts | redo |
| saveDiagram | hooks/actions/appControlHandlers.ts | saveDiagram |
| loadDiagram | hooks/actions/appControlHandlers.ts | loadDiagram |
| setUserLevel | hooks/actions/appControlHandlers.ts | setUserLevel |
| learnFact | hooks/actions/appControlHandlers.ts | learnFact |
| analyzeVisuals | hooks/actions/appControlHandlers.ts | analyzeVisuals |

### Which localStorage key belongs to which context?

| localStorage Key | Context/Service | Read On |
|-----------------|----------------|---------|
| cm_inventory | InventoryContext | Boot |
| cm_autosave | DiagramContext | Boot |
| savedDiagram | DiagramContext | Manual load |
| cm_gemini_api_key | gemini/client.ts | First AI request |
| cm_active_mode | LayoutContext | Boot |
| cm_inventory_open_default | LayoutContext | Boot |
| cm_inventory_pinned_default | LayoutContext | Boot |
| cm_inventory_width | LayoutContext | Boot |
| cm_assistant_open_default | LayoutContext | Boot |
| cm_assistant_pinned_default | LayoutContext | Boot |
| cm_assistant_width | LayoutContext | Boot |
| cm_layout_snapshot_{mode} | LayoutContext | Mode switch |
| cm_low_performance_mode | LayoutContext | Boot |
| cm_neural_link_enabled | LayoutContext | Boot |
| cm_dashboard_widgets | DashboardContext | Boot |
| cm_macros | MacroContext | Boot |
| cm_ai_metrics | aiMetricsService | Boot |
| cm_eng_events | aiMetricsService | Boot |
| cm_auth_hash | authService | Login |
| cm_auth_salt | authService | Login |
| cm_active_profile_id | userProfileService | Boot |
| cm_3d_code_cache_* | ThreeViewer | On demand |
| cm_generation_mode | AssistantStateContext | Boot |
| cm_deep_thinking | AssistantStateContext | Boot |

### Which IndexedDB store belongs to which service?

| Store | Database | Service | Context |
|-------|----------|---------|---------|
| inventory | CircuitMindDB | storage.ts | InventoryContext |
| app_state | CircuitMindDB | storage.ts | (generic key-value) |
| action_history | CircuitMindDB | storage.ts | useActionHistory |
| conversations | CircuitMindDB | storage.ts | ConversationContext |
| messages | CircuitMindDB | storage.ts | ConversationContext |
| parts | CircuitMindDB | partStorageService.ts | InventoryContext |
| profiles | CircuitMindProfiles | userProfileService.ts | UserContext |
