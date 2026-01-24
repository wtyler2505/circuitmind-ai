import { WiringDiagram, ElectronicComponent } from '../types';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityViolation {
  id: string;
  type: 'code_injection' | 'electrical_safety' | 'privacy_risk' | 'api_exposure';
  severity: Severity;
  location: string;
  message: string;
  remedy: string;
}

class SecurityAuditor {
  private blockedTokens = [
    'fetch', 'XMLHttpRequest', 'WebSocket', 'window.location', 
    'localStorage', 'sessionStorage', 'document.cookie', 
    'process.env', 'eval', 'Function', 'setTimeout', 'setInterval'
  ];

  /**
   * Scans generated code for potential injection or privacy risks.
   */
  scanAIGeneratedCode(code: string): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    
    this.blockedTokens.forEach(token => {
      if (code.includes(token)) {
        violations.push({
          id: `sec-${crypto.randomUUID().substring(0, 8)}`,
          type: 'code_injection',
          severity: 'critical',
          location: 'threeCode',
          message: `Forbidden token detected: "${token}"`,
          remedy: 'Remove external network or storage access from the 3D generation logic.'
        });
      }
    });

    return violations;
  }

  /**
   * Audits a wiring diagram for physical safety risks.
   */
  auditCircuitSafety(diagram: WiringDiagram | null): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    if (!diagram) return violations;

    // 1. Check for VCC-GND Short
    diagram.connections.forEach((conn, idx) => {
      const fromPin = conn.fromPin.toUpperCase();
      const toPin = conn.toPin.toUpperCase();
      
      const isPower = (p: string) => p === 'VCC' || p === '5V' || p === '3.3V' || p === 'VIN';
      const isGround = (p: string) => p === 'GND' || p === 'GROUND';

      if ((isPower(fromPin) && isGround(toPin)) || (isGround(fromPin) && isPower(toPin))) {
        violations.push({
          id: `elec-${idx}`,
          type: 'electrical_safety',
          severity: 'high',
          location: `Connection ${idx}`,
          message: 'Direct Short Circuit detected between Power and Ground.',
          remedy: 'Remove this connection immediately to prevent hardware damage.'
        });
      }
    });

    return violations;
  }
}

export const securityAuditor = new SecurityAuditor();
