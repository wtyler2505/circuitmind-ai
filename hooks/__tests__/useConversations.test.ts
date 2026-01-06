import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConversations } from '../useConversations';
import type { Conversation, EnhancedChatMessage } from '../../types';

const storageState = vi.hoisted(() => ({
  conversations: [] as Conversation[],
  messageStore: new Map<string, EnhancedChatMessage[]>(),
}));

const storageMocks = vi.hoisted(() => ({
  saveConversation: vi.fn(async (conversation: Conversation) => {
    const idx = storageState.conversations.findIndex((c) => c.id === conversation.id);
    if (idx >= 0) {
      storageState.conversations[idx] = conversation;
    } else {
      storageState.conversations.push(conversation);
    }
  }),
  listConversations: vi.fn(async () => [...storageState.conversations]),
  getPrimaryConversation: vi.fn(async () => storageState.conversations.find((c) => c.isPrimary) || null),
  saveMessage: vi.fn(async (message: EnhancedChatMessage) => {
    const list = storageState.messageStore.get(message.conversationId) || [];
    list.push(message);
    storageState.messageStore.set(message.conversationId, list);
  }),
  loadMessages: vi.fn(async (id: string) => storageState.messageStore.get(id) || []),
}));

vi.mock('../../services/storage', () => ({
  ...storageMocks,
  loadConversation: vi.fn(async () => null),
  deleteConversation: vi.fn(async () => undefined),
  getRecentMessages: vi.fn(async () => []),
}));

beforeEach(() => {
  storageState.conversations.splice(0, storageState.conversations.length);
  storageState.messageStore.clear();
  vi.clearAllMocks();
});
describe('useConversations', () => {
  it('creates a primary conversation and seeds a welcome message', async () => {
    const { result } = renderHook(() => useConversations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeConversationId).toBeTruthy();
    expect(result.current.messages[0].content).toContain('System Online');
  });

  it('adds a message even when no active conversation is ready', async () => {
    const { result } = renderHook(() => useConversations());

    await act(async () => {
      const message = await result.current.addMessage({
        role: 'user',
        content: 'Hello there',
        linkedComponents: [],
        suggestedActions: [],
      });
      expect(message.conversationId).toBeTruthy();
    });

    await waitFor(() => expect(result.current.activeConversationId).toBeTruthy());
  });
});
