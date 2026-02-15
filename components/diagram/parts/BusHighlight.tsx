import React, { memo } from 'react';

interface BusHighlightProps {
  /** Pin IDs belonging to the currently-hovered bus (null = nothing highlighted). */
  activeBus: string[] | null;
  /** Map from pin ID → SVG-local {x, y} coordinates. */
  pinPositions: Map<string, { x: number; y: number }>;
}

/**
 * BusHighlight — lightweight SVG overlay that shows which pins share an
 * internal bus when the user hovers a pin.
 *
 * Renders small glowing cyan dots at each bus-member position plus faint
 * connecting lines between consecutive members.  The whole group fades in
 * via CSS transition for a smooth feel.
 */
const BusHighlight = memo<BusHighlightProps>(function BusHighlight({
  activeBus,
  pinPositions,
}) {
  if (!activeBus || activeBus.length === 0) return null;

  // Resolve positions for every bus member that has coordinates.
  const resolved: { id: string; x: number; y: number }[] = [];
  for (const pinId of activeBus) {
    const pos = pinPositions.get(pinId);
    if (pos) resolved.push({ id: pinId, x: pos.x, y: pos.y });
  }

  if (resolved.length === 0) return null;

  return (
    <g
      pointerEvents="none"
      className="bus-highlight-group"
      style={{
        opacity: 1,
        transition: 'opacity 150ms ease-in',
      }}
    >
      {/* Connecting lines between consecutive bus members */}
      {resolved.length > 1 &&
        resolved.map((pt, i) => {
          if (i === 0) return null;
          const prev = resolved[i - 1];
          return (
            <line
              key={`bus-line-${prev.id}-${pt.id}`}
              x1={prev.x}
              y1={prev.y}
              x2={pt.x}
              y2={pt.y}
              stroke="#00F3FF"
              strokeWidth="1.5"
              strokeDasharray="4,3"
              opacity="0.45"
            />
          );
        })}

      {/* Glowing dots at each bus-member pin */}
      {resolved.map((pt) => (
        <React.Fragment key={`bus-dot-${pt.id}`}>
          {/* Outer glow */}
          <circle
            cx={pt.x}
            cy={pt.y}
            r="6"
            fill="#00F3FF"
            opacity="0.15"
          />
          {/* Inner dot */}
          <circle
            cx={pt.x}
            cy={pt.y}
            r="3"
            fill="#00F3FF"
            opacity="0.6"
            style={{ filter: 'drop-shadow(0 0 3px #00F3FF)' }}
          />
        </React.Fragment>
      ))}
    </g>
  );
});

export default BusHighlight;
