import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiMetricsService } from '../aiMetricsService';

describe('aiMetricsService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  it('should log a metric and retrieve it', () => {
    aiMetricsService.logMetric({
      model: 'test-model',
      operation: 'test-op',
      latencyMs: 100,
      success: true
    });

    const metrics = aiMetricsService.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      model: 'test-model',
      operation: 'test-op',
      latencyMs: 100,
      success: true
    });
    expect(metrics[0].id).toBeDefined();
    expect(metrics[0].timestamp).toBeDefined();
  });

  it('should calculate average latency correctly', () => {
    aiMetricsService.logMetric({ model: 'm1', operation: 'op1', latencyMs: 100, success: true });
    aiMetricsService.logMetric({ model: 'm1', operation: 'op1', latencyMs: 200, success: true });
    aiMetricsService.logMetric({ model: 'm1', operation: 'op2', latencyMs: 500, success: true }); // Different op

    expect(aiMetricsService.getAverageLatency('op1')).toBe(150);
    expect(aiMetricsService.getAverageLatency('op2')).toBe(500);
    expect(aiMetricsService.getAverageLatency()).toBe(Math.round((100 + 200 + 500) / 3)); // 267
  });

  it('should calculate success rate correctly', () => {
    aiMetricsService.logMetric({ model: 'm1', operation: 'op1', latencyMs: 100, success: true });
    aiMetricsService.logMetric({ model: 'm1', operation: 'op1', latencyMs: 100, success: false });
    
    expect(aiMetricsService.getSuccessRate('op1')).toBe(50);
  });

  it('should limit metrics storage to 1000 items', () => {
    const seeded = Array.from({ length: 1000 }, (_, index) => ({
      id: `seed-${index}`,
      timestamp: index,
      model: 'm',
      operation: 'op',
      latencyMs: 1,
      success: true
    }));

    localStorage.setItem('cm_ai_metrics', JSON.stringify(seeded));
    aiMetricsService.logMetric({ model: 'm', operation: 'op', latencyMs: 1, success: true });

    const metrics = aiMetricsService.getMetrics();
    expect(metrics).toHaveLength(1000);
    expect(metrics.some((metric) => metric.id === 'seed-0')).toBe(false);
  });
});
