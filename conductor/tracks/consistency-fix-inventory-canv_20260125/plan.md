# Plan: Consistency Fix (Inventory-Canvas Sync)

## Phase 1: Inventory ID Alignment
- [x] Update `data/initialInventory.ts` to use semantic IDs matching the legacy diagram components (`mcu1`, `pot1`, `servo1`, etc.).
- [ ] Ensure all 62+ components have stable, consistent IDs.

## Phase 2: Migration Utility
- [x] Create a migration utility in `services/componentValidator.ts` that runs once on startup.
- [ ] The utility should:
    - Scan the current `diagram` in `localStorage`.
    - Map components with legacy IDs (e.g., `mcu1`) to the new semantic inventory IDs.
    - Set the `sourceInventoryId` for any component that is missing it.

## Phase 3: Integration & Verification
- [x] Trigger the migration in `App.tsx` or `DiagramProvider.tsx`.
- [x] Verify that the `useInventorySync` hook no longer reports "orphaned" components.
- [x] Run a final build check.
