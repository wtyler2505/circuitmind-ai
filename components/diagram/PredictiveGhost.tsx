import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PredictiveAction } from '../../services/predictionEngine';
import { WiringDiagram, ElectronicComponent } from '../../types';
import { getComponentShape, calculatePinPositions } from './componentShapes';

interface PredictiveGhostProps {
  stagedActions: PredictiveAction[];
  diagram: WiringDiagram | null;
  positions: Map<string, { x: number; y: number }>;
  zoom: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

/**
 * PredictiveGhost renders translucent previews of AI-suggested connections and components.
 */
export const PredictiveGhost: React.FC<PredictiveGhostProps> = ({ stagedActions, diagram, positions, zoom, onAccept, onReject }) => {
  return (
    <g className="predictive-ghosts pointer-events-none">
      {stagedActions.map((prediction) => (
        <GhostAction 
          key={prediction.id} 
          prediction={prediction} 
          diagram={diagram}
          positions={positions}
          zoom={zoom}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </g>
  );
};

const GhostAction: React.FC<{
  prediction: PredictiveAction;
  diagram: WiringDiagram | null;
  positions: Map<string, { x: number; y: number }>;
  zoom: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ prediction, diagram, positions, zoom, onAccept, onReject }) => {
  const { action } = prediction;

  if (action.type === 'createConnection') {
    const { fromComponentId, fromPin, toComponentId, toPin } = action.payload as any;
    
    const startPos = positions.get(fromComponentId);
    const endPos = positions.get(toComponentId);

    if (!startPos || !endPos || !diagram) return null;

    const fromComp = diagram.components.find(c => c.id === fromComponentId);
    const toComp = diagram.components.find(c => c.id === toComponentId);
    
    if (!fromComp || !toComp) return null;

    const fromShape = getComponentShape(fromComp.type, fromComp.name);
    const toShape = getComponentShape(toComp.type, toComp.name);

    const fromPins = calculatePinPositions(fromShape, fromComp.pins || []);
    const toPins = calculatePinPositions(toShape, toComp.pins || []);

    const p1 = fromPins.find(p => p.name === fromPin) || { x: fromShape.width/2, y: fromShape.height/2 };
    const p2 = toPins.find(p => p.name === toPin) || { x: toShape.width/2, y: toShape.height/2 };

    const x1 = startPos.x + p1.x;
    const y1 = startPos.y + p1.y;
    const x2 = endPos.x + p2.x;
    const y2 = endPos.y + p2.y;

    return (
      <g opacity="0.5">
        <path
          d={`M ${x1} ${y1} C ${x1 + (x2-x1)/2} ${y1}, ${x1 + (x2-x1)/2} ${y2}, ${x2} ${y2}`}
          stroke="#00f3ff"
          strokeWidth="2"
          strokeDasharray="4,4"
          fill="none"
          className="animate-pulse"
        />
        {/* Connection Label & Accept Button */}
        <foreignObject x={(x1 + x2)/2 - 50} y={(y1 + y2)/2 - 20} width="100" height="45">
          <div className="flex flex-col items-center gap-1.5 p-1">
            <span className="bg-black/90 text-[7px] text-neon-cyan px-1.5 py-0.5 border border-neon-cyan/20 cut-corner-sm uppercase tracking-tighter whitespace-nowrap shadow-xl">
              {prediction.reasoning}
            </span>
            <div className="flex gap-1 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(prediction.id);
                }}
                className="bg-neon-cyan text-black text-[8px] font-bold px-2 py-0.5 cut-corner-xs transition-all hover:bg-white active:scale-95 shadow-[0_0_10px_rgba(0,243,255,0.3)]"
              >
                CONNECT
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(prediction.id);
                }}
                className="bg-slate-800 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 cut-corner-xs transition-all hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        </foreignObject>
      </g>
    );
  }

  return null;
};
