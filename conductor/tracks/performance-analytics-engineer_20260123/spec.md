# Spec: Performance Analytics (Engineering Efficiency)

## Goal
Quantify the prototyping process to help users understand their engineering velocity, the utility of AI assistance, and project complexity growth over time.

## Background
Currently, we have basic metrics for AI latency. This feature expands that into a full-scale analytics suite that tracks "Engineering XP", AI hallucination rates, and design iteration cycles.

## Architecture
- **Event Hooking**: A global middleware or hook that intercepts key actions (add, connect, delete, revert) and logs them to a persistent metrics store.
- **Complexity Analyzer**: A service that calculates "Design Density" based on component count and connection paths.
- **Visualization Layer**: Using `Recharts` to render futuristic data visualizations within the UI.

## Data Model
```typescript
interface EngineeringMetric {
  id: string;
  projectId: string;
  timestamp: number;
  metricType: 'ai_utility' | 'design_complexity' | 'iteration_time';
  value: number;
  metadata: Record<string, any>;
}

interface ProjectScorecard {
  totalComponents: number;
  connectionDensity: number;
  aiAcceptanceRate: number;
  timeToFirstSimulation: number;
}
```

## Security & Privacy
- All metrics are stored locally in IndexedDB.
- No raw circuit data is sent to external analytics servers.
- AI analysis of performance is done using the configured Gemini key.
