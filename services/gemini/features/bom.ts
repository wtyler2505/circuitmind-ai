import { getAIClient, MODELS } from '../client';
import { BOMItem } from '../../bomService';

/**
 * Uses Gemini to find Manufacturer Part Numbers and estimated prices for a list of components.
 */
export const fetchPartDetails = async (items: BOMItem[]): Promise<Partial<BOMItem>[]> => {
  const genAI = getAIClient();
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
    const response = await genAI.models.generateContent({
      model: MODELS.PART_FINDER,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error('Part details fetch failed:', error);
    return [];
  }
};
