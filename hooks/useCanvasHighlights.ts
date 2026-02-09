import { useState, useCallback } from 'react';

export interface HighlightOptions {
  color?: string;
  duration?: number;
  pulse?: boolean;
}

export interface HighlightState {
  color: string;
  pulse: boolean;
  timerId?: ReturnType<typeof setTimeout>;
}

export function useCanvasHighlights() {
  const [highlightedComponents, setHighlightedComponents] = useState<Map<string, HighlightState>>(
    new Map()
  );
  const [highlightedWires, setHighlightedWires] = useState<Map<number, HighlightState>>(
    new Map()
  );

  const highlightComponent = useCallback((componentId: string, options?: HighlightOptions) => {
    const { color = '#00f3ff', duration = 3000, pulse = true } = options || {};

    setHighlightedComponents((prev) => {
      const existing = prev.get(componentId);
      if (existing?.timerId) clearTimeout(existing.timerId);

      let timerId: ReturnType<typeof setTimeout> | undefined;
      if (duration > 0) {
        timerId = setTimeout(() => {
          setHighlightedComponents((p) => {
            const next = new Map(p);
            next.delete(componentId);
            return next;
          });
        }, duration);
      }

      const next = new Map(prev);
      next.set(componentId, { color, pulse, timerId });
      return next;
    });
  }, []);

  const clearHighlight = useCallback((componentId?: string) => {
    if (componentId) {
      setHighlightedComponents((prev) => {
        const existing = prev.get(componentId);
        if (existing?.timerId) clearTimeout(existing.timerId);
        const next = new Map(prev);
        next.delete(componentId);
        return next;
      });
    } else {
      setHighlightedComponents((prev) => {
        prev.forEach((s) => { if (s.timerId) clearTimeout(s.timerId); });
        return new Map();
      });
    }
  }, []);

  const highlightWire = useCallback((wireIndex: number, options?: HighlightOptions) => {
    const { color = '#ff00ff', duration = 3000, pulse = true } = options || {};

    setHighlightedWires((prev) => {
      const existing = prev.get(wireIndex);
      if (existing?.timerId) clearTimeout(existing.timerId);

      let timerId: ReturnType<typeof setTimeout> | undefined;
      if (duration > 0) {
        timerId = setTimeout(() => {
          setHighlightedWires((p) => {
            const next = new Map(p);
            next.delete(wireIndex);
            return next;
          });
        }, duration);
      }

      const next = new Map(prev);
      next.set(wireIndex, { color, pulse, timerId });
      return next;
    });
  }, []);

  const clearWireHighlight = useCallback((wireIndex?: number) => {
    if (wireIndex !== undefined) {
      setHighlightedWires((prev) => {
        const existing = prev.get(wireIndex);
        if (existing?.timerId) clearTimeout(existing.timerId);
        const next = new Map(prev);
        next.delete(wireIndex);
        return next;
      });
    } else {
      setHighlightedWires((prev) => {
        prev.forEach((s) => { if (s.timerId) clearTimeout(s.timerId); });
        return new Map();
      });
    }
  }, []);

  return {
    highlightedComponents,
    highlightedWires,
    highlightComponent,
    clearHighlight,
    highlightWire,
    clearWireHighlight,
  };
}
