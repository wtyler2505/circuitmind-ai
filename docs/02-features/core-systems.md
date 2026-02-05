# Core Systems: Health, Comms & Analytics

The Core Systems provide the "under-the-hood" infrastructure that keeps the workspace stable, responsive, and measurable.

## Core Pillars

### 1. System Health Monitoring (Vitals)
- **Real-time Diagnostics:** Monitors IndexedDB usage, Web Worker latency, and memory consumption.
- **Self-Healing:** Automatically attempts to clear corrupted local storage or re-initialize the Git repository if integrity checks fail.

### 2. Notification System (Comms Link)
- **Contextual Alerts:** A hierarchical messaging system that delivers simulation results, sync status, and AI suggestions without interrupting the design flow.
- **Persistent Logs:** Tracks session-level events for auditing and troubleshooting.

### 3. Performance Analytics (Engineering XP)
- **Velocity Tracking:** Quantifies engineering speed and design iteration cycles using `Recharts`.
- **AI Utility Metrics:** Tracks the acceptance rate of AI-suggested wires and components to improve the local synthesis models.
- **Design Density:** Calculates circuit complexity based on connection paths and nodal counts.

### 4. Search & Indexing (Global Archive)
- **MiniSearch Engine:** Client-side, lightning-fast text search with fuzzy matching and prefix support.
- **Categorical Mapping:** Maps components, diagrams, and previous AI chat insights into a queryable "Command Center."
- **Web Worker Orchestration:** Offloads indexing heavy-lifting to background threads to maintain 60FPS UI performance.
