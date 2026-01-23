import { getAIClient, MODELS } from '../client';
import { PROMPTS } from '../prompts';

/**
 * Generates a short, punchy technical fragment for the Tactical HUD.
 * Target character limit: 100 characters.
 */
export const generateHUDFragment = async (
  targetName: string, 
  targetType: string, 
  context?: string
): Promise<string> => {
  const genAI = getAIClient();
  const model = genAI.getGenerativeModel({ 
    model: MODELS.PART_FINDER, // Using flash for speed
    generationConfig: {
      maxOutputTokens: 50,
      temperature: 0.2,
    }
  });

  const prompt = PROMPTS.GENERATE_HUD_FRAGMENT(targetName, targetType, context);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean up potential markdown formatting if any
    const cleanText = text.replace(/[`*#]/g, '');
    
    return cleanText.length > 100 ? cleanText.substring(0, 97) + '...' : cleanText;
  } catch (error) {
    console.error('HUD Fragment generation failed:', error);
    return 'DATA ERROR: Specifications unavailable.';
  }
};
