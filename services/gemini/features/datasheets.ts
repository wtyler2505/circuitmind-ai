import { getAIClient, MODELS } from '../client';
import { ScrapedMetadata } from '../../services/datasheetProcessor';

/**
 * Uses Gemini Multimodal (Vision/Doc) to extract pinouts and specs from a PDF datasheet.
 */
export const extractPinoutFromPDF = async (base64Data: string): Promise<ScrapedMetadata | null> => {
  const genAI = getAIClient();
  const model = genAI.getGenerativeModel({ 
    model: MODELS.CONTEXT_CHAT_DEFAULT, // Standard flash model supports PDFs
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    Analyze this electronics datasheet PDF. 
    1. Identify the pin configuration/pinout section.
    2. Extract a mapping of all pins (number, name, and primary function).
    3. Find absolute maximum ratings for Operating Voltage (Min/Max).
    4. Determine the primary Logic Level (3.3V or 5V).

    Return a JSON object:
    {
      "pins": [{ "number": number, "name": "string", "function": "string" }],
      "specs": {
        "voltageMin": number,
        "voltageMax": number,
        "currentLimit": number (in mA, optional),
        "logicLevel": "3.3V" | "5V" | "Adjustable" | "Other"
      },
      "confidence": number (0 to 1)
    }
  `;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      },
      prompt
    ]);

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Datasheet extraction failed:', error);
    return null;
  }
};
