# Data Sovereignty: Local-First Sync

CircuitMind AI is built on the principle of local sovereignty. User data, component libraries, and project files belong to the user and remain on their local hardware.

## Core Pillars

### 1. Local-First Persistence (Hybrid Model)
- **IndexedDB (Large Data):** Used via `partStorageService` for binary FZPZ assets and SVG thumbnails. The underlying Git repository (`isomorphic-git`) also persists packfiles here.
- **Persistent Action Records:** The Undo/Redo stack is backed by IndexedDB, allowing users to revert complex design changes even after a browser restart or cross-device sync.
- **LocalStorage (State & Prefs):** Used for lightweight JSON state including Layout snapshots, UI Modes, Macros, and the Dashboard widget configuration.
- **Git-as-Data:** All application state is serialized to JSON and stored in a local Git repository managed by `isomorphic-git`.
- **Time Machine:** Built-in version control allows users to snapshot their work, undo complex changes, and branch designs.

### 2. Security: Hardware Guard & Multi-User
- **Hardware Guard:** A dual-layer security engine consisting of:
  - **Static Analysis (SAST):** Scans all AI-generated code for forbidden JavaScript globals (`fetch`, `window`, `process`).
  - **Dynamic Electrical Rules:** Real-time logical checks against the `WiringDiagram` to detect physical safety risks (short circuits, overvoltage).
- **Secure Multi-User (RBAC):** Local-only authorization using the Web Crypto API (`subtle.crypto`) to manage hashed PINs. Restricts access to sensitive configurations (API keys) and destructive actions.
- **The Gatekeeper:** A high-z-index interactive barrier that enforces role-based access before UI initialization.

### 3. Cross-Platform P2P Sync
- **P2P Communication:** Direct device-to-device synchronization over LAN using WebRTC or local WebSocket bridges.
- **No-Cloud Default:** Sync occurs without a centralized cloud service, ensuring 100% privacy and offline capability.
- **Encryption:** All sync traffic is secured using a shared "Pairing Key" (numeric or QR code based).

### 3. Data Portability
- **Standard Exports:** Diagrams can be exported as high-resolution SVG, PNG, or manufacturer-ready BOM (Bill of Materials) PDFs.
- **Inventory Backup:** Entire component libraries can be exported/imported as JSON or FZPZ bundles.
