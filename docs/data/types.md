# Data Types & Schemas (`types.ts`)

## `ElectronicComponent`

The fundamental building block.

```typescript
interface ElectronicComponent {
  id: string; // Timestamp or specific ID
  name: string; // "ESP32"
  type: string; // "microcontroller" | "sensor" | ...
  description: string; // Required short description
  pins?: string[]; // ["VCC", "GND", "D1"] - Critical for wiring logic
  quantity?: number; // Inventory counts
  datasheetUrl?: string; // Datasheet reference
  imageUrl?: string; // Image URL or data URI
  threeCode?: string; // Cached JS code for 3D model
  threeDModelUrl?: string; // GLB/GLTF URL
}
```

## `WireConnection`

Represents a line on the canvas.

```typescript
interface WireConnection {
  fromComponentId: string;
  fromPin: string; // Must match a pin in the source component
  toComponentId: string;
  toPin: string; // Must match a pin in the target component
  color?: string; // Hex code for visualization
}
```

## `WiringDiagram`

The state object stored in History.

```typescript
interface WiringDiagram {
  title: string;
  components: ElectronicComponent[];
  connections: WireConnection[];
  explanation: string;
}
```

_Note: The Diagram contains a copy of the components. If the global inventory updates, the diagram might become stale unless synchronized (handled in `App.tsx`)._
