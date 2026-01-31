# Specification: Omni-Audit Remediation (Complete System Cleanup)

## Goal
Resolve 100% of the findings identified in the EXTREME Deep Audit (2026-01-27). This includes fixing security vulnerabilities, resolving asset loading failures, refactoring complex code, and optimizing performance.

## Context
The system audit revealed technical debt in large UI components, security risks in documentation snippets, visual regressions due to security policies (ORB), and performance bottlenecks in asset handling.

## Requirements

### 1. Security & Compliance
- **Gitleaks Resolution**: Whitelist or rename example keys in `docs/misc/inventory/examples_library/` to resolve 3 high-risk flags.
- **Credential Safety**: Audit all detected "secret" or "token" strings to ensure no real credentials are hardcoded.

### 2. Visual & Assets
- **ORB Image Fix**: Migrate all external inventory images failing Opaque Response Blocking (ORB) to local `public/assets/inventory/`.
- **404 Resolution**: Fix the `msgid=7` resource failure identified in the console.
- **Asset Optimization**: Convert all UI assets >500kb in `public/assets/ui/` to optimized WebP/SVG formats.

### 3. Structural Refactoring (Complexity Debt)
- **High Complexity Components**: Break down `Diagram3DView.tsx` (1946 LOC) and `DiagramCanvas.tsx` (1380 LOC) into modular sub-components.
- **Logic Hotspots**: Optimize `clampZoom` (CCN 21) in `diagramState.ts`, `generateConceptImage` (CCN 18) in `media.ts`, and `validateDiagramInventoryConsistency` (CCN 16) in `componentValidator.ts`.

### 4. Code Quality & Maintenance
- **Console Cleanup**: Remove or transition all debug `console.log` statements identified in `contexts/`, `hooks/`, and `scripts/` to the `auditService`.
- **Type Safety**: Resolve `unknown` property access in `OmniSearch.tsx` and eliminate remaining `any` types identified in the reports.
- **TODO/FIXME**: Review and resolve pending items in `ref/pitfalls.md` and other source files.

## Scope
- `components/`, `services/`, `hooks/`, `contexts/`
- `public/assets/`
- `docs/` and project configuration files.