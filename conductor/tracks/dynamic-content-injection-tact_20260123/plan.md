# Implementation Plan: Dynamic Content Injection (Tactical HUD)

## 📋 Todo Checklist
- [x] **Infrastructure: HUD State Management**
    - [x] Create `contexts/HUDContext.tsx`.
    - [x] Define `HUDProvider` and `useHUD` hook.
    - [x] Implement `addFragment`, `removeFragment`, and `clearHUD`.
- [x] **UI: Tactical HUD Component**
    - [x] Create `components/diagram/TacticalHUD.tsx`.
    - [x] Implement React Portal for canvas-relative positioning.
    - [x] Add Framer Motion "glitch" animations.
    - [x] Style with `panel-surface` and `neon-cyan` borders.
- [x] **Integration: Diagram Events**
    - [x] Update `DiagramCanvas.tsx` to detect hover on components/pins.
    - [x] Wire up `onMouseEnter` and `onMouseLeave` to HUD state.
- [x] **Intelligence: Low-Latency Fragments**
    - [x] Create `generateHUDFragment` in `services/geminiService.ts`.
    - [x] Use `gemini-2.5-flash` with a strict character limit.
    - [x] Implement local caching for frequent component lookups.
- [x] **Refinement: UX Polish**
    - [x] Add "Priority Decay" (info fades after 5s).
    - [x] Implement `H` keybind to toggle HUD visibility.

## Testing Strategy
- **Unit Tests:** `HUDContext.test.tsx` for state logic.
- **Visual Tests:** Playwright test to verify HUD appears near cursor.
