import React, { memo } from 'react';

export type DiagramViewType = 'breadboard' | 'schematic' | 'pcb';

interface ViewSwitcherProps {
  currentView: DiagramViewType;
  onViewChange: (view: DiagramViewType) => void;
  disabled?: boolean;
}

const VIEW_OPTIONS: Array<{ value: DiagramViewType; label: string; shortcut: string }> = [
  { value: 'breadboard', label: 'Breadboard', shortcut: 'B' },
  { value: 'schematic', label: 'Schematic', shortcut: 'S' },
  { value: 'pcb', label: 'PCB', shortcut: 'P' },
];

/**
 * ViewSwitcher — Toolbar toggle for switching between breadboard, schematic,
 * and PCB diagram views. Styled with the cyberpunk neon theme.
 */
export const ViewSwitcher: React.FC<ViewSwitcherProps> = memo(function ViewSwitcher({
  currentView,
  onViewChange,
  disabled = false,
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-white/10 bg-gray-900/80 p-1 backdrop-blur-sm"
      role="radiogroup"
      aria-label="Diagram view"
    >
      {VIEW_OPTIONS.map(({ value, label, shortcut }) => {
        const isActive = currentView === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onViewChange(value)}
            title={`${label} view (${shortcut})`}
            className={`
              relative rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50
              disabled:cursor-not-allowed disabled:opacity-40
              ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }
            `}
          >
            {label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-cyan-400" />
            )}
          </button>
        );
      })}
    </div>
  );
});
