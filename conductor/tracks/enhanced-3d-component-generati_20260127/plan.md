# Implementation Plan: Enhanced 3D Generation (Masterpiece Edition)

## Phase 1: Standards & Primitives Expansion
- [x] **Data Ingestion:** Expand `assets/standards/ipc_dimensions.json` with 50+ new package definitions (BGA, QFN, DFN, specialized headers).
- [x] **Enhanced Primitives (`services/threePrimitives.ts`):**
    - [x] Implement `createSolderFillet()` for realistic pin-to-pad transitions.
    - [x] Implement `createSilkscreenLogo()` for procedural branding on chip bodies.
    - [x] Update `createPCB()` with advanced subsurface scattering for realistic FR4 substrate.
    - [x] Add `createHeatsink()` and `createInductorCoil()` primitives.

## Phase 2: Generation Logic Upgrade
- [x] **Two-Pass Pipeline:** Refactor `generateComponent3DCode` in `services/gemini/features/components.ts` to perform a "Spec Extraction" step before code generation.
- [x] **Advanced Prompting:** Rewrite the `GENERATE_3D_CODE` prompt to enforce "Cyberpunk Realism" (micro-textures, laser-etched labels, and strict dimensional grounding).
- [x] **Validation Layer:** Implement `verifyModelDimensions()` to auto-check the generated bounding box against target IPC specs.

## Phase 3: UI/UX & Polish

- [x] **Viewer Enhancements:** Update `ThreeViewer.tsx` and `Diagram3DView.tsx` to support the new PBR materials and procedural labels.

- [x] **Quality Controls:** Add "Precision Level" settings to the component editor (Draft vs. Masterpiece).

- [x] **Verification:** Run visual tests to ensure all common packages generate correctly.
