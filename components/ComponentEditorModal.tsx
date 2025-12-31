import React, { useState, useEffect, useRef } from 'react';
import { ElectronicComponent } from '../types';
import ThreeViewer from './ThreeViewer';
import { generateComponentThumbnail, smartFillComponent, assistComponentEditor } from '../services/geminiService';

interface ComponentEditorModalProps {
  component: ElectronicComponent;
  onClose: () => void;
  onSave: (component: ElectronicComponent) => void;
  explanation: string;
  isGenerating3D: boolean;
  onGenerate3D: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: string[]; // URLs of images found
  actions?: ('GENERATE_IMAGE' | 'GENERATE_3D')[]; // Suggestions
}

// Reuse resize logic (could be moved to utility file in future refactor)
const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      } else {
          resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

const ComponentEditorModal: React.FC<ComponentEditorModalProps> = ({
  component,
  onClose,
  onSave,
  explanation,
  isGenerating3D,
  onGenerate3D
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | '3d' | 'image'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Edit State
  const [editedName, setEditedName] = useState(component.name);
  const [editedType, setEditedType] = useState<ElectronicComponent['type']>(component.type);
  const [editedDescription, setEditedDescription] = useState(component.description);
  const [editedPins, setEditedPins] = useState(component.pins?.join(', ') || '');
  const [editedDatasheetUrl, setEditedDatasheetUrl] = useState(component.datasheetUrl || '');
  const [editedThreeDModelUrl, setEditedThreeDModelUrl] = useState(component.threeDModelUrl || '');
  const [editedImageUrl, setEditedImageUrl] = useState(component.imageUrl || '');
  const [editedQuantity, setEditedQuantity] = useState(component.quantity || 1);
  
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // AI Chat Assistant State
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
      { id: '1', role: 'model', text: 'Hi! I can help you edit this component. I have access to search and can find datasheets or images for you. How can I help?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    setEditedName(component.name);
    setEditedType(component.type);
    setEditedDescription(component.description);
    setEditedPins(component.pins?.join(', ') || '');
    setEditedDatasheetUrl(component.datasheetUrl || '');
    setEditedThreeDModelUrl(component.threeDModelUrl || '');
    setEditedImageUrl(component.imageUrl || '');
    setEditedQuantity(component.quantity || 1);
  }, [component]);

  // Track changes for Save button state
  useEffect(() => {
    const pinsStr = component.pins?.join(', ') || '';
    const isDirty = 
      editedName !== component.name ||
      editedType !== component.type ||
      editedDescription !== component.description ||
      editedPins !== pinsStr ||
      editedDatasheetUrl !== (component.datasheetUrl || '') ||
      editedThreeDModelUrl !== (component.threeDModelUrl || '') ||
      editedImageUrl !== (component.imageUrl || '') ||
      editedQuantity !== (component.quantity || 1);
    
    setHasChanges(isDirty);
  }, [editedName, editedType, editedDescription, editedPins, editedDatasheetUrl, editedThreeDModelUrl, editedImageUrl, editedQuantity, component]);

  // Scroll chat to bottom
  useEffect(() => {
      if (showAiChat) {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [chatMessages, showAiChat]);

  const handleSave = () => {
    const pinsArray = editedPins.split(',').map(p => p.trim()).filter(p => p.length > 0);
    onSave({
      ...component,
      name: editedName,
      type: editedType,
      description: editedDescription,
      pins: pinsArray,
      datasheetUrl: editedDatasheetUrl,
      threeDModelUrl: editedThreeDModelUrl,
      imageUrl: editedImageUrl,
      quantity: editedQuantity
    });
    setHasChanges(false);
    setActiveTab('info');
  };

  const handleGenerateThumbnail = async () => {
      setIsGeneratingImage(true);
      try {
          const base64 = await generateComponentThumbnail(editedName);
          setEditedImageUrl(`data:image/png;base64,${base64}`);
          setActiveTab('image'); // Switch to image tab to see result
      } catch (e) {
          console.error(e);
          alert("Failed to generate image.");
      } finally {
          setIsGeneratingImage(false);
      }
  };
  
  const handleAiAssist = async () => {
      if (!editedName) return;
      setIsAiThinking(true);
      try {
          const result = await smartFillComponent(editedName, editedType);
          if (result.description) setEditedDescription(result.description);
          if (result.pins) setEditedPins(result.pins.join(', '));
          if (result.type) setEditedType(result.type as any);
          if (result.datasheetUrl) setEditedDatasheetUrl(result.datasheetUrl);
      } catch (e) {
          alert("AI could not find details for this component.");
      } finally {
          setIsAiThinking(false);
      }
  };

  const handleSendChat = async (overrideInput?: string) => {
      const userMsg = overrideInput || chatInput;
      if (!userMsg.trim()) return;
      
      setChatInput('');
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
      setIsChatLoading(true);

      const currentData: Partial<ElectronicComponent> = {
          name: editedName,
          type: editedType,
          description: editedDescription,
          pins: editedPins.split(',').map(p => p.trim()).filter(p => p),
          datasheetUrl: editedDatasheetUrl,
          threeDModelUrl: editedThreeDModelUrl,
          imageUrl: editedImageUrl,
          quantity: editedQuantity
      };
      
      // Prepare history for API (simplified)
      const apiHistory = chatMessages.map(m => ({ role: m.role, text: m.text }));

      try {
          const { updates, reply, foundImages, suggestedActions } = await assistComponentEditor(apiHistory, currentData, userMsg);
          
          // Apply updates
          if (updates.name) setEditedName(updates.name);
          if (updates.type) setEditedType(updates.type as any);
          if (updates.description) setEditedDescription(updates.description);
          if (updates.pins) setEditedPins(updates.pins.join(', '));
          if (updates.datasheetUrl) setEditedDatasheetUrl(updates.datasheetUrl);
          if (updates.threeDModelUrl) setEditedThreeDModelUrl(updates.threeDModelUrl);
          if (updates.imageUrl) setEditedImageUrl(updates.imageUrl);
          if (updates.quantity !== undefined) setEditedQuantity(updates.quantity);

          setChatMessages(prev => [...prev, { 
              id: Date.now().toString(), 
              role: 'model', 
              text: reply,
              images: foundImages,
              actions: suggestedActions as any
          }]);
      } catch (e) {
          console.error(e);
          setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I had trouble searching for that information. Please try again." }]);
      } finally {
          setIsChatLoading(false);
      }
  };
  
  const handleAction = async (action: string) => {
      if (action === 'GENERATE_IMAGE') {
          setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: "Generate an image for this component." }]);
          handleGenerateThumbnail();
      } else if (action === 'GENERATE_3D') {
          setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: "Generate a 3D model code for this." }]);
          onGenerate3D();
          setActiveTab('3d');
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          const resized = await resizeImage(base64);
          setEditedImageUrl(resized);
      };
      reader.readAsDataURL(file);
  };
  
  const selectFoundImage = (url: string) => {
      setEditedImageUrl(url);
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: "Use this image." }]);
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Updated component image." }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-cyber-card border border-neon-cyan/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[85vh] md:max-h-[80vh] transition-all duration-300 ${showAiChat ? 'w-full max-w-4xl' : 'w-full max-w-2xl'}`} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 md:p-6 border-b border-slate-700 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            {editedImageUrl ? (
                <img src={editedImageUrl} alt="Thumbnail" className="w-10 h-10 md:w-12 md:h-12 rounded border border-slate-600 object-cover" />
            ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded border border-slate-600 bg-black flex items-center justify-center text-slate-500 font-mono font-bold text-xl">
                    {editedType.charAt(0).toUpperCase()}
                </div>
            )}
            <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 line-clamp-1">{component.name}</h3>
                <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-mono uppercase">{component.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="flex border-b border-slate-700 bg-slate-900/50 shrink-0 overflow-x-auto">
           <button onClick={() => setActiveTab('info')} className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${activeTab === 'info' ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/5' : 'border-transparent text-slate-400 hover:text-white'}`}>INFO</button>
           <button onClick={() => setActiveTab('edit')} className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${activeTab === 'edit' ? 'border-neon-green text-neon-green bg-neon-green/5' : 'border-transparent text-slate-400 hover:text-white'}`}>EDIT</button>
           <button onClick={() => setActiveTab('image')} className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${activeTab === 'image' ? 'border-neon-amber text-neon-amber bg-neon-amber/5' : 'border-transparent text-slate-400 hover:text-white'}`}>IMAGE</button>
           <button onClick={() => setActiveTab('3d')} className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${activeTab === '3d' ? 'border-neon-purple text-neon-purple bg-neon-purple/5' : 'border-transparent text-slate-400 hover:text-white'}`}>3D MODEL</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Main Content Area */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6`}>
            {activeTab === 'info' && (
                <>
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-slate-400 italic mb-4">{component.description}</p>
                    
                    {component.datasheetUrl && (
                        <a 
                        href={component.datasheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-neon-cyan hover:text-white mb-4 text-xs font-bold border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-2 rounded transition-colors"
                        >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        OPEN DATASHEET
                        </a>
                    )}

                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-200">{explanation}</div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-neon-cyan mb-3 font-mono">PINS</h4>
                    <div className="flex flex-wrap gap-2">
                        {component.pins && component.pins.length > 0 ? component.pins.map(pin => (
                        <span key={pin} className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-300">{pin}</span>
                        )) : <span className="text-slate-500 text-xs italic">No pins defined</span>}
                    </div>
                </div>
                </>
            )}

            {activeTab === 'edit' && (
                <div className="space-y-5">
                    {/* NAME + AI ASSIST */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-mono text-slate-500">NAME</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleAiAssist} 
                                    disabled={isAiThinking || !editedName}
                                    className="text-[10px] font-bold text-neon-cyan hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50 border border-neon-cyan/30 px-2 py-0.5 rounded bg-neon-cyan/5"
                                >
                                    {isAiThinking ? (
                                        <span className="animate-pulse">ANALYZING...</span>
                                    ) : (
                                        <>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            AUTO-FILL
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={() => setShowAiChat(!showAiChat)} 
                                    className={`text-[10px] font-bold flex items-center gap-1 transition-colors border px-2 py-0.5 rounded ${showAiChat ? 'bg-neon-purple text-white border-neon-purple' : 'text-neon-purple hover:text-white border-neon-purple/30 bg-neon-purple/5'}`}
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                    AI ASSISTANT
                                </button>
                            </div>
                        </div>
                        <input 
                        type="text" 
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
                    />
                    </div>

                    {/* TYPE & QUANTITY */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-mono text-slate-500 mb-1">TYPE</label>
                            <select 
                                value={editedType}
                                onChange={(e) => setEditedType(e.target.value as any)}
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
                            <label className="block text-xs font-mono text-slate-500 mb-1">QUANTITY</label>
                            <input 
                            type="number"
                            min="0"
                            value={editedQuantity}
                            onChange={(e) => setEditedQuantity(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">DESCRIPTION</label>
                    <textarea 
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none h-24 resize-none transition-all"
                        placeholder="Enter a description for this component..."
                    />
                    </div>

                    {/* PINS */}
                    <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">PINS (Comma separated)</label>
                    <input 
                        type="text" 
                        value={editedPins}
                        onChange={(e) => setEditedPins(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none font-mono text-sm"
                        placeholder="VCC, GND, D1, D2..."
                    />
                    </div>

                    {/* IMAGE URL */}
                    <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">IMAGE URL</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={editedImageUrl}
                            onChange={(e) => setEditedImageUrl(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                            placeholder="https://example.com/image.png"
                        />
                        <button 
                            onClick={handleGenerateThumbnail}
                            disabled={isGeneratingImage || !editedName}
                            className="bg-neon-amber/10 border border-neon-amber/50 text-neon-amber w-10 h-full rounded hover:bg-neon-amber hover:text-black disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
                            title="Auto-generate AI Thumbnail"
                        >
                            {isGeneratingImage ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                        </button>
                    </div>
                    </div>

                    {/* DATASHEET URL */}
                    <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">DATASHEET URL</label>
                    <input 
                        type="url" 
                        value={editedDatasheetUrl}
                        onChange={(e) => setEditedDatasheetUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                        placeholder="https://example.com/datasheet.pdf"
                    />
                    </div>

                    {/* 3D MODEL URL */}
                    <div>
                    <label className="block text-xs font-mono text-slate-500 mb-1">3D MODEL URL (GLB/GLTF)</label>
                    <input 
                        type="url" 
                        value={editedThreeDModelUrl}
                        onChange={(e) => setEditedThreeDModelUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                        placeholder="https://example.com/model.glb"
                    />
                    </div>

                    <div className="pt-4">
                        <button 
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`w-full font-bold py-3 rounded transition-all shadow-lg transform active:scale-[0.98] ${hasChanges 
                            ? 'bg-neon-green text-black hover:bg-green-400 shadow-[0_0_15px_rgba(0,255,157,0.3)] hover:shadow-[0_0_25px_rgba(0,255,157,0.5)]' 
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-70'}`}
                        >
                        {hasChanges ? 'SAVE CHANGES' : 'NO CHANGES'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'image' && (
                <div className="flex flex-col h-full gap-4">
                    <div className="bg-black/50 border border-slate-700 rounded-xl overflow-hidden aspect-square relative flex items-center justify-center max-h-[300px] mx-auto w-full">
                        {editedImageUrl ? (
                            <img src={editedImageUrl} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-slate-600 text-center p-4">
                                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="text-sm">No Image Available</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs text-slate-400 text-center">
                            Upload an image or generate one using AI for "<strong>{editedName}</strong>".
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-slate-800 text-slate-200 font-bold py-3 rounded hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs border border-slate-600 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                UPLOAD PHOTO
                            </button>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />

                            <button 
                                onClick={handleGenerateThumbnail}
                                disabled={isGeneratingImage || !editedName}
                                className="bg-neon-amber text-black font-bold py-3 rounded hover:bg-white transition-colors uppercase tracking-widest text-xs shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isGeneratingImage ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        GENERATING...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        GENERATE AI
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === '3d' && (
                <div className="flex flex-col h-full min-h-[300px] md:min-h-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-neon-purple font-mono">INTERACTIVE 3D VIEW</h4>
                    <button 
                        onClick={onGenerate3D}
                        disabled={isGenerating3D}
                        className="text-xs bg-slate-800 border border-slate-600 hover:border-neon-purple hover:text-neon-purple px-3 py-1 rounded transition-colors disabled:opacity-50"
                    >
                        {isGenerating3D ? 'GENERATING...' : component.threeCode ? 'REGENERATE' : 'GENERATE 3D MODEL'}
                    </button>
                </div>
                <div className="flex-1 bg-black rounded-xl overflow-hidden border border-slate-700 relative">
                    {(component.threeCode || component.threeDModelUrl) && !isGenerating3D ? (
                        <ThreeViewer code={component.threeCode} modelUrl={component.threeDModelUrl} />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-slate-600 p-4 text-center">
                            {isGenerating3D ? (
                            <>
                                <div className="w-8 h-8 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-neon-purple font-mono animate-pulse">Constructing Geometry...</span>
                            </>
                            ) : (
                            <>
                                <p className="text-sm">Click GENERATE to build a 3D model</p>
                            </>
                            )}
                        </div>
                    )}
                </div>
                </div>
            )}
            </div>

            {/* AI CHAT SIDE PANEL */}
            {showAiChat && (
                <div className="w-80 border-l border-slate-700 bg-slate-900/50 flex flex-col animate-fade-in-right">
                    <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                        <h4 className="text-xs font-bold text-neon-purple font-mono flex items-center gap-2">
                             <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></div>
                             AI ASSISTANT
                        </h4>
                        <button onClick={() => setShowAiChat(false)} className="text-slate-500 hover:text-white">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-950/30">
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] text-xs p-2 rounded mb-1 ${msg.role === 'user' ? 'bg-neon-purple/20 text-slate-200 border border-neon-purple/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                                    {msg.text}
                                </div>
                                
                                {/* Render Found Images */}
                                {msg.images && msg.images.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto max-w-[85%] pb-1 scrollbar-hide">
                                        {msg.images.map((img, i) => (
                                            <div key={i} className="flex-shrink-0 w-16 h-16 rounded border border-slate-600 overflow-hidden cursor-pointer hover:border-neon-cyan relative group" onClick={() => selectFoundImage(img)}>
                                                <img src={img} alt="Found" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
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
                                                onClick={() => handleAction(action)}
                                                className="text-[10px] bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan px-2 py-1 rounded hover:bg-neon-cyan hover:text-black transition-colors"
                                            >
                                                {action.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 p-2 rounded border border-slate-700 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-3 border-t border-slate-700 bg-slate-900">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                                placeholder="Edit pins, description..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-white focus:outline-none focus:border-neon-purple"
                                disabled={isChatLoading}
                            />
                            <button 
                                onClick={() => handleSendChat()}
                                disabled={!chatInput.trim() || isChatLoading}
                                className="absolute right-1 top-1 p-1 text-slate-400 hover:text-neon-purple disabled:opacity-30"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
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

export default ComponentEditorModal;