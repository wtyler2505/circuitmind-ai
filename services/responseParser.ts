/**
 * Response Parser Service
 *
 * Parses AI text responses to detect:
 * - Component mentions (clickable chips)
 * - Action patterns (suggested actions)
 * - Code blocks
 * - Special formatting
 */

import { ComponentReference, ActionIntent, ActionType, ElectronicComponent } from '../types';

/**
 * Result of parsing a response
 */
export interface ParsedResponse {
  text: string;
  componentMentions: ComponentReference[];
  detectedActions: ActionIntent[];
  codeBlocks: CodeBlock[];
  hasMarkdown: boolean;
}

/**
 * A code block found in the response
 */
export interface CodeBlock {
  language: string;
  code: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Parse component mentions from text
 * Looks for patterns like "the ESP32", "your Arduino", component names from inventory
 */
export function parseComponentMentions(
  text: string,
  availableComponents: ElectronicComponent[]
): ComponentReference[] {
  const mentions: ComponentReference[] = [];
  const seenIds = new Set<string>();

  // Build a map of component names to IDs (case-insensitive)
  const nameToComponent = new Map<string, ElectronicComponent>();
  for (const comp of availableComponents) {
    nameToComponent.set(comp.name.toLowerCase(), comp);
    // Also add common variations
    const simplified = comp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    nameToComponent.set(simplified, comp);
  }

  // Find mentions in text
  const lowerText = text.toLowerCase();

  for (const comp of availableComponents) {
    const nameLower = comp.name.toLowerCase();
    let searchPos = 0;

    while (true) {
      const idx = lowerText.indexOf(nameLower, searchPos);
      if (idx === -1) break;

      // Check word boundaries (basic)
      const prevChar = idx > 0 ? lowerText[idx - 1] : ' ';
      const nextChar = idx + nameLower.length < lowerText.length
        ? lowerText[idx + nameLower.length]
        : ' ';

      const isWordBoundary = (c: string) => /[^a-z0-9]/.test(c);

      if (isWordBoundary(prevChar) && isWordBoundary(nextChar)) {
        if (!seenIds.has(comp.id)) {
          mentions.push({
            componentId: comp.id,
            componentName: comp.name,
            mentionStart: idx,
            mentionEnd: idx + nameLower.length,
          });
          seenIds.add(comp.id);
        }
      }

      searchPos = idx + 1;
    }
  }

  // Sort by position
  mentions.sort((a, b) => a.mentionStart - b.mentionStart);

  return mentions;
}

/**
 * Common action patterns to detect in text
 */
const ACTION_PATTERNS: {
  pattern: RegExp;
  type: ActionType;
  labelPrefix: string;
  extractPayload: (match: RegExpMatchArray) => Record<string, unknown>;
}[] = [
  {
    pattern: /(?:I'll|Let me|I can) highlight (?:the )?([a-zA-Z0-9\- ]+)/i,
    type: 'highlight',
    labelPrefix: 'Highlight',
    extractPayload: (m) => ({ componentName: m[1].trim() }),
  },
  {
    pattern: /(?:I'll|Let me) (?:center|focus) on (?:the )?([a-zA-Z0-9\- ]+)/i,
    type: 'centerOn',
    labelPrefix: 'Center on',
    extractPayload: (m) => ({ componentName: m[1].trim() }),
  },
  {
    pattern: /(?:I'll|Let me) zoom (?:in|out|to) (\d+)/i,
    type: 'zoomTo',
    labelPrefix: 'Zoom to',
    extractPayload: (m) => ({ level: parseInt(m[1], 10) / 100 }),
  },
  {
    pattern: /(?:I'll|Let me) open (?:your |the )?inventory/i,
    type: 'openInventory',
    labelPrefix: 'Open',
    extractPayload: () => ({}),
  },
  {
    pattern: /(?:I'll|Let me) open (?:the )?settings/i,
    type: 'openSettings',
    labelPrefix: 'Open',
    extractPayload: () => ({}),
  },
  {
    pattern: /add (?:a |an )?([a-zA-Z0-9\- ]+) to (?:your |the )?diagram/i,
    type: 'addComponent',
    labelPrefix: 'Add',
    extractPayload: (m) => ({ componentName: m[1].trim() }),
  },
  {
    pattern: /connect (?:the )?([a-zA-Z0-9\- ]+) to (?:the )?([a-zA-Z0-9\- ]+)/i,
    type: 'createConnection',
    labelPrefix: 'Connect',
    extractPayload: (m) => ({
      fromComponentName: m[1].trim(),
      toComponentName: m[2].trim(),
    }),
  },
];

/**
 * Detect action intents from text patterns
 */
export function detectActionPatterns(
  text: string,
  availableComponents: ElectronicComponent[]
): ActionIntent[] {
  const actions: ActionIntent[] = [];

  for (const pattern of ACTION_PATTERNS) {
    const match = text.match(pattern.pattern);
    if (match) {
      const payload = pattern.extractPayload(match);

      // Try to resolve component name to ID
      const mutablePayload = payload as Record<string, unknown>;
      if ('componentName' in mutablePayload && typeof mutablePayload.componentName === 'string') {
        const compName = mutablePayload.componentName; // Capture for closure
        const comp = availableComponents.find(
          (c) => c.name.toLowerCase() === compName.toLowerCase()
        );
        if (comp) {
          mutablePayload.componentId = comp.id;
        }
      }

      const componentName = typeof mutablePayload.componentName === 'string'
        ? mutablePayload.componentName
        : pattern.type;

      actions.push({
        type: pattern.type,
        payload: mutablePayload,
        label: `${pattern.labelPrefix} ${componentName}`,
        safe: pattern.type === 'highlight' ||
              pattern.type === 'centerOn' ||
              pattern.type === 'zoomTo' ||
              pattern.type === 'openInventory' ||
              pattern.type === 'openSettings',
      });
    }
  }

  return actions;
}

/**
 * Extract code blocks from markdown text
 */
export function extractCodeBlocks(text: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return blocks;
}

/**
 * Check if text contains markdown formatting
 */
export function hasMarkdownFormatting(text: string): boolean {
  const markdownPatterns = [
    /\*\*.+?\*\*/,     // Bold
    /\*.+?\*/,         // Italic
    /#+\s+/,           // Headers
    /```/,             // Code blocks
    /`[^`]+`/,         // Inline code
    /.*\[.+?\]\(.+?\)/,  // Links
    /^\s*[-*]\s+/m,    // Lists
    /^\s*\d+\.\s+/m,   // Numbered lists
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * Parse a full AI response
 */
export function parseResponse(
  text: string,
  availableComponents: ElectronicComponent[]
): ParsedResponse {
  const componentMentions = parseComponentMentions(text, availableComponents);
  const detectedActions = detectActionPatterns(text, availableComponents);
  const codeBlocks = extractCodeBlocks(text);
  const hasMarkdown = hasMarkdownFormatting(text);

  return {
    text,
    componentMentions,
    detectedActions,
    codeBlocks,
    hasMarkdown,
  };
}

/**
 * Remove markdown code blocks from text for plain display
 */
export function stripCodeBlocks(text: string): string {
  return text.replace(/```\w*\n[\s\S]*?```/g, '[code block]');
}

/**
 * Escape text for safe HTML display
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default {
  parseResponse,
  parseComponentMentions,
  detectActionPatterns,
  extractCodeBlocks,
  hasMarkdownFormatting,
  stripCodeBlocks,
  escapeHtml,
};