import { AIContext, ElectronicComponent, WireConnection } from "../../../types";
import { getAIClient, MODELS } from "../client";
import { PROMPTS } from "../prompts";
import { PROACTIVE_SUGGESTIONS_SCHEMA } from "../types";
import { aiMetricsService } from "../../aiMetricsService";
import { normalizeProactiveSuggestions } from "../parsers";

// Generate Project Ideas from Inventory
export const suggestProjectsFromInventory = async (inventory: ElectronicComponent[]): Promise<string> => {
   const startTime = Date.now();
   const model = MODELS.SUGGEST_PROJECTS;
   const ai = getAIClient();
   
   const items = inventory.map(i => `${i.name} (${i.quantity || 1})`).join(', ');
   try {
     const response = await ai.models.generateContent({
       model: model,
       contents: PROMPTS.SUGGEST_PROJECTS(items),
     });
     aiMetricsService.logMetric({ model, operation: 'suggestProjectsFromInventory', latencyMs: Date.now() - startTime, success: true });
     return response.text || "No ideas generated.";
   } catch (error) {
     aiMetricsService.logMetric({ model, operation: 'suggestProjectsFromInventory', latencyMs: Date.now() - startTime, success: false, error: String(error) });
     return "Could not generate suggestions.";
   }
};

/**
 * Generate proactive suggestions based on current state
 */
export const generateProactiveSuggestions = async (
  context: AIContext,
  diagramComponents?: ElectronicComponent[],
  diagramConnections?: WireConnection[] // Fixed: Using explicit type instead of unknown[]
): Promise<string[]> => {
  const startTime = Date.now();
  const model = MODELS.CONTEXT_CHAT_DEFAULT; // Using default chat model for suggestions
  const ai = getAIClient();
  
  try {
    const prompt = PROMPTS.PROACTIVE_SUGGESTIONS(context, diagramComponents, diagramConnections);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PROACTIVE_SUGGESTIONS_SCHEMA
      }
    });

    const suggestions = JSON.parse(response.text || '[]');
    aiMetricsService.logMetric({ model, operation: 'generateProactiveSuggestions', latencyMs: Date.now() - startTime, success: true });
    return normalizeProactiveSuggestions(suggestions);
  } catch (error) {
    aiMetricsService.logMetric({ model, operation: 'generateProactiveSuggestions', latencyMs: Date.now() - startTime, success: false, error: String(error) });
    console.error("Proactive suggestions error:", error);
    return [];
  }
};
