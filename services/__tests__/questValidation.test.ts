/**
 * Tests for questValidation service
 * Validates quest completion rules against diagram state.
 */

import { describe, it, expect } from 'vitest';
import { validateQuest, validateRule } from '../questValidation';
import type {
  Quest,
  QuestValidationRule,
  WiringDiagram,
  ElectronicComponent,
  WireConnection,
} from '../../types';

// ============================================
// Test Data Factories
// ============================================

const createComponent = (overrides: Partial<ElectronicComponent> = {}): ElectronicComponent => ({
  id: `comp-${Math.random().toString(36).slice(2, 8)}`,
  name: 'Generic Component',
  type: 'other',
  description: 'A test component',
  pins: ['VCC', 'GND'],
  ...overrides,
});

const createConnection = (overrides: Partial<WireConnection> = {}): WireConnection => ({
  fromComponentId: 'comp-a',
  fromPin: 'VCC',
  toComponentId: 'comp-b',
  toPin: 'GND',
  description: 'Test wire',
  ...overrides,
});

const createDiagram = (
  components: ElectronicComponent[] = [],
  connections: WireConnection[] = []
): WiringDiagram => ({
  title: 'Test Diagram',
  components,
  connections,
  explanation: 'Test diagram for quest validation',
});

const createQuest = (overrides: Partial<Quest> = {}): Quest => ({
  id: 'test-quest',
  title: 'Test Quest',
  description: 'A test quest',
  difficulty: 'beginner',
  prerequisites: [],
  componentsRequired: [],
  validationRules: [],
  estimatedMinutes: 5,
  pointsReward: 100,
  category: 'basics',
  ...overrides,
});

// ============================================
// component_placed Tests
// ============================================

describe('validateRule — component_placed', () => {
  it('finds a component by exact type match', () => {
    const rule: QuestValidationRule = {
      type: 'component_placed',
      target: 'sensor',
      description: 'Place a sensor',
    };

    const diagram = createDiagram([
      createComponent({ type: 'sensor', name: 'Temperature Sensor' }),
    ]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(true);
    expect(result.details).toContain('Found 1');
  });

  it('finds a component by name substring (case-insensitive)', () => {
    const rule: QuestValidationRule = {
      type: 'component_placed',
      target: 'arduino',
      description: 'Place an Arduino',
    };

    // The type is 'microcontroller', not 'arduino' — match must come from name
    const diagram = createDiagram([
      createComponent({ type: 'microcontroller', name: 'Arduino Uno R3' }),
    ]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(true);
    expect(result.details).toContain('Found 1');
  });

  it('fails when no matching component exists', () => {
    const rule: QuestValidationRule = {
      type: 'component_placed',
      target: 'microcontroller',
      description: 'Place a microcontroller',
    };

    const diagram = createDiagram([
      createComponent({ type: 'other', name: 'LED' }),
    ]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(false);
    expect(result.details).toContain('No components matching');
  });

  it('respects count requirement', () => {
    const rule: QuestValidationRule = {
      type: 'component_placed',
      target: 'other',
      count: 3,
      description: 'Place 3 passive components',
    };

    const diagram = createDiagram([
      createComponent({ id: 'led', type: 'other', name: 'LED' }),
      createComponent({ id: 'r1', type: 'other', name: 'Resistor' }),
    ]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(false);
    expect(result.details).toContain('Found 2 of 3');
  });

  it('passes when count is met exactly', () => {
    const rule: QuestValidationRule = {
      type: 'component_placed',
      target: 'other',
      count: 2,
      description: 'Place 2 components',
    };

    const diagram = createDiagram([
      createComponent({ id: 'led', type: 'other', name: 'LED' }),
      createComponent({ id: 'r1', type: 'other', name: 'Resistor' }),
    ]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(true);
  });

  it('fails when target is missing', () => {
    const rule: QuestValidationRule = {
      type: 'component_placed',
      description: 'No target specified',
    };

    const diagram = createDiagram([createComponent()]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(false);
    expect(result.details).toContain('missing a target');
  });
});

// ============================================
// wire_connected Tests
// ============================================

describe('validateRule — wire_connected', () => {
  it('passes when at least one connection exists (default count)', () => {
    const rule: QuestValidationRule = {
      type: 'wire_connected',
      description: 'Connect a wire',
    };

    const diagram = createDiagram([], [createConnection()]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(true);
    expect(result.details).toContain('1 of 1');
  });

  it('checks exact connection count requirement', () => {
    const rule: QuestValidationRule = {
      type: 'wire_connected',
      count: 3,
      description: 'Make 3 connections',
    };

    const diagram = createDiagram([], [
      createConnection({ fromComponentId: 'a', toComponentId: 'b' }),
      createConnection({ fromComponentId: 'b', toComponentId: 'c' }),
    ]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(false);
    expect(result.details).toContain('2 of 3');
  });

  it('fails on empty diagram', () => {
    const rule: QuestValidationRule = {
      type: 'wire_connected',
      count: 1,
      description: 'Connect a wire',
    };

    const diagram = createDiagram();

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(false);
    expect(result.details).toContain('0 of 1');
  });
});

// ============================================
// component_count Tests
// ============================================

describe('validateRule — component_count', () => {
  it('passes when component count meets requirement', () => {
    const rule: QuestValidationRule = {
      type: 'component_count',
      count: 2,
      description: 'Have 2 components',
    };

    const diagram = createDiagram([
      createComponent({ id: 'a' }),
      createComponent({ id: 'b' }),
      createComponent({ id: 'c' }),
    ]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(true);
    expect(result.details).toContain('3 of 2');
  });

  it('fails when component count is insufficient', () => {
    const rule: QuestValidationRule = {
      type: 'component_count',
      count: 5,
      description: 'Have 5 components',
    };

    const diagram = createDiagram([createComponent()]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(false);
    expect(result.details).toContain('1 of 5');
  });
});

// ============================================
// simulation_run Tests
// ============================================

describe('validateRule — simulation_run', () => {
  it('passes when simulationRun flag is true', () => {
    const rule: QuestValidationRule = {
      type: 'simulation_run',
      description: 'Run the simulation',
    };

    const diagram = createDiagram();

    const result = validateRule(rule, diagram, { simulationRun: true });
    expect(result.passed).toBe(true);
    expect(result.details).toContain('has been run');
  });

  it('fails when simulationRun flag is false', () => {
    const rule: QuestValidationRule = {
      type: 'simulation_run',
      description: 'Run the simulation',
    };

    const diagram = createDiagram();

    const result = validateRule(rule, diagram, { simulationRun: false });
    expect(result.passed).toBe(false);
    expect(result.details).toContain('not been run');
  });

  it('fails when no flags are provided', () => {
    const rule: QuestValidationRule = {
      type: 'simulation_run',
      description: 'Run the simulation',
    };

    const diagram = createDiagram();

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(false);
  });
});

// ============================================
// specific_connection Tests
// ============================================

describe('validateRule — specific_connection', () => {
  const sensorComp = createComponent({
    id: 'sensor-1',
    type: 'sensor',
    name: 'DHT22 Sensor',
    pins: ['VCC', 'GND', 'DATA'],
  });

  const mcuComp = createComponent({
    id: 'mcu-1',
    type: 'microcontroller',
    name: 'ESP32',
    pins: ['3V3', 'GND', 'GPIO4'],
  });

  it('validates structured format "type:pin->type:pin"', () => {
    const rule: QuestValidationRule = {
      type: 'specific_connection',
      target: 'sensor:DATA->microcontroller:GPIO4',
      description: 'Wire sensor DATA to MCU GPIO4',
    };

    const diagram = createDiagram(
      [sensorComp, mcuComp],
      [
        createConnection({
          fromComponentId: 'sensor-1',
          fromPin: 'DATA',
          toComponentId: 'mcu-1',
          toPin: 'GPIO4',
        }),
      ]
    );

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(true);
    expect(result.details).toContain('Found connection');
  });

  it('validates structured format in reverse direction', () => {
    const rule: QuestValidationRule = {
      type: 'specific_connection',
      target: 'sensor:DATA->microcontroller:GPIO4',
      description: 'Wire sensor DATA to MCU GPIO4',
    };

    // Connection goes MCU->Sensor (reversed from the rule) — should still pass
    const diagram = createDiagram(
      [sensorComp, mcuComp],
      [
        createConnection({
          fromComponentId: 'mcu-1',
          fromPin: 'GPIO4',
          toComponentId: 'sensor-1',
          toPin: 'DATA',
        }),
      ]
    );

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(true);
  });

  it('validates structured format without pin names (type-only)', () => {
    const rule: QuestValidationRule = {
      type: 'specific_connection',
      target: 'sensor->microcontroller',
      description: 'Wire sensor to MCU (any pins)',
    };

    const diagram = createDiagram(
      [sensorComp, mcuComp],
      [
        createConnection({
          fromComponentId: 'sensor-1',
          fromPin: 'DATA',
          toComponentId: 'mcu-1',
          toPin: 'GPIO4',
        }),
      ]
    );

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(true);
  });

  it('fails when no matching connection exists (structured format)', () => {
    const rule: QuestValidationRule = {
      type: 'specific_connection',
      target: 'sensor:DATA->power:VIN',
      description: 'Wire sensor to power',
    };

    // Only sensor-to-MCU connection exists
    const diagram = createDiagram(
      [sensorComp, mcuComp],
      [
        createConnection({
          fromComponentId: 'sensor-1',
          fromPin: 'DATA',
          toComponentId: 'mcu-1',
          toPin: 'GPIO4',
        }),
      ]
    );

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(false);
    expect(result.details).toContain('No connection');
  });

  it('validates shorthand format "keyword-to-keyword"', () => {
    const rule: QuestValidationRule = {
      type: 'specific_connection',
      target: 'sensor-to-mcu',
      description: 'Wire sensor to microcontroller',
    };

    const diagram = createDiagram(
      [sensorComp, mcuComp],
      [
        createConnection({
          fromComponentId: 'sensor-1',
          fromPin: 'DATA',
          toComponentId: 'mcu-1',
          toPin: 'GPIO4',
        }),
      ]
    );

    // "mcu" should match via name "ESP32"... wait, MCU type is "microcontroller".
    // "mcu" is not in type "microcontroller" but may not be in name either.
    // Let's use a more explicit target.
    const rule2: QuestValidationRule = {
      type: 'specific_connection',
      target: 'sensor-to-microcontroller',
      description: 'Wire sensor to microcontroller',
    };

    const result = validateRule(rule2, diagram);
    expect(result.passed).toBe(true);
    expect(result.details).toContain('Found connection');
  });

  it('validates shorthand format in reverse connection direction', () => {
    const rule: QuestValidationRule = {
      type: 'specific_connection',
      target: 'sensor-to-microcontroller',
      description: 'Wire sensor to MCU',
    };

    // Connection is MCU->Sensor (opposite direction) — bidirectional matching
    const diagram = createDiagram(
      [sensorComp, mcuComp],
      [
        createConnection({
          fromComponentId: 'mcu-1',
          fromPin: 'GPIO4',
          toComponentId: 'sensor-1',
          toPin: 'DATA',
        }),
      ]
    );

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(true);
  });

  it('fails when target is missing', () => {
    const rule: QuestValidationRule = {
      type: 'specific_connection',
      description: 'No target',
    };

    const diagram = createDiagram([sensorComp, mcuComp], [createConnection()]);

    const result = validateRule(rule, diagram);
    expect(result.passed).toBe(false);
    expect(result.details).toContain('missing a target');
  });
});

// ============================================
// validateQuest — Full Quest Validation
// ============================================

describe('validateQuest', () => {
  it('returns 100% for a fully completed quest', () => {
    const quest = createQuest({
      id: 'full-quest',
      validationRules: [
        { type: 'component_placed', target: 'sensor', description: 'Place sensor' },
        { type: 'wire_connected', count: 1, description: 'Connect wire' },
      ],
    });

    const diagram = createDiagram(
      [createComponent({ type: 'sensor', name: 'Sensor' })],
      [createConnection()]
    );

    const result = validateQuest(quest, diagram);
    expect(result.passed).toBe(true);
    expect(result.completedRules).toBe(2);
    expect(result.totalRules).toBe(2);
    expect(result.completionPercent).toBe(100);
    expect(result.questId).toBe('full-quest');
  });

  it('returns partial completion when some rules pass', () => {
    const quest = createQuest({
      id: 'partial-quest',
      validationRules: [
        { type: 'component_placed', target: 'microcontroller', description: 'Place MCU' },
        { type: 'wire_connected', count: 2, description: 'Connect 2 wires' },
        { type: 'simulation_run', description: 'Run simulation' },
      ],
    });

    const diagram = createDiagram(
      [createComponent({ type: 'microcontroller', name: 'ESP32' })],
      [createConnection()] // Only 1 connection, need 2
    );

    // MCU placed = pass, 1/2 wires = fail, simulation not run = fail
    const result = validateQuest(quest, diagram);
    expect(result.passed).toBe(false);
    expect(result.completedRules).toBe(1);
    expect(result.totalRules).toBe(3);
    expect(result.completionPercent).toBe(33); // Math.round(1/3 * 100)
  });

  it('returns 0% for an empty diagram', () => {
    const quest = createQuest({
      id: 'empty-quest',
      validationRules: [
        { type: 'component_placed', target: 'sensor', description: 'Place sensor' },
        { type: 'wire_connected', count: 1, description: 'Connect wire' },
        { type: 'component_count', count: 3, description: 'Have 3 components' },
      ],
    });

    const diagram = createDiagram(); // empty

    const result = validateQuest(quest, diagram);
    expect(result.passed).toBe(false);
    expect(result.completedRules).toBe(0);
    expect(result.totalRules).toBe(3);
    expect(result.completionPercent).toBe(0);
    expect(result.ruleResults.every((r) => r.passed === false)).toBe(true);
  });

  it('handles quest with no validation rules gracefully', () => {
    const quest = createQuest({
      id: 'no-rules',
      validationRules: [],
    });

    const diagram = createDiagram();

    const result = validateQuest(quest, diagram);
    // A quest with zero rules cannot be "passed" — there's nothing to validate
    expect(result.passed).toBe(false);
    expect(result.completedRules).toBe(0);
    expect(result.totalRules).toBe(0);
    expect(result.completionPercent).toBe(0);
  });

  it('works with simulation flag set to true', () => {
    const quest = createQuest({
      id: 'sim-quest',
      validationRules: [
        { type: 'component_placed', target: 'microcontroller', description: 'Place MCU' },
        { type: 'simulation_run', description: 'Run simulation' },
      ],
    });

    const diagram = createDiagram([
      createComponent({ type: 'microcontroller', name: 'Arduino' }),
    ]);

    const result = validateQuest(quest, diagram, { simulationRun: true });
    expect(result.passed).toBe(true);
    expect(result.completionPercent).toBe(100);
  });

  it('returns individual rule results with details', () => {
    const quest = createQuest({
      validationRules: [
        { type: 'component_count', count: 2, description: 'Place 2 components' },
      ],
    });

    const diagram = createDiagram([createComponent()]);

    const result = validateQuest(quest, diagram);
    expect(result.ruleResults).toHaveLength(1);
    expect(result.ruleResults[0].rule.type).toBe('component_count');
    expect(result.ruleResults[0].passed).toBe(false);
    expect(result.ruleResults[0].details).toContain('1 of 2');
  });
});

// ============================================
// Integration: validate against real quest data shape
// ============================================

describe('validateQuest — realistic quest scenarios', () => {
  it('validates "First Light" quest from STARTER_QUESTS shape', () => {
    const firstLightQuest = createQuest({
      id: 'first-light',
      validationRules: [
        { type: 'component_placed', target: 'other', count: 2, description: 'Place an LED and a resistor' },
        { type: 'wire_connected', count: 1, description: 'Connect them with a wire' },
      ],
    });

    const led = createComponent({ id: 'led-1', type: 'other', name: 'Red LED' });
    const resistor = createComponent({ id: 'r1', type: 'other', name: '220 Ohm Resistor' });
    const wire = createConnection({
      fromComponentId: 'led-1',
      fromPin: 'anode',
      toComponentId: 'r1',
      toPin: 'pin1',
    });

    const diagram = createDiagram([led, resistor], [wire]);

    const result = validateQuest(firstLightQuest, diagram);
    expect(result.passed).toBe(true);
    expect(result.completionPercent).toBe(100);
  });

  it('validates "Blink of Life" quest partially (no simulation)', () => {
    const blinkQuest = createQuest({
      id: 'blink-of-life',
      validationRules: [
        { type: 'component_placed', target: 'microcontroller', count: 1, description: 'Place a microcontroller' },
        { type: 'wire_connected', count: 2, description: 'Wire the microcontroller to an LED' },
        { type: 'simulation_run', description: 'Run the simulation' },
      ],
    });

    const mcu = createComponent({ id: 'mcu-1', type: 'microcontroller', name: 'Arduino Nano' });
    const led = createComponent({ id: 'led-1', type: 'other', name: 'LED' });
    const wire1 = createConnection({ fromComponentId: 'mcu-1', fromPin: 'D13', toComponentId: 'led-1', toPin: 'anode' });
    const wire2 = createConnection({ fromComponentId: 'led-1', fromPin: 'cathode', toComponentId: 'mcu-1', toPin: 'GND' });

    const diagram = createDiagram([mcu, led], [wire1, wire2]);

    // Without simulation
    const partial = validateQuest(blinkQuest, diagram);
    expect(partial.passed).toBe(false);
    expect(partial.completedRules).toBe(2);
    expect(partial.completionPercent).toBe(67); // Math.round(2/3 * 100)

    // With simulation
    const complete = validateQuest(blinkQuest, diagram, { simulationRun: true });
    expect(complete.passed).toBe(true);
    expect(complete.completionPercent).toBe(100);
  });
});
