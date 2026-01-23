export interface HealthMetrics {
  fps: number;
  memoryUsed: number; // MB
  memoryLimit: number; // MB
  aiLatency: number; // ms (last request)
  status: 'healthy' | 'warning' | 'critical';
}

class HealthMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private aiLatency = 0;

  constructor() {
    this.startFPSLoop();
  }

  private startFPSLoop() {
    const loop = () => {
      this.frameCount++;
      const time = performance.now();
      if (time >= this.lastTime + 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (time - this.lastTime));
        this.frameCount = 0;
        this.lastTime = time;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  recordAiLatency(ms: number) {
    this.aiLatency = ms;
  }

  getMetrics(): HealthMetrics {
    const memory = (performance as any).memory;
    const memoryUsed = memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0;
    const memoryLimit = memory ? Math.round(memory.jsHeapLimit / 1048576) : 0;

    let status: HealthMetrics['status'] = 'healthy';
    if (this.fps < 30 || (memoryLimit > 0 && memoryUsed / memoryLimit > 0.8)) {
      status = 'warning';
    }
    if (this.fps < 15 || (memoryLimit > 0 && memoryUsed / memoryLimit > 0.95)) {
      status = 'critical';
    }

    return {
      fps: this.fps,
      memoryUsed,
      memoryLimit,
      aiLatency: this.aiLatency,
      status
    };
  }
}

export const healthMonitor = new HealthMonitor();
