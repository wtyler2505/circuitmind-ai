# Research: Improving AI-Generated 3D Models for Electronics

## 1. Overview of AI in Electronics 3D Modeling
Current state-of-the-art involves a mix of approaches:
- **Datasheet Extraction (NLP):** Using LLMs to parse unstructured PDF datasheets for dimensions, electrical specs, and pinouts.
- **Component Classification (CV):** Vision Transformers (ViT) to identify component types from 2D datasheet diagrams.
- **Generative 3D (NeRF/Diffusion):** Creating meshes from text/images. *Risk:* Often lacks engineering precision (topology issues, inaccurate dimensions).
- **Parametric Generation:** Using AI to drive code-based modeling tools (OpenSCAD, Three.js). *Advantage:* High precision, editable, lightweight.

## 2. Parametric & Procedural Generation (The "CircuitMind" Approach)
Since "CircuitMind" generates Three.js code, we focus on enhancing this **parametric** workflow.

### 2.1 Three.js Implementation Techniques
*   **Geometry:** Moving beyond basic `BoxGeometry`. Using `ExtrudeGeometry` for complex shapes (connectors), `LatheGeometry` for radial parts (capacitors), and `Shape` paths for custom footprints.
*   **Materials & Shaders:**
    *   **PCB Substrate:** Use `MeshPhysicalMaterial` with:
        *   `transmission: 0.2` (for FR4 translucency).
        *   `roughness: 0.2`, `clearcoat: 1.0` (solder mask lacquer).
    *   **Procedural Traces:** Use `CanvasTexture` to draw copper traces dynamically at runtime, then use this texture for both `map` (color) and `normalMap` (height).
    *   **Solder Joints:** High `metalness` and `roughness: 0.1` for shiny tin/lead look.

### 2.2 LLM Code Generation Strategy
*   **Context Injection:** The LLM must "know" standard footprint dimensions.
*   **Constraint Checking:** Generated code should include self-validation.
*   **Modular primitives:** Instead of writing raw geometry code every time, the AI should call a library of robust primitives.

## 3. Data Sources: IPC-7351 Standards
The key to accuracy is **Data**. We shouldn't guess dimensions; we should look them up.
*   **Source:** `Kicad-Footprint-Generator` (GitLab/GitHub) contains `ipc_7351b.yaml`.
*   **Usage:** These YAML files contain exact dimensions for standard packages (SOIC, QFP, 0805, etc.).
*   **Strategy:** Convert these YAMLs to a JSON "Knowledge Base" for the AI. When the user asks for a "SOIC-8", the AI retrieves real IPC dimensions from the JSON and generates code using *those* exact numbers.

## 4. Validation & Accuracy
*   **Automated QA:** Comparing the `box.getSize()` of the generated Three.js object against the extracted datasheet dimensions.
*   **Visual Regression:** Comparing 2D projections of the 3D model against datasheet diagrams.

## 5. Next Steps
*   **Implementation:** Build a `PCBMaterial` shader class.
*   **Data Pipeline:** Ingest `ipc_7351b.yaml` into the system.
*   **Refinement:** Update `Diagram3DView` to use these new high-fidelity materials.