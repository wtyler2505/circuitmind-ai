import React, { useMemo } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { useLayout } from '../../contexts/LayoutContext';
import type { MNASimulationResult } from '../../services/simulation/types';

/**
 * Format power for display with appropriate unit.
 */
function formatPower(watts: number): string {
  const abs = Math.abs(watts);
  if (abs < 1e-6) return '0 W';
  if (abs < 1e-3) return `${(watts * 1e6).toFixed(0)} \u00B5W`;
  if (abs < 1) return `${(watts * 1e3).toFixed(1)} mW`;
  return `${watts.toFixed(2)} W`;
}

/**
 * SimControls component provides master switches for the electrical simulation.
 * Shows real-time MNA solver stats (power, nodes, solver type) when simulation is active.
 * Appears primarily when the workspace is in DEBUG mode.
 */
export const SimControls: React.FC = () => {
  const { isSimulating, isSolving, setSimulating, result } = useSimulation();
  const { activeMode } = useLayout();

  // Extract MNA-specific data if available
  const mnaStats = useMemo(() => {
    if (!result) return null;
    const mna = result as MNASimulationResult;
    if (!mna.usedMNA) return null;
    return {
      totalPower: mna.totalPower ?? 0,
      nodeCount: mna.nodeCount ?? 0,
      errorCount: mna.errors?.length ?? 0,
      warningCount: mna.warnings?.length ?? 0,
    };
  }, [result]);

  // Show only in DEBUG mode for clarity
  if (activeMode !== 'debug') return null;

  return (
    <div
      className="flex items-center gap-4 px-4 py-2 bg-slate-950/90 border border-slate-800 cut-corner-sm shadow-2xl backdrop-blur-md pointer-events-auto panel-frame"
      role="region"
      aria-label="Simulation controls"
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase">Core_Simulator</span>
          <span className={`text-[10px] font-mono ${isSimulating ? 'text-neon-green animate-pulse' : 'text-slate-600'}`}>
            {isSimulating ? 'ONLINE' : 'STANDBY'}
          </span>
        </div>

        <button
          onClick={() => setSimulating(!isSimulating)}
          aria-pressed={isSimulating}
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
            <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase">Solver</span>
            <span className="text-[10px] font-mono text-neon-cyan">
              {mnaStats ? 'MNA' : 'LOGIC'}
            </span>
          </div>

          {mnaStats && (
            <>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase">Nodes</span>
                <span className="text-[10px] font-mono text-neon-cyan">
                  {mnaStats.nodeCount}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase">Total_Power</span>
                <span className={`text-[10px] font-mono ${mnaStats.totalPower > 1 ? 'text-amber-400' : 'text-neon-green'}`}>
                  {formatPower(mnaStats.totalPower)}
                </span>
              </div>

              {mnaStats.errorCount > 0 && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold tracking-[0.2em] text-red-500 uppercase">Errors</span>
                  <span className="text-[10px] font-mono text-red-400 font-bold">
                    {mnaStats.errorCount}
                  </span>
                </div>
              )}

              {mnaStats.warningCount > 0 && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold tracking-[0.2em] text-amber-500 uppercase">Warnings</span>
                  <span className="text-[10px] font-mono text-amber-400">
                    {mnaStats.warningCount}
                  </span>
                </div>
              )}
            </>
          )}

          {!mnaStats && (
            <div className="flex flex-col">
              <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase">Sim_Load</span>
              <span className="text-[10px] font-mono text-neon-cyan">
                {Object.keys(result?.pinStates || {}).length} PINS
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 opacity-50">
            {isSolving ? (
              <>
                <div className="w-1.5 h-1.5 bg-amber-400 animate-pulse rounded-full" />
                <span className="text-[8px] text-amber-400 font-mono">WORKER</span>
              </>
            ) : (
              <>
                <div className="w-1 h-1 bg-neon-cyan animate-ping" />
                <span className="text-[8px] text-neon-cyan font-mono">CALC_ACTIVE</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
