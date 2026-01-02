/**
 * Toast Notification System
 *
 * Lightweight toast notifications replacing browser alert() calls.
 * Matches the app's dark theme aesthetic.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================
// Types
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number, action?: ToastAction) => string;
  removeToast: (id: string) => void;
  // Convenience methods
  success: (message: string, duration?: number, action?: ToastAction) => string;
  error: (message: string, duration?: number, action?: ToastAction) => string;
  warning: (message: string, duration?: number, action?: ToastAction) => string;
  info: (message: string, duration?: number, action?: ToastAction) => string;
}

// ============================================
// Context
// ============================================

const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000, action?: ToastAction) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: Toast = { id, type, message, duration, action };

      setToasts(prev => [...prev, toast]);

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  // Convenience methods
  const success = useCallback(
    (msg: string, dur?: number, action?: ToastAction) => addToast('success', msg, dur, action),
    [addToast]
  );
  const error = useCallback(
    (msg: string, dur?: number, action?: ToastAction) =>
      addToast('error', msg, dur ?? 6000, action),
    [addToast]
  );
  const warning = useCallback(
    (msg: string, dur?: number, action?: ToastAction) =>
      addToast('warning', msg, dur ?? 5000, action),
    [addToast]
  );
  const info = useCallback(
    (msg: string, dur?: number, action?: ToastAction) => addToast('info', msg, dur, action),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ============================================
// Toast Container Component
// ============================================

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ============================================
// Individual Toast Component
// ============================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-950/90',
    border: 'border-green-700',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-950/90',
    border: 'border-red-700',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-950/90',
    border: 'border-yellow-700',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-950/90',
    border: 'border-blue-700',
    icon: 'ℹ',
  },
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const style = TOAST_STYLES[toast.type];

  return (
    <div
      className={`
        ${style.bg} ${style.border}
        border px-4 py-3 cut-corner-sm
        shadow-lg backdrop-blur-sm
        animate-slide-in-right
        flex items-start gap-3
        text-sm text-gray-100
      `}
      role="alert"
    >
      <span className="text-lg leading-none mt-0.5">{style.icon}</span>
      <p className="flex-1 leading-snug">{toast.message}</p>
      {toast.action && (
        <button
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
          className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neon-cyan hover:text-white transition-colors"
          aria-label={toast.action.label}
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-white transition-colors ml-2"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export default useToast;
