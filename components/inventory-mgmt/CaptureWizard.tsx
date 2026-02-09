import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebcamCapture from './WebcamCapture';
import FileUploadCapture from './FileUploadCapture';
import VoiceRecorder from './VoiceRecorder';
import {
  inventoryApi,
  type IdentificationResult,
  type CatalogItem,
} from '../../services/inventoryApiClient';

interface CaptureWizardProps {
  onComplete: (result: IdentificationResult) => void;
  onCancel: () => void;
}

type CaptureMode = 'camera' | 'file';

const STEPS = ['Capture', 'Voice Note', 'Identify', 'Review', 'Save'] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4;

const COMPONENT_TYPES = [
  'microcontroller',
  'sensor',
  'actuator',
  'power',
  'passive',
  'ic',
  'connector',
  'other',
] as const;

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function CaptureWizard({ onComplete, onCancel }: CaptureWizardProps) {
  const [step, setStep] = useState<StepIndex>(0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('file');
  const [photos, setPhotos] = useState<File[]>([]);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

  // Identification
  const [identifyError, setIdentifyError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);

  // Review form edits
  const [editedItem, setEditedItem] = useState<Partial<CatalogItem>>({});
  const [newPin, setNewPin] = useState('');

  // Saving
  const [saveError, setSaveError] = useState<string | null>(null);

  // Track object URLs to prevent memory leaks
  const photoUrlsRef = useRef<Map<File, string>>(new Map());
  const getPhotoUrl = useCallback((photo: File) => {
    if (!photoUrlsRef.current.has(photo)) {
      photoUrlsRef.current.set(photo, URL.createObjectURL(photo));
    }
    return photoUrlsRef.current.get(photo)!;
  }, []);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      for (const url of photoUrlsRef.current.values()) {
        URL.revokeObjectURL(url);
      }
      photoUrlsRef.current.clear();
    };
  }, []);

  const confidence = result?.confidence ?? 0;

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return photos.length > 0;
      case 1:
        return true; // Voice is optional
      case 2:
        return result !== null;
      case 3:
        return editedItem.name && editedItem.name.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, photos.length, result, editedItem.name]);

  // --- Step 0: Capture ---

  const handlePhotoCapture = useCallback((file: File) => {
    setPhotos((prev) => [...prev, file]);
  }, []);

  const handleFilesSelected = useCallback((files: File[]) => {
    setPhotos(files);
  }, []);

  // --- Step 1 → 2: Run Identification ---

  const runIdentification = useCallback(async () => {
    setStep(2);
    setIdentifyError(null);
    setResult(null);

    try {
      const res = await inventoryApi.identify(
        photos,
        undefined,
        voiceBlob ?? undefined
      );
      setResult(res);
      // Pre-fill editable form
      setEditedItem({ ...res.catalogItem });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Identification failed. Please try again.';
      setIdentifyError(message);
    }
  }, [photos, voiceBlob]);

  // --- Step 3: Review form handlers ---

  const updateField = useCallback(
    <K extends keyof CatalogItem>(key: K, value: CatalogItem[K]) => {
      setEditedItem((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addPin = useCallback(() => {
    const pin = newPin.trim();
    if (!pin) return;
    setEditedItem((prev) => ({
      ...prev,
      pins: [...(prev.pins ?? []), pin],
    }));
    setNewPin('');
  }, [newPin]);

  const removePin = useCallback((index: number) => {
    setEditedItem((prev) => ({
      ...prev,
      pins: (prev.pins ?? []).filter((_, i) => i !== index),
    }));
  }, []);

  // --- Step 4: Save ---

  const handleSave = useCallback(async () => {
    if (!result) return;
    setSaveError(null);

    try {
      // Update the catalog item with user edits
      const updated = await inventoryApi.updateCatalog(result.catalogItem.id, editedItem);
      onComplete({
        ...result,
        catalogItem: updated,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      setSaveError(message);
    }
  }, [result, editedItem, onComplete]);

  // --- Navigation ---

  const goNext = useCallback(() => {
    if (step === 1) {
      runIdentification();
      return;
    }
    if (step === 4) {
      handleSave();
      return;
    }
    setStep((s) => Math.min(s + 1, 4) as StepIndex);
  }, [step, runIdentification, handleSave]);

  const goBack = useCallback(() => {
    if (step === 2 && !result) {
      // If identification is still loading, go back to voice step
      setStep(1);
      return;
    }
    setStep((s) => Math.max(s - 1, 0) as StepIndex);
  }, [step, result]);

  // --- Confidence bar color ---
  const confidenceColor =
    confidence >= 0.7
      ? 'bg-green-500'
      : confidence >= 0.4
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="flex flex-col gap-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2" role="navigation" aria-label="Wizard steps">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && (
              <div
                className={`h-px w-6 ${i <= step ? 'bg-cyan-500' : 'bg-[#1a1a2e]'}`}
                aria-hidden="true"
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i < step
                    ? 'bg-cyan-600 text-white'
                    : i === step
                      ? 'border-2 border-cyan-500 text-cyan-400'
                      : 'border border-[#1a1a2e] text-slate-600'
                }`}
                aria-current={i === step ? 'step' : undefined}
              >
                {i < step ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className="text-[10px] text-slate-500 hidden sm:block">{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Capture */}
            {step === 0 && (
              <div className="flex flex-col gap-4">
                {/* Mode toggle */}
                <div className="flex gap-2" role="tablist" aria-label="Capture mode">
                  <button
                    role="tab"
                    aria-selected={captureMode === 'file'}
                    onClick={() => setCaptureMode('file')}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm transition-colors ${
                      captureMode === 'file'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-[#0a0a12] text-slate-400 hover:text-slate-200 border border-[#1a1a2e]'
                    }`}
                  >
                    Upload Files
                  </button>
                  <button
                    role="tab"
                    aria-selected={captureMode === 'camera'}
                    onClick={() => setCaptureMode('camera')}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm transition-colors ${
                      captureMode === 'camera'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-[#0a0a12] text-slate-400 hover:text-slate-200 border border-[#1a1a2e]'
                    }`}
                  >
                    Use Camera
                  </button>
                </div>

                {captureMode === 'camera' ? (
                  <WebcamCapture
                    onCapture={handlePhotoCapture}
                    onClose={() => setCaptureMode('file')}
                    maxPhotos={5}
                  />
                ) : (
                  <FileUploadCapture
                    onFilesSelected={handleFilesSelected}
                    maxFiles={5}
                  />
                )}
              </div>
            )}

            {/* Step 1: Voice Note (optional) */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-[#1a1a2e] bg-[#0a0a12]/80 p-4">
                  <VoiceRecorder
                    onRecordingComplete={setVoiceBlob}
                    maxDuration={60}
                  />
                </div>
                {voiceBlob && (
                  <p className="text-center text-xs text-green-400">
                    Voice note recorded
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Identify (loading / error / result) */}
            {step === 2 && (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                {!result && !identifyError && (
                  <>
                    <div className="relative">
                      <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                      <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-cyan-500/20" />
                    </div>
                    <p className="text-sm text-slate-300">AI is analyzing your component...</p>
                    <p className="text-xs text-slate-500">
                      Processing {photos.length} photo{photos.length !== 1 ? 's' : ''}
                      {voiceBlob ? ' + voice note' : ''}
                    </p>
                  </>
                )}

                {identifyError && (
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
                    <p className="text-sm text-red-300">{identifyError}</p>
                    <button
                      onClick={runIdentification}
                      className="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {result && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <svg
                        className="mx-auto mb-3 h-12 w-12 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </motion.div>
                    <p className="text-sm text-slate-200">Component identified</p>
                    <p className="mt-1 text-lg font-medium text-cyan-400">
                      {result.catalogItem.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Confidence: {Math.round(confidence * 100)}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && result && (
              <div className="flex flex-col gap-3">
                {/* Confidence bar */}
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-400">Confidence</span>
                    <span className="text-slate-300">{Math.round(confidence * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1a1a2e] overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${confidenceColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Photo thumbnails */}
                {photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((photo, i) => (
                      <img
                        key={`${photo.name}-${photo.lastModified}`}
                        src={getPhotoUrl(photo)}
                        alt={`Photo ${i + 1}`}
                        className="h-14 w-14 flex-shrink-0 rounded-lg border border-[#1a1a2e] object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Form fields */}
                <div className="grid gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Name</span>
                    <input
                      type="text"
                      value={editedItem.name ?? ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Type</span>
                    <select
                      value={editedItem.type ?? 'other'}
                      onChange={(e) => updateField('type', e.target.value)}
                      className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none"
                    >
                      {COMPONENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Description</span>
                    <textarea
                      value={editedItem.description ?? ''}
                      onChange={(e) => updateField('description', e.target.value)}
                      rows={2}
                      className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none resize-none"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400">Manufacturer</span>
                      <input
                        type="text"
                        value={editedItem.manufacturer ?? ''}
                        onChange={(e) => updateField('manufacturer', e.target.value)}
                        className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400">MPN / Part Number</span>
                      <input
                        type="text"
                        value={editedItem.mpn ?? ''}
                        onChange={(e) => updateField('mpn', e.target.value)}
                        className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Package Type</span>
                    <input
                      type="text"
                      value={editedItem.packageType ?? ''}
                      onChange={(e) => updateField('packageType', e.target.value)}
                      className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none"
                    />
                  </label>

                  {/* Pins (tag input) */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Pins</span>
                    <div className="flex flex-wrap gap-1.5 rounded-lg border border-[#1a1a2e] bg-[#0a0a12] p-2 min-h-[40px]">
                      {(editedItem.pins ?? []).map((pin, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded bg-cyan-600/20 px-2 py-0.5 text-xs text-cyan-300"
                        >
                          {pin}
                          <button
                            type="button"
                            onClick={() => removePin(i)}
                            className="text-cyan-400 hover:text-white transition-colors"
                            aria-label={`Remove pin ${pin}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPin();
                          }
                        }}
                        placeholder="Add pin..."
                        className="flex-1 min-w-[80px] bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-600"
                        aria-label="Add pin name"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Save */}
            {step === 4 && (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                {!saveError ? (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <svg
                        className="h-16 w-16 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </motion.div>
                    <p className="text-lg font-medium text-slate-100">Component Saved</p>
                    <p className="text-sm text-slate-400">
                      {editedItem.name} has been added to your inventory.
                    </p>
                  </>
                ) : (
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
                    <p className="text-sm text-red-300">{saveError}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between border-t border-[#1a1a2e] pt-3">
        <button
          type="button"
          onClick={step === 0 ? onCancel : goBack}
          className="rounded-lg border border-[#1a1a2e] bg-[#0a0a12] px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors"
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < 4 && (
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed}
            className="rounded-lg bg-cyan-600 px-6 py-2 text-sm text-white hover:bg-cyan-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === 1 && !voiceBlob ? 'Skip' : step === 1 ? 'Identify' : 'Next'}
          </button>
        )}

        {step === 4 && !saveError && (
          <button
            type="button"
            onClick={() => onComplete(result!)}
            className="rounded-lg bg-cyan-600 px-6 py-2 text-sm text-white hover:bg-cyan-500 transition-colors"
          >
            Done
          </button>
        )}

        {step === 4 && saveError && (
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-cyan-600 px-6 py-2 text-sm text-white hover:bg-cyan-500 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
