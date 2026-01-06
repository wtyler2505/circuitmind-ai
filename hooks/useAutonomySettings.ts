import { useCallback, useState } from 'react';
import { ActionType, ACTION_SAFETY, AIAutonomySettings } from '../types';

const STORAGE_KEY = 'cm_ai_autonomy';

const getStoredSettings = (): AIAutonomySettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore errors
  }
  return {
    autoExecuteSafeActions: true,
    customSafeActions: [],
    customUnsafeActions: [],
  };
};

const saveSettings = (settings: AIAutonomySettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    console.error('Failed to save autonomy settings');
  }
};

// Exported for backwards compatibility
export const saveAutonomySettings = saveSettings;

export function useAutonomySettings() {
  const [settings, setSettings] = useState<AIAutonomySettings>(getStoredSettings);

  const updateSettings = useCallback((updates: Partial<AIAutonomySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const isActionSafe = useCallback((actionType: ActionType): boolean => {
    if (settings.customSafeActions.includes(actionType)) return true;
    if (settings.customUnsafeActions.includes(actionType)) return false;
    return ACTION_SAFETY[actionType] ?? false;
  }, [settings]);

  return {
    autonomySettings: settings,
    updateAutonomySettings: updateSettings,
    isActionSafe,
  };
}
