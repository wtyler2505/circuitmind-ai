import React, { useState, useCallback } from 'react';
import type { ExportFormat, PngResolution } from '../../../services/exportService';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, pngResolution: PngResolution) => void;
  isExporting: boolean;
  hasDiagram: boolean;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; desc: string }[] = [
  { value: 'svg', label: 'SVG', desc: 'Vector — scalable, editable' },
  { value: 'png', label: 'PNG', desc: 'Raster image for sharing' },
  { value: 'pdf', label: 'PDF', desc: 'Multi-page document with BOM' },
  { value: 'bom-csv', label: 'BOM (CSV)', desc: 'Spreadsheet-compatible parts list' },
  { value: 'bom-json', label: 'BOM (JSON)', desc: 'Machine-readable parts data' },
];

const RESOLUTION_OPTIONS: { value: PngResolution; label: string }[] = [
  { value: 1, label: '1x (standard)' },
  { value: 2, label: '2x (high DPI)' },
  { value: 4, label: '4x (print quality)' },
];

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  isExporting,
  hasDiagram,
}) => {
  const [format, setFormat] = useState<ExportFormat>('svg');
  const [pngResolution, setPngResolution] = useState<PngResolution>(2);

  const handleExport = useCallback(() => {
    onExport(format, pngResolution);
  }, [format, pngResolution, onExport]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && !isExporting && hasDiagram) handleExport();
    },
    [onClose, isExporting, hasDiagram, handleExport]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Export diagram"
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/60 bg-slate-900/80">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neon-cyan">
            Export Diagram
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close export dialog"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Format Selection */}
          <fieldset>
            <legend className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">
              Format
            </legend>
            <div className="space-y-1">
              {FORMAT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer border transition-colors ${
                    format === opt.value
                      ? 'border-neon-cyan/50 bg-neon-cyan/5 text-white'
                      : 'border-transparent hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="export-format"
                    value={opt.value}
                    checked={format === opt.value}
                    onChange={() => setFormat(opt.value)}
                    className="accent-cyan-400"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 ml-2">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* PNG Resolution (conditional) */}
          {format === 'png' && (
            <fieldset>
              <legend className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">
                Resolution
              </legend>
              <div className="flex gap-2">
                {RESOLUTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPngResolution(opt.value)}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                      pngResolution === opt.value
                        ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
                        : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {!hasDiagram && (
            <p className="text-xs text-amber-400">No diagram loaded. Create or load a diagram first.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-700/60 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-slate-700 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || !hasDiagram}
            className={`px-4 py-1.5 text-xs font-bold rounded border transition-all flex items-center gap-2 ${
              isExporting
                ? 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan/70 cursor-wait'
                : !hasDiagram
                  ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                  : 'border-neon-cyan bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 shadow-[0_0_8px_rgba(0,255,255,0.2)]'
            }`}
          >
            {isExporting && (
              <div className="w-3 h-3 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            )}
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ExportDialog);
