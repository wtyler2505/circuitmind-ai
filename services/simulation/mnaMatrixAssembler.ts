/**
 * MNA Matrix Assembler
 *
 * Builds the Modified Nodal Analysis system matrix (A) and right-hand side
 * vector (b) by applying component stamps. Uses mathjs for arbitrary-size
 * matrix construction.
 *
 * MNA equations: A·x = b
 *   where x = [node voltages (N) | voltage source currents (M)]
 *   Matrix size: (N+M) × (N+M)
 */

import { matrix, zeros } from 'mathjs';
import type { Matrix } from 'mathjs';
import type { WiringDiagram, ElectronicComponent } from '../../types';
import type { MNAMatrix, ComponentModel } from './types';
import { identifyComponentModel, extractVoltage } from './componentValueExtractor';
import { buildCircuitGraph, assignNodeNumbers } from './mnaGraphBuilder';

// ---------------------------------------------------------------------------
// Stamp Functions
// ---------------------------------------------------------------------------

/**
 * Apply resistor conductance stamp to the A matrix.
 *
 * For a resistor R between nodes i and j:
 *   A[i][i] += G,  A[j][j] += G
 *   A[i][j] -= G,  A[j][i] -= G
 * where G = 1/R (conductance).
 *
 * Ground node (0) entries are skipped since ground row/column is eliminated.
 */
export function stampResistor(
  A: Matrix,
  nodeA: number,
  nodeB: number,
  resistance: number
): void {
  if (resistance <= 0) return;

  const G = 1 / resistance;
  const data = A.valueOf() as number[][];

  if (nodeA > 0) {
    data[nodeA - 1][nodeA - 1] += G;
  }
  if (nodeB > 0) {
    data[nodeB - 1][nodeB - 1] += G;
  }
  if (nodeA > 0 && nodeB > 0) {
    data[nodeA - 1][nodeB - 1] -= G;
    data[nodeB - 1][nodeA - 1] -= G;
  }
}

/**
 * Apply voltage source stamp to A matrix and b vector.
 *
 * A voltage source V between node+ (nodeA) and node- (nodeB)
 * adds an auxiliary current variable I_vs at index (N + vsIndex):
 *
 *   A[nodeA][N+vsIndex] +=  1
 *   A[nodeB][N+vsIndex] += -1
 *   A[N+vsIndex][nodeA] +=  1
 *   A[N+vsIndex][nodeB] += -1
 *   b[N+vsIndex] = voltage
 *
 * This enforces V(nodeA) - V(nodeB) = voltage.
 */
export function stampVoltageSource(
  A: Matrix,
  b: Matrix,
  nodeA: number,
  nodeB: number,
  voltage: number,
  vsIndex: number,
  nodeCount: number
): void {
  const dataA = A.valueOf() as number[][];
  const dataB = b.valueOf() as number[][];
  const row = nodeCount + vsIndex; // Auxiliary equation row

  // KVL constraint: V(nodeA) - V(nodeB) = voltage
  if (nodeA > 0) {
    dataA[nodeA - 1][row] += 1;
    dataA[row][nodeA - 1] += 1;
  }
  if (nodeB > 0) {
    dataA[nodeB - 1][row] -= 1;
    dataA[row][nodeB - 1] -= 1;
  }

  // RHS: voltage value
  dataB[row][0] = voltage;
}

/**
 * Apply current source stamp to the b vector.
 *
 * A current source I flowing from nodeA to nodeB:
 *   b[nodeA] -= I  (current leaves nodeA)
 *   b[nodeB] += I  (current enters nodeB)
 */
export function stampCurrentSource(
  b: Matrix,
  nodeA: number,
  nodeB: number,
  current: number
): void {
  const dataB = b.valueOf() as number[][];

  if (nodeA > 0) {
    dataB[nodeA - 1][0] -= current;
  }
  if (nodeB > 0) {
    dataB[nodeB - 1][0] += current;
  }
}

// ---------------------------------------------------------------------------
// Pin Resolution Helpers
// ---------------------------------------------------------------------------

/**
 * Get the two terminal pin keys for a two-terminal component.
 * Uses the first two pins from the component's pin list.
 * Returns null if component has fewer than 2 pins.
 */
function getTerminalPins(
  component: ElectronicComponent
): { pinA: string; pinB: string } | null {
  if (!component.pins || component.pins.length < 2) {
    return null;
  }
  return {
    pinA: `${component.id}:${component.pins[0]}`,
    pinB: `${component.id}:${component.pins[1]}`,
  };
}

/**
 * For a voltage source (power component), identify the positive and negative
 * terminal pins. Convention:
 *   - Positive: VCC, VIN, V+, OUT, +, 5V, 3.3V, etc.
 *   - Negative: GND, VSS, V-, 0V, -, etc.
 *
 * Falls back to first pin = positive, second pin = negative.
 */
function getVoltageSourcePins(
  component: ElectronicComponent
): { posPin: string; negPin: string } | null {
  if (!component.pins || component.pins.length < 2) {
    return null;
  }

  const negPatterns = /^(gnd|ground|vss|v-|0v|-)$/i;
  const posPatterns = /^(vcc|vin|vout|v\+|out|\+|\d+\.?\d*v)$/i;

  let posIdx = -1;
  let negIdx = -1;

  for (let i = 0; i < component.pins.length; i++) {
    const pin = component.pins[i];
    if (negIdx === -1 && negPatterns.test(pin)) {
      negIdx = i;
    }
    if (posIdx === -1 && posPatterns.test(pin)) {
      posIdx = i;
    }
  }

  // Fallback: first pin positive, second pin negative
  if (posIdx === -1) posIdx = 0;
  if (negIdx === -1) negIdx = posIdx === 0 ? 1 : 0;

  return {
    posPin: `${component.id}:${component.pins[posIdx]}`,
    negPin: `${component.id}:${component.pins[negIdx]}`,
  };
}

// ---------------------------------------------------------------------------
// Main Assembly
// ---------------------------------------------------------------------------

/**
 * Assemble the MNA system of equations for a wiring diagram.
 *
 * Steps:
 * 1. Build circuit graph (union-find for net connectivity)
 * 2. Assign node numbers (ground = 0, others sequential from 1)
 * 3. Count non-ground nodes (N) and voltage sources (M)
 * 4. Initialize (N+M)×(N+M) matrix A and (N+M)×1 vector b
 * 5. Apply component stamps
 * 6. Return assembled MNAMatrix
 *
 * @param diagram - The wiring diagram to analyze
 * @returns Assembled MNA system ready for solving
 */
export function assembleMNA(diagram: WiringDiagram): MNAMatrix {
  // Step 1-2: Build graph and assign node numbers
  const graph = buildCircuitGraph(diagram);
  const nodeMap = assignNodeNumbers(graph, diagram.components);

  // Step 3: Count non-ground nodes and identify voltage sources
  const nonGroundNodes = new Set<number>();
  for (const nodeNum of nodeMap.values()) {
    if (nodeNum > 0) {
      nonGroundNodes.add(nodeNum);
    }
  }
  const N = nonGroundNodes.size;

  // First pass: count voltage sources to determine matrix size
  const vsourceComponents: Array<{
    component: ElectronicComponent;
    model: ComponentModel;
    posPin: string;
    negPin: string;
  }> = [];

  for (const component of diagram.components) {
    const model = identifyComponentModel(component);

    if (model.type === 'voltage_source') {
      const pins = getVoltageSourcePins(component);
      if (pins) {
        vsourceComponents.push({
          component,
          model,
          posPin: pins.posPin,
          negPin: pins.negPin,
        });
      }
    }

    // LEDs are modeled as voltage source + series resistor
    if (model.type === 'led') {
      const terminals = getTerminalPins(component);
      if (terminals) {
        vsourceComponents.push({
          component,
          model,
          posPin: terminals.pinA,
          negPin: terminals.pinB,
        });
      }
    }
  }

  const M = vsourceComponents.length;
  const size = N + M;

  // Step 4: Initialize matrices
  const A = matrix(zeros([size, size]) as number[][]);
  const b = matrix(zeros([size, 1]) as number[][]);

  // Step 5: Build voltage source map and apply stamps
  const vsourceMap = new Map<string, number>();

  // Apply voltage source stamps first (they define auxiliary variables)
  for (let vsIdx = 0; vsIdx < vsourceComponents.length; vsIdx++) {
    const { component, model, posPin, negPin } = vsourceComponents[vsIdx];
    const nodeA = nodeMap.get(posPin) ?? 0;
    const nodeB = nodeMap.get(negPin) ?? 0;

    vsourceMap.set(component.id, vsIdx);

    if (model.type === 'voltage_source') {
      const voltage = model.voltage ?? extractVoltage(component);
      stampVoltageSource(A, b, nodeA, nodeB, voltage, vsIdx, N);
    }

    if (model.type === 'led') {
      // LED: voltage source for forward voltage + series resistance
      const vf = model.voltage ?? 2.0;
      const seriesR = model.resistance ?? 20;

      stampVoltageSource(A, b, nodeA, nodeB, vf, vsIdx, N);
      // Add series resistance to the LED branch
      stampResistor(A, nodeA, nodeB, seriesR);
    }
  }

  // Apply stamps for all other component types
  for (const component of diagram.components) {
    const model = identifyComponentModel(component);

    // Skip voltage sources and LEDs (already stamped above)
    if (model.type === 'voltage_source' || model.type === 'led') {
      continue;
    }

    const terminals = getTerminalPins(component);
    if (!terminals) continue;

    const nodeA = nodeMap.get(terminals.pinA) ?? 0;
    const nodeB = nodeMap.get(terminals.pinB) ?? 0;

    switch (model.type) {
      case 'resistor':
        stampResistor(A, nodeA, nodeB, model.resistance ?? 1000);
        break;

      case 'wire':
      case 'inductor_dc':
        // Wire and inductor (DC): very low resistance
        stampResistor(A, nodeA, nodeB, model.resistance ?? 0.001);
        break;

      case 'current_source':
        stampCurrentSource(b, nodeA, nodeB, model.current ?? 0);
        break;

      case 'capacitor_dc':
        // Open circuit in DC — no stamp needed
        break;
    }
  }

  return {
    A,
    b,
    nodeMap,
    vsourceMap,
    nodeCount: N,
    vsourceCount: M,
  };
}
