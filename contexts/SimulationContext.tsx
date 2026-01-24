import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useDiagram } from './DiagramContext';
import { simulationEngine, SimulationResult } from '../services/simulationEngine';
import { useNotify } from './NotificationContext';

interface SimulationContextType {
  result: SimulationResult | null;
  isSimulating: boolean;
  setSimulating: (sim: boolean) => void;
  runTick: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

/**
 * SimulationProvider manages the lifecycle and state of the electrical simulation.
 * It periodically runs the solver and provides results to the UI.
 */
export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { diagram } = useDiagram();
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const { pushNotification } = useNotify();

  const runTick = useCallback(() => {
    if (!diagram) {
      setResult(null);
      return;
    }
    const res = simulationEngine.solve(diagram);
    setResult(res);

    if (res.status === 'failed') {
      pushNotification({
        severity: 'critical',
        title: 'SIMULATION_CRASH',
        message: 'Circuit logic failed. High risk of hardware damage detected.',
        duration: 10000
      });
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