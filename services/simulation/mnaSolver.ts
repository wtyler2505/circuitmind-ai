/**
 * MNA Matrix Solver
 *
 * Solves the MNA system Ax = b using mathjs LU decomposition.
 * Extracts node voltages and branch currents from the solution vector.
 *
 * Solution vector structure: [V1, V2, ..., VN, I_vs1, I_vs2, ..., I_vsM]
 *   - First N entries: node voltages (ground/node-0 is always 0V)
 *   - Last M entries: voltage source branch currents
 */

import { lusolve } from 'mathjs';
import type { Matrix } from 'mathjs';
import type { WiringDiagram } from '../../types';
import type { MNAMatrix, MNASolution, MNASolveOptions } from './types';
import { identifyComponentModel } from './componentValueExtractor';

// ---------------------------------------------------------------------------
// Voltage & Current Extraction
// ---------------------------------------------------------------------------

/**
 * Extract node voltages from the MNA solution vector.
 *
 * @param solution - Raw solution vector from lusolve
 * @param nodeCount - Number of non-ground nodes (N)
 * @returns Map from node number to voltage (volts). Ground (node 0) = 0V.
 */
export function extractNodeVoltages(
  solution: number[][],
  nodeCount: number
): Map<number, number> {
  const voltages = new Map<number, number>();

  // Ground is always 0V
  voltages.set(0, 0);

  // First N elements are node voltages (1-indexed nodes)
  for (let i = 0; i < nodeCount; i++) {
    const voltage = solution[i]?.[0] ?? 0;
    voltages.set(i + 1, voltage);
  }

  return voltages;
}

/**
 * Calculate the current through a resistive element using Ohm's law.
 *
 * I = (V_nodeA - V_nodeB) / R
 *
 * Convention: positive current flows from nodeA to nodeB.
 */
export function calculateResistorCurrent(
  nodeA: number,
  nodeB: number,
  resistance: number,
  nodeVoltages: Map<number, number>
): number {
  if (resistance <= 0) return 0;

  const vA = nodeVoltages.get(nodeA) ?? 0;
  const vB = nodeVoltages.get(nodeB) ?? 0;

  return (vA - vB) / resistance;
}

/**
 * Extract branch currents for all components.
 *
 * - Voltage sources: current read directly from solution vector (last M entries)
 * - Resistors/wires/inductors: calculated via Ohm's law
 * - Current sources: use specified current value
 * - Capacitors (DC): zero current
 *
 * @param solution - Raw solution vector
 * @param mna - Assembled MNA system
 * @param diagram - Circuit diagram
 * @returns Map from component ID to current (amps)
 */
export function extractBranchCurrents(
  solution: number[][],
  mna: MNAMatrix,
  diagram: WiringDiagram,
  nodeVoltages: Map<number, number>
): Map<string, number> {
  const currents = new Map<string, number>();

  for (const component of diagram.components) {
    const model = identifyComponentModel(component);

    // Voltage sources and LEDs: current from auxiliary variables
    if (model.type === 'voltage_source' || model.type === 'led') {
      const vsIdx = mna.vsourceMap.get(component.id);
      if (vsIdx !== undefined) {
        const current = solution[mna.nodeCount + vsIdx]?.[0] ?? 0;
        currents.set(component.id, current);
      }
      continue;
    }

    // Need at least 2 pins for branch current
    if (!component.pins || component.pins.length < 2) {
      currents.set(component.id, 0);
      continue;
    }

    const pinA = `${component.id}:${component.pins[0]}`;
    const pinB = `${component.id}:${component.pins[1]}`;
    const nodeA = mna.nodeMap.get(pinA) ?? 0;
    const nodeB = mna.nodeMap.get(pinB) ?? 0;

    switch (model.type) {
      case 'resistor':
        currents.set(
          component.id,
          calculateResistorCurrent(nodeA, nodeB, model.resistance ?? 1000, nodeVoltages)
        );
        break;

      case 'wire':
      case 'inductor_dc':
        currents.set(
          component.id,
          calculateResistorCurrent(nodeA, nodeB, model.resistance ?? 0.001, nodeVoltages)
        );
        break;

      case 'current_source':
        currents.set(component.id, model.current ?? 0);
        break;

      case 'capacitor_dc':
        currents.set(component.id, 0); // Open circuit in DC
        break;

      default:
        currents.set(component.id, 0);
    }
  }

  return currents;
}

// ---------------------------------------------------------------------------
// Main Solver
// ---------------------------------------------------------------------------

/**
 * Solve the assembled MNA system Ax = b.
 *
 * Uses mathjs LU decomposition with partial pivoting.
 * Returns node voltages, branch currents, and convergence status.
 *
 * @param mna - Assembled MNA matrix system
 * @param diagram - Original wiring diagram (for component model lookup)
 * @param options - Solver options (tolerance, debug mode)
 * @returns MNA solution with voltages, currents, and convergence info
 */
export function solveMNASystem(
  mna: MNAMatrix,
  diagram: WiringDiagram,
  options: MNASolveOptions = {}
): MNASolution {
  const { tolerance = 1e-12 } = options;
  const size = mna.nodeCount + mna.vsourceCount;

  // Edge case: empty circuit
  if (size === 0) {
    return {
      nodeVoltages: new Map([[0, 0]]),
      branchCurrents: new Map(),
      converged: true,
    };
  }

  try {
    // Solve Ax = b using LU decomposition
    // lusolve returns a Matrix; .valueOf() converts to plain number[][]
    const rawResult = lusolve(mna.A, mna.b);
    const x = (rawResult as Matrix).valueOf() as number[][];

    // Clean near-zero values (numerical noise)
    for (let i = 0; i < x.length; i++) {
      if (Math.abs(x[i][0]) < tolerance) {
        x[i][0] = 0;
      }
    }

    // Extract results
    const nodeVoltages = extractNodeVoltages(x, mna.nodeCount);
    const branchCurrents = extractBranchCurrents(x, mna, diagram, nodeVoltages);

    return {
      nodeVoltages,
      branchCurrents,
      converged: true,
    };
  } catch (err) {
    // LU decomposition can fail for singular matrices
    const message =
      err instanceof Error ? err.message : 'Unknown solver error';

    return {
      nodeVoltages: new Map([[0, 0]]),
      branchCurrents: new Map(),
      converged: false,
      error: `MNA solver failed: ${message}`,
    };
  }
}
