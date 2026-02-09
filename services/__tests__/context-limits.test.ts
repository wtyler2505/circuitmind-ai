/**
 * Tests for context limits — token estimation and history truncation.
 *
 * Verifies that long conversations are safely truncated before being
 * sent to Gemini, and that token-overflow errors are correctly detected.
 */

import { describe, it, expect } from 'vitest';
import {
  estimateHistoryTokens,
  truncateHistory,
  isTokenOverflowError,
  getOverflowErrorMessage,
} from '../gemini/contextLimits';
import type { GeminiChatMessage } from '../gemini/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMsg(role: 'user' | 'model', text: string): GeminiChatMessage {
  return { role, parts: [{ text }] };
}

function makeHistory(count: number, charsPerMsg = 100): GeminiChatMessage[] {
  const messages: GeminiChatMessage[] = [];
  for (let i = 0; i < count; i++) {
    const role = i % 2 === 0 ? 'user' : 'model';
    messages.push(makeMsg(role as 'user' | 'model', 'x'.repeat(charsPerMsg)));
  }
  return messages;
}

// ---------------------------------------------------------------------------
// estimateHistoryTokens
// ---------------------------------------------------------------------------

describe('estimateHistoryTokens', () => {
  it('returns 0 for empty history', () => {
    expect(estimateHistoryTokens([])).toBe(0);
  });

  it('estimates tokens from text length (~4 chars/token)', () => {
    const history = [makeMsg('user', 'Hello world!')]; // 12 chars → 3 tokens
    expect(estimateHistoryTokens(history)).toBe(3);
  });

  it('sums across multiple messages', () => {
    const history = [
      makeMsg('user', 'a'.repeat(400)),  // 100 tokens
      makeMsg('model', 'b'.repeat(800)), // 200 tokens
    ];
    expect(estimateHistoryTokens(history)).toBe(300);
  });

  it('accounts for inline data parts', () => {
    const history: GeminiChatMessage[] = [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'image/png', data: 'base64...' } },
        { text: 'Describe this' },
      ],
    }];
    // 3072 chars for image + 13 chars text → (3072 + 13) / 4 = 771.25 → 772
    const tokens = estimateHistoryTokens(history);
    expect(tokens).toBeGreaterThan(700);
  });
});

// ---------------------------------------------------------------------------
// truncateHistory
// ---------------------------------------------------------------------------

describe('truncateHistory', () => {
  it('returns all messages when within budget', () => {
    const history = makeHistory(10, 100); // 10 msgs × 25 tokens = 250 tokens
    const result = truncateHistory(history, 100_000);
    expect(result.messages).toHaveLength(10);
    expect(result.dropped).toBe(0);
  });

  it('truncates oldest messages when over token budget', () => {
    // 200 messages × 1000 chars/msg = 200K chars ≈ 50K tokens
    const history = makeHistory(200, 1000);
    const result = truncateHistory(history, 10_000); // 10K token budget
    expect(result.messages.length).toBeLessThan(200);
    expect(result.dropped).toBeGreaterThan(0);
    expect(result.totalTokens).toBeLessThanOrEqual(10_000);
  });

  it('keeps at least 4 messages even if over budget', () => {
    // 10 messages of 100K chars each — way over any budget
    const history = makeHistory(10, 100_000);
    const result = truncateHistory(history, 100);
    expect(result.messages.length).toBeGreaterThanOrEqual(4);
  });

  it('applies hard message cap of 100', () => {
    const history = makeHistory(200, 10); // Small messages but many
    const result = truncateHistory(history, 1_000_000);
    expect(result.messages.length).toBeLessThanOrEqual(100);
  });

  it('preserves newest messages (drops oldest)', () => {
    const history = [
      makeMsg('user', 'OLD_MESSAGE_1'),
      makeMsg('model', 'OLD_MESSAGE_2'),
      makeMsg('user', 'OLD_MESSAGE_3'),
      makeMsg('model', 'OLD_MESSAGE_4'),
      makeMsg('user', 'RECENT_MESSAGE_5'),
      makeMsg('model', 'RECENT_MESSAGE_6'),
    ];
    // Budget that fits ~2 messages worth (each msg ~4 tokens)
    const result = truncateHistory(history, 10);
    // Should keep the newest messages
    const lastMsg = result.messages[result.messages.length - 1];
    expect((lastMsg.parts[0] as { text: string }).text).toBe('RECENT_MESSAGE_6');
  });

  it('reports accurate dropped count', () => {
    const history = makeHistory(50, 1000); // 50 × 250 tokens = 12500 tokens
    const result = truncateHistory(history, 5000); // fits ~20 messages
    expect(result.dropped).toBe(50 - result.messages.length);
  });
});

// ---------------------------------------------------------------------------
// isTokenOverflowError
// ---------------------------------------------------------------------------

describe('isTokenOverflowError', () => {
  it('detects "exceeds the model context" pattern', () => {
    expect(
      isTokenOverflowError(new Error('Request exceeds the model context length'))
    ).toBe(true);
  });

  it('detects "too many tokens" pattern', () => {
    expect(isTokenOverflowError('Too many tokens in request')).toBe(true);
  });

  it('detects "RESOURCE_EXHAUSTED" pattern', () => {
    expect(
      isTokenOverflowError(new Error('RESOURCE_EXHAUSTED: quota exceeded'))
    ).toBe(true);
  });

  it('detects "contents field must have size" pattern', () => {
    expect(
      isTokenOverflowError(new Error('The contents field must have size <= 1 MB'))
    ).toBe(true);
  });

  it('detects "context length exceeded" pattern', () => {
    expect(
      isTokenOverflowError(new Error('context length exceeded'))
    ).toBe(true);
  });

  it('detects "token limit" pattern', () => {
    expect(
      isTokenOverflowError(new Error('Exceeded token limit for this model'))
    ).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isTokenOverflowError(new Error('Network timeout'))).toBe(false);
    expect(isTokenOverflowError(new Error('PERMISSION_DENIED'))).toBe(false);
    expect(isTokenOverflowError('Connection refused')).toBe(false);
  });

  it('handles null/undefined gracefully', () => {
    expect(isTokenOverflowError(null)).toBe(false);
    expect(isTokenOverflowError(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getOverflowErrorMessage
// ---------------------------------------------------------------------------

describe('getOverflowErrorMessage', () => {
  it('mentions dropped count when messages were trimmed', () => {
    const msg = getOverflowErrorMessage(42);
    expect(msg).toContain('42');
    expect(msg).toContain('trimmed');
  });

  it('suggests new conversation when no messages could be dropped', () => {
    const msg = getOverflowErrorMessage(0);
    expect(msg).toContain('new conversation');
  });
});
