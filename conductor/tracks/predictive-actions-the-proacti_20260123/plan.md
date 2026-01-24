# Implementation Plan: Predictive Actions

## 📋 Todo Checklist
- [x] **Core Service: Prediction Engine**
    - [x] Create `services/predictionEngine.ts`.
    - [x] Implement ranking logic for "Most Likely Next Step" based on `AIContext`.
    - [x] Integrate with `gemini-2.5-flash` for high-level pattern matching (e.g., common circuit patterns).
- [x] **Logic: Staged Actions**
    - [x] Update `useAIActions.ts` to handle `staged` state (actions that aren't applied yet).
    - [x] Add `acceptAction` and `rejectAction` methods.
- [x] **UI: Ghost Visuals**
    - [x] Create `components/diagram/PredictiveGhost.tsx`.
    - [x] Implement "Ghost Wires" (translucent connections suggesting a path).
    - [x] Implement "Ghost Components" (grayed-out suggestions for missing parts like capacitors).
- [x] **Integration: Trigger Loop**
    - [x] Add a debounced effect in `MainLayout.tsx` that triggers the prediction engine after component placement or selection.
    - [x] Link `PredictiveGhost` to the `HUDContext` for unified rendering.
- [x] **Refinement: One-Click Wiring**
    - [x] Add "Smart Connect" labels next to suggested pins.
    - [ ] Add "Silence AI Suggestions" button for high-focus work.

## Testing Strategy
- **Logic Tests:** Verify that the ranking engine prefers GND/VCC connections first.
- **Visual Tests:** Playwright check to ensure ghosts don't interfere with real component interaction.
