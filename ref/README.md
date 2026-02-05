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
| Run visual audits | [visual-analysis-tools.md](./visual-analysis-tools.md) |

---

## Project Identity

**Vision**: A futuristic, AI-assisted electronics design workspace that prioritizes:
- **Local-First**: 100% privacy, offline-capable, no telemetry
- **Craftsmanship**: Technical correctness over speed
- **Cyberpunk UX**: "Neon-Dark" aesthetic with hard edges and glass surfaces

**Tech Stack**:
- Frontend: React 19 + TypeScript + Vite 6
- AI: Google Gemini (2.5 Pro/Flash, Veo, TTS)
- 3D: Three.js
- Storage: IndexedDB + localStorage
- State: React Context API (6 federated contexts)

---

## System Architecture

### Five Subsystems

| System | Purpose | Status |
|--------|---------|--------|
| **Asset Engine** | FZPZ loading, SVG rendering, IndexedDB caching | ✅ God-Tier |
| **Intelligence Engine** | Eve AI, deep awareness, proactive suggestions | ✅ Complete |
| **Visual Engine** | 2D SVG canvas, 3D Three.js, Bézier wiring | ✅ Complete |
| **Simulation Engine** | DC nodal analysis, logic states, safety checks | ✅ Complete |
| **Sovereignty Engine** | Local persistence, P2P sync, Git-as-data | ✅ Hardening |

### State Management (6 Contexts)

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│              (Root state + layout orchestration)             │
├──────────┬──────────┬──────────┬──────────┬────────┬────────┤
│ Diagram  │Inventory │ Layout   │ Conver-  │Assist- │ Voice  │
│ Context  │ Context  │ Context  │ sation   │ ant    │ Assist │
│          │          │          │ Context  │ State  │ Context│
├──────────┼──────────┼──────────┼──────────┼────────┼────────┤
│diagram   │inventory │viewMode  │activeId  │aiStatus│record- │
│undo/redo│selection │panels    │messages  │pending │ing     │
│history   │fzpzCache │sidebars  │          │actions │transcr.│
└──────────┴──────────┴──────────┴──────────┴────────┴────────┘
```

### Persistence Layer

| Data | Store | Key/DB |
|------|-------|--------|
| FZPZ binary assets | IndexedDB | `CircuitMindDB.parts` |
| Inventory metadata | IndexedDB + LS | `CircuitMindDB.inventory` / `cm_inventory` |
| Diagrams | localStorage | `cm_autosave` |
| Conversations | IndexedDB | `CircuitMindDB.conversations/messages` |
| Settings | localStorage | `cm_gemini_api_key`, `cm_autonomy_settings` |

---

## AI Integration

### Model Routing

| Task | Model | Reason |
|------|-------|--------|
| Wiring diagrams | gemini-2.5-pro | Accuracy |
| Chat (fast) | gemini-2.5-flash | Speed |
| Chat (complex) | gemini-2.5-pro | Accuracy |
| Smart fill | gemini-2.5-flash + Search | Real-time data |
| 3D code gen | gemini-2.5-flash + thinking | Spatial reasoning |
| Images | gemini-2.5-flash-image | Speed |
| Concept art | gemini-3-pro-image-preview | Quality |
| Video | veo-3.1-fast-generate-preview | Quality |
| TTS | gemini-2.5-flash-preview-tts | Speed |

### Action Safety Protocol

| Safe (auto-execute) | Unsafe (needs confirmation) |
|---------------------|----------------------------|
| highlight, centerOn, zoomTo | addComponent, removeComponent |
| resetView, highlightWire | createConnection, deleteConnection |
| openInventory, closeInventory | modifyComponent |
| openSettings, switchMode | fillField, saveComponent |

Users customize via Settings → AI Autonomy.

---

## Visual Design System

### Color Palette

| Token | Value | Use |
|-------|-------|-----|
| Void Black | `#020204` | Background base |
| Panel Black | `rgba(6, 8, 12, 0.84)` | Surface base |
| Cyan Focus | `#00f3ff` | Primary energy |
| Purple AI | `#a855f7` | Assistant context |
| Red Live | `#ef4444` | Alerts, recording |
| Emerald | `#10b981` | Success states |

### Glass Surface Hierarchy

```
panel-surface  → Main panels (blur: 14px)
panel-header   → Top bars (blur: 12px, cyan sheen)
panel-rail     → Thin separators (blur: 10px)
panel-frame    → Framing accents (1px hairline)
```

### Rules

- **NO rounded corners** - hard edges, cut-corners only
- **44px hit targets** for all interactive controls
- **Cut-corner chamfers**: sm=6px, md=12px

---

## Directory Structure

```
circuitmind-ai/
├── App.tsx                 # Root state + layout
├── types.ts                # All TypeScript interfaces
├── index.css               # Tailwind + cyber theme
│
├── components/
│   ├── diagram/            # Canvas components
│   │   ├── Diagram3DView.tsx    # Three.js 3D (1833 LOC)
│   │   ├── DiagramNode.tsx      # Component nodes (820 LOC)
│   │   └── componentShapes.ts   # SVG definitions
│   ├── DiagramCanvas.tsx        # 2D SVG canvas (1227 LOC)
│   ├── ChatPanel.tsx            # AI chat (820 LOC)
│   ├── ComponentEditorModal.tsx # Editor (1159 LOC)
│   └── Inventory.tsx            # Parts library (987 LOC)
│
├── contexts/               # React Context providers
│   ├── DiagramContext.tsx       # Diagram + undo/redo
│   ├── InventoryContext.tsx     # Parts + FZPZ cache
│   ├── LayoutContext.tsx        # UI modes
│   ├── ConversationContext.tsx  # Chat sessions
│   ├── AssistantStateContext.tsx # AI status
│   └── VoiceAssistantContext.tsx # Voice I/O
│
├── hooks/
│   ├── useAIActions.ts          # Action dispatcher (153 LOC)
│   ├── actions/                 # Handler registry
│   ├── useConversations.ts      # Conversation CRUD
│   └── useInventorySync.ts      # Dual-sync handler
│
├── services/
│   ├── gemini/                  # Modular AI (10 files)
│   │   ├── client.ts            # API + models
│   │   ├── features/chat.ts     # Chat operations
│   │   ├── features/wiring.ts   # Diagram gen
│   │   └── features/media.ts    # Image/video
│   ├── fzpzLoader.ts            # FZPZ processor
│   ├── partStorageService.ts    # IndexedDB cache
│   └── storage.ts               # Core persistence
│
├── public/parts/
│   ├── parts-manifest.json      # Instant hydration metadata
│   └── *.fzpz                   # Binary part files
│
├── docs/                        # Product documentation
│   ├── 00-context/              # Vision, assumptions
│   ├── 01-product/              # PRD
│   ├── 02-features/             # Feature specs
│   ├── 03-logs/                 # Implementation logs
│   └── 04-process/              # Dev workflow
│
└── ref/                         # Technical reference (this dir)
```

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

Full details: [pitfalls.md](./pitfalls.md)

---

## Development Workflow

1. **Track Creation**: Use `conductor` to define feature/bug
2. **Deep Focus**: Activate for complex work
3. **Build Loop**: LLM writes → Human verifies → Tests pass
4. **Validation**: Run `verification-before-completion`

### Definition of Done

- [ ] TypeScript types exhaustive (no `any`)
- [ ] ESLint passes with zero warnings
- [ ] Unit tests cover critical logic
- [ ] UI follows Neon-Cyber style guide
- [ ] Implementation log updated
- [ ] Feature spec reflects changes

---

## Related Documentation

### Product Docs (`docs/`)

| Path | Content |
|------|---------|
| `00-context/vision.md` | Product purpose & boundaries |
| `01-product/prd.md` | Requirements source of truth |
| `02-features/*.md` | Feature specifications |
| `03-logs/*.md` | Implementation & decision logs |
| `04-process/*.md` | Dev workflow & style guides |

### Technical Ref (`ref/`)

| File | Content |
|------|---------|
| `architecture.md` | System design, data flow |
| `components.md` | React component APIs |
| `contexts.md` | Context provider APIs |
| `hooks.md` | Custom hook APIs |
| `services.md` | Service layer APIs |
| `types.md` | TypeScript interfaces |
| `patterns.md` | Design patterns |
| `pitfalls.md` | Common gotchas |
