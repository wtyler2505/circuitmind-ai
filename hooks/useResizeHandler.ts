/**
 * useResizeHandler Hook
 *
 * Handles mouse-drag and keyboard-based resizing for panels/sidebars.
 * Extracted from AssistantSidebar.tsx to reduce complexity.
 *
 * Features:
 * - Mouse drag resizing with clamping
 * - Keyboard resizing (Arrow keys, Home to reset)
 * - Double-click to reset to default
 * - Proper cleanup of event listeners
 */

import { useCallback, useRef } from 'react';

interface UseResizeHandlerOptions {
  /** Current width value */
  width: number;
  /** Callback to update width */
  onWidthChange: (width: number) => void;
  /** Minimum allowed width */
  minWidth: number;
  /** Maximum allowed width */
  maxWidth: number;
  /** Default width (for reset) */
  defaultWidth: number;
  /** Direction: 'left' means drag left edge, 'right' means drag right edge */
  direction?: 'left' | 'right';
}

interface UseResizeHandlerReturn {
  /** Handler for mousedown on resize handle */
  handleResizeStart: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Handler for keydown on resize handle */
  handleResizeKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Handler for double-click to reset width */
  handleResizeReset: () => void;
  /** Utility to clamp width within bounds */
  clampWidth: (value: number) => number;
}

export function useResizeHandler({
  width,
  onWidthChange,
  minWidth,
  maxWidth,
  defaultWidth,
  direction = 'left',
}: UseResizeHandlerOptions): UseResizeHandlerReturn {
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  const clampWidth = useCallback(
    (value: number) => Math.min(maxWidth, Math.max(minWidth, value)),
    [minWidth, maxWidth]
  );

  const handleResizeStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      resizeStartRef.current = { x: event.clientX, width };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeStartRef.current) return;

        const delta = resizeStartRef.current.x - moveEvent.clientX;
        // For left-edge resize (sidebar on right), moving left increases width
        // For right-edge resize (sidebar on left), moving right increases width
        const adjustment = direction === 'left' ? delta : -delta;
        const nextWidth = clampWidth(resizeStartRef.current.width + adjustment);
        onWidthChange(nextWidth);
      };

      const handleMouseUp = () => {
        resizeStartRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [width, onWidthChange, clampWidth, direction]
  );

  const handleResizeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step = event.shiftKey ? 40 : 16;

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          onWidthChange(clampWidth(width + step));
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onWidthChange(clampWidth(width - step));
          break;
        case 'Home':
          event.preventDefault();
          onWidthChange(clampWidth(defaultWidth));
          break;
      }
    },
    [width, defaultWidth, onWidthChange, clampWidth]
  );

  const handleResizeReset = useCallback(() => {
    onWidthChange(clampWidth(defaultWidth));
  }, [defaultWidth, onWidthChange, clampWidth]);

  return {
    handleResizeStart,
    handleResizeKeyDown,
    handleResizeReset,
    clampWidth,
  };
}

export default useResizeHandler;
