import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CatalogItem, IdentificationResult } from '../../services/inventoryApiClient';
import InventoryBrowser from './InventoryBrowser';
import InventoryDetail from './InventoryDetail';
import SyncStatusBar from './SyncStatusBar';

// Lazy load tab panels that aren't immediately visible
const ReviewQueue = lazy(() => import('./ReviewQueue'));
const LocationManager = lazy(() => import('./LocationManager'));
const ExportPanel = lazy(() => import('./ExportPanel'));

const CaptureWizard = lazy(() => import('./CaptureWizard'));

interface InventoryMgmtViewProps {
  onClose?: () => void;
}

type TabId = 'browse' | 'capture' | 'review' | 'locations' | 'export';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: 'browse',
    label: 'Browse',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    id: 'capture',
    label: 'Capture',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'review',
    label: 'Review',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'export',
    label: 'Export',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const TabFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const InventoryMgmtView: React.FC<InventoryMgmtViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('browse');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelectItem = useCallback((item: CatalogItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleCaptureComplete = useCallback((result: IdentificationResult) => {
    // After successful capture, switch to browse tab to see the new item
    setActiveTab('browse');
  }, []);

  const handleCaptureCancel = useCallback(() => {
    setActiveTab('browse');
  }, []);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    if (tabId !== 'browse') {
      setSelectedItem(null);
    }
  }, []);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, tabId: TabId) => {
      const tabIds = TABS.map((t) => t.id);
      const currentIndex = tabIds.indexOf(tabId);
      let newIndex = currentIndex;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabIds.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        newIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        newIndex = tabIds.length - 1;
      }

      if (newIndex !== currentIndex) {
        handleTabChange(tabIds[newIndex]);
        // Focus the new tab button
        const tabButton = document.getElementById(`inv-tab-${tabIds[newIndex]}`);
        tabButton?.focus();
      }
    },
    [handleTabChange]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-[#050508] flex flex-col"
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a2e] bg-[#0a0a12]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h1 className="text-sm font-bold tracking-[0.15em] uppercase text-slate-100">
            Inventory Management
          </h1>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-[#0a0a12] border border-[#1a1a2e] hover:border-slate-600 transition-colors"
            aria-label="Close inventory management"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
        )}
      </header>

      {/* Tab navigation */}
      <nav className="flex items-center gap-1 px-4 py-2 border-b border-[#1a1a2e] bg-[#0a0a12]/50" role="tablist" aria-label="Inventory sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`inv-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`inv-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                : 'text-slate-500 border border-transparent hover:text-slate-300 hover:bg-[#14142a]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 min-h-0 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              id="inv-panel-browse"
              role="tabpanel"
              aria-labelledby="inv-tab-browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 min-h-0"
            >
              {/* Left: Browser */}
              <div
                className={`${
                  selectedItem ? 'w-1/2 xl:w-2/5' : 'w-full'
                } border-r border-[#1a1a2e] transition-all duration-200`}
              >
                <InventoryBrowser
                  onSelectItem={handleSelectItem}
                  selectedItemId={selectedItem?.id}
                />
              </div>

              {/* Right: Detail */}
              <AnimatePresence>
                {selectedItem && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '50%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-0 overflow-hidden xl:w-3/5"
                  >
                    <InventoryDetail
                      item={selectedItem}
                      onClose={handleCloseDetail}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'capture' && (
            <motion.div
              key="capture"
              id="inv-panel-capture"
              role="tabpanel"
              aria-labelledby="inv-tab-capture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-h-0 overflow-y-auto"
            >
              <Suspense fallback={<TabFallback />}>
                <CaptureWizard onComplete={handleCaptureComplete} onCancel={handleCaptureCancel} />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div
              key="review"
              id="inv-panel-review"
              role="tabpanel"
              aria-labelledby="inv-tab-review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-h-0 overflow-y-auto"
            >
              <Suspense fallback={<TabFallback />}>
                <ReviewQueue />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'locations' && (
            <motion.div
              key="locations"
              id="inv-panel-locations"
              role="tabpanel"
              aria-labelledby="inv-tab-locations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-h-0 overflow-y-auto"
            >
              <Suspense fallback={<TabFallback />}>
                <LocationManager />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div
              key="export"
              id="inv-panel-export"
              role="tabpanel"
              aria-labelledby="inv-tab-export"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-h-0 overflow-y-auto"
            >
              <Suspense fallback={<TabFallback />}>
                <ExportPanel />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom: Sync status */}
      <SyncStatusBar />
    </motion.div>
  );
};

export default InventoryMgmtView;
