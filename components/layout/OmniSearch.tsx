import React, { useState, useEffect, useRef } from 'react';
import { searchIndexer, IndexedDocument } from '../../services/search/searchIndexer';
import { motion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface OmniSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (doc: IndexedDocument) => void;
}

export const OmniSearch: React.FC<OmniSearchProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IndexedDocument[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const trapRef = useFocusTrap<HTMLDivElement>({ enabled: isOpen, onClose, autoFocus: false });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchIndexer.search(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-cyber-black/80 backdrop-blur-md flex items-start justify-center pt-24 px-6" role="presentation">
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="omnisearch-title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl bg-cyber-black panel-surface border border-white/10 cut-corner-md shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden panel-frame"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-white/5 bg-white/5">
          <svg className="w-5 h-5 text-neon-cyan opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            id="omnisearch-title"
            aria-label="Search circuit components and wires"
            placeholder="SEARCH_CIRCUIT_INTEL... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && results.length > 0) onSelect(results[0]);
            }}
            className="flex-1 bg-transparent text-white text-lg font-mono focus:outline-none placeholder-slate-600 uppercase tracking-widest"
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-cyber-dark/20">
          {results.length === 0 && query && (
            <div className="p-12 text-center text-slate-600 uppercase tracking-[0.3em] text-[10px] font-bold animate-pulse">
              No Matches Found
            </div>
          )}
          
          <div className="p-2 space-y-1">
            {results.map((res) => (
              <button
                key={res.id}
                onClick={() => onSelect(res)}
                className="w-full text-left px-4 py-3 rounded-none hover:bg-neon-cyan/5 border border-transparent hover:border-neon-cyan/20 group flex items-center gap-4 transition-all"
              >
                <div className={`w-8 h-8 rounded-none border border-white/10 flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter shadow-inner transition-colors ${
                  res.category === 'component' ? 'text-neon-green bg-neon-green/5' : 'text-neon-cyan bg-neon-cyan/5'
                }`}>
                  {res.category.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors truncate uppercase tracking-wider">
                    {res.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate font-mono italic">{res.body}</p>
                </div>
                <div className="text-[8px] text-slate-600 font-mono uppercase group-hover:text-neon-cyan transition-colors tracking-[0.2em]">
                  {res.category}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-cyber-dark/40 border-t border-white/5 flex justify-between items-center panel-rail">
          <div className="flex gap-4 text-[8px] text-slate-500 uppercase tracking-[0.2em] font-bold">
            <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-300 font-mono">ENT</kbd> SELECT</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-300 font-mono">ESC</kbd> CLOSE</span>
          </div>
          <span className="text-[8px] text-neon-cyan font-mono uppercase tracking-widest opacity-50">CircuitMind_Search_Engine_v1.0</span>
        </div>
      </motion.div>
    </div>
  );
};
