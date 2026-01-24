# Implementation Plan: API Integration Layer (Local Connect)

## 📋 Todo Checklist
- [ ] **Infrastructure: Local API Handlers**
    - [x] Create `services/api/apiDispatcher.ts`.
    - [x] Implement a routing system mapping URLs to application logic (Inventory, Projects, Actions).
    - [x] Create an "Execution Sandbox" for external action triggers.
- [ ] **Core: Service Worker Bridge**
    - [x] Implement a Service Worker or custom `fetch` interceptor to handle `http://local.circuitmind.ai` requests.
    - [x] Add CORS handling for authorized local origins (e.g., localhost).
- [ ] **Security: Token Management**
    - [x] Create `services/api/tokenService.ts`.
    - [x] Implement token generation, storage (IndexedDB), and validation logic.
    - [x] Link token permissions to the RBAC system.
- [ ] **UI: Developer Portal**
    - [x] Build `DeveloperPortal` tab in `SettingsPanel.tsx`.
    - [x] Add "Generate API Token" workflow.
    - [x] Create an interactive "Endpoint Explorer" (Local Swagger).
- [ ] **Refinement: Webhooks & Events**
    - [x] Implement an `EventEmitter` for app-wide lifecycle events.
    - [x] Allow users to register local URLs as Webhook targets.
- [ ] **Verification: External Integration**
    - [x] Create a sample Node.js script that uses the API to list the current inventory.

## Testing Strategy
- **Logic Tests**: Verify token validation and permission enforcement.
- **Integration Tests**: Mock external HTTP requests and ensure they trigger the correct application state changes.
