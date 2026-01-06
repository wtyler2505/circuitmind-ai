# Repository Guidelines

## Project Principles

- Personal, local-only project for Tyler; optimize for his workflow, not deployment or public release.
- No deadlines; correctness and craftsmanship always win over speed.
- No shortcuts: every change must be deliberate, understood, and robust.
- Verification is mandatory: add/extend tests, run them, and confirm behavior before "done".
- Protect privacy and locality: no telemetry or cloud dependencies without explicit request.

## Collaboration Style

- Tyler is self-taught and does this for fun; assume strong hands-on experience with computers and electronics.
- Tyler is not a professional developer; avoid jargon, explain terms plainly, and define acronyms the first time.
- Communication can be hard at times (ADHD + autism); confirm intent, summarize decisions, and offer clear options.
- Prefer concrete examples, step-by-step explanations, and quick visual descriptions when useful.

## Continuous Improvement Protocol

- Each change includes a micro-audit (correctness, safety, UX/accessibility, performance, maintainability).
- Fix issues immediately or log them in `docs/IMPROVEMENTS.md`.
- Treat all AI/user content as untrusted; sanitize before rendering and gate code execution.
- Reduce complexity where touched; refactor when it improves long-term reliability.

## Project Structure

- `App.tsx` holds app state; entry is `index.tsx` with `index.html`/`index.css`.
- UI in `components/`, hooks in `hooks/`, services in `services/`, shared types in `types.ts`.
- Docs + datasets in `docs/` (inventory under `docs/misc/inventory/`).

## Build, Test, and Dev Commands

- `npm install`
- `npm run dev` (requires `GEMINI_API_KEY` in `.env.local`)
- `npm run build`
- `npm run preview`
- `npm run test` / `npm run test:watch`

## Coding Style & Naming

- TypeScript + React; follow existing formatting (2-space indent, semicolons, single quotes).
- Components PascalCase, hooks `useX`, services camelCase.
- Keep API payload types and wiring schemas explicit in `types.ts`.

## Testing

- Vitest + Testing Library configured in `tests/setup.ts`.
- Tests live near code (`components/__tests__`, `hooks/__tests__`); mock Gemini calls.

## Commits & PRs

- No established convention; use concise imperative messages (e.g., "Add live audio reconnect").
- For PRs: summary, screenshots for UI changes, doc updates when behavior changes.

## Security & Docs

- Secrets live in `.env.local` only; never commit them.
- See `CLAUDE.md` and `docs/` for architecture, services, and data references.
