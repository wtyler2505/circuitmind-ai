import React from 'react';
import { useTranslation } from 'react-i18next';
import { unitConverter, MeasurementSystem, SymbolStandard } from '../../services/localization/unitConverter';

export const LocalizationSettings: React.FC = () => {
  const { i18n, t } = useTranslation();
  // In a real app, these would be in a Context or UserProfile
  const [unitSystem, setUnitSystem] = React.useState<MeasurementSystem>('metric');
  const [symbolStd, setSymbolStd] = React.useState<SymbolStandard>('ieee');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="space-y-6 p-4 h-full">
      <div className="bg-slate-900/80 border border-white/5 p-4 cut-corner-md space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em] flex items-center gap-2">
          <svg className="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          GLOBAL_BENCH_CONFIG
        </h3>
        
        {/* Language Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interface Language</label>
          <div className="flex gap-2">
            <button 
              onClick={() => changeLanguage('en')}
              className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all cut-corner-sm ${
                i18n.language.startsWith('en') ? 'bg-neon-cyan text-black border-neon-cyan' : 'bg-black text-slate-500 border-white/10 hover:border-white/30'
              }`}
            >
              ENGLISH
            </button>
            <button 
              onClick={() => changeLanguage('es')}
              className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all cut-corner-sm ${
                i18n.language.startsWith('es') ? 'bg-neon-cyan text-black border-neon-cyan' : 'bg-black text-slate-500 border-white/10 hover:border-white/30'
              }`}
            >
              ESPAÑOL
            </button>
          </div>
        </div>

        {/* Measurement System */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Measurement Units</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setUnitSystem('metric')}
              className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all cut-corner-sm ${
                unitSystem === 'metric' ? 'bg-neon-purple text-white border-neon-purple' : 'bg-black text-slate-500 border-white/10 hover:border-white/30'
              }`}
            >
              METRIC (mm)
            </button>
            <button 
              onClick={() => setUnitSystem('imperial')}
              className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all cut-corner-sm ${
                unitSystem === 'imperial' ? 'bg-neon-purple text-white border-neon-purple' : 'bg-black text-slate-500 border-white/10 hover:border-white/30'
              }`}
            >
              IMPERIAL (mils)
            </button>
          </div>
        </div>

        {/* Symbol Standard */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Symbol Standard</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setSymbolStd('ieee')}
              className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all cut-corner-sm ${
                symbolStd === 'ieee' ? 'bg-neon-amber text-black border-neon-amber' : 'bg-black text-slate-500 border-white/10 hover:border-white/30'
              }`}
            >
              IEEE (US)
            </button>
            <button 
              onClick={() => setSymbolStd('iec')}
              className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all cut-corner-sm ${
                symbolStd === 'iec' ? 'bg-neon-amber text-black border-neon-amber' : 'bg-black text-slate-500 border-white/10 hover:border-white/30'
              }`}
            >
              IEC (EU)
            </button>
          </div>
        </div>

        <div className="p-3 bg-black/40 border border-white/5 rounded-sm mt-4">
          <p className="text-[9px] text-slate-500 font-mono">
            Preview: Resistor 10kΩ • {unitConverter.format(5.08, unitSystem)} • {symbolStd.toUpperCase()} Style
          </p>
        </div>
      </div>
    </div>
  );
};
