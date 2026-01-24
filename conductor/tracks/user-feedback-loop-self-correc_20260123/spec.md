# Spec: User Feedback Loop (Self-Correction)

## Goal
Improve AI accuracy and alignment with user preferences by capturing explicit feedback and technical corrections, then utilizing that data to "train" the local AI persona in real-time.

## Background
Generic LLMs often make domain-specific mistakes (e.g., wrong pin numbers for a niche ESP32 variant). Currently, these mistakes are repeated. This feature allows the user to teach the AI, turning Eve into a truly bespoke engineering partner.

## Architecture
- **Reinforcement Dataset**: A local repository of "Positive" and "Negative" examples of AI output.
- **Few-Shot Prompting Engine**: Dynamically selects the top 3-5 most relevant "Lessons" from the local store and injects them into the system prompt as "Few-Shot" examples.
- **Implicit Learning**: A background service that monitors user edits to AI-proposed diagrams, logging the "Difference" as a preference signal.

## Data Model
```typescript
interface InteractionLesson {
  id: string;
  contextType: 'wiring' | 'chat' | '3d';
  userPrompt: string;
  originalResponse: string;
  correction: string;
  tags: string[]; // e.g., ["esp32", "pinout"]
}

interface UserPreferenceSignal {
  type: 'color' | 'placement' | 'component_choice';
  pattern: any;
  strength: number; // Increment on every repeated user action
}
```

## Security & Privacy
- Training data is stored locally.
- Corrections are only sent to Gemini as part of the prompt context for the user's future turns.
