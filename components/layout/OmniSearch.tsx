import React, { useState, useEffect, useRef } from 'react';
import { searchIndexer, IndexedDocument } from '../../services/search/searchIndexer';
import { motion, AnimatePresence } from 'framer-motion';

interface OmniSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (doc: IndexedDocument) => void;
}

export const OmniSearch: React.FC<OmniSearchProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setErrors] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchIndexer.search(query);
      setErrors(searchResults);
    } else {
      setErrors([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 px-6">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl bg-slate-900 border border-neon-cyan/30 cut-corner-md shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-white/5">
          <svg className="w-5 h-5 text-slate-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search components, diagrams, actions... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && results.length > 0) onSelect(results[0]);
            }}
            className="flex-1 bg-transparent text-white text-lg font-mono focus:outline-none placeholder-slate-600"
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {results.length === 0 && query && (
            <div className="p-8 text-center text-slate-500 uppercase tracking-widest text-[10px]">
              No matches found
            </div>
          )}
          
          <div className="p-2 space-y-1">
            {results.map((res) => (
              <button
                key={res.id}
                onClick={() => onSelect(res)}
                className="w-full text-left px-4 py-3 rounded-sm hover:bg-neon-cyan/10 group flex items-center gap-4 transition-all"
              >
                <div className={`w-8 h-8 rounded-sm border border-white/5 flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter ${
                  res.category === 'component' ? 'text-neon-green' : 'text-neon-cyan'
                }`}>
                  {res.category.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                    {res.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">{res.body}</p>
                </div>
                <div className="text-[8px] text-slate-600 font-mono uppercase group-hover:text-slate-400">
                  {res.category}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex justify-between items-center">
          <div className="flex gap-4 text-[8px] text-slate-500 uppercase tracking-widest font-bold">
            <span><kbd className="bg-slate-800 px-1 rounded text-slate-300">Enter</kbd> Select</span>
            <span><kbd className="bg-slate-800 px-1 rounded text-slate-300">Esc</kbd> Close</span>
          </div>
          <span className="text-[8px] text-neon-cyan font-mono uppercase">CircuitMind_Search_Engine_v1.0</span>
        </div>
      </motion.div>
    </div>
  );
};
