/**
 * MNA Simulation Web Worker
 *
 * Runs the full MNA pipeline off the main thread to prevent UI blocking
 * for circuits with >20 nodes. Receives a WiringDiagram, runs graph
 * building → matrix assembly → solve → error detection → formatting,
 * and posts back the MNASimulationResult.
 *
 * This worker is disposable: created for one solve, then terminated.
 */

import type { WiringDiagram } from '../../types';
import type { MNASolveOptions, MNASimulationResult, CircuitError } from './types';
import type { WorkerRequest, WorkerResponse } from './workerTypes';
import { buildCircuitGraph } from './mnaGraphBuilder';
import { assembleMNA } from './mnaMatrixAssembler';
import { solveMNASystem } from './mnaSolver';
import { detectCircuitErrors } from './mnaErrorDetector';
import { formatMNAResults } from './mnaResultFormatter';

/**
 * Run the MNA simulation pipeline.
 * Mirrors SimulationEngine.solveMNA() but runs inside the worker.
 */
function solveMNA(
  diagram: WiringDiagram,
  options: MNASolveOptions = {}
): MNASimulationResult {
  // Edge case: empty diagram
  if (diagram.components.length === 0) {
    return {
      pinStates: {},
      isShortCircuit: false,
      warnings: [],
      nodeVoltages: { 0: 0 },
      branchCurrents: {},
      powerDissipation: {},
      errors: [],
      usedMNA: true,
      totalPower: 0,
      nodeCount: 0,
    };
  }

  // 1. Build circuit graph (union-find for connectivity)
  const graph = buildCircuitGraph(diagram);

  // 2. Assemble MNA matrices (stamps components into A·x = b)
  const mna = assembleMNA(diagram);

  // 3. Pre-solve error detection (structural issues)
  const preSolveErrors = detectCircuitErrors(diagram, mna, graph);
  const hasHardErrors = preSolveErrors.some((e) => e.severity === 'error');

  if (hasHardErrors) {
    return createErrorResult(diagram, mna.nodeCount, preSolveErrors);
  }

  // 4. Solve the system
  const solution = solveMNASystem(mna, diagram, options);

  if (!solution.converged) {
    const solveError: CircuitError = {
      type: 'solve_failed',
      message: solution.error ?? 'MNA solver did not converge',
      severity: 'error',
      affectedComponentIds: [],
    };
    return createErrorResult(diagram, mna.nodeCount, [
      ...preSolveErrors,
      solveError,
    ]);
  }

  // 5. Post-solve error detection (overcurrent, etc.)
  const allErrors = detectCircuitErrors(diagram, mna, graph, solution);

  // 6. Format results
  return formatMNAResults(solution, mna, diagram, allErrors, {
    debug: options.debug,
  });
}

/**
 * Create an error MNA result with FLOATING pin states.
 */
function createErrorResult(
  diagram: WiringDiagram,
  nodeCount: number,
  errors: CircuitError[]
): MNASimulationResult {
  const pinStates: Record<string, { voltage: number; current: number; logicState: 'HIGH' | 'LOW' | 'FLOATING' | 'ERROR' }> = {};
  diagram.components.forEach((comp) => {
    comp.pins?.forEach((pin) => {
      pinStates[`${comp.id}:${pin}`] = {
        voltage: 0,
        current: 0,
        logicState: 'FLOATING',
      };
    });
  });

  return {
    pinStates,
    isShortCircuit: errors.some((e) => e.type === 'singular_matrix'),
    warnings: errors.filter((e) => e.severity === 'warning').map((e) => e.message),
    nodeVoltages: { 0: 0 },
    branchCurrents: {},
    powerDissipation: {},
    errors,
    usedMNA: true,
    totalPower: 0,
    nodeCount,
  };
}

// ---------------------------------------------------------------------------
// Worker Message Handler
// ---------------------------------------------------------------------------

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const request = e.data;

  if (request.type !== 'solve') {
    const response: WorkerResponse = {
      type: 'error',
      error: `Unknown request type: ${(request as { type: string }).type}`,
    };
    self.postMessage(response);
    return;
  }

  try {
    const result = solveMNA(request.diagram, request.options);
    const response: WorkerResponse = {
      type: 'result',
      result,
    };
    self.postMessage(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const response: WorkerResponse = {
      type: 'error',
      error: `Worker solve failed: ${message}`,
    };
    self.postMessage(response);
  }
};
