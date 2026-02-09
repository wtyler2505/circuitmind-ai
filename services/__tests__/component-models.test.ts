/**
 * Extended Component Model Tests (REQ-96)
 *
 * Tests for the 30-pattern component model database and name-based
 * value extraction. Verifies that common hobby-circuit components
 * are correctly identified and parameterized for MNA simulation.
 */

import { describe, it, expect } from 'vitest';
import type { ElectronicComponent } from '../../types';
import {
  parseElectricalValue,
  extractResistance,
  extractVoltage,
  extractCurrent,
  identifyComponentModel,
  PATTERN_COUNT,
} from '../simulation/componentValueExtractor';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeComp(
  name: string,
  type: ElectronicComponent['type'] = 'other',
  electrical?: ElectronicComponent['electrical'],
  description = ''
): ElectronicComponent {
  return {
    id: `test-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    type,
    description,
    pins: ['1', '2'],
    electrical,
  };
}

// ---------------------------------------------------------------------------
// parseElectricalValue — extended patterns
// ---------------------------------------------------------------------------

describe('parseElectricalValue extended', () => {
  it('handles micro prefix with Greek mu', () => {
    expect(parseElectricalValue('100µF', 'F')).toBeCloseTo(100e-6, 9);
  });

  it('handles micro prefix with ASCII u', () => {
    expect(parseElectricalValue('100uF', 'F')).toBeCloseTo(100e-6, 9);
  });

  it('handles giga prefix', () => {
    expect(parseElectricalValue('2.2GΩ', 'Ω')).toBe(2.2e9);
  });

  it('handles nano prefix', () => {
    expect(parseElectricalValue('100nF', 'F')).toBeCloseTo(100e-9, 12);
  });

  it('handles pico prefix', () => {
    expect(parseElectricalValue('22pF', 'F')).toBeCloseTo(22e-12, 15);
  });

  it('handles decimal values', () => {
    expect(parseElectricalValue('4.7kΩ', 'Ω')).toBe(4700);
    expect(parseElectricalValue('0.1µF', 'F')).toBeCloseTo(0.1e-6, 10);
  });

  it('handles values with spaces', () => {
    expect(parseElectricalValue('10 kΩ', 'Ω')).toBe(10000);
    expect(parseElectricalValue('3.3 V', 'V')).toBe(3.3);
  });

  it('returns null for unmatched text', () => {
    expect(parseElectricalValue('no value here', 'Ω')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractResistance — name parsing
// ---------------------------------------------------------------------------

describe('extractResistance', () => {
  it('uses explicit electrical.resistance', () => {
    const comp = makeComp('Resistor', 'other', { resistance: 4700 });
    expect(extractResistance(comp)).toBe(4700);
  });

  it('extracts from Ω in name', () => {
    const comp = makeComp('10kΩ Resistor');
    expect(extractResistance(comp)).toBe(10000);
  });

  it('extracts from "ohm" in name', () => {
    const comp = makeComp('220 ohm Resistor');
    expect(extractResistance(comp)).toBe(220);
  });

  it('extracts from bare prefix pattern', () => {
    const comp = makeComp('10k resistor');
    expect(extractResistance(comp)).toBe(10000);
  });

  it('defaults to 1kΩ when no match', () => {
    const comp = makeComp('Unknown Component');
    expect(extractResistance(comp)).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// extractVoltage
// ---------------------------------------------------------------------------

describe('extractVoltage', () => {
  it('uses explicit electrical.outputVoltage', () => {
    const comp = makeComp('PSU', 'power', { outputVoltage: 12 });
    expect(extractVoltage(comp)).toBe(12);
  });

  it('parses from name', () => {
    const comp = makeComp('3.3V Power Supply', 'power');
    expect(extractVoltage(comp)).toBe(3.3);
  });

  it('defaults to 5V', () => {
    const comp = makeComp('Power Supply', 'power');
    expect(extractVoltage(comp)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// extractCurrent
// ---------------------------------------------------------------------------

describe('extractCurrent', () => {
  it('uses explicit electrical.maxCurrent', () => {
    const comp = makeComp('LED', 'other', { maxCurrent: 0.03 });
    expect(extractCurrent(comp)).toBe(0.03);
  });

  it('parses from name', () => {
    const comp = makeComp('500mA Fuse');
    expect(extractCurrent(comp)).toBe(0.5);
  });

  it('defaults to 20mA', () => {
    const comp = makeComp('Generic Part');
    expect(extractCurrent(comp)).toBe(0.02);
  });
});

// ---------------------------------------------------------------------------
// identifyComponentModel — 30 patterns
// ---------------------------------------------------------------------------

describe('identifyComponentModel', () => {
  it(`has ${PATTERN_COUNT} patterns`, () => {
    expect(PATTERN_COUNT).toBe(30);
  });

  // Pattern 1: Resistor
  it('identifies resistor by name', () => {
    const m = identifyComponentModel(makeComp('10k Resistor'));
    expect(m.type).toBe('resistor');
  });

  it('identifies resistor by R-prefix (R1)', () => {
    const m = identifyComponentModel(makeComp('R1'));
    expect(m.type).toBe('resistor');
  });

  // Pattern 2: Potentiometer
  it('identifies potentiometer', () => {
    const m = identifyComponentModel(makeComp('10k Potentiometer'));
    expect(m.type).toBe('resistor');
  });

  // Pattern 3: Thermistor
  it('identifies NTC thermistor', () => {
    const m = identifyComponentModel(makeComp('10k NTC Thermistor'));
    expect(m.type).toBe('resistor');
  });

  // Pattern 4: Photoresistor / LDR
  it('identifies LDR', () => {
    const m = identifyComponentModel(makeComp('LDR Photoresistor'));
    expect(m.type).toBe('resistor');
    expect(m.resistance).toBe(10000);
  });

  // Pattern 5: LED
  it('identifies LED', () => {
    const m = identifyComponentModel(makeComp('Red LED'));
    expect(m.type).toBe('led');
    expect(m.voltage).toBe(2.0);
    expect(m.resistance).toBe(20);
  });

  // Pattern 6: Diode
  it('identifies diode (1N4148)', () => {
    const m = identifyComponentModel(makeComp('1N4148 Diode'));
    expect(m.type).toBe('led');
    expect(m.voltage).toBeCloseTo(0.7, 1);
  });

  // Pattern 7: Zener diode
  it('identifies Zener diode', () => {
    const m = identifyComponentModel(makeComp('5.1V Zener Diode'));
    expect(m.type).toBe('led');
  });

  // Pattern 8: Voltage regulator (7805)
  it('identifies 7805 regulator', () => {
    const m = identifyComponentModel(makeComp('7805 Voltage Regulator'));
    expect(m.type).toBe('voltage_source');
    expect(m.voltage).toBe(5);
  });

  it('identifies 7812 regulator', () => {
    const m = identifyComponentModel(makeComp('7812 Regulator'));
    expect(m.type).toBe('voltage_source');
    expect(m.voltage).toBe(12);
  });

  // Pattern 9: Battery
  it('identifies battery', () => {
    const m = identifyComponentModel(makeComp('9V Battery'));
    expect(m.type).toBe('voltage_source');
    expect(m.voltage).toBe(9);
  });

  it('identifies LiPo battery', () => {
    const m = identifyComponentModel(makeComp('3.7V LiPo Battery'));
    expect(m.type).toBe('voltage_source');
  });

  // Pattern 10: Power supply (type='power')
  it('identifies power supply by type', () => {
    const m = identifyComponentModel(makeComp('DC Source', 'power'));
    expect(m.type).toBe('voltage_source');
  });

  // Pattern 11: Capacitor
  it('identifies capacitor', () => {
    const m = identifyComponentModel(makeComp('100uF Capacitor'));
    expect(m.type).toBe('capacitor_dc');
  });

  it('identifies cap abbreviation', () => {
    const m = identifyComponentModel(makeComp('Decoupling Cap'));
    expect(m.type).toBe('capacitor_dc');
  });

  // Pattern 12: Inductor
  it('identifies inductor', () => {
    const m = identifyComponentModel(makeComp('10mH Inductor'));
    expect(m.type).toBe('inductor_dc');
    expect(m.resistance).toBe(0.001);
  });

  // Pattern 13: Transformer
  it('identifies transformer', () => {
    const m = identifyComponentModel(makeComp('Step-down Transformer'));
    expect(m.type).toBe('inductor_dc');
  });

  // Pattern 14: Switch
  it('identifies switch', () => {
    const m = identifyComponentModel(makeComp('Tactile Push Button'));
    expect(m.type).toBe('wire');
  });

  // Pattern 15: Relay
  it('identifies relay', () => {
    const m = identifyComponentModel(makeComp('5V Relay Module'));
    expect(m.type).toBe('wire');
  });

  // Pattern 16: Fuse
  it('identifies fuse', () => {
    const m = identifyComponentModel(makeComp('1A Fuse'));
    expect(m.type).toBe('wire');
    expect(m.maxCurrent).toBe(1.0);
  });

  // Pattern 17: Crystal
  it('identifies crystal oscillator', () => {
    const m = identifyComponentModel(makeComp('16MHz Crystal'));
    expect(m.type).toBe('capacitor_dc');
  });

  // Pattern 18: Transistor (BJT)
  it('identifies NPN transistor', () => {
    const m = identifyComponentModel(makeComp('2N2222 NPN Transistor'));
    expect(m.type).toBe('resistor');
  });

  // Pattern 19: MOSFET
  it('identifies MOSFET', () => {
    const m = identifyComponentModel(makeComp('IRF540 N-Channel MOSFET'));
    expect(m.type).toBe('resistor');
    expect(m.resistance).toBe(100);
  });

  // Pattern 20: Op-amp
  it('identifies op-amp (LM358)', () => {
    const m = identifyComponentModel(makeComp('LM358 Op-Amp'));
    expect(m.type).toBe('resistor');
    expect(m.resistance).toBe(1e7);
  });

  // Pattern 21: Motor
  it('identifies motor', () => {
    const m = identifyComponentModel(makeComp('DC Motor'));
    expect(m.type).toBe('resistor');
    expect(m.resistance).toBe(50);
  });

  // Pattern 22: Speaker / Buzzer
  it('identifies buzzer', () => {
    const m = identifyComponentModel(makeComp('Piezo Buzzer'));
    expect(m.type).toBe('resistor');
  });

  it('identifies speaker', () => {
    const m = identifyComponentModel(makeComp('8 Ohm Speaker'));
    expect(m.type).toBe('resistor');
  });

  // Pattern 23: Connector
  it('identifies connector', () => {
    const m = identifyComponentModel(makeComp('2-Pin Header Connector'));
    expect(m.type).toBe('wire');
  });

  // Pattern 24: Wire / jumper
  it('identifies jumper wire', () => {
    const m = identifyComponentModel(makeComp('Jumper Wire'));
    expect(m.type).toBe('wire');
  });

  // Pattern 25: Breadboard
  it('identifies breadboard', () => {
    const m = identifyComponentModel(makeComp('830-Point Breadboard'));
    expect(m.type).toBe('wire');
  });

  // Pattern 26: Display
  it('identifies LCD display', () => {
    const m = identifyComponentModel(makeComp('16x2 LCD Display'));
    expect(m.type).toBe('resistor');
    expect(m.resistance).toBe(200);
  });

  it('identifies OLED display', () => {
    const m = identifyComponentModel(makeComp('0.96in OLED Screen'));
    expect(m.type).toBe('resistor');
  });

  // Pattern 27: Optocoupler
  it('identifies optocoupler', () => {
    const m = identifyComponentModel(makeComp('PC817 Optocoupler'));
    expect(m.type).toBe('led');
    expect(m.voltage).toBe(1.2);
  });

  // Pattern 28: Sensor (by type)
  it('identifies sensor by type', () => {
    const m = identifyComponentModel(makeComp('DHT11', 'sensor'));
    expect(m.type).toBe('resistor');
    expect(m.resistance).toBe(10000);
  });

  // Pattern 29: Actuator (by type)
  it('identifies actuator by type', () => {
    const m = identifyComponentModel(makeComp('Servo Motor', 'actuator'));
    expect(m.type).toBe('resistor');
    expect(m.maxCurrent).toBe(0.5);
  });

  // Pattern 30: Microcontroller (by type)
  it('identifies microcontroller by type', () => {
    const m = identifyComponentModel(makeComp('Arduino Uno', 'microcontroller'));
    expect(m.type).toBe('wire');
  });

  // Default: unknown → wire
  it('defaults to wire for unknown components', () => {
    const m = identifyComponentModel(makeComp('Mystery Part'));
    expect(m.type).toBe('wire');
    expect(m.resistance).toBe(0.001);
  });
});

// ---------------------------------------------------------------------------
// Name-based value extraction for real component names
// ---------------------------------------------------------------------------

describe('real-world component names', () => {
  it('10k resistor → 10000Ω', () => {
    const comp = makeComp('10k Resistor', 'other');
    const model = identifyComponentModel(comp);
    expect(model.type).toBe('resistor');
    expect(model.resistance).toBe(10000);
  });

  it('2.2MΩ resistor → 2200000Ω', () => {
    const comp = makeComp('2.2MΩ Resistor', 'other');
    const model = identifyComponentModel(comp);
    expect(model.type).toBe('resistor');
    expect(model.resistance).toBe(2200000);
  });

  it('470 ohm resistor → 470Ω', () => {
    const comp = makeComp('470 ohm Resistor', 'other');
    const model = identifyComponentModel(comp);
    expect(model.type).toBe('resistor');
    expect(model.resistance).toBe(470);
  });

  it('9V Battery → 9V source', () => {
    const comp = makeComp('9V Alkaline Battery', 'other');
    const model = identifyComponentModel(comp);
    expect(model.type).toBe('voltage_source');
    expect(model.voltage).toBe(9);
  });

  it('3.3V LDO regulator → 3.3V source', () => {
    const comp = makeComp('3.3V LDO Regulator', 'other');
    const model = identifyComponentModel(comp);
    expect(model.type).toBe('voltage_source');
  });

  it('resistor with explicit electrical overrides name', () => {
    const comp = makeComp('10k Resistor', 'other', { resistance: 47000 });
    const model = identifyComponentModel(comp);
    expect(model.type).toBe('resistor');
    expect(model.resistance).toBe(47000); // Explicit wins
  });
});
