/**
 * Tests for REQ-95: UI Enrichment — PinTooltip, Wire visualization, SimControls MNA stats.
 *
 * Tests the formatting utilities and component rendering with mocked simulation data.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { formatVoltage, formatCurrent } from '../diagram/PinTooltip';

// ---------------------------------------------------------------------------
// Mock contexts used by components under test
// ---------------------------------------------------------------------------

const mockSimulationResult = {
  pinStates: {
    'comp1:VCC': { voltage: 5.0, current: 0.02, logicState: 'HIGH' as const },
    'comp1:GND': { voltage: 0, current: 0.02, logicState: 'LOW' as const },
    'comp2:A0': { voltage: 2.5, current: 0.001, logicState: 'FLOATING' as const },
  },
  isShortCircuit: false,
  warnings: [],
  nodeVoltages: { 0: 0, 1: 5.0, 2: 2.5 },
  branchCurrents: { comp1: 0.02, comp2: 0.001 },
  powerDissipation: { comp1: 0.1, comp2: 0.0025 },
  errors: [],
  usedMNA: true,
  totalPower: 0.1025,
  nodeCount: 3,
};

let mockIsSimulating = true;
let mockIsSolving = false;
let mockResult: typeof mockSimulationResult | null = mockSimulationResult;

vi.mock('../../contexts/SimulationContext', () => ({
  useSimulation: () => ({
    result: mockResult,
    isSimulating: mockIsSimulating,
    isSolving: mockIsSolving,
    setSimulating: vi.fn(),
    runTick: vi.fn(),
  }),
}));

vi.mock('../../contexts/LayoutContext', () => ({
  useLayout: () => ({
    activeMode: 'debug',
  }),
}));

// ---------------------------------------------------------------------------
// formatVoltage tests
// ---------------------------------------------------------------------------

describe('formatVoltage', () => {
  it('formats zero', () => {
    expect(formatVoltage(0)).toBe('0 V');
  });

  it('formats millivolts', () => {
    expect(formatVoltage(0.005)).toBe('5.0 mV');
  });

  it('formats normal voltages', () => {
    expect(formatVoltage(5.0)).toBe('5.000 V');
    expect(formatVoltage(3.3)).toBe('3.300 V');
  });

  it('formats kilovolts', () => {
    expect(formatVoltage(1200)).toBe('1.20 kV');
  });

  it('handles negative voltages', () => {
    expect(formatVoltage(-12)).toBe('-12.000 V');
  });
});

// ---------------------------------------------------------------------------
// formatCurrent tests
// ---------------------------------------------------------------------------

describe('formatCurrent', () => {
  it('formats zero', () => {
    expect(formatCurrent(0)).toBe('0 A');
  });

  it('formats nanoamps', () => {
    expect(formatCurrent(0.0000005)).toBe('500.0 nA');
  });

  it('formats microamps', () => {
    expect(formatCurrent(0.00015)).toBe('150.0 µA');
  });

  it('formats milliamps', () => {
    expect(formatCurrent(0.02)).toBe('20.00 mA');
  });

  it('formats amps', () => {
    expect(formatCurrent(1.5)).toBe('1.500 A');
  });
});

// ---------------------------------------------------------------------------
// SimControls tests
// ---------------------------------------------------------------------------

describe('SimControls', () => {
  beforeEach(() => {
    mockIsSimulating = true;
    mockIsSolving = false;
    mockResult = mockSimulationResult;
  });

  it('renders MNA solver badge when MNA result present', async () => {
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    expect(screen.getByText('MNA')).toBeInTheDocument();
  });

  it('renders node count from MNA result', async () => {
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders total power', async () => {
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    expect(screen.getByText('102.5 mW')).toBeInTheDocument();
  });

  it('shows WORKER indicator when isSolving', async () => {
    mockIsSolving = true;
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    expect(screen.getByText('WORKER')).toBeInTheDocument();
  });

  it('shows LOGIC solver when non-MNA result', async () => {
    mockResult = {
      ...mockSimulationResult,
      usedMNA: false,
    } as typeof mockSimulationResult;
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    expect(screen.getByText('LOGIC')).toBeInTheDocument();
  });

  it('shows NOMINAL when no short circuit', async () => {
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    expect(screen.getByText('NOMINAL')).toBeInTheDocument();
  });

  it('shows FAULT when short circuit detected', async () => {
    mockResult = {
      ...mockSimulationResult,
      isShortCircuit: true,
    };
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    expect(screen.getByText('!! FAULT !!')).toBeInTheDocument();
  });

  it('has accessible region role', async () => {
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    expect(screen.getByRole('region', { name: 'Simulation controls' })).toBeInTheDocument();
  });

  it('has aria-pressed on toggle button', async () => {
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    const button = screen.getByTitle('Cut Virtual Power');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows error count when errors exist', async () => {
    mockResult = {
      ...mockSimulationResult,
      errors: [
        { type: 'overcurrent' as const, message: 'test', severity: 'error' as const, affectedComponentIds: [] },
      ],
    };
    const { SimControls } = await import('../layout/SimControls');
    render(<SimControls />);
    expect(screen.getByText('Errors', { exact: false })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PinTooltip format edge cases
// ---------------------------------------------------------------------------

describe('format edge cases', () => {
  it('formatVoltage near-zero', () => {
    expect(formatVoltage(0.0001)).toBe('0 V');
  });

  it('formatCurrent near-zero', () => {
    expect(formatCurrent(1e-10)).toBe('0 A');
  });
});
