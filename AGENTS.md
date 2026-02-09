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

- **Entry**: `index.tsx` → `App.tsx` (20 nested context providers) → `MainLayout`.
- **Frontend**: `components/` (108 files), `hooks/` (46 files), `services/` (82 files), `contexts/` (19 providers), shared types in `types.ts`.
- **Backend**: `server/` — Express 5 + SQLite (better-sqlite3) API on port 3001. Separate `package.json`. Routes: catalog, inventory, locations, stock-moves, search, export, migrate, identify (AI vision), STT.
- **Conductor**: `conductor/` — spec-driven development system. Product vision, tech stack, and tracks registry (~40 completed feature tracks).
- **Docs & data**: `docs/` (extended documentation), `data/` (initial inventory, tutorials), `ref/` (12 architecture reference docs), `fritzing-parts/` (10k+ part library).
- **Config & tooling**: `scripts/` (build/audit utilities), `audits/`, `.braingrid/` (spec-driven dev integration), `.claude/` (Claude Code config).

## Build, Test, and Dev Commands

### Frontend (root)

- `npm install`
- `npm run dev` — Vite dev server (requires `GEMINI_API_KEY` in `.env.local`)
- `npm run build` / `npm run preview`
- `npm run test` / `npm run test:watch` — Vitest
- `npm run test:visual` — Playwright screenshot tests
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` / `npm run format:check` — Prettier

### Backend (`server/`)

- `cd server && npm install`
- `npm run dev` — tsx watch (port 3001)
- `npm run start` — production mode
- Systemd service: `server/circuitmind.service`

## Coding Style & Naming

- TypeScript + React; follow existing formatting (2-space indent, semicolons, single quotes).
- Components PascalCase, hooks `useX`, services camelCase.
- Keep API payload types and wiring schemas explicit in `types.ts`.

## Testing

- **Framework**: Vitest + React Testing Library; setup in `tests/setup.ts`, utilities in `tests/test-utils.tsx`.
- **Component tests**: `components/__tests__/` (8 test files).
- **Service tests**: `services/__tests__/` (7 test files).
- **Hook tests**: `hooks/__tests__/`.
- **Accessibility**: `tests/accessibility.test.tsx` + dev-time axe-core auditing in `index.tsx` + `jest-axe`.
- **Visual/E2E**: Playwright config at `playwright.config.ts`; screenshot scripts in `scripts/`.
- Mock Gemini calls in tests; never hit real APIs.

## Commits & PRs

- No established convention; use concise imperative messages (e.g., "Add live audio reconnect").
- For PRs: summary, screenshots for UI changes, doc updates when behavior changes.

## Agent Documentation

Multiple agent-specific instruction files exist at root:

- `AGENTS.md` — this file; general rules for any AI agent.
- `CLAUDE.md` — detailed architecture reference for Claude Code (385 lines: providers, services, pitfalls, complexity hotspots, agent teams).
- `GEMINI.md` — Gemini CLI reference (tech stack, models, analysis tools, reasoning frameworks).
- `conductor/index.md` — product vision, tech stack, workflow, and tracks registry.
- `ref/` — 12 detailed reference docs (architecture, components, contexts, hooks, services, patterns, pitfalls, etc.).

## Security & Docs

- Secrets live in `.env.local` only; never commit them.
- Git pre-commit hook installed via `npm run prepare` (runs gitleaks scan).
- See `CLAUDE.md`, `GEMINI.md`, `conductor/`, and `ref/` for deep architectural context.
