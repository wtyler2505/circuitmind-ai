# Implementation Plan: Configuration Management (CircuitMind Dotfiles)

## 📋 Todo Checklist
- [ ] **Infrastructure: Configuration Service**
    - [x] Create `services/config/configManager.ts`.
    - [x] Implement `serializeAppState()` to gather data from all Contexts.
    - [x] Implement `applyAppState(config)` to restore application state.
- [ ] **Core: Format & Validation**
    - [x] Add `js-yaml` for YAML export/import support.
    - [x] Define a JSON Schema for workspace configurations.
    - [x] Implement a validation utility to sanitize imported files.
- [ ] **Security: Secret Scrubbing**
    - [x] Create `scrubSecrets(config)` utility to remove API keys and local passwords.
    - [x] Add "Include Secrets" checkbox with warning for manual exports.
- [ ] **UI: Configuration Portal**
    - [x] Build `ConfigPortal` in `SettingsPanel.tsx`.
    - [x] Add "Export Dotfile" and "Import Dotfile" buttons.
    - [x] Implement "Environment Profile" switcher (e.g., Home vs. Office).
- [ ] **Integration: Git Versioning**
    - [x] Hook into the `SyncService` to auto-commit configuration changes to a `config` branch.
- [ ] **Refinement: Defaults & Standards**
    - [ ] Add support for "Engineering Defaults" (e.g., standard voltage, preferred packages).

## Testing Strategy
- **Unit Tests**: Verify serialization correctly captures state from all contexts.
- **Robustness Tests**: Attempt to import corrupted or partial YAML files and ensure graceful failure.
