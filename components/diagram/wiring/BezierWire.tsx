
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
  
  // Multi-point path: Catmull-Rom spline converted to cubic Bezier curves.
  // Build the full ordered point array including start and end.
  const allPoints: Array<{ x: number; y: number; handleIn?: { dx: number; dy: number }; handleOut?: { dx: number; dy: number } }> = [
    start,
    ...points,
    end,
  ];

  let path = `M ${allPoints[0].x} ${allPoints[0].y}`;

  // For each segment P[i] -> P[i+1], we need the surrounding points P[i-1] and P[i+2]
  // to compute Catmull-Rom tangents. For edge cases, mirror the missing neighbor.
  for (let i = 0; i < allPoints.length - 1; i++) {
    const p0 = i > 0 ? allPoints[i - 1] : { x: 2 * allPoints[0].x - allPoints[1].x, y: 2 * allPoints[0].y - allPoints[1].y };
    const p1 = allPoints[i];
    const p2 = allPoints[i + 1];
    const p3 = i + 2 < allPoints.length ? allPoints[i + 2] : { x: 2 * p2.x - p1.x, y: 2 * p2.y - p1.y };

    // Catmull-Rom to cubic Bezier conversion:
    //   cp1 = P1 + (P2 - P0) / 6
    //   cp2 = P2 - (P3 - P1) / 6
    // This uses the standard tension factor of 6 (equivalent to alpha=0.5 centripetal).
    let cp1x = p1.x + (p2.x - p0.x) / 6;
    let cp1y = p1.y + (p2.y - p0.y) / 6;
    let cp2x = p2.x - (p3.x - p1.x) / 6;
    let cp2y = p2.y - (p3.y - p1.y) / 6;

    // If the source point has an explicit handleOut, override cp1.
    const srcPoint = allPoints[i] as { x: number; y: number; handleOut?: { dx: number; dy: number } };
    if (srcPoint.handleOut) {
      cp1x = p1.x + srcPoint.handleOut.dx;
      cp1y = p1.y + srcPoint.handleOut.dy;
    }

    // If the destination point has an explicit handleIn, override cp2.
    const dstPoint = allPoints[i + 1] as { x: number; y: number; handleIn?: { dx: number; dy: number } };
    if (dstPoint.handleIn) {
      cp2x = p2.x + dstPoint.handleIn.dx;
      cp2y = p2.y + dstPoint.handleIn.dy;
    }

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

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
