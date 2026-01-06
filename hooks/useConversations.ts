import { useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, EnhancedChatMessage, WiringDiagram, GroundingSource } from '../types';
import {
  saveConversation,
  listConversations,
  deleteConversation as deleteConversationFromDB,
  getPrimaryConversation,
  saveMessage,
  loadMessages,
} from '../services/storage';

// Generate a unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Generate title from first message
const generateTitle = (content: string): string => {
  const cleaned = content.replace(/\n/g, ' ').trim();
  if (cleaned.length <= 50) return cleaned;
  return cleaned.substring(0, 47) + '...';
};

const WELCOME_MESSAGE = 'System Online. I am CircuitMind AI.\n\nI can generate wiring diagrams, create concept art, analyze your circuit photos/videos, or answer complex questions.';

export interface UseConversationsReturn {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: EnhancedChatMessage[];
  isLoading: boolean;

  // Conversation CRUD
  createConversation: (isPrimary?: boolean) => Promise<string>;
  switchConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;

  // Message operations
  addMessage: (
    message: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'>
  ) => Promise<EnhancedChatMessage>;
  updateMessage: (id: string, updates: Partial<EnhancedChatMessage>) => Promise<void>;

  // Utility
  getOrCreatePrimaryConversation: () => Promise<string>;
  refreshConversations: () => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track if we've initialized
  const initialized = useRef(false);

  // Get active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Load conversations on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      setIsLoading(true);
      try {
        // Load all conversations (most recent first)
        const convs = await listConversations(50);
        setConversations(convs);

        // Try to find or create primary conversation
        let primary = await getPrimaryConversation();
        if (!primary && convs.length === 0) {
          // Create first primary conversation
          const id = generateId();
          primary = {
            id,
            title: 'CircuitMind Session',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messageCount: 0,
            isPrimary: true,
          };
          await saveConversation(primary);
          setConversations([primary]);
        }

        // Activate primary or most recent
        const toActivate = primary || convs[0];
        if (toActivate) {
          setActiveConversationId(toActivate.id);
          const msgs = await loadMessages(toActivate.id);
          if (msgs.length === 0 && toActivate.isPrimary) {
            const welcomeMessage: EnhancedChatMessage = {
              id: generateId(),
              conversationId: toActivate.id,
              role: 'model',
              content: WELCOME_MESSAGE,
              timestamp: Date.now(),
              linkedComponents: [],
              suggestedActions: [],
            };
            await saveMessage(welcomeMessage);
            setMessages([welcomeMessage]);

            const updatedConversation: Conversation = {
              ...toActivate,
              messageCount: 1,
              updatedAt: Date.now(),
              lastMessagePreview: welcomeMessage.content.substring(0, 100),
            };
            await saveConversation(updatedConversation);
            setConversations((prev) =>
              prev.map((c) => (c.id === updatedConversation.id ? updatedConversation : c))
            );
          } else {
            setMessages(msgs);
          }
        }
      } catch (e) {
        console.error('Failed to initialize conversations:', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const createConversationInternal = useCallback(async (
    isPrimary: boolean,
    title?: string
  ): Promise<Conversation> => {
    const id = generateId();
    const conversation: Conversation = {
      id,
      title: title || (isPrimary ? 'CircuitMind Session' : 'New Conversation'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
      isPrimary,
    };

    await saveConversation(conversation);
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(id);
    setMessages([]);

    return conversation;
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (isPrimary = false): Promise<string> => {
    const conversation = await createConversationInternal(isPrimary);
    return conversation.id;
  }, [createConversationInternal]);

  // Switch to a different conversation
  const switchConversation = useCallback(async (id: string): Promise<void> => {
    if (id === activeConversationId) return;

    setIsLoading(true);
    try {
      const msgs = await loadMessages(id);
      setMessages(msgs);
      setActiveConversationId(id);
    } catch (e) {
      console.error('Failed to switch conversation:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId]);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string): Promise<void> => {
    await deleteConversationFromDB(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));

    // If we deleted the active conversation, switch to another
    if (id === activeConversationId) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        await switchConversation(remaining[0].id);
      } else {
        // Create new primary
        await createConversation(true);
      }
    }
  }, [activeConversationId, conversations, switchConversation, createConversation]);

  // Rename a conversation
  const renameConversation = useCallback(async (id: string, title: string): Promise<void> => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    const updated: Conversation = {
      ...conv,
      title,
      updatedAt: Date.now(),
    };

    await saveConversation(updated);
    setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, [conversations]);

  // Add a message to the active conversation
  const addMessage = useCallback(
    async (
      messageData: Omit<EnhancedChatMessage, 'id' | 'conversationId' | 'timestamp'>
    ): Promise<EnhancedChatMessage> => {
      const createdConversation = !activeConversationId
        ? await createConversationInternal(true, 'CircuitMind Session')
        : null;

      const conversationId = activeConversationId || createdConversation?.id;
      if (!conversationId) {
        throw new Error('No active conversation available');
      }

      const message: EnhancedChatMessage = {
        ...messageData,
        id: generateId(),
        conversationId,
        timestamp: Date.now(),
        linkedComponents: messageData.linkedComponents || [],
        suggestedActions: messageData.suggestedActions || [],
      };

      await saveMessage(message);

      setMessages((prev) => {
        if (activeConversationId && conversationId !== activeConversationId) {
          return prev;
        }
        return [...prev, message];
      });

      const conv = conversations.find((c) => c.id === conversationId) || createdConversation;
      if (conv) {
        const isFirstMessage = conv.messageCount === 0 && messageData.role === 'user';
        const updated: Conversation = {
          ...conv,
          messageCount: conv.messageCount + 1,
          updatedAt: Date.now(),
          lastMessagePreview: messageData.content.substring(0, 100),
          title: isFirstMessage ? generateTitle(messageData.content) : conv.title,
        };
        await saveConversation(updated);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? updated : c))
        );
      }

      return message;
    },
    [activeConversationId, conversations, createConversationInternal]
  );

  // Update an existing message
  const updateMessage = useCallback(
    async (id: string, updates: Partial<EnhancedChatMessage>): Promise<void> => {
      const message = messages.find((m) => m.id === id);
      if (!message) return;

      const updated: EnhancedChatMessage = {
        ...message,
        ...updates,
      };

      await saveMessage(updated);
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
    },
    [messages]
  );

  // Get or create primary conversation
  const getOrCreatePrimaryConversation = useCallback(async (): Promise<string> => {
    const primary = await getPrimaryConversation();
    if (primary) {
      return primary.id;
    }
    return createConversation(true);
  }, [createConversation]);

  // Refresh conversations list
  const refreshConversations = useCallback(async (): Promise<void> => {
    const convs = await listConversations(50);
    setConversations(convs);
  }, []);

  return {
    // State
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoading,

    // Conversation CRUD
    createConversation,
    switchConversation,
    deleteConversation,
    renameConversation,

    // Message operations
    addMessage,
    updateMessage,

    // Utility
    getOrCreatePrimaryConversation,
    refreshConversations,
  };
}

// Helper to convert old ChatMessage to EnhancedChatMessage
export function migrateMessage(
  old: {
    id: string;
    role: 'user' | 'model' | 'system';
    content: string;
    timestamp?: number;
    diagramData?: WiringDiagram;
    image?: string;
    video?: string;
    groundingSources?: GroundingSource[];
    audioResponse?: string;
  },
  conversationId: string
): EnhancedChatMessage {
  return {
    id: old.id,
    conversationId,
    role: old.role,
    content: old.content,
    timestamp: old.timestamp || Date.now(),
    diagramData: old.diagramData,
    image: old.image,
    video: old.video,
    groundingSources: old.groundingSources,
    audioResponse: old.audioResponse,
    linkedComponents: [],
    suggestedActions: [],
  };
}
