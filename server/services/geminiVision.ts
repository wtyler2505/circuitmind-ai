import { GoogleGenAI } from '@google/genai';
import type { AIProvider, IdentificationResult } from './aiIdentifier.js';
import { calculateConfidence, emptyResult } from './aiIdentifier.js';

const VISION_MODEL = 'gemini-2.5-pro';
const FLASH_MODEL = 'gemini-2.5-flash';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({ apiKey });
}

const IDENTIFY_PROMPT = `You are an expert electronics engineer. Analyze the provided image(s) of an electronic component and identify it.

Return a JSON object with exactly these fields:
{
  "name": "Full component name (e.g., 'ATmega328P Microcontroller')",
  "type": "One of: microcontroller, sensor, actuator, power, other",
  "description": "Brief description of what this component does",
  "manufacturer": "Manufacturer name if identifiable",
  "mpn": "Manufacturer Part Number if visible",
  "packageType": "Package type (e.g., DIP-28, QFP-44, SOT-23, 0805)",
  "pins": ["Array of pin names/functions if identifiable"],
  "specs": {"key": "value pairs for specifications like voltage, current, frequency"}
}

Be as accurate as possible. If you cannot determine a field, use an empty string or empty array/object.
Only return valid JSON, no markdown formatting.`;

export class GeminiVisionProvider implements AIProvider {
  async identify(images: Buffer[], hints?: string): Promise<IdentificationResult> {
    try {
      const client = getClient();

      const imageParts = images.map((img) => ({
        inlineData: {
          mimeType: 'image/jpeg' as const,
          data: img.toString('base64'),
        },
      }));

      const prompt = hints
        ? `${IDENTIFY_PROMPT}\n\nAdditional context from user: ${hints}`
        : IDENTIFY_PROMPT;

      const response = await client.models.generateContent({
        model: VISION_MODEL,
        contents: [
          {
            role: 'user',
            parts: [...imageParts, { text: prompt }],
          },
        ],
      });

      const text = response.text ?? '';
      // Strip markdown code fences if present
      const jsonStr = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      const result: IdentificationResult = {
        name: parsed.name || 'Unknown Component',
        type: parsed.type || 'other',
        description: parsed.description || '',
        manufacturer: parsed.manufacturer || '',
        mpn: parsed.mpn || '',
        packageType: parsed.packageType || '',
        pins: Array.isArray(parsed.pins) ? parsed.pins : [],
        specs: typeof parsed.specs === 'object' && parsed.specs ? parsed.specs : {},
        confidence: 0,
      };

      result.confidence = calculateConfidence(result);
      return result;
    } catch (err) {
      console.error('[geminiVision] identify error:', err);
      return emptyResult();
    }
  }

  async transcribe(audio: Buffer): Promise<string> {
    try {
      const client = getClient();

      const response = await client.models.generateContent({
        model: FLASH_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'audio/webm',
                  data: audio.toString('base64'),
                },
              },
              {
                text: 'Transcribe this audio recording. The speaker is describing an electronic component for inventory purposes. Return only the transcription text, nothing else.',
              },
            ],
          },
        ],
      });

      return response.text?.trim() ?? '';
    } catch (err) {
      console.error('[geminiVision] transcribe error:', err);
      return '';
    }
  }
}
