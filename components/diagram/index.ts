export { default as Wire } from './Wire';
export { getSmartPath, calculateWireEndpoints, COMPONENT_WIDTH, COMPONENT_HEIGHT } from './diagramUtils';
export type { WireHighlightState } from './Wire';

export { default as DiagramNode } from './DiagramNode';
export type { NodeHighlightState } from './DiagramNode';

export { default as Diagram3DView } from './Diagram3DView';

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
