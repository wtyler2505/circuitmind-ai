import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  inventoryApi,
  type CatalogItem,
  type PaginatedResponse,
} from '../../services/inventoryApiClient';

interface InventoryBrowserProps {
  onSelectItem: (item: CatalogItem) => void;
  selectedItemId?: string;
}

const COMPONENT_TYPES = [
  'microcontroller',
  'sensor',
  'actuator',
  'power',
  'resistor',
  'capacitor',
  'ic',
  'connector',
  'other',
];

const TYPE_BADGE_STYLES: Record<string, string> = {
  microcontroller: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
  sensor: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
  actuator: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  power: 'bg-green-500/10 text-green-400 border border-green-500/30',
  other: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
};

function getTypeBadgeStyle(type: string): string {
  return TYPE_BADGE_STYLES[type] || TYPE_BADGE_STYLES.other;
}

function getConfidenceColor(confidence: number): string {
  if (confidence > 0.7) return 'bg-green-500';
  if (confidence >= 0.4) return 'bg-amber-500';
  return 'bg-red-500';
}

const PAGE_SIZES = [10, 20, 50];

const InventoryBrowser: React.FC<InventoryBrowserProps> = ({
  onSelectItem,
  selectedItemId,
}) => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [needsReviewFilter, setNeedsReviewFilter] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (searchQuery.trim()) {
        const results = await inventoryApi.search(searchQuery.trim());
        let filtered = results;
        if (typeFilter) {
          filtered = filtered.filter((item) => item.type === typeFilter);
        }
        if (needsReviewFilter) {
          filtered = filtered.filter((item) => item.needsReview);
        }
        setItems(filtered);
        setTotal(filtered.length);
        setTotalPages(1);
        setPage(1);
      } else {
        const params: {
          page?: number;
          pageSize?: number;
          type?: string;
          needsReview?: boolean;
        } = { page, pageSize };
        if (typeFilter) params.type = typeFilter;
        if (needsReviewFilter) params.needsReview = true;
        const result: PaginatedResponse<CatalogItem> =
          await inventoryApi.listCatalog(params);
        setItems(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, typeFilter, needsReviewFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        setSearchQuery(value);
        setPage(1);
      }, 300);
    },
    []
  );

  const handleTypeFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setTypeFilter(e.target.value);
      setPage(1);
    },
    []
  );

  const handleNeedsReviewToggle = useCallback(() => {
    setNeedsReviewFilter((prev) => !prev);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPageSize(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, item: CatalogItem) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectItem(item);
      }
    },
    [onSelectItem]
  );

  // Skeleton loader rows
  const SkeletonRow = () => (
    <div className="flex items-center gap-3 px-3 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-[#1a1a2e]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-[#1a1a2e]" />
        <div className="h-2 w-20 rounded bg-[#1a1a2e]" />
      </div>
      <div className="h-3 w-16 rounded bg-[#1a1a2e]" />
      <div className="h-2 w-12 rounded bg-[#1a1a2e]" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filters */}
      <div className="flex flex-col gap-2 p-3 border-b border-[#1a1a2e]">
        {/* Search bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search components..."
            onChange={handleSearchChange}
            className="w-full bg-[#0a0a12] border border-[#1a1a2e] text-slate-100 rounded-lg pl-10 pr-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none placeholder:text-slate-600"
            aria-label="Search components"
          />
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={handleTypeFilterChange}
            className="bg-[#0a0a12] border border-[#1a1a2e] text-slate-300 rounded-lg px-2 py-1.5 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none"
            aria-label="Filter by component type"
          >
            <option value="">All Types</option>
            {COMPONENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={handleNeedsReviewToggle}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              needsReviewFilter
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-[#0a0a12] text-slate-500 border border-[#1a1a2e] hover:border-slate-600'
            }`}
            aria-label="Filter items needing review"
            aria-pressed={needsReviewFilter}
          >
            Needs Review
          </button>

          <span className="ml-auto text-xs text-slate-500">
            {total} item{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="mx-3 mt-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs"
          role="alert"
        >
          {error}
          <button
            onClick={loadItems}
            className="ml-2 underline hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Item list */}
      <div
        ref={listContainerRef}
        className="flex-1 overflow-y-auto min-h-0"
        role="listbox"
        aria-label="Inventory items"
      >
        {loading ? (
          <div className="space-y-1 p-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <svg
              className="w-12 h-12 text-slate-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-slate-500 text-sm">No components found.</p>
            <p className="text-slate-600 text-xs mt-1">
              Capture your first component!
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                onClick={() => onSelectItem(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                role="option"
                aria-selected={selectedItemId === item.id}
                tabIndex={0}
                className={`flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors ${
                  selectedItemId === item.id
                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                    : 'hover:bg-[#14142a] border border-transparent'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-[#0f0f1a] border border-[#1a1a2e] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <svg
                      className="w-5 h-5 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-100 truncate font-medium">
                      {item.name}
                    </span>
                    {item.needsReview && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
                        title="Needs review"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${getTypeBadgeStyle(item.type)}`}
                    >
                      {item.type}
                    </span>
                    {item.manufacturer && (
                      <span className="text-[10px] text-slate-500 truncate">
                        {item.manufacturer}
                      </span>
                    )}
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div
                    className="w-12 h-1.5 rounded-full bg-[#1a1a2e] overflow-hidden"
                    title={`AI confidence: ${Math.round(item.aiConfidence * 100)}%`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${getConfidenceColor(item.aiConfidence)}`}
                      style={{ width: `${item.aiConfidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-600 font-mono">
                    {Math.round(item.aiConfidence * 100)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 0 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#1a1a2e]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-xs text-slate-500 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="bg-[#0a0a12] border border-[#1a1a2e] text-slate-400 rounded px-1.5 py-1 text-xs focus:border-cyan-500 focus:outline-none"
            aria-label="Items per page"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default InventoryBrowser;
