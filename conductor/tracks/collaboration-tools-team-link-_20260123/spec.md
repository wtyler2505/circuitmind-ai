# Spec: Collaboration Tools (Team Link)

## Goal
Enable real-time, peer-to-peer collaboration on electronics designs, allowing multiple users on the same local network to edit diagrams, share component ideas, and troubleshoot circuits together.

## Background
Engineering is often collaborative. Current workflows require sharing static files. "Team Link" turns the workspace into a shared environment where a mentor can guide a student or a team can brainstorm a complex PCB layout in real-time.

## Architecture
- **CRDT (Conflict-Free Replicated Data Types)**: Uses Yjs to ensure that even with high latency or concurrent edits, every participant's diagram converges to the same state.
- **P2P Discovery**: Reuses the local network peering logic from Feature 12 (Sync) to find collaborators.
- **Presence Stream**: Real-time broadcasting of mouse coordinates and active selections to provide "Spatial Awareness".

## Data Model
```typescript
interface CollabSession {
  roomId: string;
  peers: { id: string; name: string; color: string }[];
  isLocked: boolean; // Admin can lock the room
}

interface PeerPresence {
  cursor: { x: number; y: number };
  selection?: string; // targetId
  activeMode: string;
}
```

## Security & Privacy
- Collaboration is strictly local-network or P2P via WebRTC.
- All session data is transient unless committed to the local Git history (Feature 13).
- Role-Based Access (Feature 18) determines who can edit vs observe.
