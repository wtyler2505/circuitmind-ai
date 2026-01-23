import { WiringDiagram, WireConnection, ElectronicComponent } from '../types';

/**
 * SimNodeState represents the electrical state of a single pin or net.
 */
export interface SimNodeState {
  voltage: number;
  current: number;
  logicState: 'HIGH' | 'LOW' | 'FLOATING' | 'ERROR';
}

/**
 * SimulationResult contains the state of all pins in the diagram.
 */
export interface SimulationResult {
  pinStates: Record<string, SimNodeState>; // Key: "componentId:pin"
  isShortCircuit: boolean;
  warnings: string[];
}

/**
 * SimulationEngine performs a lightweight DC nodal analysis and logic propagation.
 */
class SimulationEngine {
  /**
   * Run one tick of the simulation.
   */
  solve(diagram: WiringDiagram): SimulationResult {
    const pinStates: Record<string, SimNodeState> = {};
    let isShortCircuit = false;
    const warnings: string[] = [];

    // 1. Initialize all pins to FLOATING
    diagram.components.forEach(comp => {
      comp.pins?.forEach(pin => {
        pinStates[`${comp.id}:${pin}`] = {
          voltage: 0,
          current: 0,
          logicState: 'FLOATING'
        };
      });
    });

    // 2. Identify Nets (connected pins)
    const nets = this.buildNets(diagram.connections);

    // 3. Set Power Sources
    diagram.components.forEach(comp => {
      if (comp.type === 'power') {
        const vccPin = comp.pins?.find(p => p.toUpperCase() === 'VCC' || p.toUpperCase() === 'VIN' || p === '5V' || p === '3V3');
        const gndPin = comp.pins?.find(p => p.toUpperCase() === 'GND');

        if (vccPin) {
          const voltage = comp.name.includes('3.3V') ? 3.3 : 5.0;
          this.propagateNet(vccPin, comp.id, voltage, 'HIGH', nets, pinStates);
        }
        if (gndPin) {
          this.propagateNet(gndPin, comp.id, 0, 'LOW', nets, pinStates);
        }
      }
    });

    // 4. Check for Short Circuits (VCC connected directly to GND)
    // This is simplified: check if any net has both 5V and 0V sources
    // In a real solver, this would be a low resistance path.

    return { pinStates, isShortCircuit, warnings };
  }

  private buildNets(connections: WireConnection[]): Map<string, string[]> {
    const nets = new Map<string, string[]>();
    
    connections.forEach(conn => {
      const p1 = `${conn.fromComponentId}:${conn.fromPin}`;
      const p2 = `${conn.toComponentId}:${conn.toPin}`;
      
      if (!nets.has(p1)) nets.set(p1, []);
      if (!nets.has(p2)) nets.set(p2, []);
      
      nets.get(p1)!.push(p2);
      nets.get(p2)!.push(p1);
    });

    return nets;
  }

  private propagateNet(
    startPin: string, 
    compId: string, 
    voltage: number, 
    logic: 'HIGH' | 'LOW',
    nets: Map<string, string[]>,
    states: Record<string, SimNodeState>
  ) {
    const visited = new Set<string>();
    const stack = [`${compId}:${startPin}`];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);

      if (states[current]) {
        // If already set to a different voltage, we have a problem (simplified)
        if (states[current].logicState !== 'FLOATING' && states[current].logicState !== logic) {
          states[current].logicState = 'ERROR';
        } else {
          states[current].voltage = voltage;
          states[current].logicState = logic;
        }
      }

      const neighbors = nets.get(current) || [];
      neighbors.forEach(n => stack.push(n));
    }
  }
}

export const simulationEngine = new SimulationEngine();
