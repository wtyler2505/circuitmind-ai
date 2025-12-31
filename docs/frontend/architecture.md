# Frontend Architecture & State Management

## Technology Stack
- **Framework**: React 19 (Client-side)
- **Styling**: Tailwind CSS (Custom "Cyber" theme config in `index.html`)
- **3D Engine**: Three.js (Fiber is NOT used; we use raw Three.js refs for better control over AI-generated code execution).
- **Build Tool**: Vite (Implied environment).

## Global State (App.tsx)
The `App.tsx` file acts as the central controller. We do not use Redux or Context API because the state is tightly coupled to the workspace view.

### 1. Inventory State
`const [inventory, setInventory]`
- **Source of Truth**: This array holds the master definition of every component available to the user.
- **Sync Logic**: When a user updates a component inside `ComponentEditorModal` (e.g., adding pins), `handleSaveComponent` triggers. This function updates **BOTH** the active diagram (history) AND the global inventory. This ensures future diagrams use the updated pin definitions.

### 2. Time Travel (Undo/Redo)
`const [history, setHistory]`
We implement a custom "Past / Present / Future" stack for the Wiring Diagram.
- **Past**: Array of `WiringDiagram` objects.
- **Present**: The currently rendered `WiringDiagram`.
- **Future**: Array of `WiringDiagram` objects (populated when Undo is clicked).
- **Trigger**: Any AI generation or manual wire edit calls `updateDiagram()`, which pushes the current state to `past` and clears `future`.

### 3. Mode Switching
`const [generationMode, setGenerationMode]`
- **'chat'**: Default. Enters text, gets text/diagrams.
- **'image'**: Changes prompt behavior to target `gemini-3-pro-image-preview` or `gemini-2.5-flash-image`.
- **'video'**: Changes prompt behavior to target `veo-3.1`.

### 4. Live Session
`const liveSessionRef = useRef<LiveSession | null>(null)`
- We use a `ref` instead of state for the `LiveSession` class to prevent React re-renders from severing the WebSocket connection during the conversation. State is only used for the UI status indicator (`isLiveActive`).

## Layout Strategy
- **Z-Indexing Layers**:
    0.  **Canvas**: `z-0` (Background)
    10. **Header**: `z-10` (Floating top)
    20. **Chat Panel**: `z-20` (Floating bottom)
    40. **Inventory**: `z-40` (Slide-out sidebar)
    50. **Modals**: `z-50` (Overlays)

## File Upload Handling
We read files as Base64 strings using `FileReader`.
- **Images**: Passed to Gemini Vision models.
- **Videos**: Passed to Gemini Multimodal.
- **Audio**: Recorded via MediaRecorder API, converted to Base64, sent to Whisper-like endpoint (Gemini Flash).
