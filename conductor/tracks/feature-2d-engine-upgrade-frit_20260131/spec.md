# Specification: 2D Engine Upgrade (Fritzing Parity)

## Goal
Transform the 2D diagramming experience to achieve feature and visual parity with Fritzing. This involves replacing the current "Point A to Point B" wiring with a physics-aware, Bézier-curved system, implementing a "Smart Breadboard" with internal logic awareness, and enabling the import of Fritzing Parts (`.fzpz`) for high-fidelity component visuals.

## Core Features
1.  **Smart Breadboard Logic:**
    *   **Grid Snapping:** Components and wires snap to a 0.1" (2.54mm) global grid.
    *   **Internal Buses:** The breadboard component "knows" its rails. Pins inserted into the same rail (e.g., Row 1, Col A-E) are automatically connected.
    *   **Conflict Detection:** Visual feedback (red highlight) if two pins attempt to occupy the same hole.

2.  **Advanced Wiring Engine:**
    *   **Bézier Routing:** Wires render as cubic Bézier curves for a natural "slack" appearance.
    *   **Anchors (Bend Points):** Users can double-click a wire to create a moveable anchor point, allowing complex routing around components.
    *   **Segment Selection:** Individual wire segments (between anchors) can be selected and manipulated.
    *   **Context Menu:** Right-click to change wire color (Red, Black, Blue, etc.) or type.

3.  **FZPZ Asset Pipeline:**
    *   **Importer:** Client-side parsing of `.fzpz` (zip) files.
    *   **SVG Rendering:** Extraction and display of the "breadboard" SVG layer from imported parts.
    *   **Pin Mapping:** Logic to map `.fzp` XML connector IDs to SVG element IDs for precise wire attachment.

## Technical Requirements
-   **Coordinate System:** Migrating `DiagramCanvas` to a strict unit-based system (1 unit = 0.1 inch).
-   **Data Model:** Updating `WireConnection` to support path points (`handleIn`, `handleOut`) and `ElectronicComponent` to store `footprint` and `fzpzSource`.
-   **Performance:** Imported SVGs must be cached in IndexedDB to prevent re-parsing latency.

## User Experience
-   **Drag & Drop:** "Magnetic" feel when dragging components near the breadboard.
-   **Visuals:** Components look "real" (imported vectors), not just abstract boxes.
-   **Routing:** Users feel like they are bending physical wires, not drawing vector lines.
