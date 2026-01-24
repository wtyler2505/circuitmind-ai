# Spec: Version Control Integration (Time Machine)

## Goal
Provide professional-grade project history management, allowing users to experiment with circuit designs across branches, snapshot key milestones, and visually compare different versions of a diagram.

## Background
Engineering is an iterative process. Users often want to "try something out" without breaking their current working design. This feature exposes the underlying Git engine to provide a powerful safety net.

## Architecture
- **History Engine:** Uses `isomorphic-git` to track changes to the project's JSON state.
- **Visual Comparison:** A specialized diffing algorithm that identifies changes in component IDs, types, positions, and connections.
- **Iterative UI:** A non-destructive "Preview Mode" that allows users to look at historical commits before deciding to revert.

## Data Model
```typescript
interface CommitMetadata {
  hash: string;
  author: string;
  message: string;
  timestamp: number;
}

interface DiagramDiff {
  added: { components: string[]; connections: number[] };
  removed: { components: string[]; connections: number[] };
  modified: { components: string[] }; // e.g., position or prop changes
}
```

## Security & Privacy
- History remains entirely local in the browser's IndexedDB.
- Git messages are only sent to Gemini if the user requests AI-generated commit summaries.
