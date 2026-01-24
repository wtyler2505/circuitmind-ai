# Spec: Predictive Actions (The Proactive Partner)

## Goal
Reduce design friction by anticipating the user's next steps and offering "One-Click" completions for common wiring patterns, safety requirements, and component configuration.

## Background
Currently, the AI is purely reactive—it waits for a chat message. Many electronics design tasks are predictable (e.g., connecting a sensor's VCC to the power rail). This feature surfaces those patterns as interactable "Ghosts" in the workspace.

## Architecture
- **Prediction Loop:** A background service that runs every time the `AIContext` changes (debounced).
- **Staged Actions:** A new category of `AIActions` that are "Proposed" but not "Applied".
- **Ghost Layer:** A dedicated SVG/CSS layer on the canvas for rendering suggested paths and parts without affecting the source-of-truth diagram.

## Prediction Categories
1.  **Connectivity:** "Connect this GND to the common rail?"
2.  **Safety:** "Add a 0.1uF decoupling capacitor here?"
3.  **Config:** "Set all PWM pins to 50% duty cycle?"

## Data Model
```typescript
interface PredictiveAction {
  id: string;
  action: AIAction; // The actual action to execute if accepted
  confidence: number; // 0.0 to 1.0
  reasoning: string; // "Common wiring pattern detected"
  expiresAt?: number;
}
```
