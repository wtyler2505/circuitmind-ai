# Spec: Neural-Link Gesture System Fixes

## Context
A code review of the `feature/neural-link-gestures` implementation identified critical stability issues (engine deadlock), functional bugs (incomplete click events), and reliability concerns (CDN dependencies).

## Issues & Solutions

### 1. Engine Deadlock on Error
**Issue:** If the Web Worker emits an `ERROR`, the `GestureEngine`'s `isProcessing` flag remains `true`, preventing any future frames from being processed.
**Fix:** Reset `isProcessing` to `false` in the error handler.

### 2. Incomplete Click Interactions
**Issue:** The current implementation sends `pointerdown` on pinch but never `pointerup`. UI elements (buttons, drag handles) rely on the full event cycle.
**Fix:** Track previous pinch state. When pinch is released, fire `pointerup` at the last known or current cursor location.

### 3. Engagement Heuristic Sensitivity
**Issue:** `isEngaged` currently checks `indexTip.y < indexBase.y` (finger pointing up). This fails if pointing forward (at screen) or sideways.
**Fix:** Relax the check. Use presence of landmarks + confidence score. Ideally, check if the index finger is extended relative to the palm, independent of global rotation.

### 4. Offline Reliability (CDN Dependency)
**Issue:** The worker loads models/WASM from public CDNs.
**Fix:** Vendor these assets into `public/assets/mediapipe/` to satisfy the "Local-First" product value and ensure offline functionality.

## Security & Privacy
- No changes to data handling (still local).
- Local assets improve privacy by removing requests to third-party CDNs during runtime.
