# CircuitMind AI - Features Reference

## Asset Engine (God-Tier FZPZ)

### Overview

The asset engine provides manufacturer-accurate component representation using the Fritzing Part (.fzpz) specification.

### Components

| File | Purpose |
|------|---------|
| `services/fzpzLoader.ts` | Procedural manufacture from FZPZ |
| `services/partStorageService.ts` | IndexedDB binary persistence |
| `public/parts/parts-manifest.json` | Instant hydration metadata |
| `components/diagram/DiagramNode.tsx` | SVG rendering |

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ parts-manifest  │───▶│ InventoryContext │───▶│ DiagramCanvas   │
│    .json        │    │  (lazy-load)     │    │  (render SVG)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   FzpzLoader    │───▶│PartStorageService│
│ (zip + XML)     │    │   (IndexedDB)    │
└─────────────────┘    └──────────────────┘
```

### Unit Normalization

| Source Unit | Conversion |
|-------------|------------|
| mil (1/1000 inch) | × 0.254 |
| mm | × 10 / 2.54 |
| in | × 100 |
| px (default) | × 1 |

**Target**: 10px = 0.1" = 2.54mm

### Manifest-First Hydration

1. Page load → fetch `parts-manifest.json` (lightweight)
2. Inventory renders immediately with metadata
3. User interaction → lazy-load binary .fzpz
4. FzpzLoader extracts SVG → cache in IndexedDB
5. Future loads → instant from cache

---

## Intelligence Engine (Eve)

### Overview

Eve is the AI assistant with "Deep Awareness" - understanding of workspace state beyond simple chat.

### Context Layers

| Layer | Data Source |
|-------|-------------|
| Temporal | Last N user actions (history buffer) |
| Spatial | Selection, viewport zoom, pan coordinates |
| Semantic | Component metadata, diagram structure |

### Context Building

```typescript
// aiContextBuilder.ts
buildAIContext({
  diagram,      // Current diagram state
  inventory,    // Available components
  selection,    // Selected component
  recentActions // History buffer
}) → AIContext
```

### Proactive Suggestions

Triggers for unprompted assistance:

| Condition | Suggestion |
|-----------|------------|
| Unconnected component | "Wire X to power rail" |
| Missing power supply | "Add voltage regulator" |
| Low stock | "Reorder Y components" |
| Incomplete metadata | "Fill in specs for Z" |

### Action Safety Protocol

```typescript
// hooks/useAutonomySettings.ts
const isSafe = (action: ActionType): boolean => {
  // User overrides first
  if (settings.customSafeActions.includes(action)) return true;
  if (settings.customUnsafeActions.includes(action)) return false;
  // Default classification
  return ACTION_SAFETY[action];
};
```

---

## Visual Engine

### 2D Canvas (DiagramCanvas.tsx)

| Feature | Implementation |
|---------|----------------|
| Grid | 0.1" (10px) snapping |
| Wiring | Cubic Bézier with zig-zag fallback |
| Pan | Transform + mouse/touch events |
| Zoom | Scale transform with bounds |
| Selection | Click detection + highlight state |

### Wire Routing Algorithm

```typescript
// Smart routing with fallback
const dx = toX - fromX;
if (Math.abs(dx) > 50) {
  // Standard Bézier curve
  return `M ${fromX} ${fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toX} ${toY}`;
}
// Fallback: zig-zag for tight spaces
return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
```

### 3D Canvas (Diagram3DView.tsx)

| Feature | Implementation |
|---------|----------------|
| Renderer | Three.js WebGLRenderer |
| Controls | OrbitControls with damping |
| Lighting | Ambient + directional |
| Models | AI-generated mesh code |

### Tactical HUD

Real-time data overlays:
- Pin function tooltips
- Voltage level indicators
- Component spec popups
- AI highlight pulses

### Neural-Link Gestures

| Gesture | Action |
|---------|--------|
| Pinch | Select/drag component |
| Palm | Pan canvas |
| Swipe | Change tabs |

Implementation: MediaPipe hand tracking → gesture classifier → action dispatch

---

## Simulation Engine

### Nodal Solver

Runs in Web Worker to prevent UI lag.

```typescript
// Simplified DC analysis
for (const node of nodes) {
  const voltages = solveKirchhoff(node, adjacencyMatrix);
  propagateStates(voltages);
}
```

### Logic States

| State | Visual |
|-------|--------|
| HIGH | Cyan glow |
| LOW | Dim |
| FLOATING | Yellow warning |

### Circuit Eye (Heuristics)

| Rule | Check |
|------|-------|
| Mixed Voltage | 3.3V + 5V on same net |
| LED Current | Resistor present on LED net |
| MCU Power | VCC/GND pins connected |
| Floating | Zero active connections |

### Event-Driven Visuals

```typescript
simulation.on('stateChange', (node, state) => {
  if (node.type === 'led') {
    updateLEDGlow(node.id, state === 'HIGH');
  }
});
```

---

## Sovereignty Engine

### Storage Architecture

```
┌───────────────────────────────────────────────────┐
│                   IndexedDB                        │
│  ┌─────────┬──────────┬───────────┬─────────────┐ │
│  │  parts  │inventory │ conver-   │  messages   │ │
│  │(binary) │(metadata)│ sations   │             │ │
│  └─────────┴──────────┴───────────┴─────────────┘ │
└───────────────────────────────────────────────────┘
                         │
┌───────────────────────────────────────────────────┐
│                  localStorage                      │
│  cm_autosave | cm_gemini_api_key | cm_autonomy   │
└───────────────────────────────────────────────────┘
                         │
┌───────────────────────────────────────────────────┐
│              Git-as-Data (isomorphic-git)          │
│           (version history, branching)             │
└───────────────────────────────────────────────────┘
```

### Hardware Guard

**Static Analysis (SAST)**:
```typescript
const FORBIDDEN = ['fetch', 'window', 'process', 'eval', 'Function'];
const hasDanger = FORBIDDEN.some(g => code.includes(g));
```

**Dynamic Electrical Rules**:
- Short circuit detection
- Overvoltage warnings
- Polarity checks

### P2P Sync

1. LAN discovery via mDNS/broadcast
2. WebRTC or WebSocket bridge
3. Git packfile exchange
4. Conflict resolution via timestamps

---

## Education Engine

### Quest System

```typescript
interface Quest {
  id: string;
  title: string;
  steps: QuestStep[];
}

interface QuestStep {
  instruction: string;
  successCondition: (state: AppState) => boolean;
  hint?: string;
}
```

### Step Machine

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Step 1    │───▶│   Step 2    │───▶│   Step 3    │
│ "Add LED"   │    │ "Add Res"   │    │ "Connect"   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Validate:   │    │ Validate:   │    │ Validate:   │
│ LED exists  │    │ R exists    │    │ Connection  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Visual Anchoring

HUD highlights guide user attention:
- Pulse on target UI element
- Arrow pointing to next action
- Progress indicator
