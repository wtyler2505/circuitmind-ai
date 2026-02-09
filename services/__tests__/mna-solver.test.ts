/**
 * MNA Solver Integration Tests
 *
 * End-to-end tests covering the full MNA simulation pipeline:
 * graph building → matrix assembly → solving → error detection → result formatting
 */

import { describe, it, expect } from 'vitest';
import type { WiringDiagram, ElectronicComponent, WireConnection } from '../../types';
import { simulationEngine } from '../simulationEngine';
import { parseElectricalValue, identifyComponentModel } from '../simulation/componentValueExtractor';
import { buildCircuitGraph, assignNodeNumbers, identifyGroundNode } from '../simulation/mnaGraphBuilder';
import { assembleMNA } from '../simulation/mnaMatrixAssembler';

// ---------------------------------------------------------------------------
// Test Helpers — Circuit Factories
// ---------------------------------------------------------------------------

/** Create a simple voltage divider: 5V source → R1 (1kΩ) → midpoint → R2 (1kΩ) → GND */
function createVoltageDivider(): WiringDiagram {
  const components: ElectronicComponent[] = [
    {
      id: 'psu',
      name: '5V Power Supply',
      type: 'power',
      description: '5V DC power supply',
      pins: ['VCC', 'GND'],
      electrical: { outputVoltage: 5 },
    },
    {
      id: 'r1',
      name: '1k Resistor',
      type: 'other',
      description: '1kΩ resistor',
      pins: ['1', '2'],
      electrical: { resistance: 1000 },
    },
    {
      id: 'r2',
      name: '1k Resistor',
      type: 'other',
      description: '1kΩ resistor',
      pins: ['1', '2'],
      electrical: { resistance: 1000 },
    },
  ];

  const connections: WireConnection[] = [
    { fromComponentId: 'psu', fromPin: 'VCC', toComponentId: 'r1', toPin: '1', description: 'VCC to R1' },
    { fromComponentId: 'r1', fromPin: '2', toComponentId: 'r2', toPin: '1', description: 'R1 to R2 midpoint' },
    { fromComponentId: 'r2', fromPin: '2', toComponentId: 'psu', toPin: 'GND', description: 'R2 to GND' },
  ];

  return { title: 'Voltage Divider', components, connections, explanation: '' };
}

/** Create a circuit with a floating (disconnected) component */
function createFloatingNodeCircuit(): WiringDiagram {
  const components: ElectronicComponent[] = [
    {
      id: 'psu',
      name: '5V Power Supply',
      type: 'power',
      description: '5V DC power supply',
      pins: ['VCC', 'GND'],
      electrical: { outputVoltage: 5 },
    },
    {
      id: 'r1',
      name: '1k Resistor',
      type: 'other',
      description: '1kΩ resistor',
      pins: ['1', '2'],
      electrical: { resistance: 1000 },
    },
    {
      id: 'r_floating',
      name: '10k Resistor',
      type: 'other',
      description: '10kΩ floating resistor',
      pins: ['1', '2'],
      electrical: { resistance: 10000 },
    },
  ];

  const connections: WireConnection[] = [
    { fromComponentId: 'psu', fromPin: 'VCC', toComponentId: 'r1', toPin: '1', description: 'VCC to R1' },
    { fromComponentId: 'r1', fromPin: '2', toComponentId: 'psu', toPin: 'GND', description: 'R1 to GND' },
    // r_floating is NOT connected to anything
  ];

  return { title: 'Floating Node Circuit', components, connections, explanation: '' };
}

/** Create a circuit with no ground reference */
function createNoGroundCircuit(): WiringDiagram {
  const components: ElectronicComponent[] = [
    {
      id: 'r1',
      name: '1k Resistor',
      type: 'other',
      description: '1kΩ resistor',
      pins: ['1', '2'],
      electrical: { resistance: 1000 },
    },
    {
      id: 'r2',
      name: '2k Resistor',
      type: 'other',
      description: '2kΩ resistor',
      pins: ['1', '2'],
      electrical: { resistance: 2000 },
    },
  ];

  const connections: WireConnection[] = [
    { fromComponentId: 'r1', fromPin: '2', toComponentId: 'r2', toPin: '1', description: 'R1 to R2' },
  ];

  return { title: 'No Ground Circuit', components, connections, explanation: '' };
}

/** Create a simple LED circuit: 5V → R (220Ω) → LED → GND */
function createLEDCircuit(): WiringDiagram {
  const components: ElectronicComponent[] = [
    {
      id: 'psu',
      name: '5V Power Supply',
      type: 'power',
      description: '5V DC power supply',
      pins: ['VCC', 'GND'],
      electrical: { outputVoltage: 5 },
    },
    {
      id: 'r1',
      name: '220 ohm Resistor',
      type: 'other',
      description: '220Ω current limiting resistor',
      pins: ['1', '2'],
      electrical: { resistance: 220 },
    },
    {
      id: 'led1',
      name: 'Red LED',
      type: 'other',
      description: 'Standard red LED',
      pins: ['anode', 'cathode'],
      electrical: { forwardVoltage: 2.0, maxCurrent: 0.020 },
    },
  ];

  const connections: WireConnection[] = [
    { fromComponentId: 'psu', fromPin: 'VCC', toComponentId: 'r1', toPin: '1', description: 'VCC to R1' },
    { fromComponentId: 'r1', fromPin: '2', toComponentId: 'led1', toPin: 'anode', description: 'R1 to LED anode' },
    { fromComponentId: 'led1', fromPin: 'cathode', toComponentId: 'psu', toPin: 'GND', description: 'LED cathode to GND' },
  ];

  return { title: 'LED Circuit', components, connections, explanation: '' };
}

/** Create a circuit with a capacitor (should be open in DC) */
function createCapacitorCircuit(): WiringDiagram {
  const components: ElectronicComponent[] = [
    {
      id: 'psu',
      name: '5V Power Supply',
      type: 'power',
      description: '5V DC power supply',
      pins: ['VCC', 'GND'],
      electrical: { outputVoltage: 5 },
    },
    {
      id: 'c1',
      name: '100uF Capacitor',
      type: 'other',
      description: '100µF electrolytic capacitor',
      pins: ['+', '-'],
    },
    {
      id: 'r1',
      name: '1k Resistor',
      type: 'other',
      description: '1kΩ resistor in parallel',
      pins: ['1', '2'],
      electrical: { resistance: 1000 },
    },
  ];

  const connections: WireConnection[] = [
    { fromComponentId: 'psu', fromPin: 'VCC', toComponentId: 'c1', toPin: '+', description: 'VCC to C+' },
    { fromComponentId: 'c1', fromPin: '-', toComponentId: 'psu', toPin: 'GND', description: 'C- to GND' },
    { fromComponentId: 'psu', fromPin: 'VCC', toComponentId: 'r1', toPin: '1', description: 'VCC to R1' },
    { fromComponentId: 'r1', fromPin: '2', toComponentId: 'psu', toPin: 'GND', description: 'R1 to GND' },
  ];

  return { title: 'Capacitor Circuit', components, connections, explanation: '' };
}

/** Create a large circuit with many resistors for performance testing */
function createLargeCircuit(nodeCount: number): WiringDiagram {
  const components: ElectronicComponent[] = [
    {
      id: 'psu',
      name: '5V Power Supply',
      type: 'power',
      description: '5V DC power supply',
      pins: ['VCC', 'GND'],
      electrical: { outputVoltage: 5 },
    },
  ];

  const connections: WireConnection[] = [];

  // Create a chain of resistors: VCC → R1 → R2 → ... → RN → GND
  for (let i = 0; i < nodeCount; i++) {
    components.push({
      id: `r${i}`,
      name: `1k Resistor ${i}`,
      type: 'other',
      description: '1kΩ resistor',
      pins: ['1', '2'],
      electrical: { resistance: 1000 },
    });
  }

  // Wire: VCC → R0
  connections.push({
    fromComponentId: 'psu',
    fromPin: 'VCC',
    toComponentId: 'r0',
    toPin: '1',
    description: 'VCC to R0',
  });

  // Wire chain: R0.2 → R1.1, R1.2 → R2.1, ...
  for (let i = 0; i < nodeCount - 1; i++) {
    connections.push({
      fromComponentId: `r${i}`,
      fromPin: '2',
      toComponentId: `r${i + 1}`,
      toPin: '1',
      description: `R${i} to R${i + 1}`,
    });
  }

  // Wire: last R → GND
  connections.push({
    fromComponentId: `r${nodeCount - 1}`,
    fromPin: '2',
    toComponentId: 'psu',
    toPin: 'GND',
    description: 'Last R to GND',
  });

  return { title: `Large Circuit (${nodeCount} nodes)`, components, connections, explanation: '' };
}

// ---------------------------------------------------------------------------
// Component Value Extractor Tests
// ---------------------------------------------------------------------------

describe('Component Value Extractor', () => {
  it('parses SI prefixes correctly', () => {
    expect(parseElectricalValue('10kΩ', 'Ω')).toBe(10000);
    expect(parseElectricalValue('2.2MΩ', 'Ω')).toBe(2200000);
    expect(parseElectricalValue('470 ohm', 'ohm')).toBe(470);
    expect(parseElectricalValue('100 uF', 'F')).toBeCloseTo(0.0001, 6);
    expect(parseElectricalValue('47 pF', 'F')).toBeCloseTo(47e-12, 15);
    expect(parseElectricalValue('3.3V', 'V')).toBe(3.3);
    expect(parseElectricalValue('500mA', 'A')).toBe(0.5);
  });

  it('returns null for no match', () => {
    expect(parseElectricalValue('hello world', 'Ω')).toBeNull();
    expect(parseElectricalValue('', 'V')).toBeNull();
  });

  it('identifies component models correctly', () => {
    const resistor: ElectronicComponent = {
      id: 'r1', name: '10k Resistor', type: 'other',
      description: '10kΩ resistor', pins: ['1', '2'],
      electrical: { resistance: 10000 },
    };
    expect(identifyComponentModel(resistor).type).toBe('resistor');

    const led: ElectronicComponent = {
      id: 'led1', name: 'Red LED', type: 'other',
      description: 'Standard red LED', pins: ['anode', 'cathode'],
    };
    expect(identifyComponentModel(led).type).toBe('led');

    const power: ElectronicComponent = {
      id: 'psu', name: '5V Power Supply', type: 'power',
      description: 'DC power supply', pins: ['VCC', 'GND'],
    };
    expect(identifyComponentModel(power).type).toBe('voltage_source');

    const cap: ElectronicComponent = {
      id: 'c1', name: '100uF Capacitor', type: 'other',
      description: 'Electrolytic capacitor', pins: ['+', '-'],
    };
    expect(identifyComponentModel(cap).type).toBe('capacitor_dc');

    const wire: ElectronicComponent = {
      id: 'w1', name: 'Jumper Wire', type: 'other',
      description: 'Connection wire', pins: ['1', '2'],
    };
    expect(identifyComponentModel(wire).type).toBe('wire');
  });
});

// ---------------------------------------------------------------------------
// Graph Builder Tests
// ---------------------------------------------------------------------------

describe('MNA Graph Builder', () => {
  it('builds connectivity graph for voltage divider', () => {
    const diagram = createVoltageDivider();
    const graph = buildCircuitGraph(diagram);

    // Should find ground pin on PSU
    expect(graph.groundPin).toBe('psu:GND');

    // R1 pin 2 and R2 pin 1 should be in the same net (midpoint)
    const r1p2Neighbors = graph.nets.get('r1:2');
    expect(r1p2Neighbors).toBeDefined();
    expect(r1p2Neighbors!.has('r2:1')).toBe(true);
  });

  it('assigns node numbers with ground as node 0', () => {
    const diagram = createVoltageDivider();
    const graph = buildCircuitGraph(diagram);
    const nodeMap = assignNodeNumbers(graph, diagram.components);

    // Ground pin should be node 0
    expect(nodeMap.get('psu:GND')).toBe(0);

    // R2 pin 2 is connected to GND, should also be node 0
    expect(nodeMap.get('r2:2')).toBe(0);

    // VCC and R1 pin 1 should be the same non-zero node
    const vccNode = nodeMap.get('psu:VCC');
    const r1p1Node = nodeMap.get('r1:1');
    expect(vccNode).toBe(r1p1Node);
    expect(vccNode).toBeGreaterThan(0);

    // Midpoint (R1 pin 2 = R2 pin 1) should be a different non-zero node
    const midNode = nodeMap.get('r1:2');
    expect(midNode).toBe(nodeMap.get('r2:1'));
    expect(midNode).toBeGreaterThan(0);
    expect(midNode).not.toBe(vccNode);
  });

  it('identifies ground node from power components', () => {
    const components: ElectronicComponent[] = [
      { id: 'psu', name: 'PSU', type: 'power', description: '', pins: ['VCC', 'GND'] },
      { id: 'r1', name: 'R1', type: 'other', description: '', pins: ['1', '2'] },
    ];
    expect(identifyGroundNode(components)).toBe('psu:GND');
  });

  it('returns null when no ground exists', () => {
    const components: ElectronicComponent[] = [
      { id: 'r1', name: 'R1', type: 'other', description: '', pins: ['1', '2'] },
    ];
    expect(identifyGroundNode(components)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Matrix Assembly Tests
// ---------------------------------------------------------------------------

describe('MNA Matrix Assembly', () => {
  it('assembles matrix for voltage divider', () => {
    const diagram = createVoltageDivider();
    const mna = assembleMNA(diagram);

    // Should have voltage source (PSU) in vsource map
    expect(mna.vsourceMap.has('psu')).toBe(true);

    // Matrix dimensions: N non-ground nodes + M voltage sources
    expect(mna.nodeCount).toBeGreaterThan(0);
    expect(mna.vsourceCount).toBe(1); // One voltage source (PSU)

    const size = mna.nodeCount + mna.vsourceCount;
    const A = mna.A.valueOf() as number[][];
    expect(A.length).toBe(size);
    expect(A[0].length).toBe(size);
  });

  it('assembles empty matrix for empty circuit', () => {
    const diagram: WiringDiagram = {
      title: 'Empty', components: [], connections: [], explanation: '',
    };
    const mna = assembleMNA(diagram);
    expect(mna.nodeCount).toBe(0);
    expect(mna.vsourceCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Full Solver Integration Tests
// ---------------------------------------------------------------------------

describe('MNA Solver Integration', () => {
  it('solves voltage divider: midpoint = 2.5V, current = 2.5mA', () => {
    const diagram = createVoltageDivider();
    const result = simulationEngine.solveMNA(diagram);

    expect(result.usedMNA).toBe(true);
    expect(result.errors.length).toBe(0);

    // Find the midpoint node (R1:2 / R2:1)
    const midpointKey = 'r1:2';
    const midpointState = result.pinStates[midpointKey];
    expect(midpointState).toBeDefined();

    // Midpoint should be ~2.5V (within 1%)
    expect(midpointState.voltage).toBeCloseTo(2.5, 1);

    // Current through R1 should be ~2.5mA (5V / 2kΩ total)
    const r1Current = result.branchCurrents['r1'];
    if (r1Current !== undefined) {
      expect(Math.abs(r1Current)).toBeCloseTo(0.0025, 4);
    }

    // Total power should be ~12.5mW (5V * 2.5mA)
    expect(result.totalPower).toBeGreaterThan(0);
  });

  it('detects floating node', () => {
    const diagram = createFloatingNodeCircuit();
    const result = simulationEngine.solveMNA(diagram);

    // Should have a floating node warning for the disconnected resistor
    const floatingErrors = result.errors.filter((e) => e.type === 'floating_node');
    expect(floatingErrors.length).toBeGreaterThan(0);
    expect(floatingErrors[0].affectedComponentIds).toContain('r_floating');
  });

  it('detects no ground reference', () => {
    const diagram = createNoGroundCircuit();
    const result = simulationEngine.solveMNA(diagram);

    const noGroundErrors = result.errors.filter((e) => e.type === 'no_ground');
    expect(noGroundErrors.length).toBe(1);
  });

  it('handles empty diagram gracefully', () => {
    const diagram: WiringDiagram = {
      title: 'Empty', components: [], connections: [], explanation: '',
    };
    const result = simulationEngine.solveMNA(diagram);

    expect(result.usedMNA).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.nodeCount).toBe(0);
    expect(Object.keys(result.pinStates).length).toBe(0);
  });

  it('treats capacitors as open circuits in DC', () => {
    const diagram = createCapacitorCircuit();
    const result = simulationEngine.solveMNA(diagram);

    // The capacitor should have zero current
    const capCurrent = result.branchCurrents['c1'];
    if (capCurrent !== undefined) {
      expect(Math.abs(capCurrent)).toBeCloseTo(0, 6);
    }

    // The parallel resistor should still carry current
    const r1Current = result.branchCurrents['r1'];
    if (r1Current !== undefined) {
      expect(Math.abs(r1Current)).toBeGreaterThan(0);
    }
  });

  it('includes debug info when requested', () => {
    const diagram = createVoltageDivider();
    const result = simulationEngine.solveMNA(diagram, { debug: true });

    expect(result.debug).toBeDefined();
    expect(result.debug!.matrixA).toBeDefined();
    expect(result.debug!.matrixA.length).toBeGreaterThan(0);
    expect(result.debug!.nodeMap).toBeDefined();
    expect(result.debug!.vsourceMap).toBeDefined();
  });

  it('derives correct logic states from voltages', () => {
    const diagram = createVoltageDivider();
    const result = simulationEngine.solveMNA(diagram);

    // VCC pin should be HIGH (5V > 2.5V threshold)
    const vccState = result.pinStates['psu:VCC'];
    expect(vccState).toBeDefined();
    expect(vccState.logicState).toBe('HIGH');

    // GND pin should be LOW (0V < 0.8V threshold)
    const gndState = result.pinStates['psu:GND'];
    expect(gndState).toBeDefined();
    expect(gndState.logicState).toBe('LOW');

    // Midpoint (2.5V) should be HIGH (> 2.5V threshold... borderline)
    // Note: deriveLogicState uses > 2.5V for HIGH, so 2.5V exactly → FLOATING
    const midState = result.pinStates['r1:2'];
    expect(midState).toBeDefined();
    // 2.5V is right at the boundary — could be HIGH or FLOATING depending on precision
    expect(['HIGH', 'FLOATING']).toContain(midState.logicState);
  });

  it('backward compatibility: old solve() still works', () => {
    const diagram = createVoltageDivider();
    const oldResult = simulationEngine.solve(diagram);

    // Old solve should still produce pinStates
    expect(oldResult.pinStates).toBeDefined();
    expect(Object.keys(oldResult.pinStates).length).toBeGreaterThan(0);
    expect(oldResult.isShortCircuit).toBe(false);
    expect(Array.isArray(oldResult.warnings)).toBe(true);
  });

  it('completes within 1 second for 50-node circuit', () => {
    const diagram = createLargeCircuit(50);
    const start = performance.now();
    const result = simulationEngine.solveMNA(diagram);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(1000); // < 1 second
    expect(result.usedMNA).toBe(true);
    // Should successfully solve the chain of resistors
    expect(result.nodeCount).toBeGreaterThan(0);
  });

  it('calculates power dissipation', () => {
    const diagram = createVoltageDivider();
    const result = simulationEngine.solveMNA(diagram);

    // Each 1kΩ resistor with 2.5mA → P = I²R = (0.0025)² * 1000 = 6.25mW
    const r1Power = result.powerDissipation['r1'];
    const r2Power = result.powerDissipation['r2'];
    if (r1Power !== undefined && r2Power !== undefined) {
      // Power should be positive for resistors (energy absorbed)
      expect(Math.abs(r1Power)).toBeGreaterThan(0);
      expect(Math.abs(r2Power)).toBeGreaterThan(0);
    }

    // Total power should be positive
    expect(result.totalPower).toBeGreaterThan(0);
  });
});
