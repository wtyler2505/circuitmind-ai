# Spec: Notification System (Comms Link)

## Goal
Provide a unified, aesthetically consistent communication layer that surfaces critical system events, AI insights, and task progress without interrupting the user's focus.

## Background
CircuitMind AI handles many background tasks (Sync, Simulation, AI Reasoning). Users need a centralized way to receive feedback on these tasks. Generic browser alerts are too jarring; a custom "Comms Link" fits the cyberpunk narrative.

## Architecture
- **Centralized Event Bus**: A React Context that listens for internal system events and manages a queue of visible toasts.
- **Actionable Alerts**: Notifications that allow the user to jump directly to the source of the problem (e.g., a specific component) or trigger a fix (e.g., "AI, fix this short").
- **Persistence**: While toasts are ephemeral, the "Comms Log" provides a durable history for the duration of the application session.

## Data Model
```typescript
type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

interface AppNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // ms until auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
  linkedObjectId?: string; // e.g., componentId for jumping to canvas
}
```

## Security & Privacy
- Notifications are managed locally.
- No notification content is shared with external services.
