import React from 'react';
import { useDataStream } from '../../services/viz/vizEngine';

interface LogicAnalyzerProps {
  streamId: string;
  label?: string;
  color?: string;
}

export const LogicAnalyzerWidget: React.FC<LogicAnalyzerProps> = ({ 
  streamId, 
  label = 'D0',
  color = '#00ff9d'
}) => {
  const data = useDataStream(streamId);

  return (
    <div className="w-full h-full bg-black/40 flex flex-col p-2 space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={`text-[10px] font-mono font-bold ${data.length > 0 && data[data.length-1].v > 0 ? 'text-neon-green' : 'text-slate-700'}`}>
          {data.length > 0 && data[data.length-1].v > 0 ? 'HIGH' : 'LOW'}
        </span>
      </div>
      
      <div className="flex-1 relative border-y border-white/5 overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path
            d={data.map((p, idx) => {
              const x = (idx / data.length) * 100;
              const y = p.v > 0 ? 20 : 80;
              // Add vertical lines for transitions
              if (idx > 0) {
                const prevY = data[idx-1].v > 0 ? 20 : 80;
                if (prevY !== y) return `V ${y} L ${x} ${y}`;
              }
              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="shadow-[0_0_5px_currentColor]"
          />
        </svg>
      </div>
    </div>
  );
};
