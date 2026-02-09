import React, { useState, useEffect } from 'react';
import { collabService } from '../../services/collabService';
import { useAuth } from '../../contexts/AuthContext';

interface PeerState {
  user: {
    name: string;
    color: string;
  };
}

export const CollaboratorList: React.FC = () => {
  const [peers, setPeers] = useState<PeerState[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const awareness = collabService.getPresence();
    if (!awareness) return;

    const updatePeers = () => {
      const states = Array.from(awareness.getStates().values()) as Array<Partial<PeerState>>;
      setPeers(states.filter((s): s is PeerState => !!s.user));
    };

    awareness.on('change', updatePeers);
    
    // Set local presence
    if (currentUser) {
      awareness.setLocalStateField('user', {
        name: currentUser.name,
        color: '#00f3ff'
      });
    }

    return () => awareness.off('change', updatePeers);
  }, [currentUser]);

  return (
    <div className="flex items-center gap-1.5 ml-4">
      {peers.map((p, idx) => (
        <div 
          key={idx}
          className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center bg-slate-800 text-[10px] font-bold text-white uppercase shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          style={{ borderColor: p.user.color }}
          title={p.user.name}
        >
          {p.user.name.charAt(0)}
        </div>
      ))}
      
      {/* Invite Button */}
      <button 
        className="w-6 h-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-slate-500 hover:border-neon-cyan hover:text-neon-cyan transition-all"
        title="Invite Collaborator"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};
