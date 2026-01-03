import { AIContext, GroundingSource } from "../../../types";
import { getAIClient, MODELS } from "../client";
import { PROMPTS } from "../prompts";
import { 
    GeminiChatMessage, 
    GeminiPart, 
    GeminiTool, 
    GeminiConfig, 
    GeminiGroundingChunk,
    ContextAwareChatResponse,
    STRUCTURED_RESPONSE_SCHEMA
} from "../types";
import { aiMetricsService } from "../../aiMetricsService";
import { extractComponentMentions, extractSuggestedActions, parseJSONResponse } from "../parsers";
import { ParsedAIResponse } from "../types";

export const chatWithAI = async (
  message: string,
  history: GeminiChatMessage[],
  attachmentBase64?: string,
  attachmentType?: 'image' | 'video',
  useDeepThinking: boolean = false
): Promise<{ text: string, groundingSources: GroundingSource[] }> => {
   const startTime = Date.now();
   let model = MODELS.CHAT; 
   const ai = getAIClient();
   
   try {
    let parts: GeminiPart[] = [{ text: message }];
    let tools: GeminiTool[] = [];
    const config: GeminiConfig = {
      systemInstruction: PROMPTS.CHAT_SYSTEM
    };
    
    const isAttachment = !!attachmentBase64;
    const isComplexQuery = message.length > 50 || message.toLowerCase().includes('search') || message.toLowerCase().includes('find') || message.toLowerCase().includes('latest');

    // 1. Video Analysis
    if (isAttachment && attachmentType === 'video') {
       model = MODELS.VIDEO; // Pro for video - actually gemini-3-pro in original mapping for VIDEO task in chat? 
       // Original: model = 'gemini-2.5-pro'; // Pro for video
       // My client.ts MODELS.VIDEO is 'veo-3.1...'. Wait, original chatWithAI used 'gemini-2.5-pro' for video analysis. 
       // Let's use 'gemini-2.5-pro' directly or add a key for it. 
       // I'll use CONTEXT_CHAT_COMPLEX which is mapped to gemini-2.5-pro in my client.ts
       model = MODELS.CONTEXT_CHAT_COMPLEX;

       const cleanBase64 = attachmentBase64?.replace(/^data:video\/(mp4|webm|quicktime);base64,/, '') || '';
       parts = [
         { inlineData: { mimeType: 'video/mp4', data: cleanBase64 } }, 
         { text: message || "Analyze this video." }
       ];
    }
    // 2. Image Analysis
    else if (isAttachment && attachmentType === 'image') {
      model = MODELS.CONTEXT_CHAT_COMPLEX; // Pro for vision details
      const cleanBase64 = attachmentBase64?.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '') || '';
      parts = [
        { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
        { text: message || "Analyze this electronic component/circuit." }
      ];
    }
    // 3. Deep Thinking Mode
    else if (useDeepThinking) {
      model = MODELS.THINKING;
      config.thinkingConfig = { thinkingBudget: 32768 };
    }
    // 4. Complex Text Queries (Standard Pro)
    else if (isComplexQuery) {
      model = MODELS.CONTEXT_CHAT_COMPLEX; // Pro for complex/search
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
      
    aiMetricsService.logMetric({ model, operation: 'chatWithAI', latencyMs: Date.now() - startTime, success: true });

    return { 
      text: response.text || "...", 
      groundingSources 
    };
   } catch (error) {
     aiMetricsService.logMetric({ model, operation: 'chatWithAI', latencyMs: Date.now() - startTime, success: false, error: String(error) });
     console.error("Chat Error", error);
     return { text: "Connection error.", groundingSources: [] };
   }
}

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
  const startTime = Date.now();
  let model = MODELS.CONTEXT_CHAT_DEFAULT;
  const ai = getAIClient();

  try {
    // Adaptive Teacher Logic
    const userProfile = (context as any).userProfile;
    let toneInstruction = "Be concise and technical.";
    
    if (userProfile?.experienceLevel === 'beginner') {
        toneInstruction = "You are a patient teacher. Explain concepts simply. Use analogies. ALWAYS warn about safety/voltage.";
    } else if (userProfile?.experienceLevel === 'expert') {
        toneInstruction = "Be extremely concise. Use industry-standard terminology. Focus on datasheets and efficiency. Skip the basics.";
    }

    const systemInstruction = await PROMPTS.CONTEXT_AWARE_CHAT(context, toneInstruction, message, enableProactive);

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
      model = MODELS.CONTEXT_CHAT_COMPLEX;
      const cleanBase64 = attachmentBase64?.replace(/^data:video\/(mp4|webm|quicktime);base64,/, '') || '';
      parts = [
        { inlineData: { mimeType: 'video/mp4', data: cleanBase64 } },
        { text: message || "Analyze this video." }
      ];
    } else if (isAttachment && attachmentType === 'image') {
      model = MODELS.CONTEXT_CHAT_COMPLEX;
      const cleanBase64 = attachmentBase64?.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '') || '';
      parts = [
        { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
        { text: message || "Analyze this electronic component/circuit." }
      ];
    } else if (useDeepThinking) {
      model = MODELS.THINKING;
      config.thinkingConfig = { thinkingBudget: 32768 };
    } else if (isComplexQuery) {
      model = MODELS.CONTEXT_CHAT_COMPLEX;
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
      parsed = parseJSONResponse<ParsedAIResponse>(response.text || '{}');
    } catch {
      // Fallback to plain text response
      parsed = { message: response.text || "..." };
    }

    const messageText = parsed.message || response.text || '';

    // Convert component mentions
    const componentMentions = extractComponentMentions(parsed.componentMentions, messageText);

    // Convert suggested actions
    const suggestedActions = extractSuggestedActions(parsed.suggestedActions);

    const metricId = aiMetricsService.logMetric({ model, operation: 'chatWithContext', latencyMs: Date.now() - startTime, success: true });

    return {
      text: parsed.message || "...",
      componentMentions,
      suggestedActions,
      proactiveSuggestion: parsed.proactiveSuggestion,
      groundingSources,
      metricId // Return the ID
    };
  } catch (error) {
    aiMetricsService.logMetric({ model, operation: 'chatWithContext', latencyMs: Date.now() - startTime, success: false, error: String(error) });
    console.error("Context Chat Error:", error);
    return {
      text: "Connection error. Please try again.",
      componentMentions: [],
      suggestedActions: [],
      groundingSources: [],
    };
  }
};
