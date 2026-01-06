# Local Prompts

Project-local prompt templates for recurring workflows. Use these as the starting point for Codex tasks in this repo.

## Prompt Index

- `mounting-hole-patterns.md` - Board/module hole coordinates and dimensions with sources.
- `component-datasheet-links.md` - Official product pages, datasheets, images, and key specs.
- `wiring-harness-research.md` - Wiring harness/diagram tooling and best practices summary.
- `react-foreach-undefined-debug.md` - Debug the React forEach undefined error with tests.
- `oss-3d-vision-models.md` - OSS 3D/vision model landscape with licenses.

## Conventions

- Store prompts in `.codex/prompts/<name>.md`.
- Keep YAML frontmatter with: `description`, `argument-hint`, `allowed-tools`.
- Prefer repo-specific guidance and file paths.
- Avoid secrets; prompts should be safe to share within this repo.
