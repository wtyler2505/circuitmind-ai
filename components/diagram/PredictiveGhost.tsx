import React from 'react';
import { PredictiveAction } from '../../services/predictionEngine';
import { WiringDiagram, WireConnection } from '../../types';
import { calculateWireEndpoints, calculateWireMidpoint } from './diagramUtils';

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
}> = ({ prediction, diagram, positions, zoom: _zoom, onAccept, onReject }) => {
  const { action } = prediction;

  if (action.type === 'createConnection') {
    const payload = action.payload as { fromComponentId: string; fromPin: string; toComponentId: string; toPin: string };
    const { fromComponentId, fromPin, toComponentId, toPin } = payload;
    
    const startPos = positions.get(fromComponentId);
    const endPos = positions.get(toComponentId);

    if (!startPos || !endPos || !diagram) return null;

    const fromComp = diagram.components.find(c => c.id === fromComponentId);
    const toComp = diagram.components.find(c => c.id === toComponentId);
    
    if (!fromComp || !toComp) return null;

    const ghostConnection: WireConnection = {
      fromComponentId,
      fromPin,
      toComponentId,
      toPin,
      description: 'Predicted connection',
      color: '#00f3ff',
    };

    const endpoints = calculateWireEndpoints(
      ghostConnection,
      fromComp,
      toComp,
      startPos,
      endPos
    );

    const x1 = endpoints.startX;
    const y1 = endpoints.startY;
    const x2 = endpoints.endX;
    const y2 = endpoints.endY;
    const labelPoint = calculateWireMidpoint(endpoints);

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
        <foreignObject x={labelPoint.x - 50} y={labelPoint.y - 20} width="100" height="45">
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
                aria-label="Dismiss wire suggestion"
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
