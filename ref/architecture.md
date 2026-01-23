# CircuitMind AI - System Architecture

## Overview

CircuitMind AI is an AI-powered electronics prototyping workspace built with:
- **Frontend**: React 19 + TypeScript + Vite 6
- **AI Backend**: Google Gemini (multiple models via modular service)
- **3D Rendering**: Three.js
- **Storage**: IndexedDB + localStorage
- **State**: React Context API + centralized App.tsx state

## Directory Structure

```
circuitmind-ai/
├── App.tsx              # Root state + layout orchestration
├── index.tsx            # Entry point with ErrorBoundary
├── types.ts             # All TypeScript interfaces
├── index.css            # Tailwind + cyber theme
│
├── components/          # React UI components
│   ├── diagram/         # Diagram-specific components
│   │   ├── Diagram3DView.tsx     # Three.js 3D canvas (1833 LOC)
│   │   ├── DiagramNode.tsx       # Individual component nodes (820 LOC)
│   │   ├── componentShapes.ts    # SVG shape definitions (685 LOC)
│   │   ├── Wire.tsx              # Connection rendering
│   │   └── diagramState.ts       # Diagram state utilities
│   │
│   ├── inventory/       # Inventory components
│   │   ├── InventoryItem.tsx     # Single item display
│   │   ├── InventoryList.tsx     # Item list container
│   │   └── inventoryUtils.ts     # Inventory helpers
│   │
│   ├── layout/          # Layout components
│   │   ├── AppHeader.tsx         # Top header bar
│   │   ├── AppLayout.tsx         # Main layout wrapper
│   │   └── StatusRail.tsx        # Status indicator rail
│   │
│   ├── ChatPanel.tsx             # AI chat interface (820 LOC)
│   ├── ChatMessage.tsx           # Message renderer (472 LOC)
│   ├── ComponentEditorModal.tsx  # Component editor (1159 LOC)
│   ├── DiagramCanvas.tsx         # 2D SVG diagram (1227 LOC)
│   ├── Inventory.tsx             # Component library (987 LOC)
│   ├── SettingsPanel.tsx         # Settings modal (876 LOC)
│   ├── ThreeViewer.tsx           # 3D model viewer (469 LOC)
│   └── MainLayout.tsx            # Main app layout (487 LOC)
│
├── contexts/            # React Context providers
│   ├── DiagramContext.tsx        # Diagram state + undo/redo
│   ├── InventoryContext.tsx      # Component library state
│   ├── LayoutContext.tsx         # Layout mode + sidebars
│   ├── ConversationContext.tsx   # Chat conversation state
│   ├── AssistantStateContext.tsx # AI assistant state
│   └── VoiceAssistantContext.tsx # Voice input/output
│
├── hooks/               # Custom React hooks
│   ├── actions/         # Action handlers (refactored)
│   ├── useAIActions.ts           # AI action dispatcher
│   ├── useConversations.ts       # Conversation CRUD (346 LOC)
│   ├── useInventorySync.ts       # Inventory-diagram sync
│   ├── useActionHistory.ts       # Undo/redo history
│   ├── useAutonomySettings.ts    # AI safety settings
│   └── useToast.tsx              # Toast notifications
│
├── services/            # Business logic
│   ├── gemini/          # Modular Gemini integration
│   │   ├── client.ts             # API client + models
│   │   ├── features/             # Feature modules
│   │   │   ├── chat.ts           # Chat operations
│   │   │   ├── components.ts     # Component AI features
│   │   │   ├── media.ts          # Image/video gen
│   │   │   ├── suggestions.ts    # Proactive suggestions
│   │   │   └── wiring.ts         # Diagram generation
│   │   ├── prompts.ts            # Prompt templates
│   │   ├── parsers.ts            # Response parsing
│   │   └── types.ts              # AI-specific types
│   │
│   ├── storage.ts                # IndexedDB operations
│   ├── aiContextBuilder.ts       # AI context construction
│   ├── responseParser.ts         # AI response parsing
│   ├── componentValidator.ts     # Component validation (433 LOC)
│   ├── threePrimitives.ts        # 3D primitive library (406 LOC)
│   ├── liveAudio.ts              # WebSocket live audio
│   └── aiMetricsService.ts       # Latency/success tracking
│
├── data/
│   └── initialInventory.ts       # Default components (680 LOC)
│
└── ref/                 # Reference documentation
    ├── architecture.md           # This file
    ├── components.md             # Component APIs
    ├── services.md               # Service APIs
    ├── patterns.md               # Design patterns
    ├── types.md                  # TypeScript interfaces
    └── pitfalls.md               # Common gotchas
```

## State Management

### Hybrid Architecture

**Context API** for domain-specific state:

| Context | State | Scope |
|---------|-------|-------|
| `DiagramContext` | diagram, undo/redo | Diagram operations |
| `InventoryContext` | inventory[], selection | Component library |
| `LayoutContext` | viewMode, panels, sidebars | UI layout |
| `ConversationContext` | activeId, messages | Chat sessions |
| `AssistantStateContext` | aiStatus, pending actions | AI state |
| `VoiceAssistantContext` | recording, transcription | Voice I/O |

**App.tsx** coordinates between contexts and handles:
- Global error boundaries
- Initial data loading
- Cross-context operations

### Persistence

| Store | Type | Key/DB |
|-------|------|--------|
| Inventory | IndexedDB + localStorage | `CircuitMindDB.inventory`, `cm_inventory` |
| Diagrams | localStorage | `cm_autosave` |
| Conversations | IndexedDB | `CircuitMindDB.conversations/messages` |
| Settings | localStorage | `cm_gemini_api_key`, `cm_autonomy_settings` |

### Critical Pattern: Dual Component Sync

When editing components, update BOTH locations:
1. `InventoryContext` - Source of truth for library
2. Active diagram components - Current instance

The `useInventorySync` hook handles this automatically.

## Data Flow

```
User Input
    │
    ├─→ Canvas Interaction → DiagramContext → State Update → Re-render
    │
    └─→ Chat Input → Gemini Service → Structured Response
                                            │
                          ┌─────────────────┴─────────────────┐
                          ↓                                   ↓
                    Safe Actions                        Unsafe Actions
                    (auto-execute)                      (need confirmation)
                          │                                   │
                          ↓                                   ↓
                    Canvas Updates                      Pending Queue
                    (highlight, zoom)                   (user approves)
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

Located at `services/gemini/`:

| Module | Purpose |
|--------|---------|
| `client.ts` | API client, model routing, key management |
| `features/chat.ts` | Conversational chat operations |
| `features/wiring.ts` | Diagram generation |
| `features/components.ts` | Smart fill, 3D code gen |
| `features/media.ts` | Image/video generation |
| `features/suggestions.ts` | Proactive AI suggestions |
| `prompts.ts` | Prompt templates |
| `types.ts` | AI-specific type definitions |

### Model Routing

| Task | Model |
|------|-------|
| Wiring diagrams | gemini-2.5-pro |
| Chat (fast) | gemini-2.5-flash |
| Chat (complex) | gemini-2.5-pro |
| Smart fill | gemini-2.5-flash + Google Search |
| 3D code gen | gemini-2.5-flash + thinking |
| Image gen | gemini-2.5-flash-image |
| Concept art | gemini-3-pro-image-preview |
| Video gen | veo-3.1-fast-generate-preview |
| TTS | gemini-2.5-flash-preview-tts |

### Action System

Actions classified by safety:

**Safe Actions** (auto-execute):
- highlight, centerOn, zoomTo, resetView
- openInventory, closeInventory

**Unsafe Actions** (need confirmation):
- addComponent, removeComponent
- createConnection, deleteConnection
- modifyComponent

Settings allow users to customize classifications via `useAutonomySettings`.

## Storage Architecture

### IndexedDB (CircuitMindDB v2)

| Store | Key | Indexes | Purpose |
|-------|-----|---------|---------|
| `inventory` | `id` | - | Component library |
| `app_state` | `key` | - | Diagrams, settings |
| `conversations` | `id` | `updatedAt`, `isPrimary` | Chat sessions |
| `messages` | `id` | `conversationId`, `timestamp` | Chat messages |
| `action_history` | `id` | `timestamp`, `conversationId` | Undo support |

### localStorage Keys

| Key | Purpose |
|-----|---------|
| `cm_inventory` | Component library backup |
| `cm_autosave` | Current diagram autosave |
| `cm_gemini_api_key` | User's API key |
| `cm_autonomy_settings` | AI action permissions |
| `savedDiagram` | Quick save slot |
