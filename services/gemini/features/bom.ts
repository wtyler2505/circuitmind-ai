import { getAIClient, MODELS } from '../client';
import { BOMItem } from '../../services/bomService';

/**
 * Uses Gemini to find Manufacturer Part Numbers and estimated prices for a list of components.
 */
export const fetchPartDetails = async (items: BOMItem[]): Promise<Partial<BOMItem>[]> => {
  const genAI = getAIClient();
  const model = genAI.getGenerativeModel({ 
    model: MODELS.PART_FINDER,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    }
  });

  const queryItems = items.map(i => ({ name: i.name, type: i.type }));
  const prompt = `
    Find technical purchase details for these electronics components:
    ${JSON.stringify(queryItems)}

    Return a JSON array of objects with:
    - name: (Exact match from input)
    - mpn: (Standard Manufacturer Part Number)
    - estimatedPrice: (Numeric value in USD)
    - datasheetUrl: (Direct PDF link if possible)

    FORMAT:
    [{ "name": "string", "mpn": "string", "estimatedPrice": number, "datasheetUrl": "string" }]
  `;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Part details fetch failed:', error);
    return [];
  }
};
