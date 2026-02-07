import React, { lazy, Suspense, memo } from 'react';
import { ElectronicComponent } from '../types';
import { useComponentEditorForm } from '../hooks/useComponentEditorForm';

// Lazy load Three.js viewer (heavy dependency)
const ThreeViewer = lazy(() => import('./ThreeViewer'));

interface ComponentEditorModalProps {
  component: ElectronicComponent;
  onClose: () => void;
  onSave: (component: ElectronicComponent) => void;
  explanation: string;
  isGenerating3D: boolean;
  onGenerate3D: (name: string, type: string, prompt?: string, imageUrl?: string, precision?: 'draft' | 'masterpiece') => void;
}

const ComponentEditorModalComponent: React.FC<ComponentEditorModalProps> = ({
  component,
  onClose,
  onSave,
  explanation,
  isGenerating3D,
  onGenerate3D,
}) => {
  const form = useComponentEditorForm({ component, onSave, onGenerate3D });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {form.isExtractingDatasheet && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-neon-cyan/50 p-6 cut-corner-md w-80 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
            <h3 className="text-neon-cyan font-bold uppercase tracking-widest mb-4 animate-pulse">
              ANALYZING_DATASHEET
            </h3>
            <div className="font-mono text-[10px] text-slate-300 space-y-1 h-32 overflow-hidden border-l border-neon-cyan/20 pl-2">
              {form.extractionLogs.map((log, i) => (
                <div key={i} className="animate-fade-in opacity-80">
                  <span className="text-neon-cyan mr-2">›</span>
                  {log}
                </div>
              ))}
              <div className="animate-pulse">_</div>
            </div>
          </div>
        </div>
      )}
      <div
        className={`bg-cyber-card border border-neon-cyan/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[85vh] md:max-h-[80vh] transition-all duration-300 ${form.showAiChat ? 'w-full max-w-4xl' : 'w-full max-w-2xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 md:p-6 border-b border-slate-700 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            {form.editedImageUrl ? (
              <img
                src={form.editedImageUrl}
                alt="Thumbnail"
                className="w-10 h-10 md:w-12 md:h-12 rounded border border-slate-600 object-cover"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded border border-slate-600 bg-black flex items-center justify-center text-slate-300 font-mono font-bold text-xl">
                {form.editedType.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1 line-clamp-1">
                {component.name}
              </h3>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-mono uppercase">
                {component.type}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="flex border-b border-slate-700 bg-slate-900/50 shrink-0 overflow-x-auto">
          <button
            onClick={() => form.setActiveTab('info')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${form.activeTab === 'info' ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/5' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            INFO
          </button>
          <button
            onClick={() => form.setActiveTab('edit')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${form.activeTab === 'edit' ? 'border-neon-green text-neon-green bg-neon-green/5' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            EDIT
          </button>
          <button
            onClick={() => form.setActiveTab('image')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${form.activeTab === 'image' ? 'border-neon-amber text-neon-amber bg-neon-amber/5' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            IMAGE
          </button>
          <button
            onClick={() => form.setActiveTab('3d')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${form.activeTab === '3d' ? 'border-neon-purple text-neon-purple bg-neon-purple/5' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            3D MODEL
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6`}>
            {form.activeTab === 'info' && (
              <>
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-slate-300 italic mb-4">{component.description}</p>

                  {component.datasheetUrl && (
                    <a
                      href={component.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-neon-cyan hover:text-white mb-4 text-xs font-bold border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-2 rounded transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      OPEN DATASHEET
                    </a>
                  )}

                  <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-200">
                    {explanation}
                  </div>
                </div>
                <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-neon-cyan font-mono">PINS</h4>
                    <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-3">
                    Pin list shown in wiring suggestions and label callouts.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {component.pins && component.pins.length > 0 ? (
                      component.pins.map((pin) => (
                        <span
                          key={pin}
                          className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-300"
                        >
                          {pin}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-300 text-xs italic">No pins defined</span>
                    )}
                  </div>
                </div>
              </>
            )}

            {form.activeTab === 'edit' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                      Basics
                    </h4>
                    <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">
                      Required
                    </span>
                  </div>

                  {/* NAME + AI ASSIST */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="editedName" className="text-xs font-mono text-slate-300">
                        NAME
                        <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                          Required
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={form.handleAiAssist}
                          disabled={form.isAiThinking || !form.editedName}
                          className="text-[10px] font-bold text-neon-cyan hover:text-white flex items-center gap-1 transition-colors disabled:opacity-80 border border-neon-cyan/30 px-2 py-0.5 rounded bg-neon-cyan/5"
                        >
                          {form.isAiThinking ? (
                            <span className="animate-pulse">ANALYZING...</span>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              AUTO-FILL
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => form.setShowAiChat(!form.showAiChat)}
                          className={`text-[10px] font-bold flex items-center gap-1 transition-colors border px-2 py-0.5 rounded ${form.showAiChat ? 'bg-neon-purple text-white border-neon-purple' : 'text-neon-purple hover:text-white border-neon-purple/30 bg-neon-purple/5'}`}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                          </svg>
                          AI ASSISTANT
                        </button>
                      </div>
                    </div>
                    <input
                      id="editedName"
                      name="editedName"
                      type="text"
                      value={form.editedName}
                      onChange={(e) => form.setEditedName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-300 focus:border-neon-green focus:outline-none focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
                    />
                  </div>

                  {/* TYPE & QUANTITY */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label htmlFor="editedType" className="block text-xs font-mono text-slate-300 mb-1">
                        TYPE
                        <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                          Required
                        </span>
                      </label>
                      <select
                        id="editedType"
                        name="editedType"
                        value={form.editedType}
                        onChange={(e) => form.setEditedType(e.target.value as ElectronicComponent['type'])}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-2 text-white focus:border-neon-green focus:outline-none"
                      >
                        <option value="microcontroller">Microcontroller</option>
                        <option value="sensor">Sensor</option>
                        <option value="actuator">Actuator</option>
                        <option value="power">Power</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="w-28">
                      <label htmlFor="editedQuantity" className="block text-xs font-mono text-slate-300 mb-1">
                        QUANTITY
                        <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                          Required
                        </span>
                      </label>
                      <input
                        id="editedQuantity"
                        name="editedQuantity"
                        type="number"
                        min="0"
                        value={form.editedQuantity}
                        onChange={(e) => form.setEditedQuantity(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                      Details
                    </h4>
                    <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">
                      Optional
                    </span>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label htmlFor="editedDescription" className="block text-xs font-mono text-slate-300 mb-1">
                      DESCRIPTION
                      <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                        Optional
                      </span>
                    </label>
                    <textarea
                      id="editedDescription"
                      name="editedDescription"
                      value={form.editedDescription}
                      onChange={(e) => form.setEditedDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-300 focus:border-neon-green focus:outline-none h-24 resize-none transition-all"
                      placeholder="Enter a short description for this component..."
                    />
                  </div>

                  {/* PINS */}
                  <div>
                    <label htmlFor="editedPins" className="block text-xs font-mono text-slate-300 mb-1">
                      PINS
                      <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                        Optional
                      </span>
                    </label>
                    <input
                      id="editedPins"
                      name="editedPins"
                      type="text"
                      value={form.editedPins}
                      onChange={(e) => form.setEditedPins(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-300 focus:border-neon-green focus:outline-none font-mono text-sm"
                      placeholder="Comma separated: VCC, GND, D1, D2..."
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                      Media
                    </h4>
                    <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">
                      Optional
                    </span>
                  </div>

                  {/* IMAGE URL */}
                  <div>
                    <label htmlFor="editedImageUrl" className="block text-xs font-mono text-slate-300 mb-1">
                      IMAGE URL
                      <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                        Optional
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="editedImageUrl"
                        name="editedImageUrl"
                        type="text"
                        value={form.editedImageUrl}
                        onChange={(e) => form.setEditedImageUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-300 focus:border-neon-green focus:outline-none"
                        placeholder="https://example.com/image.png"
                      />
                      <button
                        onClick={form.handleGenerateThumbnail}
                        disabled={form.isGeneratingImage || !form.editedName}
                        className="bg-neon-amber/10 border border-neon-amber/50 text-neon-amber w-10 h-full rounded hover:bg-neon-amber hover:text-black disabled:opacity-80 transition-colors flex items-center justify-center shrink-0"
                        title="Auto-generate AI Thumbnail"
                      >
                        {form.isGeneratingImage ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* DATASHEET URL */}
                  <div>
                    <label htmlFor="editedDatasheetUrl" className="block text-xs font-mono text-slate-300 mb-1">
                      DATASHEET
                      <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                        Optional
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="editedDatasheetUrl"
                        name="editedDatasheetUrl"
                        type="url"
                        value={form.editedDatasheetUrl}
                        onChange={(e) => form.setEditedDatasheetUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-300 focus:border-neon-green focus:outline-none"
                        placeholder="https://example.com/datasheet.pdf"
                      />
                      <button
                        onClick={() => form.datasheetInputRef.current?.click()}
                        disabled={form.isExtractingDatasheet}
                        className="bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan px-3 rounded hover:bg-neon-cyan hover:text-black disabled:opacity-80 transition-colors flex items-center justify-center gap-2 text-[10px] font-bold uppercase shrink-0"
                        title="Extract pins from PDF"
                      >
                        {form.isExtractingDatasheet ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                        SCRAPE PDF
                      </button>
                      <input
                        id="datasheetUpload"
                        name="datasheetUpload"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={form.datasheetInputRef}
                        onChange={form.handleDatasheetUpload}
                      />
                    </div>
                  </div>

                  {/* 3D MODEL URL */}
                  <div>
                    <label htmlFor="editedThreeDModelUrl" className="block text-xs font-mono text-slate-300 mb-1">
                      3D MODEL URL (GLB/GLTF)
                      <span className="ml-2 text-[9px] text-slate-300 uppercase tracking-widest">
                        Optional
                      </span>
                    </label>
                    <input
                      id="editedThreeDModelUrl"
                      name="editedThreeDModelUrl"
                      type="url"
                      value={form.editedThreeDModelUrl}
                      onChange={(e) => form.setEditedThreeDModelUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-300 focus:border-neon-green focus:outline-none"
                      placeholder="https://example.com/model.glb"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={form.handleSave}
                    disabled={!form.hasChanges}
                    className={`w-full font-bold py-3 rounded transition-all shadow-lg transform active:scale-[0.98] ${
                      form.hasChanges
                        ? 'bg-neon-green text-black hover:bg-green-400 shadow-[0_0_15px_rgba(0,255,157,0.3)] hover:shadow-[0_0_25px_rgba(0,255,157,0.5)]'
                        : 'bg-slate-700 text-slate-300 cursor-not-allowed opacity-80'
                    }`}
                  >
                    {form.hasChanges ? 'SAVE CHANGES' : 'NO CHANGES'}
                  </button>
                </div>
              </div>
            )}

            {form.activeTab === 'image' && (
              <div className="flex flex-col h-full gap-4">
                <div className="bg-black/50 border border-slate-700 rounded-xl overflow-hidden aspect-square relative flex items-center justify-center max-h-[300px] mx-auto w-full">
                  {form.editedImageUrl && !form.imageLoadError ? (
                    <>
                      {form.isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                          <div className="w-8 h-8 border-2 border-neon-amber border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={form.editedImageUrl}
                        alt="Preview"
                        className={`w-full h-full object-contain transition-opacity ${form.isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={() => form.setIsImageLoading(false)}
                        onError={() => {
                          form.setIsImageLoading(false);
                          form.setImageLoadError(true);
                        }}
                      />
                    </>
                  ) : form.imageLoadError ? (
                    <div className="text-red-400 text-center p-4">
                      <svg
                        className="w-16 h-16 mx-auto mb-2 opacity-70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="text-sm font-medium">Failed to Load Image</p>
                      <p className="text-xs text-slate-500 mt-1">The image URL may be invalid or blocked</p>
                      <button
                        onClick={() => {
                          form.setImageLoadError(false);
                          form.setEditedImageUrl('');
                        }}
                        className="mt-3 text-xs text-neon-cyan hover:text-white transition-colors"
                      >
                        Clear URL
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-300 text-center p-4">
                      <svg
                        className="w-16 h-16 mx-auto mb-2 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm">No Image Available</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Optional Refinement Prompt</label>
                    <textarea
                      value={form.imagePrompt}
                      onChange={(e) => form.setImagePrompt(e.target.value)}
                      placeholder="e.g. realistic product photo, dark blue board, high detail..."
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:border-neon-amber focus:outline-none h-16 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => form.fileInputRef.current?.click()}
                      className="bg-slate-800 text-slate-200 font-bold py-3 rounded hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs border border-slate-600 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      UPLOAD PHOTO
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={form.fileInputRef}
                      onChange={form.handleImageUpload}
                    />

                    <button
                      onClick={form.handleGenerateThumbnail}
                      disabled={form.isGeneratingImage || !form.editedName}
                      className="bg-neon-amber text-black font-bold py-3 rounded hover:bg-white transition-colors uppercase tracking-widest text-xs shadow-lg disabled:opacity-80 flex items-center justify-center gap-2"
                    >
                      {form.isGeneratingImage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          GENERATING...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          GENERATE AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {form.activeTab === '3d' && (
              <div className="flex flex-col h-full min-h-[300px] md:min-h-[400px]">
                <div className="mb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-neon-purple font-mono">
                      INTERACTIVE 3D VIEW
                    </h4>
                    <button
                      onClick={() => onGenerate3D(form.editedName, form.editedType, form.threeDPrompt, form.editedImageUrl, form.editedPrecisionLevel)}
                      disabled={isGenerating3D}
                      className="text-xs bg-slate-800 border border-slate-600 hover:border-neon-purple hover:text-neon-purple px-3 py-1 rounded transition-colors disabled:opacity-80"
                    >
                      {isGenerating3D
                        ? 'GENERATING...'
                        : component.threeCode
                          ? 'REGENERATE'
                          : 'GENERATE 3D MODEL'}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="flex-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">PRECISION LEVEL</label>
                      <div className="flex gap-2">
                        {(['draft', 'masterpiece'] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => form.setEditedPrecisionLevel(level)}
                            className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${form.editedPrecisionLevel === level ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="w-1/3 text-[9px] text-slate-500 font-mono leading-tight italic border-l border-slate-800 pl-3">
                      {form.editedPrecisionLevel === 'masterpiece'
                        ? 'Highest fidelity. PBR materials & procedural details.'
                        : 'Fast generation. Basic shapes & colors.'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Optional 3D Refinement</label>
                    <textarea
                      value={form.threeDPrompt}
                      onChange={(e) => form.setThreeDPrompt(e.target.value)}
                      placeholder="e.g. make it blue, add 4 long pins, make the base taller..."
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:border-neon-purple focus:outline-none h-16 resize-none"
                    />
                  </div>
                </div>
                <div className="flex-1 bg-black rounded-xl overflow-hidden border border-slate-700 relative">
                  {(form.has3DModel || form.canRenderThreeCode) && !isGenerating3D ? (
                    <>
                      <Suspense
                        fallback={
                          <div className="w-full h-full flex items-center justify-center bg-cyber-dark text-neon-cyan">
                            Loading 3D viewer...
                          </div>
                        }
                      >
                        <ThreeViewer
                          code={form.canRenderThreeCode ? component.threeCode : undefined}
                          modelUrl={component.threeDModelUrl}
                        />
                      </Suspense>
                      {form.has3DCode && !form.is3DCodeApproved && (
                        <div className="absolute left-3 right-3 bottom-3 bg-slate-950/90 border border-slate-700 rounded-lg p-3 text-[11px] text-slate-300">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-3">
                              <span>AI 3D code is blocked until you run it.</span>
                              <button
                                onClick={() => form.setIs3DCodeApproved(true)}
                                className="bg-neon-purple text-black px-3 py-1 rounded text-[10px] font-bold hover:bg-purple-300 transition-colors"
                              >
                                RUN 3D CODE
                              </button>
                            </div>
                            <details>
                              <summary className="cursor-pointer text-slate-300">
                                Preview code
                              </summary>
                              <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-slate-200">
                                {form.codePreview}
                                {form.isCodeTruncated ? '\n...' : ''}
                              </pre>
                            </details>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-slate-300 p-4 text-center">
                      {isGenerating3D ? (
                        <>
                          <div className="w-8 h-8 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-neon-purple font-mono animate-pulse">
                            Constructing Geometry...
                          </span>
                        </>
                      ) : form.has3DCode ? (
                        <>
                          <p className="text-sm text-slate-300">AI-generated 3D code is ready.</p>
                          <p className="text-[11px] text-slate-300 max-w-xs">
                            Review the code and run it when you are ready.
                          </p>
                          <div className="w-full max-w-md bg-slate-950/80 border border-slate-700 rounded p-3 text-[10px] font-mono text-slate-200 max-h-32 overflow-auto whitespace-pre-wrap">
                            {form.codePreview}
                            {form.isCodeTruncated ? '\n...' : ''}
                          </div>
                          <button
                            onClick={() => form.setIs3DCodeApproved(true)}
                            className="bg-neon-purple text-black px-4 py-2 rounded text-xs font-bold hover:bg-purple-300 transition-colors"
                          >
                            RUN 3D CODE
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-slate-200">No 3D model yet.</p>
                          <p className="text-[11px] text-slate-300 max-w-xs">
                            Generate a model with AI or paste a GLB/GLTF URL in the Edit tab.
                          </p>
                          <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                            <span>- Use Generate 3D Model for instant geometry.</span>
                            <span>- Add a 3D model URL to load a real asset.</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI CHAT SIDE PANEL */}
          {form.showAiChat && (
            <div className="w-80 border-l border-slate-700 bg-slate-900/50 flex flex-col animate-fade-in-right">
              <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                <h4 className="text-xs font-bold text-neon-purple font-mono flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></div>
                  AI ASSISTANT
                </h4>
                <button
                  onClick={() => form.setShowAiChat(false)}
                  className="text-slate-300 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-950/30">
                {form.chatMessages.length === 1 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => form.handleSendChat("Find the datasheet for this component")}
                      className="text-[10px] bg-slate-800 border border-slate-700 hover:border-neon-purple text-slate-300 hover:text-white p-2 rounded text-left transition-colors"
                    >
                      📄 Find Datasheet
                    </button>
                    <button
                      onClick={() => form.handleSendChat("What is the pinout for this?")}
                      className="text-[10px] bg-slate-800 border border-slate-700 hover:border-neon-purple text-slate-300 hover:text-white p-2 rounded text-left transition-colors"
                    >
                      🔌 Get Pinout
                    </button>
                    <button
                      onClick={() => form.handleSendChat("Find a product image")}
                      className="text-[10px] bg-slate-800 border border-slate-700 hover:border-neon-purple text-slate-300 hover:text-white p-2 rounded text-left transition-colors"
                    >
                      🖼️ Search Image
                    </button>
                    <button
                      onClick={() => form.handleSendChat("Suggest compatible parts")}
                      className="text-[10px] bg-slate-800 border border-slate-700 hover:border-neon-purple text-slate-300 hover:text-white p-2 rounded text-left transition-colors"
                    >
                      🔗 Compatible Parts
                    </button>
                  </div>
                )}
                {form.chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] text-xs p-2 rounded mb-1 ${msg.role === 'user' ? 'bg-neon-purple/20 text-slate-200 border border-neon-purple/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}
                    >
                      {msg.text}
                    </div>

                    {/* Render Found Images */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto max-w-[85%] pb-1 scrollbar-hide">
                        {msg.images.map((img, i) => (
                          <div
                            key={i}
                            className="flex-shrink-0 w-16 h-16 rounded border border-slate-600 overflow-hidden cursor-pointer hover:border-neon-cyan relative group"
                            onClick={() => form.selectFoundImage(img)}
                          >
                            <img src={img} alt="Found" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Suggested Actions */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => form.handleAction(action)}
                            className="text-[10px] bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan px-2 py-1 rounded hover:bg-neon-cyan hover:text-black transition-colors"
                          >
                            {action.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {form.isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 p-2 rounded border border-slate-700 flex gap-1">
                      <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
                <div ref={form.chatEndRef} />
              </div>

              <div className="p-3 border-t border-slate-700 bg-slate-900">
                <div className="relative">
                  <input
                    type="text"
                    value={form.chatInput}
                    onChange={(e) => form.setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && form.handleSendChat()}
                    placeholder="Edit pins, description..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-white focus:outline-none focus:border-neon-purple"
                    disabled={form.isChatLoading}
                  />
                  <button
                    onClick={() => form.handleSendChat()}
                    disabled={!form.chatInput.trim() || form.isChatLoading}
                                className="absolute right-1 top-1 p-1 text-slate-300 hover:text-neon-purple disabled:opacity-80"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ComponentEditorModal = memo(ComponentEditorModalComponent);

export default ComponentEditorModal;
