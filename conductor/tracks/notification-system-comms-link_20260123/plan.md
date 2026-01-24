# Implementation Plan: Notification System (Comms Link)

## 📋 Todo Checklist
- [ ] **Infrastructure: Notification Registry**
    - [x] Create `contexts/NotificationContext.tsx` and `useNotify` hook.
    - [x] Define notification types (`info`, `success`, `warning`, `critical`).
    - [x] Implement `pushNotification`, `dismissNotification`, and `clearAll`.
- [ ] **UI: CyberToast Component**
    - [x] Create `components/layout/CyberToast.tsx`.
    - [x] Implement Framer Motion animations (Slide + Glitch effect).
    - [x] Style using `panel-surface`, `cut-corner-sm`, and color-coded neon borders.
    - [x] Add support for "Actionable" buttons inside toasts.
- [ ] **UI: Comms Log Sidebar**
    - [x] Create `components/layout/CommsLog.tsx`.
    - [x] Build a persistent history view of all notifications received during the session.
    - [x] Add filtering by severity.
- [ ] **Integration: Event Emitters**
    - [x] Link `SimulationEngine` to emit `warning`/`critical` on circuit failure.
    - [x] Link `SecurityAuditor` to emit alerts on safety violations.
    - [x] Link `SyncService` to notify on successful cross-platform updates.
- [ ] **Refinement: UX & Audio**
    - [ ] Implement "Smart Grouping" (e.g., "5 similar warnings hidden").
    - [ ] Add optional subtle tech sound effects for critical alerts using Web Audio API.

## Testing Strategy
- **Unit Tests**: Verify the notification stack correctly handles multiple simultaneous pushes.
- **Visual Tests**: Ensure toasts are correctly positioned and don't overlap primary UI controls.
