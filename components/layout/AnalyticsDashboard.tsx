import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { useDiagram } from '../../contexts/DiagramContext';
import { projectAnalyzer } from '../../services/analytics/projectAnalyzer';
import { engineeringMetricsService } from '../../services/aiMetricsService';

/**
 * A robust wrapper that only renders its children when the parent container 
 * has a valid, non-zero size. This prevents Recharts "width(-1)" warnings 
 * during sidebar animations.
 */
const ChartContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[12rem] relative">
      {dimensions.width > 0 && dimensions.height > 0 ? (
        <div className="absolute inset-0">
          {children}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-slate-800 border-t-neon-cyan rounded-full animate-spin opacity-20" />
        </div>
      )}
    </div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const { diagram } = useDiagram();
  
  const scorecard = useMemo(() => projectAnalyzer.analyze(diagram), [diagram]);
  const aiMetrics = useMemo(() => engineeringMetricsService.getAiMetrics(), []);
  
  const aiLatencyData = useMemo(() => 
    aiMetrics.slice(-10).map((m, idx) => ({
      name: `R${idx + 1}`,
      ms: m.latencyMs
    })), 
  [aiMetrics]);

  const scorecardData = [
    { name: 'Components', value: scorecard.totalComponents },
    { name: 'Density', value: Math.round(scorecard.connectionDensity * 10) },
    { name: 'AI Rate (%)', value: scorecard.aiAcceptanceRate },
    { name: 'Velocity', value: Math.min(100, scorecard.engineeringVelocity) }
  ];

  return (
    <div className="flex flex-col h-full bg-cyber-dark panel-frame border-l border-white/5">
      <div className="px-3 py-4 border-b border-white/5 bg-cyber-black panel-header shrink-0">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.3em] panel-title">
          <span className="text-neon-cyan">ENGINEERING</span>_STATS
        </h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">
          Productivity & Project Analytics
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-8">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cyber-black/40 panel-surface border border-white/5 p-3 cut-corner-sm space-y-1">
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Design Density</span>
            <div className="text-lg font-mono font-bold text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.3)]">{scorecard.connectionDensity}</div>
          </div>
          <div className="bg-cyber-black/40 panel-surface border border-white/5 p-3 cut-corner-sm space-y-1">
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">AI Trust Score</span>
            <div className="text-lg font-mono font-bold text-neon-purple drop-shadow-[0_0_8px_rgba(189,0,255,0.3)]">{scorecard.aiAcceptanceRate}%</div>
          </div>
        </div>

        {/* Project Profile Chart */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">Project Scorecard</h3>
          <div className="h-48 w-full bg-cyber-black/20 panel-surface p-2 border border-white/5 rounded-sm overflow-hidden">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scorecardData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" fontSize={8} tick={{ fill: 'var(--color-slate-500)' }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={8} tick={{ fill: 'var(--color-slate-500)' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-cyber-black)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', color: '#fff', borderRadius: '0' }}
                    itemStyle={{ color: 'var(--color-neon-cyan)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="value" fill="var(--color-neon-cyan)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* AI Performance */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">AI Link Latency (Last 10)</h3>
          <div className="h-48 w-full bg-cyber-black/20 panel-surface p-2 border border-white/5 rounded-sm overflow-hidden">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aiLatencyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" fontSize={8} tick={{ fill: 'var(--color-slate-500)' }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={8} tick={{ fill: 'var(--color-slate-500)' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-cyber-black)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', color: '#fff', borderRadius: '0' }}
                  />
                  <Line type="monotone" dataKey="ms" stroke="var(--color-neon-purple)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-neon-purple)', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#fff', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        <div className="p-4 bg-cyber-black/40 panel-surface border border-white/5 cut-corner-md text-center">
          <span className="text-[9px] text-neon-cyan uppercase font-bold tracking-[0.2em] panel-title">Engineering XP</span>
          <div className="mt-2 h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-neon-cyan shadow-[0_0_8px_#00f3ff]" style={{ width: '65%' }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Level 14</span>
            <span className="text-neon-cyan">NEXT: 2450 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
