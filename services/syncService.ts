import { gitService } from './gitService';
import { WiringDiagram, ElectronicComponent } from '../types';

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
      console.log(`State snapshotted: ${sha}`);
      return sha;
    } catch (e) {
      console.error('Snapshot failed', e);
      return null;
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
