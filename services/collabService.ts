import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WiringDiagram } from '../types';

class CollabService {
  private doc: Y.Doc | null = null;
  private provider: WebrtcProvider | null = null;
  private sharedDiagram: Y.Map<any> | null = null;

  /**
   * Joins a collaboration room.
   */
  joinRoom(roomId: string, onUpdate: (diagram: WiringDiagram) => void) {
    this.leaveRoom();

    this.doc = new Y.Doc();
    this.provider = new WebrtcProvider(roomId, this.doc, {
      signaling: ['ws://localhost:4444'] // Use local signaling if available, or public fallback
    });

    this.sharedDiagram = this.doc.getMap('diagram');
    
    this.sharedDiagram.observe(() => {
      const diagram = this.sharedDiagram?.toJSON() as WiringDiagram;
      if (diagram) onUpdate(diagram);
    });

    console.log(`Joined collaboration room: ${roomId}`);
  }

  /**
   * Updates the shared diagram state.
   */
  updateSharedState(diagram: WiringDiagram) {
    if (!this.sharedDiagram) return;
    
    this.doc?.transact(() => {
      // Deep merge or replace
      for (const [key, value] of Object.entries(diagram)) {
        this.sharedDiagram?.set(key, value);
      }
    });
  }

  leaveRoom() {
    this.provider?.destroy();
    this.doc?.destroy();
    this.provider = null;
    this.doc = null;
    this.sharedDiagram = null;
  }

  getPresence() {
    return this.provider?.awareness;
  }
}

export const collabService = new CollabService();
