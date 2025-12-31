import React, { useState, useEffect, useRef } from 'react';
import DiagramCanvas from './components/DiagramCanvas';
import Inventory from './components/Inventory';
import ComponentEditorModal from './components/ComponentEditorModal';
import { ElectronicComponent, WiringDiagram, ChatMessage } from './types';
import { 
  generateWiringDiagram, 
  explainComponent, 
  generateEditedImage, 
  generateCircuitVideo, 
  chatWithAI, 
  generateConceptImage,
  transcribeAudio,
  generateSpeech,
  generateComponent3DCode
} from './services/geminiService';
import { LiveSession } from './services/liveAudio';

const INITIAL_INVENTORY: ElectronicComponent[] = [
  { id: '1', name: 'ESP32 DevKit V1', type: 'microcontroller', description: 'Powerful WiFi+BT MCU', pins: ['GND', 'VCC', 'D2', 'D4', 'RX', 'TX', 'D5', 'D18', 'D19', 'D21', 'D22', 'D23'], quantity: 2 },
  { 
    id: '2', 
    name: 'Arduino Uno', 
    type: 'microcontroller', 
    description: 'Classic beginner board', 
    pins: ['GND', '5V', '3.3V', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'], 
    quantity: 1,
    threeDModelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb'
  },
  { id: '3', name: 'DHT11', type: 'sensor', description: 'Temp & Humidity', pins: ['VCC', 'GND', 'DATA'], quantity: 5 },
  { id: '4', name: 'SG90 Servo', type: 'actuator', description: 'Micro servo motor', pins: ['GND', 'VCC', 'PWM'], quantity: 3 },
];

export default function App() {
  // Persistence: Inventory
  const [inventory, setInventory] = useState<ElectronicComponent[]>(() => {
    try {
      const saved = localStorage.getItem('cm_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch (e: any) {
      console.error(e.message);
      return INITIAL_INVENTORY;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_inventory', JSON.stringify(inventory));
  }, [inventory]);
  
  // Undo/Redo State & Persistence: Diagram
  const [history, setHistory] = useState<{
    past: WiringDiagram[];
    present: WiringDiagram | null;
    future: WiringDiagram[];
  }>(() => {
    let savedPresent = null;
    try {
       const saved = localStorage.getItem('cm_autosave');
       if (saved) savedPresent = JSON.parse(saved);
    } catch (e: any) {
       console.error(e.message);
    }
    return {
      past: [],
      present: savedPresent,
      future: []
    };
  });

  // Auto-save Diagram
  useEffect(() => {
    if (history.present) {
      localStorage.setItem('cm_autosave', JSON.stringify(history.present));
    }
  }, [history.present]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing...');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ElectronicComponent | null>(null);
  const [modalContent, setModalContent] = useState<string>('');
  
  // 3D Gen State
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [generate3DError, setGenerate3DError] = useState<string | null>(null);
  
  // Attachments
  const [attachment, setAttachment] = useState<{data: string, type: 'image' | 'video'} | null>(null);
  
  // New State for Mode and Configuration
  const [generationMode, setGenerationMode] = useState<'chat' | 'image' | 'video'>('chat');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  
  // Feature Toggles
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Voice Mode State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState('disconnected');
  const liveSessionRef = useRef<LiveSession | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'model',
        content: "System Online. I am CircuitMind AI. \n\nI can generate wiring diagrams, create concept art, analyze your circuit photos/videos, or answer complex questions.",
        timestamp: Date.now()
      }]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  // Clean up live session on unmount
  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
      }
    };
  }, []);

  const toggleLiveMode = async () => {
    if (isLiveActive) {
      liveSessionRef.current?.disconnect();
      setIsLiveActive(false);
    } else {
      setIsLiveActive(true);
      liveSessionRef.current = new LiveSession((status) => {
        setLiveStatus(status);
        if (status === 'disconnected' || status === 'error') {
          setIsLiveActive(false);
        }
      });
      await liveSessionRef.current.connect();
    }
  };

  const updateDiagram = (newDiagram: WiringDiagram | null) => {
    setHistory(curr => {
        if (curr.present === newDiagram) return curr;
        return {
            past: curr.present ? [...curr.past, curr.present] : curr.past,
            present: newDiagram,
            future: []
        };
    });
  };

  const handleDiagramChange = (updatedDiagram: WiringDiagram) => {
    updateDiagram(updatedDiagram);
  };

  const handleUndo = () => {
      setHistory(curr => {
          if (curr.past.length === 0) return curr;
          const previous = curr.past[curr.past.length - 1];
          const newPast = curr.past.slice(0, -1);
          return {
              past: newPast,
              present: previous,
              future: curr.present ? [curr.present, ...curr.future] : curr.future
          };
      });
  };

  const handleRedo = () => {
      setHistory(curr => {
          if (curr.future.length === 0) return curr;
          const next = curr.future[0];
          const newFuture = curr.future.slice(1);
          return {
              past: curr.present ? [...curr.past, curr.present] : curr.past,
              present: next,
              future: newFuture
          };
      });
  };

  // Drag and Drop Logic: Inventory -> Canvas
  const handleComponentDrop = (component: ElectronicComponent, x: number, y: number) => {
      // 1. Create a unique copy for the diagram
      const newInstance: ElectronicComponent = {
          ...component,
          id: `${component.id}-${Date.now()}` // Ensure unique ID in diagram
      };

      // 2. Initialize diagram if empty, or append
      const currentDiagram = history.present || {
          title: 'Untitled Circuit',
          components: [],
          connections: [],
          explanation: 'Start connecting components!'
      };

      const newDiagram = {
          ...currentDiagram,
          components: [...currentDiagram.components, newInstance]
      };
      
      updateDiagram(newDiagram);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setAttachment({ data: reader.result as string, type });
        if(generationMode === 'video' && type === 'image') { 
        } else if (generationMode !== 'image') {
          setGenerationMode('chat');
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error(err.message);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsRecording(false);
        setLoadingText("Transcribing...");
        setIsLoading(true);
        
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const transcription = await transcribeAudio(base64Audio);
            setInput(prev => (prev ? prev + " " + transcription : transcription));
            setIsLoading(false);
          };
        } catch (e: any) {
          console.error(e.message);
          setIsLoading(false);
        }
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.stop();
    }
  };

  const playTTS = async (msg: ChatMessage) => {
    try {
      if (msg.audioResponse) {
        const audio = new Audio("data:audio/mp3;base64," + msg.audioResponse);
        audio.play();
      } else {
        const audioBase64 = await generateSpeech(msg.content);
        msg.audioResponse = audioBase64; 
        const audio = new Audio("data:audio/mp3;base64," + audioBase64);
        audio.play();
      }
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const saveDiagram = () => {
    if (!history.present) return;
    const data = {
      diagram: history.present,
      timestamp: Date.now()
    };
    // Manual save still uses the 'savedDiagram' key as a "Quick Save" slot
    localStorage.setItem('savedDiagram', JSON.stringify(data));
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: '✅ Diagram saved to Quick Save slot.',
      timestamp: Date.now()
    }]);
  };

  const loadDiagram = () => {
    const saved = localStorage.getItem('savedDiagram');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.diagram) {
            updateDiagram(parsed.diagram);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: `✅ Loaded diagram from ${new Date(parsed.timestamp).toLocaleTimeString()}`,
                timestamp: Date.now()
            }]);
        }
      } catch (e) {
        console.error("Failed to load", e);
      }
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      image: attachment?.type === 'image' ? attachment.data : undefined,
      video: attachment?.type === 'video' ? attachment.data : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);
    setLoadingText('Thinking...');

    try {
        if (generationMode === 'image') {
            setLoadingText('Generating Image...');
            let imgData = "";
            if (userMsg.image) {
                imgData = await generateEditedImage(userMsg.image, userMsg.content);
            } else {
                imgData = await generateConceptImage(userMsg.content, imageSize, aspectRatio);
            }
            
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                content: `Generated image for "${userMsg.content}"`,
                timestamp: Date.now(),
                image: imgData
            }]);
        } 
        else if (generationMode === 'video') {
            setLoadingText('Generating Video...');
            const videoUrl = await generateCircuitVideo(userMsg.content, aspectRatio as any, userMsg.image);
            
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                content: `Video generated for "${userMsg.content}"`,
                timestamp: Date.now(),
                video: videoUrl
            }]);
        }
        else {
            const isDiagramRequest = userMsg.content.toLowerCase().includes('diagram') || userMsg.content.toLowerCase().includes('circuit');
            
            if (isDiagramRequest) {
                 setLoadingText('Designing Circuit...');
                 const diagram = await generateWiringDiagram(userMsg.content, inventory);
                 updateDiagram(diagram);
                 
                 setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    content: `Here is the wiring diagram for: ${diagram.title}.`,
                    timestamp: Date.now(),
                    diagramData: diagram
                 }]);
            } else {
                 setLoadingText('Analyzing...');
                 const { text, groundingSources } = await chatWithAI(
                     userMsg.content, 
                     messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
                     userMsg.image || userMsg.video,
                     userMsg.video ? 'video' : 'image',
                     useDeepThinking
                 );
                 
                 setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    content: text,
                    timestamp: Date.now(),
                    groundingSources
                 }]);
            }
        }
    } catch (error: any) {
        console.error(error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: `Error: ${error.message}`,
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
        setLoadingText('');
    }
  };

  const handleComponentClick = async (component: ElectronicComponent) => {
     setSelectedComponent(component);
     const explain = await explainComponent(component.name);
     setModalContent(explain);
  };

  const handleGenerate3D = async () => {
      if (!selectedComponent) return;
      setIsGenerating3D(true);
      setGenerate3DError(null);
      try {
          // Fix: Passed selectedComponent.type as 2nd argument
          const code = await generateComponent3DCode(selectedComponent.name, selectedComponent.type);
          const updated = { ...selectedComponent, threeCode: code };
          setSelectedComponent(updated);
          setInventory(prev => prev.map(c => c.id === updated.id ? updated : c));
      } catch (e: any) {
          setGenerate3DError(e.message);
      } finally {
          setIsGenerating3D(false);
      }
  };

  return (
    <div className="flex h-screen w-screen bg-cyber-dark text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar: Inventory */}
      <Inventory 
        items={inventory} 
        onAddItem={(item) => setInventory([...inventory, item])}
        onRemoveItem={(id) => setInventory(inventory.filter(i => i.id !== id))}
        onSelect={handleComponentClick}
        onUpdateItem={(item) => setInventory(inventory.map(i => i.id === item.id ? item : i))}
        isOpen={isInventoryOpen}
        toggleOpen={() => setIsInventoryOpen(!isInventoryOpen)}
        onOpen={() => setIsInventoryOpen(true)}
        onClose={() => setIsInventoryOpen(false)}
        onDeleteMany={(ids) => setInventory(inventory.filter(i => !ids.includes(i.id)))}
        onUpdateMany={(items) => {
            const updates = new Map(items.map(i => [i.id, i]));
            setInventory(inventory.map(i => updates.get(i.id) || i));
        }}
      />

      {/* Main Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isInventoryOpen ? 'ml-[360px]' : 'ml-0'}`}>
        
        {/* Toolbar */}
        <div className="h-14 bg-slate-900/80 backdrop-blur border-b border-slate-700 flex items-center justify-between px-4 shrink-0 z-20">
             <div className="flex items-center gap-4">
                 <h1 className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
                     <span className="text-neon-cyan text-2xl">⚡</span>
                     CIRCUIT<span className="text-neon-cyan">MIND</span>
                 </h1>
                 
                 <div className="h-6 w-px bg-slate-700 mx-2"></div>

                 <div className="flex gap-1">
                     <button onClick={handleUndo} disabled={history.past.length === 0} className="p-2 hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30" title="Undo">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                     </button>
                     <button onClick={handleRedo} disabled={history.future.length === 0} className="p-2 hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30" title="Redo">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                     </button>
                 </div>

                 <div className="h-6 w-px bg-slate-700 mx-2"></div>

                 <div className="flex gap-2">
                    <button onClick={saveDiagram} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-bold text-neon-green">SAVE</button>
                    <button onClick={loadDiagram} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-bold text-neon-purple">LOAD</button>
                 </div>
             </div>
             
             <div className="flex items-center gap-4">
                 {isLiveActive && (
                     <div className="flex items-center gap-2 text-red-500 animate-pulse bg-red-900/20 px-3 py-1 rounded-full border border-red-500/50">
                         <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                         <span className="text-xs font-bold uppercase tracking-widest">{liveStatus}</span>
                     </div>
                 )}
                 <button 
                    onClick={toggleLiveMode}
                    className={`p-2 rounded-full border transition-all ${isLiveActive ? 'bg-red-500 text-white border-red-400' : 'bg-slate-800 text-slate-400 border-slate-600 hover:text-white'}`}
                    title="Live Voice Mode"
                 >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                 </button>
             </div>
        </div>

        {/* Diagram Canvas */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden">
            <DiagramCanvas 
                diagram={history.present} 
                onComponentClick={handleComponentClick}
                onDiagramUpdate={handleDiagramChange}
                onComponentDrop={handleComponentDrop}
            />
        </div>

        {/* Chat / Controls Overlay */}
        <div className="h-[320px] bg-slate-900 border-t border-neon-cyan/30 flex flex-col shrink-0 relative z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl p-3 ${msg.role === 'user' ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-slate-200' : 'bg-slate-800 border border-slate-700 text-slate-300'}`}>
                            {msg.image && (
                                <img src={msg.image} alt="attachment" className="max-w-[200px] rounded mb-2 border border-slate-600" />
                            )}
                            {msg.video && (
                                <video src={msg.video} controls className="max-w-[300px] rounded mb-2 border border-slate-600" />
                            )}
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                            {msg.groundingSources && msg.groundingSources.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700/50 flex flex-wrap gap-2">
                                    {msg.groundingSources.map((source, idx) => (
                                        <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-black/30 px-2 py-1 rounded text-neon-cyan hover:underline truncate max-w-[150px]">
                                            {source.title}
                                        </a>
                                    ))}
                                </div>
                            )}
                            {msg.role === 'model' && (
                                <div className="mt-2 flex gap-2 justify-end opacity-50 hover:opacity-100 transition-opacity">
                                    <button onClick={() => playTTS(msg)} className="text-slate-400 hover:text-neon-cyan"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg></button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-700">
                             <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-75"></div>
                             <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce delay-150"></div>
                             <span className="text-xs text-neon-cyan font-mono animate-pulse">{loadingText}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-end">
                {/* Mode Selector */}
                <div className="flex flex-col gap-1 shrink-0">
                    <select 
                        value={generationMode} 
                        onChange={(e) => setGenerationMode(e.target.value as any)}
                        className="bg-slate-900 text-xs text-slate-300 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-neon-cyan"
                    >
                        <option value="chat">CHAT / DIAGRAM</option>
                        <option value="image">GENERATE IMAGE</option>
                        <option value="video">GENERATE VIDEO</option>
                    </select>
                    {generationMode === 'chat' && (
                       <label className="flex items-center gap-1 cursor-pointer">
                           <input type="checkbox" checked={useDeepThinking} onChange={e => setUseDeepThinking(e.target.checked)} className="rounded border-slate-700 bg-slate-900 text-neon-cyan" />
                           <span className="text-[10px] text-slate-500 uppercase font-bold">Deep Think</span>
                       </label>
                    )}
                </div>

                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded relative">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    {attachment && <span className="absolute top-1 right-1 w-2 h-2 bg-neon-cyan rounded-full"></span>}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                
                <button 
                    onMouseDown={startRecording} 
                    onMouseUp={stopRecording} 
                    onMouseLeave={stopRecording}
                    className={`p-2 rounded transition-colors ${isRecording ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>

                <div className="flex-1 relative">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={generationMode === 'image' ? "Describe the component image..." : generationMode === 'video' ? "Describe the circuit video..." : "Ask about electronics or describe a circuit..."}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan resize-none h-10 min-h-[40px] max-h-[100px]"
                    />
                </div>
                
                <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || (!input.trim() && !attachment)}
                    className="bg-neon-cyan text-black p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </div>
        </div>

        {/* Modal */}
        {selectedComponent && (
            <ComponentEditorModal 
                component={selectedComponent}
                onClose={() => setSelectedComponent(null)}
                onSave={(updated) => {
                    setInventory(inventory.map(i => i.id === updated.id ? updated : i));
                    updateDiagram(history.present ? {
                        ...history.present,
                        components: history.present.components.map(c => c.id === updated.id ? updated : c)
                    } : null);
                    setSelectedComponent(null);
                }}
                explanation={modalContent}
                isGenerating3D={isGenerating3D}
                onGenerate3D={handleGenerate3D}
            />
        )}
      </div>
    </div>
  );
}