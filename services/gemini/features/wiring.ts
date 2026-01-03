import { WiringDiagram, ElectronicComponent } from "../../../types";
import { getAIClient, MODELS } from "../client";
import { WIRING_SCHEMA } from "../types";
import { formatInventoryContext, PROMPTS } from "../prompts";
import { aiMetricsService } from "../../aiMetricsService";
import { circuitAnalysisService } from "../../circuitAnalysisService";

export const generateWiringDiagram = async (
  prompt: string, 
  inventoryContext: ElectronicComponent[]
): Promise<WiringDiagram> => {
  const startTime = Date.now();
  const model = MODELS.WIRING;
  const ai = getAIClient();
  
  const inventoryStr = formatInventoryContext(inventoryContext);
  const systemPrompt = PROMPTS.WIRING_SYSTEM(inventoryStr);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + "\n\nRequest: " + prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: WIRING_SCHEMA,
        systemInstruction: "Favor components from inventory. Use precise IDs from context."
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text) as WiringDiagram;
      
      // Post-processing: Analyze circuit
      const analysis = circuitAnalysisService.analyze(result);
      if (!analysis.isValid) {
        console.warn('Generated circuit has issues:', analysis.issues);
        // We could append warnings to the explanation, but for now just log
      }

      aiMetricsService.logMetric({
        model,
        operation: 'generateWiringDiagram',
        latencyMs: Date.now() - startTime,
        success: true
      });
      
      return result;
    }
    throw new Error("No response generated");
  } catch (error) {
    aiMetricsService.logMetric({
        model,
        operation: 'generateWiringDiagram',
        latencyMs: Date.now() - startTime,
        success: false,
        error: String(error)
      });
    console.error("Gemini API Error:", error);
    throw error;
  }
};
