# Implementation Plan: Real-Time Simulation

## 📋 Todo Checklist
- [ ] **Core Service: Simulation Engine**
    - [x] Create `services/simulationEngine.ts`.
    - [x] Implement a basic nodal analysis solver (DC only initially).
    - [ ] Define "Virtual Component Models" (e.g., Resistor, LED, Battery).
- [x] **Infrastructure: Simulation State**
    - [x] Create `contexts/SimulationContext.tsx`.
    - [x] Implement `isSimulating` state and a `simulationTick` loop.
    - [x] Map diagram components to solver nodes.
- [x] **Visuals: Live Flow & States**
    - [x] Update `Wire.tsx` to animate "Current Flow" (marching ants effect).
    - [x] Update `DiagramNode.tsx` to show pin voltage levels (e.g., color-coded dots).
    - [x] Add a "Safe Mode" overlay that turns wires red on short-circuit.
- [x] **UI: Simulation Controls**
    - [x] Create `components/layout/SimControls.tsx`.
    - [x] Add "Virtual Power" switch and a "Multimeter" probe tool.
    - [x] Integrate into the `Adaptive UI` (Feature 2) "DEBUG" mode.
- [x] **Refinement: AI Safety Review**
    - [ ] Add `analyzeSimulation` tool to `geminiService.ts`.
    - [ ] Let Gemini review the simulation results for high-level logic errors.

## Testing Strategy
- **Math Tests:** Verify voltage drops across series/parallel resistors match calculated values.
- **Safety Tests:** Ensure short-circuit detection fires correctly for a VCC-GND bridge.
