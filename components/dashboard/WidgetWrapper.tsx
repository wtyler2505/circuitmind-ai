import React from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

interface WidgetWrapperProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
}

export const WidgetWrapper = React.forwardRef<HTMLDivElement, WidgetWrapperProps>(({ 
  id, title, children, className, style, onMouseDown, onMouseUp, onTouchEnd 
}, ref) => {
  const { isEditMode, removeWidget } = useDashboard();

  return (
    <div
      ref={ref}
      style={style}
      className={`bg-slate-900/90 border border-white/10 cut-corner-md flex flex-col shadow-xl overflow-hidden group ${className}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
    >
      {/* Widget Header */}
      <div className={`px-3 py-1.5 border-b border-white/5 bg-slate-800/50 flex justify-between items-center ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
        
        {isEditMode && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeWidget(id);
            }}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
        
        {/* Edit Overlay */}
        {isEditMode && (
          <div className="absolute inset-0 bg-neon-cyan/5 border-2 border-dashed border-neon-cyan/20 pointer-events-none" />
        )}
      </div>
    </div>
  );
});
