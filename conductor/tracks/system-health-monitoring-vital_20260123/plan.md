# Implementation Plan: System Health Monitoring

## 📋 Todo Checklist
- [ ] **Core Service: Health Monitor**
    - [x] Create `services/healthMonitor.ts`.
    - [x] Implement FPS calculation using `requestAnimationFrame`.
    - [x] Implement memory tracking using `performance.memory` (where supported).
    - [x] Implement AI Latency tracking by hooking into `geminiService` calls.
- [ ] **Infrastructure: Health State**
    - [x] Create `contexts/HealthContext.tsx` and `useHealth` hook.
    - [x] Define thresholds for "Healthy", "Warning", and "Critical" states.
- [ ] **UI: Vitals Dashboard**
    - [x] Create `components/layout/SystemVitals.tsx`.
    - [x] Build a minimalist "Sparkline" or "Pulse" indicator for the `StatusRail`.
    - [ ] Add a "Detailed Stats" tooltip showing memory, draw calls, and latency.
- [ ] **Logic: Auto-Degradation Engine**
    - [x] Implement "Low Performance Mode" toggle in `LayoutContext`.
    - [x] Automatically disable heavy CSS filters (glows, blurs) when FPS < 30.
    - [ ] Alert user when JS Heap exceeds 80% of limit.
- [ ] **Refinement: Diagnostic AI**
    - [ ] Add `analyzeSystemHealth` tool to Gemini.
    - [ ] Let Eve provide sarcastic advice when the user's computer is struggling (e.g., "Your GPU is screaming. Maybe fewer neon glows?").

## Testing Strategy
- **Unit Tests:** Verify health thresholds trigger correct state changes.
- **Stress Tests:** Simulate heavy scene load and verify auto-degradation fires.
