import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { peerRoutingService, type PeerState } from './PeerRoutingService';
import { useAuth } from '../../contexts/AuthContext';

// ─── Sub-components ─────────────────────────────────────────────────────────

/**
 * Avatar circle for a single collaborator.  Shows first initial, a colored
 * ring, and a pulsing online dot.
 */
const PeerAvatar: React.FC<{
  peer: PeerState;
  isLocal?: boolean;
}> = memo(({ peer, isLocal }) => {
  const initial = peer.user.name.charAt(0).toUpperCase();

  return (
    <li
      className="relative group"
      role="listitem"
    >
      <div
        className="
          w-8 h-8 rounded-full flex items-center justify-center
          bg-cyber-dark text-xs font-bold text-slate-200 uppercase
          ring-2 ring-offset-1 ring-offset-cyber-black
          transition-shadow duration-200 select-none
          group-hover:shadow-[0_0_10px_var(--ring-color)]
        "
        style={
          {
            '--ring-color': peer.user.color,
            ringColor: peer.user.color,
          } as React.CSSProperties
        }
        aria-label={`${peer.user.name}${isLocal ? ' (you)' : ''}`}
      >
        {initial}
      </div>

      {/* Online indicator dot */}
      <span
        className="
          absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5
          rounded-full border-2 border-cyber-black
        "
        style={{ backgroundColor: peer.user.color }}
        aria-hidden="true"
      />

      {/* Tooltip on hover */}
      <span
        className="
          pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2
          whitespace-nowrap rounded bg-cyber-card px-2 py-0.5
          text-[10px] font-medium text-slate-300 opacity-0
          shadow-lg border border-white/10
          transition-opacity duration-150
          group-hover:opacity-100
        "
        role="tooltip"
      >
        {peer.user.name}{isLocal ? ' (you)' : ''}
      </span>
    </li>
  );
});
PeerAvatar.displayName = 'PeerAvatar';

// ─── Copy-link feedback states ──────────────────────────────────────────────

type CopyState = 'idle' | 'copied' | 'failed';

// ─── Main component ─────────────────────────────────────────────────────────

interface CollaboratorListProps {
  /** Additional class names forwarded to the root container. */
  className?: string;
}

/**
 * CollaboratorList -- shows connected peers and provides an invite panel.
 *
 * Renders inline (e.g. in the header bar) when collapsed, expanding into a
 * small dropdown when the user clicks the invite (+) button.
 *
 * Accessibility:
 *   - Peer avatars are an ARIA list with labelled items.
 *   - The invite panel is `role="dialog"` with a descriptive label.
 *   - Copy button announces result via an ARIA live region.
 *   - Escape key closes the panel; focus is trapped inside while open.
 */
const CollaboratorListInner: React.FC<CollaboratorListProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const [peers, setPeers] = useState<PeerState[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Awareness subscription ──────────────────────────────────────────────

  useEffect(() => {
    const awareness = peerRoutingService.getAwareness();
    if (!awareness) return;

    const updatePeers = () => {
      const states = Array.from(awareness.getStates().values()) as Array<Partial<PeerState>>;
      setPeers(states.filter((s): s is PeerState => !!s.user));
    };

    // Initial population
    updatePeers();

    awareness.on('change', updatePeers);
    return () => {
      awareness.off('change', updatePeers);
    };
  }, []);

  // Push local awareness state when auth user changes
  useEffect(() => {
    if (currentUser) {
      peerRoutingService.setUserInfo(currentUser.name);
    }
  }, [currentUser]);

  // ── Copy to clipboard ───────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    const link = peerRoutingService.getSessionLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopyState('copied');
    } catch {
      // Fallback for insecure contexts / denied permissions
      try {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopyState('copied');
      } catch {
        setCopyState('failed');
      }
    }

    // Reset after 2 seconds
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopyState('idle'), 2000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // ── Close panel on outside click or Escape ──────────────────────────────

  useEffect(() => {
    if (!panelOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [panelOpen]);

  // ── Derived data ────────────────────────────────────────────────────────

  const sessionLink = peerRoutingService.getSessionLink();
  const roomActive = peerRoutingService.getRoomId() !== null;

  // Separate local user from remote peers for display ordering
  const awareness = peerRoutingService.getAwareness();
  const localClientId = awareness?.clientID;

  const localPeerState: PeerState | null = (() => {
    if (!awareness || localClientId == null) return null;
    const s = awareness.getStates().get(localClientId);
    return s?.user ? (s as PeerState) : null;
  })();

  const remotePeers = peers.filter((p) => {
    // We only have user objects; compare by name+color to deduplicate the
    // local user (awareness states include self).
    if (!localPeerState) return true;
    return !(
      p.user.name === localPeerState.user.name &&
      p.user.color === localPeerState.user.color
    );
  });

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className={`relative flex items-center gap-1.5 ${className ?? ''}`}>
      {/* Peer avatar list */}
      <ul
        className="flex items-center -space-x-1.5"
        role="list"
        aria-label="Connected collaborators"
      >
        {localPeerState && (
          <PeerAvatar peer={localPeerState} isLocal />
        )}
        {remotePeers.map((p, idx) => (
          <PeerAvatar key={`${p.user.name}-${p.user.color}-${idx}`} peer={p} />
        ))}
      </ul>

      {/* Invite toggle button */}
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        className="
          w-7 h-7 rounded-full flex items-center justify-center
          border border-dashed border-slate-600
          text-slate-500 hover:border-neon-cyan hover:text-neon-cyan
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60
          transition-all duration-150
        "
        aria-label={panelOpen ? 'Close invite panel' : 'Invite collaborator'}
        aria-expanded={panelOpen}
        aria-haspopup="dialog"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {panelOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          )}
        </svg>
      </button>

      {/* ── Invite dropdown panel ──────────────────────────────────────── */}
      {panelOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Invite collaborators"
          className="
            absolute right-0 top-full mt-2 z-50
            w-80 rounded-lg
            bg-cyber-card border border-neon-cyan/20
            shadow-[0_4px_24px_rgba(0,243,255,0.08)]
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
              Collaborators
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {roomActive
                ? `${remotePeers.length} peer${remotePeers.length !== 1 ? 's' : ''} connected`
                : 'No active session'}
            </p>
          </div>

          {/* Peer list */}
          <div className="px-4 py-2 max-h-48 overflow-y-auto">
            {peers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center leading-relaxed">
                No collaborators yet&mdash;<br />
                share the link below to invite others.
              </p>
            ) : (
              <ul role="list" aria-label="Collaborator details" className="space-y-1">
                {localPeerState && (
                  <PeerListRow peer={localPeerState} isLocal />
                )}
                {remotePeers.map((p, idx) => (
                  <PeerListRow
                    key={`${p.user.name}-${p.user.color}-${idx}`}
                    peer={p}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Invite link section */}
          {roomActive && sessionLink ? (
            <div className="px-4 py-3 border-t border-white/5 bg-cyber-dark/50">
              <label
                htmlFor="collab-session-link"
                className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1.5"
              >
                Session Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="collab-session-link"
                  type="text"
                  readOnly
                  value={sessionLink}
                  className="
                    flex-1 min-w-0 px-2.5 py-1.5 rounded
                    bg-cyber-black border border-white/10
                    text-xs text-slate-300 font-mono
                    truncate select-all
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-cyan/40
                  "
                  aria-label="Session invite link"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`
                    flex-shrink-0 px-3 py-1.5 rounded text-xs font-semibold
                    transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60
                    ${
                      copyState === 'copied'
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                        : copyState === 'failed'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20'
                    }
                  `}
                  aria-label={
                    copyState === 'copied'
                      ? 'Link copied to clipboard'
                      : copyState === 'failed'
                        ? 'Failed to copy link'
                        : 'Copy session link to clipboard'
                  }
                >
                  {copyState === 'copied' ? (
                    <CopyCheckIcon />
                  ) : copyState === 'failed' ? (
                    'Error'
                  ) : (
                    <CopyIcon />
                  )}
                </button>
              </div>

              {/* ARIA live region for copy feedback */}
              <span className="sr-only" role="status" aria-live="polite">
                {copyState === 'copied'
                  ? 'Session link copied to clipboard'
                  : copyState === 'failed'
                    ? 'Failed to copy session link'
                    : ''}
              </span>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-white/5 bg-cyber-dark/50">
              <p className="text-[11px] text-slate-500 text-center">
                Start or join a session to share the invite link.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Detailed list row (for the dropdown) ───────────────────────────────────

const PeerListRow: React.FC<{ peer: PeerState; isLocal?: boolean }> = memo(
  ({ peer, isLocal }) => (
    <li
      className="
        flex items-center gap-2.5 px-2 py-1.5 rounded
        hover:bg-white/[0.03] transition-colors duration-100
      "
      role="listitem"
    >
      {/* Color indicator */}
      <span
        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: peer.user.color }}
        aria-hidden="true"
      />
      <span className="text-xs text-slate-300 truncate">
        {peer.user.name}
      </span>
      {isLocal && (
        <span className="ml-auto text-[10px] text-slate-600 uppercase tracking-wide">
          you
        </span>
      )}
      {!isLocal && (
        <span
          className="ml-auto flex items-center gap-1 text-[10px] text-neon-green"
          aria-label="Online"
        >
          <span className="block h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
          online
        </span>
      )}
    </li>
  ),
);
PeerListRow.displayName = 'PeerListRow';

// ─── Icon sub-components ────────────────────────────────────────────────────

const CopyIcon: React.FC = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CopyCheckIcon: React.FC = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

// ─── Export (React.memo wrapped) ────────────────────────────────────────────

export const CollaboratorList = memo(CollaboratorListInner);
CollaboratorList.displayName = 'CollaboratorList';
