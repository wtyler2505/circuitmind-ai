# Plan: Performance Optimization

## Phase 1: Context & Rendering Optimization
- [x] Refactor `DiagramContext` to separate "Canvas State" (components/wires) from "Selection State" (active id).
- [x] Implement `React.memo` on leaf components: `InventoryItem`, `ChatMessage`, `IconButton`, and `Wire`.
- [x] Optimize `InventoryContext` search logic using `useDeferredValue` for the filter query.

## Phase 2: List Virtualization
- [x] Integrate a virtualization library (e.g., `react-window`) into `InventoryList.tsx`.
- [x] Implement virtualization for the `ChatPanel` message history to handle long engineering logs.

## Phase 3: Canvas Optimization
- [x] Throttle "Pan" and "Zoom" events in `ThreeViewer` to ensure stable 60fps during navigation.
- [x] Use CSS transforms for wire highlighting instead of re-calculating SVG paths where possible.

## Phase 4: Verification
- [x] Run a fresh Lighthouse audit using the JSON reporter to verify TBT < 300ms.
- [x] Perform a "Visual Drift Audit" to ensure UI remains pixel-perfect.
