import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { LiveSession } from '../services/liveAudio';
import { transcribeAudio } from '../services/geminiService';
import { useToast } from '../hooks/useToast';

interface VoiceAssistantContextType {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  isProcessingAudio: boolean;
  loadingText: string; // "Transcribing...", "Thinking..."
  
  isLiveActive: boolean;
  liveStatus: string;
  toggleLiveMode: () => Promise<void>;
  
  registerVisualContextProvider: (id: string, provider: () => Promise<Blob | null>) => void;
  unregisterVisualContextProvider: (id: string) => void;
  
  // Event for when a transcription is ready
  lastTranscription: string | null;
  clearTranscription: () => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = useToast();
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [lastTranscription, setLastTranscription] = useState<string | null>(null);

  // Live Mode State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState('disconnected');
  const liveSessionRef = useRef<LiveSession | null>(null);
  
  // Visual Context
  const visualContextProvidersRef = useRef<Map<string, () => Promise<Blob | null>>>(new Map());

  const registerVisualContextProvider = useCallback((id: string, provider: () => Promise<Blob | null>) => {
    visualContextProvidersRef.current.set(id, provider);
    // Update live session if active
    if (liveSessionRef.current) {
      liveSessionRef.current.setVisualContextProviders(Array.from(visualContextProvidersRef.current.values()));
    }
  }, []);

  const unregisterVisualContextProvider = useCallback((id: string) => {
    visualContextProvidersRef.current.delete(id);
    // Update live session if active
    if (liveSessionRef.current) {
      liveSessionRef.current.setVisualContextProviders(Array.from(visualContextProvidersRef.current.values()));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
      }
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
      }
    };
  }, []);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(message);
      toast.error('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsRecording(false);
        setLoadingText('Transcribing...');
        setIsProcessingAudio(true);

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const transcription = await transcribeAudio(base64Audio);
            setIsProcessingAudio(false);
            setLoadingText('');
            
            if (transcription && transcription.trim()) {
              setLastTranscription(transcription.trim());
            } else {
              toast.warning('No speech detected.');
            }
          };
        } catch (_e: unknown) {
          toast.error('Transcription failed.');
          setIsProcessingAudio(false);
          setLoadingText('');
        }
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.stop();
    }
  };

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

      if (visualContextProvidersRef.current.size > 0) {
        liveSessionRef.current.setVisualContextProviders(Array.from(visualContextProvidersRef.current.values()));
      }

      await liveSessionRef.current.connect();
    }
  };
  
  const clearTranscription = () => setLastTranscription(null);

  return (
    <VoiceAssistantContext.Provider value={{
      isRecording,
      startRecording,
      stopRecording,
      isProcessingAudio,
      loadingText,
      isLiveActive,
      liveStatus,
      toggleLiveMode,
      registerVisualContextProvider,
      unregisterVisualContextProvider,
      lastTranscription,
      clearTranscription
    }}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (context === undefined) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};
