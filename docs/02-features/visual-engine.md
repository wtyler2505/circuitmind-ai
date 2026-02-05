# Visual Engine: Fritzing Parity & Beyond

The Visual Engine is responsible for the high-fidelity representation of electronic circuits in both 2D and 3D spaces. It prioritizes technical accuracy, manufacturer compliance, and a "tactile" user experience.

## Core Pillars

### 1. Fritzing Parity (2D)
- **Standardized Grid:** Strict 0.1" (2.54mm / 10 units) global grid system for all components and wires.
- **Bézier Wiring:** Wires are rendered as cubic Bézier curves, providing a natural "slack" appearance. Supports double-click anchor points for complex routing.
- **Internal Bus Logic:** Smart Breadboard component with rail awareness.
  - **Auto-Connection:** Pins inserted into the same logical rail (defined via `internalBuses` in `ElectronicComponent`) are automatically electrically connected.
  - **Breadboard Rails:** Standard implementation for Row 1, Col A-E and Power/GND rails.

### 2. Asset Pipeline (God-Tier FZPZ)
- **Protocol:** Uses the official Fritzing Part (.fzpz) specification (XML metadata + multi-view SVGs).
- **Procedural Manufacture:** `FzpzLoader` handles client-side zip decompression and XML parsing.
- **Normalization:** Automatically converts Fritzing units (mil, mm, in) into our internal 10px unit standard.
- **Persistence:** Binary assets and cached SVG thumbnails are stored in IndexedDB for instant, offline-first hydration.

### 3. Neural-Link Gesture System
- **Engagement:** Real-time hand tracking via MediaPipe.
- **Interactions:** "Pinch" to select/drag, "Palm" to pan, and "Swipe" to change tabs.
- **Feedback:** Neural Cursor provides visual feedback on hand engagement and intent.

### 4. Tactical HUD
- **Dynamic Injection:** Real-time data overlays for pin functions, voltage levels, and component specs.
- **Visual Anchoring:** Highlights and tooltips that follow components during panning and zooming.
