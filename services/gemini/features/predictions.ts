import { getAIClient, MODELS } from '../client';
import { PROMPTS } from '../prompts';
import { AIContext } from '../../../types';
import { PredictiveAction } from '../../predictionEngine';

/**
 * Generates AI-powered design predictions based on full workspace context.
 */
export const generatePredictions = async (context: AIContext): Promise<PredictiveAction[]> => {
  const genAI = getAIClient();
  const contextStr = JSON.stringify(context);
  const prompt = PROMPTS.GENERATE_PREDICTIONS(contextStr);

  try {
    const result = await genAI.models.generateContent({
      model: MODELS.PART_FINDER,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
      }
    });
    
    const response = result.text || '[]';
    const parsed = JSON.parse(response);
    
    // Transform payloadJson strings back to objects
    return parsed.map((p: any) => ({
      ...p,
      action: {
        ...p.action,
        payload: JSON.parse(p.action.payloadJson)
      }
    }));
  } catch (error) {
    console.error('Prediction generation failed:', error);
    return [];
  }
};
