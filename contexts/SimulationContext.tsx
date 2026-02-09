import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useDiagram } from './DiagramContext';
import { simulationEngine, SimulationResult } from '../services/simulationEngine';
import { useNotify } from './NotificationContext';
import { shouldUseWorker, solveInWorker, solveSynchronous } from '../services/simulation/simulationWorkerBridge';

interface SimulationContextType {
  result: SimulationResult | null;
  isSimulating: boolean;
  isSolving: boolean;
  setSimulating: (sim: boolean) => void;
  runTick: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

/**
 * Estimate the node count for a diagram without building the full graph.
 * Uses component count with 2+ pins as a proxy for node complexity.
 */
function estimateNodeCount(components: { pins?: string[] }[]): number {
  let pinCount = 0;
  for (const comp of components) {
    if (comp.pins && comp.pins.length >= 2) {
      pinCount += comp.pins.length;
    }
  }
  // Rough estimate: nodes ≈ pins / 2 (two pins per connection)
  return Math.ceil(pinCount / 2);
}

/**
 * SimulationProvider manages the lifecycle and state of the electrical simulation.
 * It periodically runs the solver and provides results to the UI.
 *
 * For circuits with >20 nodes, the MNA solve is offloaded to a Web Worker
 * to prevent UI blocking. Smaller circuits solve synchronously (faster).
 */
export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { diagram } = useDiagram();
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const { pushNotification } = useNotify();
  const solvingRef = useRef(false);

  const runTick = useCallback(() => {
    if (!diagram) {
      setResult(null);
      return;
    }

    // Prevent concurrent async solves
    if (solvingRef.current) return;

    const nodeCount = estimateNodeCount(diagram.components);

    if (shouldUseWorker(nodeCount)) {
      // Async path: offload to Web Worker
      solvingRef.current = true;
      setIsSolving(true);

      solveInWorker(diagram)
        .then((res) => {
          setResult(res);
          if (res.isShortCircuit) {
            pushNotification({
              id: 'simulation-short-circuit',
              severity: 'critical',
              title: 'SIMULATION_CRASH',
              message: 'Circuit logic failed. High risk of hardware damage detected.',
              duration: 10000,
            });
          }
        })
        .catch(() => {
          // Worker failed — fall back to synchronous solve
          try {
            const fallbackRes = solveSynchronous(diagram);
            setResult(fallbackRes);
          } catch {
            // Both paths failed — use basic logic propagation
            const basicRes = simulationEngine.solve(diagram);
            setResult(basicRes);
          }
        })
        .finally(() => {
          solvingRef.current = false;
          setIsSolving(false);
        });
    } else {
      // Sync path: solve on main thread (fast for small circuits)
      try {
        const res = solveSynchronous(diagram);
        setResult(res);

        if (res.isShortCircuit) {
          pushNotification({
            id: 'simulation-short-circuit',
            severity: 'critical',
            title: 'SIMULATION_CRASH',
            message: 'Circuit logic failed. High risk of hardware damage detected.',
            duration: 10000,
          });
        }
      } catch {
        // MNA failed — fall back to basic logic propagation
        const basicRes = simulationEngine.solve(diagram);
        setResult(basicRes);
      }
    }
  }, [diagram, pushNotification]);

  // Run simulation loop when active
  useEffect(() => {
    if (isSimulating) {
      // Immediate first tick
      runTick();

      const interval = setInterval(runTick, 500); // 2Hz for battery saving
      return () => clearInterval(interval);
    }
  }, [isSimulating, runTick]);

  // Auto-run tick once on diagram changes even if not continuously simulating
  useEffect(() => {
    runTick();
  }, [diagram, runTick]);

  return (
    <SimulationContext.Provider value={{
      result,
      isSimulating,
      isSolving,
      setSimulating: setIsSimulating,
      runTick
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

/**
 * Hook to access current simulation results and controls.
 */
export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
