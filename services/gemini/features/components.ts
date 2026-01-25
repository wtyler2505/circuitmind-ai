import { ElectronicComponent } from "../../../types";
import { getAIClient, MODELS } from "../client";
import { PROMPTS } from "../prompts";
import { 
    SMART_FILL_SCHEMA, 
    COMPONENT_SCHEMA, 
    PART_FINDER_SCHEMA, 
    ASSIST_EDITOR_SCHEMA 
} from "../types";
import { aiMetricsService } from "../../aiMetricsService";
import { standardsService } from "../../standardsService";
import { storageService } from "../../storage";

const CACHE_KEY_PREFIX = 'cm_3d_code_';

export const explainComponent = async (componentName: string): Promise<string> => {
  const startTime = Date.now();
  const model = MODELS.CHAT;
  const ai = getAIClient();

  // Check if API key is configured
  const apiKey = localStorage.getItem('cm_gemini_api_key') || process.env.API_KEY;
  if (!apiKey) {
    return `**API Key Required**\n\nTo get component explanations, please configure your Gemini API key in Settings.\n\n*Component: ${componentName}*`;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: PROMPTS.EXPLAIN_COMPONENT(componentName),
    });

    aiMetricsService.logMetric({
        model,
        operation: 'explainComponent',
        latencyMs: Date.now() - startTime,
        success: true
      });

    return response.text || "Could not retrieve explanation.";
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[explainComponent] Error:', errorMessage);

    aiMetricsService.logMetric({
        model,
        operation: 'explainComponent',
        latencyMs: Date.now() - startTime,
        success: false,
        error: errorMessage
      });

    // Provide user-friendly error messages
    if (errorMessage.includes('API_KEY') || errorMessage.includes('401') || errorMessage.includes('invalid')) {
      return `**API Key Error**\n\nYour Gemini API key may be invalid or expired. Please check your API key in Settings.\n\n*Error: ${errorMessage}*`;
    }
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate')) {
      return `**Rate Limited**\n\nToo many requests. Please wait a moment and try again.\n\n*Component: ${componentName}*`;
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      return `**Connection Error**\n\nCouldn't connect to the AI service. Please check your internet connection.\n\n*Component: ${componentName}*`;
    }

    return `**Error Loading Details**\n\nCouldn't retrieve information for "${componentName}".\n\n*Error: ${errorMessage}*`;
  }
};

export const smartFillComponent = async (name: string, type?: string): Promise<Partial<ElectronicComponent>> => {
  const startTime = Date.now();
  const model = MODELS.SMART_FILL;
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: model, 
      contents: PROMPTS.SMART_FILL(name, type),
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" is unsupported when tools are used
      }
    });

    if (response.text) {
        aiMetricsService.logMetric({ model, operation: 'smartFillComponent', latencyMs: Date.now() - startTime, success: true });
        return JSON.parse(response.text);
    }
    return {};
  } catch (e) {
      aiMetricsService.logMetric({ model, operation: 'smartFillComponent', latencyMs: Date.now() - startTime, success: false, error: String(e) });
      console.error("Smart Fill Error", e);
      throw e;
  }
}

export const assistComponentEditor = async (
  history: { role: string, text: string }[],
  currentComponent: Partial<ElectronicComponent>,
  userInstruction: string
): Promise<{
  reply: string, 
  updates: Partial<ElectronicComponent>,
  foundImages: string[],
  suggestedActions: string[]
}> => {
  const startTime = Date.now();
  const model = MODELS.ASSIST_EDITOR;
  const ai = getAIClient();
  
  try {
    const contextPrompt = PROMPTS.ASSIST_EDITOR(JSON.stringify(currentComponent, null, 2), userInstruction);
    const chatHistory = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: contextPrompt }] }
      ],
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" is unsupported when tools are used
      }
    });

    if (response.text) {
      aiMetricsService.logMetric({ model, operation: 'assistComponentEditor', latencyMs: Date.now() - startTime, success: true });
      return JSON.parse(response.text);
    }
    throw new Error("No response from AI assistant");
  } catch (error) {
    aiMetricsService.logMetric({ model, operation: 'assistComponentEditor', latencyMs: Date.now() - startTime, success: false, error: String(error) });
    console.error("Assistant Error", error);
    throw error;
  }
};

export const augmentComponentData = async (partialName: string): Promise<Partial<ElectronicComponent>> => {
  const startTime = Date.now();
  const model = MODELS.AUTO_ID;
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: PROMPTS.AUGMENT_COMPONENT(partialName),
      config: {
        responseMimeType: "application/json",
        responseSchema: COMPONENT_SCHEMA
      }
    });
    if (response.text) {
      aiMetricsService.logMetric({ model, operation: 'augmentComponentData', latencyMs: Date.now() - startTime, success: true });
      return JSON.parse(response.text);
    }
    throw new Error("Failed to identify");
  } catch (error) {
    aiMetricsService.logMetric({ model, operation: 'augmentComponentData', latencyMs: Date.now() - startTime, success: false, error: String(error) });
    console.error("Auto-ID Error", error);
    throw error;
  }
};

export const findComponentSpecs = async (query: string): Promise<Partial<ElectronicComponent>[]> => {
  const startTime = Date.now();
  const model = MODELS.PART_FINDER;
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: PROMPTS.FIND_COMPONENT(query),
      config: {
        responseMimeType: "application/json",
        responseSchema: PART_FINDER_SCHEMA
      }
    });
    
    if (response.text) {
      aiMetricsService.logMetric({ model, operation: 'findComponentSpecs', latencyMs: Date.now() - startTime, success: true });
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    aiMetricsService.logMetric({ model, operation: 'findComponentSpecs', latencyMs: Date.now() - startTime, success: false, error: String(error) });
    console.error("Part Finder Error", error);
    throw error;
  }
};

export const identifyComponentFromImage = async (imageBase64: string): Promise<Partial<ElectronicComponent>> => {
  const ai = getAIClient();
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE, // Ensure this maps to a valid model like gemini-2.0-flash
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
          { text: PROMPTS.IDENTIFY_IMAGE }
        ]
      },
    });
    
    if (response.text) {
      const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    }
    throw new Error("Failed to identify image");
  } catch (error) {
    console.error("Image ID Error", error);
    throw error;
  }
};

export const generateComponent3DCode = async (
  componentName: string, 
  componentType: string,
  customInstructions?: string
): Promise<string> => {
  const startTime = Date.now();
  const model = MODELS.CODE_GEN;
  const ai = getAIClient();
  
  // Cache Key: name + type + instructions
  const cacheKey = `${CACHE_KEY_PREFIX}${componentName}_${componentType}_${customInstructions || ''}`.replace(/\s+/g, '_').toLowerCase();
  
  // Try Cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log(`[Cache Hit] 3D Code for ${componentName}`);
      return cached;
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  // Look up standard dimensions
  const standard = standardsService.getPackage(componentName) || standardsService.getPackage(componentType);
  const board = standardsService.getBoardMap(componentName) || standardsService.getBoardMap(componentType);

  let dimensionHint = "";
  if (board) {
    dimensionHint = `
      ASSEMBLY PLAN (EXACT GROUNDING):
      This is a development board ("${board.name}").
      DO NOT guess. Use this exact placement for major components on the PCB:
      - PCB: ${board.width}x${board.length}x1.6mm
      - Sub-components:
        ${board.components.map(c => `- ${c.name} (${c.type}): At x:${c.x}, z:${c.z}${c.rotation ? `, rot:${c.rotation}` : ''}${c.params ? `, params:${JSON.stringify(c.params)}` : ''}`).join('\n        ')}
      REQUIREMENT: You must instantiate every one of these sub-components using Primitives.
    `;
  } else if (standard) {
    dimensionHint = `
      GROUNDING DATA (IPC-7351):
      This component matches standard package "${standard.pin_count}-pin ${standard.pin_type}".
      Use these EXACT dimensions:
      - body_width: ${standard.body_width}mm
      - body_length: ${standard.body_length}mm
      - height: ${standard.height}mm
      - pitch: ${standard.pitch || 'N/A'}mm
    `;
  }

  try {
    const prompt = PROMPTS.GENERATE_3D_CODE(componentName, componentType, customInstructions, dimensionHint);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
         thinkingConfig: { thinkingBudget: 4096 },
         tools: [{ googleSearch: {} }],
         systemInstruction: "You are a Three.js expert. Output only valid JavaScript code. Be extremely detailed. Use the Primitives library. Place every part of the board individually."
      }
    });

    let code = response.text || "";
    // Aggressive cleanup
    code = code.replace(/```(?:javascript|js)?\n?([\s\S]*?)```/g, '$1');
    const startIdx = code.search(/(const|let|var|group\s*=)/);
    if (startIdx !== -1) {
      code = code.substring(startIdx);
    }
    const lastReturnIdx = code.lastIndexOf('return group;');
    if (lastReturnIdx !== -1) {
      code = code.substring(0, lastReturnIdx + 13);
    }
    code = code.trim();
    
    if (code.length < 20) throw new Error("Generated code is too short or invalid");

    // Save to Cache
    try {
        localStorage.setItem(cacheKey, code); // Using localStorage for consistency with read
    } catch (e) {
        console.warn("Failed to cache 3D code", e);
    }

    aiMetricsService.logMetric({ model, operation: 'generateComponent3DCode', latencyMs: Date.now() - startTime, success: true });
    return code;
  } catch (error) {
    aiMetricsService.logMetric({ model, operation: 'generateComponent3DCode', latencyMs: Date.now() - startTime, success: false, error: String(error) });
    console.error("3D Generation Error:", error);
    throw error;
  }
};
