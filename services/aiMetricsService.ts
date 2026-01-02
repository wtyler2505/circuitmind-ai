import { ActionType } from "../hooks/actions/types";

export interface AIMetric {
  id: string;
  timestamp: number;
  model: string;
  operation: string; // e.g., 'generateWiringDiagram', 'chat'
  latencyMs: number;
  tokenCount?: {
    input: number;
    output: number;
  };
  success: boolean;
  error?: string;
  userSatisfaction?: number; // 1-5 score, optional
}

const STORAGE_KEY = 'cm_ai_metrics';

export const aiMetricsService = {
  
  logMetric: (metric: Omit<AIMetric, 'id' | 'timestamp'>): string => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const metrics: AIMetric[] = stored ? JSON.parse(stored) : [];
      
      const id = crypto.randomUUID();
      const newMetric: AIMetric = {
        ...metric,
        id,
        timestamp: Date.now(),
      };
      
      metrics.push(newMetric);

      // Keep last 1000 metrics to avoid bloat
      if (metrics.length > 1000) {
        metrics.splice(0, metrics.length - 1000);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
      
      // Console log for dev visibility
      console.debug(`[AI Metric] ${metric.operation} (${metric.model}): ${metric.latencyMs}ms ${metric.success ? '✅' : '❌'}`);
      
      return id;
    } catch (e) {
      console.warn('Failed to log AI metric', e);
      return '';
    }
  },

  getMetrics: (): AIMetric[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getAverageLatency: (operation?: string): number => {
    const metrics = aiMetricsService.getMetrics();
    const filtered = operation ? metrics.filter(m => m.operation === operation) : metrics;
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, curr) => acc + curr.latencyMs, 0);
    return Math.round(sum / filtered.length);
  },

  getSuccessRate: (operation?: string): number => {
    const metrics = aiMetricsService.getMetrics();
    const filtered = operation ? metrics.filter(m => m.operation === operation) : metrics;
    if (filtered.length === 0) return 0;

    const success = filtered.filter(m => m.success).length;
    return (success / filtered.length) * 100;
  },
  
  recordFeedback: (metricId: string, score: number) => {
     try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      
      const metrics: AIMetric[] = JSON.parse(stored);
      const targetIndex = metrics.findIndex(m => m.id === metricId);
      
      if (targetIndex !== -1) {
        metrics[targetIndex].userSatisfaction = score;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
      }
    } catch (e) {
      console.warn('Failed to record feedback', e);
    } 
  }
};
