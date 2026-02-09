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

  // Use original case for SI prefix parsing (M = mega, m = milli)
  const searchText = `${component.name} ${component.description}`;

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
  const bareNumberMatch = searchText.match(/(\d+\.?\d*)\s*(p|n|µ|u|m|k|K|M|G)\s*resistor/i);
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
 * 25+ pattern rules covering common electronic components:
 * resistors, LEDs, power supplies, batteries, voltage regulators,
 * capacitors, inductors, diodes, transistors, op-amps, switches,
 * relays, fuses, crystals, connectors, motors, speakers, buzzers,
 * potentiometers, thermistors, photoresistors, and more.
 *
 * Priority: explicit `electrical` field > name regex > type default > wire fallback
 *
 * @param component - Component to identify
 * @returns Electrical model for MNA simulation
 */
export function identifyComponentModel(component: ElectronicComponent): ComponentModel {
  const nameLower = component.name.toLowerCase();
  const descLower = component.description.toLowerCase();
  const searchText = `${nameLower} ${descLower}`;

  // 1. Potentiometer / trimpot: variable resistor (before generic resistor)
  if (/potentiometer|trimpot|pot\b/.test(searchText)) {
    return {
      type: 'resistor',
      resistance: extractResistance(component),
    };
  }

  // 2. Thermistor / NTC / PTC: temperature-dependent resistor
  if (/thermistor|ntc|ptc/.test(searchText)) {
    return {
      type: 'resistor',
      resistance: extractResistance(component),
    };
  }

  // 3. Photoresistor / LDR: light-dependent resistor
  if (/photoresistor|ldr|light.?dependent/.test(searchText)) {
    return {
      type: 'resistor',
      resistance: component.electrical?.resistance ?? 10000, // Default 10kΩ (mid-light)
    };
  }

  // 4. Resistor (generic): name contains 'resistor' or starts with 'R' + number
  if (searchText.includes('resistor') || /\br\d/i.test(nameLower)) {
    return {
      type: 'resistor',
      resistance: extractResistance(component),
    };
  }

  // 5. LED: name contains 'led'
  if (/\bled\b/.test(searchText)) {
    const resistance = component.electrical?.resistance ?? 20; // LED series Rd
    const voltage = component.electrical?.forwardVoltage ?? 2.0; // Standard red LED
    const maxCurrent = extractCurrent(component);

    return {
      type: 'led',
      resistance,
      voltage,
      maxCurrent,
    };
  }

  // 6. Diode (non-LED): name contains 'diode', '1N4148', '1N4001', etc.
  if (/diode|1n\d{4}/i.test(searchText)) {
    return {
      type: 'led', // Modeled same as LED (Vf + series R)
      resistance: 10, // Low series resistance
      voltage: component.electrical?.forwardVoltage ?? 0.7, // Silicon diode
      maxCurrent: component.electrical?.maxCurrent ?? 1.0,
    };
  }

  // 7. Zener diode
  if (/zener/.test(searchText)) {
    return {
      type: 'led',
      resistance: 5,
      voltage: component.electrical?.forwardVoltage ?? 5.1, // Common zener voltage
      maxCurrent: component.electrical?.maxCurrent ?? 0.05,
    };
  }

  // 8. Voltage regulator: 78xx series, LM317, LDO, etc.
  if (/78\d{2}|79\d{2}|lm317|ldo|regulator/i.test(searchText)) {
    // Extract voltage from regulator designation (7805→5V, 7812→12V)
    const regMatch = searchText.match(/78(\d{2})/);
    const voltage = regMatch
      ? parseInt(regMatch[1], 10)
      : extractVoltage(component);
    return {
      type: 'voltage_source',
      voltage,
    };
  }

  // 9. Battery
  if (/battery|cell|lipo|li-ion|alkaline|cr\d{4}|aa\b|aaa\b|9v\b/.test(searchText)) {
    return {
      type: 'voltage_source',
      voltage: extractVoltage(component),
    };
  }

  // 10. Power supply / voltage source: type='power'
  if (component.type === 'power') {
    return {
      type: 'voltage_source',
      voltage: extractVoltage(component),
    };
  }

  // 11. Capacitor: name contains 'capacitor', 'cap', or 'C' + number
  if (searchText.includes('capacitor') || /\bcaps?\b/.test(searchText) || /\bc\d/i.test(nameLower)) {
    return {
      type: 'capacitor_dc', // Open circuit in DC
    };
  }

  // 12. Inductor / coil / choke
  if (/inductor|coil|choke/.test(searchText)) {
    return {
      type: 'inductor_dc',
      resistance: 0.001, // Short circuit in DC
    };
  }

  // 13. Transformer
  if (/transformer/.test(searchText)) {
    return {
      type: 'inductor_dc',
      resistance: 0.01,
    };
  }

  // 14. Switch / button / push button
  if (/switch|button|push.?button|tact/.test(searchText)) {
    // Switches default to closed (low resistance); open = removed from circuit
    return {
      type: 'wire',
      resistance: 0.001,
    };
  }

  // 15. Relay: treated as switch (coil side ignored in DC)
  if (/relay/.test(searchText)) {
    return {
      type: 'wire',
      resistance: 0.001,
    };
  }

  // 16. Fuse: very low resistance until blown
  if (/fuse/.test(searchText)) {
    return {
      type: 'wire',
      resistance: 0.01,
      maxCurrent: component.electrical?.maxCurrent ?? 1.0,
    };
  }

  // 17. Crystal / oscillator: open circuit in DC
  if (/crystal|oscillator|xtal/.test(searchText)) {
    return {
      type: 'capacitor_dc', // No DC path
    };
  }

  // 18. Transistor (BJT): NPN/PNP — modeled as resistive load
  if (/transistor|bjt|npn|pnp|2n\d{4}|bc\d{3}/i.test(searchText)) {
    return {
      type: 'resistor',
      resistance: component.electrical?.resistance ?? 1000, // Simplified linear model
    };
  }

  // 19. MOSFET: N-ch/P-ch — modeled as resistive load
  if (/mosfet|fet\b|irf\d|nch|pch|n-channel|p-channel/i.test(searchText)) {
    return {
      type: 'resistor',
      resistance: component.electrical?.resistance ?? 100, // Rds(on) range
    };
  }

  // 20. Op-amp: high input impedance
  if (/op.?amp|lm358|lm741|tl072|ne5532/i.test(searchText)) {
    return {
      type: 'resistor',
      resistance: component.electrical?.inputImpedance ?? 1e7, // 10MΩ input
    };
  }

  // 21. Motor / servo
  if (/motor|servo/.test(searchText)) {
    return {
      type: 'resistor',
      resistance: component.electrical?.resistance ?? 50, // Typical small motor
      maxCurrent: component.electrical?.maxCurrent ?? 0.5,
    };
  }

  // 22. Speaker / buzzer / piezo
  if (/speaker|buzzer|piezo/.test(searchText)) {
    return {
      type: 'resistor',
      resistance: component.electrical?.resistance ?? 8, // 8Ω speaker
    };
  }

  // 23. Connector / header / terminal
  if (/connector|header|terminal|pin.?header|socket|jack/.test(searchText)) {
    return {
      type: 'wire',
      resistance: 0.001,
    };
  }

  // 24. Wire / jumper / bridge
  if (/wire|jumper|bridge/.test(searchText)) {
    return {
      type: 'wire',
      resistance: 0.001,
    };
  }

  // 25. Breadboard
  if (/breadboard/.test(searchText)) {
    return {
      type: 'wire',
      resistance: 0.001,
    };
  }

  // 26. Display: LCD, OLED, TFT (modeled as load)
  if (/lcd|oled|tft|display|screen/.test(searchText)) {
    return {
      type: 'resistor',
      resistance: component.electrical?.resistance ?? 200, // Backlight + driver
      maxCurrent: component.electrical?.maxCurrent ?? 0.05, // 50mA typical
    };
  }

  // 27. Optocoupler / optoisolator
  if (/optocoupler|optoisolator|opto/.test(searchText)) {
    return {
      type: 'led', // LED side modeled as LED
      resistance: 50, // Input LED + phototransistor
      voltage: 1.2, // Forward voltage
      maxCurrent: 0.02,
    };
  }

  // 28. Sensor: type='sensor' — high impedance input
  if (component.type === 'sensor') {
    return {
      type: 'resistor',
      resistance: component.electrical?.resistance ?? 10000, // Default 10kΩ
    };
  }

  // 29. Actuator: type='actuator' — resistive load
  if (component.type === 'actuator') {
    return {
      type: 'resistor',
      resistance: component.electrical?.resistance ?? 100,
      maxCurrent: component.electrical?.maxCurrent ?? 0.5,
    };
  }

  // 30. Microcontroller: type='microcontroller'
  // MCUs default to wire; pin-specific behavior handled by simulation engine
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

/**
 * Total number of component identification patterns.
 * Used for testing to verify all patterns are present.
 */
export const PATTERN_COUNT = 30;
