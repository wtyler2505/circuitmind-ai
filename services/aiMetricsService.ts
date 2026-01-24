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
  payload: any;
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
    
    if (metrics.length > 500) metrics.splice(0, metrics.length - 500);
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
    return id;
  }

  /**
   * Logs a generic engineering event.
   */
  logEvent(type: EngineeringEvent['type'], payload: any): void {
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
  logMetric: (m: any) => engineeringMetricsService.logAiMetric(m),
  recordFeedback: (id: string, s: number) => engineeringMetricsService.recordAiFeedback(id, s),
  getMetrics: () => engineeringMetricsService.getAiMetrics()
};
