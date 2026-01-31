import { ActionHandler } from './types';
import { userProfileService } from '../../services/userProfileService';

export const handleUndo: ActionHandler = async (_, { handleUndo }) => {
  handleUndo();
  return { success: true };
};

export const handleRedo: ActionHandler = async (_, { handleRedo }) => {
  handleRedo();
  return { success: true };
};

export const handleSaveDiagram: ActionHandler = async (_, { saveDiagram }) => {
  saveDiagram();
  return { success: true };
};

export const handleLoadDiagram: ActionHandler = async (_, { loadDiagram }) => {
  loadDiagram();
  return { success: true };
};

export const handleSetUserLevel: ActionHandler<{ level: 'beginner' | 'intermediate' | 'pro' }> = async (payload) => {
  if (!payload.level) return { success: false, error: 'Level required' };
  await userProfileService.updateExperience(payload.level);
  return { success: true };
};

export const handleLearnFact: ActionHandler<{ content: string }> = async (payload) => {
  if (!payload.content) return { success: false, error: 'Content required' };
  await userProfileService.addFact(payload.content);
  return { success: true };
};

export const handleAnalyzeVisuals: ActionHandler = async (_, { canvasRef, activeConversationId }) => {
  // This is a special action that triggers a UI side-effect (snapshot) 
  // and then sends a message back to the chat.
  // Since we don't have direct access to 'sendMessage' here, 
  // we will rely on the UI layer (App.tsx) observing this action or 
  // we can use a custom event or callback if we had one.
  // BUT, App.tsx handles 'execute' and can see the result.
  // Actually, 'executeAction' returns a promise. 
  // We can perform the snapshot here and return it?
  // No, handlers return { success, error }.
  
  // Alternative: App.tsx injects a 'sendVisualAnalysis' function into context.
  // For now, let's just log it and assume App.tsx will be updated to handle the logic
  // OR we implement the snapshot here if we have the capability.
  
  if (canvasRef.current) {
      const blob = await canvasRef.current.getSnapshotBlob();
      if (blob) {
          // We have the blob. We need to send it to the AI.
          // Since we can't easily import 'handleSendEnhancedMessage' from App.tsx,
          // we will dispatch a custom event that App.tsx listens to?
          // Or better, we add 'sendVisualAnalysis' to ActionContext.
          
          // Let's emit a custom event for now as a loose coupling mechanism
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
              const base64 = reader.result as string;
              const event = new CustomEvent('cm:visual-analysis', { 
                  detail: { image: base64, conversationId: activeConversationId } 
              });
              window.dispatchEvent(event);
          };
          return { success: true };
      }
  }
  return { success: false, error: 'Failed to capture snapshot' };
};