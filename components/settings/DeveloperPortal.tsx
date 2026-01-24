import React, { useState, useEffect } from 'react';
import { tokenService, APIToken } from '../../services/api/tokenService';

export const DeveloperPortal: React.FC = () => {
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [newTokenName, setNewTokenName] = useState('');
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  useEffect(() => {
    setTokens(tokenService.getTokens());
  }, []);

  const handleGenerate = () => {
    if (newTokenName) {
      const t = tokenService.generateToken(newTokenName, 'engineer');
      setTokens(tokenService.getTokens());
      setLastGenerated(t.secret);
      setNewTokenName('');
    }
  };

  const handleRevoke = (id: string) => {
    tokenService.revokeToken(id);
    setTokens(tokenService.getTokens());
  };

  return (
    <div className="space-y-8 p-4 bg-[#020203] h-full overflow-y-auto custom-scrollbar">
      {/* Token Generation */}
      <div className="bg-slate-900/80 border border-white/5 p-4 cut-corner-md space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em] flex items-center gap-2">
          <svg className="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          API_AUTH_TOKEN_GENERATOR
        </h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
          Tokens allow external scripts to interact with your workspace. 
          Keep them secure.
        </p>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Token Label (e.g. VSCode Extension)..." 
            value={newTokenName}
            onChange={e => setNewTokenName(e.target.value)}
            className="flex-1 bg-black border border-slate-700 cut-corner-sm px-3 py-2 text-[11px] text-white focus:border-neon-cyan focus:outline-none"
          />
          <button 
            onClick={handleGenerate}
            className="bg-neon-cyan text-black font-bold px-4 py-2 cut-corner-sm text-[10px] tracking-[0.2em] hover:bg-white"
          >
            GENERATE
          </button>
        </div>

        {lastGenerated && (
          <div className="p-3 bg-neon-amber/10 border border-neon-amber/30 rounded-sm">
            <p className="text-[9px] text-neon-amber font-bold uppercase mb-1">New Secret (SHOWN ONLY ONCE):</p>
            <code className="text-xs text-white break-all">{lastGenerated}</code>
            <button 
              onClick={() => setLastGenerated(null)}
              className="mt-2 text-[9px] text-slate-400 hover:text-white underline block uppercase tracking-widest"
            >
              I have saved this secret
            </button>
          </div>
        )}
      </div>

      {/* Active Tokens */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">Active Integrations</h3>
        {tokens.length === 0 ? (
          <p className="py-4 text-center text-[10px] text-slate-600 uppercase tracking-widest italic">No Active Tokens</p>
        ) : (
          <div className="space-y-2">
            {tokens.map(t => (
              <div key={t.id} className="bg-white/5 border border-white/10 p-3 cut-corner-sm flex justify-between items-center group">
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-200 uppercase">{t.name}</h4>
                  <p className="text-[9px] text-slate-500 font-mono">ROLE: {t.role} • CREATED: {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => handleRevoke(t.id)}
                  className="px-2 py-1 bg-red-950/20 border border-red-500/30 text-red-400 text-[8px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all cut-corner-sm"
                >
                  REVOKE
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Endpoint Reference */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">Local Endpoints</h3>
        <div className="space-y-2 font-mono text-[9px]">
          <div className="p-2 bg-black/40 border border-white/5 rounded-sm">
            <span className="text-neon-green mr-2">GET</span>
            <span className="text-slate-300">/v1/inventory</span>
          </div>
          <div className="p-2 bg-black/40 border border-white/5 rounded-sm">
            <span className="text-neon-green mr-2">GET</span>
            <span className="text-slate-300">/v1/projects</span>
          </div>
          <div className="p-2 bg-black/40 border border-white/5 rounded-sm">
            <span className="text-neon-purple mr-2">POST</span>
            <span className="text-slate-300">/v1/actions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
