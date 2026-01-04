import React, { ButtonHTMLAttributes, forwardRef } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // Enforce aria-label
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, icon, className = '', variant = 'ghost', size = 'md', ...props }, ref) => {
    // Base styles: centered, rounded, focus ring
    const baseStyles = 'inline-flex items-center justify-center rounded-md transition-colors focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Size variants
    // sm: 32px visual, but we rely on layout to handle spacing. 
    // Ideally for touch targets we want 44px. 
    // The audit requested min-44px. 
    // We will default to md (44px).
    const sizeStyles = {
      sm: 'w-8 h-8 p-1', // Note: Use with caution on touch devices
      md: 'w-11 h-11 p-2', // 44px target
      lg: 'w-12 h-12 p-2.5',
    };

    const variantStyles = {
      primary: 'bg-neon-cyan text-black hover:bg-white border border-neon-cyan/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]',
      secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
      ghost: 'text-slate-400 hover:text-neon-cyan hover:bg-white/5',
      danger: 'text-red-400 hover:text-red-300 hover:bg-red-900/20',
    };

    // Construct className
    const finalClassName = `
      ${baseStyles}
      ${sizeStyles[size] || sizeStyles.md}
      ${variantStyles[variant] || variantStyles.ghost}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={finalClassName}
        title={label}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default React.memo(IconButton);
