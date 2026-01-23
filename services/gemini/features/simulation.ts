import { getAIClient, MODELS } from '../client';
import { PROMPTS } from '../prompts';
import { SimulationResult } from '../../services/simulationEngine';

/**
 * Uses Gemini to analyze simulation results for high-level logic errors or safety issues.
 */
export const analyzeSimulation = async (result: SimulationResult): Promise<string> => {
  const genAI = getAIClient();
  const model = genAI.getGenerativeModel({ model: MODELS.CONTEXT_CHAT_DEFAULT });

  const resultStr = JSON.stringify(result);
  const prompt = `
    Analyze these electrical simulation results for an electronics project.
    Look for:
    1. Direct short circuits (VCC to GND).
    2. Pin logic errors (Floating pins that should be driven).
    3. Potential over-voltage risks.

    RESULTS:
    ${resultStr}

    Provide a concise, professional engineering summary of the safety and logic health.
  `;

  try {
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error('Simulation analysis failed:', error);
    return 'Analysis unavailable due to system error.';
  }
};
