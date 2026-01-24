# Spec: Error Reporting (Diagnostics Hub)

## Goal
Minimize data loss and engineering downtime by establishing a robust error handling and recovery system that provides AI-powered diagnostics and sanitized bug reporting tools.

## Background
In a complex, local-first application like CircuitMind AI, errors (e.g., failed Three.js renders or AI tool timeouts) are inevitable. A "black hole" where the app just dies is unacceptable. This feature ensures every crash is a learning or recovery opportunity.

## Architecture
- **Proactive Snapshotting**: The application state is mirrored to an ephemeral "Recovery Buffer" in `sessionStorage` to mitigate data loss during hard crashes.
- **Layered Error Catching**: Using React Error Boundaries for UI failures and global listeners for worker/logic failures.
- **Privacy-First Reporting**: Stack traces are scrubbed of sensitive information (filenames, local IDs) before being presented to the user or AI for analysis.

## Data Model
```typescript
interface CaughtError {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string; // React-specific
  timestamp: number;
  recovered: boolean;
}

interface BugBundle {
  error: CaughtError;
  appVersion: string;
  diagramState: string; // Sanitized JSON
  recentLogs: AuditLog[]; // From Feature 26
}
```

## Security & Privacy
- Bug reports remain local unless the user manually copies the text to share it.
- Sanitization logic is mandatory before AI analysis.
