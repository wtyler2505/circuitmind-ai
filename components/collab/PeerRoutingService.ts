import { collabService } from '../../services/collabService';

// ─── Collaborator color palette ─────────────────────────────────────────────
// Distinct, high-contrast neon colors that work against dark backgrounds.
// The first color is reserved for the local user; peers rotate through the rest.
const PEER_COLORS = [
  '#00f3ff', // neon cyan  (local default)
  '#bd00ff', // neon purple
  '#00ff9d', // neon green
  '#ffaa00', // neon amber
  '#ff3d71', // neon red
  '#36f9c5', // mint
  '#f97316', // orange
  '#818cf8', // indigo
] as const;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LocalUserInfo {
  name: string;
  color: string;
}

export interface PeerState {
  user: {
    name: string;
    color: string;
  };
  cursor?: {
    x: number;
    y: number;
  };
  lastActive?: number;
}

// ─── PeerRoutingService ─────────────────────────────────────────────────────

/**
 * Manages room creation / joining, session link generation, and local
 * awareness state for the Yjs+y-webrtc collaboration layer.
 *
 * This is a singleton — import `peerRoutingService` at the bottom of this
 * file and call its methods from React components.
 */
class PeerRoutingService {
  private currentRoomId: string | null = null;
  private localUser: LocalUserInfo | null = null;

  // ── Room lifecycle ──────────────────────────────────────────────────────

  /**
   * Create a fresh collaboration room and return its ID.
   * Does NOT automatically join — call `joinRoom` explicitly.
   */
  createRoom(): string {
    const roomId = this.generateRoomId();
    this.currentRoomId = roomId;
    return roomId;
  }

  /**
   * Join an existing (or newly created) collaboration room.
   * Delegates to `collabService.joinRoom` for the actual Yjs plumbing,
   * then pushes local awareness state if user info has been set.
   */
  joinRoom(roomId: string, onDiagramUpdate: Parameters<typeof collabService.joinRoom>[1]): void {
    this.currentRoomId = roomId;
    collabService.joinRoom(roomId, onDiagramUpdate);

    // If local user info was set before joining, push it now
    if (this.localUser) {
      this.pushAwarenessState();
    }
  }

  /**
   * Leave the current room and clean up.
   */
  leaveRoom(): void {
    collabService.leaveRoom();
    this.currentRoomId = null;
  }

  // ── User info & awareness ───────────────────────────────────────────────

  /**
   * Set the local user's display name and cursor color.
   * If already in a room the awareness state is pushed immediately.
   */
  setUserInfo(name: string, color?: string): void {
    this.localUser = {
      name,
      color: color ?? this.pickColor(),
    };

    if (this.currentRoomId) {
      this.pushAwarenessState();
    }
  }

  /**
   * Returns the current local user info (or null if not set).
   */
  getLocalUser(): LocalUserInfo | null {
    return this.localUser;
  }

  // ── Session link helpers ────────────────────────────────────────────────

  /**
   * Build a shareable URL that a peer can open to join the current session.
   * Returns `null` if no room is active.
   */
  getSessionLink(): string | null {
    if (!this.currentRoomId) return null;

    const url = new URL(window.location.href);
    // Strip existing query/hash to keep the link clean
    url.search = '';
    url.hash = '';
    url.searchParams.set('session', this.currentRoomId);
    return url.toString();
  }

  /**
   * Parse the current page URL for a `?session=<roomId>` parameter.
   * Returns the room ID or `null` if absent.
   */
  parseSessionFromURL(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('session');
  }

  /**
   * Returns the active room ID (or null).
   */
  getRoomId(): string | null {
    return this.currentRoomId;
  }

  // ── Awareness accessors (delegates to collabService) ────────────────────

  /**
   * Returns the y-webrtc awareness instance from the active provider.
   * Callers can subscribe to `awareness.on('change', ...)` for peer updates.
   */
  getAwareness() {
    return collabService.getPresence();
  }

  /**
   * Snapshot of all currently connected peers (excluding self).
   */
  getConnectedPeers(): PeerState[] {
    const awareness = collabService.getPresence();
    if (!awareness) return [];

    const localClientId = awareness.clientID;
    const states: PeerState[] = [];

    awareness.getStates().forEach((state, clientId) => {
      if (clientId !== localClientId && state?.user) {
        states.push(state as PeerState);
      }
    });

    return states;
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  private generateRoomId(): string {
    // crypto.randomUUID is available in all modern browsers (2022+).
    // Fall back to a simple hex string if unavailable (e.g. non-secure
    // contexts in older Chromium builds).
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `cm-${crypto.randomUUID()}`;
    }

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `cm-${hex}`;
  }

  private pickColor(): string {
    // Assign a pseudo-random color from the palette so each user is distinct
    const index = Math.floor(Math.random() * PEER_COLORS.length);
    return PEER_COLORS[index];
  }

  private pushAwarenessState(): void {
    const awareness = collabService.getPresence();
    if (!awareness || !this.localUser) return;

    awareness.setLocalStateField('user', {
      name: this.localUser.name,
      color: this.localUser.color,
    });

    awareness.setLocalStateField('lastActive', Date.now());
  }
}

export const peerRoutingService = new PeerRoutingService();
