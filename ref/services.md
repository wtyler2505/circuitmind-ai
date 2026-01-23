# CircuitMind AI - Services Reference

## Gemini Service (Modular Architecture)

Located at `services/gemini/`. Refactored from monolithic 923-line file into modular structure.

### client.ts - API Client & Model Routing

```typescript
// Model constants
export const MODELS = {
  CHAT: 'gemini-2.5-flash',
  CHAT_PRO: 'gemini-2.5-pro',
  WIRING: 'gemini-2.5-pro',
  SMART_FILL: 'gemini-2.5-flash',
  CODE_GEN: 'gemini-2.5-flash',
  IMAGE: 'gemini-2.5-flash-image',
  CONCEPT_ART: 'gemini-3-pro-image-preview',
  VIDEO: 'veo-3.1-fast-generate-preview',
  TTS: 'gemini-2.5-flash-preview-tts'
};

// API key from localStorage or env
const getApiKey = (): string => {
  return localStorage.getItem('cm_gemini_api_key') || process.env.API_KEY || '';
};

// Get configured client instance
export const getAIClient = () => new GoogleAI(getApiKey());
```

### features/chat.ts - Chat Operations

| Function | Purpose |
|----------|---------|
| `chatWithAI(content, history, attachment?, deepThinking?)` | General chat |
| `chatWithContext(content, history, context, options)` | Context-aware chat with actions |

Returns structured response with:
- `message` - Text response
- `componentMentions[]` - Referenced components
- `suggestedActions[]` - AI-suggested actions
- `proactiveSuggestion` - Unprompted helpful suggestions

### features/wiring.ts - Diagram Generation

```typescript
generateWiringDiagram(
  prompt: string,
  inventoryContext: string
): Promise<WiringDiagram>
```

- Uses `gemini-2.5-pro` with structured output schema
- Returns `{ title, components[], connections[], explanation }`
- Injects inventory context for component matching

### features/components.ts - Component AI Features

| Function | Purpose |
|----------|---------|
| `explainComponent(name)` | Get detailed component explanation |
| `smartFillComponent(name, type?)` | Auto-fill specs using Google Search |
| `assistComponentEditor(history, component, instruction)` | Editor AI assistant |
| `augmentComponentData(partialName)` | Identify from partial info |
| `findComponentSpecs(query)` | Search for component specs |
| `identifyComponentFromImage(base64)` | Identify component from photo |
| `generateComponent3DCode(name, type, instructions?)` | Generate Three.js code |

### features/media.ts - Image/Video Generation

| Function | Purpose |
|----------|---------|
| `generateConceptImage(prompt, size, aspectRatio)` | Concept art generation |
| `generateCircuitVideo(prompt, aspectRatio, imageBase64?)` | Video generation |
| `transcribeAudio(audioBase64)` | Speech-to-text |
| `generateSpeech(text)` | Text-to-speech |

**Video URL Fix**: Veo URLs require API key appended:
```typescript
const fixedUrl = `${rawUrl}&key=${apiKey}`;
```

### features/suggestions.ts - Proactive Suggestions

```typescript
generateProactiveSuggestion(
  context: AIContext
): Promise<ProactiveSuggestion | null>
```

Analyzes state for:
- Unconnected components
- Missing power supply
- Low stock items
- Incomplete component data

---

## storage.ts - IndexedDB Layer

Database: `CircuitMindDB` v2

### Key Functions

| Function | Purpose |
|----------|---------|
| `initDB()` | Initialize/upgrade database |
| `saveInventoryToDB(items)` | Bulk save (clear + add all) |
| `loadInventoryFromDB()` | Load all items |
| `saveConversation(conv)` | Upsert conversation |
| `listConversations(limit?)` | Get recent conversations |
| `saveMessage(msg)` | Save chat message |
| `loadMessages(convId)` | Load conversation messages |
| `deleteConversation(id)` | Delete with all messages |
| `recordAction(action)` | Log for undo support |
| `getRecentActions(limit)` | Get action history |

### Transaction Pattern

```typescript
const tx = db.transaction([STORES.CONVERSATIONS, STORES.MESSAGES], 'readwrite');
const convStore = tx.objectStore(STORES.CONVERSATIONS);
const msgStore = tx.objectStore(STORES.MESSAGES);

// Multiple operations in single transaction
convStore.delete(id);
msgStore.index('conversationId').openCursor(id).onsuccess = (e) => {
  if (cursor.result) {
    cursor.result.delete();
    cursor.result.continue();
  }
};

tx.oncomplete = () => resolve();
```

---

## aiContextBuilder.ts - AI Context Construction

Builds context objects for AI awareness of app state.

### Key Functions

#### `buildAIContext(options)`

Returns `AIContext` with:
- Current diagram info (title, component/connection counts)
- Selected component details
- Active view state
- Inventory summary
- Recent actions

#### `buildContextPrompt(context)`

Converts AIContext to text for Gemini:
```
=== CURRENT APP STATE ===
Diagram: "My Circuit"
- 5 components, 8 connections
Active View: canvas
Inventory: 62 components: 6 microcontrollers, 15 sensors...
=== END STATE ===
```

---

## componentValidator.ts - Component Validation (433 LOC)

Validates component data integrity.

| Function | Purpose |
|----------|---------|
| `validateComponent(component)` | Full validation with errors/warnings |
| `validatePins(pins)` | Pin array validation |
| `validateConnections(connections, components)` | Connection integrity |
| `checkDuplicatePins(pins)` | Find duplicate pin names |

---

## aiMetricsService.ts - AI Metrics Tracking

Tracks AI operation latency and success rates.

```typescript
aiMetricsService.logMetric({
  model: 'gemini-2.5-flash',
  operation: 'chatWithContext',
  latencyMs: 1234,
  success: true
});

const stats = aiMetricsService.getStats('chatWithContext');
// { avgLatency, successRate, totalCalls }
```

---

## threePrimitives.ts - 3D Primitives (406 LOC)

Library of reusable Three.js primitives for AI-generated 3D models.

| Primitive | Purpose |
|-----------|---------|
| `createPCB(w, h, d)` | Green PCB base |
| `createChip(w, h, d)` | IC package |
| `createPin(count, pitch)` | Pin array |
| `createUSB(type)` | USB connectors |
| `createCapacitor(type)` | Various capacitor types |
| `createLED(color)` | LED with glow effect |
| `createButton()` | Tactile button |
| `createHeader(pins, rows)` | Pin headers |

---

## liveAudio.ts - WebSocket Live Audio

Real-time audio streaming to Gemini Live.

### LiveSession Class

```typescript
class LiveSession {
  constructor(onStatusChange: (status: string) => void);
  connect(): Promise<void>;
  disconnect(): void;
}
```

### Audio Playback

Uses `nextStartTime` for gapless playback:
```typescript
const source = audioContext.createBufferSource();
source.buffer = audioBuffer;
source.connect(audioContext.destination);
source.start(nextStartTime);
nextStartTime += audioBuffer.duration;
```

---

## standardsService.ts - Electronics Standards

Lookup service for IPC-7351 package standards.

```typescript
// Get standard package dimensions
const pkg = standardsService.getPackage('QFP-32');
// { body_width, body_length, height, pitch, pin_count, pin_type }

// Get board layout data
const board = standardsService.getBoardMap('Arduino Uno');
// { name, width, length, components[] }
```

---

## responseParser.ts - AI Response Parsing

Parses AI responses and extracts structured data.

| Function | Purpose |
|----------|---------|
| `parseComponentMentions(text, inventory)` | Extract component references |
| `parseActionIntents(text)` | Extract action commands |
| `cleanMarkdown(text)` | Strip formatting |
| `extractCodeBlocks(text)` | Find code in response |
