# Development Workflow

## Track Lifecycle

1.  **Define:** Create a new track folder in `conductor/tracks/` with `spec.md` and `plan.md`.
2.  **Approve:** Review the plan with the user (Tyler).
3.  **Implement (TDD):**
    - Write/Update Tests (Vitest/Playwright).
    - Implement features.
    - Verify against tests (`npm run test`).
4.  **Refine:** Lint (`npm run lint`) and Format (`npm run format`).
5.  **Complete:** Mark track as done and commit.

## Testing Strategy
- **Unit Tests:** Required for all new logic/hooks.
- **Visual Tests:** Required for UI components using Playwright.
- **Coverage:** Aim for high coverage on core services and hooks.
