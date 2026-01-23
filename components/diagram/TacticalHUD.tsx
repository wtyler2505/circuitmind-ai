import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHUD } from '../../contexts/HUDContext';

/**
 * TacticalHUD component renders contextual information fragments near canvas elements.
 * Uses React Portals to render outside the SVG canvas for better styling/interaction.
 */
export const TacticalHUD: React.FC = () => {
  const { fragments, isVisible } = useHUD();

  if (!isVisible) return null;

  return createPortal(
    <div className="hud-container fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {fragments.map((fragment) => (
          <HUDItem key={fragment.id} fragment={fragment} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

interface HUDItemProps {
  fragment: import('../../contexts/HUDContext').HUDFragment;
}

const HUDItem: React.FC<HUDItemProps> = ({ fragment }) => {
  const { removeFragment } = useHUD();

  // Color mapping based on fragment type
  const typeStyles = useMemo(() => {
    switch (fragment.type) {
      case 'warning':
        return {
          border: 'border-amber-500/50',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
          label: '/// ALERT'
        };
      case 'tip':
        return {
          border: 'border-neon-green/50',
          text: 'text-neon-green',
          bg: 'bg-neon-green/10',
          glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
          label: '/// SUGGESTION'
        };
      case 'info':
      default:
        return {
          border: 'border-neon-cyan/50',
          text: 'text-neon-cyan',
          bg: 'bg-neon-cyan/10',
          glow: 'shadow-[0_0_10px_rgba(34,211,238,0.3)]',
          label: '/// DATA_SCAN'
        };
    }
  }, [fragment.type]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: fragment.position.x, y: fragment.position.y - 10 }}
      animate={{ opacity: 1, scale: 1, x: fragment.position.x, y: fragment.position.y }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className={`absolute left-0 top-0 pointer-events-auto`}
    >
      <div className={`
        panel-surface min-w-[140px] max-w-[240px] p-2
        ${typeStyles.border} ${typeStyles.glow} border-l-2
        relative group overflow-hidden
      `}>
        {/* Scanning line effect */}
        <motion.div 
          initial={{ top: '-100%' }}
          animate={{ top: '200%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className={`absolute left-0 right-0 h-px ${typeStyles.bg} brightness-150 z-10`}
        />

        <div className="flex flex-col gap-1">
          <div className={`text-[10px] font-bold tracking-widest ${typeStyles.text} opacity-70`}>
            {typeStyles.label}
          </div>
          <div className="text-[11px] leading-relaxed text-slate-100 font-medium">
            {fragment.content}
          </div>
        </div>

        {/* Action icons could go here */}
        <button 
          onClick={() => removeFragment(fragment.id)}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-white text-slate-400"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};
