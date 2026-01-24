import React, { useMemo } from 'react';

interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
}

interface HeatmapProps {
  points: HeatmapPoint[];
  width?: number;
  height?: number;
  colorRange?: [string, string];
}

export const HeatmapWidget: React.FC<HeatmapProps> = ({
  points,
  width = 10,
  height = 10,
  colorRange = ['rgba(0, 243, 255, 0.1)', 'rgba(189, 0, 255, 0.8)']
}) => {
  // Generate a grid of points
  const grid = useMemo(() => {
    const data = Array(height).fill(0).map(() => Array(width).fill(0));
    points.forEach(p => {
      if (p.x >= 0 && p.x < width && p.y >= 0 && p.y < height) {
        data[p.y][p.x] = p.value;
      }
    });
    return data;
  }, [points, width, height]);

  const getColor = (value: number) => {
    const ratio = Math.min(1, Math.max(0, value));
    // Simple interpolation for demo (in production would use a proper color scale)
    return ratio > 0.5 ? colorRange[1] : colorRange[0];
  };

  return (
    <div className="w-full h-full p-2 flex flex-col space-y-2 bg-black/40">
      <div className="flex justify-between items-center px-1">
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sensor Distribution</span>
        <span className="text-[8px] text-neon-cyan font-mono">LIVE_SCAN</span>
      </div>
      
      <div className="flex-1 grid gap-px" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
        {grid.flat().map((val, idx) => (
          <div 
            key={idx}
            className="aspect-square transition-colors duration-300"
            style={{ 
              backgroundColor: getColor(val),
              boxShadow: val > 0.7 ? `inset 0 0 10px ${colorRange[1]}` : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};
