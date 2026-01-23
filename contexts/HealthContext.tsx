import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { healthMonitor, HealthMetrics } from '../services/healthMonitor';
import { useLayout } from './LayoutContext';

interface HealthContextType {
  metrics: HealthMetrics;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<HealthMetrics>(healthMonitor.getMetrics());
  const { setLowPerformanceMode } = useLayout();

  useEffect(() => {
    let lowFpsCount = 0;
    const interval = setInterval(() => {
      const currentMetrics = healthMonitor.getMetrics();
      setMetrics(currentMetrics);

      // Auto-degradation logic: 5 consecutive seconds of low FPS
      if (currentMetrics.fps < 25) {
        lowFpsCount++;
        if (lowFpsCount >= 5) {
          setLowPerformanceMode(true);
        }
      } else {
        lowFpsCount = 0;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [setLowPerformanceMode]);

  return (
    <HealthContext.Provider value={{ metrics }}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
