import { useState, useEffect } from 'react';

export interface WaveformPoint {
  t: number;
  v: number;
}

class VizEngine {
  private buffers: Map<string, WaveformPoint[]> = new Map();
  private maxPoints = 500;

  /**
   * Appends a data point to a specific named stream.
   */
  addData(streamId: string, value: number) {
    if (!this.buffers.has(streamId)) {
      this.buffers.set(streamId, []);
    }
    const buffer = this.buffers.get(streamId)!;
    buffer.push({ t: Date.now(), v: value });
    
    if (buffer.length > this.maxPoints) {
      buffer.shift();
    }
  }

  getBuffer(streamId: string): WaveformPoint[] {
    return this.buffers.get(streamId) || [];
  }
}

export const vizEngine = new VizEngine();

/**
 * Hook to subscribe to a high-frequency data stream.
 */
export function useDataStream(streamId: string, refreshRate = 60) {
  const [data, setData] = useState<WaveformPoint[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData([...vizEngine.getBuffer(streamId)]);
    }, 1000 / refreshRate);
    
    return () => clearInterval(interval);
  }, [streamId, refreshRate]);

  return data;
}
