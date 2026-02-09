import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, IdentificationResult } from './aiIdentifier.js';
import { calculateConfidence, emptyResult } from './aiIdentifier.js';

const VISION_MODEL = 'claude-sonnet-4-20250514';

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
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

export class ClaudeVisionProvider implements AIProvider {
  async identify(images: Buffer[], hints?: string): Promise<IdentificationResult> {
    try {
      const client = getClient();

      const imageContent = images.map((img) => ({
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: 'image/jpeg' as const,
          data: img.toString('base64'),
        },
      }));

      const prompt = hints
        ? `${IDENTIFY_PROMPT}\n\nAdditional context from user: ${hints}`
        : IDENTIFY_PROMPT;

      const response = await client.messages.create({
        model: VISION_MODEL,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [...imageContent, { type: 'text', text: prompt }],
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const text = textBlock && 'text' in textBlock ? textBlock.text : '';
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
      console.error('[claudeVision] identify error:', err);
      return emptyResult();
    }
  }

  async transcribe(audio: Buffer): Promise<string> {
    try {
      const client = getClient();

      // Claude doesn't natively support audio transcription,
      // so we describe the audio content as a fallback
      const response = await client.messages.create({
        model: VISION_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `The user has recorded a voice note describing an electronic component for inventory purposes. The audio is ${audio.length} bytes. Since direct audio transcription isn't available, please respond with an empty string.`,
              },
            ],
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      return textBlock && 'text' in textBlock ? textBlock.text.trim() : '';
    } catch (err) {
      console.error('[claudeVision] transcribe error:', err);
      return '';
    }
  }
}
