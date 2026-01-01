# Repository Guidelines

## Project Structure & Module Organization
- `App.tsx` holds the main app state; the entry point is `index.tsx` with `index.html` and `index.css`.
- UI components live in `components/` (for example, `DiagramCanvas.tsx` and `ComponentEditorModal.tsx`).
- Hooks are in `hooks/` (`useAIActions.ts`, `useConversations.ts`), services in `services/` (Gemini API, storage, audio).
- Shared types live in `types.ts`. Documentation and datasets are in `docs/` (see `docs/README.md`, inventory under `docs/misc/inventory/`).
- Tests are not configured yet; if added, use `tests/` or `components/__tests__/`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server at `http://localhost:3000` (requires `GEMINI_API_KEY` in `.env.local`).
- `npm run build`: create a production build.
- `npm run preview`: preview the production build locally.
- No test script is defined in `package.json` at the moment.

## Coding Style & Naming Conventions
- TypeScript + React; follow existing formatting (2-space indentation, semicolons, single quotes).
- Components use PascalCase filenames/exports (`ComponentEditorModal.tsx`).
- Hooks use the `useX` prefix in `hooks/`.
- Services are lower camelCase filenames in `services/` (for example, `geminiService.ts`).
- Keep shared models in `types.ts`; add explicit types for API payloads and wiring data.

## Testing Guidelines
- No testing framework or coverage targets are configured.
- If you add tests, use `*.test.ts(x)` naming and wire a runner (for example, Vitest) plus a script like `npm run test`.
- Keep UI tests close to components; mock network calls to Gemini services.

## Commit & Pull Request Guidelines
- Git history currently has a single commit (“Initial commit - CircuitMind AI”), so no convention is established.
- Use concise, imperative summaries (for example, “Add live audio reconnect”); add scope only when it adds clarity.
- PRs should include a short summary, screenshots for UI changes, and docs updates when behavior changes; link issues if applicable.

## Security & Configuration Tips
- Store secrets in `.env.local` (`GEMINI_API_KEY`) and do not commit them.
- Vite injects the key in `vite.config.ts`; verify local config before running.

## Agent/Docs Notes
- See `CLAUDE.md` for architecture notes and model routing.
- Use `docs/` for deeper references on services, data types, and UI architecture.
