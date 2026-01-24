# Implementation Plan: Real-Time Data Integration

## 📋 Todo Checklist
- [x] **Core Service: Serial Communication**
    - [x] Create `services/serialService.ts`.
    - [x] Implement `requestPort`, `openPort`, and `readLoop` using Web Serial API.
    - [x] Add basic parser for standard key-value serial logs (e.g., `PIN_13: HIGH`).
- [x] **Infrastructure: Telemetry State**
    - [x] Create `contexts/TelemetryContext.tsx` and `useTelemetry` hook.
    - [x] Implement a live data registry mapping `componentId -> pin -> value`.
- [x] **UI: Hardware Terminal**
    - [x] Create `components/layout/HardwareTerminal.tsx`.
    - [x] Implement a scrollable log view with auto-scroll toggle.
    - [x] Add "Connect Hardware" button with port selection.
- [x] **Visuals: Live Pin Overlays**
    - [x] Update `DiagramNode.tsx` to include `TelemetryOverlay`.
    - [x] Implement floating "Data Bubbles" that appear when a pin receives a value.
    - [x] Add a "Heartbeat" pulse animation to components with active telemetry.
- [x] **Refinement: 3D Visualization**
    - [x] Update `Diagram3DView.tsx` to render telemetry values as sprites in the 3D scene.

## Testing Strategy
- **Service Tests:** Mock the `SerialPort` interface to verify parsing logic.
- **Integration Tests:** Verify that pushing data to `TelemetryContext` updates the `DiagramNode` visuals.
