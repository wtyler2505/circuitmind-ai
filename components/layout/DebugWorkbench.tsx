import React, { useRef, useState, useEffect, useCallback } from 'react';
import { visionAnalysisService, VisionErrorReport } from '../../services/visionAnalysisService';
import { useDiagram } from '../../contexts/DiagramContext';
import { useToast } from '../../hooks/useToast';

export const DebugWorkbench: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<VisionErrorReport[]>([]);
  const { diagram } = useDiagram();
  const toast = useToast();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (_e) {
      toast.error('Failed to access camera.');
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleAnalyze = async () => {
    if (!videoRef.current || !diagram) return;

    setIsAnalyzing(true);
    try {
      const base64 = await visionAnalysisService.captureBenchSnapshot(videoRef.current);
      const results = await visionAnalysisService.compareRealityToPlan(base64, diagram);
      setErrors(results);
      if (results.length === 0) {
        toast.success('Wiring matches the plan perfectly!');
      } else {
        toast.warning(`Detected ${results.length} mismatches.`);
      }
    } catch (_e) {
      toast.error('Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-dark panel-frame border-l border-white/5">
      <div className="px-3 py-4 border-b border-white/5 bg-cyber-black panel-header shrink-0">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.3em] panel-title">
          <span className="text-red-500">CIRCUIT</span>_EYE_DEBUG
        </h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">
          Physical Verification System
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        {/* Camera Preview */}
        <div className="relative aspect-video bg-black border border-white/10 cut-corner-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.6)] panel-frame">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 border-[20px] border-transparent border-t-white/5 border-l-white/5 pointer-events-none" />
          
          {/* HUD Overlay */}
          <div className="absolute top-2 left-2 flex gap-2">
            <span className="text-[8px] px-1.5 py-0.5 bg-red-500 text-white font-bold animate-pulse shadow-[0_0_8px_#ef4444]">REC</span>
            <span className="text-[8px] px-1.5 py-0.5 bg-black/60 text-slate-300 font-mono border border-white/10 backdrop-blur-md">1080P_SIGHT</span>
          </div>

          {isAnalyzing && (
            <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center backdrop-blur-[3px] transition-all">
              <div className="loading-tech scale-150" style={{ filter: 'drop-shadow(0 0 15px #ef4444)' }}></div>
            </div>
          )}
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full py-3 bg-red-500 text-white font-bold uppercase tracking-[0.25em] text-[10px] hover:bg-white hover:text-red-600 transition-all cut-corner-sm shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 group flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              PROCESSING_SIGHT...
            </>
          ) : 'ANALYZE PHYSICAL CIRCUIT'}
        </button>

        {/* Error List */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1.5">Found Anomalies</h3>
          {errors.length === 0 ? (
            <div className="py-12 text-center opacity-30 italic">
              <div className="w-10 h-10 border border-white/5 bg-white/5 mx-auto mb-3 flex items-center justify-center cut-corner-sm">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold">No Anomalies Detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((error, idx) => (
                <div key={idx} className="bg-red-500/5 panel-surface border border-red-500/20 p-3 cut-corner-md space-y-2 panel-frame hover:border-red-500/40 transition-all">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-tighter ${
                      error.severity === 'high' ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                    }`}>
                      {error.severity} PRIORITY
                    </span>
                    <span className="text-[9px] font-mono text-red-400 uppercase font-bold tracking-widest">{error.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-bold leading-relaxed tracking-wide">{error.description}</p>
                  <div className="p-2.5 bg-black/40 border-l-2 border-red-500 text-[10px] text-slate-400 italic font-mono leading-relaxed">
                    <span className="text-red-500 font-bold not-italic mr-1">REMEDY:</span> {error.remedy}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
