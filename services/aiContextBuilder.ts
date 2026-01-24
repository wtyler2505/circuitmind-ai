/**
 * AI Context Builder Service
 *
 * Builds a comprehensive context object for the AI to understand
 * the current state of the application, enabling context-aware responses
 * and proactive suggestions.
 */

import {
  ElectronicComponent,
  WiringDiagram,
  AIContext,
  ActionRecord,
  ActionDelta,
} from '../types';
import { getRecentActions } from './storage';
import { userProfileService, UserProfile } from './userProfileService';
import { correctionService, InteractionLesson } from './feedback/correctionService';

/**
 * Summarize component counts by type
 */
function summarizeInventory(inventory: ElectronicComponent[]): string {
  if (inventory.length === 0) {
    return 'Empty inventory';
  }

  const typeCounts: Record<string, number> = {};
  for (const component of inventory) {
    typeCounts[component.type] = (typeCounts[component.type] || 0) + 1;
  }

  const parts = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`);

  return `${inventory.length} components: ${parts.join(', ')}`;
}

/**
 * Format recent actions for context
 */
function formatRecentActions(actions: ActionRecord[]): string[] {
  return actions.slice(0, 5).map((action) => {
    const timestamp = new Date(action.timestamp).toLocaleTimeString();
    return `[${timestamp}] ${action.type}`;
  });
}

/**
 * Build options for context building
 */
export interface BuildContextOptions {
  diagram: WiringDiagram | null;
  inventory: ElectronicComponent[];
  selectedComponentId?: string | null;
  activeView?: 'canvas' | 'component-editor' | 'inventory' | 'settings';
  viewport?: { zoom: number; x: number; y: number };
  recentHistory?: ActionDelta[];
  activeSelectionPath?: string;
  includeDetailedDiagram?: boolean;
  includeFullInventory?: boolean;
}

/**
 * Build the full AI context object
 */
export async function buildAIContext(options: BuildContextOptions): Promise<AIContext> {
  const {
    diagram,
    inventory,
    selectedComponentId,
    activeView = 'canvas',
    viewport,
    recentHistory = [],
    activeSelectionPath,
  } = options;

  // Get User Profile
  const userProfile = userProfileService.getProfile();

  // Get recent actions from storage
  let recentActionRecords: ActionRecord[] = [];
  try {
    recentActionRecords = await getRecentActions(5);
  } catch {
    // Ignore storage errors
  }

  // Find selected component
  const selectedComponent = selectedComponentId
    ? inventory.find((c) => c.id === selectedComponentId) ||
      diagram?.components.find((c) => c.id === selectedComponentId)
    : null;

  // Fetch relevant lessons based on current context
  const contextKeywords = [
    selectedComponent?.name,
    activeView,
    diagram?.title
  ].filter(Boolean).join(' ');
  
  const relevantLessons = correctionService.getRelevantLessons(contextKeywords);

  // Build context
  const context: AIContext = {
    currentDiagramId: diagram?.title ? `diagram-${Date.now()}` : undefined,
    currentDiagramTitle: diagram?.title,
    componentCount: diagram?.components.length || 0,
    connectionCount: diagram?.connections.length || 0,
    componentList: (diagram?.components.length || 0) < 20 
      ? diagram?.components.map(c => `[${c.id}] ${c.name} (${c.type})`) 
      : undefined,
    selectedComponentId: selectedComponentId || undefined,
    selectedComponentName: selectedComponent?.name,
    activeSelectionPath,
    recentActions: formatRecentActions(recentActionRecords),
    recentHistory,
    activeView,
    inventorySummary: summarizeInventory(inventory),
    
    // Loose typing for new fields until types.ts is fully propagated/compiled
    // @ts-ignore 
    userProfile,
    // @ts-ignore
    relevantLessons,
    viewport: viewport ? `Zoom: ${viewport.zoom.toFixed(1)}x, Pan: (${viewport.x}, ${viewport.y})` : 'Unknown',
  };

  return context;
}

/**
 * Build a text prompt section for the AI from context
 */
export function buildContextPrompt(context: AIContext): string {
  const sections: string[] = [];
  
  const ctx = context as any;

  // Current state header
  sections.push('=== CURRENT APP STATE ===');

  // User Profile
  if (ctx.userProfile) {
      const p = ctx.userProfile as UserProfile;
      sections.push(`\nUser: ${p.name} (${p.experienceLevel})`);
      sections.push(`Preferences: ${p.preferences.verboseMode ? 'Detailed' : 'Concise'} explanations.`);
      if (p.facts.length > 0) {
          sections.push(`Memory: ${p.facts.map((f:any) => f.content).join('; ')}`);
      }
  }

  // Diagram info
  if (context.currentDiagramTitle) {
    sections.push(`\nDiagram: "${context.currentDiagramTitle}"`);
    sections.push(`- ${context.componentCount} components, ${context.connectionCount} connections`);
    
    // Add component list if available in context
    if (context.componentList && context.componentList.length > 0) {
      sections.push('Components on Canvas:');
      context.componentList.forEach(c => {
        sections.push(`  - ${c}`);
      });
    }
  } else {
    sections.push('\nNo diagram loaded');
  }
  
  // Viewport
  if (ctx.viewport) {
      sections.push(`Viewport: ${ctx.viewport}`);
  }

  // Selected component
  if (context.selectedComponentName) {
    sections.push(`\nSelected: ${context.selectedComponentName} (ID: ${context.selectedComponentId})`);
    if (context.activeSelectionPath) {
      sections.push(`Focus Path: ${context.activeSelectionPath}`);
    }
  }

  // Active view
  sections.push(`\nActive View: ${context.activeView}`);

  // Inventory summary
  sections.push(`\nInventory: ${context.inventorySummary}`);

  // Recent history (High fidelity)
  if (context.recentHistory && context.recentHistory.length > 0) {
    sections.push('\nTimeline Awareness (Recent Actions):');
    context.recentHistory.forEach((h) => {
      const time = new Date(h.timestamp).toLocaleTimeString();
      sections.push(`  - [${time}] ${h.description} (${h.type})`);
    });
  }

  // Recent actions (Log style)
  if (context.recentActions.length > 0) {
    sections.push('\nSystem Logs:');
    context.recentActions.forEach((action) => sections.push(`  ${action}`));
  }

  // Relevant Lessons
  if (ctx.relevantLessons && ctx.relevantLessons.length > 0) {
    sections.push('\nPRIOR USER CORRECTIONS (APPLY THESE):');
    ctx.relevantLessons.forEach((l: InteractionLesson) => {
      sections.push(`- When asked "${l.userPrompt}", do NOT say "${l.originalResponse}". Instead: ${l.correction}`);
    });
  }

  sections.push('\n=== END STATE ===');

  return sections.join('\n');
}

/**
 * Build a detailed context for specific queries about the diagram
 */
export function buildDetailedDiagramContext(diagram: WiringDiagram): string {
  if (!diagram) return 'No diagram to analyze.';

  const sections: string[] = [];

  sections.push(`# ${diagram.title}\n`);
  sections.push(diagram.explanation || 'No explanation provided.');
  sections.push('');

  // Components
  sections.push('## Components');
  diagram.components.forEach((comp, idx) => {
    sections.push(`${idx + 1}. **${comp.name}** (${comp.type})`);
    if (comp.pins && comp.pins.length > 0) {
      sections.push(`   Pins: ${comp.pins.join(', ')}`);
    }
    if (comp.description) {
      sections.push(`   ${comp.description.substring(0, 150)}`);
    }
  });

  sections.push('');

  // Connections
  sections.push('## Connections');
  diagram.connections.forEach((conn, idx) => {
    const from = diagram.components.find((c) => c.id === conn.fromComponentId);
    const to = diagram.components.find((c) => c.id === conn.toComponentId);
    sections.push(
      `${idx + 1}. ${from?.name || 'Unknown'}.${conn.fromPin} → ${to?.name || 'Unknown'}.${conn.toPin}` +
        (conn.description ? ` (${conn.description})` : '')
    );
  });

  return sections.join('\n');
}

/**
 * Build context specifically for proactive suggestions
 */
export function buildProactiveSuggestionContext(options: BuildContextOptions): string {
  const { diagram, inventory, selectedComponentId } = options;

  const lines: string[] = [];
  lines.push('Based on current state, suggest helpful actions:\n');

  // Check for common improvement opportunities
  if (diagram) {
    // Missing connections
    const connectedIds = new Set<string>();
    diagram.connections.forEach((c) => {
      connectedIds.add(c.fromComponentId);
      connectedIds.add(c.toComponentId);
    });
    const unconnected = diagram.components.filter((c) => !connectedIds.has(c.id));
    if (unconnected.length > 0) {
      lines.push(`- ${unconnected.length} components not connected: ${unconnected.map((c) => c.name).join(', ')}`);
    }

    // Low component count
    if (diagram.components.length < 3) {
      lines.push('- Diagram has few components, consider adding more');
    }

    // No power supply
    const hasPower = diagram.components.some((c) => c.type === 'power');
    if (!hasPower) {
      lines.push('- No power supply component detected');
    }
  }

  // Inventory opportunities
  const lowStockItems = inventory.filter((c) => c.lowStock);
  if (lowStockItems.length > 0) {
    lines.push(`- ${lowStockItems.length} items low on stock`);
  }

  // Selected component opportunities
  if (selectedComponentId) {
    const selected = inventory.find((c) => c.id === selectedComponentId);
    if (selected && !selected.datasheetUrl) {
      lines.push(`- Selected component ${selected.name} missing datasheet link`);
    }
  }

  return lines.join('\n');
}

export default {
  buildAIContext,
  buildContextPrompt,
  buildDetailedDiagramContext,
  buildProactiveSuggestionContext,
};