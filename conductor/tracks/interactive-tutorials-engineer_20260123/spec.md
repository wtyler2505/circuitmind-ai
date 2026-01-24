# Spec: Interactive Tutorials (Engineering Bootcamp)

## Goal
Flatten the learning curve for electronics prototyping by providing step-by-step, interactive "Quests" that guide users through building circuits while validating their progress in real-time.

## Background
New users often struggle with knowing where to start or which pins to connect. Standard documentation is static. Interactive Tutorials turn the workspace into a guided learning environment.

## Architecture
- **Step Machine:** A stateful engine that monitors the application state (Diagram, Selection, Mode) against a set of "Success Conditions".
- **Visual Anchoring:** A system to draw user attention to specific parts of the screen (e.g., highlighting the "Add" button when the task is to add a component).
- **Proactive Mentor:** Gemini provides natural language context for each step, explaining *why* certain design choices are made.

## Data Model
```typescript
interface TutorialStep {
  id: string;
  title: string;
  instructions: string;
  mentorTip?: string;
  targetElementId?: string; // For visual anchoring
  condition: (state: AppState) => boolean; // Logic to verify completion
}

interface TutorialQuest {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  steps: TutorialStep[];
}
```

## Security & Privacy
- Progress is stored in `localStorage`.
- No external tracking of tutorial completion without explicit user consent.
