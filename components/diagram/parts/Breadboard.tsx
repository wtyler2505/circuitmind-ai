import React from 'react';
import { ElectronicComponent } from '../../../types';
import { FOOTPRINT_CANVAS_SCALE } from '../componentShapes';
import { FzpzVisual } from './FzpzVisual';

interface BreadboardProps {
  component: ElectronicComponent;
}

/**
 * Returns pins that are electrically connected to `pinId` via internal buses.
 *
 * For breadboards the buses represent power rails and terminal-strip columns.
 * The data comes from the FZP `<buses>` XML (or heuristic derivation in
 * `fzpzLoader.deriveInternalBuses`).
 *
 * @param pinId        — The pin to query (e.g. "connector0", "pin_1_3").
 * @param internalBuses — `component.internalBuses` from the parsed FZPZ data.
 *                        Each inner array is one bus — a set of electrically
 *                        connected pin IDs.
 * @returns The peer pin IDs on the same bus, excluding `pinId` itself.
 */
export const getBreadboardConnectivity = (
  pinId: string,
  internalBuses?: string[][],
): string[] => {
  if (!internalBuses || internalBuses.length === 0) return [];

  for (const bus of internalBuses) {
    if (bus.includes(pinId)) {
      return bus.filter((id) => id !== pinId);
    }
  }

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
