# Implementation Plan: Performance Analytics

## 📋 Todo Checklist
- [ ] **Infrastructure: Metrics Data Store**
    - [x] Upgrade `services/aiMetricsService.ts` to support generic event logging.
    - [x] Implement persistent storage for metrics using IndexedDB.
- [ ] **Logic: Complexity & Utility Analysis**
    - [x] Create `services/analytics/projectAnalyzer.ts`.
    - [x] Implement algorithms for "Connection Density" and "AI Accept/Reject" ratios.
    - [x] Add logic to track project "velocity" (time between milestones).
- [ ] **UI: Analytics Dashboard**
    - [x] Create `components/layout/AnalyticsDashboard.tsx`.
    - [x] Integrate `recharts` for line and spider charts.
    - [x] Build a "Bench Stats" view showing engineering "XP" or progress.
- [ ] **Integration: Global Event Tracking**
    - [x] Update `useAIActions.ts` and `DiagramContext` to report metrics.
    - [x] Add a "Stats" toggle to the `StatusRail`.
- [ ] **Refinement: AI Performance Coaching**
    - [ ] Add `generatePerformanceReport` tool to Gemini.
    - [ ] Let Eve provide sarcastic but data-backed performance reviews (e.g., "You've deleted 40% of my wires. Maybe I should just take a nap?").

## Testing Strategy
- **Unit Tests**: Verify complexity scores are calculated correctly for known diagram patterns.
- **Data Tests**: Ensure metric events persist across page reloads.
