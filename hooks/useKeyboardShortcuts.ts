import { useEffect } from 'react';

interface UseKeyboardShortcutsParams {
  hudIsVisible: boolean;
  setHudVisible: (visible: boolean) => void;
  isFocusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
  isDashboardVisible: boolean;
  setIsDashboardVisible: (visible: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toast: {
    info: (msg: string, duration?: number, action?: unknown, id?: string) => void;
  };
}

export function useKeyboardShortcuts({
  hudIsVisible,
  setHudVisible,
  isFocusMode,
  setFocusMode,
  isDashboardVisible,
  setIsDashboardVisible,
  isSearchOpen,
  setIsSearchOpen,
  toast,
}: UseKeyboardShortcutsParams): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      )
        return;

      if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }

      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setHudVisible(!hudIsVisible);
        toast.info(!hudIsVisible ? 'HUD ENABLED' : 'HUD DISABLED');
      }

      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setFocusMode(!isFocusMode);
        toast.info(!isFocusMode ? 'FOCUS MODE ON' : 'FOCUS MODE OFF');
      }

      if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsDashboardVisible(!isDashboardVisible);
        toast.info(!isDashboardVisible ? 'DASHBOARD VIEW' : 'CANVAS VIEW');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hudIsVisible,
    setHudVisible,
    isFocusMode,
    setFocusMode,
    isDashboardVisible,
    setIsDashboardVisible,
    isSearchOpen,
    setIsSearchOpen,
    toast,
  ]);
}
