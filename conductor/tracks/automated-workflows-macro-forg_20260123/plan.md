# Implementation Plan: Automated Workflows (Macro Forge)

## 📋 Todo Checklist
- [ ] **Infrastructure: Command Interpreter**
    - [x] Create `services/macroEngine.ts`.
    - [x] Implement `executeWorkflow(actions: AIAction[])`.
    - [ ] Add support for "Delay" and "Condition" steps in workflows.
- [ ] **Logic: Batch Action Support**
    - [x] Update `hooks/useAIActions.ts` to support atomic batch updates.
    - [ ] Implement a "Dry Run" state that returns expected diagram changes without applying them.
- [ ] **UI: Macro Manager**
    - [x] Create `components/inventory/WorkflowPanel.tsx`.
    - [x] Implement a "Record" button that captures user actions into a list.
    - [ ] Build a simple workflow editor (Reorder/Delete steps).
- [ ] **AI Integration: AI Scripting**
    - [ ] Add `authorMacro` tool to `geminiService.ts`.
    - [ ] Prompt Gemini to output JSON-based workflows for user requests (e.g., "Standardize all component IDs").
- [ ] **Refinement: Library & Safety**
    - [ ] Create a library of "Standard Macros" (e.g., "Cleanup Wires", "Check All Datasheets").
    - [ ] Implement a "Changes Preview" modal before running high-impact macros.

## Testing Strategy
- **Unit Tests:** Verify `macroEngine` executes sequences in order.
- **Safety Tests:** Ensure macros cannot execute blocked/malicious code (sandbox check).
