/**
 * MNA Circuit Error Detector
 *
 * Detects and reports circuit errors including:
 * - Singular matrix (no unique solution)
 * - Floating nodes (disconnected from ground)
 * - No ground reference
 * - Overcurrent conditions
 * - Voltage source loops
 */

import { det } from 'mathjs';
import type { WiringDiagram } from '../../types';
import type { MNAMatrix, MNASolution, CircuitError, CircuitGraph } from './types';
import { identifyComponentModel } from './componentValueExtractor';

// ---------------------------------------------------------------------------
// Individual Detectors
// ---------------------------------------------------------------------------

/**
 * Detect singular matrix (system has no unique solution).
 *
 * A singular matrix typically indicates:
 * - Voltage sources in a loop with no resistance
 * - Disconnected circuit sections
 * - Conflicting constraints
 *
 * @param mna - Assembled MNA system
 * @param threshold - Determinant threshold for singularity (default: 1e-10)
 * @returns CircuitError if singular, null otherwise
 */
export function detectSingularMatrix(
  mna: MNAMatrix,
  threshold = 1e-10
): CircuitError | null {
  const size = mna.nodeCount + mna.vsourceCount;
  if (size === 0) return null;

  try {
    const d = det(mna.A);
    if (Math.abs(d as number) < threshold) {
      return {
        type: 'singular_matrix',
        message:
          'Circuit has no unique solution. Check for voltage source loops, disconnected sections, or missing ground.',
        severity: 'error',
        affectedComponentIds: [],
      };
    }
  } catch {
    // det() can throw for badly conditioned matrices
    return {
      type: 'singular_matrix',
      message:
        'Circuit matrix is ill-conditioned. The circuit may have conflicting constraints.',
      severity: 'error',
      affectedComponentIds: [],
    };
  }

  return null;
}

/**
 * Detect missing ground reference.
 *
 * Every circuit needs a ground node (voltage reference) for MNA to work.
 * Without ground, all voltages are relative and the system is under-determined.
 *
 * @param graph - Circuit connectivity graph
 * @returns CircuitError if no ground, null otherwise
 */
export function detectNoGround(graph: CircuitGraph): CircuitError | null {
  if (graph.groundPin === null) {
    return {
      type: 'no_ground',
      message:
        'No ground reference found. Add a power component with a GND pin to define the voltage reference.',
      severity: 'error',
      affectedComponentIds: [],
    };
  }
  return null;
}

/**
 * Detect floating nodes (not connected to ground through any path).
 *
 * A floating node has an indeterminate voltage because there is no
 * conducting path to ground. This causes the MNA matrix to be singular.
 *
 * Uses BFS from the ground node, propagating through both wire
 * connections (graph.nets) and component internals (if one pin of a
 * component is reachable, all its pins are reachable because current
 * can flow through the component).
 *
 * @param graph - Circuit connectivity graph
 * @param diagram - Wiring diagram
 * @returns Array of floating node errors
 */
export function detectFloatingNodes(
  graph: CircuitGraph,
  diagram: WiringDiagram
): CircuitError[] {
  if (!graph.groundPin) return []; // No ground = separate error

  // Build a quick lookup: componentId → component
  const componentById = new Map(
    diagram.components.map((c) => [c.id, c])
  );

  // Single-pass BFS that propagates through wires AND component internals
  const visited = new Set<string>();
  const queue: string[] = [graph.groundPin];
  visited.add(graph.groundPin);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // 1. Follow wire connections
    const neighbors = graph.nets.get(current);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    // 2. Follow internal component connections: if we reached one pin
    //    of a component, all other pins are also reachable
    const compId = current.split(':')[0];
    const comp = componentById.get(compId);
    if (comp?.pins) {
      for (const pin of comp.pins) {
        const pinKey = `${compId}:${pin}`;
        if (!visited.has(pinKey)) {
          visited.add(pinKey);
          queue.push(pinKey);
        }
      }
    }
  }

  // Find components with NO reachable pins
  const floatingComponents: string[] = [];

  for (const component of diagram.components) {
    if (!component.pins || component.pins.length === 0) continue;

    const anyReachable = component.pins.some((pin) =>
      visited.has(`${component.id}:${pin}`)
    );
    if (!anyReachable) {
      floatingComponents.push(component.id);
    }
  }

  if (floatingComponents.length > 0) {
    return [
      {
        type: 'floating_node',
        message: `${floatingComponents.length} component(s) are not connected to ground. They have indeterminate voltages.`,
        severity: 'warning',
        affectedComponentIds: floatingComponents,
      },
    ];
  }

  return [];
}

/**
 * Detect overcurrent conditions after solving.
 *
 * Checks if any component's current exceeds its rated maximum.
 * Only reports for components that have a maxCurrent specification.
 *
 * @param solution - Solved MNA result
 * @param diagram - Wiring diagram
 * @returns Array of overcurrent errors
 */
export function detectOvercurrent(
  solution: MNASolution,
  diagram: WiringDiagram
): CircuitError[] {
  const errors: CircuitError[] = [];

  for (const component of diagram.components) {
    const model = identifyComponentModel(component);
    if (!model.maxCurrent) continue;

    const current = solution.branchCurrents.get(component.id);
    if (current === undefined) continue;

    if (Math.abs(current) > model.maxCurrent) {
      errors.push({
        type: 'overcurrent',
        message: `${component.name}: current ${(Math.abs(current) * 1000).toFixed(1)}mA exceeds maximum ${(model.maxCurrent * 1000).toFixed(1)}mA`,
        severity: 'warning',
        affectedComponentIds: [component.id],
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main Error Detection
// ---------------------------------------------------------------------------

/**
 * Run all circuit error detection checks.
 *
 * Should be called both before solving (structural errors) and after
 * solving (electrical errors like overcurrent).
 *
 * @param diagram - Wiring diagram
 * @param mna - Assembled MNA system
 * @param graph - Circuit connectivity graph
 * @param solution - Optional solved result (for post-solve checks)
 * @returns Array of all detected circuit errors
 */
export function detectCircuitErrors(
  diagram: WiringDiagram,
  mna: MNAMatrix,
  graph: CircuitGraph,
  solution?: MNASolution
): CircuitError[] {
  const errors: CircuitError[] = [];

  // Pre-solve structural checks
  const noGround = detectNoGround(graph);
  if (noGround) {
    errors.push(noGround);
  }

  const floating = detectFloatingNodes(graph, diagram);
  errors.push(...floating);

  const singular = detectSingularMatrix(mna);
  if (singular) {
    errors.push(singular);
  }

  // Post-solve electrical checks
  if (solution && solution.converged) {
    const overcurrent = detectOvercurrent(solution, diagram);
    errors.push(...overcurrent);
  }

  return errors;
}
