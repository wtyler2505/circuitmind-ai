# Spec: Configuration Management (CircuitMind Dotfiles)

## Goal
Enable users to manage their entire CircuitMind AI environment as a portable, version-controlled configuration file ("Dotfile"), allowing for environment switching and easy setup on new machines.

## Background
Power users often have specific UI layouts, AI personality tweaks, and custom macros that make them productive. Losing these settings on a new device or browser is frustrating. This feature turns the "Setup" into "Code".

## Architecture
- **Global Serializer**: A centralized manager that requests snapshots from each React Context (Layout, Assistant, User, etc.).
- **Portable Format**: Configurations are stored in YAML for human readability and ease of editing.
- **Environment Profiles**: Allowing the application to hold multiple configuration sets, swapping them instantly (e.g., "Minimal Design" mode vs. "Heavy Debug" mode).

## Data Model
```typescript
interface WorkspaceConfig {
  version: string;
  metadata: {
    name: string;
    environment: 'home' | 'work' | 'lab';
  };
  ui: LayoutSnapshot; // From Feature 2
  ai: {
    persona: string;
    defaultModel: string;
    maxTokens: number;
  };
  standards: {
    logicVoltage: number;
    preferredResistorPackage: string;
  };
  macros: MacroWorkflow[]; // From Feature 11
}
```

## Security & Privacy
- Sensitive keys are scrubbed by default.
- Configuration files are stored locally and only shared if the user manually exports them.
