# Implementation Plan: Structural Refactoring & Complexity Debt

- [ ] Extract `useThreeScene` and `ComponentMesh` from `Diagram3DView.tsx`.
- [ ] Decompose `DiagramCanvas.tsx` into `ConnectionRenderer` and `useCanvasGestures`.
- [ ] Refactor `clampZoom` in `diagramState.ts` to reduce CCN.
- [ ] Apply strict interfaces to `media.ts` and `componentValidator.ts` functions.
- [ ] Verify CCN reduction using `lizard`.