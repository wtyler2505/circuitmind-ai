# Current System State

## Core Architecture

- **Framework:** React 19 (Strict Mode) with Vite.
- **State Management:** Federated React Contexts (Inventory, Diagram, Assistant, Layout, HUD, Simulation).
- **Persistence:** IndexedDB (via `partStorageService`) for binary .fzpz assets; LocalStorage for UI preferences.
- **Data Engine:** Local Git repository (`isomorphic-git`) for project versioning and P2P sync state.

## Subsystem Status

### 1. Asset Engine (God-Tier FZPZ)

- **Status:** Fully implemented.
- **Components:** `FzpzLoader`, `PartStorageService`, `DiagramNode`.
- **Manifest:** `public/parts/parts-manifest.json` handles instant hydration.

### 2. Intelligence Engine (Eve)

- **Models:** Gemini 2.5 Pro (Design), Gemini 2.5 Flash (Interaction).
- **Deep Awareness:** Implemented via history buffer and context augmentation.
- **Capabilities:** Proactive suggestions, safety audits, and automated diagram synthesis.

### 3. Visual & Interaction Engine

- **2D Engine:** SVG-based with Bézier wire routing and 0.1" grid snapping.
- **3D Engine:** Three.js integration for geometry preview and masterpieces.
- **HUD:** Dynamic data injection layer for real-time telemetry and AI highlighting.
- **Neural Link:** MediaPipe-powered hand tracking for gesture-based design.

### 4. Simulation Engine

- **Nodal Solver:** Web Worker implementation of DC analysis.
- **Logic:** Support for discrete logic states and real-time flow indicators.

### 5. Sovereignty & Sync

- **Local Sync:** LAN discovery and WebRTC Git packfile exchange.
- **Status:** Core sync engine functional; P2P discovery in hardening phase.
