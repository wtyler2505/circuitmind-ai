# Spec: Port Legacy Plans to Conductor

## Background
The project currently has a `plans/` directory with Markdown files describing various initiatives. We are adopting the **Conductor** workflow, which strictly organizes work into `conductor/tracks/<track-id>/`.

## Source Files
- `plans/improved-ui-components.md` (Active)
- `plans/advanced-ai-workflows.md` (Completed)
- `plans/ui-visual-audit.md` (Completed)

## Destination Structure
- **Active Work:** `conductor/tracks/feature-improved-ui-components/`
- **Completed Work:** `conductor/tracks/chore-legacy-plans-archive/`

## Success Criteria
- All useful information from `plans/` is preserved in Conductor.
- The `plans/` directory is removed to prevent confusion.
- The Conductor Registry (`tracks.md`) accurately reflects the state of these initiatives.
