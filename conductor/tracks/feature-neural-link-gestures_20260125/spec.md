# Spec: Hybrid Neural-Link Gesture System

## Context
A multimodal bridge connecting on-device Computer Vision (CV) with cloud-based Generative AI to provide seamless, hands-free interaction with CircuitMind AI. This allows users to manipulate diagrams while their hands are physically busy with hardware.

## Goals
- **Direct Manipulation:** Move a virtual cursor via index finger tracking with <20ms latency.
- **Semantic Reasoning:** Use Gemini 2.5 Flash Live to understand "why" a user is pointing (e.g., identifying a physical component).
- **Zero UI Lag:** Offload heavy CV processing to a Web Worker to preserve 60FPS React/Three.js performance.
- **Privacy:** Process frames locally; only send metadata or sampled frames to Gemini with explicit user action.

## Architecture: The "Visual-Neural Bridge"
1. **The Edge (MediaPipe):**
   - Runs in a Web Worker using WebAssembly.
   - Outputs 21 hand landmarks at 30Hz.
   - Purpose: Real-time cursor position, pinch detection, scrolling.
2. **The Cloud (Gemini 2.5 Flash Live):**
   - Persistent WebSocket connection.
   - Purpose: Complex intent recognition and multimodal (Voice+Vision) commands.
   - Example: Pointing at a physical breadboard and saying "Import this circuit."

## Gesture Mapping (v1)
| Gesture | Action | Feedback |
| :--- | :--- | :--- |
| **Index Point** | Track Cursor | Glowing Dot |
| **Index+Thumb Pinch** | Select / Drag | Ripple Effect |
| **Two Finger Move** | Zoom / Rotate | Scale Overlay |
| **Open Palm** | Pan Viewport | Hand Icon |
| **Swipe** | Change UI Mode | Motion Blur |

## Security & Privacy
- Explicit opt-in toggle in Settings.
- Visual "Camera Active" indicator at all times.
- Local landmark processing; frames are discarded after analysis.
