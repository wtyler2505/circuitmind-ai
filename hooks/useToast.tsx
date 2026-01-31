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

// ============================================
// Contexts
// ============================================

const ToastStateContext = createContext<Toast[]>([]);
const ToastApiContext = createContext<{
  addToast: (type: ToastType, message: string, duration?: number, action?: ToastAction, id?: string) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number, action?: ToastAction, id?: string) => string;
  error: (message: string, duration?: number, action?: ToastAction, id?: string) => string;
  warning: (message: string, duration?: number, action?: ToastAction, id?: string) => string;
  info: (message: string, duration?: number, action?: ToastAction, id?: string) => string;
} | null>(null);

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
    (type: ToastType, message: string, duration = 4000, action?: ToastAction, manualId?: string) => {
      const id = manualId || `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: Toast = { id, type, message, duration, action };

      setToasts(prev => {
        if (prev.some(t => t.id === id)) return prev;
        return [...prev, toast];
      });

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback((msg: string, dur?: number, act?: ToastAction, id?: string) => addToast('success', msg, dur, act, id), [addToast]);
  const error = useCallback((msg: string, dur?: number, act?: ToastAction, id?: string) => addToast('error', msg, dur ?? 6000, act, id), [addToast]);
  const warning = useCallback((msg: string, dur?: number, act?: ToastAction, id?: string) => addToast('warning', msg, dur ?? 5000, act, id), [addToast]);
  const info = useCallback((msg: string, dur?: number, act?: ToastAction, id?: string) => addToast('info', msg, dur, act, id), [addToast]);

  const api = React.useMemo(() => ({
    addToast, removeToast, success, error, warning, info
  }), [addToast, removeToast, success, error, warning, info]);

  return (
    <ToastStateContext.Provider value={toasts}>
      <ToastApiContext.Provider value={api}>
        {children}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </ToastApiContext.Provider>
    </ToastStateContext.Provider>
  );
}

// ============================================
// Hooks
// ============================================

/**
 * Hook for components that only need to trigger toasts.
 * Returns a stable API that won't trigger re-renders when toasts change.
 */
export function useToastApi() {
  const api = useContext(ToastApiContext);
  if (!api) {
    throw new Error('useToastApi must be used within a ToastProvider');
  }
  return api;
}

/**
 * Hook for components that need to display the list of toasts.
 */
export function useToasts() {
  return useContext(ToastStateContext);
}

/**
 * Legacy hook for backward compatibility. 
 * NOTE: Using this in useEffect dependencies will cause infinite loops 
 * if any toast is added/removed. Use useToastApi() instead.
 */
export function useToast() {
  const toasts = useToasts();
  const api = useToastApi();
  
  return React.useMemo(() => ({
    toasts,
    ...api
  }), [toasts, api]);
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
