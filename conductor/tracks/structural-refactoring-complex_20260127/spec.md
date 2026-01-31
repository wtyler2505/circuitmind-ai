# Specification: Structural Refactoring & Complexity Debt

## Goal
Decompose high-complexity components and functions to meet project maintainability standards (CCN < 15).

## Requirements
- **Diagram3DView.tsx**: Refactor 1946 LOC into modular sub-components (Lighting, Component Meshes, Scene Control).
- **DiagramCanvas.tsx**: Refactor 1380 LOC by extracting rendering and event logic.
- **Logic Hotspots**: Optimize `clampZoom` (CCN 21), `generateConceptImage` (CCN 18), and `validateDiagramInventoryConsistency` (CCN 16).

## Scope
- `components/diagram/`
- `services/componentValidator.ts`
- `services/gemini/features/media.ts`