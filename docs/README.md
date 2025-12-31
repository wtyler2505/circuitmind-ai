# CircuitMind AI - Documentation Master Index

## Project Overview
CircuitMind AI is a futuristic, AI-powered workspace for electronics prototyping. It leverages Google's Gemini models to generate wiring diagrams, analyze circuits via video/image, generate concept art, and create interactive 3D models of components on the fly.

**New in v2025.1**: "Circuit Engineer Mode" — A dedicated AI assistant capable of researching component pinouts, finding real-world datasheets/images via Google Search, and auto-updating component specifications through natural language.

## Directory Structure

### 1. [Frontend & UI](/docs/frontend/)
Detailed documentation on the React architecture, component hierarchy, canvas rendering logic, and state management.
- **[Architecture & State](/docs/frontend/architecture.md)**: How the app thinks. Undo/Redo history, Inventory sync.
- **[Component Reference](/docs/frontend/components.md)**: Deep dive into `DiagramCanvas`, `Inventory`, `ThreeViewer`, and the new `ComponentEditorModal`.

### 2. [AI & Services](/docs/services/)
The brain of the operation. How we talk to Gemini, handle specific models, and manage audio/video streams.
- **[Gemini Integration](/docs/services/gemini-api.md)**: Prompt engineering, Model selection (`gemini-3-pro`, `veo`, etc.), Tool use (Google Search), and JSON schema enforcement.
- **[Live Audio & Media](/docs/services/audio-video.md)**: The WebSocket connection for Gemini Live, PCM audio encoding/decoding, and video generation flows.

### 3. [Data Structures](/docs/data/)
- **[Types & Schemas](/docs/data/types.md)**: The DNA of the application. `ElectronicComponent`, `WiringDiagram`, and `WireConnection` definitions.

### 4. [The "Other Shit"](/docs/misc/)
- **[Hacks, Math & Trade Secrets](/docs/misc/hacks-and-secrets.md)**: The stuff usually left out of docs. SVG path algorithms, `eval()` usage for 3D generation, and race condition handling.

---
*Generated for CircuitMind AI - v2025 Beta*