import { PeerNode } from './syncService';

class PeerDiscoveryService {
  private peers: PeerNode[] = [];

  constructor() {
    this.loadPeers();
  }

  private loadPeers() {
    try {
      const saved = localStorage.getItem('cm_peers');
      if (saved) this.peers = JSON.parse(saved);
    } catch (e) {
      this.peers = [];
    }
  }

  private savePeers() {
    localStorage.setItem('cm_peers', JSON.stringify(this.peers));
  }

  getPeers(): PeerNode[] {
    return this.peers;
  }

  addPeer(ip: string, name: string): PeerNode {
    const newPeer: PeerNode = {
      deviceId: `device-${Math.random().toString(36).substr(2, 9)}`,
      name,
      lastIp: ip,
      pairingStatus: 'pending',
      lastSyncHash: ''
    };
    
    this.peers.push(newPeer);
    this.savePeers();
    return newPeer;
  }

  removePeer(deviceId: string) {
    this.peers = this.peers.filter(p => p.deviceId !== deviceId);
    this.savePeers();
  }

  /**
   * Pings all known peers to see who is online.
   */
  async discover() {
    const onlinePeers: PeerNode[] = [];
    
    for (const peer of this.peers) {
      try {
        const response = await fetch(`http://${peer.lastIp}:3000/ping`, { timeout: 2000 } as any);
        if (response.ok) onlinePeers.push(peer);
      } catch (e) {
        // Peer offline
      }
    }
    
    return onlinePeers;
  }
}

export const peerDiscoveryService = new PeerDiscoveryService();
