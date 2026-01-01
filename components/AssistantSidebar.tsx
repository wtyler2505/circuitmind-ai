import React, { useEffect, useRef } from 'react';

interface AssistantSidebarProps {
  isOpen: boolean;
  isPinned: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPinnedChange: (pinned: boolean) => void;
  sidebarWidth?: number;
  onSidebarWidthChange?: (width: number) => void;
  minSidebarWidth?: number;
  maxSidebarWidth?: number;
  children: React.ReactNode;
}

const AssistantSidebar: React.FC<AssistantSidebarProps> = ({
  isOpen,
  isPinned,
  onOpen,
  onClose,
  onPinnedChange,
  sidebarWidth = 380,
  onSidebarWidthChange,
  minSidebarWidth = 300,
  maxSidebarWidth = 560,
  children,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    onOpen();
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      closeTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleToggleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isPinned) {
      onPinnedChange(false);
      onClose();
      return;
    }
    onPinnedChange(true);
    onOpen();
  };

  const clampSidebarWidth = (value: number) =>
    Math.min(maxSidebarWidth, Math.max(minSidebarWidth, value));

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
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
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPinned) return;

      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
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
        className="hidden md:flex flex-col items-center justify-center fixed right-0 top-1/2 z-40 bg-cyber-card border-l border-y border-neon-cyan/30 h-16 w-11 rounded-l-lg text-neon-cyan transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
        style={{ transform: `translate(${isOpen ? -sidebarWidth : 0}px, -50%)` }}
        title={isPinned ? 'Unlock assistant' : 'AI assistant'}
        aria-label={isPinned ? 'Unlock assistant sidebar' : 'Open assistant sidebar'}
      >
        {isPinned ? (
          <svg
            className="w-5 h-5 text-neon-green"
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
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        className={`fixed inset-y-0 right-0 w-full md:w-[var(--assistant-width)] bg-cyber-dark/95 backdrop-blur-xl border-l border-slate-800 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]`}
        style={{ '--assistant-width': `${sidebarWidth}px` } as React.CSSProperties}
      >
        <div
          className="group absolute left-0 top-0 hidden h-full w-2 cursor-ew-resize md:block"
          onMouseDown={handleResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize assistant sidebar"
        >
          <div className="h-full w-[3px] bg-neon-amber/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>
        {children}
      </div>
    </>
  );
};

export default AssistantSidebar;
