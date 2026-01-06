# Strategic Roadmap: AI-Driven 3D Component Generation

**Status:** Consolidated Research Strategy
**Date:** January 2, 2026
**Target:** CircuitMind "OmniTrek" 3D Engine

## 1. Executive Summary: The Hybrid Parametric Approach
We have evaluated two primary paths for AI 3D generation: pure generative mesh (NeRF/Diffusion) and parametric code generation (Three.js/OpenSCAD).
**Decision:** We will pursue a **Hybrid Parametric Approach**.
*   **Why?** Electronics require engineering precision (0.1mm tolerances), which current generative mesh models lack. Parametric code allows exact dimensioning, clean topology, and runtime editability.
*   **The "Hybrid" Twist:** We will not ask the AI to *guess* dimensions. We will use the AI to *retrieve* standard dimensions from a rigorous database (IPC-7351) and then *assemble* the model using a library of high-fidelity visual primitives.

---

## 2. Data Strategy: The Source of Truth
Accuracy cannot rely on LLM hallucinations. It must be grounded in industry standards.

### 2.1 The IPC-7351 Standard
*   **Objective:** Eliminate dimension guessing for standard packages (SOIC, QFN, 0805, BGA).
*   **Source:** We identified the `Kicad-Footprint-Generator` repository (GitLab/GitHub) as a definitive source of machine-readable dimension data.
*   **Action:**
    *   Ingest `ipc_7351b.yaml` and related files.
    *   Convert these into a local JSON Knowledge Base (`assets/standards/ipc_dimensions.json`).
    *   **Workflow:** User asks for "SOIC-8" -> System looks up `ipc_dimensions.json` -> Retrieves exact `body_width`, `body_length`, `pitch` -> Passes these numbers to the AI.

---

## 3. Visual Strategy: "Cyberpunk Realism"
To achieve the "masterpiece" aesthetic, we move beyond basic Phong materials to Physically Based Rendering (PBR).

### 3.1 Material System (Three.js `MeshPhysicalMaterial`)
*   **PCB Substrate (FR4):**
    *   `transmission: 0.2` (Subsurface scattering simulation).
    *   `roughness: 0.4`, `clearcoat: 1.0` (Simulates the epoxy solder mask layer).
    *   `color`: Deep Cyber-Green (`#004400`) or Custom Black (`#111111`).
*   **Solder Pads:**
    *   `metalness: 1.0`, `roughness: 0.15`.
    *   **Detail:** Procedural noise map for the subtle "grain" of plastic packaging.
*   **IC Bodies (Epoxy):**
    *   `roughness: 0.7`, `color`: Charcoal (`#222222`).

### 3.2 Procedural Traces & Shaders
*   **No Textures Required:** We will not load external textures.
*   **Technique:** Use `Three.CanvasTexture` to programmatically draw copper traces and pads at runtime based on the pin layout.
*   **Normal Mapping:** This dynamic canvas will generate a Normal Map, giving the traces "height" so they catch the light under the solder mask.

---

## 4. Generation Pipeline Architecture

### 4.1 The "Primitives Library"
Instead of asking the AI to write raw `THREE.BufferGeometry` code (which is error-prone), we will provide high-level "Lego blocks" in `ThreeViewer` context:
*   `createICBody(width, length, height, type)`
*   `createPinRow(count, pitch, axis)`
*   `createSolderPad(shape, dimensions)`
*   `createConnectorHousing(style, dimensions)`

### 4.2 Prompt Engineering Strategy
*   **Context Injection:** The prompt will include the retrieved IPC dimensions.
*   **Template:**
    ```text
    "Create a 3D model for a {component_name} ({package_type}).
    Use the following EXACT dimensions:
    - Body: {width}x{length}x{height} mm
    - Pitch: {pitch} mm
    Use the provided 'Primitives' library. Do not use raw geometry."
    ```

---

## 5. Validation & Quality Assurance (QA)

### 5.1 Automated Geometry Checks
*   **Bounding Box Check:** After generation, calculate `new THREE.Box3().setFromObject(model)`. Compare dimensions against the datasheet/IPC specs. Allow <5% deviation.
*   **Poly Count:** Warn if >10,000 triangles (inefficient).
*   **Hierarchy:** Ensure standard structure (`Group` -> `Mesh` children).

### 5.2 Visual Regression
*   Capture 2D snapshots of generated models from top/side views.
*   Compare against a "Golden Set" of approved models to detect regression in generator quality.

---

## 6. Implementation Roadmap

### Phase 1: Foundations (Days 1-2)
- [ ] Create `assets/standards/ipc_dimensions.json` from KiCad data.
- [ ] Implement `ThreePrimitives.ts` (The high-level builder functions).
- [ ] Upgrade `Diagram3DView` materials to PBR (`MeshPhysicalMaterial`).

### Phase 2: The Generator (Days 3-4)
- [ ] Update `geminiService.ts` to perform the "IPC Lookup" before prompting.
- [ ] Refine the System Prompt to enforce use of `ThreePrimitives`.
- [ ] Implement `CanvasTexture` generator for procedural traces.

### Phase 3: Polish & QA (Day 5)
- [ ] Add Bounding Box validation logic.
- [ ] UI Update: "Regenerate with different Package" (e.g., switch DIP to SOIC).