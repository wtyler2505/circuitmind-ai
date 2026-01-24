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
    const model = ai.getGenerativeModel({ 
      model: MODELS.CONTEXT_CHAT_COMPLEX, // Gemini 2.5 Pro Vision
      generationConfig: { responseMimeType: "application/json" }
    });

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
      const result = await model.generateContent([
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        prompt
      ]);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (e) {
      console.error('Vision analysis failed', e);
      return [];
    }
  }
}

export const visionAnalysisService = new VisionAnalysisService();
