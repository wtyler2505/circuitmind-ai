import React, { useEffect, useRef, useCallback } from 'react';
import { useLayout } from '../contexts/LayoutContext';

interface AssistantSidebarProps {
  children: React.ReactNode;
}

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

  // Derived
  const onClose = useCallback(() => onOpen(false), [onOpen]);
  const onSidebarOpen = useCallback(() => onOpen(true), [onOpen]);

  const minSidebarWidth = 300;
  const maxSidebarWidth = 560;

  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    onSidebarOpen();
  }, [onSidebarOpen]);

  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    const nextTarget = event.relatedTarget;
    // Check if nextTarget is a valid Node before calling contains
    if (
      nextTarget instanceof Node &&
      (sidebarRef.current?.contains(nextTarget) || buttonRef.current?.contains(nextTarget))
    ) {
      return;
    }
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    if (!isPinned) {
      closeTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 300);
    }
  }, [isPinned, onClose]);

  const handleToggleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (isPinned) {
      onPinnedChange(false);
      onClose();
      return;
    }
    onPinnedChange(true);
    onSidebarOpen();
  }, [isPinned, onPinnedChange, onClose, onSidebarOpen]);

  const clampSidebarWidth = useCallback((value: number) =>
    Math.min(maxSidebarWidth, Math.max(minSidebarWidth, value)), []);

  const handleResizeStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!onSidebarWidthChange) return;
    event.preventDefault();
    resizeStartRef.current = { x: event.clientX, width: sidebarWidth };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const nextWidth = clampSidebarWidth(
        resizeStartRef.current.width + (resizeStartRef.current.x - moveEvent.clientX)
      );
      onSidebarWidthChange(nextWidth);
    };

    const handleMouseUp = () => {
      resizeStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onSidebarWidthChange, sidebarWidth, clampSidebarWidth]);

  const handleResizeKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onSidebarWidthChange) return;
    const step = event.shiftKey ? 40 : 16;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onSidebarWidthChange(clampSidebarWidth(sidebarWidth + step));
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onSidebarWidthChange(clampSidebarWidth(sidebarWidth - step));
    }
    if (event.key === 'Home') {
      event.preventDefault();
      onSidebarWidthChange(clampSidebarWidth(defaultSidebarWidth));
    }
  }, [onSidebarWidthChange, sidebarWidth, defaultSidebarWidth, clampSidebarWidth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPinned) return;

      const target = event.target;
      if (!(target instanceof Node)) return;

      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isOpen, isPinned, onClose]);

  return (
    <>
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
        {isPinned ? (
          <svg
            className="w-4 h-4 text-neon-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h6m-7 6l4-2 4 2 4-2 4 2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12z"
            />
          </svg>
        )}
      </button>

      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="complementary"
        aria-label="AI assistant sidebar"
        className={`!fixed inset-y-0 right-0 w-[var(--assistant-width)] max-md:w-full panel-surface panel-rail panel-frame panel-carbon cut-corner-md border-l border-slate-800 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.8)]`}
        style={{ '--assistant-width': `${sidebarWidth}px` } as React.CSSProperties}
      >
        <div
          className="group absolute left-0 top-0 hidden h-full w-1 cursor-ew-resize md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-amber/60"
          onMouseDown={handleResizeStart}
          onKeyDown={handleResizeKeyDown}
          onDoubleClick={() => onSidebarWidthChange?.(clampSidebarWidth(defaultSidebarWidth))}
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          aria-label="Resize assistant sidebar"
          aria-valuemin={minSidebarWidth}
          aria-valuemax={maxSidebarWidth}
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