import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  inventoryApi,
  type CatalogItem,
  type InventoryLot,
  type StockMove,
} from '../../services/inventoryApiClient';
import StockAdjuster from './StockAdjuster';

interface InventoryDetailProps {
  item: CatalogItem;
  onClose: () => void;
}

function getTypeBadgeStyle(type: string): string {
  const styles: Record<string, string> = {
    microcontroller: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    sensor: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    actuator: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    power: 'bg-green-500/10 text-green-400 border border-green-500/30',
  };
  return styles[type] || 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
}

function getConfidenceColor(confidence: number): string {
  if (confidence > 0.7) return 'text-green-400';
  if (confidence >= 0.4) return 'text-amber-400';
  return 'text-red-400';
}

function getConfidenceBarColor(confidence: number): string {
  if (confidence > 0.7) return 'bg-green-500';
  if (confidence >= 0.4) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

const InventoryDetail: React.FC<InventoryDetailProps> = ({ item, onClose }) => {
  const [lot, setLot] = useState<InventoryLot | null>(null);
  const [stockMoves, setStockMoves] = useState<StockMove[]>([]);
  const [loadingLot, setLoadingLot] = useState(true);
  const [loadingMoves, setLoadingMoves] = useState(false);
  const [showStockAdjuster, setShowStockAdjuster] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadLotData = useCallback(async () => {
    setLoadingLot(true);
    try {
      const result = await inventoryApi.listInventory({ catalogId: item.id, pageSize: 1 });
      if (result.data.length > 0) {
        setLot(result.data[0]);
      } else {
        setLot(null);
      }
    } catch {
      setLot(null);
    } finally {
      setLoadingLot(false);
    }
  }, [item.id]);

  const loadStockMoves = useCallback(async () => {
    if (!lot) return;
    setLoadingMoves(true);
    try {
      const moves = await inventoryApi.listStockMoves(lot.id);
      setStockMoves(moves);
    } catch {
      setStockMoves([]);
    } finally {
      setLoadingMoves(false);
    }
  }, [lot]);

  useEffect(() => {
    loadLotData();
  }, [loadLotData]);

  useEffect(() => {
    if (lot) {
      loadStockMoves();
    }
  }, [lot, loadStockMoves]);

  const handleDelete = useCallback(async () => {
    try {
      await inventoryApi.deleteCatalog(item.id);
      onClose();
    } catch {
      // Error handling left to parent
    }
  }, [item.id, onClose]);

  const handleStockAdjusted = useCallback(() => {
    setShowStockAdjuster(false);
    loadLotData();
  }, [loadLotData]);

  const specsEntries = Object.entries(item.specs || {});

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col h-full overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[#1a1a2e]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-slate-100 truncate">
                {item.name}
              </h2>
              {item.needsReview && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Review
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${getTypeBadgeStyle(item.type)}`}>
                {item.type}
              </span>
              <span className={`text-xs font-mono ${getConfidenceColor(item.aiConfidence)}`}>
                {Math.round(item.aiConfidence * 100)}% confidence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#14142a] transition-colors"
            aria-label="Close detail view"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Image */}
          {item.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-[#1a1a2e] bg-[#0a0a12]">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-contain"
              />
            </div>
          )}

          {/* Details Grid */}
          <section aria-label="Component details">
            <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
              Details
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {item.manufacturer && (
                <>
                  <span className="text-xs text-slate-500">Manufacturer</span>
                  <span className="text-xs text-slate-200 font-mono">{item.manufacturer}</span>
                </>
              )}
              {item.mpn && (
                <>
                  <span className="text-xs text-slate-500">MPN</span>
                  <span className="text-xs text-slate-200 font-mono">{item.mpn}</span>
                </>
              )}
              {item.packageType && (
                <>
                  <span className="text-xs text-slate-500">Package</span>
                  <span className="text-xs text-slate-200 font-mono">{item.packageType}</span>
                </>
              )}
              {item.datasheetUrl && (
                <>
                  <span className="text-xs text-slate-500">Datasheet</span>
                  <a
                    href={item.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 truncate"
                  >
                    View PDF
                  </a>
                </>
              )}
            </div>
          </section>

          {/* Pins */}
          {item.pins && item.pins.length > 0 && (
            <section aria-label="Pin configuration">
              <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
                Pins ({item.pins.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {item.pins.map((pin, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#0f0f1a] border border-[#1a1a2e] text-[10px] text-slate-300 font-mono"
                  >
                    {pin}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Specs */}
          {specsEntries.length > 0 && (
            <section aria-label="Specifications">
              <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
                Specifications
              </h3>
              <div className="bg-[#0a0a12] border border-[#1a1a2e] rounded-lg overflow-hidden">
                {specsEntries.map(([key, value], i) => (
                  <div
                    key={key}
                    className={`flex justify-between px-3 py-1.5 ${i !== specsEntries.length - 1 ? 'border-b border-[#1a1a2e]/50' : ''}`}
                  >
                    <span className="text-[11px] text-slate-500">{key}</span>
                    <span className="text-[11px] text-slate-200 font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stock */}
          <section aria-label="Stock information">
            <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
              Stock
            </h3>
            {loadingLot ? (
              <div className="h-16 rounded-lg bg-[#0a0a12] animate-pulse" />
            ) : lot ? (
              <div className="bg-[#0a0a12] border border-[#1a1a2e] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-100 font-mono">
                      {lot.quantity}
                    </span>
                    <span className="text-xs text-slate-500">in stock</span>
                  </div>
                  <button
                    onClick={() => setShowStockAdjuster(true)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-lg transition-colors"
                  >
                    Adjust
                  </button>
                </div>
                {lot.quantity <= lot.lowStockThreshold && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-[10px]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Low stock (threshold: {lot.lowStockThreshold})
                  </div>
                )}
                {lot.location && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {lot.location.path || lot.location.name}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#0a0a12] border border-[#1a1a2e] rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">No inventory lot linked</p>
              </div>
            )}
          </section>

          {/* Stock History */}
          {stockMoves.length > 0 && (
            <section aria-label="Stock history">
              <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
                Recent Activity
              </h3>
              <div className="space-y-1.5">
                {loadingMoves ? (
                  <div className="h-20 rounded-lg bg-[#0a0a12] animate-pulse" />
                ) : (
                  stockMoves.slice(0, 10).map((move) => (
                    <div
                      key={move.id}
                      className="flex items-center gap-3 px-3 py-2 bg-[#0a0a12] border border-[#1a1a2e]/50 rounded-lg"
                    >
                      <span
                        className={`text-sm font-mono font-bold ${move.delta > 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {move.delta > 0 ? '+' : ''}{move.delta}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-slate-300">{move.reason}</span>
                        {move.note && (
                          <span className="text-[10px] text-slate-500 ml-1.5">
                            - {move.note}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-600 flex-shrink-0">
                        {formatRelativeTime(move.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* AI Info */}
          <section aria-label="AI identification info">
            <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
              AI Identification
            </h3>
            <div className="bg-[#0a0a12] border border-[#1a1a2e] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Provider</span>
                <span className="text-xs text-slate-200 font-mono">{item.aiProvider || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-[#1a1a2e] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getConfidenceBarColor(item.aiConfidence)}`}
                      style={{ width: `${item.aiConfidence * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono ${getConfidenceColor(item.aiConfidence)}`}>
                    {Math.round(item.aiConfidence * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Identified</span>
                <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section aria-label="Item actions" className="pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 bg-[#0a0a12] border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>

            {/* Delete confirmation */}
            <AnimatePresence>
              {confirmDelete && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <p className="text-xs text-red-400 mb-2">
                    Permanently delete {item.name}?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 bg-[#0a0a12] border border-[#1a1a2e] text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </motion.div>

      {/* Stock Adjuster Modal */}
      <AnimatePresence>
        {showStockAdjuster && lot && (
          <StockAdjuster
            lot={lot}
            onClose={() => setShowStockAdjuster(false)}
            onAdjusted={handleStockAdjusted}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default InventoryDetail;
