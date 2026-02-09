/**
 * Web Worker Message Types for MNA Simulation
 *
 * Defines the messaging protocol between the main thread and the
 * disposable simulation worker. All types are JSON-serializable
 * (no Maps, no mathjs Matrix objects, no DOM refs).
 *
 * The worker receives a WiringDiagram and runs the full MNA pipeline,
 * returning an MNASimulationResult.
 */

import type { WiringDiagram } from '../../types';
import type { MNASolveOptions, MNASimulationResult } from './types';

// ---------------------------------------------------------------------------
// Worker Request (main thread → worker)
// ---------------------------------------------------------------------------

/** Request the worker to solve a circuit using MNA. */
export interface WorkerSolveRequest {
  type: 'solve';
  /** The wiring diagram to simulate (JSON-safe). */
  diagram: WiringDiagram;
  /** Solver options (tolerance, debug, etc.). */
  options?: MNASolveOptions;
}

/** All possible messages from main thread to worker. */
export type WorkerRequest = WorkerSolveRequest;

// ---------------------------------------------------------------------------
// Worker Response (worker → main thread)
// ---------------------------------------------------------------------------

/** Successful solve result. */
export interface WorkerResultResponse {
  type: 'result';
  /** The MNA simulation result (JSON-safe: Records, not Maps). */
  result: MNASimulationResult;
}

/** Error during solve. */
export interface WorkerErrorResponse {
  type: 'error';
  /** Human-readable error message. */
  error: string;
}

/** All possible messages from worker to main thread. */
export type WorkerResponse = WorkerResultResponse | WorkerErrorResponse;

// ---------------------------------------------------------------------------
// Worker Bridge Options
// ---------------------------------------------------------------------------

/** Options for the main-thread worker bridge. */
export interface WorkerBridgeOptions {
  /** Timeout in milliseconds before killing the worker (default: 5000). */
  timeout?: number;
  /** AbortSignal for cancelling an in-flight solve. */
  signal?: AbortSignal;
}
