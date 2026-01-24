# Spec: API Integration Layer (Local Connect)

## Goal
Enable external software, scripts, and devices to interact with the CircuitMind AI workbench programmatically via a secure, local-first API.

## Background
Power users often have external tools (component counters, spreadsheets, custom firmware uploaders) that need to "talk" to their design workbench. An API turns CircuitMind into an extensible hub for electronics engineering.

## Architecture
- **Virtual API**: A browser-resident API layer using Service Workers to intercept and handle requests without requiring a heavy backend server.
- **Action Mapping**: Direct translation of REST-style endpoints (`POST /v1/actions`) into the existing `useAIActions` command set.
- **Secure Tokens**: Local-only, cryptographically signed tokens that authorize specific scripts to access diagram or inventory data.

## Data Model
```typescript
interface APIToken {
  id: string;
  name: string;
  secret: string; // Only shown once
  role: 'admin' | 'engineer'; // Inherited from RBAC
  createdAt: number;
}

interface Webhook {
  id: string;
  url: string;
  events: ('save' | 'simulation_pass' | 'low_stock')[];
}
```

## Security & Privacy
- API is strictly bound to the local machine and authorized origins.
- All requests are logged in the `Logging & Auditing` (Feature 26) system.
- Tokens can be instantly revoked by the user.
