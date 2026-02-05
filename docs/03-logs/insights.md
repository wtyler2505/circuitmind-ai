# Improvements Backlog

Use this file to record any issues, risks, or enhancement ideas discovered during work.
If a finding is not fixed immediately, it must be logged here with enough detail to act on later.

## Backlog Format

Each entry should include:

- ID (sequential)
- Area (file, feature, or subsystem)
- Severity (critical, high, medium, low)
- Problem summary
- Repro/impact
- Proposed fix
- Status (open, in-progress, done)
- Owner (optional)

## Open Items

1. [open] Area: `scripts/capture-screenshots.ts` / Playwright | Severity: medium
   - Summary: Screenshot recapture blocked by Chromium crashpad `setsockopt` permission error.
   - Repro/impact: `npx playwright test scripts/capture-screenshots.ts --headed` fails; UI audit screenshots are stale.
   - Proposed fix: Run recapture via Claude DevTools MCP or update capture pipeline to avoid crashpad restrictions.
   - Status: open

2. [open] Area: `docs/screenshots/UI_AUDIT_REPORT.md` | Severity: low
   - Summary: UI audit needs fresh recapture after glass surface and density passes.
   - Repro/impact: Audit references older visuals; risk of drift.
   - Proposed fix: Recapture full set once Playwright/DevTools capture is available.
   - Status: open

3. [open] Area: `App.tsx`, `components/ChatPanel.tsx` | Severity: medium
   - Summary: Icon-only controls outside canvas still need consistent visible labels/tooltips + 44px targets.
   - Repro/impact: Discoverability and accessibility gaps remain in header/chat controls.
   - Proposed fix: Add label/tooltips and hit-size audit for all icon-only controls.
   - Status: open

## Completed Items

1. [done] Area: `components/ChatMessage.tsx` | Severity: critical
   - Summary: Untrusted AI/user content was injected via `dangerouslySetInnerHTML`.
   - Resolution: Replaced manual HTML building with `react-markdown` + GFM, removing raw HTML injection.

2. [done] Area: `components/ThreeViewer.tsx`, `components/ComponentEditorModal.tsx` | Severity: high
   - Summary: AI-generated Three.js code executed without gating or validation.
   - Resolution: Added explicit **RUN 3D CODE** confirmation and blocked unsafe tokens before execution.

3. [done] Area: `hooks/useConversations.ts` | Severity: high
   - Summary: `addMessage` recursion when `activeConversationId` was null.
   - Resolution: Refactored to create conversations internally without recursion; seeded welcome message for primary.

4. [done] Area: `services/geminiService.ts` | Severity: medium
   - Summary: Inconsistent API key usage for image/video generation.
   - Resolution: Centralized key retrieval via `getApiKey()` and reused for Veo URLs.

5. [done] Area: `services/geminiService.ts` + `types.ts` | Severity: medium
   - Summary: `WIRING_SCHEMA` omitted required `description`.
   - Resolution: Required `description` in wiring schema; docs updated.

6. [done] Area: `App.tsx` | Severity: medium
   - Summary: Legacy `messages` state diverged from `useConversations`.
   - Resolution: Removed legacy state and standardized history on `useConversations`.

7. [done] Area: `services/geminiService.ts` | Severity: low
   - Summary: Placeholder `mentionStart`/`mentionEnd` values.
   - Resolution: Compute offsets against parsed message text.

8. [done] Area: `services/aiContextBuilder.ts` | Severity: low
   - Summary: Unused token budget constants.
   - Resolution: Removed unused config for clarity.

10. [done] Area: `services/fzpzLoader.ts`, `components/diagram/parts/FzpzVisual.tsx` | Severity: high
   - Summary: Generic component shapes lacked technical accuracy and pin metadata.
   - Resolution: Implemented full FZPZ asset engine with coordinate normalization and sanitized SVG rendering.

11. [done] Area: `data/initialInventory.ts`, `scripts/build-parts-manifest.ts` | Severity: medium
   - Summary: Initial inventory was heavy and hardcoded, slowing down hydration.
   - Resolution: Refactored to a manifest-first approach; lightweight metadata loads instantly, binary assets lazy-load on demand.

12. [done] Area: Documentation overhaul | Severity: low
   - Summary: Legacy documentation was scattered and diverged from the God-Tier project status.
   - Resolution: Executed Deep Focus documentation restructure; synchronized all content with FZPZ/React 19 standards.
