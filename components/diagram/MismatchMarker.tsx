import React from 'react';
import { motion } from 'framer-motion';

interface MismatchMarkerProps {
  x: number;
  y: number;
  label: string;
}

export const MismatchMarker: React.FC<MismatchMarkerProps> = ({ x, y, label }) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Outer Pulse */}
      <motion.circle
        r={12}
        fill="transparent"
        stroke="#ef4444"
        strokeWidth={2}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
      />
      
      {/* Inner Target */}
      <circle r={4} fill="#ef4444" className="shadow-[0_0_8px_#ef4444]" />
      
      {/* Tooltip */}
      <g transform="translate(10, -10)">
        <rect 
          width={label.length * 6 + 10} 
          height={16} 
          fill="rgba(239, 68, 68, 0.9)" 
          rx={2}
        />
        <text 
          x={5} 
          y={11} 
          fill="white" 
          fontSize="8" 
          fontWeight="bold" 
          fontFamily="monospace"
        >
          {label.toUpperCase()}
        </text>
      </g>
    </g>
  );
};
