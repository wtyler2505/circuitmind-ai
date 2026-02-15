import React from 'react';
import { ElectronicComponent } from '../../../types';
import { FOOTPRINT_CANVAS_SCALE } from '../componentShapes';
import { FzpzVisual } from './FzpzVisual';

interface BreadboardProps {
  component: ElectronicComponent;
}

// Logic for Breadboard connectivity
export const getBreadboardConnectivity = (pinId: string): string[] => {
    // Expected pinId format: "breadboard1-row1-a" or similar, BUT
    // Standard Fritzing breadboard just has "connector0", "connector1"...
    // We need to map connector ID to Row/Column.
    //
    // Standard Half+ Breadboard:
    // Top Power Rails: +, -
    // Bottom Power Rails: +, -
    // Terminal Strips: Rows 1-30, Columns A-E and F-J.

    // Naive implementation: Assume we know the geometry.
    // In a real implementation, we'd parse the 'buses' from the FZP file.
    return [];
};

export const BreadboardVisual: React.FC<BreadboardProps> = ({ component }) => {
  // Priority 1: Use cached FZPZ SVG via FzpzVisual if the component has FZPZ data
  if (component.fzpzSource) {
    return <FzpzVisual component={component} view="breadboard" />;
  }

  // Priority 2: Use fzpzUrl marker — even without loaded source, the component
  // was identified as having a FZPZ asset. Render footprint-based placeholder
  // that will be replaced once the FZPZ is loaded.
  if (component.fzpzUrl && component.footprint) {
    return (
      <g>
        <rect
          width={component.footprint.width * FOOTPRINT_CANVAS_SCALE}
          height={component.footprint.height * FOOTPRINT_CANVAS_SCALE}
          fill="#f5f6f7"
          stroke="#e2e4e8"
        />
        {/* Pin holes from footprint data */}
        {component.footprint.pins.map(p => (
          <rect
            key={p.id}
            x={p.x * FOOTPRINT_CANVAS_SCALE - 2}
            y={p.y * FOOTPRINT_CANVAS_SCALE - 2}
            width="4"
            height="4"
            fill="#333"
          />
        ))}
      </g>
    );
  }

  // Priority 3: Fallback procedural 30-column breadboard
  return (
    <g>
      <rect x="0" y="0" width="550" height="180" rx="4" fill="#f5f6f7" stroke="#d1d5db" strokeWidth="1" />
      {/* Power Rails Top */}
      <line x1="20" y1="15" x2="530" y2="15" stroke="#ef4444" strokeWidth="2" opacity="0.5" />
      <line x1="20" y1="25" x2="530" y2="25" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />

      {/* Rows */}
      {Array.from({ length: 30 }).map((_, col) => (
          <g key={col} transform={`translate(${30 + col * 17}, 50)`}>
              {/* Top Bank A-E */}
              <circle cy="0" r="2" fill="#333" opacity="0.2" />
              <circle cy="10" r="2" fill="#333" opacity="0.2" />
              <circle cy="20" r="2" fill="#333" opacity="0.2" />
              <circle cy="30" r="2" fill="#333" opacity="0.2" />
              <circle cy="40" r="2" fill="#333" opacity="0.2" />

              {/* Bottom Bank F-J */}
              <circle cy="70" r="2" fill="#333" opacity="0.2" />
              <circle cy="80" r="2" fill="#333" opacity="0.2" />
              <circle cy="90" r="2" fill="#333" opacity="0.2" />
              <circle cy="100" r="2" fill="#333" opacity="0.2" />
              <circle cy="110" r="2" fill="#333" opacity="0.2" />
          </g>
      ))}
    </g>
  );
};
