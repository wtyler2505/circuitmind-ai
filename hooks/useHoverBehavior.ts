/**
 * useHoverBehavior Hook
 *
 * Manages hover-to-open/close behavior with debounced closing.
 * Extracted from AssistantSidebar.tsx to reduce complexity.
 *
 * Features:
 * - Opens on hover (immediate)
 * - Closes on leave with configurable delay
 * - Cancels close if re-hovering within delay
 * - Respects "pinned" state (prevents auto-close)
 * - Safe Node type checking for related target
 */

import { useCallback, useRef, useEffect, RefObject } from 'react';

interface UseHoverBehaviorOptions {
  /** Callback to open the element */
  onOpen: () => void;
  /** Callback to close the element */
  onClose: () => void;
  /** If true, auto-close is disabled */
  isPinned: boolean;
  /** Delay before closing (ms) */
  closeDelay?: number;
  /** Refs whose hover should be considered "inside" */
  containerRefs?: RefObject<HTMLElement | null>[];
}

interface UseHoverBehaviorReturn {
  /** Handler for mouseenter events */
  handleMouseEnter: () => void;
  /** Handler for mouseleave events */
  handleMouseLeave: (event: React.MouseEvent) => void;
}

export function useHoverBehavior({
  onOpen,
  onClose,
  isPinned,
  closeDelay = 300,
  containerRefs = [],
}: UseHoverBehaviorOptions): UseHoverBehaviorReturn {
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    // Cancel any pending close
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    onOpen();
  }, [onOpen]);

  const handleMouseLeave = useCallback(
    (event: React.MouseEvent) => {
      const nextTarget = event.relatedTarget;

      // Check if moving to another tracked container (safe Node check)
      if (nextTarget instanceof Node) {
        for (const ref of containerRefs) {
          if (ref.current?.contains(nextTarget)) {
            return; // Still inside, don't close
          }
        }
      }

      // Clear any existing timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      // If pinned, don't auto-close
      if (isPinned) return;

      // Schedule close with delay
      closeTimeoutRef.current = setTimeout(() => {
        onClose();
      }, closeDelay);
    },
    [isPinned, onClose, closeDelay, containerRefs]
  );

  return {
    handleMouseEnter,
    handleMouseLeave,
  };
}

export default useHoverBehavior;
