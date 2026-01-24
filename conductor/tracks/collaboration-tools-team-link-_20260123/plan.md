# Implementation Plan: Collaboration Tools (Team Link)

## 📋 Todo Checklist
- [ ] **Infrastructure: CRDT Integration**
    - [x] Integrate `yjs` and `y-webrtc`.
    - [x] Define the shared data schema for `WiringDiagram`.
    - [x] Implement `DiagramDoc` provider to wrap existing context.
- [ ] **Core Service: Peer Management**
    - [x] Create `services/collabService.ts`.
    - [x] Implement session joining/leaving via "Project Room" IDs.
    - [x] Add signaling logic for local network peer discovery.
- [ ] **UI: Collaborator HUD**
    - [x] Create `components/layout/CollaboratorList.tsx`.
    - [x] Show user avatars (from Feature 9 profiles) in the header.
    - [x] Add "Invite Peer" numeric code generation.
- [ ] **Visuals: Remote Cursors**
    - [x] Create `components/diagram/RemoteCursor.tsx`.
    - [x] Implement real-time cursor position broadcasting.
    - [x] Add "Hologram" visual style with user name labels.
- [ ] **Logic: Conflict & Locking**
    - [x] Implement simple "Selection Lock" (component glows when someone else selects it).
    - [x] Ensure Yjs correctly merges simultaneous wire additions.
- [ ] **Refinement: Multi-User Chat**
    - [ ] Sync `ConversationContext` across peers so everyone sees AI responses.
    - [ ] Label chat messages with the contributing user's name.

## Testing Strategy
- **Unit Tests**: Verify Yjs doc updates propagate to local diagram state.
- **Integration Tests**: Simulate two users moving components concurrently and verify eventual consistency.
