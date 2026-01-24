import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { useLayout } from '../../contexts/LayoutContext';

/**
 * SimControls component provides master switches for the electrical simulation.
 * It appears primarily when the workspace is in DEBUG mode.
 */
export const SimControls: React.FC = () => {
  const { isSimulating, setSimulating, result } = useSimulation();
  const { activeMode } = useLayout();

  // Show only in DEBUG mode for clarity
  if (activeMode !== 'debug') return null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-slate-950/90 border border-slate-800 cut-corner-sm shadow-2xl backdrop-blur-md pointer-events-auto panel-frame">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase">Core_Simulator</span>
          <span className={`text-[10px] font-mono ${isSimulating ? 'text-neon-green animate-pulse' : 'text-slate-600'}`}>
            {isSimulating ? 'ONLINE' : 'STANDBY'}
          </span>
        </div>
        
        <button
          onClick={() => setSimulating(!isSimulating)}
          className={`
            w-10 h-5 rounded-none relative transition-colors duration-200 border
            ${isSimulating ? 'bg-neon-green/20 border-neon-green' : 'bg-slate-900 border-slate-700'}
          `}
          title={isSimulating ? 'Cut Virtual Power' : 'Energize Circuit'}
        >
          <div className={`
            absolute top-0.5 w-3.5 h-[14px] transition-all duration-200
            ${isSimulating ? 'left-[22px] bg-neon-green shadow-[0_0_8px_#00ff9d]' : 'left-0.5 bg-slate-600'}
          `} />
        </button>
      </div>

      <div className="h-8 w-px bg-white/5" />

      {isSimulating && (
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase">Logic_State</span>
            <span className={`text-[10px] font-bold ${result?.isShortCircuit ? 'text-red-500' : 'text-neon-green'}`}>
              {result?.isShortCircuit ? '!! FAULT !!' : 'NOMINAL'}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase">Sim_Load</span>
            <span className="text-[10px] font-mono text-neon-cyan">
              {Object.keys(result?.pinStates || {}).length} NODES
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-50">
            <div className="w-1 h-1 bg-neon-cyan animate-ping" />
            <span className="text-[8px] text-neon-cyan font-mono">CALC_ACTIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};
