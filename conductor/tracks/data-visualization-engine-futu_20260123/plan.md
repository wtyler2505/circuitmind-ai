# Implementation Plan: Data Visualization Engine (Futuristic Analytics)

## 📋 Todo Checklist
- [ ] **Infrastructure: High-Frequency Data Buffering**
    - [x] Create `services/viz/vizEngine.ts`.
    - [x] Implement a rolling buffer hook (`useDataStream`) to handle 1000+ points per second.
    - [x] Add logic for "Downsampling" to maintain performance on older hardware.
- [ ] **Core Components: The "Scopes"**
    - [x] Build `OscilloscopeWidget.tsx` using Canvas 2D for high-speed waveforms.
    - [x] Build `LogicAnalyzerWidget.tsx` for visualizing digital state transitions (HIGH/LOW).
    - [x] Add CRT scanline and glow effects via CSS filters.
- [ ] **UI Components: Gauges & Metrics**
    - [x] Create `AnalogGauge.tsx` (Futuristic circular power meter).
    - [x] Create `HeatmapWidget.tsx` for multi-sensor distribution views.
    - [x] Build `Sparkline.tsx` for minimalist trend indicators.
- [ ] **Integration: Dashboard & Telemetry**
    - [ ] Register all charts in the `DashboardContext` (Feature 17).
    - [ ] Map `TelemetryContext` (Feature 4) keys to specific visualization inputs.
- [ ] **Refinement: Aesthetics & Interaction**
    - [ ] Implement "Snapshot" feature to capture a chart state as an image.
    - [ ] Add "Zoom & Pan" interaction for logic analyzer timelines.

## Testing Strategy
- **Performance Tests**: Verify 60FPS rendering during high-frequency data injection.
- **Visual Tests**: Playwright screenshots to verify neon theme consistency across different chart types.
