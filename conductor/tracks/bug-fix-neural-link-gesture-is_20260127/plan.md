# Plan: Fix Neural-Link Gesture Issues

## Phase 1: Critical Logic & Stability Fixes
- [x] **Fix Gesture Engine Deadlock:**
    - Modify `services/gesture/GestureEngine.ts` to reset `isProcessing = false` within the `ERROR` message handler.
    - Ensure initialization rejection is handled correctly.
- [x] **Fix Pointer Events (Click Cycle):**
    - Modify `components/MainLayout.tsx` to track pinch state.
    - Dispatch `pointerup` event when pinch is released to complete UI interactions (clicks/drags).
- [x] **Improve Engagement Heuristic:**
    - Modify `hooks/useNeuralLink.ts`.
    - Simplify `isEngaged` check. Instead of strict Y-axis orientation (upright hand), use a simpler presence check or Z-axis depth check if available, or just verify palm confidence. For V1, checking if hand is present and "open" or "pointing" regardless of rotation is better.

## Phase 2: Offline Capability (Local Assets)
- [x] **Download MediaPipe Assets:**
    - Create `public/assets/mediapipe/`.
    - Download `hand_landmarker.task`.
    - Download `vision_wasm_internal.js` and `vision_wasm_internal.wasm`.
- [x] **Update Worker:**
    - Modify `services/gesture/gestureWorker.ts` to point to `/assets/mediapipe/...` instead of CDNs.

## Phase 3: Verification
- [x] Verify pinch-to-click works on buttons.
- [x] Verify gesture engine recovers from temporary tracking loss/errors.
- [x] Verify offline loading (disconnect network and reload).
