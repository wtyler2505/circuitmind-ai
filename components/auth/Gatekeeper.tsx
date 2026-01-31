import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

export const Gatekeeper: React.FC = () => {
  const { isLocked, isSetup, login, setup } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isLocked) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;

    setLoading(true);
    setError(false);

    try {
      if (isSetup) {
        const success = await login(pin);
        if (!success) setError(true);
      } else {
        await setup(pin);
      }
    } catch (_err) {
      setError(true);
    } finally {
      setLoading(false);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-cyber-black flex items-center justify-center p-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,243,255,0.1),transparent_70%)]" />
      <div className="absolute inset-0 canvas-grid opacity-20" />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-slate-900 border border-neon-cyan/30 cut-corner-md p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        {/* Decorative Flourish */}
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <div className="loading-tech scale-50"></div>
        </div>

        <div className="text-center space-y-2 mb-8">
          <img src="/assets/ui/logo.webp" alt="Logo" className="w-12 h-12 mx-auto mb-4 grayscale brightness-200" />
          <h2 className="text-sm font-bold text-white uppercase tracking-[0.4em] panel-title">
            {isSetup ? 'ACCESS_RESTRICTED' : 'INITIAL_ENCRYPTION'}
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            {isSetup ? 'Enter Security PIN to unlock workspace' : 'Create master PIN to secure your workbench'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden username field for accessibility/password managers */}
          <input 
            type="text" 
            name="username" 
            value="engineer" 
            readOnly 
            style={{ display: 'none' }} 
            autoComplete="username" 
          />
          <div className="relative">
            <input 
              type="password" 
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              autoFocus
              autoComplete={isSetup ? 'current-password' : 'new-password'}
              className={`w-full bg-black/60 border ${error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-700 focus:border-neon-cyan'} text-center text-2xl tracking-[0.5em] py-4 text-white font-mono focus:outline-none transition-all cut-corner-sm`}
            />
            {error && (
              <p className="absolute -bottom-5 left-0 right-0 text-[9px] text-red-500 text-center font-bold uppercase tracking-widest">
                Invalid Security PIN
              </p>
            )}
          </div>

          <button 
            type="submit"
            disabled={pin.length < 4 || loading}
            className={`w-full py-4 font-bold uppercase tracking-[0.3em] text-xs transition-all cut-corner-sm ${
              pin.length >= 4 && !loading
                ? 'bg-neon-cyan text-black hover:bg-white shadow-[0_0_20px_rgba(0,243,255,0.3)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'VALIDATING...' : isSetup ? 'UNLOCK_SYSTEM' : 'INITIALIZE_SECURITY'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[8px] text-slate-600 uppercase tracking-[0.2em] font-mono leading-relaxed">
            CircuitMind Secure Protocol v4.0<br/>
            End-to-End Local Encryption Enabled
          </p>
        </div>
      </motion.div>
    </div>
  );
};
