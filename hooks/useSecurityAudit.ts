import { useEffect, useRef } from 'react';
import { securityAuditor } from '../services/securityAuditor';
import type { WiringDiagram } from '../types';
import type { HUDFragment } from '../contexts/HUDContext';

type HUDFragmentInput = Omit<HUDFragment, 'id'> & { id?: string };

interface UseSecurityAuditParams {
  diagram: WiringDiagram | null;
  addFragment: (fragment: HUDFragmentInput) => string;
  removeFragment: (id: string) => void;
}

export function useSecurityAudit({
  diagram,
  addFragment,
  removeFragment,
}: UseSecurityAuditParams): void {
  const activeSecurityFragments = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!diagram) return;

    const violations = securityAuditor.auditCircuitSafety(diagram);
    const criticals = violations.filter(
      (v) => v.severity === 'high' || v.severity === 'critical'
    );

    const currentBatch = new Set<string>();
    if (criticals.length > 0) {
      criticals.forEach((v) => {
        const fragId = `sec-warn-${v.location}`;
        currentBatch.add(fragId);
        addFragment({
          id: fragId,
          targetId: v.location,
          type: 'warning',
          content: `SAFETY RISK: ${v.message}`,
          position: { x: 50, y: 50 },
          priority: 1,
        });
        activeSecurityFragments.current.add(fragId);
      });
    }

    // Cleanup fragments that are no longer active
    activeSecurityFragments.current.forEach((id) => {
      if (!currentBatch.has(id)) {
        removeFragment(id);
        activeSecurityFragments.current.delete(id);
      }
    });
  }, [diagram, addFragment, removeFragment]);
}
