# Spec: Context-Aware Responses (Deep Awareness)

## Goal
Enable the AI assistant to provide ultra-relevant answers by feeding it a rich, live-updating snapshot of the user's workspace, recent actions, and specific focus points (like selected pins).

## Background
Current AI responses are aware of the *current* diagram but lack *temporal* context. If a user says "Undo that last wire," the AI doesn't always know which wire was the "last" one. This track adds historical and interaction-level awareness.

## Architecture
- **History Buffer:** A lightweight store tracking the last N user actions (e.g., `added resistor`, `connected pin 5`).
- **Context Augmentation:** The `aiContextBuilder` will now pull from the history buffer, the current selection, and the active mode.
- **Smart System Prompt:** A hierarchical prompt structure that weights "Current Focus" (Selection) > "Immediate History" (Actions) > "Global State" (Diagram).

## Data Model
```typescript
interface ActionDelta {
  timestamp: number;
  type: string;
  targetId?: string;
  description: string;
}

interface EnhancedAIContext extends AIContext {
  recentHistory: ActionDelta[];
  activeSelectionPath?: string; // e.g., "esp32-1.pins.GPIO13"
}
```
