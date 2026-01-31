import { Schema, Type, GenerateContentConfig } from "@google/genai";
import {
  ActionType,
  ComponentReference,
  ActionIntent,
  GroundingSource
} from "../../types";

// =====================================
// Gemini SDK Type Definitions
// =====================================

/** Content part with text */
export interface GeminiTextPart {
  text: string;
}

/** Content part with inline data (images/videos) */
export interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

/** Union type for content parts */
export type GeminiPart = GeminiTextPart | GeminiInlineDataPart;

/** Chat message for conversation history */
export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

/** Tool configuration for Gemini */
export interface GeminiTool {
  googleSearch?: Record<string, unknown>;
  codeExecution?: Record<string, unknown>;
}

/** Generation configuration */
export interface GeminiConfig extends GenerateContentConfig {
  imageConfig?: {
    imageSize: string;
    aspectRatio: string;
  };
  // speechConfig is already in GenerateContentConfig
  thinkingConfig?: { thinkingBudget: number }; 
}

/** Grounding chunk from Gemini response */
export interface GeminiGroundingChunk {
  web?: {
    title: string;
    uri: string;
  };
}

/** Component mention from AI response */
export interface AIComponentMention {
  componentId: string;
  componentName?: string;
  reason?: string;
  status?: string;
}

/** Suggested action from AI response */
export interface AISuggestedAction {
  type: ActionType;
  payload?: Record<string, unknown>;
  payloadJson?: string;
  label?: string;
  safe?: boolean;
  description?: string;
}

/** Parsed structured response from AI */
export interface ParsedAIResponse {
  message?: string;
  componentMentions?: AIComponentMention[];
  suggestedActions?: AISuggestedAction[];
  proactiveSuggestion?: string;
}

/** Response type for context-aware chat */
export interface ContextAwareChatResponse {
  text: string;
  componentMentions: ComponentReference[];
  suggestedActions: ActionIntent[];
  proactiveSuggestion?: string;
  groundingSources: GroundingSource[];
  metricId?: string;
}

// =====================================
// Schemas
// =====================================

export const WIRING_SCHEMA: Schema = {
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
export const COMPONENT_SCHEMA: Schema = {
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
export const PART_FINDER_SCHEMA: Schema = {
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

// Schema for structured AI response with actions
export const STRUCTURED_RESPONSE_SCHEMA: Schema = {
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

// Schema for Smart Fill Component
export const SMART_FILL_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        description: {type: Type.STRING},
        pins: {type: Type.ARRAY, items: {type: Type.STRING}},
        datasheetUrl: {type: Type.STRING},
        type: {type: Type.STRING}
    }
};

// Schema for Assist Component Editor
export const ASSIST_EDITOR_SCHEMA: Schema = {
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
};

// Schema for Proactive Suggestions
export const PROACTIVE_SUGGESTIONS_SCHEMA: Schema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
};
