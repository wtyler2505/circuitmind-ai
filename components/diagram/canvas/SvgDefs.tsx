import React from 'react';
import { SVG_GRADIENTS, SVG_FILTERS } from '../index';

interface SvgDefsProps {
  snapToGrid: boolean;
  uniqueColors: string[];
}

const SvgDefs = React.memo(({ snapToGrid, uniqueColors }: SvgDefsProps) => (
  <defs>
    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke={snapToGrid ? '#334155' : '#1e293b'} strokeWidth={snapToGrid ? 0.5 : 0.3} />
    </pattern>
    <pattern id="grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
      <path d="M 100 0 L 0 0 0 100" fill="none" stroke={snapToGrid ? '#475569' : 'transparent'} strokeWidth="1" />
    </pattern>
    {SVG_GRADIENTS.map((grad) =>
      grad.type === 'linear' ? (
        <linearGradient key={grad.id} id={grad.id} x1={grad.x1} y1={grad.y1} x2={grad.x2} y2={grad.y2}>
          {grad.stops.map((stop, i) => (
            <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />
          ))}
        </linearGradient>
      ) : (
        <radialGradient key={grad.id} id={grad.id}>
          {grad.stops.map((stop, i) => (
            <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />
          ))}
        </radialGradient>
      )
    )}
    {SVG_FILTERS.map((filter) => (
      <filter key={filter.id} id={filter.id} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx={filter.dx} dy={filter.dy} stdDeviation={filter.stdDeviation} floodOpacity={filter.floodOpacity} floodColor={filter.floodColor || '#000000'} />
      </filter>
    ))}
    {uniqueColors.map((color) => (
      <marker key={color} id={`arrow-${color.replace('#', '')}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill={color} />
      </marker>
    ))}
  </defs>
));

SvgDefs.displayName = 'SvgDefs';

export default SvgDefs;
