/**
 * Component Value Extractor
 *
 * Extracts electrical parameters from component names, descriptions, and
 * explicit electrical properties for use in MNA circuit simulation.
 *
 * Supports parsing SI prefixes (pico to giga) and identifying component models
 * based on type and name patterns.
 */

import type { ElectronicComponent } from '../../types';
import type { ComponentModel } from './types';

// ---------------------------------------------------------------------------
// SI Prefix Multipliers
// ---------------------------------------------------------------------------

const SI_PREFIXES: Record<string, number> = {
  p: 1e-12, // pico
  n: 1e-9, // nano
  µ: 1e-6, // micro (Greek mu)
  u: 1e-6, // micro (ASCII u)
  m: 1e-3, // milli
  k: 1e3, // kilo
  K: 1e3, // kilo (uppercase)
  M: 1e6, // mega
  G: 1e9, // giga
};

// ---------------------------------------------------------------------------
// Value Parsing
// ---------------------------------------------------------------------------

/**
 * Parse a numeric value with optional SI prefix from text.
 *
 * Examples:
 * - "10kΩ" → 10000
 * - "2.2 MΩ" → 2200000
 * - "100 uF" → 0.0001
 * - "47 pF" → 4.7e-11
 *
 * @param text - Text to search for the value
 * @param unit - Unit to look for (e.g., "Ω", "V", "A", "F", "H")
 * @returns Numeric value in base units, or null if not found
 */
export function parseElectricalValue(text: string, unit: string): number | null {
  // Escape special regex characters in the unit (e.g., Ω)
  const escapedUnit = unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Pattern: number (with optional decimal), optional SI prefix, unit
  // Case-insensitive to handle "ohm", "Ohm", "OHM", etc.
  const pattern = new RegExp(
    `(\\d+\\.?\\d*)\\s*(p|n|µ|u|m|k|K|M|G)?\\s*${escapedUnit}`,
    'i'
  );

  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  const baseValue = parseFloat(match[1]);
  const prefix = match[2];

  if (prefix && prefix in SI_PREFIXES) {
    return baseValue * SI_PREFIXES[prefix];
  }

  return baseValue;
}

// ---------------------------------------------------------------------------
// Component Property Extraction
// ---------------------------------------------------------------------------

/**
 * Extract resistance value from a component.
 *
 * Priority:
 * 1. Explicit `component.electrical.resistance` field
 * 2. Parse from name/description for "Ω" or "ohm" patterns
 * 3. Bare number patterns like "10k resistor" → 10000
 * 4. Default: 1000Ω (1kΩ)
 *
 * @param component - Component to extract resistance from
 * @returns Resistance in Ohms
 */
export function extractResistance(component: ElectronicComponent): number {
  // Priority 1: Explicit electrical property
  if (component.electrical?.resistance !== undefined) {
    return component.electrical.resistance;
  }

  const searchText = `${component.name} ${component.description}`.toLowerCase();

  // Priority 2: Look for Ω or "ohm" patterns
  const ohmValue = parseElectricalValue(searchText, 'Ω');
  if (ohmValue !== null) {
    return ohmValue;
  }

  const ohmTextValue = parseElectricalValue(searchText, 'ohm');
  if (ohmTextValue !== null) {
    return ohmTextValue;
  }

  // Priority 3: Bare number with k/K/M/G prefix (e.g., "10k resistor")
  // This handles cases like "10k resistor" without explicit unit
  const bareNumberMatch = searchText.match(/(\\d+\\.?\\d*)\\s*(p|n|µ|u|m|k|K|M|G)\\s*resistor/i);
  if (bareNumberMatch) {
    const baseValue = parseFloat(bareNumberMatch[1]);
    const prefix = bareNumberMatch[2];
    if (prefix && prefix in SI_PREFIXES) {
      return baseValue * SI_PREFIXES[prefix];
    }
    return baseValue;
  }

  // Priority 4: Default
  return 1000; // 1kΩ
}

/**
 * Extract voltage value from a component.
 *
 * Priority:
 * 1. Explicit `component.electrical.outputVoltage` field
 * 2. Parse from name/description for "V" patterns (e.g., "3.3V", "5V")
 * 3. Default: 5V
 *
 * @param component - Component to extract voltage from
 * @returns Voltage in Volts
 */
export function extractVoltage(component: ElectronicComponent): number {
  // Priority 1: Explicit electrical property
  if (component.electrical?.outputVoltage !== undefined) {
    return component.electrical.outputVoltage;
  }

  const searchText = `${component.name} ${component.description}`;

  // Priority 2: Parse from name/description
  const voltage = parseElectricalValue(searchText, 'V');
  if (voltage !== null) {
    return voltage;
  }

  // Priority 3: Default
  return 5; // 5V
}

/**
 * Extract current value from a component.
 *
 * Priority:
 * 1. Explicit `component.electrical.maxCurrent` field
 * 2. Parse from name/description for "A" or "amp" patterns
 * 3. Default: 0.020A (20mA)
 *
 * @param component - Component to extract current from
 * @returns Current in Amps
 */
export function extractCurrent(component: ElectronicComponent): number {
  // Priority 1: Explicit electrical property
  if (component.electrical?.maxCurrent !== undefined) {
    return component.electrical.maxCurrent;
  }

  const searchText = `${component.name} ${component.description}`.toLowerCase();

  // Priority 2: Parse from name/description
  const ampValue = parseElectricalValue(searchText, 'A');
  if (ampValue !== null) {
    return ampValue;
  }

  const ampTextValue = parseElectricalValue(searchText, 'amp');
  if (ampTextValue !== null) {
    return ampTextValue;
  }

  // Priority 3: Default
  return 0.020; // 20mA
}

// ---------------------------------------------------------------------------
// Component Model Identification
// ---------------------------------------------------------------------------

/**
 * Identify the electrical model for a component based on its type and name.
 *
 * Model identification rules:
 * - Resistor: type='other' AND name contains 'resistor'
 * - LED: name contains 'led'
 * - Voltage source: type='power'
 * - Capacitor: name contains 'capacitor' or 'cap'
 * - Inductor: name contains 'inductor' or 'coil'
 * - Wire/jumper: name contains 'wire' or 'jumper'
 * - Microcontroller: type='microcontroller' (behavior depends on pin context, default wire)
 * - Default: wire (0.001Ω)
 *
 * @param component - Component to identify
 * @returns Electrical model for MNA simulation
 */
export function identifyComponentModel(component: ElectronicComponent): ComponentModel {
  const nameLower = component.name.toLowerCase();
  const descLower = component.description.toLowerCase();
  const searchText = `${nameLower} ${descLower}`;

  // Resistor: type='other' AND name contains 'resistor'
  if (component.type === 'other' && searchText.includes('resistor')) {
    return {
      type: 'resistor',
      resistance: extractResistance(component),
    };
  }

  // LED: name contains 'led'
  if (searchText.includes('led')) {
    const resistance = extractResistance(component);
    const voltage = component.electrical?.forwardVoltage ?? 2.0; // Standard red LED
    const maxCurrent = extractCurrent(component);

    return {
      type: 'led',
      resistance: resistance > 0 ? resistance : 20, // LEDs need series resistance
      voltage,
      maxCurrent,
    };
  }

  // Voltage source: type='power'
  if (component.type === 'power') {
    return {
      type: 'voltage_source',
      voltage: extractVoltage(component),
    };
  }

  // Capacitor: name contains 'capacitor' or 'cap'
  if (searchText.includes('capacitor') || /\bcaps?\b/.test(searchText)) {
    // In DC analysis, capacitors are open circuits
    return {
      type: 'capacitor_dc',
    };
  }

  // Inductor: name contains 'inductor' or 'coil'
  if (searchText.includes('inductor') || searchText.includes('coil')) {
    // In DC analysis, inductors are short circuits (with tiny resistance)
    return {
      type: 'inductor_dc',
      resistance: 0.001, // Near-zero resistance
    };
  }

  // Wire/jumper: name contains 'wire' or 'jumper'
  if (searchText.includes('wire') || searchText.includes('jumper')) {
    return {
      type: 'wire',
      resistance: 0.001, // Near-zero resistance
    };
  }

  // Microcontroller: type='microcontroller'
  // MCUs can act as inputs (high impedance), outputs (voltage sources), or pass-through
  // Default to wire behavior; context-specific behavior handled by simulation engine
  if (component.type === 'microcontroller') {
    return {
      type: 'wire',
      resistance: 0.001,
    };
  }

  // Default: treat as wire (minimal resistance connection)
  return {
    type: 'wire',
    resistance: 0.001,
  };
}
