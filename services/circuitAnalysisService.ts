import { WiringDiagram } from "../types";

export interface CircuitIssue {
  severity: 'critical' | 'warning' | 'info';
  componentId?: string;
  message: string;
  recommendation?: string;
}

export interface CircuitAnalysisReport {
  isValid: boolean;
  issues: CircuitIssue[];
  metrics: {
    componentCount: number;
    connectionCount: number;
    powerNets: number;
    estimatedCost?: number; // Placeholder
  };
}

/**
 * Rule-based circuit analyzer
 */
export const circuitAnalysisService = {
  
  analyze: (diagram: WiringDiagram): CircuitAnalysisReport => {
    const issues: CircuitIssue[] = [];
    const components = diagram.components;
    const connections = diagram.connections;

    // 1. Basic Connectivity Checks
    const connectedPinMap = new Map<string, Set<string>>(); // ComponentID -> Set of connected pins
    
    connections.forEach(conn => {
       if (!connectedPinMap.has(conn.fromComponentId)) connectedPinMap.set(conn.fromComponentId, new Set());
       if (!connectedPinMap.has(conn.toComponentId)) connectedPinMap.set(conn.toComponentId, new Set());
       
       connectedPinMap.get(conn.fromComponentId)?.add(conn.fromPin);
       connectedPinMap.get(conn.toComponentId)?.add(conn.toPin);
    });

    // Check for floating components
    components.forEach(comp => {
      const connectedPins = connectedPinMap.get(comp.id);
      if (!connectedPins || connectedPins.size === 0) {
        issues.push({
          severity: 'warning',
          componentId: comp.id,
          message: `Component '${comp.name}' is completely unconnected.`,
          recommendation: 'Verify connections or remove if unused.'
        });
      } else {
          // Check for specific unconnected pins on critical components
          if (comp.type === 'microcontroller' && (!connectedPins.has('GND') && !connectedPins.has('VCC') && !connectedPins.has('VIN'))) {
             issues.push({
               severity: 'critical',
               componentId: comp.id,
               message: `Microcontroller '${comp.name}' seems to lack power connections (VCC/GND).`,
               recommendation: 'Connect VCC and GND pins.'
             });
          }
      }
    });

    // 2. Power Supply Check
    const powerSources = components.filter(c => c.type === 'power' || c.name.toLowerCase().includes('battery') || c.name.toLowerCase().includes('supply'));
    if (powerSources.length === 0) {
      issues.push({
        severity: 'critical',
        message: 'No identifiable power source found in the circuit.',
        recommendation: 'Add a Battery, USB input, or Power Supply component.'
      });
    }

    // 3. Voltage Logic Compatibility (Heuristic)
    const has3v3 = components.some(c => c.description?.includes('3.3V') || c.name.includes('ESP32') || c.name.includes('RP2040'));
    const has5v = components.some(c => c.description?.includes('5V') || c.name.includes('Arduino Uno') || c.name.includes('Relay'));
    
    if (has3v3 && has5v) {
      issues.push({
        severity: 'warning',
        message: 'Mixed voltage levels detected (3.3V and 5V).',
        recommendation: 'Ensure logic level shifters are used for data lines between mixed-voltage components.'
      });
    }

    // 4. LED Current Limiting (Heuristic)
    const leds = components.filter(c => c.type === 'actuator' && c.name.toLowerCase().includes('led'));
    const resistors = components.filter(c => c.name.toLowerCase().includes('resistor'));
    
    // Very naive check: if LEDs exist but no resistors, warn. 
    // Ideally we check if the LED net includes a resistor.
    if (leds.length > 0 && resistors.length === 0) {
         issues.push({
            severity: 'warning',
            message: 'LEDs detected but no resistors found.',
            recommendation: 'Ensure all LEDs have current-limiting resistors to prevent burnout.'
         });
    }

    return {
      isValid: issues.filter(i => i.severity === 'critical').length === 0,
      issues,
      metrics: {
        componentCount: components.length,
        connectionCount: connections.length,
        powerNets: powerSources.length
      }
    };
  }
};
