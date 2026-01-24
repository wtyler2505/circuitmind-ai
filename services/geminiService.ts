// Refactored Gemini Service
// This file now serves as a facade, re-exporting functionality from the modular structure.
// See services/gemini/ for the implementation details.

// Tool: Spatial Narrator
export const describeDiagram = async (diagram: WiringDiagram): Promise<string> => {
  const model = getAIClient().getGenerativeModel({ model: MODELS.CHAT });
  
  const prompt = `
    Analyze this wiring diagram for a blind engineer using a screen reader.
    Provide a spatial summary of the layout.
    
    Diagram: ${JSON.stringify(diagram)}
    
    Rules:
    1. Start with an overview (e.g., "A star topology centered on the Arduino").
    2. Describe relative positions (e.g., "To the right is a sensor").
    3. Trace key connections linearly.
    4. Keep it concise but technically accurate.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// Tool: Explain Component

export * from './gemini/index';
