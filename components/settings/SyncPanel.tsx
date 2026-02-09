import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { peerDiscoveryService } from '../../services/peerDiscoveryService';
import { syncService, PeerNode } from '../../services/syncService';

export const SyncPanel: React.FC = () => {
  const [peers, setPeers] = useState<PeerNode[]>([]);
  const [newPeerIp, setNewPeerIp] = useState('');
  const [newPeerName, setNewPeerName] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setPeers(peerDiscoveryService.getPeers());
  }, []);

  const handleAddPeer = () => {
    if (newPeerIp && newPeerName) {
      peerDiscoveryService.addPeer(newPeerIp, newPeerName);
      setPeers(peerDiscoveryService.getPeers());
      setNewPeerIp('');
      setNewPeerName('');
    }
  };

  const handleRemovePeer = (id: string) => {
    peerDiscoveryService.removePeer(id);
    setPeers(peerDiscoveryService.getPeers());
  };

  const handlePush = async (peer: PeerNode) => {
    setIsSyncing(true);
    try {
      await syncService.pushToPeer(peer);
      alert(`Pushed to ${peer.name}`);
    } catch (e) {
      alert(`Push failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePull = async (peer: PeerNode) => {
    setIsSyncing(true);
    try {
      const data = await syncService.pullFromPeer(peer);
      alert(`Pulled from ${peer.name}. Reloading state...`);
      // In a real app, we'd update context/state here
    } catch (e) {
      alert(`Pull failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Mock pairing key/QR data
  const pairingData = JSON.stringify({
    deviceId: 'master-station',
    ip: '192.168.1.50',
    key: '7788-9900'
  });

  return (
    <div className="flex flex-col h-full bg-[#020203] p-4 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Local ID & QR */}
      <div className="bg-slate-900/80 border border-white/5 p-4 cut-corner-md flex gap-6 items-center">
        <div className="flex-1 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em]">Local Identification</h3>
          <p className="text-[10px] text-slate-500 font-mono">ID: MASTER-STATION-01</p>
          <p className="text-[10px] text-slate-500 font-mono">STATUS: BROADCASTING...</p>
          <div className="pt-2">
            <span className="text-[9px] px-2 py-0.5 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-bold uppercase tracking-widest cut-corner-sm">
              Local-Only Mode
            </span>
          </div>
        </div>
        <div className="bg-white p-2 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <QRCodeSVG value={pairingData} size={80} level="M" />
        </div>
      </div>

      {/* Add Peer */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">Pair New Device</h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Device Name..." 
            value={newPeerName}
            onChange={e => setNewPeerName(e.target.value)}
            className="flex-1 bg-black border border-slate-700 cut-corner-sm px-3 py-2 text-[11px] text-white focus:border-neon-cyan focus:outline-none"
          />
          <input 
            type="text" 
            placeholder="IP Address..." 
            value={newPeerIp}
            onChange={e => setNewPeerIp(e.target.value)}
            className="flex-1 bg-black border border-slate-700 cut-corner-sm px-3 py-2 text-[11px] text-white focus:border-neon-cyan focus:outline-none"
          />
          <button 
            onClick={handleAddPeer}
            className="bg-neon-cyan text-black font-bold px-4 py-2 cut-corner-sm text-[10px] tracking-[0.2em] hover:bg-white"
          >
            PAIR
          </button>
        </div>
      </div>

      {/* Device List */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">Known Devices</h3>
        {peers.length === 0 ? (
          <div className="text-center py-8 opacity-20">
            <div className="loading-tech scale-75 mb-4 mx-auto grayscale"></div>
            <p className="text-[10px] uppercase tracking-widest">No Paired Devices</p>
          </div>
        ) : (
          <div className="space-y-2">
            {peers.map(peer => (
              <div key={peer.deviceId} className="bg-white/5 border border-white/10 p-3 cut-corner-sm flex justify-between items-center group hover:border-neon-cyan/30 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_5px_#00ff9d]" />
                    <h4 className="text-[11px] font-bold text-slate-200 uppercase">{peer.name}</h4>
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono">{peer.lastIp}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={isSyncing}
                    onClick={() => handlePush(peer)}
                    className="px-2 py-1 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[9px] font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all"
                  >
                    PUSH
                  </button>
                  <button 
                    disabled={isSyncing}
                    onClick={() => handlePull(peer)}
                    className="px-2 py-1 bg-neon-amber/10 border border-neon-amber/30 text-neon-amber text-[9px] font-bold uppercase tracking-widest hover:bg-neon-amber hover:text-black transition-all"
                  >
                    PULL
                  </button>
                  <button 
                    onClick={() => handleRemovePeer(peer.deviceId)}
                    className="p-1.5 text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isSyncing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center" role="alert" aria-live="assertive">
          <div className="loading-tech scale-150 mb-6"></div>
          <p className="text-neon-cyan font-bold tracking-[0.4em] text-xs animate-pulse uppercase">Synchronizing Git History...</p>
        </div>
      )}
    </div>
  );
};
