# Decisions Log

This log records design and engineering decisions with rationale and tradeoffs.
Append-only; do not delete entries.

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
