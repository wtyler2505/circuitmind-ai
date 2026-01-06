# CircuitMind AI - Services Reference

## geminiService.ts (923 lines)

The core AI integration layer. All Gemini API calls.

### API Key Management

```typescript
const getApiKey = (): string => {
  const stored = localStorage.getItem('cm_gemini_api_key');
  if (stored) return stored;
  return process.env.API_KEY || '';
};
```

### Key Functions

#### `generateWiringDiagram(prompt, inventoryContext)`
Generates structured wiring diagram JSON from natural language.
- Uses `gemini-3-pro-preview` with structured output
- Returns `WiringDiagram` with components, connections, explanation
- Injects inventory context for component matching

#### `chatWithAI(content, history, attachment?, type?, deepThinking?)`
General-purpose chat with optional image/video attachment.
- Uses `gemini-2.5-flash-lite-preview` for fast responses
- Supports deep thinking mode toggle
- Returns `{text, groundingSources}`

#### `chatWithContext(content, history, aiContext, options)`
Context-aware chat that understands app state.
- Uses structured response schema with `suggestedActions`
- Returns `ContextAwareChatResponse` with actions, component mentions
- **Known Issue**: `payloadJson` must be STRING type (not OBJECT) for Gemini schema validation

#### `generateComponent3DCode(componentName, componentType)`
Generates Three.js mesh code for 3D visualization.
- Returns raw JavaScript code string
- Executed via `new Function('THREE', code)` in ThreeViewer

#### `smartFillComponent(partialComponent)`
Auto-fills component details using Google Search grounding.
- Takes partial component data
- Returns fully populated `ElectronicComponent`

#### `generateConceptImage(prompt, size, aspectRatio)`
Generates concept art images.
- Uses `gemini-3-pro-image-preview`
- Returns base64 image data

#### `generateCircuitVideo(prompt, aspectRatio, imageBase64?)`
Generates video with Veo model.
- Returns URL (requires API key appended for access)

#### `transcribeAudio(audioBase64)`
Transcribes audio recording to text.

#### `generateSpeech(text)`
Text-to-speech synthesis.
- Returns base64 MP3 audio

### Response Schemas

```typescript
const WIRING_SCHEMA: Schema = {
  // title, components[], connections[], explanation
};

const STRUCTURED_RESPONSE_SCHEMA: Schema = {
  // message, componentMentions[], suggestedActions[], proactiveSuggestion
  // NOTE: suggestedActions.payloadJson must be STRING, not OBJECT
};
```

---

## storage.ts (443 lines)

IndexedDB abstraction layer using native IDB API.

### Database Config
- Name: `CircuitMindDB`
- Version: 2
- Stores: inventory, app_state, conversations, messages, action_history

### Key Functions

| Function | Purpose |
|----------|---------|
| `saveInventoryToDB(items)` | Bulk save inventory (clears then adds all) |
| `loadInventoryFromDB()` | Load all inventory items |
| `saveConversation(conv)` | Upsert conversation metadata |
| `listConversations(limit?)` | Get recent conversations |
| `saveMessage(msg)` | Save chat message |
| `loadMessages(convId)` | Load all messages for conversation |
| `recordAction(action)` | Log action for undo support |
| `getRecentActions(limit)` | Get recent action history |

---

## aiContextBuilder.ts (304 lines)

Builds context objects for AI awareness of app state.

### Key Functions

#### `buildAIContext(options)`
Constructs `AIContext` object with:
- Current diagram info (title, component/connection counts)
- Selected component details
- Active view state
- Inventory summary
- Recent actions

#### `buildContextPrompt(context)`
Converts AIContext to text prompt for Gemini:
```
=== CURRENT APP STATE ===
Diagram: "My Circuit"
- 5 components, 8 connections
Active View: canvas
Inventory: 62 components: 6 microcontrollers, 15 sensors...
=== END STATE ===
```

#### `buildProactiveSuggestionContext(options)`
Analyzes state for helpful suggestions:
- Unconnected components
- Missing power supply
- Low stock items
- Incomplete component data

---

## liveAudio.ts (212 lines)

WebSocket connection to Gemini Live for real-time audio.

### LiveSession Class

```typescript
class LiveSession {
  constructor(onStatusChange: (status: string) => void);
  connect(): Promise<void>;
  disconnect(): void;
}
```

### Audio Playback Pattern
Uses `nextStartTime` for gapless playback via Web Audio API.
Handles audio chunks from WebSocket and schedules sequential playback.

---

## responseParser.ts (274 lines)

Parses AI responses and extracts structured data.

### Key Functions

| Function | Purpose |
|----------|---------|
| `parseComponentMentions(text, inventory)` | Extract component references from text |
| `parseActionIntents(text)` | Extract action commands from response |
| `cleanMarkdown(text)` | Strip markdown formatting for display |
