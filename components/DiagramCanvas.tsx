import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useReducer,
} from 'react';
import { WiringDiagram, ElectronicComponent, WireConnection } from '../types';
import { Wire, DiagramNode, COMPONENT_WIDTH, COMPONENT_HEIGHT, SVG_GRADIENTS, SVG_FILTERS, Diagram3DView } from './diagram';
import type { WireHighlightState, NodeHighlightState } from './diagram';
import { diagramReducer, INITIAL_STATE, DiagramState, Point } from './diagram/diagramState';

type ViewMode = '2d' | '3d';

interface DiagramCanvasProps {
  diagram: WiringDiagram | null;
  onComponentClick: (component: ElectronicComponent) => void;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
  onComponentDrop?: (component: ElectronicComponent, x: number, y: number) => void;
  onGenerate3D?: (component: ElectronicComponent) => Promise<void>;
}

// Highlight options for AI control
export interface HighlightOptions {
  color?: string;
  duration?: number; // Auto-clear after ms (0 = permanent until cleared)
  pulse?: boolean;
}

// State for a highlighted component (internal with timer)
interface HighlightState {
  color: string;
  pulse: boolean;
  timerId?: ReturnType<typeof setTimeout>;
}

// Ref API exposed to parent for AI control
export interface DiagramCanvasRef {
  // View Controls
  setZoom: (level: number) => void;
  getZoom: () => number;
  setPan: (x: number, y: number) => void;
  getPan: () => { x: number; y: number };
  resetView: () => void;

  // Component Focus
  centerOnComponent: (componentId: string, zoom?: number) => void;
  highlightComponent: (componentId: string, options?: HighlightOptions) => void;
  clearHighlight: (componentId?: string) => void;

  // Wire Controls
  highlightWire: (wireIndex: number, options?: HighlightOptions) => void;
  clearWireHighlight: (wireIndex?: number) => void;

  // Positioning
  getComponentPosition: (componentId: string) => { x: number; y: number } | null;
  setComponentPosition: (componentId: string, x: number, y: number) => void;

  // State queries
  getAllComponentPositions: () => Map<string, { x: number; y: number }>;
  
  // Visuals
  getSnapshotBlob: () => Promise<Blob | null>;
}

const DiagramCanvasRenderer = ({ diagram, onComponentClick, onDiagramUpdate, onComponentDrop, onGenerate3D }: DiagramCanvasProps, ref: React.ForwardedRef<DiagramCanvasRef>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Reducer for interaction state
    const [state, dispatch] = useReducer(diagramReducer, INITIAL_STATE);

    // Local UI State (kept separate from reducer for simplicity)
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [showMinimap, setShowMinimap] = useState(true);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const [viewMode, setViewMode] = useState<ViewMode>('2d');

    // Grid settings
    const GRID_SIZE = 20;
    const VIRTUALIZATION_THRESHOLD = 100;
    const VIEWPORT_PADDING = 240;

    // AI Highlight State (Transient visual effects)
    const [highlightedComponents, setHighlightedComponents] = useState<Map<string, HighlightState>>(
      new Map()
    );
    const [highlightedWires, setHighlightedWires] = useState<Map<number, HighlightState>>(
      new Map()
    );

    // Helper to calculate cursor position in diagram coordinates
    const getDiagramPos = useCallback((clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - state.pan.x) / state.zoom,
        y: (clientY - rect.top - state.pan.y) / state.zoom,
      };
    }, [state.pan, state.zoom]);

    useEffect(() => {
      if (!containerRef.current) return;
      const node = containerRef.current;
      const updateViewport = () => {
        setViewportSize({ width: node.clientWidth, height: node.clientHeight });
      };
      updateViewport();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => updateViewport());
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    // Expose imperative API
    useImperativeHandle(
      ref,
      () => ({
        // View Controls
        setZoom: (level: number) => dispatch({ type: 'SET_ZOOM', payload: level }),
        getZoom: () => state.zoom,
        setPan: (x: number, y: number) => dispatch({ type: 'SET_PAN', payload: { x, y } }),
        getPan: () => state.pan,
        resetView: () => dispatch({ type: 'RESET_VIEW' }),

        // Component Focus
        centerOnComponent: (componentId: string, targetZoom?: number) => {
          const pos = state.nodePositions.get(componentId);
          if (pos && containerRef.current) {
            if (targetZoom) dispatch({ type: 'SET_ZOOM', payload: targetZoom });
            const z = targetZoom ?? state.zoom;
            const x = containerRef.current.clientWidth / 2 - (pos.x + COMPONENT_WIDTH / 2) * z;
            const y = containerRef.current.clientHeight / 2 - (pos.y + COMPONENT_HEIGHT / 2) * z;
            dispatch({ type: 'SET_PAN', payload: { x, y } });
          }
        },

        highlightComponent: (componentId: string, options?: HighlightOptions) => {
          const { color = '#00f3ff', duration = 3000, pulse = true } = options || {};
          const existing = highlightedComponents.get(componentId);
          if (existing?.timerId) clearTimeout(existing.timerId);

          let timerId: ReturnType<typeof setTimeout> | undefined;
          if (duration > 0) {
            timerId = setTimeout(() => {
              setHighlightedComponents((prev) => {
                const next = new Map(prev);
                next.delete(componentId);
                return next;
              });
            }, duration);
          }
          setHighlightedComponents((prev) => {
            const next = new Map(prev);
            next.set(componentId, { color, pulse, timerId });
            return next;
          });
        },

        clearHighlight: (componentId?: string) => {
          if (componentId) {
            const existing = highlightedComponents.get(componentId);
            if (existing?.timerId) clearTimeout(existing.timerId);
            setHighlightedComponents((prev) => {
              const next = new Map(prev);
              next.delete(componentId);
              return next;
            });
          } else {
            highlightedComponents.forEach((state) => {
              if (state.timerId) clearTimeout(state.timerId);
            });
            setHighlightedComponents(new Map());
          }
        },

        highlightWire: (wireIndex: number, options?: HighlightOptions) => {
          const { color = '#ff00ff', duration = 3000, pulse = true } = options || {};
          const existing = highlightedWires.get(wireIndex);
          if (existing?.timerId) clearTimeout(existing.timerId);

          let timerId: ReturnType<typeof setTimeout> | undefined;
          if (duration > 0) {
            timerId = setTimeout(() => {
              setHighlightedWires((prev) => {
                const next = new Map(prev);
                next.delete(wireIndex);
                return next;
              });
            }, duration);
          }
          setHighlightedWires((prev) => {
            const next = new Map(prev);
            next.set(wireIndex, { color, pulse, timerId });
            return next;
          });
        },

        clearWireHighlight: (wireIndex?: number) => {
          if (wireIndex !== undefined) {
            const existing = highlightedWires.get(wireIndex);
            if (existing?.timerId) clearTimeout(existing.timerId);
            setHighlightedWires((prev) => {
              const next = new Map(prev);
              next.delete(wireIndex);
              return next;
            });
          } else {
            highlightedWires.forEach((state) => {
              if (state.timerId) clearTimeout(state.timerId);
            });
            setHighlightedWires(new Map());
          }
        },

        getComponentPosition: (componentId: string) => state.nodePositions.get(componentId) || null,
        setComponentPosition: (componentId: string, x: number, y: number) => {
          dispatch({ type: 'UPDATE_NODE_POSITION', payload: { nodeId: componentId, x, y } });
        },
        getAllComponentPositions: () => new Map(state.nodePositions),
        
        getSnapshotBlob: async () => {
          if (!svgRef.current || !diagram) return null;
          const svg = svgRef.current;
          const bbox = svg.getBBox();
          const padding = 40;
          const targetWidth = 1024;
          const scale = targetWidth / (bbox.width + padding * 2);
          const width = targetWidth;
          const height = (bbox.height + padding * 2) * scale;

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);

          const svgClone = svg.cloneNode(true) as SVGSVGElement;
          svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
          svgClone.setAttribute('width', String(width));
          svgClone.setAttribute('height', String(height));

          const svgData = new XMLSerializer().serializeToString(svgClone);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(url);
              canvas.toBlob((blob) => resolve(blob), 'image/png', 0.8);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
            };
            img.src = url;
          });
        },
      }),
      [state.zoom, state.pan, state.nodePositions, highlightedComponents, highlightedWires, diagram]
    );

    // Initial Layout Calculation
    useEffect(() => {
      if (!diagram) {
        if (state.nodePositions.size > 0) {
          dispatch({ type: 'SET_NODE_POSITIONS', payload: new Map() });
        }
        return;
      }

      const needsLayout = diagram.components.some((c) => !state.nodePositions.has(c.id));
      if (needsLayout) {
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
      }
    }, [diagram, state.nodePositions]);

    // Event Handlers
    const handleWheel = useCallback((e: React.WheelEvent) => {
      e.stopPropagation();
      const scaleFactor = 0.1;
      if (e.deltaY > 0) dispatch({ type: 'ZOOM_OUT', payload: scaleFactor });
      else dispatch({ type: 'ZOOM_IN', payload: scaleFactor });
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) return;
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === '0') {
        e.preventDefault();
        dispatch({ type: 'RESET_VIEW' });
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        dispatch({ type: 'ZOOM_IN', payload: 0.2 });
      } else if (e.key === '-') {
        e.preventDefault();
        dispatch({ type: 'ZOOM_OUT', payload: 0.2 });
      }
    }, []);

    useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handlePointerDown = useCallback((e: React.PointerEvent, nodeId?: string) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture(e.pointerId);
      const pointerPos = { x: e.clientX, y: e.clientY };

      if (nodeId) {
        dispatch({ type: 'START_DRAG_NODE', payload: { nodeId, pointerPos } });
      } else {
        dispatch({ type: 'START_PAN', payload: pointerPos });
      }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
      e.preventDefault();
      const pointerPos = { x: e.clientX, y: e.clientY };
      const diagramPos = getDiagramPos(e.clientX, e.clientY);
      dispatch({ 
        type: 'POINTER_MOVE', 
        payload: { pointerPos, diagramPos, snapToGrid, gridSize: GRID_SIZE } 
      });
    }, [getDiagramPos, snapToGrid, GRID_SIZE]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
      (e.target as Element).releasePointerCapture(e.pointerId);
      dispatch({ type: 'POINTER_UP' });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      dispatch({ type: 'SET_DRAG_OVER', payload: true });
    }, []);

    const handleDragLeave = useCallback(() => {
      dispatch({ type: 'SET_DRAG_OVER', payload: false });
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      dispatch({ type: 'SET_DRAG_OVER', payload: false });
      const componentData = e.dataTransfer.getData('application/json');
      if (componentData && containerRef.current && onComponentDrop) {
        try {
          const component = JSON.parse(componentData) as ElectronicComponent;
          const rect = containerRef.current.getBoundingClientRect();
          let x = (e.clientX - rect.left - state.pan.x) / state.zoom;
          let y = (e.clientY - rect.top - state.pan.y) / state.zoom;
          x -= COMPONENT_WIDTH / 2;
          y -= COMPONENT_HEIGHT / 2;
          
          if (snapToGrid) {
            x = Math.round(x / GRID_SIZE) * GRID_SIZE;
            y = Math.round(y / GRID_SIZE) * GRID_SIZE;
          }
          onComponentDrop(component, x, y);
        } catch (err) {
          console.error('Drop failed', err);
        }
      }
    }, [state.pan, state.zoom, snapToGrid, GRID_SIZE, onComponentDrop]);

    const handlePinPointerDown = useCallback((
      e: React.PointerEvent,
      nodeId: string,
      pin: string,
      isRightSide: boolean
    ) => {
      e.stopPropagation();
      e.preventDefault();
      if (!diagram) return;
      const pos = state.nodePositions.get(nodeId);
      if (!pos) return;
      const startNode = diagram.components.find((n) => n.id === nodeId);
      const pinIndex = (startNode?.pins || []).indexOf(pin);
      const pinY = pos.y + 40 + pinIndex * 15;
      const pinX = isRightSide ? pos.x + COMPONENT_WIDTH : pos.x;
      dispatch({ type: 'START_WIRE', payload: { startNodeId: nodeId, startPin: pin, startX: pinX, startY: pinY } });
    }, [diagram, state.nodePositions]);

    const handlePinPointerUp = useCallback((e: React.PointerEvent, nodeId: string, pin: string) => {
      e.stopPropagation();
      if (!diagram || !state.tempWire) return;
      if (state.tempWire.startNodeId === nodeId && state.tempWire.startPin === pin) {
        dispatch({ type: 'POINTER_UP' });
        return;
      }
      
      const exists = diagram.connections.some(
        (c) =>
          (c.fromComponentId === state.tempWire!.startNodeId &&
            c.fromPin === state.tempWire!.startPin &&
            c.toComponentId === nodeId &&
            c.toPin === pin) ||
          (c.toComponentId === state.tempWire!.startNodeId &&
            c.toPin === state.tempWire!.startPin &&
            c.fromComponentId === nodeId &&
            c.fromPin === pin)
      );

      if (!exists) {
        const newConnection: WireConnection = {
          fromComponentId: state.tempWire.startNodeId,
          fromPin: state.tempWire.startPin,
          toComponentId: nodeId,
          toPin: pin,
          description: 'New Wire',
          color: '#00f3ff',
        };
        onDiagramUpdate({
          ...diagram,
          connections: [...diagram.connections, newConnection],
        });
      }
      dispatch({ type: 'POINTER_UP' });
    }, [diagram, state.tempWire, onDiagramUpdate]);

    const handleWireEditClick = useCallback((index: number) => {
      if (!diagram) return;
      const conn = diagram.connections[index];
      if (!conn) return;

      const startPos = state.nodePositions.get(conn.fromComponentId);
      const endPos = state.nodePositions.get(conn.toComponentId);
      if (startPos && endPos) {
        const startComp = diagram.components.find(c => c.id === conn.fromComponentId);
        const endComp = diagram.components.find(c => c.id === conn.toComponentId);
        let x1 = startPos.x, y1 = startPos.y;
        const startPinIdx = (startComp?.pins || []).indexOf(conn.fromPin);
        if (startPinIdx !== -1) {
          x1 += endPos.x < startPos.x ? 0 : COMPONENT_WIDTH;
          y1 += 40 + startPinIdx * 15;
        } else {
          x1 += COMPONENT_WIDTH / 2;
          y1 += COMPONENT_HEIGHT + 10;
        }

        let x2 = endPos.x, y2 = endPos.y;
        const endPinIdx = (endComp?.pins || []).indexOf(conn.toPin);
        if (endPinIdx !== -1) {
          x2 += endPos.x < startPos.x ? COMPONENT_WIDTH : 0;
          y2 += 40 + endPinIdx * 15;
        } else {
          x2 += COMPONENT_WIDTH / 2;
          y2 += COMPONENT_HEIGHT + 10;
        }
        dispatch({
          type: 'START_EDIT_WIRE',
          payload: {
            index,
            description: conn.description || '',
            position: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
          }
        });
      }
    }, [diagram, state.nodePositions]);

    const handleWireDelete = useCallback((index: number) => {
      if (!diagram || !onDiagramUpdate) return;
      const updatedConnections = diagram.connections.filter((_, i) => i !== index);
      onDiagramUpdate({ ...diagram, connections: updatedConnections });
    }, [diagram, onDiagramUpdate]);

    const handleWireLabelSave = useCallback(() => {
      if (state.editingWireIndex === null || !diagram || !onDiagramUpdate) return;
      const updatedConnections = diagram.connections.map((conn, i) =>
        i === state.editingWireIndex ? { ...conn, description: state.wireLabelInput } : conn
      );
      onDiagramUpdate({ ...diagram, connections: updatedConnections });
      dispatch({ type: 'SAVE_EDIT_WIRE' });
    }, [state.editingWireIndex, state.wireLabelInput, diagram, onDiagramUpdate]);

    // Unique Colors for Markers
    const uniqueColors = useMemo(() => {
      if (!diagram) return [];
      const colors = new Set<string>();
      diagram.connections.forEach((c) => {
        if (c.color) colors.add(c.color);
      });
      return Array.from(colors);
    }, [diagram]);

    // Filtering
    const filteredComponents = useMemo(() => {
      if (!diagram) return [];
      return diagram.components.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || c.type === filterType;
        return matchesSearch && matchesType;
      });
    }, [diagram, searchQuery, filterType]);

    // Hover effect from search
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
          const x = containerRef.current.clientWidth / 2 - (pos.x + COMPONENT_WIDTH / 2) * state.zoom;
          const y = containerRef.current.clientHeight / 2 - (pos.y + COMPONENT_HEIGHT / 2) * state.zoom;
          dispatch({ type: 'SET_PAN', payload: { x, y } });
        }
      }
    }, [searchQuery, state.zoom, filteredComponents, state.nodePositions]);

    // Render Helpers
    const diagramBounds = useMemo(() => {
      if (!diagram || filteredComponents.length === 0) {
        return { minX: 0, minY: 0, maxX: 500, maxY: 300, width: 500, height: 300 };
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      filteredComponents.forEach((c) => {
        const pos = state.nodePositions.get(c.id) || { x: 0, y: 0 };
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + COMPONENT_WIDTH);
        maxY = Math.max(maxY, pos.y + COMPONENT_HEIGHT);
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

    const viewportBounds = useMemo(() => {
      const width = viewportSize.width || containerRef.current?.clientWidth || 0;
      const height = viewportSize.height || containerRef.current?.clientHeight || 0;
      if (!width || !height) return null;
      const minX = (-state.pan.x) / state.zoom - VIEWPORT_PADDING;
      const minY = (-state.pan.y) / state.zoom - VIEWPORT_PADDING;
      const maxX = (width - state.pan.x) / state.zoom + VIEWPORT_PADDING;
      const maxY = (height - state.pan.y) / state.zoom + VIEWPORT_PADDING;
      return { minX, minY, maxX, maxY };
    }, [state.pan, state.zoom, viewportSize]);

    const shouldVirtualize = Boolean(diagram && diagram.components.length > VIRTUALIZATION_THRESHOLD);
    
    const renderComponents = useMemo(() => {
      if (!diagram) return [];
      if (!shouldVirtualize || !viewportBounds) return filteredComponents;
      return filteredComponents.filter((comp) => {
        const pos = state.nodePositions.get(comp.id);
        if (!pos) return true;
        const right = pos.x + COMPONENT_WIDTH;
        const bottom = pos.y + COMPONENT_HEIGHT;
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
        }
      });
    }, [diagramBounds, state.zoom]);

    const handleExportSVG = useCallback(() => {
      if (!svgRef.current || !diagram) return;
      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
      const bbox = svgRef.current.getBBox();
      const padding = 40;
      svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
      svgClone.setAttribute('width', String(bbox.width + padding * 2));
      svgClone.setAttribute('height', String(bbox.height + padding * 2));
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', String(bbox.x - padding));
      bg.setAttribute('y', String(bbox.y - padding));
      bg.setAttribute('width', String(bbox.width + padding * 2));
      bg.setAttribute('height', String(bbox.height + padding * 2));
      bg.setAttribute('fill', '#0f172a');
      svgClone.insertBefore(bg, svgClone.firstChild);
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagram.title.replace(/\s+/g, '_')}_diagram.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }, [diagram]);

    const handleExportPNG = useCallback(() => {
        if (!svgRef.current || !diagram) return;
        const svg = svgRef.current;
        const bbox = svg.getBBox();
        const padding = 40;
        const scale = 2;
        const width = (bbox.width + padding * 2) * scale;
        const height = (bbox.height + padding * 2) * scale;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        const svgClone = svg.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
        svgClone.setAttribute('width', String(width));
        svgClone.setAttribute('height', String(height));
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `${diagram.title.replace(/\s+/g, '_')}_diagram.png`;
              link.click();
              URL.revokeObjectURL(pngUrl);
            }
          }, 'image/png');
        };
        img.src = url;
    }, [diagram]);

    const dropZoneOverlay = state.isDragOver && (
      <div className="absolute inset-0 bg-neon-cyan/10 border-4 border-dashed border-neon-cyan/50 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-black/80 p-4 cut-corner-md border border-neon-cyan text-neon-cyan font-bold text-xl animate-pulse">
          DROP COMPONENT HERE
        </div>
      </div>
    );

    const isDiagramEmpty = Boolean(diagram && diagram.components.length === 0);
    const emptyDiagramOverlay = isDiagramEmpty && (
      <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-center text-slate-300 pointer-events-none px-4">
        <div className="w-16 h-16 cut-corner-md border border-neon-cyan/40 flex items-center justify-center text-neon-cyan/80">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-100">Drop parts to start wiring.</h3>
          <p className="text-[11px] text-slate-300 max-w-xs">Build manually or let chat generate a full diagram.</p>
        </div>
        <ol className="text-[11px] text-slate-300 space-y-1">
          <li>1. Open the Asset Manager and pick a component.</li>
          <li>2. Drag it onto the canvas to place a node.</li>
          <li>3. Use chat to auto-route wiring.</li>
        </ol>
        <div className="text-[11px] text-slate-300">Tip: Hold space to pan, scroll to zoom.</div>
      </div>
    );

    if (!diagram) {
      return (
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center text-slate-300 font-mono flex-col relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {dropZoneOverlay}
          <svg className="w-24 h-24 mb-6 opacity-30 animate-pulse text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-xl font-bold text-slate-100 mb-2">No diagram yet.</h3>
          <p className="max-w-md text-center text-sm text-slate-300">Ask chat to generate a wiring diagram, or drag parts from the inventory to start manually.</p>
          <div className="text-[11px] text-slate-300 mt-3">Tip: Once parts are placed, you can search and filter by type.</div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="w-full h-full bg-slate-950 overflow-hidden relative cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ touchAction: 'none' }}
      >
        {dropZoneOverlay}
        {emptyDiagramOverlay}

        {/* Zoom Controls */}
        <div className="absolute top-16 right-4 md:top-4 md:right-4 flex flex-col gap-2 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={() => dispatch({ type: 'ZOOM_IN', payload: 0.2 })}
            className="control-tile cut-corner-sm h-11 min-w-[44px] px-2 inline-flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-[0.22em] text-slate-100 border border-slate-700/70 hover:border-neon-cyan/60 hover:text-neon-cyan transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden md:block leading-none">Zoom In</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'ZOOM_OUT', payload: 0.2 })}
            className="control-tile cut-corner-sm h-11 min-w-[44px] px-2 inline-flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-[0.22em] text-slate-100 border border-slate-700/70 hover:border-neon-cyan/60 hover:text-neon-cyan transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            <span className="hidden md:block leading-none">Zoom Out</span>
          </button>
          <div
            className="control-tile cut-corner-sm h-8 min-w-[44px] px-2 inline-flex items-center justify-center text-[10px] font-mono font-bold text-neon-cyan border border-slate-700/70 shadow-lg select-none"
            title={`Zoom: ${Math.round(state.zoom * 100)}%`}
            aria-label={`Current zoom level: ${Math.round(state.zoom * 100)} percent`}
          >
            {Math.round(state.zoom * 100)}%
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_VIEW' })}
            className="control-tile cut-corner-sm h-11 min-w-[44px] px-2 inline-flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-[0.22em] text-slate-100 border border-slate-700/70 hover:border-neon-cyan/60 hover:text-neon-cyan transition-colors"
            title="Reset View"
            aria-label="Reset view"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="hidden md:block leading-none">Reset</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="absolute top-16 left-4 md:top-4 md:left-4 z-10 flex flex-col gap-1.5 max-w-[170px] md:max-w-[220px] pointer-events-auto">
          <div className="text-[8px] uppercase tracking-[0.24em] text-slate-500">Canvas tools</div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500">Search</span>
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/85 backdrop-blur border border-slate-700/80 cut-corner-sm px-2.5 py-1.5 text-[11px] text-white placeholder-slate-400 focus:outline-none focus:border-neon-cyan shadow-lg"
              aria-label="Search components"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500">Type</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950/85 backdrop-blur border border-slate-700/80 cut-corner-sm px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-neon-cyan shadow-lg cursor-pointer"
              aria-label="Filter by component type"
              title="Filter by component type"
            >
              <option value="all">All Types</option>
              <option value="microcontroller">Microcontrollers</option>
              <option value="sensor">Sensors</option>
              <option value="actuator">Actuators</option>
              <option value="power">Power</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold cut-corner-sm border shadow-lg transition-colors ${
              snapToGrid
                ? 'bg-neon-cyan/15 border-neon-cyan text-neon-cyan'
                : 'bg-slate-950/85 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
            title={snapToGrid ? 'Snap to Grid: ON' : 'Snap to Grid: OFF'}
            aria-pressed={snapToGrid}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3V3z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden md:inline">{snapToGrid ? 'Grid ON' : 'Grid OFF'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold cut-corner-sm border shadow-lg transition-colors ${
              viewMode === '3d'
                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                : 'bg-slate-950/85 border-slate-700/80 text-slate-300 hover:text-white hover:border-purple-500'
            }`}
            title={viewMode === '3d' ? 'Switch to 2D View' : 'Switch to 3D View'}
            aria-pressed={viewMode === '3d'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {viewMode === '3d' ? (
                <path d="M4 4h16v16H4zM4 9h16M9 4v16" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                </>
              )}
            </svg>
            <span className="hidden md:inline">{viewMode === '3d' ? '2D' : '3D'}</span>
          </button>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleExportSVG}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cut-corner-sm border shadow-lg bg-slate-950/85 border-slate-700/80 text-slate-300 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors"
              title="Export as SVG (vector)"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden md:inline">SVG</span>
            </button>
            <button
              type="button"
              onClick={handleExportPNG}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cut-corner-sm border shadow-lg bg-slate-950/85 border-slate-700/80 text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
              title="Export as PNG (image)"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden md:inline">PNG</span>
            </button>
          </div>
        </div>

        {viewMode === '3d' ? (
          <div className="w-full h-full">
            <Diagram3DView
              diagram={diagram}
              positions={state.nodePositions}
              onComponentClick={onComponentClick}
              onGenerate3D={onGenerate3D}
            />
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full pointer-events-none">
            <g transform={`translate(${state.pan.x}, ${state.pan.y}) scale(${state.zoom})`}>
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke={snapToGrid ? '#334155' : '#1e293b'} strokeWidth={snapToGrid ? 0.8 : 0.5} />
                </pattern>
                <pattern id="grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke={snapToGrid ? '#475569' : 'transparent'} strokeWidth="1" />
                </pattern>
                {SVG_GRADIENTS.map((grad) =>
                  grad.type === 'linear' ? (
                    <linearGradient key={grad.id} id={grad.id} x1={grad.x1} y1={grad.y1} x2={grad.x2} y2={grad.y2}>
                      {grad.stops.map((stop, i) => (
                        <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />
                      ))}
                    </linearGradient>
                  ) : (
                    <radialGradient key={grad.id} id={grad.id}>
                      {grad.stops.map((stop, i) => (
                        <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />
                      ))}
                    </radialGradient>
                  )
                )}
                {SVG_FILTERS.map((filter) => (
                  <filter key={filter.id} id={filter.id} x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx={filter.dx} dy={filter.dy} stdDeviation={filter.stdDeviation} floodOpacity={filter.floodOpacity} floodColor={filter.floodColor || '#000000'} />
                  </filter>
                ))}
                {uniqueColors.map((color) => (
                  <marker key={color} id={`arrow-${color.replace('#', '')}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill={color} />
                  </marker>
                ))}
              </defs>
              <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" opacity={snapToGrid ? 0.7 : 0.5} />
              {snapToGrid && <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid-major)" opacity="0.5" />}

              {renderConnections.map(({ conn, index }) => {
                const wireHighlight = highlightedWires.get(index);
                return (
                  <Wire
                    key={index}
                    connection={conn}
                    index={index}
                    startComponent={diagram.components.find((c) => c.id === conn.fromComponentId)}
                    endComponent={diagram.components.find((c) => c.id === conn.toComponentId)}
                    startPos={state.nodePositions.get(conn.fromComponentId)}
                    endPos={state.nodePositions.get(conn.toComponentId)}
                    highlight={wireHighlight ? { color: wireHighlight.color, pulse: wireHighlight.pulse } : undefined}
                    onEditClick={handleWireEditClick}
                    onDelete={handleWireDelete}
                  />
                );
              })}

              {state.tempWire && (
                <path
                  d={`M ${state.tempWire.startX} ${state.tempWire.startY} L ${state.cursorPos.x} ${state.cursorPos.y}`}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                  className="pointer-events-none"
                />
              )}

              {renderComponents.map((comp) => {
                const pos = state.nodePositions.get(comp.id);
                if (!pos) return null;
                const highlight = highlightedComponents.get(comp.id);
                return (
                  <DiagramNode
                    key={comp.id}
                    component={comp}
                    position={pos}
                    isHovered={state.hoveredNodeId === comp.id}
                    highlight={highlight ? { color: highlight.color, pulse: highlight.pulse } : undefined}
                    onPointerDown={handlePointerDown}
                    onClick={onComponentClick}
                    onPinPointerDown={handlePinPointerDown}
                    onPinPointerUp={handlePinPointerUp}
                  />
                );
              })}
            </g>
          </svg>
        )}

        {/* Wire Label Edit Overlay */}
        {state.editingWireIndex !== null && (
          <div
            className="absolute z-20 pointer-events-auto"
            style={{
              left: state.wireLabelPos.x * state.zoom + state.pan.x,
              top: state.wireLabelPos.y * state.zoom + state.pan.y - 20,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-slate-800 border border-neon-cyan cut-corner-sm p-2 shadow-xl flex gap-2 items-center">
              <input
                type="text"
                value={state.wireLabelInput}
                onChange={(e) => dispatch({ type: 'UPDATE_WIRE_LABEL', payload: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleWireLabelSave();
                  if (e.key === 'Escape') dispatch({ type: 'CANCEL_EDIT_WIRE' });
                }}
                placeholder="Wire description..."
                className="bg-slate-900 border border-slate-600 cut-corner-sm px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan w-48"
                autoFocus
              />
              <button
                type="button"
                onClick={handleWireLabelSave}
                className="px-2 py-1 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan text-[10px] uppercase tracking-[0.22em] cut-corner-sm hover:bg-neon-cyan/30"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'CANCEL_EDIT_WIRE' })}
                className="px-2 py-1 bg-slate-700 border border-slate-600 text-slate-300 text-[10px] uppercase tracking-[0.22em] cut-corner-sm hover:bg-slate-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Minimap */}
        {showMinimap && diagram && filteredComponents.length > 0 && (
          <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowMinimap(false)}
              className="absolute -top-3 -right-3 h-8 w-8 cut-corner-sm bg-slate-900/90 border border-slate-600 text-slate-300 text-xs hover:bg-slate-700 z-10 flex items-center justify-center"
              title="Hide minimap"
              aria-label="Hide minimap"
            >
              ×
            </button>
            <div
              className="w-40 h-24 bg-slate-900/95 border border-slate-600 cut-corner-md overflow-hidden cursor-pointer shadow-xl"
              onClick={handleMinimapClick}
            >
              <svg
                className="w-full h-full"
                viewBox={`${diagramBounds.minX} ${diagramBounds.minY} ${diagramBounds.width} ${diagramBounds.height}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <rect x={diagramBounds.minX} y={diagramBounds.minY} width={diagramBounds.width} height={diagramBounds.height} fill="#0f172a" />
                {filteredComponents.map((comp) => {
                  const pos = state.nodePositions.get(comp.id);
                  if (!pos) return null;
                  const color = comp.type === 'microcontroller' ? '#00979D' : comp.type === 'sensor' ? '#6D28D9' : comp.type === 'actuator' ? '#E62C2E' : comp.type === 'power' ? '#22C55E' : '#475569';
                  return <rect key={comp.id} x={pos.x} y={pos.y} width={COMPONENT_WIDTH} height={COMPONENT_HEIGHT} fill={color} opacity="0.8" />;
                })}
                {containerRef.current && (
                  <rect
                    x={-state.pan.x / state.zoom}
                    y={-state.pan.y / state.zoom}
                    width={containerRef.current.clientWidth / state.zoom}
                    height={containerRef.current.clientHeight / state.zoom}
                    fill="none"
                    stroke="#00F3FF"
                    strokeWidth={Math.max(2, 4 / state.zoom)}
                    opacity="0.8"
                  />
                )}
              </svg>
            </div>
          </div>
        )}

        {!showMinimap && diagram && filteredComponents.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMinimap(true)}
            className="absolute bottom-4 right-4 z-10 pointer-events-auto w-10 h-10 cut-corner-sm bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg flex items-center justify-center"
            title="Show minimap"
            aria-label="Show minimap"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" />
              <rect x="14" y="14" width="6" height="6" />
            </svg>
          </button>
        )}
      </div>
    );
  };

const DiagramCanvas = React.memo(forwardRef(DiagramCanvasRenderer));

DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas;