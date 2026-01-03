import { GoogleGenAI } from "@google/genai";

// =====================================
// Model Configurations
// =====================================
export const MODELS = {
  WIRING: 'gemini-3-pro-preview',
  CHAT: 'gemini-2.5-flash-lite-preview',
  VISION: 'gemini-3-pro-preview', // Pro for high detail
  IMAGE: 'gemini-3-pro-image-preview',
  VIDEO: 'veo-3.1-fast-generate-preview',
  THINKING: 'gemini-3-pro-preview',
  THUMBNAIL: 'gemini-3-pro-image-preview',
  // Specific internal usages
  SMART_FILL: 'gemini-2.5-pro',
  ASSIST_EDITOR: 'gemini-2.5-pro',
  AUTO_ID: 'gemini-2.5-flash',
  PART_FINDER: 'gemini-2.5-flash',
  SUGGEST_PROJECTS: 'gemini-2.5-flash',
  TTS: 'gemini-2.5-flash-preview-tts',
  AUDIO_TRANSCRIPTION: 'gemini-2.5-flash',
  EMBEDDING: 'text-embedding-004',
  CODE_GEN: 'gemini-2.5-pro',
  CONTEXT_CHAT_DEFAULT: 'gemini-2.5-flash',
  CONTEXT_CHAT_COMPLEX: 'gemini-2.5-pro'
};

// Get API key from localStorage or environment variable
export const getApiKey = (): string => {
  // Try localStorage first (user-configured)
  try {
    const stored = localStorage.getItem('cm_gemini_api_key');
    if (stored) return stored;
  } catch {
    // localStorage not available (SSR or error)
  }
  // Fall back to environment variable
  return process.env.API_KEY || '';
};

// Singleton instance
let aiClientInstance: GoogleGenAI | null = null;

// Initialize or get Gemini Client
export const getAIClient = (): GoogleGenAI => {
  if (!aiClientInstance) {
    const apiKey = getApiKey();
    // Allow empty key initialization, but methods will fail later if still empty
    aiClientInstance = new GoogleGenAI({ apiKey });
  }
  return aiClientInstance;
};

// Force reset if key changes
export const resetAIClient = () => {
  aiClientInstance = null;
};

// Global augmentation for AI Studio debugging
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export interface APIError extends Error {
    status?: number;
}
