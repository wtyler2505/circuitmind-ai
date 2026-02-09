import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateImageFile, generateThumbnail } from '../../services/captureService';

interface FileUploadCaptureProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

interface FileEntry {
  file: File;
  thumbnail: string;
}

export default function FileUploadCapture({
  onFilesSelected,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: FileUploadCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Notify parent whenever files change
  useEffect(() => {
    onFilesSelected(files.map((f) => f.file));
  }, [files, onFilesSelected]);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      setValidationError(null);
      const remaining = maxFiles - files.length;
      if (remaining <= 0) {
        setValidationError(`Maximum of ${maxFiles} files allowed.`);
        return;
      }

      const toAdd = incoming.slice(0, remaining);
      const errors: string[] = [];
      const entries: FileEntry[] = [];

      for (const file of toAdd) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`);
          continue;
        }
        if (!acceptedTypes.includes(file.type)) {
          errors.push(`${file.name}: Unsupported file type.`);
          continue;
        }
        try {
          const thumbnail = await generateThumbnail(file, 80);
          entries.push({ file, thumbnail });
        } catch {
          errors.push(`${file.name}: Failed to generate preview.`);
        }
      }

      if (errors.length > 0) {
        setValidationError(errors.join(' '));
      }

      if (entries.length > 0) {
        setFiles((prev) => [...prev, ...entries]);
      }
    },
    [files.length, maxFiles, acceptedTypes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files ? Array.from(e.target.files) : [];
      addFiles(selected);
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    },
    [addFiles]
  );

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors ${
          isDragging
            ? 'border-cyan-500 bg-cyan-500/5'
            : 'border-[#1a1a2e] bg-[#0a0a12]/50 hover:border-cyan-500/30'
        }`}
        aria-label="Upload photos by clicking or dragging files here"
      >
        <svg
          className={`h-10 w-10 transition-colors ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.438 3.42A3.75 3.75 0 0118 19.5H6.75z"
          />
        </svg>
        <div className="text-center">
          <p className="text-sm text-slate-300">
            {isDragging ? 'Drop photos here' : 'Drag photos here or click to browse'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            JPEG, PNG, or WebP — up to 20 MB each
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Validation error */}
      <AnimatePresence>
        {validationError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400"
            role="alert"
          >
            {validationError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* File counter */}
      <p className="text-xs text-slate-500">
        {files.length} of {maxFiles} files selected
      </p>

      {/* Thumbnail grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-5 gap-2" role="list" aria-label="Selected files">
          {files.map((entry, index) => (
            <div key={index} className="relative group" role="listitem">
              <img
                src={entry.thumbnail}
                alt={entry.file.name}
                className="h-16 w-16 rounded-lg border border-[#1a1a2e] object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${entry.file.name}`}
              >
                ×
              </button>
              <p className="mt-0.5 truncate text-[9px] text-slate-500 w-16">{entry.file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
