# Brainstorming: Dynamic Content Injection (Tactical HUD)
**Date:** 2026-01-23
**Status:** Designed (Pending Implementation)

## Core Concept
A "Contextual HUD" that injects AI-generated or RAG-sourced intelligence directly onto the workspace based on user interactions.

## Selected Approach
- **Tactical HUD:** Floating, non-blocking overlays near the cursor.
- **Event-Driven:** Triggers on `Hover`, `Select`, and `Error`.
- **Git-Backed Memory:** Every "Dismissed" or "Star'd" injection is saved to a local git-log to learn user preferences.

## Risks & Mitigations
- **Risk:** High Latency.
- **Mitigation:** Use `gemini-2.5-flash` with a restricted "Fragment Schema" for sub-second delivery.
- **Risk:** UI Clutter.
- **Mitigation:** "Priority Decay" (lower priority info fades out faster).
