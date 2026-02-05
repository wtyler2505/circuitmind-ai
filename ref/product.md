# CircuitMind AI - Product Reference

## Vision Statement

CircuitMind AI is an intelligent, futuristic workspace for electronics prototyping that bridges physical components and digital planning through high-fidelity, AI-assisted design.

### Core Values

| Value | Meaning |
|-------|---------|
| **Local-First** | Privacy-first, offline-capable, zero telemetry |
| **Craftsmanship** | Technical correctness over speed |
| **Cyberpunk UX** | "Neon-Dark" aesthetic, industrial slab geometry |

### Boundaries

**In-Scope:**
- AI-generated wiring diagrams (Gemini-powered)
- High-fidelity FZPZ component management
- Real-time logic and nodal simulation
- 3D visualization of circuits
- Local-first persistence via IndexedDB/Git-as-data

**Out-of-Scope:**
- Cloud-only storage (unless explicitly requested)
- High-voltage simulation (>50V DC)
- Full mechanical CAD

---

## Five Product Suites

### 1. Intelligence Suite (Eve)

**Purpose**: AI-powered design assistance with deep workspace awareness

| Feature | Description |
|---------|-------------|
| Deep Context Awareness | Tracks user actions, viewport state, selection |
| Proactive Assistance | Suggests next steps before user asks |
| Safety Audits | Real-time short circuit & polarity warnings |
| Circuit Synthesis | Natural language → wiring diagram |
| Smart Metadata | Datasheet scraping for component specs |

**Personality**: Sarcastic, reluctant genius, technically precise

### 2. Visual Suite

**Purpose**: High-fidelity circuit representation in 2D and 3D

| Feature | Description |
|---------|-------------|
| Fritzing Parity | Official .fzpz SVGs, 0.1" grid |
| Bézier Wiring | Natural cable slack appearance |
| Smart Breadboard | Internal bus logic, rail awareness |
| 3D Visualization | Three.js component geometry |
| Tactical HUD | Real-time data overlays |
| Neural-Link | MediaPipe hand gesture control |

### 3. Simulation Suite

**Purpose**: Real-time electrical verification before physical assembly

| Feature | Description |
|---------|-------------|
| Nodal Solver | DC analysis in Web Worker |
| Logic Propagation | HIGH/LOW/FLOATING states |
| Circuit Eye | Rule-based safety heuristics |
| Live State HUD | Visual LED updates, flow indicators |
| Short Circuit Detection | Immediate RED alerts |

**Safety Heuristics:**
- Mixed voltage detection (3.3V/5V)
- LED current limiting check
- MCU power pin verification
- Floating component detection

### 4. Sovereignty Suite

**Purpose**: Local ownership of all user data

| Feature | Description |
|---------|-------------|
| Hybrid Persistence | IndexedDB (binary) + localStorage (prefs) |
| Git-as-Data | isomorphic-git for version control |
| Time Machine | Branching, undo across sessions |
| Hardware Guard | SAST + dynamic safety rules |
| RBAC | PIN-based access control |
| P2P Sync | LAN-only, no cloud required |

### 5. Education Suite

**Purpose**: Transform workspace into learning environment

| Feature | Description |
|---------|-------------|
| Interactive Quests | State-validated tutorials |
| Step Machine | Success condition checking |
| Proactive Mentorship | Eve explains "why" |
| Pinout Exploration | Educational HUD on hover |
| Quest Registry | "Blink LED" to "ESP32 WiFi" |

---

## Functional Requirements

### Component & Asset Management

- [x] Import custom .fzpz files with auto-normalization
- [x] IndexedDB persistence for binary assets
- [x] Thumbnail caching for instant hydration
- [x] Smart search with categorical filtering

### Intelligence & Interaction

- [x] Eve has temporal awareness of user history
- [x] AI can inject highlights and pan canvas
- [x] Smart metadata extraction from datasheets
- [x] Proactive suggestions based on state

### Simulation & Logic

- [x] Nodal analysis in Web Worker
- [x] Immediate visual feedback for logic states
- [x] Short circuit and polarity warnings

### P2P Sync & Versioning

- [x] LAN sync without central server
- [x] Branching and undo via Git-as-data
- [ ] P2P discovery hardening (in progress)

---

## Non-Functional Requirements

| Metric | Target |
|--------|--------|
| Canvas FPS | 60 FPS with <50 components |
| Inventory Hydration | <100ms (manifest-first) |
| Theme Consistency | Neon-Cyber across all subsystems |
| Privacy | 100% telemetry-free |

---

## User Experience Principles

### Information Architecture

- **Instant Discovery**: Sidebar inventory loads with thumbnails immediately
- **Deep Intelligence**: Eve knows imported parts without prior training
- **Sovereign Library**: Users build local part repositories

### Visual Hierarchy

```
Canvas (z-0) < Header (z-10) < Chat (z-20) < Inventory (z-40) < Modals (z-50)
```

### Interaction Patterns

| Pattern | Behavior |
|---------|----------|
| Component selection | Single click highlights |
| Component edit | Double click opens editor |
| Wire creation | Drag from pin to pin |
| Pan | Middle mouse or spacebar+drag |
| Zoom | Scroll wheel or pinch |
| Neural-Link | Pinch=select, Palm=pan, Swipe=tab |

---

## Feature Status

### Completed (✅)

- God-Tier FZPZ asset integration
- Manifest-first inventory hydration
- Deep AI context awareness
- Proactive suggestions
- Real-time simulation
- Glass surface UI system
- Neural-Link gestures
- 3D component generation
- Voice I/O integration

### In Progress (🟡)

- P2P discovery hardening
- Screenshot recapture (Playwright blocked)
- Icon label/tooltip audit

### Planned (📋)

- Quest registry expansion
- Advanced simulation models
- Cross-platform sync improvements

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/00-context/vision.md` | Full vision statement |
| `docs/01-product/prd.md` | Complete requirements |
| `docs/02-features/*.md` | Feature specifications |
| `docs/03-logs/decisions-log.md` | Architectural decisions |
| `docs/04-process/dev-workflow.md` | Development process |
