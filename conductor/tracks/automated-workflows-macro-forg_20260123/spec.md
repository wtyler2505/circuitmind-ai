# Spec: Automated Workflows (Macro Forge)

## Goal
Enable users to automate repetitive engineering and inventory management tasks using AI-generated or user-recorded "Macros" that execute sequences of application actions.

## Background
Prototyping involves many repetitive clicks (e.g., setting the same value for 10 resistors, or clearing all wires after a failed design iteration). A macro system turns these manual steps into one-click automations.

## Architecture
- **Command Bus:** The existing `AIActions` hook will be utilized as the execution layer.
- **Workflow State:** Macros are defined as JSON arrays of Actions.
- **Recorder:** A global event listener that intercepts `AIAction` dispatches and serializes them.
- **Dry Run Engine:** A visualization layer that shows "Phantom" changes on the canvas before the user commits to a macro execution.

## Data Model
```typescript
interface WorkflowStep {
  id: string;
  action: AIAction;
  description: string;
  condition?: string; // Optional logic for branching
}

interface MacroWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  author: 'user' | 'ai' | 'system';
  created: number;
}
```

## Security & Privacy
- Macros are limited to the pre-defined `AIAction` set.
- Arbitrary code execution is strictly forbidden.
- Macros are stored in the local User Profile.
