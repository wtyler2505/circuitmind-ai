# Implementation Plan: FZPZ Asset Integration & God-Tier Inventory Upgrade

## Phase 1: Infrastructure & Manifest Hydration
- [x] **Task 1.1:** Setup `public/parts/` directory and populate with core starter `.fzpz` assets.
- [x] **Task 1.2:** Implement a pre-processing script (`scripts/build-parts-manifest.ts`) to generate `parts-manifest.json`.
- [x] **Task 1.3:** Refactor `data/initialInventory.ts` to hydrate from the generated manifest.

## Phase 2: Robust Loader & Persistence
- [x] **Task 2.1:** Enhance `FzpzLoader.ts` with a **Normalization Layer** (mil/mm/in to grid) and **Sanitization Layer**.
- [x] **Task 2.2:** Implement `PartStorageService` (IndexedDB) for binary caching and thumbnail persistence.
- [x] **Task 2.3:** Update `InventoryContext.tsx` for lazy-loading binary data when a part is added to the canvas.

## Phase 3: Visual Engine & AI Integration
- [x] **Task 3.1:** Update `DiagramNode.tsx` to render FZPZ SVGs and prioritize `footprint` data in `calculatePinPositions`.
- [x] **Task 3.2:** Implement `syncFzpToAiContext()` to push dynamic connector data into the Gemini `AIContext`.
- [x] **Task 3.3:** Refactor `InventoryItem.tsx` to render thumbnails from IndexedDB/FZPZ data URLs.

## Phase 4: UI Features & Hardening
- [x] **Task 4.1:** Build the "Custom Part Importer" component in the Settings/Inventory panel.
- [x] **Task 4.2:** Update Vitest suites to cover coordinate normalization and manifest hydration.
- [x] **Task 4.3:** Conduct visual regression audit on core components (Arduino, DHT11, Breadboard).
