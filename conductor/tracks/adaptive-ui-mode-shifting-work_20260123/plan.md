# Implementation Plan: Adaptive UI

## 📋 Todo Checklist
- [x] **Infrastructure: Layout Modes**
    - [x] Update `contexts/LayoutContext.tsx` to include `UIMode` state.
    - [x] Implement `setMode` and logic to save/load layout snapshots per mode.
- [x] **UI: Mode Selector**
    - [x] Create `components/layout/ModeSelector.tsx`.
    - [x] Integrate into `StatusRail.tsx` or `AppHeader.tsx`.
    - [x] Add icons for `DESIGN`, `WIRING`, and `DEBUG` modes.
- [x] **Visuals: Mode Accents**
    - [x] Define CSS variables for `--mode-accent` in `index.css`.
    - [x] Update Tailwind config to support dynamic mode colors.
    - [x] Update UI components (borders, glows) to use mode-specific colors.
- [x] **Logic: Intelligent Transitions**
    - [x] Implement `useLayoutSnapshot` hook.
    - [x] Auto-open/close sidebars based on mode defaults (e.g., `DESIGN` opens `Inventory`).
- [x] **Refinement: UX**
    - [x] Add smooth panel transitions using Framer Motion.
    - [x] Implement "Focus Mode" toggle (hides all chrome).

## Testing Strategy
- **Unit Tests:** `LayoutContext.test.tsx` for mode switching logic.
- **Visual Tests:** Playwright tests to verify layout shifts and color changes.
