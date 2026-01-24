# Implementation Plan: Offline Mode Support (Sovereign Engine)

## 📋 Todo Checklist
- [ ] **Infrastructure: PWA Foundation**
    - [x] Install and configure `vite-plugin-pwa` in `vite.config.ts`.
    - [x] Define the `manifest.json` with cyberpunk-themed icons and colors.
    - [x] Set up Workbox strategies for precaching assets (React, Three.js, Styles).
- [ ] **Core Service: Connectivity Tracking**
    - [x] Create `services/connectivityService.ts`.
    - [x] Implement listeners for `online` and `offline` browser events.
    - [x] Create a `useConnectivity` hook to expose status to the application.
- [ ] **UI: Offline States**
    - [x] Add a "Satellite Link Offline" indicator to the `StatusRail`.
    - [x] Implement graceful UI degradation (e.g., grey out AI Chat input when offline).
    - [x] Add a "Reconnecting..." status animation.
- [ ] **Logic: Graceful AI Failover**
    - [x] Update `services/geminiService.ts` to check connectivity before attempting API calls.
    - [x] Provide clear, in-character "No Connection" messages from Eve.
    - [x] Ensure local RAG-based search (Feature 1) remains active while offline.
- [ ] **Refinement: Resource Management**
    - [ ] Implement "Offline Cache Manager" in Settings to view and clear stored assets.
    - [ ] Add a "Save for Offline" manual trigger for large project resources.

## Testing Strategy
- **Simulation Tests**: Use browser dev tools to simulate offline state and verify asset caching.
- **UX Tests**: Ensure that 100% of local functionality (Canvas, Inventory) remains interactable without network.
