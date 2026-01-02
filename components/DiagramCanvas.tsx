import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { WiringDiagram, ElectronicComponent, WireConnection } from '../types';
import { Wire, DiagramNode, COMPONENT_WIDTH, COMPONENT_HEIGHT } from './diagram';
import type { WireHighlightState, NodeHighlightState } from './diagram';

interface DiagramCanvasProps {
  diagram: WiringDiagram | null;
  onComponentClick: (component: ElectronicComponent) => void;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
  onComponentDrop?: (component: ElectronicComponent, x: number, y: number) => void;
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
}

const DiagramCanvas = forwardRef<DiagramCanvasRef, DiagramCanvasProps>(
  ({ diagram, onComponentClick, onDiagramUpdate, onComponentDrop }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // View State
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [showMinimap, setShowMinimap] = useState(true);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

    // Grid settings
    const GRID_SIZE = 20; // 20px grid
    const VIRTUALIZATION_THRESHOLD = 100;
    const VIEWPORT_PADDING = 240;

    // Snap position to grid
    const snapPosition = useCallback((x: number, y: number) => {
      if (!snapToGrid) return { x, y };
      return {
        x: Math.round(x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(y / GRID_SIZE) * GRID_SIZE,
      };
    }, [snapToGrid]);

    useEffect(() => {
      if (!containerRef.current) return;

      const node = containerRef.current;
      const updateViewport = () => {
        setViewportSize({ width: node.clientWidth, height: node.clientHeight });
      };

      updateViewport();

      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const observer = new ResizeObserver(() => updateViewport());
      observer.observe(node);

      return () => observer.disconnect();
    }, []);

    // Interaction State
    const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(
      new Map()
    );
    const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // Wire label editing state
    const [editingWireIndex, setEditingWireIndex] = useState<number | null>(null);
    const [wireLabelInput, setWireLabelInput] = useState('');
    const [wireLabelPos, setWireLabelPos] = useState({ x: 0, y: 0 });

    // Wire Creation State
    const [tempWire, setTempWire] = useState<{
      startNodeId: string;
      startPin: string;
      startX: number;
      startY: number;
    } | null>(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    // Drag Over State
    const [isDragOver, setIsDragOver] = useState(false);

    // AI Highlight State
    const [highlightedComponents, setHighlightedComponents] = useState<Map<string, HighlightState>>(
      new Map()
    );
    const [highlightedWires, setHighlightedWires] = useState<Map<number, HighlightState>>(
      new Map()
    );

    // Expose imperative API to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        // View Controls
        setZoom: (level: number) => setZoom(Math.max(0.2, Math.min(4, level))),
        getZoom: () => zoom,
        setPan: (x: number, y: number) => setPan({ x, y }),
        getPan: () => pan,
        resetView: () => {
          setPan({ x: 0, y: 0 });
          setZoom(1);
        },

        // Component Focus
        centerOnComponent: (componentId: string, targetZoom?: number) => {
          const pos = nodePositions.get(componentId);
          if (pos && containerRef.current) {
            const newZoom = targetZoom ?? zoom;
            setZoom(newZoom);
            setPan({
              x: containerRef.current.clientWidth / 2 - (pos.x + COMPONENT_WIDTH / 2) * newZoom,
              y: containerRef.current.clientHeight / 2 - (pos.y + COMPONENT_HEIGHT / 2) * newZoom,
            });
          }
        },

        highlightComponent: (componentId: string, options?: HighlightOptions) => {
          const { color = '#00f3ff', duration = 3000, pulse = true } = options || {};

          // Clear existing timer if any
          const existing = highlightedComponents.get(componentId);
          if (existing?.timerId) {
            clearTimeout(existing.timerId);
          }

          // Set up auto-clear timer
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
            if (existing?.timerId) {
              clearTimeout(existing.timerId);
            }
            setHighlightedComponents((prev) => {
              const next = new Map(prev);
              next.delete(componentId);
              return next;
            });
          } else {
            // Clear all
            highlightedComponents.forEach((state) => {
              if (state.timerId) clearTimeout(state.timerId);
            });
            setHighlightedComponents(new Map());
          }
        },

        // Wire Controls
        highlightWire: (wireIndex: number, options?: HighlightOptions) => {
          const { color = '#ff00ff', duration = 3000, pulse = true } = options || {};

          const existing = highlightedWires.get(wireIndex);
          if (existing?.timerId) {
            clearTimeout(existing.timerId);
          }

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
            if (existing?.timerId) {
              clearTimeout(existing.timerId);
            }
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

        // Positioning
        getComponentPosition: (componentId: string) => {
          return nodePositions.get(componentId) || null;
        },

        setComponentPosition: (componentId: string, x: number, y: number) => {
          setNodePositions((prev) => {
            const next = new Map(prev);
            next.set(componentId, { x, y });
            return next;
          });
        },

        getAllComponentPositions: () => new Map(nodePositions),
      }),
      [zoom, pan, nodePositions, highlightedComponents, highlightedWires]
    );

    // Extract unique colors for markers
    const uniqueColors = useMemo(() => {
      if (!diagram) return [];
      const colors = new Set<string>();
      diagram.connections.forEach((c) => {
        if (c.color) colors.add(c.color);
      });
      return Array.from(colors);
    }, [diagram]);

    // 1. Initial Auto-Layout Calculation
    useEffect(() => {
      if (!diagram) {
        setNodePositions(new Map());
        return;
      }

      const needsLayout = diagram.components.some((c) => !nodePositions.has(c.id));

      if (needsLayout) {
        setNodePositions((prev) => {
          const newPositions = new Map(prev);

          // Only position items that don't have positions yet
          const unpositioned = diagram.components.filter((c) => !newPositions.has(c.id));
          if (unpositioned.length === 0) return newPositions;

          // Simple grid layout fallback for new items
          let yOffset = 50;
          let xOffset = 400; // Centerish

          unpositioned.forEach((c) => {
            if (c.type === 'power') xOffset = 100;
            else if (c.type === 'microcontroller') xOffset = 400;
            else xOffset = 700;

            // Find a slot
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
          return newPositions;
        });
      }
      // nodePositions accessed via functional setState (prev) - no external dep needed
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [diagram]);

    // 2. Event Handlers (memoized with useCallback)
    const handleWheel = useCallback((e: React.WheelEvent) => {
      e.stopPropagation();
      const scaleFactor = 0.1;
      setZoom((prev) =>
        e.deltaY > 0 ? Math.max(0.5, prev - scaleFactor) : Math.min(3, prev + scaleFactor)
      );
    }, []);

    const handleZoom = useCallback((delta: number) => {
      setZoom((prev) => Math.max(0.2, Math.min(4, prev + delta)));
    }, []);

    const handleCenterView = useCallback(() => {
      setPan({ x: 0, y: 0 });
      setZoom(1);
    }, []);

    // Keyboard shortcuts for zoom and view controls
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in input fields
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable
        ) {
          return;
        }

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modKey = isMac ? e.metaKey : e.ctrlKey;

        // Ctrl/Cmd + 0: Reset view
        if (modKey && e.key === '0') {
          e.preventDefault();
          handleCenterView();
          return;
        }

        // + or = : Zoom in
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          handleZoom(0.2);
          return;
        }

        // - : Zoom out
        if (e.key === '-') {
          e.preventDefault();
          handleZoom(-0.2);
          return;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleCenterView, handleZoom]);

    // Pointer Events instead of Mouse Events for better mobile support
    const handlePointerDown = useCallback((e: React.PointerEvent, nodeId?: string) => {
      e.stopPropagation();
      // Allow zooming with two fingers or default behavior if needed,
      // but here we focus on drag/pan.
      (e.target as Element).setPointerCapture(e.pointerId);

      setLastPointerPos({ x: e.clientX, y: e.clientY });

      if (nodeId) {
        setIsDraggingNode(nodeId);
      } else {
        setIsPanning(true);
        setEditingWireIndex(null);
      }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
      e.preventDefault(); // Prevent scrolling on touch

      setLastPointerPos((prev) => {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;

        // Update cursor pos for wire drawing (in SVG space)
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setCursorPos({
            x: (e.clientX - rect.left - pan.x) / zoom,
            y: (e.clientY - rect.top - pan.y) / zoom,
          });
        }

        if (isDraggingNode) {
          setNodePositions((positions) => {
            const newMap = new Map<string, { x: number; y: number }>(positions);
            const currentPos = newMap.get(isDraggingNode);
            if (currentPos) {
              const newX = currentPos.x + dx / zoom;
              const newY = currentPos.y + dy / zoom;
              const snapped = snapPosition(newX, newY);
              newMap.set(isDraggingNode, snapped);
            }
            return newMap;
          });
        } else if (isPanning) {
          setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
        }

        return { x: e.clientX, y: e.clientY };
      });
    }, [pan.x, pan.y, zoom, isDraggingNode, isPanning, snapPosition]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
      (e.target as Element).releasePointerCapture(e.pointerId);
      setIsDraggingNode(null);
      setIsPanning(false);
      setTempWire(null);
    }, []);

    // Drag and Drop Handlers (HTML5 DnD still used for inventory drop)
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
      setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const componentData = e.dataTransfer.getData('application/json');
      if (componentData && containerRef.current && onComponentDrop) {
        try {
          const component = JSON.parse(componentData) as ElectronicComponent;
          const rect = containerRef.current.getBoundingClientRect();
          const rawX = (e.clientX - rect.left - pan.x) / zoom;
          const rawY = (e.clientY - rect.top - pan.y) / zoom;
          const snapped = snapPosition(rawX - COMPONENT_WIDTH / 2, rawY - COMPONENT_HEIGHT / 2);
          onComponentDrop(component, snapped.x, snapped.y);
        } catch (err) {
          console.error('Drop failed', err);
        }
      }
    }, [pan.x, pan.y, zoom, onComponentDrop, snapPosition]);

    const handlePinPointerDown = useCallback((
      e: React.PointerEvent,
      nodeId: string,
      pin: string,
      isRightSide: boolean
    ) => {
      e.stopPropagation();
      e.preventDefault();
      if (!diagram) return;

      const pos = nodePositions.get(nodeId);
      if (!pos) return;

      const startNode = diagram.components.find((n) => n.id === nodeId);
      const pinIndex = (startNode?.pins || []).indexOf(pin);
      const pinY = pos.y + 40 + pinIndex * 15;
      const pinX = isRightSide ? pos.x + COMPONENT_WIDTH : pos.x;

      setTempWire({
        startNodeId: nodeId,
        startPin: pin,
        startX: pinX,
        startY: pinY,
      });
    }, [diagram, nodePositions]);

    const handlePinPointerUp = useCallback((e: React.PointerEvent, nodeId: string, pin: string) => {
      e.stopPropagation();
      if (!diagram || !tempWire) return;

      if (tempWire.startNodeId === nodeId && tempWire.startPin === pin) {
        setTempWire(null);
        return;
      }

      // Check if connection exists
      const exists = diagram.connections.some(
        (c) =>
          (c.fromComponentId === tempWire.startNodeId &&
            c.fromPin === tempWire.startPin &&
            c.toComponentId === nodeId &&
            c.toPin === pin) ||
          (c.toComponentId === tempWire.startNodeId &&
            c.toPin === tempWire.startPin &&
            c.fromComponentId === nodeId &&
            c.fromPin === pin)
      );

      if (!exists) {
        const newConnection: WireConnection = {
          fromComponentId: tempWire.startNodeId,
          fromPin: tempWire.startPin,
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
      setTempWire(null);
    }, [diagram, tempWire, onDiagramUpdate]);

    // Handler for wire edit clicks (passed to Wire component)
    const handleWireEditClick = useCallback((index: number) => {
      if (!diagram) return;
      const conn = diagram.connections[index];
      if (!conn) return;

      // Get wire midpoint for positioning the edit input
      const startPos = nodePositions.get(conn.fromComponentId);
      const endPos = nodePositions.get(conn.toComponentId);
      if (startPos && endPos) {
        const startComp = diagram.components.find(c => c.id === conn.fromComponentId);
        const endComp = diagram.components.find(c => c.id === conn.toComponentId);
        const COMPONENT_WIDTH = 140;
        const COMPONENT_HEIGHT = 100;

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

        setWireLabelPos({ x: (x1 + x2) / 2, y: (y1 + y2) / 2 });
      }

      setWireLabelInput(conn.description || '');
      setEditingWireIndex(index);
    }, [diagram, nodePositions]);

    // Handler for wire deletion (right-click or delete button)
    const handleWireDelete = useCallback((index: number) => {
      if (!diagram || !onDiagramUpdate) return;

      const updatedConnections = diagram.connections.filter((_, i) => i !== index);
      onDiagramUpdate({
        ...diagram,
        connections: updatedConnections,
      });
    }, [diagram, onDiagramUpdate]);

    // Handler for saving wire label edit
    const handleWireLabelSave = useCallback(() => {
      if (editingWireIndex === null || !diagram || !onDiagramUpdate) return;

      const updatedConnections = diagram.connections.map((conn, i) =>
        i === editingWireIndex ? { ...conn, description: wireLabelInput } : conn
      );

      onDiagramUpdate({
        ...diagram,
        connections: updatedConnections,
      });

      setEditingWireIndex(null);
      setWireLabelInput('');
    }, [editingWireIndex, diagram, onDiagramUpdate, wireLabelInput]);

    // Handler for canceling wire label edit
    const handleWireLabelCancel = useCallback(() => {
      setEditingWireIndex(null);
      setWireLabelInput('');
    }, []);

    // Export diagram as SVG
    const handleExportSVG = useCallback(() => {
      if (!svgRef.current || !diagram) return;

      // Clone the SVG element
      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;

      // Set proper dimensions and viewBox
      const bbox = svgRef.current.getBBox();
      const padding = 40;
      svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
      svgClone.setAttribute('width', String(bbox.width + padding * 2));
      svgClone.setAttribute('height', String(bbox.height + padding * 2));

      // Add background
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', String(bbox.x - padding));
      bg.setAttribute('y', String(bbox.y - padding));
      bg.setAttribute('width', String(bbox.width + padding * 2));
      bg.setAttribute('height', String(bbox.height + padding * 2));
      bg.setAttribute('fill', '#0f172a');
      svgClone.insertBefore(bg, svgClone.firstChild);

      // Serialize and download
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagram.title.replace(/\s+/g, '_')}_diagram.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }, [diagram]);

    // Export diagram as PNG
    const handleExportPNG = useCallback(() => {
      if (!svgRef.current || !diagram) return;

      const svg = svgRef.current;
      const bbox = svg.getBBox();
      const padding = 40;
      const scale = 2; // 2x resolution for quality

      const width = (bbox.width + padding * 2) * scale;
      const height = (bbox.height + padding * 2) * scale;

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Clone and prepare SVG
      const svgClone = svg.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
      svgClone.setAttribute('width', String(width));
      svgClone.setAttribute('height', String(height));

      // Convert to data URL
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        // Download PNG
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

    const filteredComponents = useMemo(() => {
      if (!diagram) return [];
      return diagram.components.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || c.type === filterType;
        return matchesSearch && matchesType;
      });
    }, [diagram, searchQuery, filterType]);

    const shouldVirtualize = Boolean(diagram && diagram.components.length > VIRTUALIZATION_THRESHOLD);

    useEffect(() => {
      if (!searchQuery.trim() || !nodePositions.size) {
        setHoveredNodeId(null);
        return;
      }
      const foundNode = filteredComponents.find((n) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (foundNode) {
        setHoveredNodeId(foundNode.id);
        const pos = nodePositions.get(foundNode.id);
        if (pos && containerRef.current) {
          setPan({
            x: containerRef.current.clientWidth / 2 - (pos.x + COMPONENT_WIDTH / 2) * zoom,
            y: containerRef.current.clientHeight / 2 - (pos.y + COMPONENT_HEIGHT / 2) * zoom,
          });
        }
      }
    }, [searchQuery, zoom, filteredComponents, nodePositions]);

    const dropZoneOverlay = isDragOver && (
      <div className="absolute inset-0 bg-neon-cyan/10 border-4 border-dashed border-neon-cyan/50 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-black/80 p-4 rounded-xl border border-neon-cyan text-neon-cyan font-bold text-xl animate-pulse">
          DROP COMPONENT HERE
        </div>
      </div>
    );

    // Calculate diagram bounds for minimap
    const diagramBounds = useMemo(() => {
      if (!diagram || filteredComponents.length === 0) {
        return { minX: 0, minY: 0, maxX: 500, maxY: 300, width: 500, height: 300 };
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      filteredComponents.forEach((c) => {
        const pos = nodePositions.get(c.id) || { x: 0, y: 0 };
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
    }, [diagram, filteredComponents, nodePositions]);

    const viewportBounds = useMemo(() => {
      const width = viewportSize.width || containerRef.current?.clientWidth || 0;
      const height = viewportSize.height || containerRef.current?.clientHeight || 0;
      if (!width || !height) return null;

      const minX = (-pan.x) / zoom - VIEWPORT_PADDING;
      const minY = (-pan.y) / zoom - VIEWPORT_PADDING;
      const maxX = (width - pan.x) / zoom + VIEWPORT_PADDING;
      const maxY = (height - pan.y) / zoom + VIEWPORT_PADDING;
      return { minX, minY, maxX, maxY };
    }, [pan.x, pan.y, zoom, viewportSize.width, viewportSize.height]);

    const renderComponents = useMemo(() => {
      if (!diagram) return [];
      if (!shouldVirtualize || !viewportBounds) {
        return filteredComponents;
      }

      return filteredComponents.filter((comp) => {
        const pos = nodePositions.get(comp.id);
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
    }, [diagram, filteredComponents, nodePositions, shouldVirtualize, viewportBounds]);

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

    // Minimap click handler - pan to clicked location
    const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const minimapWidth = 160;
      const minimapHeight = 100;
      const scale = Math.min(minimapWidth / diagramBounds.width, minimapHeight / diagramBounds.height);

      const clickX = (e.clientX - rect.left) / scale + diagramBounds.minX;
      const clickY = (e.clientY - rect.top) / scale + diagramBounds.minY;

      setPan({
        x: containerRef.current.clientWidth / 2 - clickX * zoom,
        y: containerRef.current.clientHeight / 2 - clickY * zoom,
      });
    }, [diagramBounds, zoom]);

    const isDiagramEmpty = Boolean(diagram && diagram.components.length === 0);
    const emptyDiagramOverlay = isDiagramEmpty && (
      <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-center text-slate-300 pointer-events-none px-4">
        <div className="w-16 h-16 rounded-full border border-neon-cyan/40 flex items-center justify-center text-neon-cyan/80">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 7h16M4 12h16M4 17h10"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-100">Drop parts to start wiring.</h3>
          <p className="text-[11px] text-slate-300 max-w-xs">
            Build manually or let chat generate a full diagram.
          </p>
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
          <svg
            className="w-24 h-24 mb-6 opacity-30 animate-pulse text-neon-cyan"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h3 className="text-xl font-bold text-slate-100 mb-2">No diagram yet.</h3>
          <p className="max-w-md text-center text-sm text-slate-300">
            Ask chat to generate a wiring diagram, or drag parts from the inventory to start
            manually.
          </p>
          <div className="text-[11px] text-slate-300 mt-3">
            Tip: Once parts are placed, you can search and filter by type.
          </div>
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

        {/* Zoom Controls (Mobile Friendly) */}
        <div className="absolute top-16 right-4 md:top-4 md:right-4 flex flex-col gap-2 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={() => handleZoom(0.2)}
            className="control-tile cut-corner-sm h-11 min-w-[44px] px-2 inline-flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-[0.22em] text-slate-100 border border-slate-700/70 hover:border-neon-cyan/60 hover:text-neon-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="hidden md:block leading-none">Zoom In</span>
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.2)}
            className="control-tile cut-corner-sm h-11 min-w-[44px] px-2 inline-flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-[0.22em] text-slate-100 border border-slate-700/70 hover:border-neon-cyan/60 hover:text-neon-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            <span className="hidden md:block leading-none">Zoom Out</span>
          </button>
          {/* Zoom Level Indicator */}
          <div
            className="control-tile cut-corner-sm h-8 min-w-[44px] px-2 inline-flex items-center justify-center text-[10px] font-mono font-bold text-neon-cyan border border-slate-700/70 shadow-lg select-none"
            title={`Zoom: ${Math.round(zoom * 100)}%`}
            aria-label={`Current zoom level: ${Math.round(zoom * 100)} percent`}
          >
            {Math.round(zoom * 100)}%
          </div>
          <button
            type="button"
            onClick={handleCenterView}
            className="control-tile cut-corner-sm h-11 min-w-[44px] px-2 inline-flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-[0.22em] text-slate-100 border border-slate-700/70 hover:border-neon-cyan/60 hover:text-neon-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
            title="Reset View"
            aria-label="Reset view"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span className="hidden md:block leading-none">Reset</span>
          </button>
        </div>

        {/* Search / Filter Overlay */}
        <div className="absolute top-16 left-4 md:top-4 md:left-4 z-10 flex flex-col gap-2 max-w-[150px] md:max-w-[200px] pointer-events-auto">
          <input
            type="text"
            placeholder="Locate part..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-300 focus:outline-none focus:border-neon-cyan shadow-lg"
          />
          {/* Component Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan shadow-lg cursor-pointer"
            title="Filter by component type"
          >
            <option value="all">All Types</option>
            <option value="microcontroller">Microcontrollers</option>
            <option value="sensor">Sensors</option>
            <option value="actuator">Actuators</option>
            <option value="power">Power</option>
            <option value="other">Other</option>
          </select>
          {/* Snap to Grid Toggle */}
          <button
            type="button"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border shadow-lg transition-colors ${
              snapToGrid
                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
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
          {/* Export Buttons */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleExportSVG}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border shadow-lg bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors"
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
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border shadow-lg bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
              title="Export as PNG (image)"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden md:inline">PNG</span>
            </button>
          </div>
        </div>

        <svg ref={svgRef} className="w-full h-full pointer-events-none">
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <defs>
              {/* Grid pattern - 20px spacing to match snap grid */}
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={snapToGrid ? '#334155' : '#1e293b'} strokeWidth={snapToGrid ? 0.8 : 0.5} />
              </pattern>
              {/* Major grid lines every 100px when snapping */}
              <pattern id="grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke={snapToGrid ? '#475569' : 'transparent'} strokeWidth="1" />
              </pattern>
              {uniqueColors.map((color) => (
                <marker
                  key={color}
                  id={`arrow-${color.replace('#', '')}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill={color} />
                </marker>
              ))}
            </defs>
            <rect
              x="-5000"
              y="-5000"
              width="10000"
              height="10000"
              fill="url(#grid)"
              opacity={snapToGrid ? 0.7 : 0.5}
            />
            {/* Major grid overlay when snapping */}
            {snapToGrid && (
              <rect
                x="-5000"
                y="-5000"
                width="10000"
                height="10000"
                fill="url(#grid-major)"
                opacity="0.5"
              />
            )}

            {/* Render Wires (extracted to memoized Wire component) */}
            {renderConnections.map(({ conn, index }) => {
              const wireHighlight = highlightedWires.get(index);
              return (
                <Wire
                  key={index}
                  connection={conn}
                  index={index}
                  startComponent={diagram.components.find((c) => c.id === conn.fromComponentId)}
                  endComponent={diagram.components.find((c) => c.id === conn.toComponentId)}
                  startPos={nodePositions.get(conn.fromComponentId)}
                  endPos={nodePositions.get(conn.toComponentId)}
                  highlight={wireHighlight ? { color: wireHighlight.color, pulse: wireHighlight.pulse } : undefined}
                  onEditClick={handleWireEditClick}
                  onDelete={handleWireDelete}
                />
              );
            })}

            {/* Temp Wire Dragging */}
            {tempWire && (
              <path
                d={`M ${tempWire.startX} ${tempWire.startY} L ${cursorPos.x} ${cursorPos.y}`}
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                className="pointer-events-none"
              />
            )}

            {/* Render Components (extracted to memoized DiagramNode component) */}
            {renderComponents.map((comp) => {
              const pos = nodePositions.get(comp.id);
              if (!pos) return null;
              const highlight = highlightedComponents.get(comp.id);
              return (
                <DiagramNode
                  key={comp.id}
                  component={comp}
                  position={pos}
                  isHovered={hoveredNodeId === comp.id}
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

        {/* Wire Label Edit Overlay */}
        {editingWireIndex !== null && (
          <div
            className="absolute z-20 pointer-events-auto"
            style={{
              left: wireLabelPos.x * zoom + pan.x,
              top: wireLabelPos.y * zoom + pan.y - 20,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-slate-800 border border-neon-cyan cut-corner-sm p-2 shadow-xl flex gap-2 items-center">
              <input
                type="text"
                value={wireLabelInput}
                onChange={(e) => setWireLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleWireLabelSave();
                  if (e.key === 'Escape') handleWireLabelCancel();
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
                onClick={handleWireLabelCancel}
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
            {/* Minimap Toggle */}
            <button
              type="button"
              onClick={() => setShowMinimap(false)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-700 border border-slate-600 text-slate-300 text-xs hover:bg-slate-600 z-10 flex items-center justify-center"
              title="Hide minimap"
            >
              ×
            </button>
            <div
              className="w-40 h-24 bg-slate-900/95 border border-slate-600 rounded-lg overflow-hidden cursor-pointer shadow-xl"
              onClick={handleMinimapClick}
              title="Click to navigate"
            >
              <svg
                className="w-full h-full"
                viewBox={`${diagramBounds.minX} ${diagramBounds.minY} ${diagramBounds.width} ${diagramBounds.height}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Background */}
                <rect
                  x={diagramBounds.minX}
                  y={diagramBounds.minY}
                  width={diagramBounds.width}
                  height={diagramBounds.height}
                  fill="#0f172a"
                />
                {/* Component markers */}
                {filteredComponents.map((comp) => {
                  const pos = nodePositions.get(comp.id);
                  if (!pos) return null;
                  const color = comp.type === 'microcontroller' ? '#00979D' :
                               comp.type === 'sensor' ? '#6D28D9' :
                               comp.type === 'actuator' ? '#E62C2E' :
                               comp.type === 'power' ? '#22C55E' : '#475569';
                  return (
                    <rect
                      key={comp.id}
                      x={pos.x}
                      y={pos.y}
                      width={COMPONENT_WIDTH}
                      height={COMPONENT_HEIGHT}
                      fill={color}
                      opacity="0.8"
                      rx="2"
                    />
                  );
                })}
                {/* Viewport indicator */}
                {containerRef.current && (
                  <rect
                    x={-pan.x / zoom}
                    y={-pan.y / zoom}
                    width={containerRef.current.clientWidth / zoom}
                    height={containerRef.current.clientHeight / zoom}
                    fill="none"
                    stroke="#00F3FF"
                    strokeWidth={Math.max(2, 4 / zoom)}
                    opacity="0.8"
                  />
                )}
              </svg>
            </div>
          </div>
        )}

        {/* Minimap Toggle Button (when hidden) */}
        {!showMinimap && diagram && filteredComponents.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMinimap(true)}
            className="absolute bottom-4 right-4 z-10 pointer-events-auto w-10 h-10 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg flex items-center justify-center"
            title="Show minimap"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

// Add display name for debugging
DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas;
