# Component Consistency Checklist

Use this before any UI change lands. It keeps the app coherent and avoids one-off drift.

## Global Checks
- [ ] No rounded corners anywhere.
- [ ] Glass blur is subtle and consistent.
- [ ] Text contrast remains readable on dark glass.
- [ ] One primary action per area (no CTA chaos).
- [ ] 44x44px hit targets for icon-only controls.

## Top Toolbar
- [ ] Actions grouped (undo/redo, save/load, live/settings).
- [ ] Labels or tooltips for icon-only controls.
- [ ] Primary action visually clear.

## Bottom Status Rail
- [ ] Thin, readable, and aligned with toolbar density.
- [ ] Session + mode info is easy to scan.

## Left Sidebar (Inventory)
- [ ] Search, filters, and stats visible without scrolling.
- [ ] Cards consistent in size and spacing.
- [ ] Actions reachable with keyboard.

## Right Sidebar (Assistant)
- [ ] Header shows mode + context clearly.
- [ ] Message density is readable, not cramped.
- [ ] Input row feels purposeful and minimal.

## Canvas
- [ ] Search/filter controls labeled.
- [ ] Empty state provides a next step.
- [ ] Zoom/reset controls have 44px targets.

## Modals
- [ ] Tabs use consistent active-state treatment.
- [ ] Required fields clearly marked.
- [ ] Primary action visually dominant.
