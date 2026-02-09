import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  inventoryApi,
  type InventoryLot,
} from '../../services/inventoryApiClient';

interface StockAdjusterProps {
  lot: InventoryLot;
  onClose: () => void;
  onAdjusted: () => void;
}

const REASONS = [
  'Received',
  'Used in project',
  'Damaged',
  'Correction',
  'Returned',
  'Lost',
  'Other',
];

const QUICK_ADJUSTMENTS = [-10, -5, -1, 1, 5, 10];

const StockAdjuster: React.FC<StockAdjusterProps> = ({ lot, onClose, onAdjusted }) => {
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState('Received');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Focus trap: focus first element on mount
  useEffect(() => {
    firstFocusRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleQuickAdjust = useCallback((amount: number) => {
    setDelta((prev) => prev + amount);
  }, []);

  const handleCustomInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      setDelta(isNaN(val) ? 0 : val);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (delta === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await inventoryApi.createStockMove({
        lotId: lot.id,
        delta,
        reason,
        note: note.trim() || undefined,
      });
      onAdjusted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record adjustment');
    } finally {
      setSubmitting(false);
    }
  }, [lot.id, delta, reason, note, onAdjusted]);

  const newQuantity = lot.quantity + delta;
  const isValid = delta !== 0 && newQuantity >= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Adjust stock quantity"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.1)] w-full max-w-sm mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a2e]">
          <h3 className="text-sm font-semibold text-slate-100">Adjust Stock</h3>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-[#14142a] transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Current + New quantity display */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 block mb-1">
                Current
              </span>
              <span className="text-3xl font-bold text-slate-400 font-mono">
                {lot.quantity}
              </span>
            </div>
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="text-center">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 block mb-1">
                New
              </span>
              <span
                className={`text-3xl font-bold font-mono ${
                  newQuantity < 0
                    ? 'text-red-400'
                    : delta > 0
                      ? 'text-green-400'
                      : delta < 0
                        ? 'text-amber-400'
                        : 'text-slate-100'
                }`}
              >
                {newQuantity}
              </span>
            </div>
          </div>

          {/* Quick adjust buttons */}
          <div>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 block mb-2">
              Quick Adjust
            </span>
            <div className="flex items-center gap-1.5 justify-center">
              {QUICK_ADJUSTMENTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAdjust(amount)}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-medium border transition-colors ${
                    amount < 0
                      ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                      : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                  }`}
                  aria-label={`Adjust by ${amount > 0 ? '+' : ''}${amount}`}
                >
                  {amount > 0 ? '+' : ''}{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <label
              htmlFor="stock-custom-amount"
              className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 block mb-1.5"
            >
              Custom Amount
            </label>
            <input
              id="stock-custom-amount"
              type="number"
              value={delta}
              onChange={handleCustomInput}
              className="w-full bg-[#0a0a12] border border-[#1a1a2e] text-slate-100 rounded-lg px-3 py-2 text-sm font-mono text-center focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="stock-reason"
              className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 block mb-1.5"
            >
              Reason
            </label>
            <select
              id="stock-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#0a0a12] border border-[#1a1a2e] text-slate-300 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="stock-note"
              className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 block mb-1.5"
            >
              Note (optional)
            </label>
            <input
              id="stock-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Additional details..."
              className="w-full bg-[#0a0a12] border border-[#1a1a2e] text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs" role="alert">
              {error}
            </div>
          )}

          {/* Invalid quantity warning */}
          {newQuantity < 0 && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs" role="alert">
              Quantity cannot be negative
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#1a1a2e]">
          <button
            onClick={() => setDelta(0)}
            className="px-3 py-2 bg-[#0a0a12] border border-[#1a1a2e] text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs rounded-lg transition-colors font-medium"
          >
            {submitting ? 'Recording...' : 'Record Adjustment'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StockAdjuster;
