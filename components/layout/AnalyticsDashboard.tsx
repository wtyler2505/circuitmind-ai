import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useDiagram } from '../../contexts/DiagramContext';
import { projectAnalyzer, ProjectScorecard } from '../../services/analytics/projectAnalyzer';
import { engineeringMetricsService } from '../../services/aiMetricsService';

const COLORS = ['#00f3ff', '#bd00ff', '#00ff9d', '#ffaa00', '#ef4444'];

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
    <div className="flex flex-col h-full bg-[#020203] border-l border-slate-800/80">
      <div className="px-3 py-4 border-b border-white/5 bg-[#050608]">
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
          <div className="bg-slate-900/50 border border-white/5 p-3 cut-corner-sm space-y-1">
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Design Density</span>
            <div className="text-lg font-mono font-bold text-neon-cyan">{scorecard.connectionDensity}</div>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-3 cut-corner-sm space-y-1">
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">AI Trust Score</span>
            <div className="text-lg font-mono font-bold text-neon-purple">{scorecard.aiAcceptanceRate}%</div>
          </div>
        </div>

        {/* Project Profile Chart */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">Project Scorecard</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scorecardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" fontSize={8} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', fontSize: '10px' }}
                  itemStyle={{ color: '#00f3ff' }}
                />
                <Bar dataKey="value" fill="#00f3ff" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Performance */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">AI Link Latency (Last 10)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiLatencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" fontSize={8} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis fontSize={8} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="ms" stroke="#bd00ff" strokeWidth={2} dot={{ r: 3, fill: '#bd00ff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 cut-corner-md text-center">
          <span className="text-[9px] text-neon-cyan uppercase font-bold tracking-[0.2em]">Engineering XP</span>
          <div className="mt-2 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-neon-cyan shadow-[0_0_8px_#00f3ff]" style={{ width: '65%' }} />
          </div>
          <div className="mt-1 flex justify-between text-[8px] font-mono text-slate-500 uppercase">
            <span>Level 14</span>
            <span>NEXT: 2450 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
