# Spec: Accessibility Features (Inclusive Engineering)

## Goal
Ensure CircuitMind AI is accessible to all engineers by implementing robust ARIA patterns, comprehensive keyboard support, and AI-powered spatial descriptions, meeting or exceeding WCAG 2.1 AA standards.

## Background
Engineering tools are often visually intensive and mouse-dependent. To be a professional-grade workspace, CircuitMind must support users who rely on assistive technologies or different interaction modalities (voice, keyboard).

## Architecture
- **Semantic DOM**: Every custom component (Panels, Wires, Nodes) will be mapped to appropriate WAI-ARIA roles.
- **Spatial Mapping**: A service that translates coordinates into relative positions (top, left, center) for screen reader narration.
- **Adaptive Visuals**: A CSS variable system that reacts to user accessibility preferences (e.g., font size, motion).

## Data Model
```typescript
interface A11ySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  screenReaderDescriptions: boolean;
  fontSizeScale: number; // 1.0 to 1.5
}

interface SpatialDescription {
  overview: string;
  componentLayout: string[]; // e.g., ["MCU at (400, 200)"]
  connectivitySummary: string;
}
```

## Security & Privacy
- Accessibility settings are stored in the local User Profile.
- Audio narrations are generated locally or via the configured Gemini key.
