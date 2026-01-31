export interface AIMetric {
  id: string;
  timestamp: number;
  model: string;
  operation: string;
  latencyMs: number;
  success: boolean;
  userSatisfaction?: number;
}

export interface EngineeringEvent {
  id: string;
  timestamp: number;
  type: 'action_execute' | 'diagram_update' | 'ai_suggestion_accept' | 'ai_suggestion_reject' | 'checkpoint_created';
  payload: Record<string, unknown>;
}

const METRICS_STORAGE_KEY = 'cm_ai_metrics';
const EVENTS_STORAGE_KEY = 'cm_eng_events';

class EngineeringMetricsService {
  /**
   * Logs an AI performance metric.
   */
  logAiMetric(metric: Omit<AIMetric, 'id' | 'timestamp'>): string {
    const stored = localStorage.getItem(METRICS_STORAGE_KEY);
    const metrics: AIMetric[] = stored ? JSON.parse(stored) : [];
    
    const id = crypto.randomUUID();
    const newMetric = { ...metric, id, timestamp: Date.now() };
    metrics.push(newMetric);
    
    if (metrics.length > 1000) metrics.splice(0, metrics.length - 1000);
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
    return id;
  }

  getAverageLatency(operation?: string): number {
    let metrics = this.getAiMetrics();
    if (operation) {
      metrics = metrics.filter(m => m.operation === operation);
    }
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.latencyMs, 0);
    return Math.round(sum / metrics.length);
  }

  getSuccessRate(operation?: string): number {
    let metrics = this.getAiMetrics();
    if (operation) {
      metrics = metrics.filter(m => m.operation === operation);
    }
    if (metrics.length === 0) return 100;
    const successes = metrics.filter(m => m.success).length;
    return Math.round((successes / metrics.length) * 100);
  }

  /**
   * Logs a generic engineering event.
   */
  logEvent(type: EngineeringEvent['type'], payload: Record<string, unknown>): void {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    const events: EngineeringEvent[] = stored ? JSON.parse(stored) : [];
    
    const newEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      payload
    };
    events.push(newEvent);
    
    if (events.length > 1000) events.splice(0, events.length - 1000);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }

  getAiMetrics(): AIMetric[] {
    const stored = localStorage.getItem(METRICS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getEvents(): EngineeringEvent[] {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  recordAiFeedback(metricId: string, score: number) {
    const metrics = this.getAiMetrics();
    const idx = metrics.findIndex(m => m.id === metricId);
    if (idx !== -1) {
      metrics[idx].userSatisfaction = score;
      localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
    }
  }
}

export const engineeringMetricsService = new EngineeringMetricsService();

// Legacy compatibility shim
export const aiMetricsService = {
  logMetric: (m: Omit<AIMetric, 'id' | 'timestamp'>) => engineeringMetricsService.logAiMetric(m),
  recordFeedback: (id: string, s: number) => engineeringMetricsService.recordAiFeedback(id, s),
  getMetrics: () => engineeringMetricsService.getAiMetrics(),
  getAverageLatency: (op?: string) => engineeringMetricsService.getAverageLatency(op),
  getSuccessRate: (op?: string) => engineeringMetricsService.getSuccessRate(op)
};
