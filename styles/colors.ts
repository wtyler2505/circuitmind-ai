// Shared Design Tokens - Colors
// These must match tailwind.config.js

export const COLORS = {
  // Brand / Cyber Theme
  cyber: {
    black: '#050508',
    dark: '#0a0a12',
    card: '#12121f',
  },
  neon: {
    cyan: '#00f3ff',
    purple: '#bd00ff',
    green: '#00ff9d',
    amber: '#ffaa00',
  },
  
  // Component Specific
  arduino: {
    base: '#00979D',
    dark: '#005C5F',
    light: '#00B5B8',
  },
  pcb: {
    green: '#1D5C4B',
    dark: '#0F3D2F',
    light: '#2A7A64',
  },
  breadboard: {
    white: '#F8F8F8',
    railBlue: '#3B82F6',
    railRed: '#EF4444',
  },
  
  // Materials / Parts
  materials: {
    copper: '#9A916C',
    copperHighlight: '#C4B896',
    chip: '#1E1E1E',
    chipHighlight: '#3D3D3D',
    resistorBody: '#C4A484',
    resistorBand: '#1E293B',
    headerFill: '#374151',
    pinStroke: '#6B6B6B',
    goldPin: '#7A7152',
    legs: '#8C8C8C',
  },
  
  // Display / Output
  display: {
    lcdGreen: '#9ACD32',
    lcdDark: '#556B2F',
    ledRed: '#E62C2E',
    ledGreen: '#22C55E',
    ledYellow: '#FACC15',
  },
  
  // Sensor Accents
  sensor: {
    blue: '#2563EB',
    blueDark: '#1D4ED8',
    purple: '#6D28D9',
  },
  
  // UI Elements in Diagram
  ui: {
    text: '#E2E8F0',
    subtleText: '#94A3B8',
    stroke: '#D1D5DB',
    selection: '#00f3ff', // neon-cyan
    white: '#F5F5F5',
  }
};
