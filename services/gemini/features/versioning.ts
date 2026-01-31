import { getAIClient, MODELS } from '../client';
import { DiffSet } from '../../diagramDiff';

/**
 * Uses Gemini to generate a natural language summary of diagram changes.
 */
export const summarizeDiagramDiff = async (diff: DiffSet): Promise<string> => {
  const genAI = getAIClient();

  const prompt = `
    Summarize these electronics project changes for a Git commit message.
    Be technical but concise. 
    
    Added Components: ${diff.added.components.join(', ') || 'None'}
    Removed Components: ${diff.removed.components.join(', ') || 'None'}
    Modified Components: ${diff.modified.components.join(', ') || 'None'}
    New Connections: ${diff.added.connections.length}
    Removed Connections: ${diff.removed.connections.length}

    Format as: "AI Summary: [Your summary here]"
  `;

  try {
    const response = await genAI.models.generateContent({
      model: MODELS.CONTEXT_CHAT_DEFAULT,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return (response.text || '').trim();
  } catch (error) {
    console.error('Failed to summarize diff:', error);
    return 'AI Summary: Structural modifications to diagram.';
  }
};
