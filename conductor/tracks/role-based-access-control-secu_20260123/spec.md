# Spec: Role-Based Access Control (Secure Multi-User)

## Goal
Establish a secure, local-only authorization framework that allows the user to define roles and restrict access to sensitive configurations (API keys) and destructive actions (deleting projects).

## Background
As CircuitMind AI becomes more capable, it handles increasingly valuable data (custom components, complex designs) and sensitive secrets (Gemini API keys). RBAC allows the "Owner" to let others view or interact with the workbench without risk of compromise or data loss.

## Architecture
- **Local Authority**: A client-side service utilizing the Web Crypto API (`subtle.crypto`) to manage hashed PINs/Passwords.
- **Declarative Permissions**: A centralized mapping of user roles to specific functional capabilities.
- **Interactive Barrier**: The "Gatekeeper" component acts as a high-z-index overlay that prevents UI interaction until a valid session is established.

## Data Model
```typescript
type UserRole = 'admin' | 'engineer' | 'observer';

interface Permissions {
  canEditInventory: boolean;
  canModifyDiagram: boolean;
  canViewAPIKeys: boolean;
  canDeleteData: boolean;
}

interface AuthState {
  user: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
  isLocked: boolean;
  permissions: Permissions;
}
```

## Security & Privacy
- Credentials are never sent to a server; hashing and validation happen 100% in the user's browser.
- Session tokens are short-lived and stored in memory-only (cleared on tab close).
