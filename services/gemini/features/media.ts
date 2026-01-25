import { getAIClient, getApiKey, MODELS, APIError } from "../client";
import { PROMPTS } from "../prompts";
import { aiMetricsService } from "../../aiMetricsService";
import { Modality } from "@google/genai";
import { GoogleGenAI } from "@google/genai"; // Needed for local instantiation in generateConceptImage

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  const startTime = Date.now();
  const model = MODELS.AUDIO_TRANSCRIPTION;
  const ai = getAIClient();
  try {
    const cleanBase64 = audioBase64.split(',')[1] || audioBase64;
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'audio/wav', data: cleanBase64 } },
            { text: PROMPTS.TRANSCRIBE_AUDIO }
          ]
        }
      ]
    });
    aiMetricsService.logMetric({ model, operation: 'transcribeAudio', latencyMs: Date.now() - startTime, success: true });
    return response.text || "";
  } catch (error) {
    aiMetricsService.logMetric({ model, operation: 'transcribeAudio', latencyMs: Date.now() - startTime, success: false, error: String(error) });
    console.error("Transcription Error", error);
    throw error;
  }
}

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.TTS,
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
  const ai = getAIClient();
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: MODELS.IMAGE_GEN,
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

export const generateConceptImage = async (
  prompt: string,
  size: '1K' | '2K' | '4K',
  aspectRatio: string = '16:9',
  enableSearch: boolean = false
): Promise<string> => {
  const startTime = Date.now();
  const model = MODELS.IMAGE_GEN;
  
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
    
    const config: any = {
        imageConfig: {
          imageSize: size,
          aspectRatio: aspectRatio,
        },
    };
    
    if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    return await aiClient.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: config,
    });
  };

  try {
    const result = (await executeRequest()).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    aiMetricsService.logMetric({ model, operation: 'generateConceptImage', latencyMs: Date.now() - startTime, success: true });
    return result;
  } catch (error: unknown) {
     aiMetricsService.logMetric({ model, operation: 'generateConceptImage', latencyMs: Date.now() - startTime, success: false, error: String(error) });
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

// Generates a small 1K square image for thumbnails
export const generateComponentThumbnail = async (componentName: string, customPrompt?: string): Promise<string> => {
    const prompt = PROMPTS.GENERATE_THUMBNAIL(componentName);
    return await generateConceptImage(
        customPrompt || prompt, 
        '1K', 
        '1:1',
        true
    );
};

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
      model: MODELS.VIDEO,
      prompt: PROMPTS.GENERATE_VIDEO(prompt),
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

export const embedText = async (text: string): Promise<number[]> => {
  const model = MODELS.EMBEDDING;
  const ai = getAIClient();
  try {
    const result = await ai.models.embedContent({
      model: model,
      contents: [{ parts: [{ text }] }],
    });
    
    if (result.embeddings?.[0]?.values) {
        return result.embeddings[0].values;
    }
    throw new Error("No embedding returned");
  } catch (error) {
    console.error("Embedding Error", error);
    throw error;
  }
};
