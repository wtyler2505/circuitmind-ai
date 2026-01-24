# Spec: Dynamic Content Injection (Tactical HUD)

## Goal
Transform the CircuitMind AI workspace into a "Living Interface" by injecting contextual, real-time data (pinouts, technical specs, AI tips) directly into the user's field of view without cluttering the permanent UI.

## Background
Currently, technical data is buried in the "Info" tab of the `ComponentEditorModal`. Users have to click into a modal to see basic pin information. The Tactical HUD will surface this data instantly on hover/select.

## Architecture
- **Context API:** `HUDContext` will act as an ephemeral registry.
- **Portals:** The HUD will render in a Portal to avoid z-index and clipping issues within the SVG canvas.
- **AI Integration:** `gemini-2.5-flash` will be used to summarize complex datasheet info into "fragments" (short, punchy technical bits).

## Data Model
```typescript
type FragmentType = 'info' | 'warning' | 'tip';

interface HUDFragment {
  id: string;
  targetId: string; // Component or Pin ID
  type: FragmentType;
  content: string;
  position: { x: number; y: number };
  priority: number;
}
```

## Security & Privacy
- Fragments are generated locally or via the configured Gemini API key.
- No interaction data is sent to the cloud other than the prompt for the specific component being hovered.
