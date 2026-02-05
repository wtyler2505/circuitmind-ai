# Assumptions & Unknowns

## Technical Assumptions
- **Asset Protocol:** The Fritzing Part (.fzpz) format is stable enough to serve as the primary source of truth for component metadata and SVGs.
- **Browser Capabilities:** Modern browsers (React 19 target) provide sufficient IndexedDB performance for storing hundreds of binary .fzpz files.
- **AI Accuracy:** Gemini 2.5 Pro can consistently generate valid JSON for wiring diagrams when provided with detailed pinout context.

## Risks
- **SVG Complexity:** Complex Fritzing SVGs may contain non-standard XML that requires aggressive sanitization to render reliably in the browser.
- **State Sync:** maintaining 100% parity between the `InventoryContext` (source of truth) and `DiagramContext` (runtime usage) during rapid AI-driven modifications.
- **Large-Scale Simulations:** Real-time DC nodal analysis may lag on low-power devices when component counts exceed 50 nodes.

## Unknowns
- **P2P Scaling:** Performance of Isomorphic-git + Lightning-FS when syncing large binary assets across multiple local devices.
- **AI Latency:** Real-world impact of multi-modal (Vision/Audio) streaming on the main UI thread during intense 3D rendering.
