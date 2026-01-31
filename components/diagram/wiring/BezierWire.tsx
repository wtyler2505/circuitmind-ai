
import React from 'react';
import { WireConnection, WirePoint } from '../../../types';

interface BezierWireProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  points?: WirePoint[];
  color?: string;
  selected?: boolean;
}

export const calculateBezierPath = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  points?: WirePoint[]
): string => {
  if (!points || points.length === 0) {
    // Standard Cubic Bezier between two points
    // Calculate control points based on distance
    const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const controlDist = Math.min(dist * 0.5, 150); // Cap at 150px slack
    
    // Simple heuristic: Horizontal wires curve vertically, Vertical curve horizontally?
    // Fritzing style: usually curvy.
    // Let's do a standard "S" curve logic assuming left-to-right flow mostly, 
    // but adapting to angle.
    
    // Control Point 1
    const cp1 = { x: start.x, y: start.y + controlDist };
    // Control Point 2
    const cp2 = { x: end.x, y: end.y + controlDist };
    
    // Fritzing wires often come "out" of the pin perpendicular to the board.
    // Assuming pins are vertical on breadboard:
    // Start is (x, y), we want to exit (x, y+20) then curve.
    
    return `M ${start.x} ${start.y} C ${start.x} ${start.y + 50}, ${end.x} ${end.y + 50}, ${end.x} ${end.y}`;
  }
  
  // Multi-point Bezier
  // M start -> C ... p1 -> C ... p2 -> ... end
  let path = `M ${start.x} ${start.y}`;
  
  // To keep it simple for MVP, just lines between points?
  // No, we want Curves.
  // We need to construct a spline.
  
  // TODO: Implement Catmull-Rom or similar for smooth path through arbitrary points.
  // For now, linear segments for debug.
  points.forEach(p => {
      path += ` L ${p.x} ${p.y}`;
  });
  path += ` L ${end.x} ${end.y}`;
  
  return path;
};

export const BezierWire: React.FC<BezierWireProps> = ({ start, end, points, color = '#00f3ff', selected }) => {
  const pathData = calculateBezierPath(start, end, points);

  return (
    <g className="wire-group">
      {/* Shadow/Highlight for selection */}
      <path
        d={pathData}
        fill="none"
        stroke={selected ? 'rgba(255, 255, 255, 0.5)' : 'transparent'}
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Core Wire */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
      />
      {/* Wire Insulation Shine (Fritzing style) */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
        strokeLinecap="round"
        transform="translate(0, -0.5)"
      />
    </g>
  );
};
