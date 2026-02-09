/**
 * Tests for the simulation Web Worker bridge.
 *
 * Since jsdom doesn't support real Web Workers, we mock the Worker
 * constructor and test the bridge's timeout, error handling, abort,
 * and fallback logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ElectronicComponent, WiringDiagram } from '../../types';
import type { MNASimulationResult } from '../simulation/types';
import type { WorkerResponse } from '../simulation/workerTypes';

// ---------------------------------------------------------------------------
// Mock Worker — stored globally so tests can access the instance
// ---------------------------------------------------------------------------

let lastWorkerInstance: {
  onmessage: ((e: MessageEvent) => void) | null;
  onerror: ((e: ErrorEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
} | null = null;

// The ?worker import must return a constructor (used with `new`)
vi.mock('../simulation/simulationWorker.worker?worker', () => {
  return {
    default: class MockSimulationWorker {
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: ((e: ErrorEvent) => void) | null = null;
      postMessage = vi.fn();
      terminate = vi.fn();
      addEventListener = vi.fn();
      removeEventListener = vi.fn();

      constructor() {
        lastWorkerInstance = this;
      }
    },
  };
});

// Mock simulationEngine for solveSynchronous fallback tests
vi.mock('../simulationEngine', () => ({
  simulationEngine: {
    solve: vi.fn(),
    solveMNA: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeComponent(
  id: string,
  name: string,
  type: ElectronicComponent['type'] = 'other'
): ElectronicComponent {
  return {
    id,
    name,
    type,
    description: '',
    pins: ['1', '2'],
  };
}

function makeDiagram(componentCount = 2): WiringDiagram {
  const components: ElectronicComponent[] = [];
  for (let i = 0; i < componentCount; i++) {
    components.push(makeComponent(`c${i}`, `Component ${i}`));
  }
  return {
    title: 'Test Circuit',
    explanation: 'Test diagram for worker tests',
    components,
    connections: [],
  };
}

function makeMNAResult(overrides: Partial<MNASimulationResult> = {}): MNASimulationResult {
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
    nodeCount: 2,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('shouldUseWorker', () => {
  let shouldUseWorker: typeof import('../simulation/simulationWorkerBridge').shouldUseWorker;

  beforeEach(async () => {
    const mod = await import('../simulation/simulationWorkerBridge');
    shouldUseWorker = mod.shouldUseWorker;
  });

  it('returns false for small circuits (nodeCount <= 20)', () => {
    expect(shouldUseWorker(0)).toBe(false);
    expect(shouldUseWorker(5)).toBe(false);
    expect(shouldUseWorker(20)).toBe(false);
  });

  it('returns true for large circuits (nodeCount > 20)', () => {
    expect(shouldUseWorker(21)).toBe(true);
    expect(shouldUseWorker(50)).toBe(true);
    expect(shouldUseWorker(100)).toBe(true);
  });
});

describe('solveSynchronous', () => {
  let solveSynchronous: typeof import('../simulation/simulationWorkerBridge').solveSynchronous;
  let simulationEngine: { solveMNA: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const mod = await import('../simulation/simulationWorkerBridge');
    solveSynchronous = mod.solveSynchronous;
    const engineMod = await import('../simulationEngine');
    simulationEngine = engineMod.simulationEngine as unknown as typeof simulationEngine;
  });

  it('delegates to simulationEngine.solveMNA()', () => {
    const diagram = makeDiagram(2);
    const expectedResult = makeMNAResult();
    simulationEngine.solveMNA.mockReturnValue(expectedResult);

    const result = solveSynchronous(diagram);
    expect(simulationEngine.solveMNA).toHaveBeenCalledWith(diagram, undefined);
    expect(result).toBe(expectedResult);
  });
});

describe('solveInWorker', () => {
  let solveInWorker: typeof import('../simulation/simulationWorkerBridge').solveInWorker;

  beforeEach(async () => {
    vi.useFakeTimers();
    lastWorkerInstance = null;
    const mod = await import('../simulation/simulationWorkerBridge');
    solveInWorker = mod.solveInWorker;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves with result on successful worker response', async () => {
    const diagram = makeDiagram(2);
    const expectedResult = makeMNAResult({ nodeCount: 5 });

    const promise = solveInWorker(diagram);
    const worker = lastWorkerInstance!;

    // Verify postMessage was called with the solve request
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: 'solve',
      diagram,
      options: undefined,
    });

    // Simulate successful worker response
    const response: WorkerResponse = { type: 'result', result: expectedResult };
    worker.onmessage!({ data: response } as MessageEvent);

    const result = await promise;
    expect(result).toEqual(expectedResult);
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('rejects on worker error response', async () => {
    const diagram = makeDiagram(2);
    const promise = solveInWorker(diagram);
    const worker = lastWorkerInstance!;

    // Simulate error response
    const response: WorkerResponse = { type: 'error', error: 'Matrix is singular' };
    worker.onmessage!({ data: response } as MessageEvent);

    await expect(promise).rejects.toThrow('Matrix is singular');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('rejects on timeout and terminates worker', async () => {
    const diagram = makeDiagram(2);
    const promise = solveInWorker(diagram, undefined, { timeout: 1000 });

    const worker = lastWorkerInstance!;

    // Advance time past timeout
    vi.advanceTimersByTime(1001);

    await expect(promise).rejects.toThrow('Simulation worker timed out after 1000ms');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('rejects on worker onerror event', async () => {
    const diagram = makeDiagram(2);
    const promise = solveInWorker(diagram);
    const worker = lastWorkerInstance!;

    // Simulate onerror
    worker.onerror!({ message: 'Script load failed' } as ErrorEvent);

    await expect(promise).rejects.toThrow('Simulation worker error: Script load failed');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('rejects immediately if AbortSignal is already aborted', async () => {
    const diagram = makeDiagram(2);
    const controller = new AbortController();
    controller.abort();

    await expect(
      solveInWorker(diagram, undefined, { signal: controller.signal })
    ).rejects.toThrow('Simulation aborted before starting');
  });

  it('rejects when AbortSignal fires during solve', async () => {
    const diagram = makeDiagram(2);
    const controller = new AbortController();
    const promise = solveInWorker(diagram, undefined, { signal: controller.signal });

    const worker = lastWorkerInstance!;

    // The bridge uses signal.addEventListener('abort', ...) — trigger abort
    controller.abort();

    // The mock addEventListener won't fire the actual listener. We need to
    // simulate the abort by calling the handler stored by addEventListener.
    const abortCall = worker.addEventListener.mock.calls.find(
      (c: unknown[]) => c[0] === 'abort'
    );
    if (abortCall) {
      abortCall[1](); // Call the abort handler
    }

    await expect(promise).rejects.toThrow('Simulation aborted');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('cleans up event listeners on worker after resolve', async () => {
    const diagram = makeDiagram(2);
    const promise = solveInWorker(diagram);
    const worker = lastWorkerInstance!;

    // Simulate successful response
    const response: WorkerResponse = { type: 'result', result: makeMNAResult() };
    worker.onmessage!({ data: response } as MessageEvent);

    await promise;

    // After cleanup, handlers should be nulled
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
  });

  it('ignores late messages after timeout', async () => {
    const diagram = makeDiagram(2);
    const promise = solveInWorker(diagram, undefined, { timeout: 100 });

    const worker = lastWorkerInstance!;

    // Timeout fires
    vi.advanceTimersByTime(101);
    await expect(promise).rejects.toThrow('timed out');

    // Late message should be a no-op (onmessage was cleaned up)
    expect(worker.onmessage).toBeNull();
  });

  it('passes solver options to worker', async () => {
    const diagram = makeDiagram(2);
    const options = { debug: true, tolerance: 1e-10 };

    const promise = solveInWorker(diagram, options);
    const worker = lastWorkerInstance!;

    expect(worker.postMessage).toHaveBeenCalledWith({
      type: 'solve',
      diagram,
      options,
    });

    // Clean up
    const response: WorkerResponse = { type: 'result', result: makeMNAResult() };
    worker.onmessage!({ data: response } as MessageEvent);
    await promise;
  });
});
