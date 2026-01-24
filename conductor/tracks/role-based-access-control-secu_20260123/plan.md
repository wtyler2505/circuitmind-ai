# Implementation Plan: Role-Based Access Control

## 📋 Todo Checklist
- [ ] **Infrastructure: Local Auth Service**
    - [x] Create `services/authService.ts`.
    - [x] Implement PBKDF2 or similar for local PIN/Password hashing (via subtle crypto).
    - [x] Add `validateSession` logic and session token (local) generation.
- [ ] **Core: Auth Context**
    - [/] Create `contexts/AuthContext.tsx`.
    - [ ] Manage `currentUser` and `isLocked` state.
    - [ ] Implement `login(pin)`, `logout()`, and `resetAuth()` methods.
- [ ] **UI: The Gatekeeper**
    - [ ] Create `components/auth/Gatekeeper.tsx` (The futuristic lock screen).
    - [ ] Implement "Auto-Lock" timer logic in `MainLayout.tsx`.
    - [ ] Add a "Switch User / Lock" button to the `StatusRail`.
- [ ] **Logic: Permission Guarding**
    - [ ] Create `hooks/usePermissions.ts` hook.
    - [ ] Implement `<PermissionGuard />` component to wrap buttons, inputs, and tabs.
    - [ ] Update `useAIActions.ts` to verify role authority before executing any command.
- [ ] **Refinement: Secret Masking & Feedback**
    - [ ] Automatically mask API keys in `SettingsPanel` for non-admin users.
    - [ ] Add "Access Denied" toast messages when a restricted action is attempted.
    - [ ] Implement "Emergency Lock" hotkey (Ctrl+Shift+L).

## Testing Strategy
- **Unit Tests**: Verify hashing logic and role-to-permission mapping.
- **Security Tests**: Ensure that manually invoking actions (via console or hooks) fails if the role is 'observer'.
- **UX Tests**: Verify the lock screen correctly blocks all app interactions until authenticated.
