# Deep-Dive Supplements: Internal Algorithms & Runtime Behavior

> This document supplements the Phase 1 documentation by going deep into the actual source code of complex subsystems. Where Phase 1 says "it exists," this document explains **exactly how it works** with code-level detail, data flow diagrams, and concrete examples.

---

## Table of Contents

1. [Wiring Generation Algorithm](#1-wiring-generation-algorithm)
2. [Component Validation Pipeline](#2-component-validation-pipeline)
3. [Conflict Resolution System](#3-conflict-resolution-system)
4. [3D Scene Management](#4-3d-scene-management)
5. [Gesture Recognition Pipeline](#5-gesture-recognition-pipeline)
6. [Search Indexing System](#6-search-indexing-system)
7. [Simulation Engine](#7-simulation-engine)
8. [Macro Recording & Playback](#8-macro-recording--playback)
9. [Tutorial System](#9-tutorial-system)
10. [Dashboard Widget System](#10-dashboard-widget-system)

---

## 1. Wiring Generation Algorithm

**Source files**: `services/gemini/features/wiring.ts`, `components/diagram/Wire.tsx`, `components/diagram/wiring/BezierWire.tsx`, `services/circuitAnalysisService.ts`, `services/gemini/types.ts`, `services/gemini/prompts.ts`

### 1.1 End-to-End Data Flow

The wiring generation pipeline has four distinct phases:

```
User Prompt + Inventory
        |
        v
[Phase 1: Prompt Construction]
  - formatInventoryContext() serializes all components
  - PROMPTS.WIRING_SYSTEM() builds system prompt with inventory
        |
        v
[Phase 2: AI Generation via Gemini 2.5 Pro]
  - Uses MODELS.WIRING (gemini-2.5-pro, chosen for accuracy)
  - Constrained to WIRING_SCHEMA (structured JSON output)
  - responseMimeType: "application/json"
  - systemInstruction: "Favor components from inventory. Use precise IDs from context."
        |
        v
[Phase 3: Post-Processing & Validation]
  - JSON.parse(response.text) -> WiringDiagram
  - circuitAnalysisService.analyze(result) runs rule-based checks
  - aiMetricsService.logMetric() records latency & success
        |
        v
[Phase 4: SVG Rendering]
  - Wire.tsx resolves pin positions from component geometry
  - BezierWire.tsx calculates SVG path curves
  - Wire labels rendered at midpoint of connection
```

### 1.2 Inventory Context Serialization

The `formatInventoryContext()` function (in `prompts.ts`) converts the user's component library into a string the AI can reference:

```typescript
// Each component becomes: "ID:mcu-arduino-uno-r3 - Arduino Uno R3 (microcontroller) [Pins: VCC, GND, D2, D3, ...]"
const formatInventoryContext = (inventory: ElectronicComponent[]): string => {
  return inventory.map(c => {
    const pinsStr = c.pins && c.pins.length > 0
      ? `[Pins: ${c.pins.join(', ')}]`
      : '[No pins defined]';
    return `ID:${c.id} - ${c.name} (${c.type}) ${pinsStr}`;
  }).join('; ');
};
```

The critical instruction in the system prompt is: **"If you use components from the provided inventory, YOU MUST USE THE EXACT SAME ID provided in the context."** This ensures the AI-generated diagram references real inventory items, not hallucinated ones.

### 1.3 WIRING_SCHEMA: Constraining AI Output

The `WIRING_SCHEMA` (in `services/gemini/types.ts`) forces Gemini to return structured JSON matching the `WiringDiagram` interface. Key constraints:

- **Components**: Must include `id`, `name`, `type`, `description`, and `pins` (all required)
- **Connections**: Must include `fromComponentId`, `fromPin`, `toComponentId`, `toPin` (all required); `description` and `color` are optional
- **Root object**: Must include `title`, `components`, `connections`, `explanation` (all required)

Using `responseMimeType: "application/json"` with `responseSchema` means Gemini is structurally constrained -- it cannot return free-text or malformed JSON. This is the first line of defense against hallucinated structures.

### 1.4 Circuit Analysis: Post-Generation Validation

After Gemini returns a diagram, `circuitAnalysisService.analyze()` runs four heuristic checks:

1. **Floating Component Detection**: Any component with zero connected pins gets a warning. Microcontrollers lacking VCC/GND connections get a critical error.

2. **Power Supply Check**: If no component has `type === 'power'` and no component name contains "battery" or "supply," a critical error is raised.

3. **Voltage Level Compatibility**: If the diagram mixes 3.3V components (ESP32, RP2040) with 5V components (Arduino Uno, Relays), a warning recommends logic level shifters.

4. **LED Current Limiting**: If LEDs exist but no resistors are found, a warning about current-limiting resistors is raised.

The analysis result is logged but **does not block** the diagram from rendering. This is a deliberate design choice -- users see the diagram with warnings rather than getting a blank canvas.

### 1.5 Wire Rendering: Pin Position Calculation

`Wire.tsx` calculates where each wire connects on the SVG canvas using a deterministic algorithm:

```
For each wire connection:
  1. Find startComponent and endComponent by ID
  2. Look up pin index: startPinIdx = component.pins.indexOf(connection.fromPin)
  3. If pin found (index != -1):
     - X: Component left edge (0) if target is to the left, else right edge (+120px)
     - Y: 40px offset + (pinIndex * 15px) spacing
  4. If pin NOT found (hallucinated pin):
     - Fall back to component center: (+60px, +40px)
  5. Pass (x1,y1) -> (x2,y2) to BezierWire
```

The "missing pin" fallback (step 4) is the **red pulsing dot** behavior mentioned in the architecture docs. Rather than crashing, the wire connects to the component center, making the hallucinated pin visible but non-destructive.

### 1.6 Bezier Curve Generation

`BezierWire.tsx` generates SVG paths using two strategies:

**Two-point connection** (no intermediate waypoints):
```
M startX startY C startX (startY+50), endX (endY+50), endX endY
```
This creates a cubic Bezier with control points pushed 50px below the start and end points, producing a natural downward "droop" like a physical wire. The control distance is calculated from the Euclidean distance between endpoints but capped at 150px to prevent extreme curves.

**Multi-point connection** (with `WirePoint[]` waypoints):
Currently uses linear segments (`L x y`) as a placeholder. There is a TODO to implement Catmull-Rom spline interpolation for smooth curves through arbitrary points. This is the only known tech debt item in the wire rendering system.

### 1.7 Wire Visual Layers

Each wire renders as three overlapping SVG paths:
1. **Selection highlight** (8px wide, white semi-transparent) -- only visible when selected
2. **Core wire** (3px wide, connection color) -- the main visible wire with drop-shadow
3. **Insulation shine** (1px wide, white 30% opacity) -- offset 0.5px upward, mimics light reflection on real wire insulation (Fritzing-inspired aesthetic)

---

## 2. Component Validation Pipeline

**Source file**: `services/componentValidator.ts` (502 LOC)

### 2.1 Architecture Overview

The validator enforces the **"Inventory is Single Source of Truth"** principle through five exported functions that operate in a pipeline:

```
[validateDiagramInventoryConsistency]  -- Detect mismatches
        |
        v
[analyzeUsage]  -- Understand how a component is used
        |
        v
[determineOrphanAction]  -- Decide what to do about deletions
        |
        v
[syncComponentWithInventory / syncDiagramWithInventory]  -- Fix mismatches
        |
        v
[removeOrphanedComponents]  -- Clean up dead references
```

### 2.2 Validation Logic: Field-by-Field Comparison

`validateDiagramInventoryConsistency()` iterates every component in the diagram and checks it against inventory:

**Step 1 -- Source Resolution**:
- If component has `sourceInventoryId`: look up directly in inventory map
- If no `sourceInventoryId` (legacy component): extract base ID by splitting on `-` and look up prefix
- If neither works: mark as **orphaned** (warning severity)

**Step 2 -- Field Comparison** (via `compareComponent()`):
- `name`: Must match exactly (error if different)
- `type`: Must match exactly (error if different)
- `pins`: Order-independent comparison using `Set` equality (error if different)

The result is a `ValidationResult` containing `isValid` (boolean), `mismatches` (array), `orphanedCount`, `syncedCount`, and `totalChecked`.

### 2.3 Usage Analysis for Safe Deletion

Before allowing an inventory item to be deleted, `analyzeUsage()` scans the current diagram AND all saved diagrams:

```typescript
interface ComponentUsage {
  inventoryId: string;
  inDiagramCount: number;        // How many diagrams reference this component
  hasActiveConnections: boolean;   // Does it have wires attached?
  connectionCount: number;         // Total wire count
  inSavedDiagrams: boolean;       // Is it in any saved (not draft) diagram?
  onlyInDrafts: boolean;          // Is it only in unsaved work?
  diagramIds: string[];           // Which diagrams use it
}
```

Component matching uses three strategies: exact `sourceInventoryId` match, exact `id` match, and prefix match (`id.startsWith(inventoryId + '-')`).

### 2.4 Orphan Action Decision Tree

`determineOrphanAction()` returns one of three actions based on usage analysis:

```
Has active wire connections?
  YES -> BLOCK: "Cannot delete: component is used in N wire connection(s). Remove wires first."
  NO  -> Continue...

Referenced in saved diagrams?
  YES -> WARN: "Component is used in N saved diagram(s): [names]. Remove from all?"
  NO  -> Continue...

Referenced in current/draft diagram?
  YES -> CASCADE: "Component will be removed from current diagram (no saved references)."
  NO  -> CASCADE: "Component is not used in any diagrams."
```

This three-tier approach prevents accidental data loss: `BLOCK` is unbypassable (wires must be removed first), `WARN` requires confirmation, and `CASCADE` proceeds automatically.

### 2.5 Legacy ID Migration

`migrateLegacyDiagram()` handles diagrams created before the semantic ID system was introduced. It uses a hardcoded mapping:

```typescript
const LEGACY_ID_MAP = {
  'mcu': 'mcu-arduino-uno-r3',
  'pot': 'other-potentiometer',
  'servo': 'actuator-servo',
  'hcsr04': 'sensor-hcsr04',
  'dht11': 'sensor-dht11',
  'lcd': 'display-lcd1602',
  // ... etc
};
```

The migration strategy is: (1) check `LEGACY_ID_MAP` for the base ID, (2) check `LEGACY_ID_MAP` for the lowercase component name, (3) fall back to exact name match against current inventory. This ensures old diagrams remain loadable as the ID system evolves.

### 2.6 Sync and Cleanup

`syncDiagramWithInventory()` propagates inventory changes into diagrams by overwriting `name`, `type`, `description`, `pins`, `datasheetUrl`, and `imageUrl` from the inventory source while **preserving the diagram instance `id`** (which encodes position and instance-specific data).

`removeOrphanedComponents()` not only removes components without inventory sources but also **cascades to connections**: any wire referencing a removed component is also removed.

---

## 3. Conflict Resolution System

**Source file**: `components/diagram/ConflictResolver.tsx`

### 3.1 When Conflicts Occur

Conflicts arise during **real-time collaboration** via Yjs CRDT. When two users simultaneously modify the same diagram property (e.g., both change the title, or both add conflicting connections), the CRDT layer detects the divergence and surfaces it to the ConflictResolver.

### 3.2 Resolution Strategy: Choose-One

The current implementation uses a **binary choice** model (not three-way merge):

```
ConflictResolverProps:
  local: WiringDiagram   -- The user's current version
  remote: WiringDiagram  -- The peer's incoming version
  onResolve: (resolved: WiringDiagram) => void  -- Callback with chosen version
```

The UI presents a side-by-side comparison showing:
- Title of each version
- Component count
- Connection count
- Explanation text

Users choose either "KEEP LOCAL VERSION" or "ACCEPT REMOTE VERSION." The chosen `WiringDiagram` is passed to `onResolve()`, which propagates it back through the Yjs document.

### 3.3 UI Implementation Details

- **Modal behavior**: Full-screen overlay at z-index 200 (above all other UI elements)
- **ARIA roles**: Uses `role="alertdialog"` with `aria-modal="true"` and `aria-labelledby`
- **Focus management**: Integrated with `useFocusTrap` hook to prevent focus escape
- **Visual hierarchy**: Local version styled with neon-cyan, remote with neon-amber
- **Warning**: Explicit note that "Selecting a version will overwrite the other. This action cannot be undone."

### 3.4 Limitations

The current system does not support:
- **Three-way merge** (combining changes from both versions)
- **Field-level resolution** (choosing local title but remote connections)
- **Diff visualization** (showing exactly which components/connections differ)

These are deliberate simplifications for the current collaboration model.

---

## 4. 3D Scene Management

**Source files**: `components/ThreeViewer.tsx`, `services/threeCodeRunner.ts`, `services/threeCodeValidator.ts`, `services/threePrimitives.ts`

### 4.1 Architecture: Security-First AI Code Execution

The 3D system executes **AI-generated Three.js code** in a sandboxed pipeline:

```
AI generates Three.js code (via Gemini 2.5 Pro)
        |
        v
[Validation Layer 1: ThreeViewer.validateThreeCode()]
  - Must contain "return group" pattern
  - securityAuditor.scanAIGeneratedCode() checks for exploits
        |
        v
[Validation Layer 2: threeCodeValidator.ts]
  - 27 forbidden patterns (eval, fetch, window, document, etc.)
  - Required patterns (THREE., Primitives., Materials.)
  - 50KB max code length
        |
        v
[Sandboxed Execution: Web Worker]
  - threeCodeRunner.ts spawns a fresh Worker per execution
  - 5-second timeout kills infinite loops
  - Worker returns serialized JSON (not live objects)
        |
        v
[Deserialization: THREE.ObjectLoader]
  - JSON parsed into Three.js Object3D
  - Auto-scaled to fit 30-unit bounding box
  - Centered and positioned in scene
```

### 4.2 Security: Forbidden Pattern List

The `threeCodeValidator.ts` blocks 27 patterns that could escape the sandbox:

| Category | Blocked Patterns |
|----------|-----------------|
| Code execution | `eval()`, `Function()`, `import()`, `require()` |
| Network access | `fetch()`, `XMLHttpRequest`, `WebSocket` |
| DOM access | `window`, `document`, `localStorage`, `sessionStorage`, `cookie` |
| Message passing | `postMessage`, `self[` |
| Global access | `globalThis`, `__proto__`, `constructor[` |
| System access | `Process`, `child_process` |

The validator also enforces that code **must** reference `THREE.`, `Primitives.`, or `Materials.` -- ensuring it is actually Three.js code and not an arbitrary script injection.

### 4.3 Worker Execution Model

Each code execution creates a **fresh, disposable Web Worker**:

```typescript
// threeCodeRunner.ts
const executeInWorker = (code: string): Promise<any> => {
  const worker = new ThreeCodeWorker();
  const timeout = setTimeout(() => {
    worker.terminate();
    reject(new Error('Execution timed out (5s limit)'));
  }, 5000);

  worker.postMessage({ code });
  // Worker returns { success: true, json: {...} } or { success: false, error: "..." }
  // Worker is terminated after every execution
};
```

Key properties:
- **Isolation**: Each execution gets a fresh worker (no shared state between executions)
- **Timeout**: 5-second hard limit prevents infinite loops
- **Serialization boundary**: Worker returns JSON, not live Three.js objects. The main thread deserializes using `THREE.ObjectLoader.parse()`

### 4.4 Scene Setup and Lifecycle

`ThreeViewer.tsx` manages a complete Three.js scene with these components:

**Scene composition** (created once in `useEffect`):
- `THREE.Scene` with dark background (`#0a0a12`) and fog
- `PerspectiveCamera` at position (50, 50, 50) with 40-degree FOV
- `WebGLRenderer` with antialiasing, PCF soft shadows, ACES filmic tone mapping
- `OrbitControls` with damping (0.05) and auto-rotation (2 RPM)
- PMREM environment map generated from a studio-style `RectAreaLight`
- `AmbientLight` + `DirectionalLight` with configurable intensity/color
- 100x100 grid helper
- Animated scan-line plane (additive blending, oscillates vertically)

**Content loading** (triggered by `code` or `modelUrl` prop changes):
1. Dispose previous content (`disposeObject()` recursively cleans meshes, geometries, materials, textures)
2. If `code`: validate, execute in worker, deserialize JSON, auto-scale to 30 units, center
3. If `modelUrl`: load via `GLTFLoader`, same auto-scale and centering logic
4. On error: render red wireframe cube as fallback, show error message with retry button

**X-Ray mode**: Toggles opacity of dark meshes (`roughness > 0.6` and `color === 0x222222`) to 10%, allowing users to see through PCB enclosures.

### 4.5 Memory Management

The `disposeObject()` function handles Three.js cleanup:

```typescript
const disposeObject = (obj: THREE.Object3D) => {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        mat.dispose();
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.map?.dispose();
          mat.normalMap?.dispose();
          mat.roughnessMap?.dispose();
          mat.metalnessMap?.dispose();
          mat.emissiveMap?.dispose();
        }
      });
    }
  });
};
```

On unmount, the cleanup effect also disposes: environment texture, PMREM data, controls, renderer, and calls `disposeCaches()` from `threePrimitives.ts` (clears shared geometry/material caches).

### 4.6 Resize Handling

Uses `ResizeObserver` with a debounced (16ms) `requestAnimationFrame` callback. Skips resize if dimensions change by less than 1px to avoid unnecessary projection matrix recalculations.

---

## 5. Gesture Recognition Pipeline

**Source files**: `services/gesture/GestureEngine.ts`, `services/gesture/GestureMetricsService.ts`, `hooks/useGestureTracking.ts`

### 5.1 Architecture: Worker-Based MediaPipe Integration

The gesture system uses MediaPipe's Hand Landmarker running inside a Web Worker:

```
Camera Feed (HTMLVideoElement)
        |
        v
[GestureEngine.processFrame()]
  - createImageBitmap(video) captures current frame
  - ImageBitmap transferred to worker (zero-copy via transferable)
  - Single-flight: if worker is processing, frame is dropped
        |
        v
[Web Worker: gestureWorker.js]
  - MediaPipe Hand Landmarker model (loaded on INIT)
  - Detects 21 hand landmarks per hand
  - Returns landmarks + worldLandmarks + handedness
        |
        v
[Listener System]
  - gestureEngine.onLandmarks(callback) -- pub/sub pattern
  - Multiple consumers can subscribe
        |
        v
[useGestureTracking Hook]
  - Interprets landmarks as gestures (pinch, palm, swipe)
  - Dispatches synthetic PointerEvents to DOM elements
  - Logs metrics via GestureMetricsService
```

### 5.2 Gesture Detection Algorithms

`useGestureTracking.ts` interprets raw landmark data into three gesture types:

**Pinch Detection** (selection/drag):
```
indexTip = landmarks[8]   // Index finger tip
thumbTip = landmarks[4]   // Thumb tip
distance = sqrt((indexTip.x - thumbTip.x)^2 + (indexTip.y - thumbTip.y)^2)
isPinching = distance < 0.1  // Threshold in normalized coordinates (0-1)
```

**Palm Open Detection** (panning):
```
isPalmOpen = ALL of:
  - indexTip.y < landmarks[6].y    (index finger extended)
  - middleTip.y < landmarks[10].y  (middle finger extended)
  - ringTip.y < landmarks[14].y    (ring finger extended)
  - pinkyTip.y < landmarks[18].y   (pinky finger extended)
```
This checks that all four fingertips are above their respective MCP joints (i.e., fingers are extended).

**Swipe Detection** (tab switching):
```
velocity = deltaX / deltaTime  // Horizontal velocity
if |velocity| > 0.001:
  direction = velocity > 0 ? 'left' : 'right'
  // Cycle through assistant tabs: chat, bootcamp, history, analytics, audit
  // 800ms cooldown between swipes
```

### 5.3 Synthetic Event Dispatch

To interact with the existing SVG canvas (which expects mouse/pointer events), the gesture system creates synthetic `PointerEvent` objects:

```typescript
const createSyntheticEvent = (type: string) =>
  new PointerEvent(type, {
    clientX, clientY,     // Mapped from hand position to viewport coordinates
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'mouse', // Masquerades as mouse for compatibility
    buttons: 1,
    isPrimary: true
  });
```

A critical detail: the code **temporarily overrides `setPointerCapture` and `releasePointerCapture`** on target elements before dispatching events, because synthetic events do not have real pointer IDs and would throw errors on capture attempts.

### 5.4 Performance Optimizations

1. **Single-flight processing**: `isProcessing` flag prevents frame queue buildup
2. **ImageBitmap transfer**: Uses `Transferable` objects (zero-copy to worker)
3. **Element lookup throttling**: `document.elementFromPoint()` (which triggers forced reflow) is only called when the hand moves more than 10px from the last lookup position
4. **Cached element reference**: `lastElementRef` reuses the previous DOM element for events until the threshold is crossed

### 5.5 Metrics Collection

`GestureMetricsService` collects per-gesture metrics:

```typescript
interface GestureMetric {
  gestureType: string;    // 'PINCH_SELECT', etc.
  confidence: number;     // 1 - distance (higher = more confident pinch)
  success: boolean;
  latencyMs: number;      // Time from detection to event dispatch
}
```

Metrics buffer in memory (up to 10 entries) before flushing to `storageService` under key `cm_gesture_metrics`. The storage is capped at 100 entries (rolling window).

---

## 6. Search Indexing System

**Source files**: `services/search/searchIndexer.ts`, `hooks/useSearchIndex.ts`

### 6.1 MiniSearch Configuration

The search system uses MiniSearch (a lightweight full-text search library) with these settings:

```typescript
new MiniSearch({
  fields: ['title', 'body', 'tags'],          // Indexed fields (searchable)
  storeFields: ['category', 'title', 'body', 'reference'],  // Stored fields (returned in results)
  searchOptions: {
    boost: { title: 2 },   // Title matches weighted 2x
    fuzzy: 0.2,            // 20% character edit distance tolerance
    prefix: true           // Prefix matching enabled (e.g., "ard" matches "arduino")
  }
});
```

### 6.2 Document Categories

Each indexed document has a `category` field used for filtered searches:

| Category | Source | Content |
|----------|--------|---------|
| `component` | Inventory items | Name, description, type, pins |
| `diagram` | Diagram components | Component name, parent diagram title, pin list |
| `knowledge` | (reserved) | For future knowledge base integration |
| `action` | (reserved) | For future action search |

### 6.3 Indexing Pipeline

The `useSearchIndex` hook rebuilds the index whenever inventory or diagram changes:

```
[InventoryContext changes] or [DiagramContext changes]
        |
        v
useEffect triggers re-index
        |
        v
Build document array:
  - For each inventory item:
      id: "inv-{component.id}"
      title: component.name
      body: component.description
      tags: [component.type, ...component.pins]
      reference: full component object

  - For each diagram component:
      id: "diag-comp-{component.id}"
      title: "Project: {component.name}"
      body: "Part of {diagram.title}. Pins: {pins}"
      reference: component.id (string, not object)
        |
        v
searchIndexer.index(docs)
  -> miniSearch.removeAll()  // Full rebuild (not incremental)
  -> miniSearch.addAll(docs) // Re-index everything
```

### 6.4 Search Execution

```typescript
search(query: string, category?: SearchableCategory): IndexedDocument[]
```

When `category` is provided, results are filtered using MiniSearch's `filter` option. Due to a TypeScript limitation (MiniSearch's `SearchResult` type does not include stored fields at compile time), the filter callback requires an `any` cast:

```typescript
const searchOptions = category
  ? { filter: (res: any) => res.category === category }
  : undefined;
return this.miniSearch.search(query, searchOptions) as unknown as IndexedDocument[];
```

### 6.5 Design Tradeoffs

- **Full rebuild on every change**: The `removeAll() -> addAll()` approach is simple but O(n) on every inventory/diagram change. This is acceptable because the local dataset is small (typically <100 components).
- **No persistence**: The index lives only in memory. On page reload, it is rebuilt from the React state that loads from IndexedDB/localStorage.
- **Fuzzy + prefix**: The 0.2 fuzziness combined with prefix matching means "arduno" will match "Arduino Uno" (fuzzy corrects the typo) and "dht" will match "DHT11" (prefix match).

---

## 7. Simulation Engine

**Source files**: `services/simulationEngine.ts`, `contexts/SimulationContext.tsx`

### 7.1 Simulation Algorithm: DC Nodal Analysis (Simplified)

The simulation engine performs a lightweight DC analysis with logic-level propagation:

```
[Phase 1: Initialize Pin States]
  - Every pin on every component starts as FLOATING (0V, 0A)

[Phase 2: Build Net Adjacency Map]
  - For each WireConnection: create bidirectional edges
  - Key: "componentId:pinName" -> Set of connected pins

[Phase 3: Propagate Power Sources]
  - Find all 'power' type components
  - For VCC/VIN/5V/3V3 pins: propagate HIGH at appropriate voltage
  - For GND pins: propagate LOW at 0V
  - Propagation uses DFS with visited-set cycle detection

[Phase 4: Detect Conflicts]
  - If a pin was already set to a different logic state: mark as ERROR
```

### 7.2 Net Building

The `buildNets()` method creates a bidirectional adjacency graph:

```typescript
// Input: connections = [{fromComponentId: "mcu1", fromPin: "D2", toComponentId: "led1", toPin: "IN"}]
// Output: Map {
//   "mcu1:D2" -> ["led1:IN"],
//   "led1:IN" -> ["mcu1:D2"]
// }
```

### 7.3 Voltage Propagation

The `propagateNet()` method uses depth-first search (DFS) via an explicit stack (not recursion):

```
Input: startPin="VCC", compId="pwr1", voltage=5.0, logic='HIGH'
Stack: ["pwr1:VCC"]

While stack not empty:
  current = stack.pop()       // e.g., "pwr1:VCC"
  if visited: skip
  mark visited

  if state already set to different logic:
    set logicState = 'ERROR'  // Conflict detected
  else:
    set voltage = 5.0
    set logicState = 'HIGH'

  push all neighbors onto stack
```

This is O(V+E) where V = total pins and E = total connections. The explicit stack avoids stack overflow for large circuits.

### 7.4 Voltage Detection Heuristic

The engine determines voltage from component names:

```typescript
const voltage = comp.name.includes('3.3V') ? 3.3 : 5.0;
```

Pin identification uses case-insensitive matching:

```typescript
const vccPin = comp.pins?.find(p =>
  p.toUpperCase() === 'VCC' ||
  p.toUpperCase() === 'VIN' ||
  p === '5V' ||
  p === '3V3'
);
```

### 7.5 SimulationContext: Lifecycle Management

The `SimulationProvider` wraps the engine with React lifecycle management:

- **Continuous mode**: When `isSimulating === true`, runs `solve()` every 500ms (2Hz) via `setInterval`. This is intentionally low-frequency to save battery.
- **Reactive mode**: Even when not continuously simulating, runs `solve()` once whenever the diagram changes (via `useEffect` dependency on `diagram`).
- **Short-circuit notification**: If `result.isShortCircuit` is true, pushes a `critical` severity notification with 10-second duration.

### 7.6 Pin State Data Structure

```typescript
interface SimNodeState {
  voltage: number;           // 0, 3.3, or 5.0
  current: number;           // Always 0 in current implementation (placeholder)
  logicState: 'HIGH' | 'LOW' | 'FLOATING' | 'ERROR';
}

// States are keyed as "componentId:pinName"
// Example: { "mcu1:D2": { voltage: 5.0, current: 0, logicState: 'HIGH' } }
```

### 7.7 Known Limitations

- **No current calculation**: The `current` field is always 0 (placeholder for future Ohm's law integration)
- **No resistor modeling**: Resistors are not recognized as components that affect voltage
- **No short-circuit detection**: The `isShortCircuit` flag is declared but never set to `true` (future work)
- **No capacitor/inductor**: AC analysis is out of scope
- **Binary power model**: Only recognizes `power` type components as voltage sources; does not model microcontroller output pins as sources

---

## 8. Macro Recording & Playback

**Source files**: `services/macroEngine.ts`, `contexts/MacroContext.tsx`

### 8.1 Data Model

```typescript
interface WorkflowStep {
  id: string;              // Timestamp-based ID
  action: ActionIntent;    // The full action intent (type, payload, label, safe)
  description: string;     // Human-readable label from action.label
  delay?: number;          // Optional delay in ms before next step
}

interface MacroWorkflow {
  id: string;              // Timestamp-based ID
  name: string;            // User-provided name
  steps: WorkflowStep[];   // Ordered sequence of actions
  author: 'user' | 'ai' | 'system';  // Who created it
  created: number;         // Timestamp
}
```

### 8.2 Recording Flow

```
User clicks "Record" button
        |
        v
MacroContext.setIsRecording(true)
        |
        v
[User performs actions normally]
  Each action dispatched through the AI action system
  triggers MacroContext.addRecordedStep(actionIntent)
        |
        v
Steps accumulate in recordedSteps[] state
        |
        v
User clicks "Save Macro" with a name
        |
        v
MacroContext.saveMacro(name):
  1. Creates MacroWorkflow with current recordedSteps
  2. Appends to savedMacros array
  3. Persists to localStorage('cm_macros')
  4. Clears recordedSteps
  5. Sets isRecording = false
```

### 8.3 Playback Engine

The `MacroEngine.execute()` method replays steps sequentially:

```typescript
async execute(
  steps: WorkflowStep[],
  executeAction: (action: ActionIntent) => Promise<any>,
  onProgress?: (stepIndex: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (onProgress) onProgress(i, steps.length);
    await executeAction(step.action);        // Execute the action
    if (step.delay) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }
  }
}
```

Key characteristics:
- **Sequential execution**: Each step must complete (`await`) before the next begins
- **Same action pipeline**: Uses the same `executeAction` function as normal user actions, meaning safety checks still apply
- **Optional delays**: Steps can have custom delays between them (useful for animated demonstrations)
- **Progress reporting**: Caller can provide a callback for progress UI

### 8.4 Persistence

Macros persist in `localStorage` under key `cm_macros` as a JSON array. Loaded on `MacroProvider` mount with try/catch fallback to empty array. Since macros reference `ActionIntent` objects (which contain `ActionType` strings and JSON payloads), they are fully serializable.

### 8.5 Author Classification

The `author` field distinguishes:
- `'user'`: Manually recorded by the user
- `'ai'`: Generated by the AI assistant (e.g., "Here's a macro that builds a blink circuit")
- `'system'`: Built-in tutorial macros

---

## 9. Tutorial System

**Source files**: `contexts/TutorialContext.tsx`, `services/tutorialValidator.ts`

### 9.1 Data Model

```typescript
interface TutorialStep {
  id: string;
  title: string;
  instructions: string;           // Markdown instructions shown to user
  mentorTip?: string;             // Optional hint from the "mentor" persona
  targetElementId?: string;       // DOM element to highlight
  condition: (state: {            // Completion condition function
    diagram: WiringDiagram | null;
    inventory: ElectronicComponent[];
  }) => boolean;
}

interface TutorialQuest {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  steps: TutorialStep[];
}
```

### 9.2 Auto-Validation Loop

The tutorial system uses a **reactive validation pattern** -- instead of checking step completion on button click, it monitors application state continuously:

```typescript
useEffect(() => {
  if (activeQuest) {
    const currentStep = activeQuest.steps[currentStepIndex];
    const isDone = validateStep(currentStep, diagram, inventory);

    if (isDone) {
      const timer = setTimeout(() => { nextStep(); }, 800);
      return () => clearTimeout(timer);
    }
  }
}, [activeQuest, currentStepIndex, diagram, inventory, nextStep]);
```

The effect re-runs whenever `diagram` or `inventory` changes (i.e., whenever the user performs any action). If the current step's `condition` function returns `true`, the system automatically advances after an 800ms delay (for visual feedback).

### 9.3 Step Validation

`tutorialValidator.ts` is a thin wrapper that catches errors in condition functions:

```typescript
export const validateStep = (
  step: TutorialStep,
  diagram: WiringDiagram | null,
  inventory: ElectronicComponent[]
): boolean => {
  try {
    return step.condition({ diagram, inventory });
  } catch (e) {
    console.error('Tutorial validation error:', e);
    return false;
  }
};
```

This is important because condition functions are defined in tutorial data files and may reference properties that do not exist (e.g., checking `diagram.components.length` when `diagram` is null). The try/catch prevents tutorial crashes from breaking the entire application.

### 9.4 Quest Lifecycle

```
startQuest(quest):
  -> Sets activeQuest, resets currentStepIndex to 0, clears completedSteps

[Auto-validation loop runs]

nextStep():
  -> If not last step: adds current step ID to completedSteps, increments index
  -> If last step: calls completeQuest()

completeQuest():
  -> Clears activeQuest, resets index, clears completedSteps

resetTutorial():
  -> Resets index and completedSteps but keeps activeQuest active
```

### 9.5 Context Dependencies

`TutorialProvider` depends on both `DiagramContext` and `InventoryContext` (via `useDiagram()` and `useInventory()` hooks). This means TutorialProvider **must be nested inside** both providers in the App.tsx provider tree. The current nesting order in App.tsx ensures this.

---

## 10. Dashboard Widget System

**Source file**: `contexts/DashboardContext.tsx`

### 10.1 Widget Data Model

```typescript
interface WidgetLayout {
  i: string;    // Matches widget ID (used by grid layout engine)
  x: number;    // Grid column position
  y: number;    // Grid row position
  w: number;    // Width in grid units
  h: number;    // Height in grid units
}

interface DashboardWidget {
  id: string;        // Unique ID: "{type}-{timestamp}"
  type: string;      // Widget type key (maps to component)
  layout: WidgetLayout;
  props?: any;       // Optional widget-specific configuration
}
```

### 10.2 Default Configuration

Two widgets are pre-configured:

```typescript
const DEFAULT_WIDGETS = [
  { id: 'vitals-1', type: 'vitals', layout: { i: 'vitals-1', x: 0, y: 0, w: 4, h: 2 } },
  { id: 'terminal-1', type: 'terminal', layout: { i: 'terminal-1', x: 4, y: 0, w: 8, h: 4 } }
];
```

The `vitals` widget displays system health information (CPU, memory, frame rate from HealthContext). The `terminal` widget provides an interactive command interface.

### 10.3 Widget CRUD Operations

**Add Widget**:
```typescript
const addWidget = (type: string) => {
  const id = `${type}-${Date.now()}`;
  const newWidget = {
    id,
    type,
    layout: { i: id, x: 0, y: Infinity, w: 4, h: 4 }  // y: Infinity = append to bottom
  };
  saveWidgets([...widgets, newWidget]);
};
```

Setting `y: Infinity` tells the grid layout engine to place the new widget at the bottom of the existing layout (auto-flow behavior).

**Remove Widget**:
```typescript
const removeWidget = (id: string) => {
  saveWidgets(widgets.filter(w => w.id !== id));
};
```

**Update Layout** (drag/drop repositioning):
```typescript
const updateLayout = (layout: WidgetLayout[]) => {
  const nextWidgets = widgets.map(w => {
    const l = layout.find(l => l.i === w.id);
    return l ? { ...w, layout: l } : w;
  });
  saveWidgets(nextWidgets);
};
```

This receives the full layout array from the grid layout engine after a drag/drop operation and updates each widget's layout accordingly.

**Reset**:
```typescript
const resetDashboard = () => {
  saveWidgets(DEFAULT_WIDGETS);
};
```

### 10.4 Persistence

All widget state persists to `localStorage` under key `cm_dashboard_widgets`:

```typescript
const saveWidgets = (newWidgets: DashboardWidget[]) => {
  setWidgets(newWidgets);
  localStorage.setItem('cm_dashboard_widgets', JSON.stringify(newWidgets));
};
```

On mount, the provider reads from localStorage with fallback to `DEFAULT_WIDGETS`:

```typescript
const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
  const saved = localStorage.getItem('cm_dashboard_widgets');
  return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
});
```

### 10.5 Edit Mode

The `isEditMode` state controls whether widgets can be rearranged. When `false`, widgets are locked in place. When `true`, users can drag, resize, add, and remove widgets. This prevents accidental layout changes during normal use.

---

## Cross-Cutting Concerns

### Error Handling Patterns

All subsystems follow a consistent error handling philosophy:

1. **Never crash the app**: Catch errors at subsystem boundaries (e.g., `tutorialValidator.ts` wraps condition functions, `ThreeViewer` shows red wireframe cube on error)
2. **Degrade gracefully**: Missing pins render at component center, failed gesture frames are dropped, invalid macros skip the failing step
3. **Log for debugging**: All subsystems use `console.error()` or `console.warn()` with descriptive prefixes (e.g., `'GestureEngine:'`, `'3D Content Error:'`)
4. **Metrics over alerts**: Operations log to metrics services (`aiMetricsService`, `gestureMetricsService`) rather than interrupting the user

### Persistence Patterns

| Subsystem | Storage | Key | Capacity |
|-----------|---------|-----|----------|
| Macros | localStorage | `cm_macros` | Unbounded |
| Dashboard | localStorage | `cm_dashboard_widgets` | Unbounded |
| Gesture Metrics | storageService | `cm_gesture_metrics` | 100 entries |
| Search Index | Memory only | N/A | Rebuilt on mount |
| Simulation | Memory only | N/A | Recomputed on diagram change |
| Tutorial | Memory only | N/A | Reset on quest completion |

### Worker Usage

| Worker | Purpose | Lifecycle |
|--------|---------|-----------|
| gestureWorker.js | MediaPipe hand tracking | Long-lived (created on init, disposed on cleanup) |
| ThreeCodeWorker | AI code execution | Ephemeral (created per execution, terminated after) |
