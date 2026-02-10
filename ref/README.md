# CircuitMind AI - Master Reference Index

> **AI-powered electronics prototyping workspace with God-Tier Fritzing asset fidelity**

## Quick Navigation

| Need to... | Go to |
|------------|-------|
| Understand the system | [architecture.md](./architecture.md) |
| Work with components | [components.md](./components.md) |
| Use React contexts | [contexts.md](./contexts.md) |
| Use custom hooks | [hooks.md](./hooks.md) |
| Call AI services | [services.md](./services.md) |
| Understand data shapes | [types.md](./types.md) |
| Avoid common bugs | [pitfalls.md](./pitfalls.md) |
| Follow design patterns | [patterns.md](./patterns.md) |
| Design system & CSS | [design-system.md](./design-system.md) |
| Performance & bundling | [performance.md](./performance.md) |
| Deploy the app | [deployment.md](./deployment.md) |
| CI/CD & security | [ci-cd.md](./ci-cd.md) |
| Run visual audits | [visual-analysis-tools.md](./visual-analysis-tools.md) |

---

## Project Identity

**Vision**: A futuristic, AI-assisted electronics design workspace that prioritizes:
- **Local-First**: 100% privacy, offline-capable, no telemetry
- **Craftsmanship**: Technical correctness over speed
- **Cyberpunk UX**: "Neon-Dark" aesthetic with hard edges and glass surfaces

**Tech Stack**:
- Frontend: React 19 + TypeScript 5.8 + Vite 6
- Backend: Express 5 + better-sqlite3 (port 3001)
- AI: Google Gemini (2.5 Pro/Flash, Imagen 3, Veo 2, TTS) via @google/genai 1.34
- 3D: Three.js 0.182
- Collaboration: Yjs 13.6 + y-webrtc (CRDT)
- Storage: IndexedDB + localStorage (client), SQLite (server)
- State: React Context API (20 providers nested in App.tsx)

---

## System Architecture

### Five Subsystems

| System | Purpose | Status |
|--------|---------|--------|
| **Asset Engine** | FZPZ loading, SVG rendering, IndexedDB caching | Complete |
| **Intelligence Engine** | Eve AI, deep awareness, proactive suggestions | Complete |
| **Visual Engine** | 2D SVG canvas, 3D Three.js, wiring | Complete |
| **Simulation Engine** | MNA DC analysis, logic states, safety checks | Complete |
| **Sovereignty Engine** | Local persistence, P2P sync, Git-as-data | Hardening |

### State Management (20 Context Providers)

Providers are nested in App.tsx in a load-bearing order (see [architecture.md](./architecture.md) for full nesting).

Key providers: LayoutContext, AssistantStateContext, HealthContext, AuthContext, UserContext, ToastProvider, NotificationContext, DashboardContext, MacroContext, InventoryContext, AdvancedInventoryContext, SyncContext, ConversationContext, DiagramContext, SelectionContext, TelemetryContext, HUDContext, SimulationContext, VoiceAssistantContext, TutorialContext.

### Persistence Layer

| Data | Store | Key/DB |
|------|-------|--------|
| FZPZ binary assets | IndexedDB | `CircuitMindDB.parts` |
| Inventory metadata | IndexedDB + LS | `CircuitMindDB.inventory` / `cm_inventory` |
| Diagrams | localStorage | `cm_autosave` |
| Conversations | IndexedDB | `CircuitMindDB.conversations/messages` |
| Settings | localStorage | `cm_gemini_api_key`, `cm_autonomy_settings` |
| Server catalog | SQLite | `server/data/circuitmind.db` |

---

## AI Integration

### Model Routing (from services/gemini/client.ts)

| Task | Model | Reason |
|------|-------|--------|
| Wiring diagrams | gemini-2.5-pro | Accuracy |
| Chat (fast) | gemini-2.5-flash | Speed |
| Chat (complex) | gemini-2.5-pro | Accuracy |
| Image generation | imagen-3.0-generate-001 | Quality |
| Video generation | veo-2.0-generate-001 | Quality |
| TTS | gemini-2.5-flash-tts | Speed |
| Live audio | gemini-2.5-flash-live | Real-time |
| Code generation | gemini-2.5-pro | Accuracy |
| Embeddings | text-embedding-004 | Semantic search |

### Action Safety Protocol

| Safe (auto-execute) | Unsafe (needs confirmation) |
|---------------------|----------------------------|
| highlight, centerOn, zoomTo, panTo | addComponent, updateComponent, removeComponent |
| resetView, highlightWire | clearCanvas, createConnection, removeConnection |
| openInventory, closeInventory | loadDiagram, fillField, saveComponent |
| openSettings, closeSettings, switchMode | |
| undo, redo, saveDiagram | |

Users customize via Settings > AI Autonomy.

---

## Visual Design System

See [design-system.md](./design-system.md) for comprehensive documentation.

### Color Palette

| Token | Value | Use |
|-------|-------|-----|
| Cyber Black | `#050508` | App background |
| Cyber Dark | `#0a0a12` | Canvas surface |
| Neon Cyan | `#00f3ff` | Primary energy, focus |
| Neon Purple | `#bd00ff` | AI/assistant context |
| Neon Green | `#00ff9d` | Success, telemetry |
| Neon Amber | `#ffaa00` | Warnings, debug mode |

### Rules

- **NO rounded corners** -- hard edges, cut-corners only
- **44px hit targets** for all interactive controls
- **Cut-corner chamfers**: sm=4px, md=8px

---

## Critical Pitfalls (Must Know)

| Issue | Solution |
|-------|----------|
| Gemini OBJECT schema | Use STRING for dynamic payloads |
| localStorage + reload | Add 100ms delay before reload |
| Component edit sync | Update BOTH inventory AND diagram |
| WebSocket state | Use `useRef`, not `useState` |
| Veo video URLs | Append `&key=API_KEY` |
| Missing pin render | Show red dot, don't crash |
| Provider nesting | Order in App.tsx is load-bearing |
| mathjs lusolve | Returns Matrix object -- call `.valueOf()` |

Full details: [pitfalls.md](./pitfalls.md)

---

## Development Workflow

1. **Track Creation**: Use BrainGrid (`/specify`, `/breakdown`, `/build`)
2. **Implementation**: LLM writes --> Human verifies --> Tests pass
3. **Validation**: `npx tsc --noEmit` + `npm test`
4. **Commit**: Pre-commit hook scans for secrets via gitleaks

### Definition of Done

- [ ] TypeScript types exhaustive (no `any`)
- [ ] ESLint passes with zero warnings
- [ ] Unit tests cover critical logic
- [ ] UI follows Neon-Cyber style guide
- [ ] `npx tsc --noEmit` passes with 0 errors

---

## Related Documentation

### Technical Ref (`ref/`)

| File | Content |
|------|---------|
| [architecture.md](./architecture.md) | System design, data flow, server API |
| [components.md](./components.md) | React component APIs |
| [contexts.md](./contexts.md) | Context provider APIs |
| [hooks.md](./hooks.md) | Custom hook APIs |
| [services.md](./services.md) | Service layer APIs |
| [types.md](./types.md) | TypeScript interfaces |
| [patterns.md](./patterns.md) | Design patterns |
| [pitfalls.md](./pitfalls.md) | Common gotchas |
| [design-system.md](./design-system.md) | Colors, typography, CSS system |
| [performance.md](./performance.md) | Code splitting, lazy loading, worker pattern |
| [deployment.md](./deployment.md) | Build, hosting, server deployment |
| [ci-cd.md](./ci-cd.md) | CI/CD pipelines, pre-commit hooks |
| [visual-analysis-tools.md](./visual-analysis-tools.md) | Visual audit CLI tools |

### Product Docs (`docs/`)

| Path | Content |
|------|---------|
| `00-context/vision.md` | Product purpose & boundaries |
| `01-product/prd.md` | Requirements source of truth |
| `02-features/*.md` | Feature specifications |
| `03-logs/*.md` | Implementation & decision logs |
| `04-process/*.md` | Dev workflow & style guides |
