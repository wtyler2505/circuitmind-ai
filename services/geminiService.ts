import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import {
  WiringDiagram,
  ElectronicComponent,
  GroundingSource,
  AIContext,
  ActionIntent,
  ActionType,
  ComponentReference,
  WireConnection,
} from "../types";
import { buildContextPrompt } from './aiContextBuilder';

// =====================================
// Gemini SDK Type Definitions
// =====================================

/** Content part with text */
interface GeminiTextPart {
  text: string;
}

/** Content part with inline data (images/videos) */
interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

/** Union type for content parts */
type GeminiPart = GeminiTextPart | GeminiInlineDataPart;

/** Chat message for conversation history */
interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

/** Tool configuration for Gemini */
interface GeminiTool {
  googleSearch?: Record<string, unknown>;
  codeExecution?: Record<string, unknown>;
}

/** Generation configuration */
interface GeminiConfig {
  systemInstruction?: string;
  tools?: GeminiTool[];
  thinkingConfig?: { thinkingBudget: number };
  responseMimeType?: string;
  responseSchema?: Schema;
  imageConfig?: {
    imageSize: string;
    aspectRatio: string;
  };
}

/** Grounding chunk from Gemini response */
interface GeminiGroundingChunk {
  web?: {
    title: string;
    uri: string;
  };
}

/** Component mention from AI response */
interface AIComponentMention {
  componentId: string;
  componentName?: string;
  reason?: string;
  status?: string;
}

/** Suggested action from AI response */
interface AISuggestedAction {
  type: ActionType;
  payload?: Record<string, unknown>;
  payloadJson?: string;
  label?: string;
  safe?: boolean;
  description?: string;
}

/** Parsed structured response from AI */
interface ParsedAIResponse {
  message?: string;
  componentMentions?: AIComponentMention[];
  suggestedActions?: AISuggestedAction[];
}

/** API error with status code */
interface APIError extends Error {
  status?: number;
}

// Get API key from localStorage or environment variable
const getApiKey = (): string => {
  // Try localStorage first (user-configured)
  try {
    const stored = localStorage.getItem('cm_gemini_api_key');
    if (stored) return stored;
  } catch {
    // localStorage not available (SSR or error)
  }
  // Fall back to environment variable
  return process.env.API_KEY || '';
};

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: getApiKey() });

const WIRING_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short title for the circuit" },
    components: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique short ID (e.g., mcu1, sens1)" },
          name: { type: Type.STRING, description: "Component name (e.g., ESP32, DHT22)" },
          type: { type: Type.STRING, description: "Category: microcontroller, sensor, actuator, power, other" },
          description: { type: Type.STRING, description: "Short description of function" },
          pins: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of relevant pins used in this circuit"
          }
        },
        required: ["id", "name", "type", "description", "pins"]
      }
    },
    connections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          fromComponentId: { type: Type.STRING },
          fromPin: { type: Type.STRING },
          toComponentId: { type: Type.STRING },
          toPin: { type: Type.STRING },
          description: { type: Type.STRING, description: "Why this connection exists (e.g., Data signal)" },
          color: { type: Type.STRING, description: "Suggested wire color hex code" }
        },
        required: ["fromComponentId", "fromPin", "toComponentId", "toPin"]
      }
    },
    explanation: { type: Type.STRING, description: "Educational summary of how this circuit works" }
  },
  required: ["title", "components", "connections", "explanation"]
};

// Component Definition Schema for Auto-Identify
const COMPONENT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Standardized component name" },
    type: { type: Type.STRING, enum: ['microcontroller', 'sensor', 'actuator', 'power', 'other'] },
    description: { type: Type.STRING, description: "Short technical description" },
    pins: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Standard pinout labels (e.g., VCC, GND, IN)" }
  },
  required: ["name", "type", "description", "pins"]
};

// Schema for Part Finder Results
const PART_FINDER_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Specific component model name" },
      type: { type: Type.STRING, enum: ['microcontroller', 'sensor', 'actuator', 'power', 'other'] },
      description: { type: Type.STRING, description: "Key specs or features" },
      pins: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Standard pins" }
    },
    required: ["name", "type", "description", "pins"]
  }
};

export const generateWiringDiagram = async (
  prompt: string, 
  inventoryContext: ElectronicComponent[]
): Promise<WiringDiagram> => {
  
  const inventoryStr = inventoryContext.map(c => {
    const pinsStr = c.pins && c.pins.length > 0 ? `[Pins: ${c.pins.join(', ')}]` : '[No pins defined]';
    return `ID:${c.id} - ${c.name} (${c.type}) ${pinsStr}`;
  }).join('; ');
  
  const systemPrompt = `
    You are an expert electronics engineer and educator AI from the year 2025.
    Your goal is to generate precise, working wiring diagrams for hobbyists.
    
    User Inventory Context: ${inventoryStr ? inventoryStr : "No specific inventory provided."}
    
    Create a wiring diagram based on the user's request. 
    IMPORTANT: If you use components from the provided inventory, YOU MUST USE THE EXACT SAME ID provided in the context. Do not generate new IDs for existing items.
    Ensure pinouts are accurate.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
      return JSON.parse(response.text) as WiringDiagram;
    }
    throw new Error("No response generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const explainComponent = async (componentName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the component "${componentName}" to a hobbyist. Include common pinouts, voltage levels, and typical use cases. Keep it under 200 words. Format with Markdown.`,
    });
    return response.text || "Could not retrieve explanation.";
  } catch (_error) {
    return "Error retrieving component details.";
  }
};

// New: Smart Fill Component Details using Search
export const smartFillComponent = async (name: string, type?: string): Promise<Partial<ElectronicComponent>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: `Search for technical details of the electronic component "${name}".
      If the type "${type}" is provided, use it as context context for the search.
      
      Return a JSON object with:
      - description: A concise technical description.
      - pins: An array of standard pin labels (e.g. ["VCC", "GND", "A0"]).
      - datasheetUrl: A URL to a datasheet if found (or null).
      - type: The most appropriate category (microcontroller, sensor, actuator, power, other).
      `,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
             type: Type.OBJECT,
             properties: {
                 description: {type: Type.STRING},
                 pins: {type: Type.ARRAY, items: {type: Type.STRING}},
                 datasheetUrl: {type: Type.STRING},
                 type: {type: Type.STRING}
             }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return {};
  } catch (e) {
      console.error("Smart Fill Error", e);
      throw e;
  }
}

// Advanced Chat-based Component Editor
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
  try {
    const contextPrompt = `
      You are an expert Component Engineer Assistant. 
      Your job is to help the user edit the details of an electronic component in their inventory.
      
      CURRENT COMPONENT STATE:
      ${JSON.stringify(currentComponent, null, 2)}
      
      USER INSTRUCTION:
      "${userInstruction}"
      
      CAPABILITIES:
      1. Use Google Search to find accurate technical details (pins, descriptions, datasheets).
      2. Use Google Search to find image URLs of the component.
      3. Use Google Search to find 3D model URLs (glb/gltf) or datasheet PDFs.
      4. If you cannot find a good image or 3D model, SUGGEST that the user generates one using the app's AI generators.
      
      RESPONSE RULES:
      - 'reply': Conversational response explaining what you found or changed.
      - 'updates': Object containing ONLY the fields to update (name, type, description, pins, datasheetUrl, threeDModelUrl, imageUrl, quantity).
      - 'foundImages': Array of valid image URLs you found via search that represent this component.
      - 'suggestedActions': Array of strings. Use 'GENERATE_IMAGE' if no good image found. Use 'GENERATE_3D' if no 3D model found.
    `;

    const chatHistory = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: contextPrompt }] }
      ],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            updates: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                pins: { type: Type.ARRAY, items: { type: Type.STRING } },
                datasheetUrl: { type: Type.STRING },
                threeDModelUrl: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                quantity: { type: Type.NUMBER }
              }
            },
            foundImages: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["reply", "updates", "foundImages", "suggestedActions"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response from AI assistant");
  } catch (error) {
    console.error("Assistant Error", error);
    throw error;
  }
};

// New: Auto-Identify Component from partial name
export const augmentComponentData = async (partialName: string): Promise<Partial<ElectronicComponent>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify the electronic component "${partialName}" and provide its standard type, description, and common pinout labels.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: COMPONENT_SCHEMA
      }
    });
    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Failed to identify");
  } catch (error) {
    console.error("Auto-ID Error", error);
    throw error;
  }
};

// New: Part Finder - Search for components
export const findComponentSpecs = async (query: string): Promise<Partial<ElectronicComponent>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user is searching for an electronic component matching: "${query}". 
      Return a list of 3 to 5 distinct, real-world components that best match this query.
      Provide the specific model name, type, a brief technical description, and standard pins for each.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: PART_FINDER_SCHEMA
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Part Finder Error", error);
    throw error;
  }
};

// New: Identify Component from Image
export const identifyComponentFromImage = async (imageBase64: string): Promise<Partial<ElectronicComponent>> => {
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using Flash Image for speed/efficiency
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
          { text: "Identify this electronic component. Return JSON with name, type (microcontroller, sensor, actuator, power, other), description, and standard pins." }
        ]
      },
      // Note: Response Schema not supported on gemini-2.5-flash-image, so we parse manually
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

// New: Generate Project Ideas from Inventory
export const suggestProjectsFromInventory = async (inventory: ElectronicComponent[]): Promise<string> => {
   const items = inventory.map(i => `${i.name} (${i.quantity || 1})`).join(', ');
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: `Based on this inventory: [${items}], suggest 3 creative electronics projects I could build. 
       Format as a markdown list with bold titles and brief descriptions. 
       Mention if I need extra common parts (like resistors/wires).`,
     });
     return response.text || "No ideas generated.";
   } catch (_error) {
     return "Could not generate suggestions.";
   }
};

export const chatWithAI = async (
  message: string,
  history: GeminiChatMessage[],
  attachmentBase64?: string,
  attachmentType?: 'image' | 'video',
  useDeepThinking: boolean = false
): Promise<{ text: string, groundingSources: GroundingSource[] }> => {
   try {
    let model = 'gemini-3-flash-preview';
    let parts: GeminiPart[] = [{ text: message }];
    let tools: GeminiTool[] = [];
    const config: GeminiConfig = {
      systemInstruction: "You are CircuitMind, a helpful electronics AI. Use Google Search to provide up-to-date and accurate information about components, datasheets, and new technologies. Keep answers concise, technical but accessible."
    };
    
    const isAttachment = !!attachmentBase64;
    const isComplexQuery = message.length > 50 || message.toLowerCase().includes('search') || message.toLowerCase().includes('find') || message.toLowerCase().includes('latest');

    // 1. Video Analysis
    if (isAttachment && attachmentType === 'video') {
       model = 'gemini-3-pro-preview';
       const cleanBase64 = attachmentBase64?.replace(/^data:video\/(mp4|webm|quicktime);base64,/, '') || '';
       parts = [
         { inlineData: { mimeType: 'video/mp4', data: cleanBase64 } }, 
         { text: message || "Analyze this video." }
       ];
    }
    // 2. Image Analysis
    else if (isAttachment && attachmentType === 'image') {
      model = 'gemini-3-pro-preview';
      const cleanBase64 = attachmentBase64?.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '') || '';
      parts = [
        { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
        { text: message || "Analyze this electronic component/circuit." }
      ];
    }
    // 3. Deep Thinking Mode
    else if (useDeepThinking) {
      model = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 };
    }
    // 4. Complex Text Queries (Standard Pro)
    else if (isComplexQuery) {
      model = 'gemini-3-pro-preview';
      tools = [{ googleSearch: {} }];
    } 

    config.tools = tools.length > 0 ? tools : undefined;

    const response = await ai.models.generateContent({
      model: model,
      contents: [...history, { role: 'user', parts: parts }],
      config: config
    });

    const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GeminiGroundingChunk[];
    const groundingSources: GroundingSource[] = chunks
      .map((c) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
      .filter((c): c is GroundingSource => c !== null);

    return { 
      text: response.text || "...", 
      groundingSources 
    };
   } catch (error) {
     console.error("Chat Error", error);
     return { text: "Connection error.", groundingSources: [] };
   }
}

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  try {
    const cleanBase64 = audioBase64.split(',')[1] || audioBase64;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'audio/wav', data: cleanBase64 } },
            { text: "Transcribe the following audio exactly." }
          ]
        }
      ]
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error", error);
    throw error;
  }
}

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    
    return base64Audio;
  } catch (error) {
    console.error("TTS Error", error);
    throw error;
  }
}

export const generateEditedImage = async (
  imageBase64: string, 
  prompt: string
): Promise<string> => {
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png', 
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

// Generates a small 1K square image for thumbnails
export const generateComponentThumbnail = async (componentName: string): Promise<string> => {
    // We enable search to ensure the thumbnail actually looks like the specific real-world component.
    return await generateConceptImage(
        `A high-quality, realistic, isolated top-down product photo of a ${componentName} electronic component. Professional studio lighting, dark background, sharp details. Accurate to the real-world appearance of ${componentName}.`, 
        '1K', 
        '1:1',
        true
    );
};

export const generateConceptImage = async (
  prompt: string,
  size: '1K' | '2K' | '4K',
  aspectRatio: string = '16:9',
  enableSearch: boolean = false
): Promise<string> => {
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  // Helper to execute request with error handling/retry
  const executeRequest = async () => {
    const apiKey = getApiKey();
    const aiClient = new GoogleGenAI({ apiKey });
    
    const config: GeminiConfig = {
        imageConfig: {
          imageSize: size,
          aspectRatio: aspectRatio,
        },
    };
    
    if (enableSearch) {
        // Use Google Search grounding for higher accuracy on specific models
        config.tools = [{ googleSearch: {} }];
    }

    return await aiClient.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: config,
    });
  };

  try {
    return (await executeRequest()).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  } catch (error: unknown) {
     // Handle Permission Denied (403) or Not Found
    const apiError = error as APIError;
    if (apiError.status === 403 || (apiError.message && (apiError.message.includes('403') || apiError.message.includes('PERMISSION_DENIED') || apiError.message.includes('not found')))) {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        const retryResponse = await executeRequest();
        return retryResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
      }
    }
    throw error;
  }
}

export const generateCircuitVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  imageBase64?: string
): Promise<string> => {
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  const executeVideoRequest = async () => {
    const apiKey = getApiKey();
    const aiClient = new GoogleGenAI({ apiKey });
    let imageParam = undefined;
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      imageParam = {
        imageBytes: cleanBase64,
        mimeType: 'image/png',
      };
    }

    let operation = await aiClient.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "A cinematic, futuristic visualization of an electronic circuit, 4k",
      image: imageParam,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await aiClient.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed to return a URI");

    return `${videoUri}&key=${apiKey}`;
  };
  
  try {
    return await executeVideoRequest();
  } catch (error: unknown) {
    const apiError = error as APIError;
    if (apiError.status === 403 || (apiError.message && (apiError.message.includes('403') || apiError.message.includes('PERMISSION_DENIED')))) {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        return await executeVideoRequest();
      }
    }
    throw error;
  }
};

export const generateComponent3DCode = async (componentName: string, componentType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        You are an expert 3D programmer using Three.js.
        
        STEP 1: SEARCH
        Use Google Search to find the exact visual specifications, dimensions, color, and pin layout of the component: "${componentName}" (${componentType}).
        
        STEP 2: GENERATE CODE
        Generate the JavaScript code for the BODY of a function that creates a detailed 3D model of this specific component based on your search results.
        
        The function signature (DO NOT output this) is roughly: (THREE) => THREE.Group
        
        Requirements:
        1. Create a variable 'const group = new THREE.Group();'
        2. Create geometry using THREE primitives (BoxGeometry, CylinderGeometry, etc.) that accurately matches the searched component's look.
        3. Use THREE.MeshStandardMaterial with appropriate colors found in search.
        4. Add all meshes to 'group'.
        5. Position meshes so the component is centered at (0,0,0) in the X and Z axes.
        6. Position the component so its bottom sits exactly on y=0 (the grid).
        7. END with 'return group;'
        8. DO NOT use markdown. DO NOT wrap in a function definition. JUST THE CODE STATEMENTS.
        9. Assume 'THREE' is available in scope.
        10. Do not use 'window', 'document', or 'console.log'.
        11. Ensure all variables are properly declared with const or let.
        12. Do not try to fetch or load external resources or URLs.
      `,
      config: {
         thinkingConfig: { thinkingBudget: 2048 },
         tools: [{ googleSearch: {} }],
         systemInstruction: "You are a Three.js expert. Output only valid JavaScript code statements. Do not use ```js blocks. Do not use console.log. Do not use import statements."
      }
    });

    let code = response.text || "";
    // Aggressive cleanup
    code = code.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '');
    code = code.replace(/^[\s\S]*?(?=const|let|var)/, ''); // Attempt to strip preamble text if any
    code = code.trim();
    
    if (code.length < 20) throw new Error("Generated code is too short");

    return code;
  } catch (error) {
    console.error("3D Generation Error:", error);
    throw error;
  }
};

// =====================================
// Context-Aware AI Chat (Phase 4)
// =====================================

// Schema for structured AI response with actions
const STRUCTURED_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING, description: "The response text to show the user" },
    componentMentions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          componentId: { type: Type.STRING, description: "ID of mentioned component" },
          componentName: { type: Type.STRING, description: "Name of mentioned component" },
        },
        required: ["componentId", "componentName"]
      },
      description: "Components referenced in the response"
    },
    suggestedActions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Action type: highlight, centerOn, zoomTo, openInventory, addComponent, etc." },
          label: { type: Type.STRING, description: "Button label for user" },
          payloadJson: { type: Type.STRING, description: "JSON-encoded action parameters (e.g. {\"componentId\":\"xyz\"})" },
          safe: { type: Type.BOOLEAN, description: "Whether this action auto-executes (true) or needs confirmation (false)" }
        },
        required: ["type", "label"]
      },
      description: "Actions the user can take"
    },
    proactiveSuggestion: { type: Type.STRING, description: "Optional proactive tip or suggestion" }
  },
  required: ["message"]
};

// Response type for context-aware chat
export interface ContextAwareChatResponse {
  text: string;
  componentMentions: ComponentReference[];
  suggestedActions: ActionIntent[];
  proactiveSuggestion?: string;
  groundingSources: GroundingSource[];
}

/**
 * Context-aware chat function that understands app state
 * and can suggest actions
 */
export const chatWithContext = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  context: AIContext,
  options?: {
    attachmentBase64?: string;
    attachmentType?: 'image' | 'video';
    useDeepThinking?: boolean;
    enableProactive?: boolean;
  }
): Promise<ContextAwareChatResponse> => {
  const { attachmentBase64, attachmentType, useDeepThinking = false, enableProactive = true } = options || {};

  try {
    // Build context prompt section
    const contextSection = buildContextPrompt(context);

    // Build system instruction with context
    const systemInstruction = `You are CircuitMind, an expert electronics AI assistant integrated into a wiring diagram tool.

${contextSection}

CAPABILITIES:
- You can see the current diagram, selected components, and user's inventory
- You can suggest actions for the user to take (highlight components, zoom, add parts, etc.)
- When mentioning components, include their IDs so they can be highlighted
- Be proactive: if you notice issues or opportunities, mention them

RESPONSE GUIDELINES:
- Be concise and technical but friendly
- When referencing components in the diagram, use their exact names and IDs
- Suggest relevant actions as buttons the user can click
- Actions marked 'safe: true' will auto-execute; 'safe: false' requires confirmation
- Use Google Search for technical specs, datasheets, and current info

ACTION TYPES you can suggest:
- highlight: Highlight a component (payload: {componentId, color?, duration?})
- centerOn: Pan to component (payload: {componentId})
- zoomTo: Change zoom (payload: {level})
- openInventory: Open component library
- openSettings: Open settings panel
- addComponent: Add to diagram (payload: {component})
- createConnection: Wire components (payload: {fromComponentId, fromPin, toComponentId, toPin})

${enableProactive ? 'PROACTIVE MODE: Actively suggest improvements, point out issues, recommend next steps.' : ''}
`;

    let model = 'gemini-3-flash-preview';
    let parts: GeminiPart[] = [{ text: message }];
    let tools: GeminiTool[] = [];
    const config: GeminiConfig = { systemInstruction };

    const isAttachment = !!attachmentBase64;
    const isComplexQuery = message.length > 50 ||
      message.toLowerCase().includes('search') ||
      message.toLowerCase().includes('find') ||
      message.toLowerCase().includes('diagram') ||
      message.toLowerCase().includes('component');

    // Model selection based on query type
    if (isAttachment && attachmentType === 'video') {
      model = 'gemini-3-pro-preview';
      const cleanBase64 = attachmentBase64?.replace(/^data:video\/(mp4|webm|quicktime);base64,/, '') || '';
      parts = [
        { inlineData: { mimeType: 'video/mp4', data: cleanBase64 } },
        { text: message || "Analyze this video." }
      ];
    } else if (isAttachment && attachmentType === 'image') {
      model = 'gemini-3-pro-preview';
      const cleanBase64 = attachmentBase64?.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '') || '';
      parts = [
        { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
        { text: message || "Analyze this electronic component/circuit." }
      ];
    } else if (useDeepThinking) {
      model = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 };
    } else if (isComplexQuery) {
      model = 'gemini-3-pro-preview';
      tools = [{ googleSearch: {} }];
    }

    config.tools = tools.length > 0 ? tools : undefined;
    config.responseMimeType = "application/json";
    config.responseSchema = STRUCTURED_RESPONSE_SCHEMA;

    const response = await ai.models.generateContent({
      model,
      contents: [...history, { role: 'user', parts }],
      config
    });

    // Parse grounding sources
    const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GeminiGroundingChunk[];
    const groundingSources: GroundingSource[] = chunks
      .map((c) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
      .filter((c): c is GroundingSource => c !== null);

    // Parse structured response
    let parsed: ParsedAIResponse = {};
    try {
      parsed = JSON.parse(response.text || '{}') as ParsedAIResponse;
    } catch {
      // Fallback to plain text response
      parsed = { message: response.text || "..." };
    }

    const messageText = parsed.message || response.text || '';

    // Convert component mentions to ComponentReference format
    const componentMentions: ComponentReference[] = (parsed.componentMentions || []).map((m) => {
      const name = m.componentName || '';
      const lowerMessage = messageText.toLowerCase();
      const lowerName = name.toLowerCase();
      const idx = lowerName ? lowerMessage.indexOf(lowerName) : -1;
      return {
        componentId: m.componentId,
        componentName: name,
        mentionStart: idx >= 0 ? idx : 0,
        mentionEnd: idx >= 0 ? idx + name.length : 0,
      };
    });

    // Convert suggested actions (payloadJson is JSON string)
    const suggestedActions: ActionIntent[] = (parsed.suggestedActions || []).map((a) => {
      let payload = {};
      if (a.payloadJson) {
        try {
          payload = JSON.parse(a.payloadJson);
        } catch (_e) {
          console.warn('Failed to parse payloadJson:', a.payloadJson);
        }
      } else if (a.payload) {
        // Fallback for legacy format
        payload = a.payload;
      }
      return {
        type: a.type as ActionType,
        label: a.label,
        payload,
        safe: a.safe ?? false,
      };
    });

    return {
      text: parsed.message || "...",
      componentMentions,
      suggestedActions,
      proactiveSuggestion: parsed.proactiveSuggestion,
      groundingSources,
    };
  } catch (error) {
    console.error("Context Chat Error:", error);
    return {
      text: "Connection error. Please try again.",
      componentMentions: [],
      suggestedActions: [],
      groundingSources: [],
    };
  }
};

/**
 * Generate proactive suggestions based on current state
 */
export const generateProactiveSuggestions = async (
  context: AIContext,
  diagramComponents?: ElectronicComponent[],
  diagramConnections?: WireConnection[]
): Promise<string[]> => {
  try {
    const contextSection = buildContextPrompt(context);

    const prompt = `Based on this electronics project state, suggest 1-3 brief, actionable improvements:

${contextSection}

${diagramComponents ? `Components: ${diagramComponents.map(c => c.name).join(', ')}` : ''}
${diagramConnections ? `Connections: ${diagramConnections.length}` : ''}

Return a JSON array of suggestion strings. Keep each under 100 characters.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const suggestions = JSON.parse(response.text || '[]');
    return normalizeProactiveSuggestions(suggestions);
  } catch (error) {
    console.error("Proactive suggestions error:", error);
    return [];
  }
};

export const normalizeProactiveSuggestions = (input: unknown): string[] => {
  if (!Array.isArray(input)) return [];

  const normalized = input
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && 'label' in item) {
        const label = (item as { label?: unknown }).label;
        if (typeof label === 'string') return label.trim();
      }
      return null;
    })
    .filter((item): item is string => Boolean(item && item.length > 0));

  return normalized.slice(0, 3);
};
