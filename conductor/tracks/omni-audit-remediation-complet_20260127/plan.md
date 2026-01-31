# Implementation Plan: Omni-Audit Remediation

## Proposed Changes

### Phase 1: Security & Assets (Immediate)
- [x] Update `.gitleaks.toml` or ignore files to handle false positives in `docs/`.
- [x] Create `scripts/download-inventory-assets.ts` to localize all inventory images.
- [x] Execute image migration and update `data/initialInventory.ts`.
- [ ] Locate and fix the 404 resource path for the missing logo/flourish asset.
- [ ] Optimize `public/assets/ui/*.png` using sharp/imagemin to WebP.

### Phase 2: Logic & Type Safety (High Priority)
- [ ] Refactor `clampZoom` in `diagramState.ts` to use a declarative boundary map.
- [ ] Define `IndexedDocument` interface in `OmniSearch.tsx` and fix `unknown` casts.
- [ ] Replace `any` types in `media.ts` and `componentValidator.ts` with strict interfaces.
- [ ] Bulk-remove `console.log` calls and replace with `auditService.log`.

### Phase 3: Structural Refactoring (Refactor)
- [ ] **Diagram3DView**:
    - [ ] Extract `SceneController` logic.
    - [ ] Move `validateThreeCode` to `services/security/`.
    - [ ] Create `ComponentMesh` factory.
- [ ] **DiagramCanvas**:
    - [ ] Extract `ConnectionRenderer`.
    - [ ] Move event listeners to `useCanvasGestures` hook.

### Phase 4: Performance & Cleanup
- [ ] Run `hyperfine` again to verify build time improvement after asset optimization.
- [ ] Resolve all TODO/FIXME markers in the codebase.

## Verification Plan

### Automated Tests
- [ ] `npm run lint` must return 0 warnings/errors.
- [ ] `npx tsc --noEmit` must pass.
- [ ] `npm run test` must pass all 75+ tests.
- [ ] `lizard` check: ensure no function exceeds CCN 15.

### Manual Verification
- [ ] Verify all inventory thumbnails load in the browser.
- [ ] Verify 3D view and Canvas interaction fluidity.
- [ ] Check console for zero errors/warnings.