# Plan: Neural-Link Development Track

## Phase 1: Infrastructure & Edge Detection (The Eyes)
- [x] Install `@mediapipe/tasks-vision` and required assets.
- [x] Implement `services/gesture/GestureWorker.ts`: Off-main-thread tracking logic.
- [x] Implement `services/gesture/GestureEngine.ts`: Client-side interface for the worker.
- [x] Create `hooks/useNeuralLink.ts`: Hook for webcam lifecycle and landmark state.

## Phase 2: Holographic UI & Mapping (The Cursor)
- [x] Build `components/diagram/NeuralCursor.tsx`: SVG overlay with spring-physics smoothing.
- [x] Implement Discrete Pose Detection:
    - `INDEX_RAISED` -> Show Cursor (Engagement Gate).
    - `PINCH` -> Trigger 'select' / 'drag' intent.
    - `PALM_OPEN` -> Trigger 'pan' intent.
- [x] Map screen-space hand coordinates to Canvas-space diagram coordinates.

## Phase 3: Gemini Live Integration (The Brain)
- [x] Implement `services/gemini/features/liveVision.ts`: WebSocket bridge for Gemini 2.5 Flash Live.
- [x] Implement **Trigger-Sampling**: Send high-res frames to Gemini on "Pose Hold" or Voice command.
- [x] Add support for "Physical Object ID": Gemini identifies components in the user's hand and adds them to inventory.

## Phase 4: System Integration & Metrics
- [x] Connect to `LayoutContext`: Global toggle for Neural-Link.
- [x] Add `GestureMetricsService`: Log accuracy and latency to `storageService`.
- [x] Update `components/layout/StatusRail.tsx` with a "LINK ACTIVE" indicator.

## Phase 5: Verification & Calibration
- [x] Unit tests for coordinate transformation logic.
- [x] Create "Engagement Zone" visual calibration tool.
- [x] Final performance audit: Three.js + MediaPipe + React.
