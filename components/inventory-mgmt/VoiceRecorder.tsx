import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function VoiceRecorder({
  onRecordingComplete,
  maxDuration = 60,
}: VoiceRecorderProps) {
  const {
    isRecording,
    duration,
    error,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecorder();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-stop at max duration
  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      stopRecording();
    }
  }, [isRecording, duration, maxDuration, stopRecording]);

  // Notify parent when recording is complete
  useEffect(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleReRecord = useCallback(() => {
    setIsPlaying(false);
    clearRecording();
  }, [clearRecording]);

  // Waveform bars (visual only)
  const barCount = 24;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-sm text-slate-400">
        Describe the component in your own words
      </p>

      {/* Waveform visualization */}
      <div
        className="flex h-12 items-end justify-center gap-[3px]"
        aria-hidden="true"
      >
        {Array.from({ length: barCount }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${isRecording ? 'bg-red-500' : audioUrl ? 'bg-cyan-500/50' : 'bg-slate-700'}`}
            animate={
              isRecording
                ? {
                    height: [4, 8 + Math.random() * 32, 4],
                  }
                : { height: audioUrl ? 8 + (i % 3) * 6 : 4 }
            }
            transition={
              isRecording
                ? {
                    duration: 0.3 + Math.random() * 0.4,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: i * 0.02,
                  }
                : { duration: 0.3 }
            }
          />
        ))}
      </div>

      {/* Duration display */}
      <p className="font-mono text-lg tabular-nums text-slate-200">
        {formatDuration(isRecording ? duration : audioBlob ? duration : 0)}
        {isRecording && (
          <span className="ml-2 text-xs text-slate-500">
            / {formatDuration(maxDuration)}
          </span>
        )}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!audioUrl ? (
          // Record / Stop
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className="relative flex h-14 w-14 items-center justify-center rounded-full transition-colors"
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {/* Pulsing ring when recording */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-500"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                aria-hidden="true"
              />
            )}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              }`}
            >
              {isRecording ? (
                // Stop icon (square)
                <div className="h-4 w-4 rounded-sm bg-white" />
              ) : (
                // Mic icon
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </div>
          </button>
        ) : (
          // Playback controls
          <>
            <button
              type="button"
              onClick={handleReRecord}
              className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors"
              aria-label="Re-record voice note"
            >
              Re-record
            </button>

            <button
              type="button"
              onClick={togglePlayback}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-colors"
              aria-label={isPlaying ? 'Pause playback' : 'Play recording'}
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          aria-hidden="true"
        />
      )}

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400 text-center"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
