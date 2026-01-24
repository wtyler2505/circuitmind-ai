# Implementation Plan: User Feedback Loop (Self-Correction)

## 📋 Todo Checklist
- [ ] **Infrastructure: Interaction Store**
    - [x] Create `services/feedback/correctionService.ts`.
    - [x] Implement IndexedDB storage for "Successful Interaction" and "Correction" pairs.
    - [x] Add logic to export these pairs as JSONL for potential fine-tuning.
- [ ] **UI: Interaction Rating**
    - [x] Add Thumbs Up/Down buttons to `components/ChatMessage.tsx`.
    - [x] Build a "Fix Response" modal where users can provide the correct technical answer.
    - [x] Add "Style Preference" toggle (e.g., "I like this wiring style").
- [ ] **Logic: Corrective Reinforcement**
    - [x] Update `services/geminiService.ts` to support dynamic "Lesson Injection".
    - [x] Implement `getLessonsForContext(userMessage)` to fetch relevant past corrections.
    - [x] Add "Correction Turn" logic: when a user gives a downvote + text, instantly re-prompt AI with "User correction: [text]".
- [ ] **AI Integration: Style Learning**
    - [x] Implement a background analyzer that compares AI-generated diagrams with the user's final modified version.
    - [x] Save these "User Preferences" (e.g., "Tyler always uses Blue for Data wires") to the User Profile.
- [ ] **Refinement: HUD Integration**
    - [x] Add a "Teach AI" button to the Tactical HUD (Feature 1) for specific components.

## Testing Strategy
- **Logic Tests**: Verify that corrective lessons are correctly stored and retrieved based on keyword relevance.
- **Integration Tests**: Verify that "Correct and Retry" results in a new AI message acknowledging the fix.
