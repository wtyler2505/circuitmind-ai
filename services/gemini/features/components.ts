import { ElectronicComponent } from "../../../types";
import { getAIClient, MODELS } from "../client";
import { PROMPTS } from "../prompts";
import { COMPONENT_SCHEMA, PART_FINDER_SCHEMA, GeminiInlineDataPart, DeepSpecResult } from "../types";
import { aiMetricsService } from "../../aiMetricsService";
import { standardsService } from "../../standardsService";

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

export const performDeepSpecSearch = async (name: string, type: string): Promise<DeepSpecResult | null> => {
  const ai = getAIClient();
  const isLikelyBoard = type.toLowerCase().includes('board') || 
                        type.toLowerCase().includes('module') || 
                        type.toLowerCase().includes('breakout') || 
                        name.toLowerCase().includes('shield') ||
                        name.toLowerCase().includes('hat');

  const prompt = isLikelyBoard 
    ? `
      Search for the mechanical specifications of the electronic board/module "${name}".
      Prioritize finding:
      1. PCB Dimensions (Width x Length in mm).
      2. Mounting Hole spacing/coordinates.
      3. Key Interface locations (USB port, Power jack, Pin headers).
      
      Return ONLY a JSON object:
      {
        "category": "board",
        "width": number,
        "length": number,
        "height": number (approx 1.6 if pcb only, more if connectors),
        "mounting_holes": [ { "x": number, "z": number, "diameter": number } ],
        "interfaces": [
           { "type": "usb"|"header"|"jack"|"button", "edge": "left"|"right"|"top"|"bottom", "offset_mm": number }
        ]
      }
    `
    : `
      Search for the datasheet and physical dimensions of the electronic component "${name}".
      Prioritize finding:
      1. Package Type (e.g. SOIC-8, TO-220, QFN-32).
      2. Exact Body Dimensions (Width x Length x Height).
      3. Pin Pitch and Count.
      
      Return ONLY a JSON object:
      { 
        "category": "component",
        "package": string, 
        "width": number, 
        "length": number, 
        "height": number, 
        "pitch": number, 
        "pins": number,
        "datasheet_ref": string 
      }
    `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODELS.SMART_FILL,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    if (response.text) {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleaned) as DeepSpecResult;
        return data;
    }
  } catch (e) {
    console.warn("Spec search failed", e);
  }
  return null;
};

export const generateComponent3DCode = async (
  componentName: string, 
  componentType: string,
  customInstructions?: string,
  force: boolean = false,
  imageUrl?: string,
  precisionLevel: 'draft' | 'masterpiece' = 'draft'
): Promise<string> => {
  const startTime = Date.now();
  const model = MODELS.CODE_GEN;
  const ai = getAIClient();
  
  // Cache Key: name + type + instructions + (hasImage) + precision
  const cacheKey = `${CACHE_KEY_PREFIX}${componentName}_${componentType}_${customInstructions || ''}_${imageUrl ? 'img' : ''}_${precisionLevel}`.replace(/\s+/g, '_').toLowerCase();
  
  // Try Cache (unless forced)
  if (!force) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  // 1. Spec Extraction Pass (Grounding)
  const standard = standardsService.getPackage(componentName) || standardsService.getPackage(componentType);
  const board = standardsService.getBoardMap(componentName) || standardsService.getBoardMap(componentType);
  let deepSpec: DeepSpecResult | null = null;

  if (!standard && !board) {
    deepSpec = await performDeepSpecSearch(componentName, componentType);
    
    // If deep search found a component package that matches a standard, snap to it?
    // For now, we trust the deep search if it returned data.
  }

  let dimensionHint = "";
  if (board) {
    dimensionHint = `
      ASSEMBLY PLAN (INTERNAL STANDARD):
      This is a known board ("${board.name}").
      DO NOT guess. Use this exact placement for major components on the PCB:
      - PCB: ${board.width}x${board.length}x1.6mm
      - Sub-components:
        ${board.components.map(c => `- ${c.name} (${c.type}): At x:${c.x}, z:${c.z}${c.rotation ? `, rot:${c.rotation}` : ''}${c.params ? `, params:${JSON.stringify(c.params)}` : ''}`).join('\n        ')}
      REQUIREMENT: You must instantiate every one of these sub-components using Primitives.
    `;
  } else if (deepSpec) {
      if (deepSpec.category === 'board') {
          dimensionHint = `
            ASSEMBLY PLAN (FROM WEB DATASHEET):
            Dimensions: ${deepSpec.width}mm x ${deepSpec.length}mm.
            Mounting Holes: ${JSON.stringify(deepSpec.mounting_holes || [])}.
            Interfaces: ${JSON.stringify(deepSpec.interfaces || [])}.
            
            USE 'Primitives.createLayout(${deepSpec.width}, ${deepSpec.length})'.
            Place interfaces at their approximate edges.
          `;
      } else {
          dimensionHint = `
            GROUNDING DATA (FROM WEB DATASHEET):
            Package: "${deepSpec.package}".
            Dimensions: ${deepSpec.width}x${deepSpec.length}x${deepSpec.height}mm.
            Pitch: ${deepSpec.pitch}mm.
            Pins: ${deepSpec.pins}.
            Ref: ${deepSpec.datasheet_ref || 'Web Search'}.
          `;
      }
  } else if (standard) {
    dimensionHint = `
      GROUNDING DATA (IPC-7351 STANDARD):
      This component matches package "${standard.pin_count || 'N/A'}-pin ${standard.pin_type || 'N/A'}".
      Use these EXACT dimensions:
      - body_width: ${standard.body_width}mm
      - body_length: ${standard.body_length}mm
      - height: ${standard.height}mm
      - pitch: ${standard.pitch || 'N/A'}mm
    `;
  }

  // 1.5. Visual Analysis Pass (Vision Grounding)
  let visualAnalysis = "";
  if (imageUrl && !board) { // Only needed if we don't have a hard-coded board map
      try {
          // Fetch the image to get base64/blob for Gemini
          // Note: In a real app, might need a proxy or CORS handling. 
          // Assuming imageUrl is accessible or a data URI.
          // For now, we'll try-catch this block aggressively.
          
          let imagePart: GeminiInlineDataPart | null = null;
          if (imageUrl.startsWith('data:')) {
             const mimeType = imageUrl.split(';')[0].split(':')[1];
             const data = imageUrl.split(',')[1];
             imagePart = { inlineData: { mimeType, data } };
          } else {
             // If it's a URL, we might skip or try to fetch.
             // For safety in this CLI environment, let's assume if it's not data URI, we skip 
             // unless we add a fetch tool. But let's assume the UI passes data URIs mostly.
          }

          if (imagePart) {
             const visionResponse = await ai.models.generateContent({
                 model: MODELS.IMAGE, // Use a vision-capable model
                 contents: [
                     { text: PROMPTS.ANALYZE_COMPONENT_VISUALS },
                     imagePart
                 ]
             });
             visualAnalysis = visionResponse.text || "";
          }
      } catch (e) {
          console.warn("Visual analysis failed", e);
      }
  }

  // 2. Assembly Pass (Code Generation)
  try {
    const prompt = PROMPTS.GENERATE_3D_CODE(componentName, componentType, customInstructions, dimensionHint, visualAnalysis, precisionLevel);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
         thinkingConfig: { thinkingBudget: 4096 },
         tools: [{ googleSearch: {} }],
         systemInstruction: "You are a Master 3D Architect. Output only valid JavaScript. Use Primitives and Materials for everything. Be precise."
      }
    });

    let code = response.text || "";
    
    // 2.5. Self-Correction Pass (Review & Refine)
    const correctionPrompt = `
        Review the following 3D model code for an electronic component.
        CHECK FOR:
        1. Syntax errors or mismatched brackets.
        2. "Magic numbers" (all positions should use layout.place()).
        3. Missing return group; statement.
        4. Floating components (everything must be added to 'group').
        
        CODE TO REVIEW:
        ${code}
        
        If perfect, return the code as-is. 
        If flawed, output the FIXED valid JavaScript code ONLY.
    `;
    
    const correctionResponse = await ai.models.generateContent({
        model: MODELS.CHAT, // Use a faster model for review
        contents: correctionPrompt,
        config: {
            systemInstruction: "You are a Senior 3D Code Auditor. Output ONLY valid JS code."
        }
    });
    
    if (correctionResponse.text) {
        code = correctionResponse.text;
    }

    // 1. Heavy Markdown/Prose Cleanup
    code = code.replace(/```(?:javascript|js)?\n?([\s\S]*?)```/g, '$1');
    
    // 2. Remove common AI "Sure thing!" prose at the start
    // We only want to strip prose if it appears BEFORE the first valid code line.
    // Valid code lines start with: const, let, var, import, function, class, or Primitives/THREE/group.
    
    // Find the index of the first line that looks like code
    const lines = code.split('\n');
    let firstCodeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Check for comments
        if (line.startsWith('//') || line.startsWith('/*')) {
             if (firstCodeLineIndex === -1) firstCodeLineIndex = i; // Comments count as code start usually
             continue;
        }
        // Check for code keywords
        if (
            line.startsWith('const ') || 
            line.startsWith('let ') || 
            line.startsWith('var ') || 
            line.startsWith('return ') ||
            line.startsWith('group') ||
            line.startsWith('THREE') || 
            line.startsWith('Primitives') ||
            line.startsWith('layout')
        ) {
            firstCodeLineIndex = i;
            break;
        }
    }
    
    if (firstCodeLineIndex !== -1) {
        code = lines.slice(firstCodeLineIndex).join('\n');
    }

    // 3. Handle the "Arrow Function" Hallucination
    // If AI wrapped code in (THREE, Primitives, Materials) => { ... }
    // we want just the ... part.
    const arrowFuncPattern = /^\s*\(?THREE,\s*Primitives,\s*Materials\)?\s*=>\s*\{?([\s\S]*?)\}?\s*;?\s*$/i;
    const arrowMatch = code.match(arrowFuncPattern);
    if (arrowMatch) {
        code = arrowMatch[1];
    }

    // 4. Bracket/Paren Balancer (Crucial for "Unexpected token ')'")
    // If the code ends with a return and then a trailing paren/brace, strip it.
    const lastReturnIdx = code.lastIndexOf('return group;');
    if (lastReturnIdx !== -1) {
        const afterReturn = code.substring(lastReturnIdx + 13).trim();
        // If there's garbage after return group; like ')', '}', or prose
        if (afterReturn.length > 0) {
            // Check if it's just semicolons or single closing marks
            if (/^[;}\)\s]+$/.test(afterReturn)) {
                code = code.substring(0, lastReturnIdx + 13);
            } else {
                // If it's more complex prose, still cut at return group;
                code = code.substring(0, lastReturnIdx + 13);
            }
        }
    }

    code = code.trim();
    
    // Final Syntax Sanity: if it starts with ( and ends with ), strip them
    if (code.startsWith('(') && code.endsWith(')')) {
        code = code.substring(1, code.length - 1).trim();
    }
    
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
