import { WiringDiagram } from '../types';
import { getAIClient, MODELS } from './gemini/client';

export interface VisionErrorReport {
  type: 'mismatch' | 'missing' | 'potential_short' | 'neatness';
  severity: 'low' | 'medium' | 'high';
  componentId?: string;
  pinName?: string;
  description: string;
  remedy: string;
}

class VisionAnalysisService {
  /**
   * Captures a frame from the provided video element.
   */
  async captureBenchSnapshot(video: HTMLVideoElement): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    ctx.drawImage(video, 0, 0);
    // Resize/Compress for Gemini (Max 4MB is safe, 1024-2048px)
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1]; // Base64 without prefix
  }

  /**
   * Compares a physical bench photo to the digital wiring diagram.
   */
  async compareRealityToPlan(base64Image: string, diagram: WiringDiagram): Promise<VisionErrorReport[]> {
    const ai = getAIClient();

    const prompt = `
      You are an expert electronics quality assurance engineer.
      Compare this photo of a physical breadboard circuit to the provided digital wiring diagram (JSON).
      
      Digital Ground Truth:
      ${JSON.stringify(diagram, null, 2)}

      Identify any mismatches:
      1. Missing components.
      2. Incorrect pin connections (off-by-one, swapped wires).
      3. Potential short circuits.
      4. Wiring neatness issues.

      Return a JSON array of errors:
      [{
        "type": "mismatch" | "missing" | "potential_short" | "neatness",
        "severity": "low" | "medium" | "high",
        "componentId": "string (optional)",
        "pinName": "string (optional)",
        "description": "string",
        "remedy": "string"
      }]
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODELS.CONTEXT_CHAT_COMPLEX,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
              { text: prompt }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error('Vision analysis failed', e);
      return [];
    }
  }
}

export const visionAnalysisService = new VisionAnalysisService();
