# Implementation Plan: Error Reporting (Diagnostics Hub)

## 📋 Todo Checklist
- [ ] **Infrastructure: Crash Recovery**
    - [x] Update `components/ErrorBoundary.tsx` to support a "Safe Mode" boot.
    - [x] Implement a `sessionStorage` fallback that autosaves the `WiringDiagram` on every change.
    - [x] Add a "Restore from Recovery" button to the crash screen.
- [ ] **Core: Diagnostics Service**
    - [x] Create `services/error/diagnosticsHub.ts`.
    - [x] Implement a global `window.onerror` and `unhandledrejection` listener.
    - [x] Aggregate caught errors into the `Logging & Auditing` system (Feature 26).
- [ ] **Logic: Sanitization & Export**
    - [x] Implement `sanitizeStack(stack: string)` to remove local user paths.
    - [x] Build the `BugReportBundle` generator (JSON containing Diagram + Logs + Environment Info).
- [ ] **AI Integration: Auto-Diagnosis**
    - [ ] Create `analyzeErrorStack` tool in `geminiService.ts`.
    - [ ] Allow the AI to suggest specific fixes (e.g., "This error is usually caused by a circular component dependency").
- [ ] **UI: Diagnostics View**
    - [x] Build a "System Health & Issues" tab in Settings.
    - [x] Display a list of recent "Silent Errors" (background failures).
- [ ] **Verification: Stress Test**
    - [ ] Create a test component that triggers different error types (Sync, Sim, UI) and verify reporting.

## Testing Strategy
- **Recovery Tests**: Verify that a forced page reload during an error correctly recovers the last valid diagram state.
- **Privacy Tests**: Ensure that generated bug reports do NOT contain the `GEMINI_API_KEY`.
