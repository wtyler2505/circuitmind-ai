# Implementation Plan: Version Control Integration

## 📋 Todo Checklist
- [ ] **Core Service: Git Operations**
    - [x] Create `services/gitService.ts` (extending the sync service).
    - [x] Implement `getProjectHistory()`, `createBranch()`, and `switchBranch()`.
    - [x] Implement `createCheckpoint(message: string)` for manual snapshots.
- [ ] **Logic: Visual Diffing**
    - [x] Create `services/diagramDiff.ts`.
    - [x] Implement object-level comparison for `components` and `connections`.
    - [x] Generate a `DiffSet` (Added, Removed, Modified).
- [ ] **UI: Project Timeline**
    - [x] Create `components/layout/ProjectTimeline.tsx`.
    - [x] Build a vertical history view with commit timestamps and messages.
    - [x] Add "Revert" and "Compare" buttons to history entries.
- [ ] **Visuals: Diff Overlay**
    - [x] Create `components/diagram/DiffOverlay.tsx`.
    - [x] Implement "Ghost" rendering for removed components (red/dashed).
    - [x] Implement "Pulse" rendering for added/modified components (green/solid).
- [ ] **Integration: Workflow**
    - [x] Add branch selector and "Checkpoint" button to `AppHeader.tsx`.
    - [x] Integrate timeline into the `AssistantSidebar`.
- [ ] **Refinement: AI Integration**
    - [x] Add `summarizeChanges` tool to Gemini.
    - [x] Let Gemini write the commit messages based on the diff (e.g., "AI Summary: Replaced ESP32 with Arduino Nano").

## Testing Strategy
- **Logic Tests:** Verify diffing engine correctly identifies a moved component as "Modified".
- **Git Tests:** Verify branch switching correctly updates the global `DiagramContext`.
