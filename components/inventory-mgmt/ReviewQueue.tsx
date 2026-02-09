import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  inventoryApi,
  type CatalogItem,
} from '../../services/inventoryApiClient';

function getConfidenceColor(confidence: number): string {
  if (confidence > 0.7) return 'bg-green-500';
  if (confidence >= 0.4) return 'bg-amber-500';
  return 'bg-red-500';
}

function getConfidenceLabel(confidence: number): string {
  if (confidence > 0.7) return 'High';
  if (confidence >= 0.4) return 'Medium';
  return 'Low';
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

const ReviewQueue: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadReviewItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await inventoryApi.listCatalog({
        needsReview: true,
        pageSize: 100,
      });
      setItems(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviewItems();
  }, [loadReviewItems]);

  const markProcessing = useCallback((id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
  }, []);

  const clearProcessing = useCallback((id: string) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleApprove = useCallback(
    async (item: CatalogItem) => {
      markProcessing(item.id);
      try {
        await inventoryApi.updateCatalog(item.id, { needsReview: false });
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      } catch {
        clearProcessing(item.id);
      }
    },
    [markProcessing, clearProcessing]
  );

  const handleReject = useCallback(
    async (item: CatalogItem) => {
      markProcessing(item.id);
      try {
        await inventoryApi.deleteCatalog(item.id);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      } catch {
        clearProcessing(item.id);
      }
    },
    [markProcessing, clearProcessing]
  );

  const handleApproveAll = useCallback(async () => {
    const highConfidence = items.filter((i) => i.aiConfidence > 0.7);
    if (highConfidence.length === 0) return;

    const ids = highConfidence.map((i) => i.id);
    ids.forEach(markProcessing);

    const results = await Promise.allSettled(
      highConfidence.map((item) =>
        inventoryApi.updateCatalog(item.id, { needsReview: false })
      )
    );

    const successIds = new Set<string>();
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successIds.add(ids[index]);
      }
    });

    setItems((prev) => prev.filter((i) => !successIds.has(i.id)));
    ids.forEach(clearProcessing);
  }, [items, markProcessing, clearProcessing]);

  const highConfidenceCount = items.filter((i) => i.aiConfidence > 0.7).length;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-[#1a1a2e] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-[#0a0a12] border border-[#1a1a2e] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" role="alert">
          {error}
          <button onClick={loadReviewItems} className="ml-2 underline hover:text-red-300">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <svg className="w-16 h-16 text-green-500/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-slate-300 text-sm font-medium">All caught up!</p>
        <p className="text-slate-600 text-xs mt-1">No items need review.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-slate-100">
            Review Queue
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-medium border border-amber-500/30">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {highConfidenceCount > 0 && (
          <button
            onClick={handleApproveAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 text-xs rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve All High Confidence ({highConfidenceCount})
          </button>
        )}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {items.map((item) => {
            const isProcessing = processingIds.has(item.id);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`bg-[#0a0a12]/80 border border-[#1a1a2e] rounded-xl overflow-hidden ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Image */}
                <div className="h-32 bg-[#0f0f1a] flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 space-y-2.5">
                  <div>
                    <h3 className="text-sm text-slate-100 font-medium truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${getTypeBadgeStyle(item.type)}`}>
                        {item.type}
                      </span>
                      {item.manufacturer && (
                        <span className="text-[10px] text-slate-500 truncate">{item.manufacturer}</span>
                      )}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[#1a1a2e] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getConfidenceColor(item.aiConfidence)}`}
                        style={{ width: `${item.aiConfidence * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                      {Math.round(item.aiConfidence * 100)}% {getConfidenceLabel(item.aiConfidence)}
                    </span>
                  </div>

                  {/* AI provider */}
                  <div className="text-[10px] text-slate-600">
                    Identified by {item.aiProvider || 'AI'}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600/15 hover:bg-green-600/25 text-green-400 border border-green-500/30 text-xs rounded-lg transition-colors"
                      aria-label={`Approve ${item.name}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs rounded-lg transition-colors"
                      aria-label={`Reject ${item.name}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewQueue;
