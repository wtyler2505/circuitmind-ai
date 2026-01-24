# Implementation Plan: Logging & Auditing (Black Box)

## 📋 Todo Checklist
- [ ] **Infrastructure: Log Store**
    - [x] Create `services/logging/auditService.ts`.
    - [x] Implement IndexedDB-based storage for high-volume event logging.
    - [x] Add logic for "Log Rotation" (auto-prune old entries after 7 days).
- [ ] **Core: Global Interceptors**
    - [x] Create a `Logger` wrapper that supports tiered levels (`debug`, `info`, `warn`, `error`).
    - [x] Instrument `geminiService.ts` to log all tool calls and AI intent.
    - [x] Instrument `useAIActions.ts` to log every command execution result.
- [ ] **Security: PII Scrubber**
    - [x] Implement a log-masking utility to prevent API keys or user passwords from being stored.
- [ ] **UI: System Log Viewer**
    - [x] Create `components/layout/SystemLogViewer.tsx`.
    - [x] Implement a high-performance virtualized list for log lines.
    - [x] Add filtering by Level and Source (e.g., "AI", "Canvas", "Sync").
- [ ] **Integration: Export & Feedback**
    - [x] Add "Download Log Bundle" for troubleshooting.
    - [x] Allow Gemini to read recent logs to self-diagnose application errors.

## Testing Strategy
- **Performance Tests**: Verify that logging 100 events in a burst does not drop frames.
- **Storage Tests**: Ensure rotation logic correctly caps database size.
