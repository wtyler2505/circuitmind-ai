import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { inventoryApi } from '../../services/inventoryApiClient';

interface ExportStats {
  totalItems: number;
  totalLots: number;
  totalLocations: number;
}

const ExportPanel: React.FC = () => {
  const [stats, setStats] = useState<ExportStats>({
    totalItems: 0,
    totalLots: 0,
    totalLocations: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [exportingJson, setExportingJson] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load stats on mount
  useEffect(() => {
    async function loadStats() {
      setLoadingStats(true);
      try {
        const [catalogResult, lotResult, locations] = await Promise.all([
          inventoryApi.listCatalog({ pageSize: 1 }),
          inventoryApi.listInventory({ pageSize: 1 }),
          inventoryApi.listLocations(),
        ]);

        // Count all locations recursively
        function countLocations(locs: typeof locations): number {
          return locs.reduce(
            (sum, loc) => sum + 1 + (loc.children ? countLocations(loc.children) : 0),
            0
          );
        }

        setStats({
          totalItems: catalogResult.total,
          totalLots: lotResult.total,
          totalLocations: countLocations(locations),
        });
      } catch {
        // Non-critical - stats are informational
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const handleExportJson = useCallback(async () => {
    setExportingJson(true);
    setError(null);
    try {
      const data = await inventoryApi.exportJson();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circuitmind-inventory-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON export failed');
    } finally {
      setExportingJson(false);
    }
  }, []);

  const handleExportCsv = useCallback(async () => {
    setExportingCsv(true);
    setError(null);
    try {
      const blob = await inventoryApi.exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circuitmind-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV export failed');
    } finally {
      setExportingCsv(false);
    }
  }, []);

  const handleMigrate = useCallback(async () => {
    setMigrating(true);
    setError(null);
    setMigrationResult(null);
    try {
      // Pull existing inventory from localStorage (legacy format)
      const legacyRaw = localStorage.getItem('cm_inventory');
      if (!legacyRaw) {
        setMigrationResult('No legacy inventory data found.');
        return;
      }
      const legacyItems = JSON.parse(legacyRaw);
      if (!Array.isArray(legacyItems) || legacyItems.length === 0) {
        setMigrationResult('No components to migrate.');
        return;
      }
      const result = await inventoryApi.migrate(legacyItems);
      setMigrationResult(`Successfully imported ${result.imported} component${result.imported !== 1 ? 's' : ''}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setMigrating(false);
    }
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-slate-100 mb-6">
        Export & Import
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Catalog Items', value: stats.totalItems, color: 'cyan' },
          { label: 'Inventory Lots', value: stats.totalLots, color: 'purple' },
          { label: 'Locations', value: stats.totalLocations, color: 'green' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-[#0a0a12]/80 border border-[#1a1a2e] rounded-xl p-4 text-center"
          >
            {loadingStats ? (
              <div className="h-8 w-12 mx-auto rounded bg-[#1a1a2e] animate-pulse mb-1" />
            ) : (
              <span
                className={`text-2xl font-bold font-mono ${
                  color === 'cyan'
                    ? 'text-cyan-400'
                    : color === 'purple'
                      ? 'text-purple-400'
                      : 'text-green-400'
                }`}
              >
                {value}
              </span>
            )}
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Export buttons */}
      <section aria-label="Export options" className="mb-8">
        <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-3">
          Export Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.button
            onClick={handleExportJson}
            disabled={exportingJson}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-3 p-4 bg-[#0a0a12] border border-[#1a1a2e] rounded-xl hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <span className="text-sm text-slate-100 font-medium block">
                {exportingJson ? 'Exporting...' : 'Export JSON'}
              </span>
              <span className="text-[10px] text-slate-500">
                Full inventory data with metadata
              </span>
            </div>
          </motion.button>

          <motion.button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-3 p-4 bg-[#0a0a12] border border-[#1a1a2e] rounded-xl hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <span className="text-sm text-slate-100 font-medium block">
                {exportingCsv ? 'Exporting...' : 'Export CSV'}
              </span>
              <span className="text-[10px] text-slate-500">
                Spreadsheet-compatible format
              </span>
            </div>
          </motion.button>
        </div>
      </section>

      {/* Migration */}
      <section aria-label="Import from legacy inventory" className="mb-6">
        <h3 className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-3">
          Import from Legacy Inventory
        </h3>
        <div className="bg-[#0a0a12]/80 border border-[#1a1a2e] rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-3">
            Migrate components from the existing inventory system to the new advanced management backend.
          </p>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            {migrating ? (
              <>
                <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import from Legacy
              </>
            )}
          </button>
          {migrationResult && (
            <p className="text-xs text-green-400 mt-2">{migrationResult}</p>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
