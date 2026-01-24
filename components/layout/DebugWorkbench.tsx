import React, { useRef, useState, useEffect } from 'react';
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

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (e) {
      toast.error('Failed to access camera.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

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
    } catch (e) {
      toast.error('Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020203] border-l border-slate-800/80">
      <div className="px-3 py-4 border-b border-white/5 bg-[#050608]">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-[0.3em] panel-title">
          <span className="text-red-500">CIRCUIT</span>_EYE_DEBUG
        </h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">
          Physical Verification System
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        {/* Camera Preview */}
        <div className="relative aspect-video bg-black border border-white/5 cut-corner-md overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 border-[20px] border-transparent border-t-white/5 border-l-white/5 pointer-events-none" />
          
          {/* HUD Overlay */}
          <div className="absolute top-2 left-2 flex gap-2">
            <span className="text-[8px] px-1.5 py-0.5 bg-red-500 text-white font-bold animate-pulse">REC</span>
            <span className="text-[8px] px-1.5 py-0.5 bg-black/60 text-slate-300 font-mono">1080P_SIGHT</span>
          </div>

          {isAnalyzing && (
            <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center backdrop-blur-[2px]">
              <div className="loading-tech scale-150"></div>
            </div>
          )}
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full py-3 bg-red-500 text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-red-600 transition-all cut-corner-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
        >
          {isAnalyzing ? 'PROCESSING SIGHT...' : 'ANALYZE PHYSICAL CIRCUIT'}
        </button>

        {/* Error List */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">Found Anomalies</h3>
          {errors.length === 0 ? (
            <div className="py-8 text-center opacity-20 italic">
              <p className="text-[9px] uppercase tracking-widest">No Anomalies Detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((error, idx) => (
                <div key={idx} className="bg-red-950/10 border border-red-500/20 p-3 cut-corner-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] px-1.5 py-0.5 font-bold uppercase ${
                      error.severity === 'high' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                      {error.severity} PRIORITY
                    </span>
                    <span className="text-[9px] font-mono text-red-400 uppercase">{error.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-bold leading-relaxed">{error.description}</p>
                  <div className="p-2 bg-black/40 border-l-2 border-red-500 text-[10px] text-slate-400 italic">
                    REMEDY: {error.remedy}
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
