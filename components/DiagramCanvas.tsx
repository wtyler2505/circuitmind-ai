import React, { useMemo, useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { WiringDiagram, ElectronicComponent, WireConnection } from '../types';

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

// State for a highlighted component
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

const COMPONENT_WIDTH = 140;
const COMPONENT_HEIGHT = 100;

const DiagramCanvas = forwardRef<DiagramCanvasRef, DiagramCanvasProps>(({ diagram, onComponentClick, onDiagramUpdate, onComponentDrop }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // View State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Interaction State
  const [nodePositions, setNodePositions] = useState<Map<string, {x: number, y: number}>>(new Map());
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Wire Editing
  const [editingWireIndex, setEditingWireIndex] = useState<number | null>(null);
  const [wireLabelInput, setWireLabelInput] = useState('');
  const [wireLabelPos, setWireLabelPos] = useState({x: 0, y: 0});

  // Wire Creation State
  const [tempWire, setTempWire] = useState<{startNodeId: string, startPin: string, startX: number, startY: number} | null>(null);
  const [cursorPos, setCursorPos] = useState({x: 0, y: 0});
  
  // Drag Over State
  const [isDragOver, setIsDragOver] = useState(false);

  // AI Highlight State
  const [highlightedComponents, setHighlightedComponents] = useState<Map<string, HighlightState>>(new Map());
  const [highlightedWires, setHighlightedWires] = useState<Map<number, HighlightState>>(new Map());

  // Expose imperative API to parent via ref
  useImperativeHandle(ref, () => ({
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
          x: (containerRef.current.clientWidth / 2) - (pos.x + COMPONENT_WIDTH / 2) * newZoom,
          y: (containerRef.current.clientHeight / 2) - (pos.y + COMPONENT_HEIGHT / 2) * newZoom
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
          setHighlightedComponents(prev => {
            const next = new Map(prev);
            next.delete(componentId);
            return next;
          });
        }, duration);
      }

      setHighlightedComponents(prev => {
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
        setHighlightedComponents(prev => {
          const next = new Map(prev);
          next.delete(componentId);
          return next;
        });
      } else {
        // Clear all
        highlightedComponents.forEach(state => {
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
          setHighlightedWires(prev => {
            const next = new Map(prev);
            next.delete(wireIndex);
            return next;
          });
        }, duration);
      }

      setHighlightedWires(prev => {
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
        setHighlightedWires(prev => {
          const next = new Map(prev);
          next.delete(wireIndex);
          return next;
        });
      } else {
        highlightedWires.forEach(state => {
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
      setNodePositions(prev => {
        const next = new Map(prev);
        next.set(componentId, { x, y });
        return next;
      });
    },

    getAllComponentPositions: () => new Map(nodePositions),
  }), [zoom, pan, nodePositions, highlightedComponents, highlightedWires]);

  // Extract unique colors for markers
  const uniqueColors = useMemo(() => {
    if (!diagram) return [];
    const colors = new Set<string>();
    diagram.connections.forEach(c => {
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

    const needsLayout = diagram.components.some(c => !nodePositions.has(c.id));
    
    if (needsLayout) {
        setNodePositions(prev => {
            const newPositions = new Map(prev);
            
            // Only position items that don't have positions yet
            const unpositioned = diagram.components.filter(c => !newPositions.has(c.id));
            if (unpositioned.length === 0) return newPositions;

            // Simple grid layout fallback for new items
            let yOffset = 50;
            let xOffset = 400; // Centerish

            unpositioned.forEach((c, i) => {
                if (c.type === 'power') xOffset = 100;
                else if (c.type === 'microcontroller') xOffset = 400;
                else xOffset = 700;
                
                // Find a slot
                let conflict = true;
                let attempts = 0;
                while(conflict && attempts < 100) {
                     conflict = Array.from(newPositions.values()).some((p: {x: number, y: number}) => Math.abs(p.x - xOffset) < 50 && Math.abs(p.y - yOffset) < 50);
                     if(conflict) yOffset += 200;
                     attempts++;
                }
                newPositions.set(c.id, { x: xOffset, y: yOffset });
                yOffset += 200;
            });
            return newPositions;
        });
    }
  }, [diagram]);

  // 2. Event Handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const scaleFactor = 0.1;
    const newZoom = e.deltaY > 0 ? Math.max(0.5, zoom - scaleFactor) : Math.min(3, zoom + scaleFactor);
    setZoom(newZoom);
  };

  const handleZoom = (delta: number) => {
      setZoom(prev => Math.max(0.2, Math.min(4, prev + delta)));
  };

  const handleCenterView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Pointer Events instead of Mouse Events for better mobile support
  const handlePointerDown = (e: React.PointerEvent, nodeId?: string) => {
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
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    
    const dx = e.clientX - lastPointerPos.x;
    const dy = e.clientY - lastPointerPos.y;
    setLastPointerPos({ x: e.clientX, y: e.clientY });

    // Update cursor pos for wire drawing (in SVG space)
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const svgX = (e.clientX - rect.left - pan.x) / zoom;
        const svgY = (e.clientY - rect.top - pan.y) / zoom;
        setCursorPos({x: svgX, y: svgY});
    }

    if (isDraggingNode) {
        setNodePositions(prev => {
            const newMap = new Map<string, {x: number, y: number}>(prev);
            const currentPos = newMap.get(isDraggingNode);
            if (currentPos) {
                newMap.set(isDraggingNode, {
                    x: currentPos.x + (dx / zoom),
                    y: currentPos.y + (dy / zoom)
                });
            }
            return newMap;
        });
    } else if (isPanning) {
        setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    setIsDraggingNode(null);
    setIsPanning(false);
    if (tempWire) {
        setTempWire(null);
    }
  };
  
  // Drag and Drop Handlers (HTML5 DnD still used for inventory drop)
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const componentData = e.dataTransfer.getData('application/json');
      if (componentData && containerRef.current && onComponentDrop) {
          try {
             const component = JSON.parse(componentData) as ElectronicComponent;
             const rect = containerRef.current.getBoundingClientRect();
             const x = (e.clientX - rect.left - pan.x) / zoom;
             const y = (e.clientY - rect.top - pan.y) / zoom;
             onComponentDrop(component, x - (COMPONENT_WIDTH/2), y - (COMPONENT_HEIGHT/2));
          } catch (err) {
              console.error("Drop failed", err);
          }
      }
  };
  
  const handlePinPointerDown = (e: React.PointerEvent, nodeId: string, pin: string, isRightSide: boolean) => {
      e.stopPropagation();
      e.preventDefault(); 
      if (!diagram) return;

      const pos = nodePositions.get(nodeId);
      if (!pos) return;

      const startNode = diagram.components.find(n => n.id === nodeId);
      const pinIndex = (startNode?.pins || []).indexOf(pin);
      const pinY = pos.y + 40 + (pinIndex * 15);
      const pinX = isRightSide ? pos.x + COMPONENT_WIDTH : pos.x;

      setTempWire({
          startNodeId: nodeId,
          startPin: pin,
          startX: pinX,
          startY: pinY
      });
  };

  const handlePinPointerUp = (e: React.PointerEvent, nodeId: string, pin: string) => {
      e.stopPropagation();
      if (!diagram) return;

      if (tempWire) {
          if (tempWire.startNodeId === nodeId && tempWire.startPin === pin) {
              setTempWire(null);
              return;
          }

          // Check if connection exists
          const exists = diagram.connections.some(c => 
             (c.fromComponentId === tempWire.startNodeId && c.fromPin === tempWire.startPin && c.toComponentId === nodeId && c.toPin === pin) ||
             (c.toComponentId === tempWire.startNodeId && c.toPin === tempWire.startPin && c.fromComponentId === nodeId && c.fromPin === pin)
          );

          if (!exists) {
            const newConnection: WireConnection = {
                fromComponentId: tempWire.startNodeId,
                fromPin: tempWire.startPin,
                toComponentId: nodeId,
                toPin: pin,
                description: 'New Wire',
                color: '#00f3ff'
            };
            onDiagramUpdate({
                ...diagram,
                connections: [...diagram.connections, newConnection]
            });
          }
          setTempWire(null);
      }
  };

  const getSmartPath = (x1: number, y1: number, x2: number, y2: number) => {
     const isReversed = x1 > x2; 
     const controlDist = Math.abs(x2 - x1) * 0.5;
     
     if (isReversed && Math.abs(x1 - x2) < 100) {
         const midY = (y1 + y2) / 2;
         return `M ${x1} ${y1} L ${x1+20} ${y1} L ${x1+20} ${midY} L ${x2-20} ${midY} L ${x2-20} ${y2} L ${x2} ${y2}`;
     }

     const cp1x = x1 + (isReversed ? -controlDist : controlDist);
     const cp2x = x2 + (isReversed ? controlDist : -controlDist);

     return `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
  };

  const filteredComponents = useMemo(() => {
     if (!diagram) return [];
     return diagram.components.filter(c => {
         const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
         const matchesType = filterType === 'all' || c.type === filterType;
         return matchesSearch && matchesType;
     });
  }, [diagram, searchQuery, filterType]);

  useEffect(() => {
    if (!searchQuery.trim() || !nodePositions.size) {
        setHoveredNodeId(null);
        return;
    }
    const foundNode = filteredComponents.find(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (foundNode) {
        setHoveredNodeId(foundNode.id);
        const pos = nodePositions.get(foundNode.id);
        if (pos && containerRef.current) {
             setPan({
                x: (containerRef.current.clientWidth / 2) - (pos.x + COMPONENT_WIDTH/2) * zoom,
                y: (containerRef.current.clientHeight / 2) - (pos.y + COMPONENT_HEIGHT/2) * zoom
            });
        }
    }
  }, [searchQuery, zoom]);

  const dropZoneOverlay = isDragOver && (
    <div className="absolute inset-0 bg-neon-cyan/10 border-4 border-dashed border-neon-cyan/50 z-50 flex items-center justify-center pointer-events-none">
         <div className="bg-black/80 p-4 rounded-xl border border-neon-cyan text-neon-cyan font-bold text-xl animate-pulse">
             DROP COMPONENT HERE
         </div>
    </div>
  );

  const isDiagramEmpty = Boolean(diagram && diagram.components.length === 0);
  const emptyDiagramOverlay = isDiagramEmpty && (
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-center text-slate-300 pointer-events-none">
      <div className="w-16 h-16 rounded-full border border-neon-cyan/40 flex items-center justify-center text-neon-cyan/80">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-100">Canvas is ready.</h3>
        <p className="text-[11px] text-slate-400 max-w-xs">
          Drag parts from the Asset Manager or ask chat to generate a wiring diagram.
        </p>
      </div>
      <div className="text-[11px] text-slate-400">
        Tip: Hold space to pan, scroll to zoom.
      </div>
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
        <h3 className="text-xl font-bold text-slate-100 mb-2">Awaiting Circuit Generation</h3>
        <p className="max-w-md text-center text-sm text-slate-400">
            Use chat to generate a wiring diagram, or <b>drag & drop</b> parts from the inventory.
        </p>
        <div className="text-[11px] text-slate-400 mt-3">
            Tip: You can search parts and filter by type once components are placed.
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
             className="h-11 w-11 inline-flex items-center justify-center bg-slate-800 text-white rounded-full shadow-lg border border-slate-600 hover:bg-slate-700 active:bg-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
             title="Zoom In"
             aria-label="Zoom in"
          >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          <button
             type="button"
             onClick={() => handleZoom(-0.2)}
             className="h-11 w-11 inline-flex items-center justify-center bg-slate-800 text-white rounded-full shadow-lg border border-slate-600 hover:bg-slate-700 active:bg-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
             title="Zoom Out"
             aria-label="Zoom out"
          >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </button>
          <button
             type="button"
             onClick={handleCenterView}
             className="h-11 w-11 inline-flex items-center justify-center bg-slate-800 text-white rounded-full shadow-lg border border-slate-600 hover:bg-slate-700 active:bg-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
             title="Reset View"
             aria-label="Reset view"
          >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          </button>
      </div>

      {/* Search / Filter Overlay */}
      <div className="absolute top-16 left-4 md:top-4 md:left-4 z-10 flex flex-col gap-2 max-w-[150px] md:max-w-[200px] pointer-events-auto">
          <input 
            type="text" 
            placeholder="Locate part..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-neon-cyan shadow-lg"
          />
      </div>

      <svg className="w-full h-full pointer-events-none">
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                </pattern>
                {uniqueColors.map(color => (
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
            <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" opacity="0.5" />

            {/* Render Wires */}
            {diagram.connections.map((conn, idx) => {
                const startPos = nodePositions.get(conn.fromComponentId);
                const endPos = nodePositions.get(conn.toComponentId);
                if (!startPos || !endPos) return null;

                const startComp = diagram.components.find(c => c.id === conn.fromComponentId);
                const endComp = diagram.components.find(c => c.id === conn.toComponentId);

                let startX = startPos.x;
                let startY = startPos.y;
                const startPinIdx = (startComp?.pins || []).indexOf(conn.fromPin);
                if (startPinIdx !== -1) {
                    const isLeft = endPos.x < startPos.x;
                    startX += isLeft ? 0 : COMPONENT_WIDTH;
                    startY += 40 + (startPinIdx * 15);
                } else {
                    startX += COMPONENT_WIDTH/2;
                    startY += COMPONENT_HEIGHT + 10;
                }

                let endX = endPos.x;
                let endY = endPos.y;
                const endPinIdx = (endComp?.pins || []).indexOf(conn.toPin);
                if (endPinIdx !== -1) {
                    const isLeft = endPos.x < startPos.x;
                    endX += isLeft ? COMPONENT_WIDTH : 0;
                    endY += 40 + (endPinIdx * 15);
                } else {
                     endX += COMPONENT_WIDTH/2;
                     endY += COMPONENT_HEIGHT + 10;
                }

                const pathD = getSmartPath(startX, startY, endX, endY);
                const wireHighlight = highlightedWires.get(idx);
                const isWireHighlighted = !!wireHighlight;
                const color = isWireHighlighted ? wireHighlight.color : (conn.color || '#00f3ff');
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                return (
                    <g key={idx} className="pointer-events-auto group" onClick={(e) => { e.stopPropagation(); setEditingWireIndex(idx); }}>
                        <path d={pathD} stroke="transparent" strokeWidth="20" fill="none" />
                        {/* Glow effect for highlighted wires */}
                        {isWireHighlighted && (
                          <path
                            d={pathD}
                            stroke={wireHighlight.color}
                            strokeWidth="8"
                            fill="none"
                            opacity="0.3"
                            className={wireHighlight.pulse ? 'animate-pulse' : ''}
                          />
                        )}
                        <path
                            d={pathD}
                            stroke={color}
                            strokeWidth={isWireHighlighted ? 4 : 2}
                            fill="none"
                            className={`transition-all duration-300 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)] group-hover:stroke-white ${isWireHighlighted && wireHighlight.pulse ? 'animate-pulse' : ''}`}
                            markerEnd={`url(#arrow-${(conn.color || '#00f3ff').replace('#', '')})`}
                        />
                        <text x={midX} y={midY - 5} textAnchor="middle" fill={color} fontSize="10" className="opacity-0 group-hover:opacity-100 bg-black">{conn.description}</text>
                    </g>
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

            {/* Render Components */}
            {filteredComponents.map((comp) => {
                const pos = nodePositions.get(comp.id);
                if (!pos) return null;
                const isHovered = hoveredNodeId === comp.id;
                const highlight = highlightedComponents.get(comp.id);
                const isHighlighted = !!highlight;

                return (
                    <g
                        key={comp.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        className={`pointer-events-auto cursor-grab active:cursor-grabbing ${isHighlighted && highlight.pulse ? 'component-highlighted' : ''}`}
                        style={isHighlighted ? { '--highlight-color': highlight.color } as React.CSSProperties : undefined}
                        onPointerDown={(e) => handlePointerDown(e, comp.id)}
                        onClick={(e) => { e.stopPropagation(); onComponentClick(comp); }}
                    >
                        {/* Glow effect for highlighted components */}
                        {isHighlighted && (
                          <rect
                            x="-4"
                            y="-4"
                            width={COMPONENT_WIDTH + 8}
                            height={COMPONENT_HEIGHT + 8}
                            rx="10"
                            fill="none"
                            stroke={highlight.color}
                            strokeWidth="3"
                            opacity="0.6"
                            className={highlight.pulse ? 'animate-pulse' : ''}
                          />
                        )}
                        <rect
                            width={COMPONENT_WIDTH}
                            height={COMPONENT_HEIGHT}
                            rx="6"
                            fill="#0f172a"
                            stroke={isHighlighted ? highlight.color : (isHovered ? '#00f3ff' : '#334155')}
                            strokeWidth={isHighlighted ? 3 : (isHovered ? 2 : 1)}
                            className="transition-colors shadow-lg"
                        />
                        <rect width={COMPONENT_WIDTH} height="24" rx="6" fill="#1e293b" />
                        <text x="10" y="16" fill="#e2e8f0" fontSize="12" fontWeight="bold" pointerEvents="none">{comp.name}</text>
                        <text x="10" y="90" fill="#64748b" fontSize="10" pointerEvents="none">{comp.type}</text>

                        {/* Pins */}
                        {comp.pins?.map((pin, i) => (
                            <g key={`l-${i}`}>
                                <circle 
                                    cx="0" 
                                    cy={40 + i*15} 
                                    r="6" 
                                    fill="transparent"
                                    stroke="none"
                                    onPointerDown={(e) => handlePinPointerDown(e, comp.id, pin, false)}
                                    onPointerUp={(e) => handlePinPointerUp(e, comp.id, pin)}
                                    className="cursor-crosshair"
                                />
                                <circle cx="0" cy={40 + i*15} r="3" fill="#475569" className="pointer-events-none" />
                                <text x="8" y={43 + i*15} fill="#94a3b8" fontSize="9" pointerEvents="none">{pin}</text>
                            </g>
                        ))}
                        {comp.pins?.map((pin, i) => (
                            <g key={`r-${i}`}>
                                <circle 
                                    cx={COMPONENT_WIDTH} 
                                    cy={40 + i*15} 
                                    r="6" 
                                    fill="transparent"
                                    stroke="none"
                                    onPointerDown={(e) => handlePinPointerDown(e, comp.id, pin, true)}
                                    onPointerUp={(e) => handlePinPointerUp(e, comp.id, pin)}
                                    className="cursor-crosshair"
                                />
                                <circle cx={COMPONENT_WIDTH} cy={40 + i*15} r="3" fill="#475569" className="pointer-events-none" />
                                <text x={COMPONENT_WIDTH - 8} y={43 + i*15} textAnchor="end" fill="#94a3b8" fontSize="9" pointerEvents="none">{pin}</text>
                            </g>
                        ))}
                    </g>
                );
            })}
        </g>
      </svg>
    </div>
  );
});

// Add display name for debugging
DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas;
