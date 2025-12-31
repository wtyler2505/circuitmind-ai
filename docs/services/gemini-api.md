# Gemini API Service (`services/geminiService.ts`)

This file contains all interaction with `@google/genai`.

## Model Selection Strategy

| Task | Model ID | Reasoning |
|------|----------|-----------|
| **Wiring Diagrams** | `gemini-3-pro-preview` | Needs high reasoning capabilities to understand pinouts and connection logic. |
| **Component Research** | `gemini-3-pro-preview` | Used for `smartFill` and `assistComponentEditor`. Requires **Google Search** tool. |
| **Simple Chat** | `gemini-2.5-flash-lite-preview-02-04` | Speed and cost-efficiency for general queries. |
| **Deep Thinking** | `gemini-3-pro-preview` | Enabled when `useDeepThinking` is true. Uses `thinkingConfig` budget. |
| **Image Analysis** | `gemini-3-pro-preview` | Best-in-class vision capabilities. |
| **Video Analysis** | `gemini-3-pro-preview` | Native video understanding. |
| **Concept Art** | `gemini-3-pro-image-preview` | High fidelity image generation. |
| **Image Editing** | `gemini-2.5-flash-image` | Specific capability for instruction-based image editing. |
| **Video Gen** | `veo-3.1-fast-generate-preview` | Video generation model. |
| **TTS** | `gemini-2.5-flash-preview-tts` | Text-to-speech generation. |

## Feature: Component Engineering Assistant

### 1. `smartFillComponent(name, type)`
- **Goal**: One-click population of technical details.
- **Model**: `gemini-3-pro-preview`
- **Tools**: `{ googleSearch: {} }`
- **Output**: JSON containing `description`, `pins` (array), `datasheetUrl`, and `type`.

### 2. `assistComponentEditor(history, currentComponent, instruction)`
This is the backend for the "AI Assistant" side panel in the editor.
- **Context**: It receives the *full* current state of the component (pins, URLs, description) and the chat history.
- **Capabilities**:
    1.  **Google Search**: Used to verify pinouts or find real-world images/datasheets.
    2.  **State Updates**: It creates a JSON object representing *deltas* to apply to the component.
    3.  **Media Finding**: It extracts image URLs from search results to show the user candidates.
    4.  **Action Suggestion**: If it can't find a resource, it suggests `GENERATE_IMAGE` or `GENERATE_3D` actions.

**Response Schema**:
```typescript
{
  reply: string;             // Conversational text to show the user
  updates: {                 // Fields to update in the form
    name?: string;
    pins?: string[];
    // ...
  };
  foundImages: string[];     // URLs of images found via Google Search
  suggestedActions: string[]; // ["GENERATE_IMAGE", "GENERATE_3D"]
}
```

## Function: `generateWiringDiagram`
- **Input**: User prompt + Full Inventory Array.
- **System Prompt**: Explicitly instructed to "Favor components from inventory" and "Use precise IDs".
- **Schema**: Enforces a strict JSON schema (`WIRING_SCHEMA`) ensuring the output always contains `components` (array) and `connections` (array). This is vital for the `DiagramCanvas` to render without crashing.

## Function: `chatWithAI`
- **Tools**:
    - **Google Search**: Enabled automatically if the query is detected as "complex" (length > 50 chars or contains keywords like "search", "find").
- **Grounding**: Extracts `groundingChunks` from the response to display "Sources" citations in the UI.

## Function: `generateComponent3DCode`
- **Output**: Returns **raw JavaScript code string**.
- **Prompting**: Instructs the model to write a function body that takes `THREE` as an argument and returns a `THREE.Group`. This allows us to inject the code into the `ThreeViewer` component dynamically.