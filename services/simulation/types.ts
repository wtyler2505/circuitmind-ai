/**
 * MNA (Modified Nodal Analysis) Simulation Types
 *
 * These types support the physics-based circuit simulation engine
 * that replaces the basic logic-propagation solver with real
 * voltage/current/power calculations using the MNA algorithm.
 */

import type { Matrix } from 'mathjs';
import type { SimulationResult } from '../simulationEngine';

// ---------------------------------------------------------------------------
// Electrical Properties (optional enrichment on ElectronicComponent)
// ---------------------------------------------------------------------------

/** Electrical characteristics that can be attached to a component. */
export interface ElectricalProperties {
  resistance?: number; // Ohms
  forwardVoltage?: number; // Volts (LEDs, diodes)
  maxCurrent?: number; // Amps
  outputVoltage?: number; // Volts (voltage sources, regulators)
  inputImpedance?: number; // Ohms (MCU inputs)
}

// ---------------------------------------------------------------------------
// Circuit Graph
// ---------------------------------------------------------------------------

/** Result of building the circuit connectivity graph. */
export interface CircuitGraph {
  /** Map from pin key ("componentId:pinName") to the set of directly connected pin keys. */
  nets: Map<string, Set<string>>;
  /** The pin key that represents circuit ground, or null if none found. */
  groundPin: string | null;
}

// ---------------------------------------------------------------------------
// MNA Matrix System
// ---------------------------------------------------------------------------

/** The assembled MNA linear system ready to be solved. */
export interface MNAMatrix {
  /** System matrix (N+M) × (N+M) where N = nodes, M = voltage sources. */
  A: Matrix;
  /** Right-hand side vector (N+M) × 1. */
  b: Matrix;
  /** Maps pin key ("componentId:pinName") → node number (0 = ground). */
  nodeMap: Map<string, number>;
  /** Maps voltage source component ID → its auxiliary equation index in the matrix. */
  vsourceMap: Map<string, number>;
  /** Total number of non-ground nodes (N). */
  nodeCount: number;
  /** Total number of voltage sources (M). */
  vsourceCount: number;
}

// ---------------------------------------------------------------------------
// MNA Solution
// ---------------------------------------------------------------------------

/** Raw solution from the MNA linear solver. */
export interface MNASolution {
  /** Node number → voltage (volts). Ground (node 0) is always 0V. */
  nodeVoltages: Map<number, number>;
  /** Component ID → current through it (amps). */
  branchCurrents: Map<string, number>;
  /** Whether the linear solve succeeded. */
  converged: boolean;
  /** Error message if solve failed. */
  error?: string;
}

// ---------------------------------------------------------------------------
// Circuit Errors
// ---------------------------------------------------------------------------

/** Severity levels for circuit analysis errors. */
export type CircuitErrorSeverity = 'error' | 'warning' | 'info';

/** A detected circuit error or warning. */
export interface CircuitError {
  /** Error type identifier. */
  type:
    | 'singular_matrix'
    | 'floating_node'
    | 'voltage_loop'
    | 'current_cutset'
    | 'no_ground'
    | 'overcurrent'
    | 'solve_failed';
  /** Human-readable description of the problem. */
  message: string;
  /** Severity of this error. */
  severity: CircuitErrorSeverity;
  /** IDs of affected components (for highlighting in the UI). */
  affectedComponentIds: string[];
  /** Affected pin keys ("componentId:pinName") if applicable. */
  affectedPins?: string[];
}

// ---------------------------------------------------------------------------
// Debug Info
// ---------------------------------------------------------------------------

/** Optional debug payload included when debug mode is enabled. */
export interface MNADebugInfo {
  /** The A matrix as a 2D number array. */
  matrixA: number[][];
  /** The solution vector x as a flat array. */
  vectorX: number[];
  /** The RHS vector b as a flat array. */
  vectorB: number[];
  /** Node map snapshot for inspection. */
  nodeMap: Record<string, number>;
  /** Voltage source map snapshot. */
  vsourceMap: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Extended Simulation Result
// ---------------------------------------------------------------------------

/** Full MNA simulation result, extending the base SimulationResult. */
export interface MNASimulationResult extends SimulationResult {
  /** Node number → voltage (volts). */
  nodeVoltages: Record<number, number>;
  /** Component ID → current (amps). */
  branchCurrents: Record<string, number>;
  /** Component ID → power dissipation (watts). */
  powerDissipation: Record<string, number>;
  /** Circuit errors detected during analysis. */
  errors: CircuitError[];
  /** Whether the MNA solver was used (vs. fallback logic propagation). */
  usedMNA: boolean;
  /** Total power consumed by the circuit (watts). */
  totalPower: number;
  /** Number of circuit nodes (excluding ground). */
  nodeCount: number;
  /** Optional debug information. */
  debug?: MNADebugInfo;
}

// ---------------------------------------------------------------------------
// Component Model (for stamp application)
// ---------------------------------------------------------------------------

/** How a component behaves electrically in the MNA formulation. */
export type ComponentModelType =
  | 'resistor'
  | 'voltage_source'
  | 'current_source'
  | 'led'
  | 'capacitor_dc'
  | 'inductor_dc'
  | 'wire';

/** Electrical model for a single component. */
export interface ComponentModel {
  type: ComponentModelType;
  /** Resistance in Ohms (resistors, LED series resistance, wire ~0.001Ω). */
  resistance?: number;
  /** Voltage in Volts (voltage sources, LED forward voltage). */
  voltage?: number;
  /** Current in Amps (current sources). */
  current?: number;
  /** Maximum rated current in Amps (for overcurrent warnings). */
  maxCurrent?: number;
}

// ---------------------------------------------------------------------------
// MNA Solver Options
// ---------------------------------------------------------------------------

/** Options for the MNA solver. */
export interface MNASolveOptions {
  /** Include debug info (A matrix, x vector, b vector) in result. */
  debug?: boolean;
  /** Numerical tolerance for zero detection (default: 1e-12). */
  tolerance?: number;
  /** Singular matrix detection threshold (default: 1e-10). */
  singularThreshold?: number;
}
