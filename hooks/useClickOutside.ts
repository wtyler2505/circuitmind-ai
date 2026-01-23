/**
 * useClickOutside Hook
 *
 * Detects clicks outside specified elements and triggers a callback.
 * Extracted from AssistantSidebar.tsx to reduce complexity.
 *
 * Features:
 * - Safe Node type checking (instanceof guard)
 * - Multiple ref support (primary + ignore refs)
 * - Conditional enable/disable via `enabled` param
 */

import { useEffect, RefObject } from 'react';

interface UseClickOutsideOptions {
  /** Primary element ref - clicks outside this trigger callback */
  ref: RefObject<HTMLElement | null>;
  /** Optional refs to ignore (e.g., toggle button) */
  ignoreRefs?: RefObject<HTMLElement | null>[];
  /** Callback when click outside is detected */
  onClickOutside: () => void;
  /** Enable/disable the listener (default: true) */
  enabled?: boolean;
}

export function useClickOutside({
  ref,
  ignoreRefs = [],
  onClickOutside,
  enabled = true,
}: UseClickOutsideOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;

      // Guard: ensure target is a valid Node before calling contains()
      if (!(target instanceof Node)) return;

      // Check if click is inside primary ref
      if (ref.current?.contains(target)) return;

      // Check if click is inside any ignored refs
      for (const ignoreRef of ignoreRefs) {
        if (ignoreRef.current?.contains(target)) return;
      }

      // Click was outside - trigger callback
      onClickOutside();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, ignoreRefs, onClickOutside, enabled]);
}

export default useClickOutside;
