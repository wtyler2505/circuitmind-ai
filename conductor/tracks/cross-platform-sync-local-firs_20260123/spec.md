# Spec: Cross-Platform Sync (Local-First Bridge)

## Goal
Enable seamless synchronization of inventory, projects, and user profiles across multiple local devices (e.g., PC, Laptop, Tablet) without relying on a centralized cloud service.

## Background
CircuitMind is a local-first application. Users frequently move between a "Design Station" (Desktop) and an "Electronics Bench" (Tablet). This track uses Git as the underlying data synchronization engine to ensure version history and local-only privacy.

## Architecture
- **Git-as-Data:** All application state is serialized to JSON and stored in a local Git repository managed by `isomorphic-git`.
- **P2P Communication:** Devices discover each other on the local area network (LAN) and exchange Git packfiles via WebRTC or a local WebSocket bridge.
- **Encryption:** Sync traffic is encrypted using a shared "Pairing Key" generated during device setup.

## Data Model
```typescript
interface PeerNode {
  deviceId: string;
  name: string;
  lastIp: string;
  pairingStatus: 'paired' | 'pending' | 'blocked';
  lastSyncHash: string;
}

interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // ms
  knownPeers: PeerNode[];
}
```

## Security & Privacy
- Data never leaves the local network.
- No third-party servers see the circuit designs or inventory.
- Pairing requires physical access to both devices (QR code/Numeric code).
