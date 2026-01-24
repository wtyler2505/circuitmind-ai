# Spec: System Health Monitoring (Vitals)

## Goal
Ensure a smooth, professional engineering experience by monitoring application performance and hardware resources, providing real-time feedback and automatic optimizations when system limits are approached.

## Background
CircuitMind AI uses heavy 3D rendering (Three.js) and large AI contexts. On some machines, this can lead to "UI Jank" or memory exhaustion. This track provides visibility and safety nets for these resource-intensive tasks.

## Architecture
- **Passive Collection:** A background loop that samples FPS and memory every 1000ms.
- **Hook-based Latency:** Wrapped AI calls that report duration to the health registry.
- **Adaptive Quality:** A feedback loop that modifies CSS variables and Three.js settings based on current performance.

## Data Model
```typescript
interface HealthMetrics {
  fps: number;
  memoryUsed: number; // MB
  memoryLimit: number; // MB
  aiLatency: number; // ms (last request)
  status: 'healthy' | 'warning' | 'critical';
}

interface PerformanceThresholds {
  minFps: number;
  memoryWarningPercent: number;
  latencyCriticalMs: number;
}
```

## Security & Privacy
- All monitoring is client-side.
- No hardware serial numbers or PII are collected.
- Data is only used locally to optimize the immediate session.
