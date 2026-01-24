# Implementation Plan: AI-Assisted Debugging (Circuit Eye)

## 📋 Todo Checklist
- [ ] **Infrastructure: Vision Bridge**
    - [x] Create `services/visionAnalysisService.ts`.
    - [x] Implement `captureBenchSnapshot()` using the browser Webcam API.
    - [x] Add image compression/resizing to fit Gemini Vision constraints.
- [ ] **Logic: Comparison Engine**
    - [x] Implement `compareRealityToPlan` prompt template.
    - [x] Logic to bundle the current `WiringDiagram` (JSON) with the captured image.
    - [x] Implement parsing for AI-identified coordinates or pin mismatches.
- [ ] **UI: Debug Workbench**
    - [x] Create `components/layout/DebugWorkbench.tsx`.
    - [x] Build a "Live Sight" webcam preview with a "Analyze Circuit" button.
    - [x] Add side-by-side view for "Captured Frame" vs "Digital Diagram".
- [ ] **Visuals: Canvas Mismatch Markers**
    - [x] Create `components/diagram/MismatchMarker.tsx`.
    - [x] Update `DiagramCanvas.tsx` to render red pulsing "Fix Here" indicators.
    - [x] Implement "Probe Suggestion" highlights (glowing points for multimeter use).
- [ ] **Refinement: Interactive Troubleshooting**
    - [x] Integrate a "Diagnostic Mode" in `ChatPanel`.
    - [x] Add "Eve's Critique" - sarcastic feedback on physical wiring neatness.
    - [x] Implement "Checklist of Fixes" based on AI report.

## Testing Strategy
- **Unit Tests:** Verify image capture and payload bundling logic.
- **Integration Tests:** Use a static "mismatched" photo to verify AI identifies the correct pin error.
