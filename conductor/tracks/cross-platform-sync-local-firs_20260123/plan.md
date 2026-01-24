# Implementation Plan: Cross-Platform Sync

## 📋 Todo Checklist
- [ ] **Infrastructure: Git Virtual Filesystem**
    - [x] Integrate `isomorphic-git`.
    - [x] Set up `lightning-fs` or a custom IndexedDB wrapper for Git storage.
    - [x] Implement `initRepo` and `commitAll` utilities.
- [ ] **Core Service: Sync Engine**
    - [x] Create `services/syncService.ts`.
    - [x] Implement `autoSnapshot` (periodic background commits).
    - [x] Implement `pushToPeer` and `pullFromPeer` using Git over HTTP/WebSocket.
- [ ] **Network: Local Peer Discovery**
    - [x] Research/Implement a simple LAN discovery (e.g., mDNS via local helper OR manual IP entry).
    - [x] Establish P2P data channel via WebRTC for Git packfile transfer.
- [ ] **UI: Sync & Pairing**
    - [x] Create `components/settings/SyncPanel.tsx`.
    - [x] Implement QR Code display for easy IP/Key sharing.
    - [x] Add a "Devices" list showing active local peers.
- [ ] **Refinement: Status & Conflict**
    - [x] Add "Syncing" and "Offline" icons to the `StatusRail`.
    - [x] Build a basic "Merge Conflict" UI for manual resolution of diagram overlaps.

## Testing Strategy
- **Unit Tests:** Verify Git commits are correctly stored in IndexedDB.
- **Integration Tests:** Mock a P2P connection and verify `git push` triggers local updates.
