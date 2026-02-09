import React from 'react';
import type { DiagramAction } from '../diagramState';

interface WireLabelEditorProps {
  wireLabelInput: string;
  wireLabelPos: { x: number; y: number };
  zoom: number;
  pan: { x: number; y: number };
  dispatch: React.Dispatch<DiagramAction>;
  onSave: () => void;
}

const WireLabelEditor = React.memo(({
  wireLabelInput,
  wireLabelPos,
  zoom,
  pan,
  dispatch,
  onSave,
}: WireLabelEditorProps) => (
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
        onChange={(e) => dispatch({ type: 'UPDATE_WIRE_LABEL', payload: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') dispatch({ type: 'CANCEL_EDIT_WIRE' });
        }}
        placeholder="Wire description..."
        className="bg-slate-900 border border-slate-600 cut-corner-sm px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan w-48"
        autoFocus
      />
      <button
        type="button"
        onClick={onSave}
        className="px-2 py-1 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan text-[10px] uppercase tracking-[0.22em] cut-corner-sm hover:bg-neon-cyan/30"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'CANCEL_EDIT_WIRE' })}
        className="px-2 py-1 bg-slate-700 border border-slate-600 text-slate-300 text-[10px] uppercase tracking-[0.22em] cut-corner-sm hover:bg-slate-600"
      >
        x
      </button>
    </div>
  </div>
));

WireLabelEditor.displayName = 'WireLabelEditor';

export default WireLabelEditor;
