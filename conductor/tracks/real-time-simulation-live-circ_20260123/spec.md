# Spec: Real-Time Simulation (Live Circuit Logic)

## Goal
Identify engineering errors early by providing an interactive, live electrical simulation directly within the diagram workspace.

## Background
Wiring components correctly is difficult. Currently, users must build the circuit physically to test it. This feature provides a "Pre-Flight" check by simulating DC power flow and basic logic states (HIGH/LOW).

## Architecture
- **Nodal Solver:** A lightweight DC analysis engine running in a Web Worker.
- **Event-Driven Visuals:** Component states (on/off, voltage level) update via the `SimulationContext`.
- **Component Definitions:** The existing `ElectronicComponent` type will be augmented with `simulationModel` data (e.g., internal resistance, pin voltage limits).

## Data Model
```typescript
interface SimNodeState {
  voltage: number;
  current: number;
  logicState?: 'HIGH' | 'LOW' | 'FLOATING';
}

interface SimulationSnapshot {
  timestamp: number;
  nodeStates: Record<string, SimNodeState>; // Keyed by pin path
  isShortCircuit: boolean;
}
```

## Security & Privacy
- Simulations run entirely locally in the browser.
- Simulation results may be sent to Gemini if the user asks for a "Safety Audit" of the results.
