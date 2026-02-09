/**
 * Simulation Worker Bridge
 *
 * Manages the disposable Web Worker lifecycle from the main thread.
 * Creates a worker for each solve, sends the diagram, awaits the result,
 * then terminates the worker. Supports timeout, abort, and fallback
 * to synchronous solving for small circuits.
 *
 * Pattern matches threeCodeRunner.ts (disposable worker, timeout, cleanup).
 */

import SimulationWorker from './simulationWorker.worker?worker';
import type { WiringDiagram } from '../../types';
import type { MNASolveOptions, MNASimulationResult } from './types';
import type { WorkerRequest, WorkerResponse, WorkerBridgeOptions } from './workerTypes';
import { simulationEngine } from '../simulationEngine';

/** Default timeout for worker solves (ms). */
const DEFAULT_TIMEOUT = 5000;

/** Node count threshold above which the worker is used. */
const WORKER_THRESHOLD = 20;

// ---------------------------------------------------------------------------
// Decision Helper
// ---------------------------------------------------------------------------

/**
 * Determine whether the circuit is large enough to warrant Web Worker offloading.
 *
 * For small circuits (≤20 nodes), the overhead of creating/terminating a
 * worker exceeds the solve time, so synchronous is faster.
 *
 * @param nodeCount - Number of non-ground nodes in the circuit
 * @returns true if the worker should be used
 */
export function shouldUseWorker(nodeCount: number): boolean {
  return nodeCount > WORKER_THRESHOLD;
}

// ---------------------------------------------------------------------------
// Synchronous Fallback
// ---------------------------------------------------------------------------

/**
 * Solve the MNA system on the main thread (synchronous).
 *
 * Used as fallback when:
 * - Circuit is small (≤20 nodes)
 * - Worker creation fails
 * - Worker times out or errors
 *
 * @param diagram - Wiring diagram to simulate
 * @param options - Solver options
 * @returns MNA simulation result
 */
export function solveSynchronous(
  diagram: WiringDiagram,
  options?: MNASolveOptions
): MNASimulationResult {
  return simulationEngine.solveMNA(diagram, options);
}

// ---------------------------------------------------------------------------
// Worker Bridge
// ---------------------------------------------------------------------------

/**
 * Solve the MNA system in a disposable Web Worker.
 *
 * Lifecycle:
 * 1. Create worker
 * 2. Post solve request
 * 3. Await response (or timeout/abort)
 * 4. Terminate worker
 * 5. Return result or throw error
 *
 * @param diagram - Wiring diagram to simulate (must be JSON-serializable)
 * @param options - Solver options
 * @param bridgeOptions - Worker bridge options (timeout, abort signal)
 * @returns Promise resolving to MNA simulation result
 * @throws Error on timeout, abort, or worker failure
 */
export function solveInWorker(
  diagram: WiringDiagram,
  options?: MNASolveOptions,
  bridgeOptions: WorkerBridgeOptions = {}
): Promise<MNASimulationResult> {
  const { timeout = DEFAULT_TIMEOUT, signal } = bridgeOptions;

  // Check if already aborted
  if (signal?.aborted) {
    return Promise.reject(new Error('Simulation aborted before starting'));
  }

  return new Promise<MNASimulationResult>((resolve, reject) => {
    let worker: Worker;

    try {
      worker = new SimulationWorker();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      reject(new Error(`Failed to create simulation worker: ${message}`));
      return;
    }

    let settled = false;

    const cleanup = () => {
      if (!settled) {
        settled = true;
      }
      worker.onmessage = null;
      worker.onerror = null;
      worker.terminate();
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
    };

    // Timeout: kill worker if it takes too long
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new Error(`Simulation worker timed out after ${timeout}ms`));
      }
    }, timeout);

    // Abort signal: cancel in-flight solve
    const onAbort = () => {
      if (!settled) {
        clearTimeout(timer);
        cleanup();
        reject(new Error('Simulation aborted'));
      }
    };

    if (signal) {
      signal.addEventListener('abort', onAbort);
    }

    // Worker response
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (settled) return;
      clearTimeout(timer);

      const response = e.data;

      if (response.type === 'result') {
        settled = true;
        cleanup();
        resolve(response.result);
      } else {
        settled = true;
        cleanup();
        reject(new Error(response.error));
      }
    };

    // Worker error (e.g., script load failure)
    worker.onerror = (err: ErrorEvent) => {
      if (settled) return;
      clearTimeout(timer);
      settled = true;
      cleanup();
      reject(new Error(`Simulation worker error: ${err.message}`));
    };

    // Send solve request
    const request: WorkerRequest = {
      type: 'solve',
      diagram,
      options,
    };
    worker.postMessage(request);
  });
}
