# Gap Analysis: Phase 1 Documentation Coverage

> Generated: 2026-02-08
> Method: Independent codebase scan of all 231+ source files cross-referenced against all 8 Phase 1 docs

This document catalogs every gap, omission, and thin coverage area found by comparing the actual CircuitMind AI codebase against the Phase 1 documentation suite (docs 01-08).

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Critical gaps** (entire files/subsystems undocumented) | 27 |
| **Moderate gaps** (files mentioned but not substantively documented) | 19 |
| **Minor gaps** (small omissions within documented sections) | 22 |
| **Nice-to-have** (context enrichment opportunities) | 14 |

---

## CRITICAL GAPS — Entire Files or Subsystems Missing from All 8 Docs

### C1. `components/diagram/3d/` — 3D Subsystem Extraction (6 files, 1,207 LOC)

**Files completely undocumented:**
- `geometryFactories.ts` (380 LOC) — Creates Three.js geometries for all component types
- `lodFactories.ts` (417 LOC) — Level-of-detail factories for performance scaling
- `materials.ts` (223 LOC, 11 exports) — Centralized Three.js material definitions
- `pinCoordinates.ts` (102 LOC) — 3D pin position mapping for wiring
- `wireUtils.ts` (46 LOC) — 3D wire geometry utilities
- `codeValidation.ts` (39 LOC) — Validates AI-generated Three.js code

**Why critical:** This entire subdirectory represents the extracted 3D rendering pipeline. Doc 02 documents `Diagram3DView.tsx` and `ThreeViewer.tsx` but never mentions these supporting modules that contain the actual geometry/material logic. Doc 03 documents `threePrimitives.ts` but not these extracted equivalents.

### C2. `components/diagram/canvas/` — Canvas Subsystem Extraction (6 files, 523 LOC)

**Files completely undocumented:**
- `CanvasMinimap.tsx` (114 LOC) — Minimap navigation overlay for large diagrams
- `CanvasOverlays.tsx` (65 LOC) — Overlay composition layer
- `CanvasToolbar.tsx` (211 LOC) — Canvas-specific toolbar controls
- `SvgDefs.tsx` (47 LOC) — Shared SVG definitions (gradients, filters, markers)
- `WireLabelEditor.tsx` (62 LOC) — Inline wire label editing component
- `resolveWireColor.ts` (24 LOC) — Wire color resolution logic

**Why critical:** Doc 02 documents `DiagramCanvas.tsx` (the parent) but none of these extracted child components exist in any doc. The canvas refactoring from ~1226 LOC to ~313 LOC created these files, but docs still describe the monolithic version.

### C3. `components/diagram/parts/` — Specialized Part Renderers (2 files, 170 LOC)

**Files completely undocumented:**
- `Breadboard.tsx` (70 LOC) — SVG breadboard visualization
- `FzpzVisual.tsx` (100 LOC) — Renders Fritzing FZPZ part visuals on the SVG canvas

**Why critical:** These are concrete part rendering implementations that bridge the FZPZ loader to the diagram canvas. No doc mentions them.

### C4. `components/layout/assistant/` — Assistant UI Extraction (2 files, 367 LOC)

**Files completely undocumented:**
- `AssistantContent.tsx` (175 LOC) — AI assistant content display
- `AssistantTabs.tsx` (192 LOC) — Tab-based assistant interface with multiple content panels

**Why critical:** Doc 02 mentions `AssistantSidebar.tsx` but never documents these extracted sub-components that implement the actual tab logic.

### C5. `components/layout/ContextMenuOverlay.tsx` (125 LOC) — Completely Missing

Right-click context menu overlay. Not mentioned in any Phase 1 doc despite being a primary user interaction surface.

### C6. `hooks/useChatHandler.ts` (268 LOC) — Completely Missing

Core hook that handles chat message submission, AI response streaming, and conversation state management. This is the bridge between the chat UI and the Gemini service. Not documented anywhere despite being one of the largest hooks.

### C7. `hooks/useCanvasExport.ts` (171 LOC) — Completely Missing

Handles canvas export to PNG/SVG/PDF. Not documented in any Phase 1 doc.

### C8. `hooks/useCanvasHighlights.ts` (113 LOC) — Completely Missing

Manages visual highlight state for components and wires on the canvas.

### C9. `hooks/useCanvasHUD.ts` (62 LOC) — Completely Missing

Canvas heads-up display data hook. Connects HUDContext to the canvas.

### C10. `hooks/useCanvasInteraction.ts` (183 LOC) — Completely Missing

Handles pan, zoom, drag, and click interactions on the canvas. Core interaction logic.

### C11. `hooks/useCanvasLayout.ts` (237 LOC) — Completely Missing

Auto-layout engine hook. Manages component positioning algorithms.

### C12. `hooks/useCanvasWiring.ts` (136 LOC) — Completely Missing

Wiring interaction hook — click-to-connect pin wiring logic.

### C13. `hooks/useDiagram3DScene.ts` (377 LOC) — Completely Missing

The largest undocumented hook. Creates and manages the Three.js scene, camera, lighting, and controls for the 3D view.

### C14. `hooks/useDiagram3DSync.ts` (243 LOC) — Completely Missing

Synchronizes 2D diagram state with the 3D Three.js scene objects.

### C15. `hooks/useDiagram3DTelemetry.ts` (108 LOC) — Completely Missing

Tracks 3D view performance metrics and usage telemetry.

### C16. `hooks/useEditorAIChat.ts` (215 LOC) — Completely Missing

AI chat integration for the component editor modal. Allows AI-assisted component editing.

### C17. `hooks/useEditorFormState.ts` (124 LOC) — Completely Missing

Form state management for the component editor.

### C18. `hooks/useMainLayoutActions.ts` (219 LOC) — Completely Missing

Action handlers extracted from MainLayout.tsx during the refactoring from 1014 to 608 LOC.

### C19. `hooks/useGestureTracking.ts` (211 LOC) — Completely Missing

MediaPipe hand gesture tracking integration. Not documented despite being substantial.

### C20. `hooks/useKeyboardShortcuts.ts` (71 LOC) — Completely Missing

Global keyboard shortcut definitions and handler registration.

### C21. `hooks/useNeuralLinkEffects.ts` (73 LOC) — Completely Missing

Visual effects driven by neural link / gesture data.

### C22. `hooks/useSearchIndex.ts` (41 LOC) — Completely Missing

Search indexing hook that connects the search service to React lifecycle.

### C23. `hooks/useSecurityAudit.ts` (54 LOC) — Completely Missing

Security audit hook that exposes security scanning to the UI.

### C24. `hooks/useAIContextBuilder.ts` (85 LOC) — Completely Missing

Builds AI context objects for Gemini API calls from current app state.

### C25. `services/responseParser.ts` (279 LOC, 10 exports) — Completely Missing

Parses raw AI responses into structured data. Despite being referenced by multiple services, it appears in no Phase 1 doc.

### C26. `services/aiContextBuilder.ts` (315 LOC, 5 exports) — Completely Missing

Service-layer AI context builder. Larger than the hook equivalent and handles the actual construction of AI prompts from app state. Not in any doc.

### C27. `scripts/generate-starter-kit.py` (195 LOC), `scripts/optimize-assets.sh` (53 LOC), `scripts/verify_fzpz_complex.py` (92 LOC), `scripts/verify_fzpz_skill.py` (80 LOC), `scripts/empty-module.js` (3 LOC) — Completely Missing

Doc 06 lists 11 scripts but only documents the TypeScript ones (`build-parts-manifest.ts`, `capture-all.ts`, etc.). The Python scripts, the shell script, and the empty-module.js shim are not mentioned.

---

## MODERATE GAPS — Files Exist in Docs but Coverage is Thin or Outdated

### M1. `components/diagram/diagramState.ts` (6 exports) — Mentioned by Name Only

Doc 02 mentions this file exists but does not document its exported functions or state management approach. It exports diagram state utilities used by `DiagramContext`.

### M2. `components/diagram/diagramUtils.ts` (4 exports) — Mentioned by Name Only

Utility functions for diagram calculations (bounding boxes, intersection, etc.) are listed but not detailed.

### M3. `components/diagram/index.ts` — Barrel File Undocumented

The barrel re-export file that determines the public API of the diagram module. No doc describes which symbols it exports.

### M4. `components/ErrorBoundary.tsx` — Mentioned but No Detail

Error boundary component is mentioned once in Doc 02 but its props, fallback UI, and error reporting mechanism are not documented.

### M5. `components/IconButton.tsx` — Mentioned but No Detail

Reusable button component referenced across the codebase but not documented with its props or styling API.

### M6. `services/circuitAnalysisService.ts` (111 LOC) — Barely Mentioned

Circuit analysis service for validating electrical correctness. Doc 03 mentions it in a list but provides no API documentation.

### M7. `services/predictionEngine.ts` (86 LOC) — Barely Mentioned

Powers the `PredictiveGhost` component. Referenced in Doc 03's list but no API details.

### M8. `services/ragService.ts` (100 LOC) — Barely Mentioned

RAG (Retrieval-Augmented Generation) service for enhanced AI context. Listed but not documented.

### M9. `services/peerDiscoveryService.ts` (65 LOC) — Barely Mentioned

WebRTC peer discovery for collaboration. Listed in Doc 03 but API not documented.

### M10. `services/connectivityService.ts` (47 LOC) — Barely Mentioned

Network connectivity detection and offline/online state management. Listed but not detailed.

### M11. `services/datasetService.ts` (79 LOC) — Barely Mentioned

Dataset management for training/analysis. Listed but not documented.

### M12. `services/datasheetProcessor.ts` (51 LOC) — Barely Mentioned

Processes component datasheets. Listed but no API documentation.

### M13. `services/diagramDiff.ts` (66 LOC) — Barely Mentioned

Diagram version diffing. Used by `DiffOverlay.tsx` but the algorithm is not documented.

### M14. `services/visionAnalysisService.ts` (81 LOC) — Barely Mentioned

Vision/image analysis service. Listed but not documented.

### M15. `services/apiKeyStorage.ts` (31 LOC) — Barely Mentioned

Separate API key storage service distinct from `storage.ts`. Not documented despite handling sensitive credential storage.

### M16. `services/securityAuditor.ts` (74 LOC) — Barely Mentioned

Security scanning service. Has a test file (`services/__tests__/securityAuditor.test.ts`) but the service API is not in any doc.

### M17. `hooks/useToast.tsx` (8 exports) — Barely Mentioned

Toast notification hook with 8 exports. Doc 04 lists it but provides no details on its API or the notification types it supports.

### M18. `hooks/useActionHistory.ts` — Mentioned but Thin

Action history tracking hook for the audit service. Listed in Doc 04 but implementation details are missing.

### M19. `components/dashboard/` — 8 Components, Minimal Coverage

Doc 02 lists the dashboard components (`AnalogGauge`, `DashboardView`, `HeatmapWidget`, `LogicAnalyzerWidget`, `OscilloscopeWidget`, `Sparkline`, `WidgetLibrary`, `WidgetWrapper`) but provides only names and one-liners. No props documentation, no data flow description, no widget configuration API.

---

## MINOR GAPS — Small Omissions Within Documented Sections

### N1. `services/threeCodeRunner.worker.ts` (194 LOC) — Worker Thread Not Detailed

Doc 03 documents `threeCodeRunner.ts` but not the Web Worker file that actually executes the sandboxed AI-generated code.

### N2. `services/threeWorkerPolyfill.ts` (37 LOC) — Polyfill Not Mentioned

DOM API polyfills injected into the Web Worker context for Three.js compatibility. Completely missing from docs.

### N3. `components/inventory/inventoryUtils.ts` — Utility Functions Undocumented

Inventory utility functions (sorting, filtering, grouping) are not in any doc despite being used by multiple inventory components.

### N4. `components/inventory/InventoryToolsPanel.tsx` — Not in Doc 02

This component is not listed in the component catalog despite being part of the inventory UI.

### N5. `components/inventory/InventoryAddForm.tsx` — Not Fully Documented

Component for adding new inventory items. Mentioned in passing but no props or validation rules documented.

### N6. `components/settings/` — 7 Sub-panels, Minimal Detail

Doc 02 lists `SettingsPanel.tsx` and mentions 7 sub-panels but only names them. The extracted components (`ConfigPortal`, `DeveloperPortal`, `DiagnosticsView`, `LocalizationSettings`, `PartsManager`, `ProfileSettings`, `SyncPanel`) lack individual documentation.

### N7. `hooks/actions/types.ts` — Action Handler Types Not Documented

Defines the handler function signatures and result types used by the action system. Doc 04 describes the action system but not this specific types file.

### N8. `hooks/actions/index.ts` — Handler Registry Not Documented

The barrel file that maps action types to handler functions. The registry pattern is described conceptually in Doc 04 but the actual implementation is not shown.

### N9. `services/gemini/types.ts` (21 exports) — High Export Count, Thin Coverage

Doc 05 covers the Gemini types but with 21 exports this is the most export-dense file in the project. Several types (schema builders, request/response shapes) are likely not individually documented.

### N10. `public/locales/en.json` and `public/locales/es.json` (45 lines each) — Locale Files Not Documented

The i18n key structure is not documented. Doc 07 mentions i18next but doesn't catalog the actual translation keys.

### N11. `public/parts/parts-manifest.json` (855 lines) — Parts Manifest Schema Not Documented

Large JSON file describing available FZPZ parts. The schema (fields, required properties, asset paths) is not in any doc.

### N12. `public/assets/` — Asset Directory Structure Not Documented

Four subdirectories (`inventory/`, `mediapipe/`, `ui/`, `ui-png-backup/`) with 40+ files. No doc describes the asset organization, naming conventions, or which components reference which assets.

### N13. `assets/standards/ipc_dimensions.json` (53 lines) — IPC Standards Data Not Documented

Industry-standard component dimension data (IPC footprint standards). Referenced by `standardsService.ts` but the data format is not documented.

### N14. `data/initialInventory.ts` (57 LOC) — Initial Data Not Documented

Default inventory items loaded on first run. Doc 08 describes the persistence system but not the seed data.

### N15. `data/tutorials/index.ts` (46 LOC) — Tutorial Data Structure Not Documented

Tutorial step definitions. `TutorialContext` is documented but the actual tutorial content structure is not.

### N16. `services/tutorialValidator.ts` (15 LOC) — Not Mentioned

Small service that validates tutorial step completion. Not in any doc.

### N17. Error Handling Patterns — Not Systematically Documented

The codebase has 100+ `catch` blocks across ~40 files. The error handling strategy (when to use `console.warn` vs `console.error` vs diagnosticsHub vs ErrorBoundary) is not documented. Top error-handling files:
- `services/gemini/features/components.ts` — 11 catch blocks
- `services/gitService.ts` — 7 catch blocks
- `services/gemini/features/media.ts` — 6 catch blocks

### N18. `window.*` Global Extensions — Partially Documented

Doc 08 lists `window.__CM_DIAG`, `window.__CM_METRICS`, and `window.__CM_TELEMETRY` but the codebase uses `window.*` in 15+ files. Additional window access patterns (event listeners, resize observers, matchMedia queries) are not cataloged.

### N19. `conductor.config.json` and `conductor/` Directory — Not Documented

The Conductor project management system (40+ track directories with specs, plans, and metadata) is referenced nowhere in Phase 1 docs. This is an entire project planning subsystem.

### N20. Test Infrastructure Details — Thin Coverage

Doc 06 mentions Vitest and Playwright but does not document:
- `tests/test-utils.tsx` (3,338 LOC of testing utilities, custom render functions, mock providers)
- `tests/setup.tsx` (2,288 LOC of global test setup)
- `tests/accessibility.test.tsx` (9,176 LOC of accessibility tests)
- Individual test files in `components/__tests__/` (8 files) and `services/__tests__/` (7 files)
- Mock patterns (partStorageService mock requirements, etc.)

### N21. `playwright.config.ts` — Playwright Configuration Not Detailed

Doc 06 mentions Playwright but doesn't document the config (browsers, viewports, test directories, screenshot settings).

### N22. `services/standardsService.ts` (96 LOC) — IPC/Standards Integration Not Documented

Links IPC dimension data to component validation. Not in any doc.

---

## NICE-TO-HAVE — Context Enrichment Opportunities

### H1. Refactoring History Not Captured

Several components were recently refactored with significant LOC reductions:
- `MainLayout.tsx`: 1014 → 608 LOC (hooks extracted to `useMainLayoutActions.ts`)
- `DiagramCanvas.tsx`: ~1226 → ~313 LOC (hooks extracted to `useCanvas*.ts`)
- `useAIActions.ts`: 523 → ~250 LOC (handlers extracted to `hooks/actions/`)

The docs still describe the pre-refactoring architecture in some places.

### H2. `AGENTS.md`, `GEMINI.md`, `README.md`, `PROJECT_STATUS_REPORT.md` — Root Markdown Files

These root-level markdown files provide project context not captured in any Phase 1 doc.

### H3. `CODEX_DONE.md` — Cross-Tool Integration

Evidence of Codex CLI integration. The multi-AI-tool workflow is not documented.

### H4. Audit History (`audits/` Directory, 4 Audit Rounds)

Four full audit rounds with 40+ report files spanning code quality, UI/UX, security, performance, and integrations. None of this audit history is captured in Phase 1 docs.

### H5. `docs/` Directory Structure (18+ Subdirectories)

The existing docs directory has substantial content in:
- `docs/00-context/` (assumptions, system-state, vision)
- `docs/01-product/` (PRD)
- `docs/02-features/` (6 feature docs)
- `docs/03-logs/` (5 log files)
- `docs/04-process/` (10 process docs)
- `docs/plans/` (remediation plans)
- `docs/misc/` (inventory data, wiring rulesets, hacks-and-secrets)

None of this is cross-referenced or summarized in Phase 1 docs.

### H6. `ref/` Directory (12 Files) — Internal Reference Docs

The `ref/` directory contains 12 hand-maintained reference docs (architecture, components, contexts, features, hooks, patterns, pitfalls, product, services, types, visual-analysis-tools, README). Phase 1 docs don't reference these or note where they overlap/diverge.

### H7. `plans/replace-inventory-with-fzpz.md` — Active Migration Plan

An active plan document for migrating the inventory system to FZPZ format. Not captured.

### H8. `playground-hoverboard-wiring.html` — Standalone Demo

A standalone HTML playground file. Not mentioned in any doc.

### H9. Bundle Size Optimization History

Doc 06 mentions the 414KB → 150KB reduction but doesn't document the specific optimization decisions (which imports were lazy-loaded, which dependencies were tree-shaken, the chunk naming strategy rationale).

### H10. Fritzing Parts (`public/parts/`) — 6 FZPZ Files

The project ships with 6 bundled Fritzing parts:
- `Arduino_Uno_R3.fzpz`
- `Breadboard_Large.fzpz`
- `DHT11.fzpz`
- `ESP32_DevKit_V1.fzpz`
- `LED_5mm_Red.fzpz`
- `Resistor_220_Ohm.fzpz`

These are not listed in any doc despite being the default part library.

### H11. MediaPipe Assets (`public/assets/mediapipe/`) — 7 Files

Bundled MediaPipe vision model files (`hand_landmarker.task`, `vision_bundle.js`, `vision_wasm_internal.wasm`, etc.). Not documented.

### H12. UI Asset Pipeline (WebP + PNG Backup)

Two parallel asset directories (`public/assets/ui/` with WebP, `public/assets/ui-png-backup/` with PNG fallbacks). The dual-format strategy and when fallbacks are used is not documented.

### H13. Component Inventory Images (`public/assets/inventory/`) — 9 Images

Pre-bundled component thumbnail images (MCU, sensor icons). Not documented.

### H14. `gemini_env/` — Python Virtual Environment

A Python virtual environment with Google AI libraries. Used by Python scripts in `scripts/`. Not mentioned in any doc's environment setup section.

---

## Cross-Cutting Concerns — Patterns Missing Across All Docs

### X1. Hook Extraction Pattern

The codebase underwent a major hook extraction refactoring. 20+ new hooks were created by extracting logic from monolithic components. Phase 1 docs document the original hooks (listed in Doc 04) but miss most of the extracted hooks (13+ hooks created after the refactoring).

**Hooks documented in Doc 04:** useAIActions, useAutonomySettings, useClickOutside, useConnectivity, useConversations, useEditorModalHandlers, useHoverBehavior, useInventorySync, useNeuralLink, usePermissions, useResizeHandler, useSync, useToast, useActionHistory
**Hooks NOT in any doc (created during refactoring):** useCanvasExport, useCanvasHighlights, useCanvasHUD, useCanvasInteraction, useCanvasLayout, useCanvasWiring, useChatHandler, useDiagram3DScene, useDiagram3DSync, useDiagram3DTelemetry, useEditorAIChat, useEditorFormState, useFocusTrap, useGestureTracking, useKeyboardShortcuts, useMainLayoutActions, useNeuralLinkEffects, useSearchIndex, useSecurityAudit, useAIContextBuilder

**Missing hooks total: 20 hooks, ~3,114 LOC**

### X2. Service → Hook → Component Data Flow

No Phase 1 doc traces the full data flow for any feature end-to-end. For example, the chat feature flow:
```
User types message
  → useChatHandler (hook, 268 LOC) — NOT DOCUMENTED
  → aiContextBuilder.ts (service, 315 LOC) — NOT DOCUMENTED
  → gemini/features/chat.ts (service, documented)
  → responseParser.ts (service, 279 LOC) — NOT DOCUMENTED
  → ConversationContext (context, documented)
  → ChatMessage component (documented)
```

### X3. Canvas Architecture After Refactoring

The canvas was refactored from one 1226-line file to a 313-line orchestrator + 6 extracted hooks + 6 extracted child components. Docs describe the pre-refactoring architecture.

### X4. TODO/FIXME Comments

Only 1 TODO found in the entire production codebase:
- `components/diagram/wiring/BezierWire.tsx:49` — "Implement Catmull-Rom or similar for smooth path through arbitrary points"

This is documented in Doc 06 but worth noting the codebase is remarkably clean of TODO debt.

---

## File Coverage Summary

### Files With Zero Documentation (Critical + Moderate)

| Directory | Undocumented Files | Total LOC |
|-----------|-------------------|-----------|
| `components/diagram/3d/` | 6 files | 1,207 |
| `components/diagram/canvas/` | 6 files | 523 |
| `components/diagram/parts/` | 2 files | 170 |
| `components/layout/assistant/` | 2 files | 367 |
| `components/layout/` | 1 file (ContextMenuOverlay) | 125 |
| `hooks/` (new extracted hooks) | 20 files | 3,114 |
| `services/` (undocumented) | 4 files | 940 |
| `scripts/` (non-TS) | 5 files | 423 |
| **TOTAL** | **46 files** | **6,869 LOC** |

### Documentation Coverage Rate

- **Total project source files** (excluding tests, docs, node_modules): ~185 files
- **Files with substantive documentation**: ~105 files (57%)
- **Files mentioned but thin**: ~34 files (18%)
- **Files completely missing from all docs**: ~46 files (25%)
- **LOC coverage**: ~25,000 LOC documented of ~32,000 total (~78% by LOC)

---

## Recommendations for Phase 2

1. **Highest priority:** Document the 20 extracted hooks (3,114 LOC) — these represent the current architecture but docs describe the old monolithic structure
2. **High priority:** Document the 3D subsystem extraction (`components/diagram/3d/`, 1,207 LOC) — substantial rendering pipeline with no coverage
3. **High priority:** Document the canvas extraction (`components/diagram/canvas/`, 523 LOC) — the current canvas architecture
4. **Medium priority:** Add end-to-end data flow traces for 3-5 key features (chat, wiring, 3D view, export, collaboration)
5. **Medium priority:** Document error handling strategy and patterns
6. **Lower priority:** Catalog public assets, localization keys, and parts manifest schema
7. **Lower priority:** Cross-reference existing `docs/` and `ref/` directories
