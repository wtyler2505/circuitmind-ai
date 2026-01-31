import { gitService } from './gitService';
import { WiringDiagram, ElectronicComponent } from '../types';

export interface PeerNode {
  deviceId: string;
  name: string;
  lastIp: string;
  pairingStatus: 'paired' | 'pending' | 'blocked';
  lastSyncHash: string;
}

class SyncService {
  /**
   * Serializes current state and commits to local git.
   */
  async snapshot(data: {
    diagram: WiringDiagram | null;
    inventory: ElectronicComponent[];
  }) {
    try {
      if (data.diagram) {
        await gitService.writeFile('diagram.json', JSON.stringify(data.diagram, null, 2));
      }
      await gitService.writeFile('inventory.json', JSON.stringify(data.inventory, null, 2));
      
      const sha = await gitService.commit(`Auto-snapshot: ${new Date().toISOString()}`);
      return sha;
    } catch (e) {
      console.error('Snapshot failed', e);
      return null;
    }
  }

  /**
   * Pushes local history to a peer.
   */
  async pushToPeer(peer: PeerNode) {
    const url = `http://${peer.lastIp}:3000/git`; // Assuming a local bridge
    try {
      await gitService.push(url);
    } catch (e) {
      console.error(`Failed to push to ${peer.name}`, e);
      throw e;
    }
  }

  /**
   * Pulls history from a peer and updates local state.
   */
  async pullFromPeer(peer: PeerNode) {
    const url = `http://${peer.lastIp}:3000/git`;
    try {
      await gitService.pull(url);
      
      // After pull, we might need to refresh the UI
      const diagramJson = await gitService.readFile('diagram.json');
      const inventoryJson = await gitService.readFile('inventory.json');
      
      return {
        diagram: JSON.parse(diagramJson),
        inventory: JSON.parse(inventoryJson)
      };
    } catch (e) {
      console.error(`Failed to pull from ${peer.name}`, e);
      throw e;
    }
  }

  /**
   * Reconstructs state from git history.
   */
  async getHistory() {
    return await gitService.log();
  }
}

export const syncService = new SyncService();
