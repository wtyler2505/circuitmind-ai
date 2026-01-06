# CircuitMind AI - Developer & Agent Context

## 1. Project Overview
CircuitMind AI is a personal, local-first web application designed to assist with electronics engineering workflows. It integrates Google's Gemini AI to help users generate wiring diagrams, manage component inventories, visualize PCBs in 3D, and debug circuits via a chat interface.

**Key Philosophy:**
- **Local-First:** Optimized for single-user workflow. No external cloud dependencies for state (localStorage only).
- **Privacy:** No telemetry. Secrets in `.env.local` only.
- **Correctness:** "Measure twice, cut once." Verification is mandatory.
- **Craftsmanship:** High-quality code, no shortcuts, robust implementations.

## 2. Technology Stack
- **Framework:** React 19 (Client-side)
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom "Cyber" theme)
- **3D Engine:** Three.js (Raw refs, no React-Three-Fiber)
- **AI Integration:** Google GenAI SDK (`@google/genai`), Genkit
- **Testing:** Vitest, React Testing Library, Playwright
- **State Management:** Local React State (`useState`, `useReducer`) + `localStorage` persistence. No Redux/Context.

## 3. Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Google Gemini API Key

### Setup & Run
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Configuration:**
    Create `.env.local` in the root:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```
3.  **Development Server:**
    ```bash
    npm run dev
    # Runs on http://localhost:3000
    ```
4.  **Testing:**
    ```bash
    npm run test        # Run unit tests
    npm run test:watch  # Watch mode
    ```
5.  **Build:**
    ```bash
    npm run build
    npm run preview
    ```

## 4. Architecture & State

### Centralized State (`App.tsx`)
The application uses a centralized state pattern in `App.tsx` instead of Context or Redux.
- **`inventory`**: Source of truth for components (`localStorage.cm_inventory`).
- **`history`**: Custom Undo/Redo stack for wiring diagrams (`localStorage.cm_autosave`).
- **`generationMode`**: Switches between 'chat', 'image', and 'video'.
- **`liveSessionRef`**: `useRef` for WebSocket connections (prevents re-renders).

### Data Flow
- **Component Updates:** Updating a component in `ComponentEditorModal` syncs changes to **both** the global `inventory` and the active `diagram`.
- **Z-Index Layering:** Canvas (0) < Header (10) < Chat (20) < Inventory (40) < Modals (50).

## 5. Development Guidelines ("Tyler's Rules")

- **Verification:** Always verify changes. Run tests. Add tests for new features.
- **No Shortcuts:** If you touch code, leave it better than you found it. Refactor complexity.
- **Communication:** Be direct, concrete, and explain terms. Avoid jargon.
- **Safety:** Treat all AI/User content as untrusted. Sanitize inputs.
- **Visuals:** The UI has a specific "Cyber" aesthetic. Respect the dark theme and styling conventions.

### Coding Style
- **Naming:** PascalCase for Components, `useX` for hooks, camelCase for services.
- **Types:** Explicitly define types in `types.ts`. Avoid `any`.
- **Files:** Keep components focused. Large components (like `Inventory.tsx`) should be refactored/split when possible.

## 6. AI Integration & Models

The project uses various Gemini models for specific tasks (see `CLAUDE.md` and `services/geminiService.ts`):

| Task | Model |
| :--- | :--- |
| **Wiring Diagrams** | `gemini-3-pro-preview` |
| **Chat / Logic** | `gemini-2.5-flash-lite-preview` |
| **Image Gen** | `gemini-3-pro-image-preview` |
| **Video Gen** | `veo-3.1-fast-generate-preview` |
| **Vision/OCR** | Gemini Multimodal |

**Key files:**
- `services/geminiService.ts`: Main AI interaction logic.
- `hooks/useAIActions.ts`: Handles AI-driven UI actions.
- `services/responseParser.ts`: Parses AI JSON responses.

## 7. Critical Pitfalls & Known Issues

- **Gemini Schema:** Object types **MUST** have `properties: {...}` defined.
- **Reload Race:** Always add a ~100ms delay before `window.location.reload()`.
- **Component Sync:** Ensure updates propagate to both Inventory and Diagram states.
- **WebSocket:** Use `useRef` for `LiveSession`, never `useState`.
- **Video URLs:** Append `&key=API_KEY` to Veo-generated video URLs.

## 8. Documentation Map

- **`CLAUDE.md`**: Quick start, commands, critical file priorities.
- **`AGENTS.md`**: Detailed interaction guidelines and project principles.
- **`ref/`**: Deep dives into specific topics:
    - `ref/architecture.md`: System design.
    - `ref/components.md`: Component API details.
    - `ref/patterns.md`: Established design patterns.
    - `ref/types.md`: TypeScript interfaces.
- **`docs/`**: General documentation and improvements list (`IMPROVEMENTS.md`).

## 9. Directory Structure Key
- `components/`: React UI components.
- `hooks/`: Custom React hooks (logic reuse).
- `services/`: API clients, storage logic, validators.
- `diagram/`: Logic specific to the wiring diagram canvas.
- `.genkit/`: Genkit configuration and artifacts.
- `tests/`: Test setup and utilities.
