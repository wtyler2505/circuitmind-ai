# Decisions Log

This log records design and engineering decisions with rationale and tradeoffs.
Append-only; do not delete entries.

## 2026-01-31 - Fritzing Part (.fzpz) Specification Adoption
- Status: Accepted
- Context:
  - The previous system used generic SVG shapes, lacking manufacturer accuracy and detailed pin metadata.
  - We needed a standard that allows users to import components from the massive Fritzing ecosystem.
- Decision:
  - Adopt the official `.fzpz` specification (XML + multi-view SVGs) as the core asset format.
  - Implement a custom `FzpzLoader` to handle coordinate normalization (mil/mm/in to 10px grid).
  - Use IndexedDB for binary persistence to ensure local-first performance.
- Alternatives considered:
  1. Custom JSON format (requires manually converting every part; high friction).
  2. Direct SVG-only import (loses critical pin metadata and layering).
- Consequences:
  - Achieved "God-Tier" asset fidelity.
  - High complexity in SVG parsing/sanitization due to non-standard Fritzing XML.
  - Significant improvement in AI intelligence through dynamic pinout context.
- Compliance:
  - Implemented in `services/fzpzLoader.ts` and `services/partStorageService.ts`.

## 2025-01-02 - Glass Surface System (Panels + Rails)
- Status: Accepted
- Context:
  - The UI needed a more professional, premium look without losing the industrial slab identity.
  - Existing panels were dark but lacked translucent depth and cohesive glass layering.
- Decision:
  - Introduce a dark glassmorphism system for panel surfaces, headers, rails, and toggles.
  - Keep hard-edge geometry (no rounded corners) and cut-corner framing.
  - Use controlled blur + saturation for depth while avoiding high-chroma neon overload.
- Alternatives considered:
  1. Keep flat dark panels with no blur (too basic, low perceived quality).
  2. High-glow neon glass (too loud, competes with content and wiring canvas).
- Consequences:
  - Panels gain translucent depth; typography contrast must be managed carefully.
  - Requires updated screenshots to avoid audit drift.
- Compliance:
  - Implemented in `index.css` via `panel-surface`, `panel-header`, `panel-rail`, `panel-toggle`.
  - No rounded corners; preserve `cut-corner-sm` and `cut-corner-md`.
