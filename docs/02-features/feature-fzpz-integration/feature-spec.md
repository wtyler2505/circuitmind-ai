# Specification: FZPZ Asset Integration & God-Tier Inventory Upgrade

## 1. Overview
Transition the CircuitMind AI inventory system from a static, manually-defined model to a dynamic, Fritzing-compatible system using `.fzpz` files. This upgrade introduces "Manifest-First Hydration" for performance, "AI Context Bridging" for deep assistant awareness, and "User-Driven Extensibility" via custom part imports.

## 2. Requirements
- **Manifest-First Hydration:** Inventory metadata (names, types, pin counts) must load instantly from a pre-processed `parts-manifest.json`. Binary `.fzpz` data is lazy-loaded on demand.
- **Robust FZPZ Processing:** The loader must support unit normalization (mm, mil, in, px) to the 10px=0.1" grid and include an SVG sanitization layer.
- **AI Context Bridging:** Dynamic part metadata (extracted from FZP XML) must be automatically injected into the Gemini AI context.
- **Thumbnail Caching:** Extract and cache SVG thumbnails as data URLs in IndexedDB for immediate UI rendering.
- **User Extensibility:** A UI component in Settings to allow users to upload and register their own `.fzpz` files locally.

## 3. User Experience
- **Instant Discovery:** Sidebar inventory loads immediately with high-fidelity thumbnails.
- **Deep Intelligence:** The AI assistant (Eve) accurately identifies and describes dynamic parts without prior training.
- **Sovereign Library:** Users can build and manage their own local part repositories.

## 4. Technical Constraints
- **Library Requirements:** `JSZip` for decompression, `xml-js` for FZP parsing, and `DOMPurify` (or similar) for SVG sanitization.
- **Unit Standard:** Strict 10px = 0.1" (2.54mm) coordinate normalization.
- **Storage:** Mandatory use of IndexedDB for binary assets and cached thumbnails.
