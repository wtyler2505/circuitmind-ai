import React from 'react';
import { motion } from 'framer-motion';

interface RemoteCursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
}

export const RemoteCursor: React.FC<RemoteCursorProps> = ({ x, y, name, color }) => {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none" className="z-50">
      {/* The Cursor Pointer (Cyber style) */}
      <motion.path
        d="M 0 0 L 12 12 L 5 12 L 0 18 Z"
        fill={color}
        stroke="#fff"
        strokeWidth="1"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
      
      {/* Label Box */}
      <g transform="translate(12, 12)">
        <rect
          width={name.length * 6 + 10}
          height={14}
          fill={color}
          rx={2}
          opacity={0.9}
        />
        <text
          x={5}
          y={10}
          fill="#000"
          fontSize="8"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {name.toUpperCase()}
        </text>
      </g>

      {/* Hologram Pulse */}
      <circle r={2} fill={color}>
        <animate attributeName="r" from="2" to="10" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
};
