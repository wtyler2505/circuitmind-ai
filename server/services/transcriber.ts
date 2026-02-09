import type { AIProvider } from './aiIdentifier.js';
import { GeminiVisionProvider } from './geminiVision.js';
import { ClaudeVisionProvider } from './claudeVision.js';

/**
 * Transcribes audio to text using the specified AI provider.
 * Defaults to Gemini (which has native audio support).
 */
export async function transcribeAudio(
  audio: Buffer,
  provider: 'gemini' | 'claude' = 'gemini'
): Promise<string> {
  const aiProvider: AIProvider =
    provider === 'claude' ? new ClaudeVisionProvider() : new GeminiVisionProvider();

  return aiProvider.transcribe(audio);
}
