# Product Requirements (PRD)

## Core Capabilities

1. **Intelligent Design (Intelligence Suite):** The system MUST generate wiring diagrams that are electrically plausible and provide proactive assistance via "Deep Awareness."
2. **High-Fidelity Assets (Visual Suite):** Components MUST be represented by official Fritzing SVGs (.fzpz) or high-quality custom equivalents, normalized to a 0.1" grid.
3. **Local Sovereignty (Sovereignty Suite):** User data, project files, and component libraries MUST remain on local hardware with P2P sync and Git-as-data versioning.
4. **Live Verification (Simulation Suite):** The system MUST simulate DC nodal flow and logic states in real-time to identify engineering errors early.
5. **Interactive Mastery (Education Suite):** The workspace MUST support guided quests with real-time state validation to flatten the learning curve.

## Functional Requirements

### Component & Asset Management

- Import custom .fzpz files with automatic unit normalization.
- Maintain IndexedDB persistence for binary assets and cached thumbnails.
- Support smart search and multi-categorical filtering (MCU, Sensor, etc.).

### Intelligence & Interaction

- "Eve" AI assistant MUST have temporal awareness of user history.
- AI MUST be able to inject visual highlights and pan the canvas via the HUD.
- Support smart metadata extraction from manufacturer PDF datasheets.

### Simulation & Logic

- Execute nodal analysis in a Web Worker to preserve UI responsiveness.
- Provide immediate visual feedback for logic states (HIGH/LOW) and short circuits.

### P2P Sync & Versioning

- Sync application state across LAN without a central server.
- Support branching and undo/redo via local Git-as-data.

## Non-Functional Requirements

- **Performance:** Maintain 60FPS canvas interactions with <50 components.
- **Latency:** Initial inventory hydration MUST be <100ms (manifest-first).
- **Aesthetic:** "Neon-Cyber" theme MUST be consistent across all sub-systems.
- **Privacy:** 100% telemetry-free operation.
