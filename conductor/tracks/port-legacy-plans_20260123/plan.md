# Plan: Port Legacy Plans

## Goals
- Migrate active planning documents to Conductor's track structure.
- Archive completed planning documents.
- Remove the deprecated `plans/` directory.

## Steps

### 1. Migrate Active Plan: Improved UI Components
- [x] Create track directory: `conductor/tracks/feature-improved-ui-components`.
- [x] Port `plans/improved-ui-components.md` to `spec.md` and `plan.md` within that directory.
- [x] Register track in `conductor/tracks.md` as `in-progress`.

### 2. Archive Completed Plans
- [x] Create track directory: `conductor/tracks/chore-legacy-plans-archive`.
- [ ] Move content of `plans/advanced-ai-workflows.md` and `plans/ui-visual-audit.md` into this track's documentation (e.g., as `legacy-advanced-ai.md` etc, or just merge into spec).
- [ ] OR better: Create a `docs/legacy-plans/` directory for historical reference and link them in the archive track.
- [x] Decision: Move completed MD files to `conductor/tracks/chore-legacy-plans-archive/attachments/` for safekeeping and mark the track as `done`.

### 3. Cleanup
- [x] Delete `plans/` directory.
- [ ] Update `GEMINI.md` or `conductor/index.md` if they reference `plans/`.

### 4. Verification
- [x] Verify `conductor/tracks.md` has the new tracks.
- [x] Verify `plans/` is gone.
