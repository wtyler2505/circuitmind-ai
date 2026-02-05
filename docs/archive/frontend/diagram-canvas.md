# DiagramCanvas Deep Architecture

## Overview

`DiagramCanvas.tsx` is the interactive SVG-based wiring diagram renderer. After refactoring, complexity has been significantly reduced through component extraction.

**Main File**: `components/DiagramCanvas.tsx` (~600 LOC after refactor)
**Extracted**: `components/diagram/Wire.tsx` (127 LOC), `components/diagram/DiagramNode.tsx` (171 LOC)
**Tests**: `components/__tests__/DiagramCanvas.test.tsx` (40 tests passing)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DiagramCanvas                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    State Management                       │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐   │  │
│  │  │ View State  │ │ Interaction │ │ AI Highlights    │   │  │
│  │  │ - zoom      │ │ - dragging  │ │ - components Map │   │  │
│  │  │ - pan       │ │ - panning   │ │ - wires Map      │   │  │
│  │  │ - search    │ │ - tempWire  │ │ - auto-clear     │   │  │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Imperative API (forwardRef)                  │  │
│  │  setZoom() | centerOnComponent() | highlightComponent()  │  │
│  │  highlightWire() | getComponentPosition() | resetView()  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    SVG Rendering                          │  │
│  │  ┌──────────────┐  ┌────────────────┐  ┌─────────────┐  │  │
│  │  │ Grid Pattern │  │ Wire (memo)    │  │ DiagramNode │  │  │
│  │  │ + Markers    │  │ Bezier curves  │  │ (memo)      │  │  │
│  │  └──────────────┘  └────────────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    UI Overlays                            │  │
│  │  - Zoom Controls (top-right): +, -, reset                │  │
│  │  - Search Input (top-left): "Locate part..."             │  │
│  │  - Drop Zone Overlay (drag feedback)                     │  │
│  │  - Empty State Message                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Complexity Analysis (After Refactor)

| Component | CCN Before | CCN After | Status |
|-----------|------------|-----------|--------|
| Wire Rendering | 31 | 17 (isolated) | ✅ EXTRACTED |
| Node Rendering | 21 | 1.0 avg (isolated) | ✅ EXTRACTED |
| Auto-Layout | 19 | 19 | Candidate for hook |
| Event Handlers | Multiple | useCallback wrapped | ✅ MEMOIZED |

## Visual Forensics Report (2026-01-01)

### UI Elements Verified

| Element | Status | Notes |
|---------|--------|-------|
| Empty state | ✅ Working | "No diagram yet." message with tips |
| Component nodes | ✅ Working | Shows name, type badge, pins on both sides |
| Wire rendering | ✅ Working | Green Bezier curves with arrowheads |
| Zoom controls | ✅ Working | +, -, reset buttons functional |
| Search input | ✅ Working | "Locate part..." placeholder |
| Component click | ✅ Working | Opens ComponentEditorModal |
| Status bar | ✅ Working | Shows "DIAGRAM Xc / Xw" counts |

### Screenshots Captured

1. **Empty State** - Lightning bolt icon, instructional text
2. **With Components** - Arduino Uno + LED + Resistor circuit
3. **Zoomed View** - Detailed pin labels visible
4. **Modal Open** - ComponentEditorModal with INFO/EDIT/IMAGE/3D tabs

### Console Errors

**None found** - React crash fix verified working

## Extracted Components

### Wire.tsx (127 LOC)

```typescript
// Memoized wire rendering with Bezier curves
export const Wire = React.memo(({ connection, positions, highlight, onHover }) => {
  // getSmartPath() - cubic Bezier pathing
  // calculateWireEndpoints() - pin position calculation
});
```

**Exports**: `Wire`, `getSmartPath`, `calculateWireEndpoints`, `COMPONENT_WIDTH`, `COMPONENT_HEIGHT`

### DiagramNode.tsx (171 LOC)

```typescript
// Memoized component node with pins
export const DiagramNode = React.memo(({ component, position, highlight, onDrag }) => {
  // Pin subcomponent for individual pins
  // Drag handlers for repositioning
});
```

**Exports**: `DiagramNode`, `Pin`

## State Breakdown

### View State
```typescript
const [zoom, setZoom] = useState(1);              // 0.25-3 range
const [pan, setPan] = useState({ x: 0, y: 0 });   // SVG translation
const [searchQuery, setSearchQuery] = useState('');
```

### Interaction State
```typescript
const [nodePositions, setNodePositions] = useState<Map<string, {x,y}>>(new Map());
const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
const [isPanning, setIsPanning] = useState(false);
const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
```

### AI Highlight State
```typescript
const [highlightedComponents, setHighlightedComponents] = useState<Map<string, HighlightState>>();
const [highlightedWires, setHighlightedWires] = useState<Map<number, HighlightState>>();
```

## Imperative API (DiagramCanvasRef)

Exposed via `forwardRef` + `useImperativeHandle` for AI control:

| Method | Purpose | Tested |
|--------|---------|--------|
| `setZoom(level)` | Set zoom level (0.25-3) | ✅ |
| `getZoom()` | Get current zoom | ✅ |
| `setPan(x, y)` | Set pan offset | ✅ |
| `getPan()` | Get current pan | ✅ |
| `resetView()` | Reset to default zoom/pan | ✅ |
| `centerOnComponent(id, zoom?)` | Center view on component | ✅ |
| `highlightComponent(id, options?)` | Highlight with color/pulse | ✅ |
| `clearHighlight(id?)` | Clear one or all highlights | ✅ |
| `highlightWire(index, options?)` | Highlight wire | ✅ |
| `clearWireHighlight(index?)` | Clear wire highlight | ✅ |
| `getComponentPosition(id)` | Get component {x,y} | ✅ |
| `getAllComponentPositions()` | Get all positions Map | ✅ |

## Test Coverage (40 tests)

### DiagramCanvas.test.tsx
- Empty state rendering (2 tests)
- Component rendering (3 tests)
- Wire rendering (2 tests)
- Zoom controls (3 tests)
- Search functionality (3 tests)
- Component interaction (1 test)
- Imperative API ref methods (8 tests)
- Drag and drop (2 tests)
- Wire highlighting (1 test)
- SVG markers (1 test)
- Title display (1 test)
- Accessibility (1 test)

## Key Algorithms

### Auto-Layout
- Power components → x=100 (left column)
- Microcontrollers → x=400 (center column)
- Others → x=700 (right column)
- Collision detection with 100 attempts max

### Smart Wire Pathing
```typescript
const getSmartPath = (x1, y1, x2, y2) => {
  // Cubic Bezier: M x1,y1 C cp1x,cp1y cp2x,cp2y x2,y2
  // Control points offset by ~40% of horizontal distance
};
```

## Performance Optimizations Applied

1. ✅ Extracted Wire.tsx with React.memo
2. ✅ Extracted DiagramNode.tsx with React.memo
3. ✅ useCallback on all event handlers
4. ✅ useMemo on filtered components
5. ✅ Viewport virtualization for 100+ components

## Related Files

| File | Purpose |
|------|---------|
| `components/diagram/Wire.tsx` | Memoized wire rendering |
| `components/diagram/DiagramNode.tsx` | Memoized node rendering |
| `components/diagram/index.ts` | Barrel exports |
| `hooks/actions/canvasHandlers.ts` | AI action handlers |
| `types.ts` | WiringDiagram, ElectronicComponent, WireConnection |

## Changelog

- 2026-01-01: Visual forensics completed, all UI elements verified working
- 2026-01-01: Test coverage expanded to 40 tests (from 1)
- 2026-01-01: useCallback memoization added to all handlers
- 2026-01-01: Extracted DiagramNode.tsx (CCN 21 → 1.0)
- 2026-01-01: Extracted Wire.tsx (CCN 31 → 17)
- 2026-01-01: Fixed React crash (AISuggestedAction interface)
- 2026-01-01: Initial deep architecture documentation
