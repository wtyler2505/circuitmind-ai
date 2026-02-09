/**
 * Context Limits — Token estimation and conversation history truncation.
 *
 * Prevents long conversations from exceeding Gemini's context window by:
 * 1. Estimating token count from text (heuristic: ~4 chars/token)
 * 2. Applying a sliding window to keep recent messages within budget
 * 3. Detecting token-overflow errors from the API
 */

import type { GeminiChatMessage } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Approximate characters per token for English text.
 * Gemini uses a BPE-style tokenizer; 4 chars/token is a conservative estimate.
 */
const CHARS_PER_TOKEN = 4;

/** Maximum tokens to allocate for conversation history. */
const MAX_HISTORY_TOKENS = 100_000;

/** Hard cap on message count regardless of token budget. */
const MAX_HISTORY_MESSAGES = 100;

/**
 * Minimum messages to always keep (even if over budget).
 * Ensures the user always sees at least some recent context.
 */
const MIN_KEEP_MESSAGES = 4;

// ---------------------------------------------------------------------------
// Token Estimation
// ---------------------------------------------------------------------------

/**
 * Estimate token count for a single chat message.
 * Counts text parts only — inline data (images/video) are estimated separately.
 */
function estimateMessageTokens(msg: GeminiChatMessage): number {
  let chars = 0;
  for (const part of msg.parts) {
    if ('text' in part) {
      chars += part.text.length;
    } else if ('inlineData' in part) {
      // Base64 data: ~768 tokens per image (Gemini's fixed-size tile encoding)
      // This is approximate; actual cost depends on resolution.
      chars += 3072; // 768 tokens × 4 chars/token
    }
  }
  return Math.ceil(chars / CHARS_PER_TOKEN);
}

/**
 * Estimate total token count for a conversation history.
 */
export function estimateHistoryTokens(history: GeminiChatMessage[]): number {
  let total = 0;
  for (const msg of history) {
    total += estimateMessageTokens(msg);
  }
  return total;
}

// ---------------------------------------------------------------------------
// History Truncation
// ---------------------------------------------------------------------------

/**
 * Truncate conversation history to fit within the token budget.
 *
 * Strategy: Keep the most recent messages that fit within `maxTokens`.
 * Drops oldest messages first. Always keeps at least `MIN_KEEP_MESSAGES`.
 *
 * @param history - Full conversation history (oldest first)
 * @param maxTokens - Maximum token budget (default: MAX_HISTORY_TOKENS)
 * @returns Truncated history and metadata about what was dropped
 */
export function truncateHistory(
  history: GeminiChatMessage[],
  maxTokens: number = MAX_HISTORY_TOKENS
): { messages: GeminiChatMessage[]; dropped: number; totalTokens: number } {
  // Apply hard message cap first
  let messages = history;
  if (messages.length > MAX_HISTORY_MESSAGES) {
    messages = messages.slice(messages.length - MAX_HISTORY_MESSAGES);
  }

  // Estimate tokens for each message (in reverse — newest first)
  const tokenCounts = messages.map(estimateMessageTokens);
  let totalTokens = tokenCounts.reduce((a, b) => a + b, 0);

  // If within budget, return as-is
  if (totalTokens <= maxTokens) {
    return { messages, dropped: history.length - messages.length, totalTokens };
  }

  // Drop oldest messages until within budget (keep at least MIN_KEEP_MESSAGES)
  let startIdx = 0;
  while (
    totalTokens > maxTokens &&
    startIdx < messages.length - MIN_KEEP_MESSAGES
  ) {
    totalTokens -= tokenCounts[startIdx];
    startIdx++;
  }

  const truncated = messages.slice(startIdx);
  const dropped = history.length - truncated.length;

  return { messages: truncated, dropped, totalTokens };
}

// ---------------------------------------------------------------------------
// Error Detection
// ---------------------------------------------------------------------------

/** Patterns that indicate a context/token overflow error from Gemini. */
const TOKEN_OVERFLOW_PATTERNS = [
  /exceeds? the (?:model(?:'s)?|maximum) (?:context|input|token)/i,
  /too many tokens/i,
  /context (?:length|window|limit) exceeded/i,
  /request (?:payload|size|content) (?:is )?too (?:large|big)/i,
  /contents? field must have size/i,
  /maximum (?:input|context) (?:length|tokens)/i,
  /RESOURCE_EXHAUSTED/i,
  /token limit/i,
];

/**
 * Check if an error is a token/context overflow error.
 * Returns true if the error message matches known overflow patterns.
 */
export function isTokenOverflowError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return TOKEN_OVERFLOW_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Get a user-friendly error message for token overflow.
 */
export function getOverflowErrorMessage(dropped: number): string {
  if (dropped > 0) {
    return `This conversation is very long. ${dropped} older messages were trimmed to stay within limits. If the issue persists, try starting a new conversation.`;
  }
  return 'This conversation has exceeded the maximum length. Please start a new conversation to continue.';
}
