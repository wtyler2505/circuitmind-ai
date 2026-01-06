# AI 3D Model Generator Research Log

Purpose: improve quality and accuracy of AI-generated 3D component models in CircuitMind.
Scope: research + documented recommendations, tied to current code pipeline.

## Current Pipeline Snapshot (Codebase)

Primary entrypoints:
- `services/geminiService.ts` (`generateComponent3DCode`): Gemini 2.5 Pro + Google Search grounding.
- `App.tsx`: triggers generation and stores code; toast feedback for 3D gen.
- `components/ThreeViewer.tsx`: executes code via `new Function('THREE', code)` with safety checks.
- `components/diagram/Diagram3DView.tsx`: 3D view for wiring diagram; PBR materials + post effects.

Generation prompt (high-level):
- Search for dimensions, color, pin layout.
- Create Three.js primitives only (no external assets).
- Center on X/Z, bottom on y=0.
- Must end with `return group;`.
- Code-only output, no markdown.

Execution safety and validation:
- Blocked tokens: `window`, `document`, `fetch`, `Function`, etc.
- Required ending: `return group;`.
- Auto-center + scale to fit ~2 units in ThreeViewer.

Known constraints:
- No external resources allowed in generation (no textures, no glTF loads).
- Search results are not directly cited in output code.
- Output quality depends on prompt precision and search accuracy.

## Research Method Log

- Local web search with `ddgr` failed due to DNS error (network resolution).
- Perplexity API used for broad, multi-source survey.
- Context7 used for official Three.js color management guidance.
## Findings: AI Text-to-3D Quality (General)

Key techniques from sources (electronics focus):
- Prompt with explicit dimensions, pin pitch, materials, and component family (SOIC/QFN/etc.).
- Generate multiple variants and select the most accurate base mesh.
- Hybrid workflow: AI for base form, CAD/Blender for precision edits.
- Retopology and manual pin placement for pitch accuracy.
- Validate against datasheets and reference images.

Sources:
- https://www.tomshardware.com/3d-printing/how-to-convert-texts-into-3d-models
  Notes: Emphasizes iterative prompting + post-processing; accuracy requires manual edits.
- https://virtuall.pro/blog-posts/text-to-3-d-model
  Notes: AI outputs need cleanup, UV fixes, and scaling in DCC tools.
- https://superagi.com/from-text-to-reality-a-beginners-guide-to-ai-powered-3d-model-generation-for-product-design/
  Notes: Hybrid AI + CAD reduces time but still needs precision pass.
- https://snlcreative.com/2023/01/27/ai-generated-3d-models-from-images-and-text-descriptions/
  Notes: Emphasizes material specification and post-processing.
- https://research.adobe.com/news/breakthrough-research-behind-text-to-3d/
  Notes: Dual-pipeline (mesh + Gaussian splats) can improve quality for visuals but still needs editability.
- https://blogs.nvidia.com/blog/rtx-ai-garage-blueprint-3d-object-nim-microsoft-trellis/
  Notes: AI pipelines are advancing but still need validation for precision.
## Findings: Mesh Post-Processing and QA

Common cleanup and QA pipeline:
- Fix normals and unify orientation before mesh reconstruction.
- Hole closing for watertight surfaces when needed.
- Smoothing (e.g., Taubin) to reduce noise without losing shape.
- Retopology or decimation for manageable triangle counts.
- QA checks: watertightness, self-intersections, surface smoothness.

Sources:
- https://github.com/amarisesilie/mesh_optimization
  Notes: Highlights smoothing, hole closing, and evaluation criteria.
- https://graphics.cs.yale.edu/sites/default/files/3d_acquisition.pdf
  Notes: Emphasizes reconstruction + cleanup as a distinct pipeline stage.
- https://www.theiamarkerless.com/blog/post-processing-theia3d-data-for-new-visual3d-users
  Notes: Post-processing flow for reconstructed meshes (cleanup + validation).
## Findings: Three.js Rendering Quality and Accuracy

Practical rendering guidance:
- Use consistent units and center geometry at origin for predictable scaling.
- Prefer BufferGeometry and dispose resources to avoid memory leaks.
- Minimize draw calls with instancing and material reuse.
- Use proper color management for realistic materials.
- Keep camera near/far planes tight to reduce z-fighting.

Sources:
- https://discoverthreejs.com/tips-and-tricks/
- https://discourse.threejs.org/t/how-can-i-optimise-my-three-js-rendering/42251
- https://discourse.threejs.org/t/the-most-efficient-way-to-display-heavy-environments/39362
- https://moldstud.com/articles/p-threejs-best-practices-common-queries-answered-for-new-developers
- https://github.com/mrdoob/three.js/wiki/Migration-Guide
  Notes: Color management shift to outputColorSpace + texture colorSpace.
## Recommendations for CircuitMind

### A) Prompt and Search Quality (Upstream)
1) Standardize a prompt template by component family:
   - IC packages: SOIC, QFN, DIP, BGA with pin pitch and body size.
   - Connectors: JST, USB, barrel jack with key dimensions.
2) Require explicit units: all dimensions in mm, pass in prompt.
3) Inject datasheet hints when available (from inventory or component data).
4) Add a "pin layout schema" snippet in prompt (pin count, pitch, side).

### B) Model Validity Checks (Midstream)
1) Validate geometry intent by code scan:
   - Must define base body mesh + pins count >= expected.
   - Check for `group` children count ranges for known families.
2) Automated bounding box checks:
   - If model is extremely flat or tiny, flag and retry prompt.
3) Enforce consistent origin rules:
   - Ensure bounding box min.y == 0 (or near) after execution.

### C) Post-Processing in Viewer (Downstream)
1) Normalize scale based on expected package dimensions (known sizes).
2) Add optional mesh cleanup pass for generated code:
   - Merge geometries when possible (BufferGeometry utils).
   - Apply slight bevel via BoxGeometry + edge roundness for realism.
3) Improve lighting presets for metal vs plastic so pins read better.

### D) Accuracy Pipeline Improvements
1) Build a small curated library of accurate component models and use AI only as fallback.
2) If AI fails, ask user for component package type and key dimensions.
3) Add a "pin pitch helper" UI for rapid corrections (edit pitch, count).

### E) Metrics + QA
1) Log QA metrics per generation:
   - Bounding box dims, pin count, material types, child mesh count.
2) Add a lightweight rubric: scale OK / pin count OK / materials OK.
3) Surface warnings in UI before accepting model.

## Immediate Next Experiments

- Update prompt to include: package family + pin pitch + body dims.
- Add a retry with clarified dimensions when output is under-sized.
- Create a static mapping for 10 common parts (Arduino Uno, breadboard, L293D, LM2596, ESP32, etc.).
