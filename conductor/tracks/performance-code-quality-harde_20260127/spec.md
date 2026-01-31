# Specification: Performance, Types & Maintenance

## Goal
Optimize system performance and harden the codebase through strict typing and technical debt cleanup.

## Requirements
- **Asset Optimization**: Convert/Compress all UI assets >500kb in `public/assets/ui/` to WebP/SVG.
- **Type Safety**: Fix `unknown` property access in `OmniSearch.tsx` and eliminate remaining `any` types.
- **Code Hygiene**: Migrate all remaining `console.log` statements to `auditService.log`.
- **Debt Cleanup**: Resolve all TODO and FIXME markers identified in the audit.

## Scope
- `public/assets/ui/`
- `components/layout/OmniSearch.tsx`
- Entire `src` for console and TODO cleanup.