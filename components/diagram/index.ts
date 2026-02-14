export { default as Wire } from './Wire';
export {
  getSmartPath,
  calculateWireEndpoints,
  calculateWireMidpoint,
  resolvePinEndpoint,
  resolvePinEndpointWithFallback,
  resolveComponentBounds,
  COMPONENT_WIDTH,
  COMPONENT_HEIGHT,
} from './diagramUtils';
export type { PinSide } from './diagramUtils';
export type { WireHighlightState } from './Wire';

export { default as DiagramNode } from './DiagramNode';
export type { NodeHighlightState } from './DiagramNode';

// Diagram3DView is NOT re-exported here — it's lazy-loaded directly in DiagramCanvas.tsx
// to keep it in a separate chunk. Import from './diagram/Diagram3DView' if needed.

// Component shape registry for Fritzing-style visuals
export {
  getComponentShape,
  calculatePinPositions,
  generateSVGDefs,
  COMPONENT_SHAPES,
  RESISTOR_SHAPE,
  CAPACITOR_SHAPE,
  SVG_GRADIENTS,
  SVG_FILTERS,
  COLORS,
} from './componentShapes';
export type {
  ComponentShape,
  PinDefinition,
  GradientDefinition,
  GradientStop,
  FilterDefinition,
} from './componentShapes';
