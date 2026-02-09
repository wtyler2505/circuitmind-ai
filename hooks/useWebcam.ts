import { useState, useRef, useCallback, useEffect } from 'react';

interface UseWebcamOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

interface UseWebcamResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  error: string | null;
  startStream: () => Promise<void>;
  stopStream: () => void;
  takeSnapshot: () => string | null;
  switchCamera: () => Promise<void>;
}

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamResult {
  const { width = 1280, height = 720 } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    options.facingMode ?? 'environment'
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    stopStream();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsStreaming(true);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access and try again.'
          : err instanceof DOMException && err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : err instanceof DOMException && err.name === 'NotReadableError'
              ? 'Camera is already in use by another application.'
              : err instanceof Error
                ? err.message
                : 'Failed to access camera.';

      setError(message);
      setIsStreaming(false);
    }
  }, [facingMode, width, height, stopStream]);

  const takeSnapshot = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !isStreaming) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [isStreaming]);

  const switchCamera = useCallback(async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
  }, [facingMode]);

  // Restart stream when facingMode changes (only if already streaming)
  useEffect(() => {
    if (isStreaming) {
      startStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isStreaming,
    error,
    startStream,
    stopStream,
    takeSnapshot,
    switchCamera,
  };
}
