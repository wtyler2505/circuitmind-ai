import { COLORS as TOKENS } from '../../styles/colors';

/**
 * Component Shape Registry - Fritzing-style realistic breadboard visuals.
 *
 * Design Standards (from Fritzing/SparkFun guidelines):
 * - Copper/Tinned Contacts: #9A916C
 * - Component Legs: #8C8C8C
 * - Sharp corners (NO rounded corners)
 * - Clean vector graphics
 * - Realistic breadboard-style (not schematic symbols)
 */

export interface PinDefinition {
  name: string;
  x: number;
  y: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}

export interface ComponentShape {
  type: string;
  width: number;
  height: number;
  path: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  headerHeight: number;
  headerFill: string;
  icon: string;
  pinSpacing: number;
  pinStartY: number;
  // Pin colors
  pinFill: string;
  pinStroke: string;
}

// Fritzing standard colors mapped to central tokens
const COLORS = {
  copper: TOKENS.materials.copper,
  copperHighlight: TOKENS.materials.copperHighlight,
  legs: TOKENS.materials.legs,
  arduinoBlue: TOKENS.arduino.base,
  arduinoDark: TOKENS.arduino.dark,
  arduinoLight: TOKENS.arduino.light,
  pcbGreen: TOKENS.pcb.green,
  pcbDark: TOKENS.pcb.dark,
  pcbLight: TOKENS.pcb.light,
  ledRed: TOKENS.display.ledRed,
  ledGreen: TOKENS.display.ledGreen,
  ledYellow: TOKENS.display.ledYellow,
  resistorBody: TOKENS.materials.resistorBody,
  resistorBand: TOKENS.materials.resistorBand,
  sensorPurple: TOKENS.sensor.purple,
  sensorBlue: TOKENS.sensor.blue,
  sensorBlueDark: TOKENS.sensor.blueDark,
  darkChip: TOKENS.materials.chip,
  chipHighlight: TOKENS.materials.chipHighlight,
  white: TOKENS.ui.white,
  text: TOKENS.ui.text,
  subtleText: TOKENS.ui.subtleText,
  lcdGreen: TOKENS.display.lcdGreen,
  lcdDark: TOKENS.display.lcdDark,
  breadboardWhite: TOKENS.breadboard.white,
  breadboardRail: TOKENS.breadboard.railBlue,
  breadboardRailRed: TOKENS.breadboard.railRed,
  stroke: TOKENS.ui.stroke, // Added for consistency
};

// ============================================================
// SVG GRADIENT DEFINITIONS - For realistic 3D depth illusion
// ============================================================

export interface GradientStop {
  offset: string;
  color: string;
  opacity?: number;
}

export interface GradientDefinition {
  id: string;
  type: 'linear' | 'radial';
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
  stops: GradientStop[];
}

export const SVG_GRADIENTS: GradientDefinition[] = [
  // Arduino PCB gradient - top-lit 3D effect
  {
    id: 'gradient-arduino-pcb',
    type: 'linear',
    x1: '0%', y1: '0%', x2: '0%', y2: '100%',
    stops: [
      { offset: '0%', color: COLORS.arduinoLight },
      { offset: '15%', color: COLORS.arduinoBlue },
      { offset: '85%', color: COLORS.arduinoBlue },
      { offset: '100%', color: COLORS.arduinoDark },
    ],
  },
  // Green PCB gradient
  {
    id: 'gradient-pcb-green',
    type: 'linear',
    x1: '0%', y1: '0%', x2: '0%', y2: '100%',
    stops: [
      { offset: '0%', color: COLORS.pcbLight },
      { offset: '20%', color: COLORS.pcbGreen },
      { offset: '80%', color: COLORS.pcbGreen },
      { offset: '100%', color: COLORS.pcbDark },
    ],
  },
  // IC chip gradient - subtle radial highlight
  {
    id: 'gradient-chip-black',
    type: 'radial',
    stops: [
      { offset: '0%', color: COLORS.chipHighlight },
      { offset: '100%', color: COLORS.darkChip },
    ],
  },
  // Metallic/copper gradient
  {
    id: 'gradient-metallic',
    type: 'linear',
    x1: '0%', y1: '0%', x2: '100%', y2: '100%',
    stops: [
      { offset: '0%', color: '#E8E8E8' },
      { offset: '30%', color: '#C0C0C0' },
      { offset: '70%', color: '#A0A0A0' },
      { offset: '100%', color: '#808080' },
    ],
  },
  // Copper pin gradient
  {
    id: 'gradient-copper',
    type: 'linear',
    x1: '0%', y1: '0%', x2: '0%', y2: '100%',
    stops: [
      { offset: '0%', color: COLORS.copperHighlight },
      { offset: '50%', color: COLORS.copper },
      { offset: '100%', color: TOKENS.materials.goldPin },
    ],
  },
  // DHT11 blue plastic housing
  {
    id: 'gradient-dht11-blue',
    type: 'linear',
    x1: '0%', y1: '0%', x2: '0%', y2: '100%',
    stops: [
      { offset: '0%', color: TOKENS.breadboard.railBlue },
      { offset: '20%', color: COLORS.sensorBlue },
      { offset: '80%', color: COLORS.sensorBlue },
      { offset: '100%', color: COLORS.sensorBlueDark },
    ],
  },
  // LCD screen gradient
  {
    id: 'gradient-lcd-screen',
    type: 'linear',
    x1: '0%', y1: '0%', x2: '0%', y2: '100%',
    stops: [
      { offset: '0%', color: COLORS.lcdGreen, opacity: 0.9 },
      { offset: '50%', color: COLORS.lcdGreen },
      { offset: '100%', color: COLORS.lcdDark },
    ],
  },
  // Breadboard body gradient
  {
    id: 'gradient-breadboard',
    type: 'linear',
    x1: '0%', y1: '0%', x2: '0%', y2: '100%',
    stops: [
      { offset: '0%', color: '#FFFFFF' },
      { offset: '10%', color: COLORS.breadboardWhite },
      { offset: '90%', color: '#E8E8E8' },
      { offset: '100%', color: '#D0D0D0' },
    ],
  },
  // LED glow gradient (radial)
  {
    id: 'gradient-led-glow',
    type: 'radial',
    stops: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.8 },
      { offset: '40%', color: '#FFFFFF', opacity: 0.3 },
      { offset: '100%', color: '#FFFFFF', opacity: 0 },
    ],
  },
];

// ============================================================
// SVG FILTER DEFINITIONS - Drop shadows and effects
// ============================================================

export interface FilterDefinition {
  id: string;
  dx: number;
  dy: number;
  stdDeviation: number;
  floodOpacity: number;
  floodColor?: string;
}

export const SVG_FILTERS: FilterDefinition[] = [
  // Standard component drop shadow
  {
    id: 'filter-component-shadow',
    dx: 2,
    dy: 3,
    stdDeviation: 4,
    floodOpacity: 0.4,
    floodColor: '#000000',
  },
  // Subtle shadow for smaller components
  {
    id: 'filter-component-shadow-sm',
    dx: 1,
    dy: 2,
    stdDeviation: 2,
    floodOpacity: 0.3,
    floodColor: '#000000',
  },
  // Inner shadow for recessed elements (chips, screens)
  {
    id: 'filter-inset-shadow',
    dx: 0,
    dy: 1,
    stdDeviation: 2,
    floodOpacity: 0.5,
    floodColor: '#000000',
  },
];

/**
 * Generate SVG <defs> content string for gradients and filters.
 * Insert this into the SVG canvas <defs> section.
 */
export function generateSVGDefs(): string {
  let defs = '';

  // Generate gradients
  SVG_GRADIENTS.forEach((grad) => {
    if (grad.type === 'linear') {
      defs += `<linearGradient id="${grad.id}" x1="${grad.x1}" y1="${grad.y1}" x2="${grad.x2}" y2="${grad.y2}">`;
    } else {
      defs += `<radialGradient id="${grad.id}">`;
    }

    grad.stops.forEach((stop) => {
      const opacity = stop.opacity !== undefined ? ` stop-opacity="${stop.opacity}"` : '';
      defs += `<stop offset="${stop.offset}" stop-color="${stop.color}"${opacity}/>`;
    });

    defs += grad.type === 'linear' ? '</linearGradient>' : '</radialGradient>';
  });

  // Generate filters
  SVG_FILTERS.forEach((filter) => {
    defs += `
      <filter id="${filter.id}" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="${filter.dx}" dy="${filter.dy}" stdDeviation="${filter.stdDeviation}"
                      flood-opacity="${filter.floodOpacity}" flood-color="${filter.floodColor || '#000000'}"/>
      </filter>`;
  });

  return defs;
}

// Shape definitions - SHARP CORNERS, realistic breadboard style
// Use gradient IDs (url(#gradient-id)) for fills to enable 3D depth effect
export const COMPONENT_SHAPES: Record<string, ComponentShape> = {
  microcontroller: {
    type: 'microcontroller',
    width: 180,
    height: 100,
    // Arduino-style board - sharp corners, realistic PCB look
    path: `M 0 0 L 180 0 L 180 100 L 0 100 Z`,
    fill: 'url(#gradient-arduino-pcb)',
    stroke: COLORS.arduinoDark,
    strokeWidth: 2,
    headerHeight: 24,
    headerFill: COLORS.arduinoDark,
    icon: '',
    pinSpacing: 14,
    pinStartY: 32,
    pinFill: 'url(#gradient-copper)',
    pinStroke: TOKENS.materials.goldPin,
  },

  sensor: {
    type: 'sensor',
    width: 90,
    height: 70,
    // Sensor module - small PCB with sensing element
    path: `M 0 0 L 90 0 L 90 70 L 0 70 Z`,
    fill: 'url(#gradient-pcb-green)',
    stroke: COLORS.pcbDark,
    strokeWidth: 2,
    headerHeight: 20,
    headerFill: COLORS.pcbDark,
    icon: '',
    pinSpacing: 14,
    pinStartY: 28,
    pinFill: 'url(#gradient-copper)',
    pinStroke: TOKENS.materials.goldPin,
  },

  actuator: {
    type: 'actuator',
    width: 50,
    height: 80,
    // LED shape - dome top, flat bottom with legs
    path: `M 10 35
           L 10 15
           L 10 10
           Q 25 0 40 10
           L 40 15
           L 40 35
           Q 40 50 25 55
           Q 10 50 10 35 Z
           M 15 55 L 15 80 L 20 80 L 20 55
           M 30 55 L 30 80 L 35 80 L 35 55`,
    fill: COLORS.ledRed,
    stroke: '#B91C1C',
    strokeWidth: 1.5,
    headerHeight: 0,
    headerFill: 'transparent',
    icon: '',
    pinSpacing: 20,
    pinStartY: 75,
    pinFill: COLORS.legs,
    pinStroke: TOKENS.materials.pinStroke,
  },

  power: {
    type: 'power',
    width: 100,
    height: 50,
    // Battery pack - rectangular with terminals
    path: `M 0 5 L 85 5 L 85 0 L 100 0 L 100 50 L 85 50 L 85 45 L 0 45 L 0 5 Z`,
    fill: '#1F2937',
    stroke: '#374151',
    strokeWidth: 2,
    headerHeight: 0,
    headerFill: 'transparent',
    icon: '',
    pinSpacing: 20,
    pinStartY: 25,
    pinFill: COLORS.copper,
    pinStroke: TOKENS.materials.goldPin,
  },

  other: {
    type: 'other',
    width: 80,
    height: 60,
    // Generic IC/module - DIP-style chip
    path: `M 0 0 L 80 0 L 80 60 L 0 60 Z`,
    fill: 'url(#gradient-chip-black)',
    stroke: '#374151',
    strokeWidth: 1.5,
    headerHeight: 16,
    headerFill: '#374151',
    icon: '',
    pinSpacing: 12,
    pinStartY: 24,
    pinFill: 'url(#gradient-copper)',
    pinStroke: TOKENS.materials.pinStroke,
  },
};

// ============================================================
// SPECIFIC BOARD SHAPES - Realistic Fritzing-style visuals
// ============================================================

/**
 * Arduino Uno R3 - Realistic breadboard-style shape
 * Proper proportions based on actual Arduino Uno dimensions
 * All 30 pins positioned in correct header locations
 */
export const ARDUINO_UNO_SHAPE: ComponentShape = {
  type: 'arduino_uno',
  width: 280,
  height: 200,
  // Board outline with USB port notch and mounting holes
  path: `M 0 0
         L 280 0
         L 280 200
         L 0 200
         Z`,
  fill: 'url(#gradient-arduino-pcb)',
  stroke: COLORS.arduinoDark,
  strokeWidth: 2,
  headerHeight: 0,
  headerFill: 'transparent',
  icon: '',
  pinSpacing: 11, // Standard 0.1" spacing scaled
  pinStartY: 30,
  pinFill: 'url(#gradient-copper)',
  pinStroke: TOKENS.materials.goldPin,
};

/**
 * Arduino Uno pin layout - maps pin names to exact positions
 * Based on actual Arduino Uno R3 header layout
 */
export const ARDUINO_UNO_PINS: Record<string, { x: number; y: number; side: 'left' | 'right' | 'top' | 'bottom' }> = {
  // Digital pins header (right side, top to bottom) - D0-D13 + AREF + GND
  'D0': { x: 280, y: 35, side: 'right' },
  'D1': { x: 280, y: 46, side: 'right' },
  'D2': { x: 280, y: 57, side: 'right' },
  'D3': { x: 280, y: 68, side: 'right' },
  'D4': { x: 280, y: 79, side: 'right' },
  'D5': { x: 280, y: 90, side: 'right' },
  'D6': { x: 280, y: 101, side: 'right' },
  'D7': { x: 280, y: 112, side: 'right' },
  'D8': { x: 280, y: 128, side: 'right' },
  'D9': { x: 280, y: 139, side: 'right' },
  'D10': { x: 280, y: 150, side: 'right' },
  'D11': { x: 280, y: 161, side: 'right' },
  'D12': { x: 280, y: 172, side: 'right' },
  'D13': { x: 280, y: 183, side: 'right' },
  'GND_D': { x: 280, y: 194, side: 'right' },
  'AREF': { x: 280, y: 24, side: 'right' },
  // Alternate names
  'RX': { x: 280, y: 35, side: 'right' },
  'TX': { x: 280, y: 46, side: 'right' },

  // Power header (left side, top section)
  'RESET': { x: 0, y: 35, side: 'left' },
  '3.3V': { x: 0, y: 46, side: 'left' },
  '3V3': { x: 0, y: 46, side: 'left' },
  '5V': { x: 0, y: 57, side: 'left' },
  'GND': { x: 0, y: 68, side: 'left' },
  'GND_1': { x: 0, y: 79, side: 'left' },
  'VIN': { x: 0, y: 90, side: 'left' },

  // Analog pins (left side, lower section)
  'A0': { x: 0, y: 120, side: 'left' },
  'A1': { x: 0, y: 131, side: 'left' },
  'A2': { x: 0, y: 142, side: 'left' },
  'A3': { x: 0, y: 153, side: 'left' },
  'A4': { x: 0, y: 164, side: 'left' },
  'A5': { x: 0, y: 175, side: 'left' },
  'SDA': { x: 0, y: 164, side: 'left' }, // Same as A4
  'SCL': { x: 0, y: 175, side: 'left' }, // Same as A5

  // VCC aliases
  'VCC': { x: 0, y: 57, side: 'left' }, // Same as 5V
};

// Axial resistor shape - realistic breadboard component
export const RESISTOR_SHAPE: ComponentShape = {
  type: 'resistor',
  width: 100,
  height: 30,
  // Axial resistor: wire - body - wire (rectangular body, NOT zigzag)
  path: `M 0 15 L 20 15
         M 20 5 L 80 5 L 80 25 L 20 25 L 20 5 Z
         M 80 15 L 100 15`,
  fill: COLORS.resistorBody,
  stroke: '#8B7355',
  strokeWidth: 1.5,
  headerHeight: 0,
  headerFill: 'transparent',
  icon: 'Ω',
  pinSpacing: 0,
  pinStartY: 15,
  pinFill: COLORS.legs,
  pinStroke: TOKENS.materials.pinStroke,
};

// Capacitor shape - electrolytic style
export const CAPACITOR_SHAPE: ComponentShape = {
  type: 'capacitor',
  width: 40,
  height: 60,
  // Electrolytic capacitor: cylindrical body with leads
  path: `M 10 15 L 10 0 L 30 0 L 30 15
         M 5 15 L 35 15 L 35 50 L 5 50 L 5 15 Z
         M 15 50 L 15 60
         M 25 50 L 25 60`,
  fill: '#1E3A5F',
  stroke: TOKENS.sensor.blue,
  strokeWidth: 1.5,
  headerHeight: 0,
  headerFill: 'transparent',
  icon: '',
  pinSpacing: 0,
  pinStartY: 55,
  pinFill: COLORS.legs,
  pinStroke: TOKENS.materials.pinStroke,
};

// DHT11/DHT22 Temperature & Humidity Sensor shape
export const DHT11_SHAPE: ComponentShape = {
  type: 'dht11',
  width: 80,
  height: 60,
  // Blue plastic housing with grid vents
  path: `M 0 0 L 80 0 L 80 60 L 0 60 Z`,
  fill: 'url(#gradient-dht11-blue)',
  stroke: COLORS.sensorBlueDark,
  strokeWidth: 2,
  headerHeight: 16,
  headerFill: COLORS.sensorBlueDark,
  icon: '',
  pinSpacing: 12,
  pinStartY: 50,
  pinFill: 'url(#gradient-copper)',
  pinStroke: TOKENS.materials.goldPin,
};

// LCD 1602 Display shape
export const LCD1602_SHAPE: ComponentShape = {
  type: 'lcd1602',
  width: 160,
  height: 80,
  // Green PCB with LCD window
  path: `M 0 0 L 160 0 L 160 80 L 0 80 Z`,
  fill: 'url(#gradient-pcb-green)',
  stroke: COLORS.pcbDark,
  strokeWidth: 2,
  headerHeight: 18,
  headerFill: COLORS.pcbDark,
  icon: '',
  pinSpacing: 8,
  pinStartY: 70,
  pinFill: 'url(#gradient-copper)',
  pinStroke: TOKENS.materials.goldPin,
};

// 830-Point Breadboard shape
export const BREADBOARD_SHAPE: ComponentShape = {
  type: 'breadboard',
  width: 180,
  height: 120,
  // White/beige plastic body with rails
  path: `M 0 0 L 180 0 L 180 120 L 0 120 Z`,
  fill: 'url(#gradient-breadboard)',
  stroke: TOKENS.ui.stroke,
  strokeWidth: 2,
  headerHeight: 0,
  headerFill: 'transparent',
  icon: '',
  pinSpacing: 10,
  pinStartY: 20,
  pinFill: 'url(#gradient-copper)',
  pinStroke: TOKENS.materials.goldPin,
};

// Helper type for shape matching logic
type ShapeMatcher = {
  predicate: (name: string) => boolean;
  shape: ComponentShape;
};

// Defined matchers to reduce cyclomatic complexity
const SHAPE_MATCHERS: ShapeMatcher[] = [
  // Passive components
  { predicate: (n) => n.includes('resistor') || n.includes('ohm') || /\d+[kKmM]?Ω/.test(n), shape: RESISTOR_SHAPE },
  { predicate: (n) => n.includes('capacitor') || n.includes('farad') || /\d+[nμup]?[fF]/.test(n), shape: CAPACITOR_SHAPE },
  
  // DHT sensors
  { predicate: (n) => n.includes('dht11') || n.includes('dht22') || n.includes('dht-'), shape: DHT11_SHAPE },
  
  // Displays
  { predicate: (n) => (n.includes('lcd') || n.includes('1602') || n.includes('2004') || n.includes('display')) && !n.includes('oled'), shape: LCD1602_SHAPE },
  
  // Breadboards
  { predicate: (n) => n.includes('breadboard') || n.includes('solderless') || n.includes('830') || n.includes('400') || n.includes('170'), shape: BREADBOARD_SHAPE },
  
  // Active components / Actuators
  { predicate: (n) => n.includes('led') || n.includes('diode'), shape: COMPONENT_SHAPES.actuator },
  { predicate: (n) => n.includes('motor') || n.includes('servo') || n.includes('relay'), shape: COMPONENT_SHAPES.actuator },
  
  // Power
  { predicate: (n) => n.includes('battery') || n.includes('power') || n.includes('supply') || n.includes('regulator'), shape: COMPONENT_SHAPES.power },
  
  // Specific Microcontrollers
  { predicate: (n) => n.includes('arduino uno') || n.includes('uno r3'), shape: ARDUINO_UNO_SHAPE },
  
  // General Microcontrollers
  { predicate: (n) => n.includes('arduino') || n.includes('esp') || n.includes('raspberry') || n.includes('nodemcu') || n.includes('teensy') || n.includes('stm32') || n.includes('atmega') || n.includes('pic'), shape: COMPONENT_SHAPES.microcontroller },
  
  // General Sensors
  { predicate: (n) => n.includes('sensor') || n.includes('thermistor') || n.includes('photoresistor') || n.includes('accelerometer') || n.includes('gyro') || n.includes('ultrasonic'), shape: COMPONENT_SHAPES.sensor },
];

/**
 * Get the shape definition for a component based on type and name.
 * Name-based matching handles cases where component type is generic "other".
 */
export function getComponentShape(type: string, name?: string): ComponentShape {
  // Check name first for specific component matching
  if (name) {
    const lowerName = name.toLowerCase();
    const matcher = SHAPE_MATCHERS.find(m => m.predicate(lowerName));
    if (matcher) return matcher.shape;
  }

  // Check type string fallback
  const lowerType = type.toLowerCase();
  if (lowerType.includes('resistor')) return RESISTOR_SHAPE;
  if (lowerType.includes('capacitor')) return CAPACITOR_SHAPE;

  return COMPONENT_SHAPES[type] || COMPONENT_SHAPES.other;
}

/**
 * Calculate pin positions for a component based on its shape and pin list.
 * Distributes pins on left and right sides.
 */
export function calculatePinPositions(
  shape: ComponentShape,
  pins: string[]
): PinDefinition[] {
  const positions: PinDefinition[] = [];

  // Special handling for 2-terminal components (resistors, capacitors)
  if (shape.type === 'resistor') {
    if (pins.length >= 2) {
      positions.push({ name: pins[0], x: 0, y: 15, side: 'left' });
      positions.push({ name: pins[1], x: shape.width, y: 15, side: 'right' });
    }
    return positions;
  }

  if (shape.type === 'capacitor') {
    if (pins.length >= 2) {
      positions.push({ name: pins[0], x: 15, y: shape.height, side: 'bottom' });
      positions.push({ name: pins[1], x: 25, y: shape.height, side: 'bottom' });
    }
    return positions;
  }

  // Arduino Uno - use specific pin layout
  if (shape.type === 'arduino_uno') {
    pins.forEach((pin) => {
      const pinName = pin.toUpperCase().trim();
      const layout = ARDUINO_UNO_PINS[pin] || ARDUINO_UNO_PINS[pinName];
      if (layout) {
        positions.push({
          name: pin,
          x: layout.x,
          y: layout.y,
          side: layout.side,
        });
      } else {
        // Fallback for unknown pins - place on left side
        const fallbackY = 186 + positions.filter(p => !ARDUINO_UNO_PINS[p.name]).length * 11;
        positions.push({
          name: pin,
          x: 0,
          y: Math.min(fallbackY, shape.height - 10),
          side: 'left',
        });
      }
    });
    return positions;
  }

  // Standard left/right distribution for other components
  const halfCount = Math.ceil(pins.length / 2);

  pins.forEach((pin, index) => {
    const isLeftSide = index < halfCount;
    const sideIndex = isLeftSide ? index : index - halfCount;

    positions.push({
      name: pin,
      x: isLeftSide ? 0 : shape.width,
      y: shape.pinStartY + sideIndex * shape.pinSpacing,
      side: isLeftSide ? 'left' : 'right',
    });
  });

  return positions;
}

export { COLORS };
export default COMPONENT_SHAPES;