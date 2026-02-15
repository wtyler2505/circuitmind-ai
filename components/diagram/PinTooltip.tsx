import React, { memo } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import type { MNASimulationResult } from '../../services/simulation/types';

interface PinTooltipProps {
  /** Pin name (e.g., "VCC", "D2", "A0") */
  pin: string;
  /** Component ID for pin lookup */
  componentId: string;
  /** SVG x position of the pin */
  x: number;
  /** SVG y position of the pin */
  y: number;
  /** Whether pin is on the right side (affects tooltip placement) */
  isRightSide: boolean;
  /** Internal bus data from the component (optional) */
  internalBuses?: string[][];
}

/**
 * Format voltage for display with appropriate precision.
 */
function formatVoltage(v: number): string {
  if (Math.abs(v) < 0.001) return '0 V';
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(2)} kV`;
  if (Math.abs(v) < 0.01) return `${(v * 1000).toFixed(1)} mV`;
  return `${v.toFixed(3)} V`;
}

/**
 * Format current for display with appropriate unit.
 */
function formatCurrent(i: number): string {
  const abs = Math.abs(i);
  if (abs < 1e-9) return '0 A';
  if (abs < 1e-6) return `${(i * 1e9).toFixed(1)} nA`;
  if (abs < 1e-3) return `${(i * 1e6).toFixed(1)} \u00B5A`;
  if (abs < 1) return `${(i * 1e3).toFixed(2)} mA`;
  return `${i.toFixed(3)} A`;
}

/**
 * Get display info for a logic state.
 */
function getStateDisplay(state: string): { label: string; color: string } {
  switch (state) {
    case 'HIGH':
      return { label: 'HIGH', color: '#00ff9d' };
    case 'LOW':
      return { label: 'LOW', color: '#64748b' };
    case 'FLOATING':
      return { label: 'FLOAT', color: '#f59e0b' };
    case 'ERROR':
      return { label: 'ERROR', color: '#ef4444' };
    default:
      return { label: state, color: '#94a3b8' };
  }
}

/**
 * PinTooltip — floating data card showing real-time electrical values.
 *
 * Appears on pin hover when simulation data is available. Shows:
 * - Voltage (V, mV, or kV depending on magnitude)
 * - Current (A, mA, µA, or nA)
 * - Logic state (HIGH/LOW/FLOATING/ERROR)
 *
 * Cyberpunk styling consistent with CircuitMind UI.
 */
const PinTooltip = memo<PinTooltipProps>(function PinTooltip({
  pin,
  componentId,
  x,
  y,
  isRightSide,
  internalBuses,
}) {
  const { result } = useSimulation();

  // Compute bus membership for this pin (independent of simulation data)
  let busSize = 0;
  if (internalBuses) {
    for (const bus of internalBuses) {
      if (bus.includes(pin)) {
        busSize = bus.length - 1; // peers, excluding self
        break;
      }
    }
  }

  const hasBusInfo = busSize > 0;

  // If no simulation result AND no bus info, nothing to show
  if (!result && !hasBusInfo) return null;

  const pinKey = `${componentId}:${pin}`;
  const pinState = result?.pinStates[pinKey] ?? null;

  // If no pin state and no bus info, nothing to show
  if (!pinState && !hasBusInfo) return null;

  const voltage = pinState?.voltage ?? 0;
  const current = pinState?.current ?? 0;
  const logicState = pinState?.logicState ?? 'FLOATING';
  const stateDisplay = getStateDisplay(logicState);

  // Check for MNA-specific data
  const mnaResult = result as MNASimulationResult | null;
  const hasMNA = mnaResult?.usedMNA === true;

  // Tooltip dimensions — grow if bus info or MNA data is present
  const tooltipWidth = 100;
  const busRowHeight = hasBusInfo ? 14 : 0;
  const tooltipHeight = (pinState ? (hasMNA ? 54 : 28) : 16) + busRowHeight;

  // Position: offset from pin, avoid overlapping
  const offsetX = isRightSide ? 16 : -(tooltipWidth + 16);
  const offsetY = -tooltipHeight / 2;

  // Compute vertical offset for bus row (placed below sim data)
  const busRowY = pinState ? (hasMNA ? 56 : 18) : 16;

  const ariaLabel = pinState
    ? `${pin}: ${formatVoltage(voltage)}, ${formatCurrent(current)}, ${stateDisplay.label}${hasBusInfo ? `, bus: ${busSize} connected` : ''}`
    : `${pin}: bus: ${busSize} connected`;

  // Border color: use sim state color if available, otherwise cyan for bus-only
  const borderColor = pinState ? stateDisplay.color : '#00F3FF';

  return (
    <g
      transform={`translate(${x + offsetX}, ${y + offsetY})`}
      pointerEvents="none"
      role="tooltip"
      aria-label={ariaLabel}
    >
      {/* Background */}
      <rect
        width={tooltipWidth}
        height={tooltipHeight}
        rx="3"
        fill="rgba(2, 6, 23, 0.95)"
        stroke={borderColor}
        strokeWidth="1"
        style={{ filter: `drop-shadow(0 0 4px ${borderColor}40)` }}
      />

      {/* Pin name header */}
      <text
        x="6"
        y="12"
        fill={pinState ? stateDisplay.color : '#00F3FF'}
        fontSize="8"
        fontWeight="700"
        fontFamily="monospace"
      >
        {pin}
      </text>

      {/* Logic state badge (only when sim data is present) */}
      {pinState && (
        <>
          <rect
            x={tooltipWidth - 6 - stateDisplay.label.length * 5.5}
            y="3"
            width={stateDisplay.label.length * 5.5 + 4}
            height="12"
            rx="2"
            fill={stateDisplay.color}
            opacity="0.2"
          />
          <text
            x={tooltipWidth - 4}
            y="12"
            textAnchor="end"
            fill={stateDisplay.color}
            fontSize="7"
            fontWeight="600"
            fontFamily="monospace"
          >
            {stateDisplay.label}
          </text>
        </>
      )}

      {pinState && hasMNA && (
        <>
          {/* Divider */}
          <line
            x1="4"
            y1="17"
            x2={tooltipWidth - 4}
            y2="17"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="0.5"
          />

          {/* Voltage row */}
          <text
            x="6"
            y="28"
            fill="#94a3b8"
            fontSize="7"
            fontFamily="monospace"
          >
            V:
          </text>
          <text
            x={tooltipWidth - 4}
            y="28"
            textAnchor="end"
            fill="#00f3ff"
            fontSize="8"
            fontWeight="600"
            fontFamily="monospace"
          >
            {formatVoltage(voltage)}
          </text>

          {/* Current row */}
          <text
            x="6"
            y="40"
            fill="#94a3b8"
            fontSize="7"
            fontFamily="monospace"
          >
            I:
          </text>
          <text
            x={tooltipWidth - 4}
            y="40"
            textAnchor="end"
            fill="#f59e0b"
            fontSize="8"
            fontWeight="600"
            fontFamily="monospace"
          >
            {formatCurrent(current)}
          </text>

          {/* Power row (if significant) */}
          {Math.abs(voltage * current) > 1e-6 && (
            <>
              <text
                x="6"
                y="51"
                fill="#94a3b8"
                fontSize="7"
                fontFamily="monospace"
              >
                P:
              </text>
              <text
                x={tooltipWidth - 4}
                y="51"
                textAnchor="end"
                fill="#a78bfa"
                fontSize="8"
                fontWeight="600"
                fontFamily="monospace"
              >
                {formatCurrent(voltage * current).replace('A', 'W')}
              </text>
            </>
          )}
        </>
      )}

      {/* Bus membership row */}
      {hasBusInfo && (
        <>
          <line
            x1="4"
            y1={busRowY}
            x2={tooltipWidth - 4}
            y2={busRowY}
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="0.5"
          />
          <text
            x="6"
            y={busRowY + 10}
            fill="#5eead4"
            fontSize="7"
            fontFamily="monospace"
          >
            BUS:
          </text>
          <text
            x={tooltipWidth - 4}
            y={busRowY + 10}
            textAnchor="end"
            fill="#5eead4"
            fontSize="7"
            fontWeight="600"
            fontFamily="monospace"
          >
            {busSize} connected
          </text>
        </>
      )}
    </g>
  );
});

export default memo(PinTooltip);
export { formatVoltage, formatCurrent };
