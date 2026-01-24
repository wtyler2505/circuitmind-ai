# Spec: Logging & Auditing (Black Box)

## Goal
Establish a comprehensive, local-only audit trail for all application events and AI interactions to ensure technical transparency and facilitate rapid troubleshooting.

## Background
CircuitMind AI performs complex background operations. When an AI connection fails or a diagram becomes corrupted, users need a "Black Box" to see exactly what happened. This is especially critical for a local-first app where no cloud logs exist.

## Architecture
- **Persistent Ring Buffer**: Logs are stored in IndexedDB with a fixed time-to-live (TTL) to prevent storage bloat.
- **AI Instrumentality**: Every request to Gemini and its corresponding tool call is treated as a first-class audit event.
- **Admins-Only Access**: Viewability is gated by the RBAC system to protect engineering history.

## Data Model
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface AuditLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string; // e.g., "gemini-service"
  message: string;
  data?: any; // JSON context
}
```

## Security & Privacy
- Logs are strictly local.
- Secret masking is applied before any string is written to the persistent store.
