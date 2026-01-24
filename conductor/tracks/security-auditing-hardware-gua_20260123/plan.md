# Implementation Plan: Security Auditing (Hardware Guard)

## 📋 Todo Checklist
- [ ] **Infrastructure: Security Auditor Service**
    - [x] Create `services/securityAuditor.ts`.
    - [x] Define `SecurityViolation` and `Severity` types.
    - [x] Implement a registry of "Safety Rules" (e.g., Short circuit, Overvoltage).
- [ ] **Logic: AI Code Scanning**
    - [x] Refactor `ThreeViewer.tsx` blocked token check into `securityAuditor.ts`.
    - [x] Implement `scanAIGeneratedCode(code: string)` with enhanced regex and heuristic checks.
- [ ] **Logic: Electrical Safety Audit**
    - [x] Implement `auditCircuitSafety(diagram: WiringDiagram)`.
    - [x] Create checks for GND-VCC shorts and Pin Voltage mismatches (requires basic simulation data).
- [ ] **UI: Security Dashboard**
    - [x] Create `components/layout/SecurityReport.tsx` modal.
    - [x] Build a "Security Shield" icon component for the `AppHeader`.
    - [x] Implement pulsing "Warning" states when high-severity violations are found.
- [ ] **Refinement: Intelligent Review**
    - [ ] Add `performSecurityReview` tool to `geminiService.ts`.
    - [ ] Allow users to request an AI-deep-dive into specific security concerns.
- [ ] **Integration: HUD Warnings**
    - [x] Link `securityAuditor` to the `HUDContext` to show real-time safety warnings on the canvas.

## Testing Strategy
- **Unit Tests:** Verify that known malicious code strings (e.g., accessing `localStorage`) are correctly flagged.
- **Safety Tests:** Verify that a diagram with a direct VCC-to-GND short triggers a 'High' severity alert.
