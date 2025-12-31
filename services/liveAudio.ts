import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// Audio configuration constants
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

// Helper for Base64 encoding/decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert Float32 audio from microphone to PCM16 Base64 for the model
function pcm16BlobFromFloat32(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Decode Raw PCM16 Base64 from model to AudioBuffer for playback
async function audioBufferFromPcm16(
  base64Data: string, 
  ctx: AudioContext
): Promise<AudioBuffer> {
  const bytes = decode(base64Data);
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, OUTPUT_SAMPLE_RATE);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export class LiveSession {
  private ai: GoogleGenAI;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private outputNode: GainNode | null = null;
  private session: any = null;
  private nextStartTime = 0;
  private audioSources = new Set<AudioBufferSourceNode>();
  private onStatusChange: (status: string) => void;

  constructor(onStatusChange: (status: string) => void) {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.onStatusChange = onStatusChange;
  }

  async connect() {
    try {
      this.onStatusChange('connecting');

      // Initialize Audio Contexts
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      
      this.outputNode = this.outputContext.createGain();
      this.outputNode.connect(this.outputContext.destination);

      // Get User Media
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to Gemini Live
      const sessionPromise = this.ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are CircuitMind, an advanced electronics AI assistant. Be concise, helpful, and technical. You are talking to a user building circuits.",
        },
        callbacks: {
          onopen: () => {
            this.onStatusChange('active');
            this.startAudioInput(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            this.handleServerMessage(message);
          },
          onclose: () => {
            this.onStatusChange('disconnected');
            this.cleanup();
          },
          onerror: (e) => {
            console.error(e);
            this.onStatusChange('error');
            this.cleanup();
          }
        }
      });
      
      this.session = await sessionPromise;

    } catch (error) {
      console.error("Failed to connect live session", error);
      this.onStatusChange('error');
      this.cleanup();
    }
  }

  private startAudioInput(sessionPromise: Promise<any>) {
    if (!this.inputContext || !this.stream) return;

    this.source = this.inputContext.createMediaStreamSource(this.stream);
    // Use deprecated ScriptProcessor for raw audio access (standard in this context)
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = pcm16BlobFromFloat32(inputData);
      
      sessionPromise.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputContext.destination);
  }

  private async handleServerMessage(message: LiveServerMessage) {
    const serverContent = message.serverContent;

    if (serverContent?.interrupted) {
       this.audioSources.forEach(source => source.stop());
       this.audioSources.clear();
       this.nextStartTime = 0;
       return;
    }

    const base64Audio = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio && this.outputContext && this.outputNode) {
      const audioBuffer = await audioBufferFromPcm16(base64Audio, this.outputContext);
      
      // Schedule playback
      this.nextStartTime = Math.max(this.outputContext.currentTime, this.nextStartTime);
      
      const source = this.outputContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputNode);
      source.start(this.nextStartTime);
      
      this.nextStartTime += audioBuffer.duration;
      
      this.audioSources.add(source);
      source.onended = () => {
        this.audioSources.delete(source);
      };
    }
  }

  async disconnect() {
    if (this.session) {
      // session.close() is not always available on the interface, 
      // but closing underlying resources stops the flow.
      try {
         // @ts-ignore
         this.session.close && this.session.close();
      } catch (e) { /* ignore */ }
    }
    this.cleanup();
    this.onStatusChange('disconnected');
  }

  private cleanup() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.processor?.disconnect();
    this.source?.disconnect();
    this.inputContext?.close();
    this.outputContext?.close();
    
    this.stream = null;
    this.processor = null;
    this.source = null;
    this.inputContext = null;
    this.outputContext = null;
    this.session = null;
    this.audioSources.forEach(s => s.stop());
    this.audioSources.clear();
  }
}
