import { storageService } from '../storage';

export interface GestureMetric {
  id: string;
  timestamp: number;
  gestureType: string;
  confidence: number;
  success: boolean;
  latencyMs: number;
  metadata?: Record<string, any>;
}

class GestureMetricsService {
  private metrics: GestureMetric[] = [];
  private readonly MAX_LOCAL_METRICS = 100;

  async logMetric(metric: Omit<GestureMetric, 'id' | 'timestamp'>) {
    const newMetric: GestureMetric = {
      ...metric,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.metrics.push(newMetric);
    
    // Periodically save to storage
    if (this.metrics.length >= 10) {
      await this.flush();
    }
  }

  async flush() {
    if (this.metrics.length === 0) return;
    
    try {
      const existing = await storageService.getItem('cm_gesture_metrics') || '[]';
      const parsed = JSON.parse(existing);
      const updated = [...parsed, ...this.metrics].slice(-this.MAX_LOCAL_METRICS);
      
      await storageService.setItem('cm_gesture_metrics', JSON.stringify(updated));
      this.metrics = [];
    } catch (e) {
      console.error('Failed to flush gesture metrics', e);
    }
  }

  async getSummary() {
    try {
      const data = await storageService.getItem('cm_gesture_metrics') || '[]';
      const parsed: GestureMetric[] = JSON.parse(data);
      
      if (parsed.length === 0) return null;
      
      const successCount = parsed.filter(m => m.success).length;
      const avgLatency = parsed.reduce((sum, m) => sum + m.latencyMs, 0) / parsed.length;
      
      return {
        totalActions: parsed.length,
        accuracy: (successCount / parsed.length) * 100,
        averageLatency: avgLatency
      };
    } catch {
      return null;
    }
  }
}

export const gestureMetricsService = new GestureMetricsService();
