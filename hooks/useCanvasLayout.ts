import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { WiringDiagram, ElectronicComponent } from '../types';
import type { DiagramState, DiagramAction } from '../components/diagram/diagramState';
import { resolveComponentBounds } from '../components/diagram';

const VIRTUALIZATION_THRESHOLD = 100;
const VIEWPORT_PADDING = 240;

interface UseCanvasLayoutArgs {
  state: DiagramState;
  dispatch: React.Dispatch<DiagramAction>;
  diagram: WiringDiagram | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  searchQuery: string;
  filterType: string;
}

export function useCanvasLayout({
  state,
  dispatch,
  diagram,
  containerRef,
  searchQuery,
  filterType,
}: UseCanvasLayoutArgs) {
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const containerRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  // Viewport resize tracking
  useEffect(() => {
    if (!containerRef.current) return;
    const node = containerRef.current;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const updateViewport = () => {
      const rect = node.getBoundingClientRect();
      setViewportSize((prev) => {
        if (containerRectRef.current && Math.abs(prev.width - rect.width) < 1 && Math.abs(prev.height - rect.height) < 1) {
          return prev;
        }
        containerRectRef.current = rect;
        return { width: rect.width, height: rect.height };
      });
    };
    updateViewport();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        window.requestAnimationFrame(updateViewport);
      }, 16);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [containerRef]);

  // Auto-layout new components
  useEffect(() => {
    if (!diagram) {
      if (state.nodePositions.size > 0) {
        dispatch({ type: 'SET_NODE_POSITIONS', payload: new Map() });
      }
      return;
    }
    const needsLayout = diagram.components.some((c) => !state.nodePositions.has(c.id));
    if (!needsLayout) return;

    const newPositions = new Map(state.nodePositions);
    const unpositioned = diagram.components.filter((c) => !newPositions.has(c.id));
    if (unpositioned.length === 0) return;

    let yOffset = 50;
    let xOffset = 400;

    unpositioned.forEach((c) => {
      if (c.type === 'power') xOffset = 100;
      else if (c.type === 'microcontroller') xOffset = 400;
      else xOffset = 700;

      let conflict = true;
      let attempts = 0;
      while (conflict && attempts < 100) {
        conflict = Array.from(newPositions.values()).some(
          (p: { x: number; y: number }) =>
            Math.abs(p.x - xOffset) < 50 && Math.abs(p.y - yOffset) < 50
        );
        if (conflict) yOffset += 200;
        attempts++;
      }
      newPositions.set(c.id, { x: xOffset, y: yOffset });
      yOffset += 200;
    });
    dispatch({ type: 'SET_NODE_POSITIONS', payload: newPositions });
  }, [diagram, state.nodePositions, dispatch]);

  // Filtering
  const filteredComponents = useMemo(() => {
    if (!diagram) return [];
    return diagram.components.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || c.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [diagram, searchQuery, filterType]);

  // Search → hover + pan
  useEffect(() => {
    if (!searchQuery.trim() || !state.nodePositions.size) {
      dispatch({ type: 'SET_HOVERED_NODE', payload: null });
      return;
    }
    const foundNode = filteredComponents.find((n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (foundNode) {
      dispatch({ type: 'SET_HOVERED_NODE', payload: foundNode.id });
      const pos = state.nodePositions.get(foundNode.id);
      if (pos && containerRef.current) {
        const bounds = resolveComponentBounds(foundNode);
        const x = containerRef.current.clientWidth / 2 - (pos.x + bounds.width / 2) * state.zoom;
        const y = containerRef.current.clientHeight / 2 - (pos.y + bounds.height / 2) * state.zoom;
        dispatch({ type: 'SET_PAN', payload: { x, y } });
      }
    }
  }, [searchQuery, state.zoom, filteredComponents, state.nodePositions, containerRef, dispatch]);

  // Diagram bounds for minimap
  const diagramBounds = useMemo(() => {
    if (!diagram || filteredComponents.length === 0) {
      return { minX: 0, minY: 0, maxX: 500, maxY: 300, width: 500, height: 300 };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    filteredComponents.forEach((c) => {
      const pos = state.nodePositions.get(c.id) || { x: 0, y: 0 };
      const bounds = resolveComponentBounds(c);
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + bounds.width);
      maxY = Math.max(maxY, pos.y + bounds.height);
    });
    const padding = 50;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [diagram, filteredComponents, state.nodePositions]);

  // Viewport bounds for virtualization
  const viewportBounds = useMemo(() => {
    const width = viewportSize.width || containerRef.current?.clientWidth || 0;
    const height = viewportSize.height || containerRef.current?.clientHeight || 0;
    if (!width || !height) return null;
    const minX = (-state.pan.x) / state.zoom - VIEWPORT_PADDING;
    const minY = (-state.pan.y) / state.zoom - VIEWPORT_PADDING;
    const maxX = (width - state.pan.x) / state.zoom + VIEWPORT_PADDING;
    const maxY = (height - state.pan.y) / state.zoom + VIEWPORT_PADDING;
    return { minX, minY, maxX, maxY };
  }, [state.pan, state.zoom, viewportSize, containerRef]);

  const shouldVirtualize = Boolean(diagram && diagram.components.length > VIRTUALIZATION_THRESHOLD);

  const renderComponents = useMemo(() => {
    if (!diagram) return [];
    if (!shouldVirtualize || !viewportBounds) return filteredComponents;
    return filteredComponents.filter((comp) => {
      const pos = state.nodePositions.get(comp.id);
      if (!pos) return true;
      const bounds = resolveComponentBounds(comp);
      const right = pos.x + bounds.width;
      const bottom = pos.y + bounds.height;
      return (
        right >= viewportBounds.minX &&
        pos.x <= viewportBounds.maxX &&
        bottom >= viewportBounds.minY &&
        pos.y <= viewportBounds.maxY
      );
    });
  }, [diagram, filteredComponents, state.nodePositions, shouldVirtualize, viewportBounds]);

  const visibleComponentIds = useMemo(
    () => new Set(renderComponents.map((comp) => comp.id)),
    [renderComponents]
  );

  const renderConnections = useMemo(() => {
    if (!diagram) return [];
    const connectionsWithIndex = diagram.connections.map((conn, index) => ({ conn, index }));
    if (!shouldVirtualize) return connectionsWithIndex;
    return connectionsWithIndex.filter(
      ({ conn }) =>
        visibleComponentIds.has(conn.fromComponentId) ||
        visibleComponentIds.has(conn.toComponentId)
    );
  }, [diagram, shouldVirtualize, visibleComponentIds]);

  // Unique wire colors for SVG markers
  const uniqueColors = useMemo(() => {
    if (!diagram) return [];
    const colors = new Set<string>();
    diagram.connections.forEach((c) => {
      if (c.color) colors.add(c.color);
    });
    return Array.from(colors);
  }, [diagram]);

  // Minimap click handler
  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const minimapWidth = 160;
    const minimapHeight = 100;
    const scale = Math.min(minimapWidth / diagramBounds.width, minimapHeight / diagramBounds.height);
    const clickX = (e.clientX - rect.left) / scale + diagramBounds.minX;
    const clickY = (e.clientY - rect.top) / scale + diagramBounds.minY;
    dispatch({
      type: 'SET_PAN',
      payload: {
        x: containerRef.current.clientWidth / 2 - clickX * state.zoom,
        y: containerRef.current.clientHeight / 2 - clickY * state.zoom,
      },
    });
  }, [diagramBounds, state.zoom, containerRef, dispatch]);

  return {
    viewportSize,
    containerRectRef,
    filteredComponents,
    diagramBounds,
    renderComponents,
    renderConnections,
    uniqueColors,
    handleMinimapClick,
  };
}
