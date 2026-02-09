import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebcam } from '../../hooks/useWebcam';
import { dataUrlToFile, generateThumbnail } from '../../services/captureService';

interface WebcamCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  maxPhotos?: number;
}

interface CapturedPhoto {
  file: File;
  thumbnail: string;
}

export default function WebcamCapture({
  onCapture,
  onClose,
  maxPhotos = 5,
}: WebcamCaptureProps) {
  const { videoRef, isStreaming, error, startStream, stopStream, takeSnapshot, switchCamera } =
    useWebcam({ facingMode: 'environment' });

  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [flashVisible, setFlashVisible] = useState(false);

  // Start stream on mount
  React.useEffect(() => {
    startStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = useCallback(async () => {
    if (photos.length >= maxPhotos) return;

    const dataUrl = takeSnapshot();
    if (!dataUrl) return;

    // Flash effect
    setFlashVisible(true);
    setTimeout(() => setFlashVisible(false), 150);

    const filename = `capture-${Date.now()}.jpg`;
    const file = dataUrlToFile(dataUrl, filename);
    const thumbnail = await generateThumbnail(file, 80);

    setPhotos((prev) => [...prev, { file, thumbnail }]);
    onCapture(file);
  }, [takeSnapshot, photos.length, maxPhotos, onCapture]);

  const handleRemovePhoto = useCallback(
    (index: number) => {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  const atLimit = photos.length >= maxPhotos;

  return (
    <div className="flex flex-col gap-3">
      {/* Video feed */}
      <div className="relative overflow-hidden rounded-xl border border-[#1a1a2e] bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-[4/3] object-cover"
          aria-label="Camera preview"
        />

        {/* Flash overlay */}
        <AnimatePresence>
          {flashVisible && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050508]/90 p-6">
            <div className="text-center">
              <svg
                className="mx-auto mb-3 h-10 w-10 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={startStream}
                className="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050508]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors"
          aria-label="Close camera"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={switchCamera}
          disabled={!isStreaming}
          className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] p-2.5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Switch camera"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleCapture}
          disabled={!isStreaming || atLimit}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          aria-label={atLimit ? 'Photo limit reached' : 'Take photo'}
        >
          <div className="h-10 w-10 rounded-full border-2 border-white/80" />
        </button>
      </div>

      {/* Photo counter */}
      <p className="text-center text-xs text-slate-500">
        {photos.length} of {maxPhotos} photos captured
      </p>

      {/* Thumbnail strip */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-1" role="list" aria-label="Captured photos">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 group"
              role="listitem"
            >
              <img
                src={photo.thumbnail}
                alt={`Captured photo ${index + 1}`}
                className="h-16 w-16 rounded-lg border border-[#1a1a2e] object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove photo ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
