export { default as Wire, getSmartPath, calculateWireEndpoints } from './Wire';
export type { WireHighlightState } from './Wire';

export { default as DiagramNode } from './DiagramNode';
export type { NodeHighlightState } from './DiagramNode';

export { default as Diagram3DView } from './Diagram3DView';

export { COMPONENT_WIDTH, COMPONENT_HEIGHT } from './Wire';

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
