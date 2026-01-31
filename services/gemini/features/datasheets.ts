import { getAIClient, MODELS } from '../client';
import { ScrapedMetadata } from '../../datasheetProcessor';

/**
 * Uses Gemini Multimodal (Vision/Doc) to extract pinouts and specs from a PDF datasheet.
 */
export const extractPinoutFromPDF = async (base64Data: string): Promise<ScrapedMetadata | null> => {
  const genAI = getAIClient();
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
    const result = await genAI.models.generateContent({
      model: MODELS.CONTEXT_CHAT_DEFAULT,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: "application/pdf"
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(result.text || 'null');
  } catch (error) {
    console.error('Datasheet extraction failed:', error);
    return null;
  }
};
