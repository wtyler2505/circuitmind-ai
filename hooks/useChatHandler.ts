import { useCallback } from 'react';
import type { ElectronicComponent, EnhancedChatMessage, AIContext, ActionIntent, ACTION_SAFETY as ActionSafetyType } from '../types';
import { ACTION_SAFETY } from '../types';
import { chatWithAI, chatWithContext } from '../services/gemini/features/chat';
import { generateEditedImage, generateConceptImage, generateCircuitVideo } from '../services/gemini/features/media';
import { generateWiringDiagram } from '../services/gemini/features/wiring';
import { truncateHistory } from '../services/gemini/contextLimits';
import type { WiringDiagram } from '../types';

type GenerationMode = 'chat' | 'image' | 'video';

interface ConversationManager {
  messages: EnhancedChatMessage[];
  addMessage: (msg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'>) => Promise<EnhancedChatMessage>;
}

interface AIActionsInterface {
  autonomySettings: {
    autoExecuteSafeActions: boolean;
    customSafeActions: string[];
    customUnsafeActions: string[];
  };
  execute: (action: ActionIntent) => Promise<{ success: boolean; error?: string }>;
}

interface UseChatHandlerParams {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingText: (text: string) => void;
  generationMode: GenerationMode;
  imageSize: string;
  aspectRatio: string;
  inventory: ElectronicComponent[];
  aiContext: AIContext | null;
  aiActions: AIActionsInterface;
  useDeepThinking: boolean;
  conversationManager: ConversationManager;
  updateDiagram: (diagram: WiringDiagram) => void;
}

export function useChatHandler({
  isLoading,
  setIsLoading,
  setLoadingText,
  generationMode,
  imageSize,
  aspectRatio,
  inventory,
  aiContext,
  aiActions,
  useDeepThinking,
  conversationManager,
  updateDiagram,
}: UseChatHandlerParams) {
  const handleSendEnhancedMessage = useCallback(
    async (
      content: string,
      attachment?: { base64: string; type: 'image' | 'video' | 'document'; name?: string }
    ) => {
      if ((!content.trim() && !attachment) || isLoading) return;

      const attachmentData = attachment?.base64;

      const userEnhancedMsg: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'> = {
        role: 'user',
        content,
        linkedComponents: [],
        suggestedActions: [],
        image: attachment?.type === 'image' ? attachmentData : undefined,
        video: attachment?.type === 'video' ? attachmentData : undefined,
      };

      const sentUserMessage = await conversationManager.addMessage(userEnhancedMsg);

      setIsLoading(true);
      setLoadingText('Thinking...');

      try {
        const conversationMessages = conversationManager.messages.filter(
          (msg) => msg.conversationId === sentUserMessage.conversationId
        );
        const rawHistory = conversationMessages
          .filter((msg) => msg.role === 'user' || msg.role === 'model')
          .map((msg) => ({
            role: msg.role as 'user' | 'model',
            parts: [{ text: msg.content }],
          }));

        // Truncate history to fit within Gemini's context window.
        // Cast back to the text-only shape since we only construct text parts above.
        const { messages: truncatedHistory, dropped } = truncateHistory(rawHistory);
        const chatHistory = truncatedHistory as Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
        if (dropped > 0) {
          console.warn(
            `[ChatHandler] Truncated ${dropped} older messages to fit context window`
          );
        }

        if (generationMode === 'image') {
          await handleImageGeneration(
            content,
            attachmentData,
            attachment?.type,
            imageSize,
            aspectRatio,
            conversationManager
          );
        } else if (generationMode === 'video') {
          await handleVideoGeneration(content, aspectRatio, attachmentData, conversationManager);
        } else {
          await handleChatMode(
            content,
            chatHistory,
            attachmentData,
            attachment?.type,
            inventory,
            aiContext,
            aiActions,
            useDeepThinking,
            conversationManager,
            updateDiagram,
            setLoadingText
          );
        }
      } catch (error: unknown) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await conversationManager.addMessage({
          role: 'system',
          content: `Error: ${errorMessage}`,
          linkedComponents: [],
          suggestedActions: [],
        });
      } finally {
        setIsLoading(false);
        setLoadingText('');
      }
    },
    [
      isLoading,
      generationMode,
      imageSize,
      aspectRatio,
      inventory,
      aiContext,
      aiActions,
      useDeepThinking,
      conversationManager,
      updateDiagram,
      setIsLoading,
      setLoadingText,
    ]
  );

  return handleSendEnhancedMessage;
}

async function handleImageGeneration(
  content: string,
  attachmentData: string | undefined,
  attachmentType: string | undefined,
  imageSize: string,
  aspectRatio: string,
  conversationManager: ConversationManager
): Promise<void> {
  let imgData = '';
  if (attachmentType === 'image' && attachmentData) {
    imgData = await generateEditedImage(attachmentData, content);
  } else {
    imgData = await generateConceptImage(content, imageSize as '1K' | '2K' | '4K', aspectRatio);
  }
  await conversationManager.addMessage({
    role: 'model',
    content: `Generated image for "${content}"`,
    linkedComponents: [],
    suggestedActions: [],
    image: imgData,
  });
}

async function handleVideoGeneration(
  content: string,
  aspectRatio: string,
  attachmentData: string | undefined,
  conversationManager: ConversationManager
): Promise<void> {
  const videoAspect = aspectRatio === '9:16' ? '9:16' : '16:9';
  const videoUrl = await generateCircuitVideo(content, videoAspect, attachmentData);
  await conversationManager.addMessage({
    role: 'model',
    content: `Video generated for "${content}"`,
    linkedComponents: [],
    suggestedActions: [],
    video: videoUrl,
  });
}

async function handleChatMode(
  content: string,
  chatHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  attachmentData: string | undefined,
  attachmentType: string | undefined,
  inventory: ElectronicComponent[],
  aiContext: AIContext | null,
  aiActions: AIActionsInterface,
  useDeepThinking: boolean,
  conversationManager: ConversationManager,
  updateDiagram: (diagram: WiringDiagram) => void,
  setLoadingText: (text: string) => void
): Promise<void> {
  const isDiagramRequest =
    content.toLowerCase().includes('diagram') || content.toLowerCase().includes('circuit');

  if (isDiagramRequest) {
    setLoadingText('Designing Circuit...');
    const newDiagram = await generateWiringDiagram(content, inventory);
    updateDiagram(newDiagram);
    await conversationManager.addMessage({
      role: 'model',
      content: `Here is the wiring diagram for: ${newDiagram.title}.`,
      linkedComponents: newDiagram.components.map((c) => ({
        componentId: c.id,
        componentName: c.name,
        mentionStart: 0,
        mentionEnd: 0,
      })),
      suggestedActions: [
        { type: 'highlight', payload: {}, label: 'Highlight all', safe: true },
        { type: 'zoomTo', payload: { level: 1 }, label: 'Fit view', safe: true },
      ],
      diagramData: newDiagram,
    });
  } else if (aiContext) {
    setLoadingText('Analyzing...');
    const response = await chatWithContext(content, chatHistory, aiContext, {
      enableProactive: true,
      attachmentBase64: attachmentData,
      attachmentType: attachmentType as 'image' | 'video' | 'document' | undefined,
    });

    await conversationManager.addMessage({
      role: 'model',
      content: response.text,
      linkedComponents: response.componentMentions,
      suggestedActions: response.suggestedActions,
      groundingSources: response.groundingSources,
      metricId: response.metricId,
    });

    // Autonomy
    if (aiActions.autonomySettings.autoExecuteSafeActions) {
      for (const action of response.suggestedActions) {
        const isSafe = aiActions.autonomySettings.customSafeActions.includes(action.type)
          ? true
          : aiActions.autonomySettings.customUnsafeActions.includes(action.type)
            ? false
            : (ACTION_SAFETY[action.type as keyof typeof ACTION_SAFETY] ?? false);

        if (isSafe) await aiActions.execute(action);
      }
    }
  } else {
    setLoadingText('Analyzing...');
    const { text, groundingSources } = await chatWithAI(
      content,
      chatHistory,
      attachmentData,
      attachmentType === 'video' ? 'video' : 'image',
      useDeepThinking
    );
    await conversationManager.addMessage({
      role: 'model',
      content: text,
      linkedComponents: [],
      suggestedActions: [],
      groundingSources,
    });
  }
}
