import React, { useRef, useEffect } from 'react';
import { useDataStream } from '../../services/viz/vizEngine';

interface OscilloscopeProps {
  streamId: string;
  color?: string;
  min?: number;
  max?: number;
}

export const OscilloscopeWidget: React.FC<OscilloscopeProps> = ({ 
  streamId, 
  color = '#00f3ff',
  min = 0,
  max = 1024
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data = useDataStream(streamId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    if (data.length < 2) return;

    // Waveform
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;

    ctx.beginPath();
    data.forEach((p, idx) => {
      const x = (idx / data.length) * width;
      const y = height - ((p.v - min) / (max - min)) * height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }, [data, color, min, max]);

  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `scope-capture-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="w-full h-full bg-black relative group overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={200} 
        className="w-full h-full block"
      />
      {/* Snapshot Button */}
      <button 
        onClick={handleSnapshot}
        className="absolute top-2 right-2 bg-slate-800/80 p-1 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Capture Snapshot"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20" />
    </div>
  );
};
