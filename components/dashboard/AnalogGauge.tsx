import React from 'react';

interface AnalogGaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  color?: string;
}

export const AnalogGauge: React.FC<AnalogGaugeProps> = ({
  value,
  min = 0,
  max = 100,
  label = 'POWER',
  unit = '%',
  color = '#00f3ff'
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (value - min) / (max - min);
  const offset = circumference * (1 - progress);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 relative">
      <div className="relative w-24 h-24">
        {/* Track */}
        <svg className="w-full h-full -rotate-90">
          <circle 
            cx="48" cy="48" r={radius} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="6" 
          />
          {/* Progress */}
          <circle 
            cx="48" cy="48" r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth="6" 
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 shadow-[0_0_10px_currentColor]"
          />
        </svg>
        {/* Value Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-mono font-bold text-white">{Math.round(value)}</span>
          <span className="text-[7px] text-slate-500 font-bold tracking-widest">{unit}</span>
        </div>
      </div>
      <span className="mt-2 text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
};
