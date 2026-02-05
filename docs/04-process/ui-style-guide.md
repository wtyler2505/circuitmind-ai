# CircuitMind UI Style Guide

This doc is the aesthetic contract. It keeps the UI sharp, dark, professional, and unmistakably CircuitMind.

## Design DNA
- **Identity:** Industrial slab + glass cockpit. No rounded corners. No generic dashboards.
- **Mood:** Dark, calm, premium. Cool highlights, restrained glow.
- **Geometry:** Cut-corners and hard edges. Everything feels machined.

## Core Visual System
### Surfaces (Glass)
- Use `panel-surface` for primary panels.
- Use `panel-header` for top bars and section headers.
- Use `panel-rail` for thin rails and separators.
- Use `panel-frame` for framing accents.
- Keep translucency subtle; blur is a supporting actor, not the star.

### Background
- Darker than panels, almost void-like.
- Subtle multi-point radial gradients for depth.
- Never let the background compete with data or chat content.
### Corners
- Always hard-edge. Never rounded.
- Use `cut-corner-sm` and `cut-corner-md` consistently.

## Typography
- Short labels = uppercase micro-text with strong tracking.
- Longer reading = clean, legible body text.
- Keep small text high-contrast (avoid fading into the glass).

## Spacing + Density
- Desktop-first. Use tight vertical rhythm.
- Reduce dead zones; keep important controls prominent.
- Use separators sparingly, but intentionally.

## Accent Colors
- Cyan = system energy / primary focus.
- Purple = AI or assistant context (secondary).
- Red = live/recording/alert.
- Avoid rainbow CTA chaos; one primary action at a time.
## Component Rules
### Buttons
- Icon-only buttons must be 44px hit targets.
- Add tooltips or visible labels where meaning is not obvious.

### Panels
- Panels feel anchored, not floating.
- Use subtle edge highlights to define panel shape.

### Chat
- Messages should read like a logbook, not a chat app.
- Keep system/AI actions visually distinct from user input.

## Do / Don’t
**Do**: precise, dense, confident UI.
**Don’t**: rounded corners, airy whitespace, neon overload.

## Quick Checklist
- [ ] No rounded corners anywhere.
- [ ] Glass blur is present but subtle.
- [ ] Text contrast remains readable on dark glass.
- [ ] Primary action is obvious.
