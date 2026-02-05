# UI Change Review Template

Copy/paste this into any PR or change request that affects UI.

## Summary (1–3 lines)
- What changed and why.

## Visual Intent
- Design goal (e.g., glass surface, density, hierarchy).
- What the user should feel/notice.

## Before/After Checklist
- [ ] No rounded corners introduced.
- [ ] Glass blur is subtle and consistent.
- [ ] Text contrast still readable on dark glass.
- [ ] 44px hit targets for icon-only controls.
- [ ] Primary action is obvious.
- [ ] Empty states explain the next action.

## Screenshots
- [ ] Updated relevant screenshots in `docs/screenshots/`.
- [ ] Updated `docs/screenshots/MANIFEST.md`.
- [ ] Noted any capture blockers.

## Risk Notes
- What might break? What might feel worse?

## Testing
- [ ] Visual check complete.
- [ ] Related tests run (if applicable).
