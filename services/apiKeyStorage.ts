/**
 * API Key Storage Utilities
 * Handles localStorage operations for Gemini API key
 */

const STORAGE_KEY = 'cm_gemini_api_key';

export const getStoredApiKey = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredApiKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
      // Verify the save worked
      const verified = localStorage.getItem(STORAGE_KEY);
      if (verified !== key.trim()) {
        console.error('API key save verification failed');
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to store API key:', e);
  }
};
