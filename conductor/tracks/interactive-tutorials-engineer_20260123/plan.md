# Implementation Plan: Interactive Tutorials

## 📋 Todo Checklist
- [ ] **Infrastructure: Tutorial State**
    - [x] Create `contexts/TutorialContext.tsx` and `useTutorial` hook.
    - [x] Define state for `activeQuest`, `currentStepIndex`, and `completedSteps`.
    - [x] Implement `startQuest`, `nextStep`, and `completeQuest`.
- [ ] **Data Model: Quest Definition**
    - [x] Create `data/tutorials/index.ts` to export available tutorials.
    - [x] Define JSON schema for tutorials (Steps with "Condition" logic).
    - [x] Author "Project Alpha: Blinking LED" as the first tutorial.
- [ ] **UI: Mentor Overlay & Navigation**
    - [x] Create `components/layout/MentorOverlay.tsx`.
    - [x] Build a "Step Checklist" component that updates in real-time.
    - [ ] Add "Visual Anchors" (glowing pulse) to target UI elements using refs.
- [ ] **Logic: Real-Time Validation**
    - [x] Create `services/tutorialValidator.ts`.
    - [x] Implement logic to check if current diagram/inventory matches step requirements.
    - [x] Add a `useEffect` in `MainLayout` to trigger validation on diagram changes.
- [ ] **Integration: Learning Center**
    - [x] Create a "Bootcamp" tab in `AssistantSidebar`.
    - [x] List available tutorials with difficulty levels and estimated time.
- [ ] **Refinement: UX & Encouragement**
    - [ ] Add reward animations (e.g., green flash or confetti) on step completion.
    - [x] Integrate Gemini to provide "Mentor Tips" for the active step.

## Testing Strategy
- **Unit Tests:** Verify `tutorialValidator` correctly detects "State Matches".
- **Integration Tests:** Playthrough a mock tutorial to ensure state advances correctly.
