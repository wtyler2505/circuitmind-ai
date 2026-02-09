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
}) {
  const { result } = useSimulation();

  if (!result) return null;

  const pinKey = `${componentId}:${pin}`;
  const pinState = result.pinStates[pinKey];

  if (!pinState) return null;

  const { voltage, current, logicState } = pinState;
  const stateDisplay = getStateDisplay(logicState);

  // Check for MNA-specific data
  const mnaResult = result as MNASimulationResult;
  const hasMNA = mnaResult.usedMNA === true;

  // Tooltip dimensions
  const tooltipWidth = 100;
  const tooltipHeight = hasMNA ? 54 : 28;

  // Position: offset from pin, avoid overlapping
  const offsetX = isRightSide ? 16 : -(tooltipWidth + 16);
  const offsetY = -tooltipHeight / 2;

  return (
    <g
      transform={`translate(${x + offsetX}, ${y + offsetY})`}
      pointerEvents="none"
      role="tooltip"
      aria-label={`${pin}: ${formatVoltage(voltage)}, ${formatCurrent(current)}, ${stateDisplay.label}`}
    >
      {/* Background */}
      <rect
        width={tooltipWidth}
        height={tooltipHeight}
        rx="3"
        fill="rgba(2, 6, 23, 0.95)"
        stroke={stateDisplay.color}
        strokeWidth="1"
        style={{ filter: `drop-shadow(0 0 4px ${stateDisplay.color}40)` }}
      />

      {/* Pin name header */}
      <text
        x="6"
        y="12"
        fill={stateDisplay.color}
        fontSize="8"
        fontWeight="700"
        fontFamily="monospace"
      >
        {pin}
      </text>

      {/* Logic state badge */}
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

      {hasMNA && (
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
    </g>
  );
});

export default PinTooltip;
export { formatVoltage, formatCurrent };
