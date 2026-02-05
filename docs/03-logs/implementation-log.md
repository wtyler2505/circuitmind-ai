## 2026-01-31 - God-Tier FZPZ Asset Integration
- What changed:
  - Implemented `FzpzLoader` for procedural manufacture of components from official Fritzing Part (.fzpz) assets.
  - Integrated IndexedDB via `partStorageService` for binary asset persistence and high-speed thumbnail hydration.
  - Refactored `InventoryContext` to support lazy-loading of detailed metadata and SVGs.
  - Enabled dynamic pinout awareness in `AIContext` for imported components.
- Why it matters:
  - The project has achieved "God-Tier" asset fidelity, moving beyond generic shapes to manufacturer-accurate schematics.
  - Performance improved by decoupling initial inventory metadata from binary asset blobs.
  - Eve now has deep intelligence regarding pin functions for any imported part.
- Files touched:
  - `services/fzpzLoader.ts`, `services/partStorageService.ts`, `contexts/InventoryContext.tsx`, `components/DiagramCanvas.tsx`

## 2025-01-02 - Glass Layer Pass
- What changed:
  - Panels now use translucent, darker glass surfaces with blur and controlled sheen.
  - Headers and rails gained consistent glass hierarchy for quick scanning.
  - Background gradients were deepened to keep the canvas feeling like a void.
- Why it matters:
  - The app now feels more like a cockpit and less like a default dashboard.
  - The glass layer adds depth without sacrificing readability.
- Files touched:
  - `index.css`

## 2025-01-02 - Canvas Hard-Edge Cleanup
- What changed:
  - Removed rounded corners from canvas overlays and minimap controls.
  - Added focus rings and aria-labels to minimap toggles.
- Why it matters:
  - The slab geometry stays consistent across the entire UI.
  - Accessibility and discoverability improve without adding bulk.
- Files touched:
  - `components/DiagramCanvas.tsx`

## 2025-01-02 - Header Control Density and Hit Targets
- What changed:
  - Icon-only controls in the top toolbar were sized to a 44px target.
- Why it matters:
  - Touch and pointer usability improve immediately.
  - The toolbar still reads dense, but now feels deliberate and precise.
- Files touched:
  - `App.tsx`

## Pending (Documented)
- Screenshot recapture blocked by Playwright crashpad permission error.
- Icon-only controls in header/chat still need visible labels or tooltips.
