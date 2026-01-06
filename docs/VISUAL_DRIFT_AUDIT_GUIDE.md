# Visual Drift Audit Guide

A quick method to keep the UI consistent as features evolve.

## What Is Visual Drift?
When new UI doesn’t match the system: different spacing, contrast, or hierarchy.

## Drift Signals
- New buttons don’t match existing size/spacing.
- Text contrast is weaker than baseline.
- Glass blur/opacity doesn’t match panel system.
- Corners appear rounded.
- Icon-only controls lack labels or hit targets.

## 5-Minute Audit
1. Compare the new view against the most recent screenshots.
2. Check the checklist in `docs/COMPONENT_CONSISTENCY_CHECKLIST.md`.
3. Validate glass surface consistency with `docs/UI_TOKENS_REFERENCE.md`.
4. Ensure empty states guide a next action.
5. Record any drift in `docs/LIVE_REVIEW_LOG.md`.

## Fix Strategy
- Correct tokens first (colors, blur, spacing).
- Align component sizes to the nearest existing baseline.
- Unify button and icon styles before adding new styles.

## Capture Expectations
- Update screenshots for any visible UI change.
- If capture is blocked, note it explicitly in the UI audit.
