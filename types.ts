export interface ElectronicComponent {
  id: string;
  name: string;
  type: 'microcontroller' | 'sensor' | 'actuator' | 'power' | 'other';
  description: string;
  pins?: string[];
  quantity?: number; // New field
  lowStock?: boolean; // New field for bulk actions
  datasheetUrl?: string; // New field for documentation
  imageUrl?: string;
  threeCode?: string; // Generated javascript code for Three.js mesh
  threeDModelUrl?: string; // URL to a GLB/GLTF model
}

export interface WireConnection {
  fromComponentId: string;
  fromPin: string;
  toComponentId: string;
  toPin: string;
  description: string;
  color?: string;
}

export interface WiringDiagram {
  title: string;
  components: ElectronicComponent[];
  connections: WireConnection[];
  explanation: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  diagramData?: WiringDiagram;
  image?: string; // Base64 string of the image
  video?: string; // URL of the generated video
  groundingSources?: GroundingSource[];
  audioResponse?: string; // Base64 audio string for TTS
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}