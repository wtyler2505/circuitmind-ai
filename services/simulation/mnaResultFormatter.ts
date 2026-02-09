/**
 * MNA Result Formatter
 *
 * Converts raw MNA solver output into the MNASimulationResult format,
 * mapping node voltages back to per-pin SimNodeState objects and
 * calculating power dissipation for every component.
 */

import type { WiringDiagram } from '../../types';
import type { SimNodeState } from '../simulationEngine';
import type {
  MNAMatrix,
  MNASolution,
  MNASimulationResult,
  MNADebugInfo,
  CircuitError,
} from './types';

// ---------------------------------------------------------------------------
// Logic State Derivation
// ---------------------------------------------------------------------------

/** Voltage threshold above which a pin is considered logic HIGH (3.3V/5V). */
const HIGH_THRESHOLD = 2.5;

/** Voltage threshold below which a pin is considered logic LOW (GND). */
const LOW_THRESHOLD = 0.8;

/**
 * Derive digital logic state from an analog voltage.
 *
 * - voltage > 2.5V  → HIGH
 * - voltage < 0.8V  → LOW
 * - else             → FLOATING (indeterminate region)
 */
function deriveLogicState(voltage: number): 'HIGH' | 'LOW' | 'FLOATING' {
  if (voltage > HIGH_THRESHOLD) return 'HIGH';
  if (voltage < LOW_THRESHOLD) return 'LOW';
  return 'FLOATING';
}

// ---------------------------------------------------------------------------
// Power Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate power dissipation for all components.
 *
 * Power is calculated as P = V_across * I_through for each component.
 * - Positive power → component absorbs energy (resistors, LEDs)
 * - Negative power → component supplies energy (voltage sources)
 *
 * @param nodeVoltages - Node number → voltage
 * @param branchCurrents - Component ID → current
 * @param mna - MNA system (for node mapping)
 * @param diagram - Wiring diagram
 * @returns Map of component ID → power (watts)
 */
export function calculatePowerDissipation(
  nodeVoltages: Map<number, number>,
  branchCurrents: Map<string, number>,
  mna: MNAMatrix,
  diagram: WiringDiagram
): Record<string, number> {
  const power: Record<string, number> = {};

  for (const component of diagram.components) {
    const current = branchCurrents.get(component.id) ?? 0;

    if (!component.pins || component.pins.length < 2) {
      power[component.id] = 0;
      continue;
    }

    const pinA = `${component.id}:${component.pins[0]}`;
    const pinB = `${component.id}:${component.pins[1]}`;
    const nodeA = mna.nodeMap.get(pinA) ?? 0;
    const nodeB = mna.nodeMap.get(pinB) ?? 0;
    const vA = nodeVoltages.get(nodeA) ?? 0;
    const vB = nodeVoltages.get(nodeB) ?? 0;
    const vAcross = vA - vB;

    // P = V * I (sign follows passive sign convention)
    power[component.id] = vAcross * current;
  }

  return power;
}

// ---------------------------------------------------------------------------
// Debug Info
// ---------------------------------------------------------------------------

/**
 * Build debug payload for inspection of MNA internals.
 *
 * Converts mathjs matrices into plain 2D/1D arrays and records
 * the node/vsource maps for troubleshooting.
 *
 * @param mna - Assembled MNA system
 * @param solutionVector - Raw solution from lusolve (N+M × 1)
 * @returns Debug info object
 */
export function buildDebugInfo(
  mna: MNAMatrix,
  solutionVector?: number[][]
): MNADebugInfo {
  const matrixA = mna.A.valueOf() as number[][];
  const vectorB = (mna.b.valueOf() as number[][]).map((row) => row[0]);
  const vectorX = solutionVector
    ? solutionVector.map((row) => row[0])
    : [];

  // Convert Maps to plain objects
  const nodeMap: Record<string, number> = {};
  for (const [key, value] of mna.nodeMap.entries()) {
    nodeMap[key] = value;
  }

  const vsourceMap: Record<string, number> = {};
  for (const [key, value] of mna.vsourceMap.entries()) {
    vsourceMap[key] = value;
  }

  return {
    matrixA,
    vectorX,
    vectorB,
    nodeMap,
    vsourceMap,
  };
}

// ---------------------------------------------------------------------------
// Pin State Mapping
// ---------------------------------------------------------------------------

/**
 * Map MNA node voltages and branch currents to per-pin SimNodeState.
 *
 * Every pin gets a SimNodeState with:
 * - voltage: from its assigned MNA node
 * - current: from the component's branch current (shared across pins)
 * - logicState: derived from voltage thresholds
 *
 * @param nodeVoltages - Node → voltage
 * @param branchCurrents - Component → current
 * @param mna - MNA system (for node map)
 * @param diagram - Wiring diagram
 * @returns Record of "componentId:pin" → SimNodeState
 */
function buildPinStates(
  nodeVoltages: Map<number, number>,
  branchCurrents: Map<string, number>,
  mna: MNAMatrix,
  diagram: WiringDiagram
): Record<string, SimNodeState> {
  const pinStates: Record<string, SimNodeState> = {};

  for (const component of diagram.components) {
    if (!component.pins) continue;

    const branchCurrent = branchCurrents.get(component.id) ?? 0;

    for (const pin of component.pins) {
      const pinKey = `${component.id}:${pin}`;
      const nodeNum = mna.nodeMap.get(pinKey) ?? 0;
      const voltage = nodeVoltages.get(nodeNum) ?? 0;

      pinStates[pinKey] = {
        voltage,
        current: branchCurrent,
        logicState: deriveLogicState(voltage),
      };
    }
  }

  return pinStates;
}

// ---------------------------------------------------------------------------
// Main Formatter
// ---------------------------------------------------------------------------

/**
 * Format MNA solver results into the full MNASimulationResult.
 *
 * Combines:
 * - Base SimulationResult (pinStates, isShortCircuit, warnings)
 * - Node voltages and branch currents
 * - Power dissipation per component
 * - Circuit errors from error detector
 * - Optional debug payload
 *
 * @param solution - Raw MNA solver output
 * @param mna - Assembled MNA system
 * @param diagram - Original wiring diagram
 * @param errors - Detected circuit errors
 * @param options - Format options
 * @returns Complete MNASimulationResult
 */
export function formatMNAResults(
  solution: MNASolution,
  mna: MNAMatrix,
  diagram: WiringDiagram,
  errors: CircuitError[] = [],
  options: { debug?: boolean; solutionVector?: number[][] } = {}
): MNASimulationResult {
  const { nodeVoltages, branchCurrents } = solution;

  // Build per-pin states
  const pinStates = buildPinStates(nodeVoltages, branchCurrents, mna, diagram);

  // Calculate power dissipation
  const powerDissipation = calculatePowerDissipation(
    nodeVoltages,
    branchCurrents,
    mna,
    diagram
  );

  // Total power (sum of all positive dissipation = consumed, not supplied)
  let totalPower = 0;
  for (const p of Object.values(powerDissipation)) {
    if (p > 0) totalPower += p;
  }

  // Convert maps to records for the result interface
  const nodeVoltagesRecord: Record<number, number> = {};
  for (const [node, v] of nodeVoltages.entries()) {
    nodeVoltagesRecord[node] = v;
  }

  const branchCurrentsRecord: Record<string, number> = {};
  for (const [id, i] of branchCurrents.entries()) {
    branchCurrentsRecord[id] = i;
  }

  // Extract warnings from errors
  const warnings = errors
    .filter((e) => e.severity === 'warning')
    .map((e) => e.message);

  // Check for short circuit
  const isShortCircuit = errors.some((e) => e.type === 'singular_matrix');

  // Build debug info if requested
  const debug = options.debug
    ? buildDebugInfo(mna, options.solutionVector)
    : undefined;

  return {
    // Base SimulationResult fields
    pinStates,
    isShortCircuit,
    warnings,

    // MNA-specific fields
    nodeVoltages: nodeVoltagesRecord,
    branchCurrents: branchCurrentsRecord,
    powerDissipation,
    errors,
    usedMNA: true,
    totalPower,
    nodeCount: mna.nodeCount,
    debug,
  };
}
