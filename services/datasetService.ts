import { EnhancedChatMessage } from '../types';
import { aiMetricsService } from './aiMetricsService';

export const datasetService = {
  exportTrainingData: (): string => {
    try {
      const messagesJson = localStorage.getItem('cm_messages');
      const metrics = aiMetricsService.getMetrics();
      
      if (!messagesJson) return '';
      
      const messages: EnhancedChatMessage[] = JSON.parse(messagesJson);
      
      // Group by conversation
      const conversations = new Map<string, EnhancedChatMessage[]>();
      messages.forEach(m => {
        if (!conversations.has(m.conversationId)) {
          conversations.set(m.conversationId, []);
        }
        conversations.get(m.conversationId)?.push(m);
      });
      
      const dataset: object[] = [];
      
      conversations.forEach((msgs) => {
        // Sort by timestamp
        msgs.sort((a, b) => a.timestamp - b.timestamp);
        
        // Filter out system messages and create turn pairs
        // We want to capture [User, Model] pairs where Model has feedback
        
        // Gemini Fine-tuning format: 
        // {"messages": [{"role": "user", "content": ...}, {"role": "model", "content": ...}]}
        
        const history: { role: string; content: string }[] = [];
        
        for (const msg of msgs) {
            if (msg.role === 'system') continue;
            
            const role = msg.role === 'user' ? 'user' : 'model';
            history.push({ role, content: msg.content });
            
            // If it's a model message with positive feedback, treat history up to here as a good example
            if (msg.role === 'model' && msg.metricId) {
                const metric = metrics.find(m => m.id === msg.metricId);
                // Only export if positive feedback or explicitly marked useful
                // Or export all with metadata for offline filtering
                if (metric && metric.userSatisfaction && metric.userSatisfaction > 0) {
                    dataset.push({
                        messages: [...history], // Clone current history
                        feedback: metric.userSatisfaction
                    });
                }
            }
        }
      });
      
      // Convert to JSONL
      return dataset.map(d => JSON.stringify(d)).join('\n');
      
    } catch (e) {
      console.error('Failed to export dataset', e);
      return '';
    }
  },
  
  downloadDataset: () => {
      const jsonl = datasetService.exportTrainingData();
      const blob = new Blob([jsonl], { type: 'application/jsonl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circuitmind-dataset-${new Date().toISOString().slice(0,10)}.jsonl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }
};
