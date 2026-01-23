import { getAIClient, MODELS } from '../client';
import { PROMPTS } from '../prompts';
import { AIContext } from '../../types';
import { PredictiveAction } from '../../services/predictionEngine';

/**
 * Generates AI-powered design predictions based on full workspace context.
 */
export const generatePredictions = async (context: AIContext): Promise<PredictiveAction[]> => {
  const genAI = getAIClient();
  const model = genAI.getGenerativeModel({ 
    model: MODELS.PART_FINDER, // Using flash for speed
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    }
  });

  const contextStr = JSON.stringify(context);
  const prompt = PROMPTS.GENERATE_PREDICTIONS(contextStr);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
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
