# Spec: AI-Assisted Debugging (Circuit Eye)

## Goal
Bridging the gap between the digital design and the physical breadboard by using Computer Vision to detect wiring errors, suggest multimeter probe points, and walk the user through complex troubleshooting scenarios.

## Background
The most common point of failure in electronics prototyping is the physical wiring stage. Errors like reversed polarity, off-by-one pin placements, or loose connections are difficult to spot. This feature gives the AI "eyes" to see the user's bench and catch these mistakes.

## Architecture
- **Multi-Modal Analysis:** Uses Gemini 2.5 Pro Vision to process high-resolution bench photos.
- **State-Aware Cross-Referencing:** The AI is fed the raw `WiringDiagram` JSON as ground truth to compare against the visual scene.
- **Augmented Reality (Lite):** Mismatches found in the physical world are mapped back to coordinates on the digital canvas for visual feedback.

## Data Model
```typescript
interface VisionErrorReport {
  type: 'mismatch' | 'missing' | 'potential_short' | 'neatness';
  severity: 'low' | 'medium' | 'high';
  componentId?: string;
  pinName?: string;
  description: string;
  remedy: string;
}

interface DebugSession {
  snapshotUrl: string;
  errors: VisionErrorReport[];
  suggestedProbes: { point: string; expectedValue: string }[];
}
```

## Security & Privacy
- Webcam access requires explicit browser permission.
- Bench photos are only sent to Gemini when the user clicks "Analyze".
- Images are not stored on any server after processing (transient).
