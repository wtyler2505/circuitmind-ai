import React, { memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElectronicComponent } from '../../types';
import { getComponentShape, calculatePinPositions, COLORS, type ComponentShape } from './componentShapes';
import { useTelemetry } from '../../contexts/TelemetryContext';
import { useSimulation } from '../../contexts/SimulationContext';
import { BreadboardVisual } from './parts/Breadboard';

// Default dimensions (used for layout calculations)
const COMPONENT_WIDTH = 180;
const COMPONENT_HEIGHT = 100;

export interface NodeHighlightState {
  color: string;
  pulse: boolean;
}

interface DiagramNodeProps {
  component: ElectronicComponent;
  position: { x: number; y: number };
  isHovered: boolean;
  isSelected?: boolean;
  highlight?: NodeHighlightState;
  onPointerDown: (e: React.PointerEvent, nodeId: string) => void;
  onSelect?: (componentId: string) => void;
  onContextMenu?: (componentId: string, x: number, y: number) => void;
  onDoubleClick?: (component: ElectronicComponent) => void;
  onPinPointerDown: (e: React.PointerEvent, nodeId: string, pin: string, isRightSide: boolean) => void;
  onPinPointerUp: (e: React.PointerEvent, nodeId: string, pin: string) => void;
  onMouseEnter?: (e: React.MouseEvent, component: ElectronicComponent) => void;
  onMouseLeave?: (e: React.MouseEvent, component: ElectronicComponent) => void;
  onPinEnter?: (e: React.MouseEvent, componentId: string, pin: string) => void;
  onPinLeave?: (e: React.MouseEvent, componentId: string, pin: string) => void;
}

/**
 * Smart pin color coding based on pin function
 */
const getPinColor = (pinName: string): { fill: string; stroke: string; textColor: string } => {
  const name = pinName.toUpperCase();

  // Power pins - RED
  if (name === 'VCC' || name === 'VIN' || name === '5V' || name === '3V3' ||
      name === '3.3V' || name === '+5V' || name === '+3.3V' || name.includes('PWR') ||
      name === 'V+' || name === 'RAW') {
    return { fill: '#DC2626', stroke: '#991B1B', textColor: '#FECACA' };
  }

  // Ground pins - BLACK
  if (name === 'GND' || name === 'GROUND' || name === 'VSS' || name === 'V-' || name === '0V') {
    return { fill: '#1F2937', stroke: '#111827', textColor: '#9CA3AF' };
  }

  // I2C pins - BLUE
  if (name === 'SDA' || name === 'SCL' || name.includes('I2C')) {
    return { fill: '#2563EB', stroke: '#1D4ED8', textColor: '#BFDBFE' };
  }

  // SPI pins - PURPLE
  if (name === 'MOSI' || name === 'MISO' || name === 'SCK' || name === 'SS' ||
      name === 'CS' || name.includes('SPI')) {
    return { fill: '#7C3AED', stroke: '#5B21B6', textColor: '#DDD6FE' };
  }

  // Serial pins - GREEN/ORANGE
  if (name === 'TX' || name === 'TXD' || name === 'TX0' || name === 'TX1') {
    return { fill: '#059669', stroke: '#047857', textColor: '#A7F3D0' };
  }
  if (name === 'RX' || name === 'RXD' || name === 'RX0' || name === 'RX1') {
    return { fill: '#D97706', stroke: '#B45309', textColor: '#FDE68A' };
  }

  // Analog pins - TEAL
  if (name.startsWith('A') && /^A\d+$/.test(name)) {
    return { fill: '#0891B2', stroke: '#0E7490', textColor: '#A5F3FC' };
  }

  // Digital pins - Default copper with gold tint
  return { fill: 'url(#gradient-copper)', stroke: '#7A7152', textColor: '#FDE68A' };
};

/**
 * TelemetryOverlay component - floating data bubble for real-time pin values.
 */
const TelemetryOverlay: React.FC<{ 
  pin: string; 
  componentId: string; 
  x: number; 
  y: number; 
  isRightSide: boolean 
}> = ({ pin, componentId, x, y, isRightSide }) => {
  const { liveData } = useTelemetry();
  // Check for exact match or auto-mapped pin
  const packet = liveData[`${componentId}:${pin}`] || liveData[`auto:${pin}`];

  if (!packet) return null;

  return (
    <g transform={`translate(${isRightSide ? x + 12 : x - 12}, ${y})`} pointerEvents="none">
      <AnimatePresence mode="wait">
        <motion.g
          key={`${packet.timestamp}-${packet.value}`}
          initial={{ opacity: 0, x: isRightSide ? -5 : 5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Bubble background */}
          <rect
            x={isRightSide ? 0 : -36}
            y={-7}
            width="36"
            height="14"
            rx="2"
            fill={packet.value === 'HIGH' || packet.value === '1' ? '#00ff9d' : '#00f3ff'}
            className="shadow-lg"
          />
          {/* Value text */}
          <text
            x={isRightSide ? 18 : -18}
            y={3}
            textAnchor="middle"
            fill="#000"
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {packet.value}
          </text>
          {/* Pulsing indicator */}
          <circle
            cx={isRightSide ? 0 : 0}
            cy="0"
            r="2"
            fill="#fff"
            className="animate-ping"
          />
        </motion.g>
      </AnimatePresence>
    </g>
  );
};

/**
 * PinStatusDot component - tiny indicator for logical pin state.
 */
const PinStatusDot: React.FC<{ pin: string; componentId: string; x: number; y: number }> = ({ pin, componentId, x, y }) => {
  const { result } = useSimulation();
  const state = result?.pinStates[`${componentId}:${pin}`];

  if (!state || state.logicState === 'FLOATING') return null;

  const color = 
    state.logicState === 'HIGH' ? '#00ff9d' : 
    state.logicState === 'LOW' ? '#1e293b' : 
    state.logicState === 'ERROR' ? '#ef4444' : 'transparent';

  return (
    <circle 
      cx={x} 
      cy={y} 
      r="2.5" 
      fill={color} 
      stroke="#000" 
      strokeWidth="0.5" 
      pointerEvents="none" 
      className="transition-colors duration-200"
    />
  );
};

/**
 * Pin component - Fritzing-style copper contacts with smart color coding.
 */
interface PinProps {
  pin: string;
  x: number;
  y: number;
  nodeId: string;
  isRightSide: boolean;
  shape: ComponentShape;
  onPointerDown: (e: React.PointerEvent, nodeId: string, pin: string, isRightSide: boolean) => void;
  onPointerUp: (e: React.PointerEvent, nodeId: string, pin: string) => void;
  onMouseEnter?: (e: React.MouseEvent, nodeId: string, pin: string) => void;
  onMouseLeave?: (e: React.MouseEvent, nodeId: string, pin: string) => void;
}

const Pin = memo<PinProps>(function Pin({
  pin,
  x,
  y,
  nodeId,
  isRightSide,
  shape,
  onPointerDown,
  onPointerUp,
  onMouseEnter,
  onMouseLeave,
}) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => onPointerDown(e, nodeId, pin, isRightSide),
    [onPointerDown, nodeId, pin, isRightSide]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => onPointerUp(e, nodeId, pin),
    [onPointerUp, nodeId, pin]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => onMouseEnter?.(e, nodeId, pin),
    [onMouseEnter, nodeId, pin]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => onMouseLeave?.(e, nodeId, pin),
    [onMouseLeave, nodeId, pin]
  );

  // Get smart pin color based on pin name/function
  const pinColors = useMemo(() => getPinColor(pin), [pin]);
  const defaultFill = shape.pinFill || COLORS.copper;

  // Use smart color if pin has special function, otherwise use component default
  const isSpecialPin = !pinColors.fill.includes('gradient');
  const pinFill = isSpecialPin ? pinColors.fill : defaultFill;
  const pinStroke = isSpecialPin ? pinColors.stroke : (shape.pinStroke || '#7A7152');
  const labelColor = isSpecialPin ? pinColors.textColor : COLORS.text;

  // Pin dimensions - slightly larger for visibility
  const pinWidth = 8;
  const pinHeight = 10;
  const pinRadius = 1;

  return (
    <g className="pin-group">
      {/* Pin glow effect for special pins */}
      {isSpecialPin && (
        <rect
          x={x - pinWidth / 2 - 1}
          y={y - pinHeight / 2 - 1}
          width={pinWidth + 2}
          height={pinHeight + 2}
          rx={pinRadius + 1}
          fill={pinFill}
          opacity="0.3"
          filter="url(#filter-glow)"
        />
      )}
      {/* Pin pad - rounded rectangle with color coding */}
      <rect
        x={x - pinWidth / 2}
        y={y - pinHeight / 2}
        width={pinWidth}
        height={pinHeight}
        rx={pinRadius}
        fill={pinFill}
        stroke={pinStroke}
        strokeWidth="1.5"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair hover:brightness-125 transition-all"
        style={{ filter: isSpecialPin ? 'brightness(1.1)' : undefined }}
      />
      {/* Metallic highlight on pin */}
      <rect
        x={x - pinWidth / 2 + 1}
        y={y - pinHeight / 2 + 1}
        width={pinWidth - 2}
        height={3}
        rx={0.5}
        fill="rgba(255,255,255,0.2)"
        pointerEvents="none"
      />
      {/* Hit area for easier clicking */}
      <rect
        x={x - 10}
        y={y - 10}
        width="20"
        height="20"
        fill="transparent"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="cursor-crosshair"
      />
      {/* Pin label with background for readability */}
      <g pointerEvents="none">
        {/* Label background */}
        <rect
          x={isRightSide ? x - 12 - pin.length * 5 : x + 10}
          y={y - 5}
          width={pin.length * 5 + 4}
          height="11"
          rx="2"
          fill="rgba(0,0,0,0.6)"
        />
        {/* Label text */}
        <text
          x={isRightSide ? x - 12 : x + 12}
          y={y + 3}
          fill={labelColor}
          fontSize="8"
          fontFamily="monospace"
          fontWeight="600"
          textAnchor={isRightSide ? 'end' : 'start'}
        >
          {pin}
        </text>
      </g>
    </g>
  );
});

/**
 * Detail renderers for each component type - realistic PCB style.
 */
const MicrocontrollerDetails: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g className="pointer-events-none">
    {/* USB port - black rectangle */}
    <rect x={width/2 - 15} y="2" width="30" height="10" fill="#1E1E1E" stroke="#333"/>
    {/* Main chip (ATmega) */}
    <rect x={width/2 - 25} y={height/2 - 12} width="50" height="24" fill="#1E1E1E" stroke="#333"/>
    {/* Chip text */}
    <text x={width/2} y={height/2 + 2} fill="#666" fontSize="6" textAnchor="middle" fontFamily="monospace">ATmega328P</text>
    {/* Crystal */}
    <rect x="20" y={height/2 - 6} width="10" height="12" fill="#C0C0C0" stroke="#999"/>
    {/* Reset button */}
    <rect x={width - 25} y="20" width="10" height="6" fill="#333" stroke="#555"/>
    {/* Power LED */}
    <circle cx="15" cy={height - 15} r="2" fill="#22C55E"/>
    {/* TX/RX LEDs */}
    <circle cx="25" cy={height - 15} r="1.5" fill="#FACC15"/>
    <circle cx="32" cy={height - 15} r="1.5" fill="#3B82F6"/>
    {/* Pin header indicators */}
    <rect x="0" y="28" width="4" height={height - 40} fill={COLORS.copper} opacity="0.6"/>
    <rect x={width - 4} y="28" width="4" height={height - 40} fill={COLORS.copper} opacity="0.6"/>
  </g>
);

/**
 * Arduino Uno R3 - Realistic Fritzing-style visual
 * Includes USB-B port, barrel jack, ATmega chips, crystal, LEDs, headers
 */
const ArduinoUnoDetails: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g className="pointer-events-none">
    {/* PCB base color overlay for depth */}
    <rect x="2" y="2" width={width - 4} height={height - 4} fill="#006D65" opacity="0.3" />

    {/* USB-B Port (silver metal housing) */}
    <rect x={width/2 - 20} y="3" width="40" height="18" fill="#A0A0A0" stroke="#606060" strokeWidth="1"/>
    <rect x={width/2 - 16} y="6" width="32" height="12" fill="#1E1E1E"/>
    <rect x={width/2 - 12} y="9" width="24" height="6" fill="#333"/>

    {/* Barrel Jack (power connector) - left side */}
    <rect x="3" y="3" width="25" height="18" fill="#1E1E1E" stroke="#333"/>
    <circle cx="15" cy="12" r="5" fill="#333" stroke="#555"/>
    <circle cx="15" cy="12" r="2" fill="#1E1E1E"/>

    {/* Reset Button (red) */}
    <rect x={width - 45} y="8" width="12" height="8" fill="#DC2626" stroke="#991B1B" strokeWidth="1" rx="1"/>
    <text x={width - 39} y="26" fill={COLORS.white} fontSize="5" textAnchor="middle" fontFamily="sans-serif">RESET</text>

    {/* ICSP Header (2x3 pins) */}
    <rect x={width/2 + 40} y="25" width="18" height="12" fill="#1E1E1E" stroke="#333"/>
    <text x={width/2 + 49} y="45" fill={COLORS.subtleText} fontSize="5" textAnchor="middle">ICSP</text>
    {/* ICSP pins */}
    {[0, 1, 2].map(i => (
      <g key={`icsp-top-${i}`}>
        <circle cx={width/2 + 44 + i*6} cy="28" r="1.5" fill={COLORS.copper}/>
        <circle cx={width/2 + 44 + i*6} cy="34" r="1.5" fill={COLORS.copper}/>
      </g>
    ))}

    {/* ATmega328P Main Chip (large DIP-28) */}
    <rect x={width/2 - 35} y={height/2 - 25} width="70" height="50" fill="#1E1E1E" stroke="#333" strokeWidth="1"/>
    <circle cx={width/2 - 28} cy={height/2 - 18} r="3" fill="#333"/> {/* Pin 1 notch */}
    <text x={width/2} y={height/2 - 5} fill="#555" fontSize="6" textAnchor="middle" fontFamily="monospace">ATMEGA328P</text>
    <text x={width/2} y={height/2 + 5} fill="#444" fontSize="5" textAnchor="middle" fontFamily="monospace">-PU</text>

    {/* ATmega16U2 USB Chip (smaller, near USB port) */}
    <rect x={width/2 - 50} y="30" width="25" height="18" fill="#1E1E1E" stroke="#333"/>
    <text x={width/2 - 37} y="42" fill="#444" fontSize="4" textAnchor="middle" fontFamily="monospace">16U2</text>

    {/* Crystal Oscillators */}
    <rect x="60" y={height/2 - 8} width="16" height="8" fill="#C0C0C0" stroke="#888"/>
    <text x="68" y={height/2 + 10} fill={COLORS.subtleText} fontSize="4" textAnchor="middle">16MHz</text>
    <rect x={width/2 - 60} y="45" width="10" height="5" fill="#C0C0C0" stroke="#888"/>

    {/* Status LEDs with labels */}
    <g transform="translate(30, 155)">
      {/* ON LED (green) */}
      <circle cx="0" cy="0" r="3" fill="#22C55E"/>
      <text x="0" y="12" fill={COLORS.subtleText} fontSize="5" textAnchor="middle">ON</text>
      {/* L LED (orange) */}
      <circle cx="20" cy="0" r="3" fill="#F97316"/>
      <text x="20" y="12" fill={COLORS.subtleText} fontSize="5" textAnchor="middle">L</text>
      {/* TX LED (yellow) */}
      <circle cx="40" cy="0" r="2.5" fill="#FACC15"/>
      <text x="40" y="12" fill={COLORS.subtleText} fontSize="5" textAnchor="middle">TX</text>
      {/* RX LED (yellow) */}
      <circle cx="55" cy="0" r="2.5" fill="#FACC15"/>
      <text x="55" y="12" fill={COLORS.subtleText} fontSize="5" textAnchor="middle">RX</text>
    </g>

    {/* Pin Header Strips - Black plastic with copper contacts */}
    {/* Left header (Power + Analog) */}
    <rect x="3" y="30" width="8" height="65" fill="#1E1E1E" stroke="#333"/>
    <rect x="3" y="115" width="8" height="70" fill="#1E1E1E" stroke="#333"/>
    {/* Right header (Digital) */}
    <rect x={width - 11} y="20" width="8" height="175" fill="#1E1E1E" stroke="#333"/>

    {/* Silkscreen Arduino Logo/Text */}
    <text x={width/2} y={height - 25} fill={COLORS.white} fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">ARDUINO</text>
    <text x={width/2} y={height - 12} fill={COLORS.white} fontSize="10" textAnchor="middle" fontFamily="Arial, sans-serif">UNO R3</text>

    {/* Mounting holes (4 corners) */}
    <circle cx="14" cy={height - 8} r="4" fill="none" stroke="#005C5F" strokeWidth="2"/>
    <circle cx={width - 14} cy={height - 8} r="4" fill="none" stroke="#005C5F" strokeWidth="2"/>
    <circle cx="14" cy="25" r="4" fill="none" stroke="#005C5F" strokeWidth="2"/>
    <circle cx={width - 14} cy="25" r="4" fill="none" stroke="#005C5F" strokeWidth="2"/>

    {/* Voltage regulator */}
    <rect x="35" y="50" width="15" height="20" fill="#1E1E1E" stroke="#333"/>

    {/* Capacitors (electrolytic) */}
    <circle cx="55" cy="60" r="6" fill="#1E3A5F" stroke="#2563EB"/>
    <circle cx={width - 50} cy="55" r="5" fill="#1E3A5F" stroke="#2563EB"/>

    {/* Pin labels for digital header */}
    <text x={width - 20} y="38" fill={COLORS.subtleText} fontSize="5" textAnchor="end">0 RX</text>
    <text x={width - 20} y="49" fill={COLORS.subtleText} fontSize="5" textAnchor="end">1 TX</text>
    <text x={width - 20} y="60" fill={COLORS.subtleText} fontSize="5" textAnchor="end">2</text>
    <text x={width - 20} y="71" fill={COLORS.subtleText} fontSize="5" textAnchor="end">~3</text>
    <text x={width - 20} y="82" fill={COLORS.subtleText} fontSize="5" textAnchor="end">4</text>
    <text x={width - 20} y="93" fill={COLORS.subtleText} fontSize="5" textAnchor="end">~5</text>
    <text x={width - 20} y="104" fill={COLORS.subtleText} fontSize="5" textAnchor="end">~6</text>
    <text x={width - 20} y="115" fill={COLORS.subtleText} fontSize="5" textAnchor="end">7</text>
    <text x={width - 20} y="131" fill={COLORS.subtleText} fontSize="5" textAnchor="end">8</text>
    <text x={width - 20} y="142" fill={COLORS.subtleText} fontSize="5" textAnchor="end">~9</text>
    <text x={width - 20} y="153" fill={COLORS.subtleText} fontSize="5" textAnchor="end">~10</text>
    <text x={width - 20} y="164" fill={COLORS.subtleText} fontSize="5" textAnchor="end">~11</text>
    <text x={width - 20} y="175" fill={COLORS.subtleText} fontSize="5" textAnchor="end">12</text>
    <text x={width - 20} y="186" fill={COLORS.subtleText} fontSize="5" textAnchor="end">13</text>

    {/* Pin labels for power/analog header */}
    <text x="18" y="38" fill={COLORS.subtleText} fontSize="5">RST</text>
    <text x="18" y="49" fill={COLORS.subtleText} fontSize="5">3V3</text>
    <text x="18" y="60" fill={COLORS.subtleText} fontSize="5">5V</text>
    <text x="18" y="71" fill={COLORS.subtleText} fontSize="5">GND</text>
    <text x="18" y="82" fill={COLORS.subtleText} fontSize="5">GND</text>
    <text x="18" y="93" fill={COLORS.subtleText} fontSize="5">VIN</text>
    <text x="18" y="123" fill={COLORS.subtleText} fontSize="5">A0</text>
    <text x="18" y="134" fill={COLORS.subtleText} fontSize="5">A1</text>
    <text x="18" y="145" fill={COLORS.subtleText} fontSize="5">A2</text>
    <text x="18" y="156" fill={COLORS.subtleText} fontSize="5">A3</text>
    <text x="18" y="167" fill={COLORS.subtleText} fontSize="5">A4</text>
    <text x="18" y="178" fill={COLORS.subtleText} fontSize="5">A5</text>
  </g>
);

const SensorDetails: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g className="pointer-events-none">
    {/* Sensing element - center circle */}
    <circle cx={width/2} cy={height/2} r="12" fill="#1E1E1E" stroke={COLORS.sensorPurple} strokeWidth="2"/>
    {/* Sensor chip */}
    <rect x={width/2 - 8} y={height/2 - 4} width="16" height="8" fill="#333"/>
    {/* Trim pot */}
    <rect x="10" y={height - 18} width="8" height="8" fill="#1E1E1E" stroke="#555"/>
    <line x1="14" y1={height - 16} x2="14" y2={height - 12} stroke={COLORS.copper} strokeWidth="2"/>
    {/* Pin header */}
    <rect x="0" y="24" width="3" height={height - 32} fill={COLORS.copper} opacity="0.6"/>
  </g>
);

/**
 * DHT11/DHT22 - Temperature & Humidity Sensor
 * Realistic blue plastic housing with ventilation grid and sensing element
 */
const DHT11Details: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g className="pointer-events-none">
    {/* Blue plastic housing highlights */}
    <rect x="3" y="18" width={width - 6} height={height - 24} fill="#3B82F6" opacity="0.15" />

    {/* Ventilation grid pattern (sensing area) */}
    <rect x="8" y="20" width={width - 16} height="28" fill="#1E40AF" opacity="0.3" rx="2"/>
    {/* Grid lines - horizontal */}
    {[0, 1, 2, 3, 4, 5, 6].map(i => (
      <line key={`h-${i}`} x1="10" y1={22 + i * 4} x2={width - 10} y2={22 + i * 4} stroke="#1E3A8A" strokeWidth="1" opacity="0.6"/>
    ))}
    {/* Grid lines - vertical */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
      <line key={`v-${i}`} x1={12 + i * 5} y1="20" x2={12 + i * 5} y2="48" stroke="#1E3A8A" strokeWidth="1" opacity="0.6"/>
    ))}

    {/* Internal sensor element (hidden behind grid) */}
    <circle cx={width/2} cy="34" r="8" fill="#1E1E1E" stroke="#333" opacity="0.7"/>

    {/* Humidity sensing element indicator */}
    <rect x={width/2 - 5} y="30" width="10" height="8" fill="#374151" stroke="#555" strokeWidth="0.5"/>

    {/* Model label */}
    <text x={width/2} y={height - 8} fill="#93C5FD" fontSize="7" textAnchor="middle" fontFamily="monospace" fontWeight="600">DHT11</text>

    {/* Pin labels at bottom */}
    <g transform={`translate(0, ${height - 15})`}>
      <text x="12" y="0" fill="#BFDBFE" fontSize="5" textAnchor="middle">VCC</text>
      <text x="28" y="0" fill="#BFDBFE" fontSize="5" textAnchor="middle">DATA</text>
      <text x="44" y="0" fill="#BFDBFE" fontSize="5" textAnchor="middle">NC</text>
      <text x="60" y="0" fill="#BFDBFE" fontSize="5" textAnchor="middle">GND</text>
    </g>

    {/* Temperature icon */}
    <g transform="translate(5, 52)">
      <rect x="0" y="0" width="3" height="6" fill="#EF4444" rx="1"/>
      <circle cx="1.5" cy="8" r="2" fill="#EF4444"/>
    </g>

    {/* Humidity icon */}
    <g transform={`translate(${width - 12}, 52)`}>
      <path d="M 3 0 Q 0 4 3 7 Q 6 4 3 0 Z" fill="#3B82F6"/>
    </g>
  </g>
);

/**
 * LCD 1602 - 16x2 Character LCD Display
 * Green PCB with LCD screen, contrast pot, and backlight
 */
const LCD1602Details: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g className="pointer-events-none">
    {/* LCD screen bezel (dark frame) */}
    <rect x="10" y="20" width={width - 20} height="42" fill="#1E1E1E" stroke="#333" strokeWidth="1"/>

    {/* LCD screen glass with green backlight */}
    <rect x="14" y="24" width={width - 28} height="34" fill="url(#gradient-lcd-screen)" stroke="#556B2F"/>

    {/* Character grid indicator - 16x2 */}
    {/* Row 1 */}
    {Array.from({ length: 16 }, (_, i) => (
      <rect key={`r1-${i}`} x={18 + i * 8} y="28" width="6" height="10" fill="#4B5320" opacity="0.4"/>
    ))}
    {/* Row 2 */}
    {Array.from({ length: 16 }, (_, i) => (
      <rect key={`r2-${i}`} x={18 + i * 8} y="44" width="6" height="10" fill="#4B5320" opacity="0.4"/>
    ))}

    {/* Sample text on LCD */}
    <text x="20" y="36" fill="#2E3B18" fontSize="7" fontFamily="monospace" opacity="0.6">Hello World!</text>
    <text x="20" y="52" fill="#2E3B18" fontSize="7" fontFamily="monospace" opacity="0.6">CircuitMind AI</text>

    {/* I2C backpack chip (if applicable) */}
    <rect x="5" y="65" width="20" height="10" fill="#1E1E1E" stroke="#333"/>
    <text x="15" y="72" fill="#444" fontSize="4" textAnchor="middle" fontFamily="monospace">I2C</text>

    {/* Contrast potentiometer */}
    <circle cx={width - 15} cy="68" r="5" fill="#1E1E1E" stroke="#555"/>
    <line x1={width - 15} y1="65" x2={width - 15} y2="68" stroke={COLORS.copper} strokeWidth="1.5"/>
    <text x={width - 15} y="78" fill={COLORS.subtleText} fontSize="4" textAnchor="middle">CONT</text>

    {/* Backlight LED indicator */}
    <circle cx="8" y="68" r="2" fill="#22C55E"/>
    <text x="8" y="78" fill={COLORS.subtleText} fontSize="4" textAnchor="middle">BL</text>

    {/* Pin header strip at bottom */}
    <rect x="30" y={height - 8} width={width - 60} height="6" fill="#1E1E1E" stroke="#333"/>

    {/* Module label */}
    <text x={width/2} y="14" fill={COLORS.white} fontSize="6" textAnchor="middle" fontFamily="sans-serif">LCD 1602 Module</text>
  </g>
);

/**
 * Breadboard - 830/400/170 Point Solderless Breadboard
 * Realistic with power rails, connection holes, and center divider
 */
const BreadboardDetails: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g className="pointer-events-none">
    {/* Top power rail (red +) */}
    <rect x="5" y="5" width={width - 10} height="12" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="0.5"/>
    <line x1="8" y1="8" x2={width - 8} y2="8" stroke="#EF4444" strokeWidth="2"/>
    <text x="10" y="14" fill="#DC2626" fontSize="8" fontWeight="bold">+</text>
    {/* Power rail holes - top */}
    {Array.from({ length: Math.floor((width - 20) / 8) }, (_, i) => (
      <circle key={`ptr-${i}`} cx={14 + i * 8} cy="11" r="1.5" fill="#333"/>
    ))}

    {/* Top ground rail (blue -) */}
    <rect x="5" y="18" width={width - 10} height="12" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.5"/>
    <line x1="8" y1="21" x2={width - 8} y2="21" stroke="#3B82F6" strokeWidth="2"/>
    <text x="10" y="27" fill="#2563EB" fontSize="8" fontWeight="bold">−</text>
    {/* Ground rail holes - top */}
    {Array.from({ length: Math.floor((width - 20) / 8) }, (_, i) => (
      <circle key={`pgr-${i}`} cx={14 + i * 8} cy="24" r="1.5" fill="#333"/>
    ))}

    {/* Main breadboard area - top half */}
    <rect x="5" y="32" width={width - 10} height="32" fill="#F5F5F4" stroke="#D6D3D1"/>
    {/* Connection holes - top section (5 rows) */}
    {Array.from({ length: 5 }, (_, row) => (
      <g key={`row-t-${row}`}>
        {Array.from({ length: Math.floor((width - 16) / 8) }, (_, col) => (
          <circle key={`ht-${row}-${col}`} cx={12 + col * 8} cy={38 + row * 6} r="1.2" fill="#333"/>
        ))}
      </g>
    ))}

    {/* Center divider channel */}
    <rect x="5" y="64" width={width - 10} height="8" fill="#E7E5E4" stroke="#D6D3D1"/>
    <line x1="8" y1="68" x2={width - 8} y2="68" stroke="#A8A29E" strokeDasharray="3,2"/>

    {/* Main breadboard area - bottom half */}
    <rect x="5" y="72" width={width - 10} height="32" fill="#F5F5F4" stroke="#D6D3D1"/>
    {/* Connection holes - bottom section (5 rows) */}
    {Array.from({ length: 5 }, (_, row) => (
      <g key={`row-b-${row}`}>
        {Array.from({ length: Math.floor((width - 16) / 8) }, (_, col) => (
          <circle key={`hb-${row}-${col}`} cx={12 + col * 8} cy={78 + row * 6} r="1.2" fill="#333"/>
        ))}
      </g>
    ))}

    {/* Bottom ground rail (blue -) */}
    <rect x="5" y={height - 29} width={width - 10} height="12" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.5"/>
    <line x1="8" y1={height - 26} x2={width - 8} y2={height - 26} stroke="#3B82F6" strokeWidth="2"/>
    <text x="10" y={height - 20} fill="#2563EB" fontSize="8" fontWeight="bold">−</text>

    {/* Bottom power rail (red +) */}
    <rect x="5" y={height - 16} width={width - 10} height="12" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="0.5"/>
    <line x1="8" y1={height - 13} x2={width - 8} y2={height - 13} stroke="#EF4444" strokeWidth="2"/>
    <text x="10" y={height - 7} fill="#DC2626" fontSize="8" fontWeight="bold">+</text>

    {/* Row labels */}
    <text x={width - 6} y="42" fill="#78716C" fontSize="5" textAnchor="end">A</text>
    <text x={width - 6} y="48" fill="#78716C" fontSize="5" textAnchor="end">B</text>
    <text x={width - 6} y="54" fill="#78716C" fontSize="5" textAnchor="end">C</text>
    <text x={width - 6} y="60" fill="#78716C" fontSize="5" textAnchor="end">D</text>
    <text x={width - 6} y="82" fill="#78716C" fontSize="5" textAnchor="end">E</text>
    <text x={width - 6} y="88" fill="#78716C" fontSize="5" textAnchor="end">F</text>
    <text x={width - 6} y="94" fill="#78716C" fontSize="5" textAnchor="end">G</text>
    <text x={width - 6} y="100" fill="#78716C" fontSize="5" textAnchor="end">H</text>
  </g>
);

const ActuatorDetails: React.FC = () => (
  <g className="pointer-events-none">
    {/* LED lens highlight */}
    <ellipse cx="25" cy="20" rx="10" ry="8" fill="white" opacity="0.3"/>
    {/* LED glow */}
    <circle cx="25" cy="30" r="8" fill={COLORS.ledRed} opacity="0.4"/>
    {/* Flat spot indicator (cathode) */}
    <line x1="12" y1="45" x2="12" y2="50" stroke="#666" strokeWidth="2"/>
    {/* Lead wires */}
    <rect x="16" y="55" width="3" height="20" fill={COLORS.legs}/>
    <rect x="31" y="55" width="3" height="20" fill={COLORS.legs}/>
  </g>
);

const PowerDetails: React.FC<{ width: number }> = ({ width: _width }) => (
  <g className="pointer-events-none">
    {/* Battery cells */}
    <rect x="10" y="12" width="25" height="26" fill="#1E1E1E" stroke="#22C55E" strokeWidth="1"/>
    <rect x="40" y="12" width="25" height="26" fill="#1E1E1E" stroke="#22C55E" strokeWidth="1"/>
    {/* Positive terminal */}
    <rect x="87" y="15" width="10" height="20" fill="#22C55E"/>
    {/* Polarity labels */}
    <text x="22" y="28" fill="#22C55E" fontSize="12" fontWeight="bold" textAnchor="middle">+</text>
    <text x="52" y="28" fill="#EF4444" fontSize="12" fontWeight="bold" textAnchor="middle">−</text>
  </g>
);

const ResistorDetails: React.FC = () => (
  <g className="pointer-events-none">
    {/* Lead wires */}
    <line x1="0" y1="15" x2="20" y2="15" stroke={COLORS.legs} strokeWidth="2"/>
    <line x1="80" y1="15" x2="100" y2="15" stroke={COLORS.legs} strokeWidth="2"/>
    {/* Color bands */}
    <rect x="25" y="7" width="5" height="16" fill="#DC2626"/>
    <rect x="35" y="7" width="5" height="16" fill="#7C3AED"/>
    <rect x="45" y="7" width="5" height="16" fill="#B45309"/>
    <rect x="60" y="7" width="5" height="16" fill="#D4AF37"/>
  </g>
);

const CapacitorDetails: React.FC = () => (
  <g className="pointer-events-none">
    {/* Polarity stripe */}
    <rect x="5" y="15" width="5" height="35" fill="#3B82F6" opacity="0.3"/>
    {/* Plus symbol */}
    <text x="8" y="12" fill="#3B82F6" fontSize="10" fontWeight="bold">+</text>
    {/* Value label */}
    <text x="20" y="38" fill={COLORS.subtleText} fontSize="7" fontFamily="monospace">100μF</text>
    {/* Lead wires */}
    <line x1="15" y1="50" x2="15" y2="60" stroke={COLORS.legs} strokeWidth="2"/>
    <line x1="25" y1="50" x2="25" y2="60" stroke={COLORS.legs} strokeWidth="2"/>
  </g>
);

const GenericDetails: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g className="pointer-events-none">
    {/* DIP chip body */}
    <rect x="8" y={height/2 - 10} width={width - 16} height="20" fill="#1E1E1E" stroke="#333"/>
    {/* Notch indicator */}
    <circle cx="16" cy={height/2} r="3" fill="#333"/>
    {/* Pin rows */}
    <rect x="0" y="20" width="3" height={height - 28} fill={COLORS.legs} opacity="0.5"/>
    <rect x={width - 3} y="20" width="3" height={height - 28} fill={COLORS.legs} opacity="0.5"/>
  </g>
);

/**
 * DiagramNode component - Fritzing-style realistic breadboard visuals.
 * Sharp corners, proper colors, professional design.
 */
const DiagramNode = memo<DiagramNodeProps>(function DiagramNode({
  component,
  position,
  isHovered,
  isSelected,
  highlight,
  onPointerDown,
  onSelect,
  onContextMenu,
  onDoubleClick,
  onPinPointerDown,
  onPinPointerUp,
  onMouseEnter,
  onMouseLeave,
  onPinEnter,
  onPinLeave,
}) {
  const isHighlighted = !!highlight;

  const shape = useMemo(() => getComponentShape(component.type, component.name), [component.type, component.name]);

  const pinPositions = useMemo(
    () => calculatePinPositions(shape, component.pins || []),
    [shape, component.pins]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => onPointerDown(e, component.id),
    [onPointerDown, component.id]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => onMouseEnter?.(e, component),
    [onMouseEnter, component]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => onMouseLeave?.(e, component),
    [onMouseLeave, component]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onSelect) onSelect(component.id);
    },
    [onSelect, component.id]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onContextMenu) onContextMenu(component.id, e.clientX, e.clientY);
    },
    [onContextMenu, component.id]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDoubleClick) onDoubleClick(component);
    },
    [onDoubleClick, component]
  );

  const { liveData } = useTelemetry();
  const hasActiveTelemetry = useMemo(() => {
    return Object.keys(liveData).some(key => key.startsWith(`${component.id}:`));
  }, [liveData, component.id]);

  const { result: simResult } = useSimulation();
  const hasLogicError = useMemo(() => {
    if (!simResult) return false;
    return Object.keys(simResult.pinStates).some(key => 
      key.startsWith(`${component.id}:`) && simResult.pinStates[key].logicState === 'ERROR'
    );
  }, [simResult, component.id]);

  const strokeColor = isHighlighted
    ? highlight.color
    : hasLogicError
      ? '#ef4444'
      : isSelected
        ? '#00F3FF'
        : isHovered
          ? '#00F3FF'
          : shape.stroke;

  const strokeWidth = isHighlighted ? 3 : isSelected ? 3 : isHovered ? 2.5 : shape.strokeWidth;

  // Render component-specific details based on shape type
  const renderDetails = () => {
    // Special part visuals
    if (component.name.toLowerCase().includes('breadboard')) {
        return <BreadboardVisual component={component} />;
    }

    switch (shape.type) {
      case 'resistor':
        return <ResistorDetails />;
      case 'capacitor':
        return <CapacitorDetails />;
      case 'arduino_uno':
        return <ArduinoUnoDetails width={shape.width} height={shape.height} />;
      case 'microcontroller':
        return <MicrocontrollerDetails width={shape.width} height={shape.height} />;
      case 'dht11':
        return <DHT11Details width={shape.width} height={shape.height} />;
      case 'lcd1602':
        return <LCD1602Details width={shape.width} height={shape.height} />;
      case 'breadboard':
        return <BreadboardDetails width={shape.width} height={shape.height} />;
      case 'sensor':
        return <SensorDetails width={shape.width} height={shape.height} />;
      case 'actuator':
        return <ActuatorDetails />;
      case 'power':
        return <PowerDetails width={shape.width} />;
      default:
        return <GenericDetails width={shape.width} height={shape.height} />;
    }
  };

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      className={`pointer-events-auto cursor-grab active:cursor-grabbing ${isHighlighted && highlight.pulse ? 'component-highlighted' : ''} ${hasActiveTelemetry ? 'telemetry-active' : ''} ${hasLogicError ? 'logic-error' : ''}`}
      style={
        isHighlighted
          ? ({ '--highlight-color': highlight.color } as React.CSSProperties)
          : undefined
      }
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect for highlighted/selected components */}
      {(isHighlighted || isSelected) && (
        <path
          d={shape.path}
          fill="none"
          stroke={isHighlighted ? highlight.color : '#00F3FF'}
          strokeWidth="6"
          opacity="0.4"
          className={isHighlighted && highlight.pulse ? 'animate-pulse' : ''}
          style={{ filter: `drop-shadow(0 0 8px ${isHighlighted ? highlight.color : '#00F3FF'})` }}
        />
      )}

      {/* Hover glow effect */}
      {isHovered && !isHighlighted && !isSelected && (
        <path
          d={shape.path}
          fill="none"
          stroke="#00F3FF"
          strokeWidth="4"
          opacity="0.3"
          style={{ filter: 'drop-shadow(0 0 6px #00F3FF)' }}
        />
      )}

      {/* Drop shadow for 3D depth (rendered behind component) */}
      <path
        d={shape.path}
        fill="rgba(0,0,0,0.3)"
        stroke="none"
        transform="translate(3, 4)"
        style={{ filter: 'blur(4px)' }}
        className="pointer-events-none"
      />

      {/* Component body - sharp corners with gradient fills */}
      <path
        d={shape.path}
        fill={shape.fill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className="transition-colors duration-150"
        style={{
          filter: isHovered ? 'brightness(1.1)' : undefined,
        }}
      />

      {/* Component details */}
      {renderDetails()}

      {/* Header bar (for components with headers) */}
      {shape.headerHeight > 0 && (
        <rect
          width={shape.width}
          height={shape.headerHeight}
          fill={shape.headerFill}
          className="pointer-events-none"
        />
      )}

      {/* Component name */}
      <text
        x="8"
        y={shape.headerHeight > 0 ? 16 : 12}
        fill={COLORS.white}
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        pointerEvents="none"
      >
        {component.name.length > 20 ? component.name.slice(0, 18) + '…' : component.name}
      </text>

      {/* Component type label */}
      <text
        x="8"
        y={shape.height - 6}
        fill={COLORS.subtleText}
        fontSize="8"
        fontFamily="monospace"
        pointerEvents="none"
      >
        {shape.type.toUpperCase()}
      </text>

      {/* Render pins */}
      {pinPositions.map((pinDef, index) => (
        <React.Fragment key={`pin-wrapper-${pinDef.name}-${index}`}>
          <Pin
            pin={pinDef.name}
            x={pinDef.x}
            y={pinDef.y}
            nodeId={component.id}
            isRightSide={pinDef.side === 'right'}
            shape={shape}
            onPointerDown={onPinPointerDown}
            onPointerUp={onPinPointerUp}
            onMouseEnter={onPinEnter}
            onMouseLeave={onPinLeave}
          />
          <TelemetryOverlay 
            pin={pinDef.name}
            componentId={component.id}
            x={pinDef.x}
            y={pinDef.y}
            isRightSide={pinDef.side === 'right'}
          />
          <PinStatusDot
            pin={pinDef.name}
            componentId={component.id}
            x={pinDef.x}
            y={pinDef.y}
          />
        </React.Fragment>
      ))}

      {/* Quantity badge */}
      {component.quantity && component.quantity > 1 && (
        <g transform={`translate(${shape.width - 8}, -8)`}>
          <rect x="-8" y="-8" width="16" height="16" fill="#0F172A" stroke={shape.stroke} strokeWidth="1.5" />
          <text textAnchor="middle" y="4" fill={COLORS.white} fontSize="10" fontWeight="bold">
            {component.quantity}
          </text>
        </g>
      )}
    </g>
  );
});

export default DiagramNode;
export { COMPONENT_WIDTH, COMPONENT_HEIGHT };
