import { useEffect, useRef } from 'react';

interface UseNeuralLinkEffectsParams {
  neuralLinkEnabled: boolean;
  startNeuralLink: () => void;
  stopNeuralLink: () => void;
  isNeuralLinkActive: boolean;
  isNeuralLinkLoading: boolean;
  neuralLinkError: string | null;
  getCameraSnapshot: () => Promise<Blob | null>;
  registerVisualContextProvider: (key: string, fn: () => Promise<Blob | null>) => void;
  unregisterVisualContextProvider: (key: string) => void;
  toast: {
    info: (msg: string, duration?: number, action?: unknown, id?: string) => void;
    success: (msg: string, duration?: number, action?: unknown, id?: string) => void;
    error: (msg: string, duration?: number, action?: unknown, id?: string) => void;
    removeToast: (id: string) => void;
  };
}

export function useNeuralLinkEffects({
  neuralLinkEnabled,
  startNeuralLink,
  stopNeuralLink,
  isNeuralLinkActive,
  isNeuralLinkLoading,
  neuralLinkError,
  getCameraSnapshot,
  registerVisualContextProvider,
  unregisterVisualContextProvider,
  toast,
}: UseNeuralLinkEffectsParams): void {
  // Start/stop tracking based on enabled state
  useEffect(() => {
    if (neuralLinkEnabled) {
      startNeuralLink();
    } else {
      stopNeuralLink();
    }
  }, [neuralLinkEnabled, startNeuralLink, stopNeuralLink]);

  // Register camera visual context
  useEffect(() => {
    if (isNeuralLinkActive) {
      registerVisualContextProvider('camera', getCameraSnapshot);
    } else {
      unregisterVisualContextProvider('camera');
    }
    return () => unregisterVisualContextProvider('camera');
  }, [isNeuralLinkActive, getCameraSnapshot, registerVisualContextProvider, unregisterVisualContextProvider]);

  // Loading toast
  const loadingToastId = useRef<string | null>(null);
  useEffect(() => {
    if (isNeuralLinkLoading) {
      if (!loadingToastId.current) {
        loadingToastId.current = 'neural-link-loading';
        toast.info('Neural Link: Loading tracking engine...', 0, undefined, loadingToastId.current);
      }
    } else if (loadingToastId.current) {
      toast.removeToast(loadingToastId.current);
      toast.success('Neural Link: Ready', 2000, undefined, 'neural-link-ready');
      loadingToastId.current = null;
    }
  }, [isNeuralLinkLoading, toast]);

  // Error toast
  useEffect(() => {
    if (neuralLinkError) {
      toast.error(`Neural Link Error: ${neuralLinkError}`, 5000, undefined, 'neural-link-error');
    }
  }, [neuralLinkError, toast]);
}
