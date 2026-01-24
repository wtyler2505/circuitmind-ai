# Implementation Plan: Context-Aware Responses

## 📋 Todo Checklist
- [x] **Data Model: Action History**
    - [x] Update `types.ts` to include `ActionDelta` and expand `AIContext`.
    - [x] Create a `historyBuffer` in `AssistantStateContext` or a new hook.
- [x] **Logic: Action Tracking**
    - [x] Update `useAIActions.ts` to push every successful action to the `historyBuffer`.
    - [x] Implement a rolling window (last 10 actions) to prevent context bloat.
- [x] **Integration: Context Building**
    - [x] Refactor `services/aiContextBuilder.ts` to include the `historyBuffer`.
    - [x] Add tracking for "Active Pin" and "Mouse Target" into the context.
- [x] **Prompting: Awareness Instructions**
    - [x] Update Gemini system instructions in `services/geminiService.ts` to prioritize `recentActions`.
    - [x] Implement "Referential Integrity" logic (ensuring AI knows what "this" or "that" refers to).
- [x] **Refinement: UX**
    - [x] Add a "Context Indicator" in the Chat UI showing what the AI is currently "seeing".

## Testing Strategy
- **Unit Tests:** Verify `aiContextBuilder` correctly merges the action history.
- **Integration Tests:** Mock a sequence of UI actions and check the resulting prompt structure.
