# CircuitMind AI

## Project Overview
CircuitMind AI is an intelligent, futuristic workspace for electronics prototyping. It features AI-generated wiring diagrams, interactive component inventory management, and educational pinout exploration. This is a personal project optimized for correctness, craftsmanship, and local-first workflows.

## User Context & Collaboration
- **User:** Tyler
- **Communication Style:** Clear, plain language. Avoid jargon; define acronyms. Prefer concrete examples and step-by-step explanations.
- **Priorities:** Correctness > Speed. No deadlines.
- **Privacy:** Local-only. No telemetry without explicit request.

## Tech Stack
- **Framework:** React 19, Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4), PostCSS
- **3D Graphics:** Three.js
- **AI:** Google GenAI SDK (`@google/genai`), `client-vector-search`
- **Testing:** Vitest, Playwright, React Testing Library

## Key Commands

```bash
npm run dev          # Start development server (Requires GEMINI_API_KEY in .env.local)
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:visual  # Run visual tests (Playwright)
npm run lint         # Lint code
```

## Architecture

### State Management (React Context)
- **`DiagramContext`**: Manages the wiring diagram state and undo/redo history.
- **`InventoryContext`**: Manages the library of electronic components.
- **`ConversationContext`**: Handles chat sessions and history.
- **`AssistantStateContext`**: Tracks AI status (thinking, idle, etc.).
- **`VoiceAssistantContext`**: Manages voice input/output.
- **`LayoutContext`**: Controls UI layout and sidebars.

### Key Files & Directories
- **`types.ts`**: **CRITICAL**. Contains all core interfaces (`ElectronicComponent`, `WiringDiagram`, `ChatMessage`). Read this first.
- **`App.tsx`**: Root orchestration and layout structure.
- **`contexts/*.tsx`**: Domain state providers.
- **`services/geminiService.ts`**: Main entry point for Gemini AI integration.
- **`hooks/useAIActions.ts`**: Central hub for dispatching AI actions.
- **`conductor/index.md`**: **Conductor Index**. Single source of truth for product vision, tech stack, and active tracks.
- **`CLAUDE.md`**: Detailed architectural documentation, pitfalls, and patterns.

## Development Conventions
- **Coding Style:** TypeScript + React. Use PascalCase for components, `useX` for hooks.
- **Testing:** Verification is mandatory. Tests live near code in `__tests__` directories.
- **Secrets:** `GEMINI_API_KEY` must be in `.env.local`. Never commit secrets.
- **Component Sync:** Updates to components must sync to BOTH `InventoryContext` (source of truth) and `DiagramContext`.

## AI Model Strategy (Gemini)
- **Wiring Diagrams:** `gemini-2.5-pro` (Prioritizes accuracy)
- **General Chat:** `gemini-2.5-flash` (Prioritizes speed)
- **Complex Reasoning:** `gemini-2.5-pro`
- **Image Generation:** `gemini-2.5-flash-image` (Speed) or `gemini-3-pro-image-preview` (Quality)
- **Video Generation:** `veo-3.1-fast-generate-preview`
