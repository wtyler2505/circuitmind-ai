# Spec: Adaptive UI (Mode-Shifting Workspace)

## Goal
Improve user productivity by dynamically reconfiguring the workspace layout and visual theme based on the current engineering task (e.g., component placement, wiring, or software debugging).

## Background
A "one-size-fits-all" UI leads to clutter. For example, the `Inventory` sidebar is critical during `DESIGN` but occupies valuable space during `WIRING`. Adaptive UI shifts the interface to prioritize relevant tools.

## Workspace Modes
1.  **DESIGN (Green):** Focused on `Inventory` and 3D modeling.
2.  **WIRING (Cyan):** Focused on the canvas, pins, and connection list.
3.  **DEBUG (Amber):** Focused on logs, terminal output, and simulation data.

## Architecture
- **State:** `LayoutContext` will maintain the `activeMode`.
- **Layout Snapshots:** A JSON mapping of sidebar states (`open`, `pinned`, `width`) for each mode.
- **Dynamic Styling:** Root-level CSS variables that change based on the active mode class (e.g., `.mode-design`).

## Data Model
```typescript
type UIMode = 'design' | 'wiring' | 'debug';

interface LayoutSnapshot {
  inventoryOpen: boolean;
  assistantOpen: boolean;
  inventoryPinned: boolean;
  assistantPinned: boolean;
  inventoryWidth: number;
  assistantWidth: number;
}
```
