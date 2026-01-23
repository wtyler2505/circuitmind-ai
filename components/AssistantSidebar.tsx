/**
 * AssistantSidebar Component
 *
 * Container wrapper for the AI assistant panel.
 * Refactored to use custom hooks for reduced complexity (CCN: 57 -> ~15).
 *
 * Features:
 * - Hover-to-open behavior (with delay on close)
 * - Click-outside-to-close (when unpinned)
 * - Resizable via drag handle (300-560px)
 * - Pin/unpin toggle
 * - Keyboard-accessible resize (arrow keys + Home)
 */

import React, { useRef, useCallback } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { useResizeHandler } from '../hooks/useResizeHandler';
import { useHoverBehavior } from '../hooks/useHoverBehavior';

interface AssistantSidebarProps {
  children: React.ReactNode;
}

const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 560;

const AssistantSidebar: React.FC<AssistantSidebarProps> = ({ children }) => {
  const {
    isAssistantOpen: isOpen,
    setAssistantOpen: onOpen,
    assistantPinned: isPinned,
    setAssistantPinned: onPinnedChange,
    assistantWidth: sidebarWidth,
    setAssistantWidth: onSidebarWidthChange,
    assistantDefaultWidth: defaultSidebarWidth,
  } = useLayout();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Derived callbacks
  const handleClose = useCallback(() => onOpen(false), [onOpen]);
  const handleOpen = useCallback(() => onOpen(true), [onOpen]);

  // Hook: Click outside to close (when unpinned and open)
  useClickOutside({
    ref: sidebarRef,
    ignoreRefs: [buttonRef],
    onClickOutside: handleClose,
    enabled: isOpen && !isPinned,
  });

  // Hook: Resize handling
  const { handleResizeStart, handleResizeKeyDown, handleResizeReset } =
    useResizeHandler({
      width: sidebarWidth,
      onWidthChange: onSidebarWidthChange,
      minWidth: MIN_SIDEBAR_WIDTH,
      maxWidth: MAX_SIDEBAR_WIDTH,
      defaultWidth: defaultSidebarWidth,
      direction: 'left',
    });

  // Hook: Hover behavior (open on hover, close on leave with delay)
  const { handleMouseEnter, handleMouseLeave } = useHoverBehavior({
    onOpen: handleOpen,
    onClose: handleClose,
    isPinned,
    closeDelay: 300,
    containerRefs: [sidebarRef, buttonRef],
  });

  // Toggle button click: pin/unpin
  const handleToggleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (isPinned) {
        onPinnedChange(false);
        handleClose();
      } else {
        onPinnedChange(true);
        handleOpen();
      }
    },
    [isPinned, onPinnedChange, handleClose, handleOpen]
  );

  return (
    <>
      {/* Toggle Button (right edge) */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden md:flex flex-col items-center justify-center fixed right-0 top-1/2 z-40 panel-toggle cut-corner-sm border-l border-y border-neon-cyan/30 h-12 w-10 text-neon-cyan transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
        style={{ transform: `translate(${isOpen ? -sidebarWidth : 0}px, -50%)` }}
        title={isPinned ? 'Unlock assistant' : 'AI assistant'}
        aria-label={isPinned ? 'Unlock assistant sidebar' : 'Open assistant sidebar'}
      >
        <img 
          src={`/assets/ui/${isPinned ? 'action-voice' : 'logo'}.png`} 
          alt="" 
          className={`w-5 h-5 transition-all ${isPinned ? 'animate-pulse' : 'group-hover:scale-110'}`}
          onError={(e) => (e.currentTarget.style.opacity = '0')}
        />
      </button>

      {/* Sidebar Panel */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="complementary"
        aria-label="AI assistant sidebar"
        className={`!fixed inset-y-0 right-0 w-[var(--assistant-width)] max-md:w-full panel-surface panel-rail panel-frame panel-carbon panel-flourish cut-corner-md border-l border-slate-800 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.8)]`}
        style={{ '--assistant-width': `${sidebarWidth}px` } as React.CSSProperties}
      >
        {/* Resize Handle */}
        <div
          className="group absolute left-0 top-0 hidden h-full w-1 cursor-ew-resize md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-amber/60"
          onMouseDown={handleResizeStart}
          onKeyDown={handleResizeKeyDown}
          onDoubleClick={handleResizeReset}
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          aria-label="Resize assistant sidebar"
          aria-valuemin={MIN_SIDEBAR_WIDTH}
          aria-valuemax={MAX_SIDEBAR_WIDTH}
          aria-valuenow={sidebarWidth}
          aria-valuetext={`${sidebarWidth}px`}
          title="Drag or use arrow keys to resize. Double-click to reset."
        >
          <div className="h-full w-full bg-neon-amber/0 hover:bg-neon-amber/50 transition-colors duration-200" />
        </div>
        {children}
      </div>
    </>
  );
};

export default React.memo(AssistantSidebar);
