# Simulation: Live Circuit Logic

CircuitMind AI features a real-time electrical simulation engine that allows users to verify their designs before physical assembly.

## Core Pillars

### 1. Nodal Solver
- **Architecture:** A lightweight DC analysis engine running in a dedicated Web Worker to prevent UI thread lag.
- **Logic Propagation:** Simulates discrete logic states (HIGH, LOW, FLOATING) across microcontroller and sensor pins.
- **Voltage/Current Estimation:** Estimates nodal voltages based on component resistance and power source specifications.

### 2. Rule-Based Heuristics (Circuit Eye)
- **Mixed Voltage Detection:** Warns if 3.3V and 5V components share data lines without level shifters.
- **LED Current Limiting:** Heuristic check for resistors on nets containing LEDs to prevent burnout.
- **Microcontroller Power Check:** Critical alert if VCC/GND pins are left floating on MCU components.
- **Floating Component Detection:** Identifies parts with zero active connections.

### 3. Event-Driven Visuals
- **Live State HUD:** Component visuals (e.g., LEDs) update in real-time based on simulation results.
- **Flow Indicators:** Visual indicators on wires to show current direction and magnitude.
- **Short Circuit Detection:** Immediate visual warning (RED alert) if a short circuit is detected during simulation.

### 3. Component Simulation Models
- **Metadata-Driven:** Simulation models are extracted from `.fzpz` metadata or augmented via AI-assisted datasheet scraping.
- **Safety Thresholds:** Tracks pin-level voltage limits to warn users when a component is at risk of damage.
