import { useState, useEffect, useRef, useCallback } from 'react';
import { gestureEngine, GestureResult } from '../services/gesture/GestureEngine';
import { useLayout } from '../contexts/LayoutContext';

export function useNeuralLink() {
  const { lowPerformanceMode } = useLayout();
  const [isActive, setIsActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GestureResult | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Use refs to avoid startTracking identity changes and infinite loops
  const isActiveRef = useRef(false);
  const isInitializingRef = useRef(false);

  const stopTracking = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsActive(false);
    isActiveRef.current = false;
    setIsInitializing(false);
    isInitializingRef.current = false;
  }, []);

  const startTracking = useCallback(async () => {
    if (isActiveRef.current || isInitializingRef.current) return;
    
    console.log('Neural Link: Initializing engine...');
    setIsInitializing(true);
    isInitializingRef.current = true;
    try {
      setError(null);
      await gestureEngine.init();
      console.log('Neural Link: Engine initialized. Requesting camera...');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser/context');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      console.log('Neural Link: Camera stream obtained.');

      if (!videoRef.current) {
        videoRef.current = document.createElement('video');
        videoRef.current.setAttribute('playsinline', '');
      }
      videoRef.current.srcObject = stream;
      
      await new Promise((resolve) => {
        if (!videoRef.current) return resolve(null);
        videoRef.current.onloadedmetadata = () => resolve(null);
      });

      await videoRef.current.play();
      console.log('Neural Link: Video playing. Starting tracking loop...');

      setIsActive(true);
      isActiveRef.current = true;
      setIsInitializing(false);
      isInitializingRef.current = false;

      const tick = async () => {
        if (!videoRef.current || videoRef.current.paused) return;
        
        try {
          await gestureEngine.processFrame(videoRef.current);
        } catch (err) {
          console.warn('Neural Link tracking tick failed:', err);
        }

        if (lowPerformanceMode) {
          setTimeout(() => {
            rafRef.current = requestAnimationFrame(tick);
          }, 100);
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      tick();
    } catch (e: any) {
      console.error('Neural Link: Failed to start:', e);
      setError(e.message || 'Camera access denied');
      setIsActive(false);
      isActiveRef.current = false;
      setIsInitializing(false);
      isInitializingRef.current = false;
    }
  }, [lowPerformanceMode]);

  useEffect(() => {
    const unsub = gestureEngine.onLandmarks((res) => {
      setResult(res);
    });
    return () => {
      unsub();
      stopTracking();
    };
  }, [stopTracking]);

  const getSnapshotBlob = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || videoRef.current.paused) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.7));
  }, []);

  return {
    isActive,
    isInitializing,
    startTracking,
    stopTracking,
    error,
    result,
    getSnapshotBlob,
    // Engagement check: Hand landmarks must be present
    isEngaged: result && result.landmarks.length > 0
  };
}
