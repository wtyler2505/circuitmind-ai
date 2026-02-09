import React, { useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { WiringDiagram, ElectronicComponent } from '../../types';
import { useTelemetry } from '../../contexts/TelemetryContext';
import { useLayout } from '../../contexts/LayoutContext';
import IconButton from '../IconButton';
import { useDiagram3DScene } from '../../hooks/useDiagram3DScene';
import { useDiagram3DSync } from '../../hooks/useDiagram3DSync';
import { useDiagram3DTelemetry } from '../../hooks/useDiagram3DTelemetry';

interface Diagram3DViewProps {
  diagram: WiringDiagram | null;
  positions: Map<string, { x: number; y: number }>;
  onComponentClick?: (component: ElectronicComponent) => void;
  onGenerate3D?: (component: ElectronicComponent) => Promise<void>;
}

const Diagram3DViewComponent = React.forwardRef<{ getSnapshotBlob: () => Promise<Blob | null> }, Diagram3DViewProps>(
  ({ diagram, positions, onComponentClick: _onComponentClick, onGenerate3D }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { liveData } = useTelemetry();
  const { neuralLinkEnabled, setNeuralLinkEnabled } = useLayout();

  // Scene initialization
  const sceneRefs = useDiagram3DScene(containerRef);

  // Diagram sync (components + wires)
  const missingModels = useDiagram3DSync(diagram, positions, sceneRefs);

  // Telemetry sprites
  useDiagram3DTelemetry(liveData, diagram, positions, sceneRefs);

  // Expose snapshot capability to parent
  React.useImperativeHandle(ref, () => ({
    getSnapshotBlob: async () => {
      if (!sceneRefs.rendererRef.current || !sceneRefs.sceneRef.current || !sceneRefs.cameraRef.current) return null;

      const renderer = sceneRefs.rendererRef.current;
      const scene = sceneRefs.sceneRef.current;
      const camera = sceneRefs.cameraRef.current;
      const composer = sceneRefs.composerRef.current;

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      return new Promise((resolve) => {
        renderer.domElement.toBlob((blob) => resolve(blob), 'image/png', 0.8);
      });
    }
  }));

  const handleGenerateClick = async (component: ElectronicComponent) => {
    if (onGenerate3D) {
      await onGenerate3D(component);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      {/* Neural Link Toggle */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <IconButton
          label={neuralLinkEnabled ? "DISABLE NEURAL-LINK" : "ENABLE NEURAL-LINK"}
          icon={
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              {neuralLinkEnabled && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-cyan rounded-full animate-ping" />
              )}
            </div>
          }
          variant={neuralLinkEnabled ? "primary" : "secondary"}
          onClick={() => setNeuralLinkEnabled(!neuralLinkEnabled)}
          className={neuralLinkEnabled ? "shadow-[0_0_15px_rgba(0,243,255,0.4)]" : ""}
        />
      </div>

      {/* Missing Models Overlay */}
      {missingModels.length > 0 && onGenerate3D && (
        <div className="absolute top-4 right-4 z-10 bg-slate-950/90 border border-neon-purple/50 rounded-lg p-3 max-w-sm shadow-xl backdrop-blur-sm animate-fade-in">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <h4 className="text-xs font-bold text-neon-purple font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"/>
              Missing 3D Models
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">{missingModels.length} ITEMS</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {missingModels.map(comp => (
              <div key={comp.id} className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-slate-300 truncate max-w-[120px]" title={comp.name}>{comp.name}</span>
                <button
                  onClick={() => handleGenerateClick(comp)}
                  className="px-2 py-1 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple hover:text-black transition-colors rounded uppercase font-bold tracking-wider shrink-0"
                >
                  Generate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const Diagram3DView = memo(Diagram3DViewComponent);

export default Diagram3DView;
