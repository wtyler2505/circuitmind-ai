# CircuitMind AI - System Architecture

## Overview

CircuitMind AI is an AI-powered electronics prototyping workspace built with:
- **Frontend**: React 19 + TypeScript + Vite
- **AI Backend**: Google Gemini (multiple models)
- **3D Rendering**: Three.js
- **Storage**: IndexedDB + localStorage

## Directory Structure

```
circuitmind-ai/
├── App.tsx              # Main app, centralized state management
├── index.tsx            # Entry point with global error boundary
├── types.ts             # All TypeScript interfaces
├── index.css            # Tailwind + custom cyber theme
│
├── components/          # React UI components (4082 lines)
│   ├── ChatPanel.tsx         # AI chat with conversation mgmt
│   ├── ChatMessage.tsx       # Individual chat message renderer
│   ├── ConversationSwitcher.tsx
│   ├── ComponentEditorModal.tsx  # Component edit + AI assistant
│   ├── DiagramCanvas.tsx     # SVG wiring diagram renderer
│   ├── ErrorBoundary.tsx
│   ├── Inventory.tsx         # Component library sidebar
│   ├── SettingsPanel.tsx     # API key + autonomy settings
│   └── ThreeViewer.tsx       # Three.js 3D model viewer
│
├── services/            # Business logic (2156 lines)
│   ├── geminiService.ts      # All Gemini API calls (923 lines)
│   ├── storage.ts            # IndexedDB operations (443 lines)
│   ├── aiContextBuilder.ts   # AI context construction (304 lines)
│   ├── liveAudio.ts          # WebSocket live audio (212 lines)
│   └── responseParser.ts     # AI response parsing (274 lines)
│
├── hooks/               # Custom React hooks
│   ├── useConversations.ts   # IndexedDB conversation CRUD
│   └── useAIActions.ts       # AI action execution + undo
│
└── docs/                # Documentation
    ├── data/
    ├── frontend/
    ├── services/
    └── README.md
```

## State Management

**NO Redux/Context API** - All state centralized in `App.tsx`:

| State | Type | Persistence | Purpose |
|-------|------|-------------|---------|
| `inventory` | `ElectronicComponent[]` | `localStorage.cm_inventory` | Master component library |
| `history` | `{past, present, future}` | `localStorage.cm_autosave` | Undo/redo for diagram |
| `messages` | `ChatMessage[]` | IndexedDB | Chat history |
| `autonomySettings` | `AIAutonomySettings` | `localStorage.cm_autonomy_settings` | AI action permissions |

### Critical Pattern: Dual Component Sync

When editing components via `ComponentEditorModal`, changes must update BOTH:
1. The active diagram in history
2. The global inventory array

This ensures future diagrams use updated pin definitions.

## Data Flow

```
User Input → Chat/Canvas → Gemini API → Structured Response → State Update → Re-render
                                              ↓
                                        AI Actions (safe = auto-execute)
                                              ↓
                                        Canvas Highlights/Modifications
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

### Model Routing (geminiService.ts)

| Task | Model |
|------|-------|
| Wiring diagrams | gemini-3-pro-preview |
| Simple chat | gemini-2.5-flash-lite-preview |
| Concept art | gemini-3-pro-image-preview |
| Image editing | gemini-2.5-flash-image |
| Video gen | veo-3.1-fast-generate-preview |
| TTS | gemini-2.5-flash-preview-tts |

### Action System

Actions are classified as safe (auto-execute) or unsafe (needs confirmation):

**Safe Actions**: highlight, centerOn, zoomTo, resetView, openInventory, etc.
**Unsafe Actions**: addComponent, removeComponent, createConnection, etc.

Settings allow users to customize which actions are safe.

## Storage Architecture

### IndexedDB (CircuitMindDB v2)

| Store | Key | Indexes | Purpose |
|-------|-----|---------|---------|
| `inventory` | `id` | - | Component library |
| `app_state` | `key` | - | Diagrams, settings |
| `conversations` | `id` | `updatedAt`, `isPrimary` | Chat sessions |
| `messages` | `id` | `conversationId`, `timestamp`, `conv_time` | Chat messages |
| `action_history` | `id` | `timestamp`, `conversationId` | Undo support |

### localStorage Keys

- `cm_inventory` - Component library backup
- `cm_autosave` - Current diagram autosave
- `cm_gemini_api_key` - User's API key
- `cm_autonomy_settings` - AI action permissions
- `savedDiagram` - Quick save slot
