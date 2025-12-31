# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CircuitMind AI is an AI-powered electronics prototyping workspace. Users can generate wiring diagrams, analyze circuits via image/video, create 3D component models, and interact with a circuit engineering AI assistant. Built with React 19, Vite, Three.js, and Google Gemini models.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run preview      # Preview production build
```

**Environment**: Set `GEMINI_API_KEY` in `.env.local` before running.

## Architecture

### State Management (App.tsx)

No Redux/Context API. State is centralized in `App.tsx`:

- **Inventory** (`inventory`): Master component list, persisted to `localStorage.cm_inventory`
- **History** (`history`): Past/Present/Future stacks for undo/redo on WiringDiagram, persisted to `localStorage.cm_autosave`
- **Mode** (`generationMode`): 'chat' | 'image' | 'video' determines which Gemini model is used
- **LiveSession** (`liveSessionRef`): Uses `useRef` (not state) to prevent WebSocket disconnection on re-render

### Component Sync Pattern

When editing components via `ComponentEditorModal`, changes must update BOTH:
1. The active diagram in history
2. The global inventory array

This dual-update ensures future diagrams use updated pin definitions.

### Z-Index Layers

| Layer | Z-Index | Element |
|-------|---------|---------|
| Canvas | z-0 | Background diagram |
| Header | z-10 | Top bar |
| Chat | z-20 | Bottom panel |
| Inventory | z-40 | Slide-out sidebar |
| Modals | z-50 | Overlays |

## Key Services

### services/geminiService.ts

Model routing:

| Task | Model |
|------|-------|
| Wiring diagrams, research | gemini-3-pro-preview |
| Simple chat | gemini-2.5-flash-lite-preview |
| Concept art | gemini-3-pro-image-preview |
| Image editing | gemini-2.5-flash-image |
| Video gen | veo-3.1-fast-generate-preview |
| TTS | gemini-2.5-flash-preview-tts |

**Key functions**:
- `generateWiringDiagram()`: Produces JSON with components[] and connections[]
- `smartFillComponent()`: One-click component auto-fill using Google Search
- `assistComponentEditor()`: Chat assistant with search + state updates
- `generateComponent3DCode()`: Returns raw JS code for Three.js mesh generation

### services/liveAudio.ts

WebSocket connection to Gemini Live. Uses `nextStartTime` pattern for gapless audio playback via Web Audio API.

### services/storage.ts

localStorage wrapper for persistence.

## Components

- **DiagramCanvas.tsx**: SVG rendering of wiring diagrams. Uses "smart path" algorithm for wire routing (Bezier curves with fallback to zig-zag paths when curves would loop back).
- **ThreeViewer.tsx**: Three.js canvas. Executes AI-generated JS via `new Function('THREE', code)` - not `eval()`.
- **ComponentEditorModal.tsx**: Multi-tab editor with AI chat assistant sidebar.
- **Inventory.tsx**: Slide-out component library.

## Known Patterns

### Missing Pin Indicator

When AI hallucinates a pin that doesn't exist in inventory, `DiagramCanvas` renders a red pulsing dot at component bottom instead of crashing.

### Veo Video URLs

Video generation returns URLs that require `&key=YOUR_API_KEY` appended to avoid 403. Handled in geminiService.

## Types (types.ts)

Core data structures:
- `ElectronicComponent`: id, name, type, pins, quantity, threeCode, datasheetUrl
- `WireConnection`: fromComponentId, fromPin, toComponentId, toPin, color
- `WiringDiagram`: title, components[], connections[], explanation
