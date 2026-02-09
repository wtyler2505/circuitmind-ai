import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useReducer,
  lazy,
  Suspense,
} from 'react';
import { WiringDiagram, ElectronicComponent } from '../types';
import { COMPONENT_WIDTH, COMPONENT_HEIGHT } from './diagram';

const Diagram3DView = lazy(() => import('./diagram/Diagram3DView'));
import { diagramReducer, INITIAL_STATE } from './diagram/diagramState';
import { useUser } from '../contexts/UserContext';
import { useInventory } from '../contexts/InventoryContext';

// Extracted hooks
import { useCanvasHighlights } from '../hooks/useCanvasHighlights';
import { useCanvasExport } from '../hooks/useCanvasExport';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { useCanvasWiring } from '../hooks/useCanvasWiring';
import { useCanvasLayout } from '../hooks/useCanvasLayout';
import { useCanvasHUD } from '../hooks/useCanvasHUD';

// Extracted components
import CanvasToolbar from './diagram/canvas/CanvasToolbar';
import CanvasMinimap from './diagram/canvas/CanvasMinimap';
import WireLabelEditor from './diagram/canvas/WireLabelEditor';
import ExportDialog from './diagram/canvas/ExportDialog';
import { DropZoneOverlay, EmptyDiagramOverlay, NoDiagramPlaceholder } from './diagram/canvas/CanvasOverlays';
import Canvas2DContent from './diagram/canvas/Canvas2DContent';
import { exportService } from '../services/exportService';
import type { ExportFormat, PngResolution } from '../services/exportService';

type ViewMode = '2d' | '3d';

interface DiagramCanvasProps {
  diagram: WiringDiagram | null;
  selectedComponentId?: string | null;
  stagedActions?: import('../services/predictionEngine').PredictiveAction[];
  onStagedActionAccept?: (id: string) => void;
  onStagedActionReject?: (id: string) => void;
  onComponentSelect?: (componentId: string) => void;
  onComponentContextMenu?: (componentId: string, x: number, y: number) => void;
  onComponentDoubleClick?: (component: ElectronicComponent) => void;
  onBackgroundClick?: () => void;
  onDiagramUpdate: (diagram: WiringDiagram) => void;
  onComponentDrop?: (component: ElectronicComponent, x: number, y: number) => void;
  onGenerate3D?: (component: ElectronicComponent) => Promise<void>;
}

// Highlight options for AI control
export interface HighlightOptions {
  color?: string;
  duration?: number;
  pulse?: boolean;
}

// Ref API exposed to parent for AI control
export interface DiagramCanvasRef {
  setZoom: (level: number) => void;
  getZoom: () => number;
  setPan: (x: number, y: number) => void;
  getPan: () => { x: number; y: number };
  resetView: () => void;
  centerOnComponent: (componentId: string, zoom?: number) => void;
  highlightComponent: (componentId: string, options?: HighlightOptions) => void;
  clearHighlight: (componentId?: string) => void;
  highlightWire: (wireIndex: number, options?: HighlightOptions) => void;
  clearWireHighlight: (wireIndex?: number) => void;
  getComponentPosition: (componentId: string) => { x: number; y: number } | null;
  setComponentPosition: (componentId: string, x: number, y: number) => void;
  getAllComponentPositions: () => Map<string, { x: number; y: number }>;
  getSnapshotBlob: () => Promise<Blob | null>;
  getContainerRect: () => DOMRect | null;
}

const DiagramCanvasRenderer = ({
  diagram,
  selectedComponentId,
  stagedActions = [],
  onStagedActionAccept,
  onStagedActionReject,
  onComponentSelect,
  onComponentContextMenu,
  onComponentDoubleClick,
  onBackgroundClick,
  onDiagramUpdate,
  onComponentDrop,
  onGenerate3D,
}: DiagramCanvasProps, ref: React.ForwardedRef<DiagramCanvasRef>) => {
  const { user } = useUser();
  const { inventory } = useInventory();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const view3DRef = useRef<{ getSnapshotBlob: () => Promise<Blob | null> }>(null);

  const [state, dispatch] = useReducer(diagramReducer, INITIAL_STATE);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const highlights = useCanvasHighlights();
  const exportUtils = useCanvasExport(svgRef, diagram);
  const hudHandlers = useCanvasHUD(containerRef);
  const layout = useCanvasLayout({ state, dispatch, diagram, containerRef, searchQuery, filterType });
  const interaction = useCanvasInteraction({
    state, dispatch, diagram, selectedComponentId, snapToGrid,
    containerRectRef: layout.containerRectRef,
    onComponentDrop, onDiagramUpdate, onBackgroundClick,
  });
  const wiring = useCanvasWiring({ state, dispatch, diagram, onDiagramUpdate });

  const handleNudge = useCallback((componentId: string, dx: number, dy: number) => {
    const pos = state.nodePositions.get(componentId);
    if (pos) {
      dispatch({ type: 'UPDATE_NODE_POSITION', payload: { nodeId: componentId, x: pos.x + dx, y: pos.y + dy } });
    }
  }, [state.nodePositions]);

  const handleExport = useCallback(async (format: ExportFormat, pngResolution: PngResolution) => {
    if (!diagram || !svgRef.current) return;
    setIsExporting(true);
    try {
      let result;
      switch (format) {
        case 'svg':
          result = await exportService.exportSVG(svgRef.current, diagram);
          break;
        case 'png':
          result = await exportService.exportPNG(svgRef.current, diagram, pngResolution);
          break;
        case 'pdf':
          result = await exportService.exportPDF(svgRef.current, diagram, inventory);
          break;
        case 'bom-csv':
          result = exportService.exportBOMCSV(diagram, inventory);
          break;
        case 'bom-json':
          result = exportService.exportBOMJSON(diagram, inventory);
          break;
      }
      if (result) exportService.triggerDownload(result.blob, result.filename);
      setShowExportDialog(false);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [diagram, inventory]);

  useImperativeHandle(ref, () => ({
    setZoom: (level: number) => dispatch({ type: 'SET_ZOOM', payload: level }),
    getZoom: () => state.zoom,
    setPan: (x: number, y: number) => dispatch({ type: 'SET_PAN', payload: { x, y } }),
    getPan: () => state.pan,
    resetView: () => dispatch({ type: 'RESET_VIEW' }),
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
    highlightComponent: highlights.highlightComponent,
    clearHighlight: highlights.clearHighlight,
    highlightWire: highlights.highlightWire,
    clearWireHighlight: highlights.clearWireHighlight,
    getComponentPosition: (componentId: string) => state.nodePositions.get(componentId) || null,
    setComponentPosition: (componentId: string, x: number, y: number) => {
      dispatch({ type: 'UPDATE_NODE_POSITION', payload: { nodeId: componentId, x, y } });
    },
    getAllComponentPositions: () => new Map(state.nodePositions),
    getSnapshotBlob: async () => {
      if (viewMode === '3d' && view3DRef.current) return view3DRef.current.getSnapshotBlob();
      return exportUtils.getSnapshotBlob();
    },
    getContainerRect: () => containerRef.current?.getBoundingClientRect() || null,
  }), [state.zoom, state.pan, state.nodePositions, highlights, diagram, viewMode, exportUtils]);

  if (!diagram) {
    return (
      <NoDiagramPlaceholder
        ref={containerRef}
        onDragOver={interaction.handleDragOver}
        onDragLeave={interaction.handleDragLeave}
        onDrop={interaction.handleDrop}
        isDragOver={state.isDragOver}
      />
    );
  }

  const isDiagramEmpty = diagram.components.length === 0;

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-slate-950 overflow-hidden relative cursor-crosshair touch-none"
      onPointerDown={interaction.handlePointerDown}
      onPointerMove={interaction.handlePointerMove}
      onPointerUp={interaction.handlePointerUp}
      onPointerLeave={interaction.handlePointerUp}
      onWheel={interaction.handleWheel}
      onDragOver={interaction.handleDragOver}
      onDragLeave={interaction.handleDragLeave}
      onDrop={interaction.handleDrop}
      style={{ touchAction: 'none' }}
    >
      {state.isDragOver && <DropZoneOverlay />}
      {isDiagramEmpty && <EmptyDiagramOverlay />}

      <CanvasToolbar
        dispatch={dispatch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        snapToGrid={snapToGrid}
        onSnapToggle={() => setSnapToGrid(!snapToGrid)}
        viewMode={viewMode}
        onViewModeToggle={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
        onOpenExport={() => setShowExportDialog(true)}
        zoom={state.zoom}
      />

      {viewMode === '3d' ? (
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-cyber-dark text-neon-cyan">Loading 3D view...</div>}>
          <div className="w-full h-full">
            <Diagram3DView
              ref={view3DRef}
              diagram={diagram}
              positions={state.nodePositions}
              onComponentClick={(component) => onComponentSelect?.(component.id)}
              onGenerate3D={onGenerate3D}
            />
          </div>
        </Suspense>
      ) : (
        <Canvas2DContent
          svgRef={svgRef}
          state={state}
          diagram={diagram}
          selectedComponentId={selectedComponentId}
          snapToGrid={snapToGrid}
          uniqueColors={layout.uniqueColors}
          renderConnections={layout.renderConnections}
          renderComponents={layout.renderComponents}
          highlightedComponents={highlights.highlightedComponents}
          highlightedWires={highlights.highlightedWires}
          stagedActions={stagedActions}
          wiringColors={user?.preferences.wiringColors}
          onStagedActionAccept={onStagedActionAccept}
          onStagedActionReject={onStagedActionReject}
          onComponentSelect={onComponentSelect}
          onComponentContextMenu={onComponentContextMenu}
          onComponentDoubleClick={onComponentDoubleClick}
          onPointerDown={interaction.handlePointerDown}
          onPinPointerDown={wiring.handlePinPointerDown}
          onPinPointerUp={wiring.handlePinPointerUp}
          onComponentEnter={hudHandlers.handleComponentEnter}
          onComponentLeave={hudHandlers.handleComponentLeave}
          onPinEnter={hudHandlers.handlePinEnter}
          onPinLeave={hudHandlers.handlePinLeave}
          onNudge={handleNudge}
          onWireEditClick={wiring.handleWireEditClick}
          onWireDelete={wiring.handleWireDelete}
        />
      )}

      {state.editingWireIndex !== null && (
        <WireLabelEditor
          wireLabelInput={state.wireLabelInput}
          wireLabelPos={state.wireLabelPos}
          zoom={state.zoom}
          pan={state.pan}
          dispatch={dispatch}
          onSave={wiring.handleWireLabelSave}
        />
      )}

      <CanvasMinimap
        filteredComponents={layout.filteredComponents}
        nodePositions={state.nodePositions}
        diagramBounds={layout.diagramBounds}
        pan={state.pan}
        zoom={state.zoom}
        containerRect={layout.containerRectRef.current}
        showMinimap={showMinimap}
        onMinimapClick={layout.handleMinimapClick}
        onToggleMinimap={setShowMinimap}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        isExporting={isExporting}
        hasDiagram={!isDiagramEmpty}
      />
    </div>
  );
};

const DiagramCanvas = React.memo(forwardRef(DiagramCanvasRenderer));

DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas;
