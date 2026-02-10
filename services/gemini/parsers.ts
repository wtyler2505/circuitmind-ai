import { ActionIntent, ActionType, ComponentReference } from "../../types";
import { ParsedAIResponse, AISuggestedAction, AIComponentMention } from "./types";

/**
 * Normalizes proactive suggestions from AI response
 */
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

/**
 * Parses raw JSON text from AI response, handling common formatting issues
 */
export const parseJSONResponse = <T>(text: string): T => {
    try {
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText) as T;
    } catch (error) {
        // Basic fallback if strict JSON parse fails? 
        // For now, re-throw so the caller can handle or default
        throw new Error(`Failed to parse AI JSON response: ${String(error)}`);
    }
};

/**
 * Extracts component mentions from parsed AI response
 */
export const extractComponentMentions = (
    parsedMentions: AIComponentMention[] | undefined,
    messageText: string
): ComponentReference[] => {
    return (parsedMentions || []).map((m) => {
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
};

/**
 * Extracts and normalizes suggested actions from parsed AI response
 */
export const extractSuggestedActions = (
    parsedActions: AISuggestedAction[] | undefined
): ActionIntent[] => {
    return (parsedActions || []).map((a) => {
        let payload = {};
        if (a.payloadJson) {
            try {
                // LLMs sometimes output escaped JSON or include extra quotes
                const cleanJson = a.payloadJson.replace(/^`+|`+$/g, '').trim();
                payload = JSON.parse(cleanJson);
            } catch (_e) {
                console.warn('Failed to parse payloadJson:', a.payloadJson);
                // If it looks like a simple string, maybe it was meant to be a component ID?
                if (typeof a.payloadJson === 'string' && a.payloadJson.length < 50 && !a.payloadJson.includes('{')) {
                    payload = { componentId: a.payloadJson };
                }
            }
        } else if (a.payload) {
            // Fallback for legacy format
            payload = a.payload;
        }
        return {
            type: a.type as ActionType,
            label: a.label ?? '',
            payload,
            safe: a.safe ?? false,
        };
    });
};
