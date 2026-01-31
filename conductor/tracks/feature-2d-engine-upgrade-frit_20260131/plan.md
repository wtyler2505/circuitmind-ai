# Implementation Plan: 2D Engine Upgrade (Fritzing Parity)

## Phase 1: Foundation & Data Model
- [x] **Task 1: Update Types**
    - Modify `types.ts` to include `WirePoint`, `ComponentFootprint`, and updated `ElectronicComponent` interfaces.
- [x] **Task 2: Grid System Upgrade**
    - Refactor `DiagramCanvas` to enforce a 0.1" coordinate system.
    - Implement visual grid background (dots/lines) matching this scale.

## Phase 2: FZPZ Asset Pipeline
- [x] **Task 3: FZPZ Importer Utility**
    - Create `services/fzpzLoader.ts` using `jszip` (or similar) to unzip and parse files.
    - Implement `xml-js` parsing for `.fzp` metadata.
- [x] **Task 4: SVG Processing**
    - Implement logic to extract and sanitize the `breadboard` layer from Fritzing SVGs.
    - Create a test harness to load a sample `.fzpz` (e.g., generic resistor) and render it.

## Phase 3: The Smart Breadboard
- [x] **Task 5: Breadboard Component Logic**
    - Create a dedicated `Breadboard` component entity with defined internal nets.
    - Implement `getConnectivity(pinId)` logic to resolve rail connections.
- [x] **Task 6: Snap & Conflict Logic**
    - Implement "Magnetism" in `useDrag` hooks.
    - Add collision detection to prevent pin overlap.

## Phase 4: Advanced Wiring
- [x] **Task 7: Bézier Wire Renderer**
    - Create new `BezierWire` component using SVG `<path>` with `C` commands.
    - Implement `calculateCurve` utility to generate control points based on distance and angle.
- [x] **Task 8: Interaction Layer**
    - Add double-click handler to split wire segments (create anchor).
    - Add drag handlers for anchor points.
    - Implement Context Menu for wire properties (Color, Thickness).

## Phase 5: Integration & Polish
- [x] **Task 9: Migration Strategy**
    - Ensure existing diagrams (if any) don't crash, even if they look "off".
- [x] **Task 10: Final Audit**
    - Verify performance with 50+ components.
    - visual regression test against "Fritzing" aesthetic.
