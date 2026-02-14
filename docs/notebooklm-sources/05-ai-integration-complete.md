# CircuitMind AI -- Complete AI Integration Reference

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Gemini Client Singleton](#gemini-client-singleton)
3. [Model Configuration Map](#model-configuration-map)
4. [API Key Management](#api-key-management)
5. [Type System and Schemas](#type-system-and-schemas)
6. [Prompt Templates](#prompt-templates)
7. [Response Parsers](#response-parsers)
8. [Feature Modules](#feature-modules)
   - [Wiring Diagram Generation](#wiring-diagram-generation)
   - [Chat (Standard and Context-Aware)](#chat-standard-and-context-aware)
   - [Component Intelligence](#component-intelligence)
   - [Media Generation](#media-generation)
   - [HUD Fragment Generation](#hud-fragment-generation)
   - [Predictive Suggestions](#predictive-suggestions)
   - [Simulation Analysis](#simulation-analysis)
   - [Proactive Suggestions and Project Ideas](#proactive-suggestions-and-project-ideas)
   - [Bill of Materials (BOM)](#bill-of-materials-bom)
   - [Datasheet Extraction](#datasheet-extraction)
   - [Version Summarization](#version-summarization)
9. [Live Audio Streaming](#live-audio-streaming)
10. [AI Context System](#ai-context-system)
11. [RAG and Knowledge Services](#rag-and-knowledge-services)
12. [AI Autonomy and Action Safety](#ai-autonomy-and-action-safety)
13. [Code Generation Sandboxing](#code-generation-sandboxing)
14. [AI Metrics and Observability](#ai-metrics-and-observability)
15. [Standards Service (Grounding Data)](#standards-service-grounding-data)
16. [AI-Related Hooks](#ai-related-hooks)
17. [Module Barrel Export](#module-barrel-export)
18. [Error Handling Patterns](#error-handling-patterns)
19. [Caching Strategies](#caching-strategies)
20. [Critical Gotchas](#critical-gotchas)

---

## Architecture Overview

CircuitMind AI integrates Google Gemini across every layer of the application. The AI subsystem is organized as a modular service architecture under `services/gemini/` with 16 files total:

```
services/gemini/
  client.ts          -- Singleton Gemini client + model constants
  types.ts           -- All TypeScript interfaces + JSON schemas for structured output
  prompts.ts         -- Every prompt template used across the app
  parsers.ts         -- Response parsing, normalization, and extraction
  index.ts           -- Barrel export aggregating all modules
  features/
    wiring.ts        -- Wiring diagram generation (Pro model)
    chat.ts          -- Standard chat + context-aware chat
    components.ts    -- Component CRUD intelligence (7 functions)
    media.ts         -- Image gen, video gen, TTS, transcription, embeddings
    hud.ts           -- Tactical HUD fragment generation
    predictions.ts   -- Predictive design actions
    simulation.ts    -- Circuit simulation analysis
    suggestions.ts   -- Proactive suggestions + project ideas
    bom.ts           -- BOM part detail lookup
    datasheets.ts    -- PDF datasheet extraction
    versioning.ts    -- Diagram diff summarization
```

Supporting services outside `services/gemini/`:

```
services/geminiService.ts       -- Legacy facade, re-exports gemini/index + describeDiagram()
services/liveAudio.ts           -- WebSocket-based live audio session (gemini-2.5-flash-live)
services/aiContextBuilder.ts    -- Builds AIContext objects from app state
services/aiMetricsService.ts    -- Latency/success/satisfaction tracking
services/knowledgeService.ts    -- Hardcoded meta-knowledge bundle (DOCS_BUNDLE)
services/ragService.ts          -- Vector-based RAG with embeddings + cosine similarity
services/threeCodeValidator.ts  -- Whitelist security validator for AI-generated 3D code
services/standardsService.ts    -- IPC-7351 package dimensions + board component maps
```

AI-related hooks:

```
hooks/useAIContextBuilder.ts    -- Reactive context builder + prediction loop
hooks/useEditorAIChat.ts        -- Component editor AI chat session management
```

The AI SDK used is `@google/genai` version 1.34.0, imported as `GoogleGenAI`. All AI calls flow through a singleton client instance obtained via `getAIClient()`.

---

## Gemini Client Singleton

**File**: `services/gemini/client.ts` (75 lines)

The client module establishes a singleton pattern for the Google Generative AI client.

### Exports

| Export | Type | Purpose |
|--------|------|---------|
| `MODELS` | `Record<string, string>` | All 20 model constant mappings |
| `getApiKey()` | `() => string` | Retrieves API key from localStorage or env |
| `getAIClient()` | `() => GoogleGenAI` | Returns or creates singleton instance |
| `resetAIClient()` | `() => void` | Nullifies singleton (for key rotation) |
| `APIError` | `interface` | Extended Error with optional `status?: number` |

### Singleton Lifecycle

```typescript
let aiClientInstance: GoogleGenAI | null = null;

export const getAIClient = (): GoogleGenAI => {
  if (!aiClientInstance) {
    const apiKey = getApiKey();
    aiClientInstance = new GoogleGenAI({ apiKey });
  }
  return aiClientInstance;
};

export const resetAIClient = () => {
  aiClientInstance = null;
};
```

The client is lazily initialized on first use. It allows empty API keys at construction time -- methods will fail later if the key is still empty. Calling `resetAIClient()` forces re-initialization on the next `getAIClient()` call, which is essential when the user changes their API key in Settings.

### Global Window Augmentation

The client declares a global `window.aistudio` interface for AI Studio debugging integration:

```typescript
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
```

This is used by the media generation module to handle 403/PERMISSION_DENIED errors by prompting key selection via AI Studio.

---

## Model Configuration Map

**File**: `services/gemini/client.ts`, lines 6-29

CircuitMind uses 20 named model constants mapping to 8 distinct Google AI model IDs. The choice of model per operation balances accuracy, speed, and cost.

| Constant | Model ID | Category | Used For |
|----------|----------|----------|----------|
| `WIRING` | `gemini-2.5-pro` | Text (Pro) | Wiring diagram generation -- accuracy-critical |
| `CHAT` | `gemini-2.5-flash` | Text (Flash) | Standard chat responses -- speed-optimized |
| `CONTEXT_CHAT_DEFAULT` | `gemini-2.5-flash` | Text (Flash) | Default context-aware chat |
| `CONTEXT_CHAT_COMPLEX` | `gemini-2.5-pro` | Text (Pro) | Complex queries, attachments, grounded search |
| `VISION` | `gemini-2.5-pro` | Multimodal (Pro) | Image/video/document analysis |
| `IMAGE` | `gemini-2.5-flash` | Multimodal (Flash) | Multimodal input processing |
| `IMAGE_GEN` | `imagen-3.0-generate-001` | Image Gen | AI image generation (concept images, thumbnails) |
| `THUMBNAIL` | `imagen-3.0-generate-001` | Image Gen | Component thumbnail generation |
| `VIDEO` | `veo-2.0-generate-001` | Video Gen | Circuit visualization video generation |
| `TTS` | `gemini-2.5-flash-tts` | Audio | Text-to-speech synthesis |
| `AUDIO_REALTIME` | `gemini-2.5-flash-live` | Live Audio | Real-time bidirectional audio streaming |
| `AUDIO_TRANSCRIPTION` | `gemini-2.5-flash` | Audio | Audio-to-text transcription |
| `EMBEDDING` | `text-embedding-004` | Embedding | Semantic search vectors for RAG |
| `CODE_GEN` | `gemini-2.5-pro` | Text (Pro) | Three.js 3D code generation |
| `THINKING` | `gemini-2.5-flash` | Text (Flash) | Deep thinking mode with extended budget |
| `SMART_FILL` | `gemini-2.5-flash` | Text (Flash) | Auto-fill component details via search |
| `ASSIST_EDITOR` | `gemini-2.5-flash` | Text (Flash) | Component editor AI assistant |
| `AUTO_ID` | `gemini-2.5-flash` | Text (Flash) | Component auto-identification |
| `PART_FINDER` | `gemini-2.5-flash` | Text (Flash) | Component search and matching |
| `SUGGEST_PROJECTS` | `gemini-2.5-flash` | Text (Flash) | Project idea generation from inventory |

### Model Selection Strategy

- **Pro models** (`gemini-2.5-pro`): Used for accuracy-critical tasks -- wiring diagrams, complex chat, vision analysis, and 3D code generation.
- **Flash models** (`gemini-2.5-flash`): Used for speed-sensitive tasks -- standard chat, auto-fill, component lookup, suggestions, HUD fragments, predictions.
- **Specialized models**: Imagen 3 for image generation, Veo 2 for video generation, text-embedding-004 for vector embeddings, flash-tts for speech, flash-live for real-time audio.

The chat module (`features/chat.ts`) dynamically upgrades from Flash to Pro based on query complexity: messages longer than 50 characters, or containing keywords like "search", "find", "diagram", or "component" trigger the Pro model with Google Search grounding.

---

## API Key Management

API keys follow a two-tier fallback strategy:

1. **localStorage** (`cm_gemini_api_key`): User-configured via Settings panel. Checked first.
2. **Environment variable** (`process.env.API_KEY`): Fallback for development/CI. Also used as `import.meta.env.GEMINI_API_KEY` via `.env.local`.

```typescript
export const getApiKey = (): string => {
  try {
    const stored = localStorage.getItem('cm_gemini_api_key');
    if (stored) return stored;
  } catch {
    // localStorage not available (SSR or error)
  }
  return process.env.API_KEY || '';
};
```

The `explainComponent()` function in `components.ts` includes explicit API key validation, returning a user-friendly error message if no key is configured. Other functions rely on the SDK throwing errors that are caught and logged.

### Key Rotation

When the user changes their API key in Settings, the app calls `resetAIClient()` to nullify the singleton. The next AI call creates a fresh `GoogleGenAI` instance with the new key.

### AI Studio Integration

The media module checks `window.aistudio` for an AI Studio debugging bridge. If a 403 error occurs, it calls `window.aistudio.openSelectKey()` to prompt key selection, then retries the request.

---

## Type System and Schemas

**File**: `services/gemini/types.ts` (273 lines)

This file defines all TypeScript interfaces for Gemini SDK interactions and all JSON schemas for structured output.

### Content Types

| Type | Purpose |
|------|---------|
| `GeminiTextPart` | `{ text: string }` -- text content part |
| `GeminiInlineDataPart` | `{ inlineData: { mimeType, data } }` -- binary content (images, audio, video, PDF) |
| `GeminiPart` | Union: `GeminiTextPart \| GeminiInlineDataPart` |
| `GeminiChatMessage` | `{ role: 'user' \| 'model', parts: GeminiPart[] }` -- conversation turn |
| `GeminiTool` | `{ googleSearch?, codeExecution? }` -- tool configuration |
| `GeminiConfig` | Extends `GenerateContentConfig` with `imageConfig`, `thinkingConfig` |
| `GeminiGroundingChunk` | `{ web?: { title, uri } }` -- grounding source from search |

### AI Response Types

| Type | Fields | Purpose |
|------|--------|---------|
| `AIComponentMention` | `componentId, componentName?, reason?, status?` | Component referenced in AI response |
| `AISuggestedAction` | `type: ActionType, payload?, payloadJson?, label?, safe?, description?` | Suggested user action |
| `ParsedAIResponse` | `message?, componentMentions?, suggestedActions?, proactiveSuggestion?` | Parsed structured JSON from AI |
| `ContextAwareChatResponse` | `text, componentMentions[], suggestedActions[], proactiveSuggestion?, groundingSources[], metricId?` | Full context-aware chat result |

### Deep Spec Search Types

| Type | Category | Fields |
|------|----------|--------|
| `DeepSpecBoard` | `'board'` | `width, length, height, mounting_holes[], interfaces[]` |
| `DeepSpecComponent` | `'component'` | `package, width, length, height, pitch, pins, datasheet_ref?` |
| `DeepSpecResult` | Union | `DeepSpecBoard \| DeepSpecComponent` |

### JSON Schemas for Structured Output

All schemas use the `@google/genai` `Schema` type with `Type` enum values. Critical rule: **OBJECT types MUST have `properties: {}` or the Gemini API rejects the request.**

| Schema Constant | Type | Purpose | Required Fields |
|----------------|------|---------|-----------------|
| `WIRING_SCHEMA` | OBJECT | Wiring diagram output | `title, components[], connections[], explanation` |
| `COMPONENT_SCHEMA` | OBJECT | Auto-identify result | `name, type, description, pins[]` |
| `PART_FINDER_SCHEMA` | ARRAY | Part search results | Each item: `name, type, description, pins[]` |
| `STRUCTURED_RESPONSE_SCHEMA` | OBJECT | Context-aware chat JSON | `message` (others optional) |
| `SMART_FILL_SCHEMA` | OBJECT | Auto-fill results | None required (all optional) |
| `ASSIST_EDITOR_SCHEMA` | OBJECT | Editor assistant results | `reply, updates, foundImages[], suggestedActions[]` |
| `PROACTIVE_SUGGESTIONS_SCHEMA` | ARRAY | Suggestion list | Array of strings |

#### WIRING_SCHEMA Detail

The wiring schema defines the structure for AI-generated circuit diagrams:

```
{
  title: STRING,
  components: ARRAY of {
    id: STRING ("e.g., mcu1, sens1"),
    name: STRING ("e.g., ESP32, DHT22"),
    type: STRING ("microcontroller, sensor, actuator, power, other"),
    description: STRING,
    pins: ARRAY of STRING
  },
  connections: ARRAY of {
    fromComponentId: STRING,
    fromPin: STRING,
    toComponentId: STRING,
    toPin: STRING,
    description?: STRING,
    color?: STRING (hex)
  },
  explanation: STRING
}
```

#### COMPONENT_SCHEMA Detail

Used for auto-identification. The `type` field has an enum constraint: `['microcontroller', 'sensor', 'actuator', 'power', 'other']`.

---

## Prompt Templates

**File**: `services/gemini/prompts.ts` (390 lines)

All prompts are centralized in the `PROMPTS` object. Most are template functions that accept context parameters.

### Helper Function

```typescript
export const formatInventoryContext = (inventory: ElectronicComponent[]): string
```

Formats inventory as a semicolon-delimited string: `ID:xyz - ComponentName (type) [Pins: VCC, GND, A0]`.

### Prompt Catalog

| Key | Type | Model Target | Purpose |
|-----|------|-------------|---------|
| `WIRING_SYSTEM(inventoryStr)` | Function | `WIRING` (Pro) | System prompt for wiring generation. Instructs AI to reuse exact inventory IDs. |
| `EXPLAIN_COMPONENT(name)` | Function | `CHAT` (Flash) | Generate hobbyist-friendly component explanation (<200 words, Markdown). |
| `SMART_FILL(name, type?)` | Function | `SMART_FILL` (Flash) | Search for technical details: description, pins, datasheet URL, type classification. |
| `ASSIST_EDITOR(json, instruction)` | Function | `ASSIST_EDITOR` (Flash) | Component editor assistant with Google Search. Returns reply, updates, foundImages, suggestedActions. |
| `AUGMENT_COMPONENT(name)` | Function | `AUTO_ID` (Flash) | Identify component and provide type, description, pinout. |
| `FIND_COMPONENT(query)` | Function | `PART_FINDER` (Flash) | Find 3-5 matching real-world components with specs. |
| `IDENTIFY_IMAGE` | Static string | `IMAGE` (Flash) | Identify electronic component from photo. Returns JSON. |
| `SUGGEST_PROJECTS(items)` | Function | `SUGGEST_PROJECTS` (Flash) | Suggest 3 creative projects from inventory. Markdown list format. |
| `CHAT_SYSTEM` | Static string | `CHAT` (Flash) | System prompt for standard chat. "You are CircuitMind." |
| `TRANSCRIBE_AUDIO` | Static string | `AUDIO_TRANSCRIPTION` (Flash) | "Transcribe the following audio exactly." |
| `GENERATE_THUMBNAIL(name)` | Function | `THUMBNAIL` (Imagen 3) | Studio photo prompt for component thumbnail generation. |
| `GENERATE_VIDEO(prompt?)` | Function | `VIDEO` (Veo 2) | Video generation prompt with fallback to default cinematic circuit visualization. |
| `ANALYZE_COMPONENT_VISUALS` | Static string | `IMAGE` (Flash) | PCB reverse engineering vision prompt. Returns topological map JSON. |
| `GENERATE_3D_CODE(name, type, instructions, dimensionHint, visualAnalysis, precisionLevel)` | Function | `CODE_GEN` (Pro) | Master 3D architect prompt for Three.js code generation. Supports "draft" and "masterpiece" precision levels. |
| `CONTEXT_AWARE_CHAT(context, tone, message, enableProactive)` | Async function | `CONTEXT_CHAT_*` | Full context-aware system prompt with RAG knowledge injection. |
| `PROACTIVE_SUGGESTIONS(context, components?, connections?)` | Function | `CONTEXT_CHAT_DEFAULT` (Flash) | Generate 1-3 actionable improvement suggestions. |
| `GENERATE_HUD_FRAGMENT(name, type, context?)` | Function | `PART_FINDER` (Flash) | 1-sentence technical insight for Tactical HUD (max 100 chars). |
| `GENERATE_PREDICTIONS(context)` | Function | `PART_FINDER` (Flash) | Predict 3 most likely next design actions. Categories: connectivity, safety, config. |

### Context-Aware Chat Prompt (Detailed)

The `CONTEXT_AWARE_CHAT` prompt is the most complex -- it is an async function that:

1. Calls `buildContextPrompt(context)` to serialize current app state
2. Checks if the message is a "meta question" about the app itself (keywords: "how do i", "shortcut", "sidebar", "3d mode", "what is")
3. For meta questions, performs RAG search via `ragService.search()` with fallback to static `knowledgeService.getAllKnowledge()`
4. Assembles a system prompt with:
   - Full app state context (diagram, inventory, selected component, viewport, timeline)
   - Knowledge base injection (RAG results or static bundle)
   - Referential integrity rules (resolve "this"/"that" via selection context)
   - Temporal awareness rules (resolve "previous"/"last" via timeline)
   - Adaptive instruction (tone from user profile: sass, concise, or technical)
   - Available action types list
   - Required JSON response format matching `STRUCTURED_RESPONSE_SCHEMA`
   - Optional proactive mode activation

### 3D Code Generation Prompt (Detailed)

The `GENERATE_3D_CODE` prompt instructs the AI to act as a "Master 3D Electronic Component Architect from the year 2026." It includes:

- Precision level toggle: "DRAFT EDITION" (basic primitives) vs "MASTERPIECE EDITION" (PBR materials, solder fillets, silk-screen)
- Mandatory layout engine: Must use `Primitives.createLayout(width, length)` with anchor-based placement
- Assembly layering order: PCB -> Flux Residue -> Major Components -> Details
- Self-correction: A second AI pass reviews the generated code for syntax errors, magic numbers, and missing `return group;`
- Output format: Raw JavaScript statements (no function wrapper, no markdown)

---

## Response Parsers

**File**: `services/gemini/parsers.ts` (92 lines)

Three exported parser functions handle AI response normalization.

### `parseJSONResponse<T>(text: string): T`

Generic JSON parser that strips markdown code block wrappers (`\`\`\`json ... \`\`\``) before parsing. Throws on failure for caller handling.

### `extractComponentMentions(parsedMentions, messageText): ComponentReference[]`

Converts `AIComponentMention[]` to `ComponentReference[]` with character-level mention positions. Performs case-insensitive substring search to find where each component name appears in the message text.

### `extractSuggestedActions(parsedActions): ActionIntent[]`

Converts `AISuggestedAction[]` to `ActionIntent[]`. Handles multiple payload formats:
- `payloadJson` string: Strips backtick wrappers, parses JSON. Falls back to treating short non-JSON strings as `{ componentId: value }`.
- `payload` object: Used directly as legacy fallback.
- `safe` field: Defaults to `false` if not specified.

### `normalizeProactiveSuggestions(input: unknown): string[]`

Normalizes AI suggestion output to a clean string array (max 3 items). Handles both plain string arrays and `{ label: string }` object arrays.

---

## Feature Modules

### Wiring Diagram Generation

**File**: `services/gemini/features/wiring.ts` (64 lines)

**Function**: `generateWiringDiagram(prompt, inventoryContext): Promise<WiringDiagram>`

| Aspect | Detail |
|--------|--------|
| Model | `MODELS.WIRING` = `gemini-2.5-pro` (highest accuracy) |
| Schema | `WIRING_SCHEMA` with `responseMimeType: "application/json"` |
| System instruction | "Favor components from inventory. Use precise IDs from context." |
| Post-processing | Runs `circuitAnalysisService.analyze(result)` to check for issues |
| Metrics | Logs to `aiMetricsService` with operation `'generateWiringDiagram'` |

The function formats the user's inventory context into the system prompt, instructing the AI to reuse exact component IDs from the inventory. After generation, the result is validated by the circuit analysis service which checks for short circuits, floating pins, and voltage mismatches.

---

### Chat (Standard and Context-Aware)

**File**: `services/gemini/features/chat.ts` (300 lines)

Two main functions with dynamic model selection.

#### `chatWithAI(message, history, attachmentBase64?, attachmentType?, useDeepThinking?)`

Returns: `{ text: string, groundingSources: GroundingSource[] }`

**Model Selection Logic** (priority order):
1. Video attachment -> `CONTEXT_CHAT_COMPLEX` (Pro) with video inline data
2. Image attachment -> `CONTEXT_CHAT_COMPLEX` (Pro) with image inline data
3. Document attachment -> `CONTEXT_CHAT_COMPLEX` (Pro) with PDF inline data
4. Deep thinking enabled -> `THINKING` (Flash) with `thinkingBudget: 32768`
5. Complex query (>50 chars or contains "search"/"find"/"latest") -> `CONTEXT_CHAT_COMPLEX` (Pro) with `googleSearch` tool
6. Default -> `CHAT` (Flash)

**Connectivity check**: Returns offline message if `connectivityService.getIsOnline()` is false.

**Metrics**: Records latency via both `healthMonitor.recordAiLatency()` and `aiMetricsService.logMetric()`.

**Audit**: Logs request/response details via `auditService.log()`.

#### `chatWithContext(message, history, context, options?)`

Returns: `ContextAwareChatResponse` with parsed structured data.

This is the primary chat function used by the main chat panel. It adds:

- **Adaptive persona**: Reads user profile for tone preference (`sass`, `concise`, `technical`) and expertise level (`beginner`, `pro`)
- **Structured output**: When no tools are active, uses `responseMimeType: "application/json"` with `STRUCTURED_RESPONSE_SCHEMA`
- **JSON fallback**: If structured parsing fails, falls back to `{ message: rawText }`
- **Component mentions**: Extracted with character positions for UI highlighting
- **Suggested actions**: Parsed with payload normalization
- **Proactive suggestions**: Optional field for unsolicited tips
- **Grounding sources**: Web search result citations
- **Metric ID**: Returned for user satisfaction feedback tracking

**Important**: `responseMimeType: "application/json"` is **incompatible with tools** (like Google Search). When tools are enabled, structured output is disabled and the response is parsed as best-effort JSON.

---

### Component Intelligence

**File**: `services/gemini/features/components.ts` (525 lines)

The largest feature module with 7 exported functions covering the full component lifecycle.

#### `explainComponent(componentName): Promise<string>`

- Model: `CHAT` (Flash)
- Returns Markdown explanation for hobbyists (<200 words)
- Explicit API key validation with user-friendly error messages for: invalid key, rate limiting, network errors
- Metrics tracked

#### `smartFillComponent(name, type?): Promise<Partial<ElectronicComponent>>`

- Model: `SMART_FILL` (Flash)
- Uses `googleSearch` tool for real-time component data lookup
- Returns partial component data: description, pins, datasheetUrl, type
- Note: `responseMimeType: "application/json"` is unsupported when tools are used

#### `assistComponentEditor(history, currentComponent, userInstruction): Promise<{reply, updates, foundImages, suggestedActions}>`

- Model: `ASSIST_EDITOR` (Flash)
- Multi-turn conversation with full chat history
- Uses `googleSearch` tool to find images, datasheets, 3D models
- Returns structured response with field updates, found images, and suggested actions (`GENERATE_IMAGE`, `GENERATE_3D`)

#### `augmentComponentData(partialName): Promise<Partial<ElectronicComponent>>`

- Model: `AUTO_ID` (Flash)
- Schema: `COMPONENT_SCHEMA` with JSON response mode
- Auto-identifies a component from a partial name and returns standardized data

#### `findComponentSpecs(query): Promise<Partial<ElectronicComponent>[]>`

- Model: `PART_FINDER` (Flash)
- Schema: `PART_FINDER_SCHEMA` with JSON response mode
- Returns 3-5 matching real-world components

#### `identifyComponentFromImage(imageBase64): Promise<Partial<ElectronicComponent>>`

- Model: `IMAGE` (Flash multimodal)
- Takes base64 image, strips data URI prefix
- Returns component identification as JSON

#### `performDeepSpecSearch(name, type): Promise<DeepSpecResult | null>`

- Model: `SMART_FILL` (Flash) with `googleSearch` tool
- Searches for mechanical specifications from datasheets
- Returns either `DeepSpecBoard` (PCB dimensions, mounting holes, interfaces) or `DeepSpecComponent` (package, dimensions, pitch, pin count)
- Board detection heuristic: checks if type contains "board"/"module"/"breakout" or name contains "shield"/"hat"

#### `generateComponent3DCode(name, type, customInstructions?, force?, imageUrl?, precisionLevel?): Promise<string>`

- Model: `CODE_GEN` (Pro) with `thinkingConfig: { thinkingBudget: 4096 }` and `googleSearch`
- Multi-pass generation pipeline:
  1. **Grounding pass**: Check `standardsService` for IPC package data or board maps. If not found, call `performDeepSpecSearch()`.
  2. **Visual analysis pass**: If `imageUrl` provided and no hardcoded board map, use `ANALYZE_COMPONENT_VISUALS` prompt to extract topological map.
  3. **Assembly pass**: Generate Three.js code using `GENERATE_3D_CODE` prompt with all grounding data.
  4. **Self-correction pass**: Review code with `CHAT` (Flash) model for syntax errors, magic numbers, missing returns.
  5. **Cleanup**: Strip markdown, prose headers, arrow function wrappers, trailing garbage after `return group;`.
- **Caching**: Generated code stored in `localStorage` with key `cm_3d_code_{name}_{type}_{instructions}_{hasImage}_{precision}`. Cache bypassed with `force: true`.
- **Validation**: Rejects code shorter than 20 characters.

---

### Media Generation

**File**: `services/gemini/features/media.ts` (246 lines)

Handles all non-text AI modalities: audio, images, video, and embeddings.

#### `transcribeAudio(audioBase64): Promise<string>`

- Model: `AUDIO_TRANSCRIPTION` (Flash)
- Strips data URI prefix, sends as `audio/wav` inline data
- Returns transcription text

#### `generateSpeech(text): Promise<string>`

- Model: `TTS` (gemini-2.5-flash-tts)
- Config: `responseModalities: [Modality.AUDIO]`, voice: `'Kore'`
- Returns base64-encoded audio data from `inlineData.data`

#### `generateEditedImage(imageBase64, prompt): Promise<string>`

- Model: `IMAGE_GEN` (Imagen 3)
- Takes existing image + edit prompt for image-to-image editing
- Returns base64 image data

#### `generateConceptImage(prompt, size, aspectRatio?, enableSearch?): Promise<string>`

- Model: `IMAGE_GEN` (Imagen 3)
- Size options: `'1K'`, `'2K'`, `'4K'`
- Aspect ratio: Configurable (default `'16:9'`)
- Optional `googleSearch` tool for reference-grounded generation
- **AI Studio integration**: Checks `window.aistudio.hasSelectedApiKey()` before request. On 403, calls `openSelectKey()` and retries.
- Creates a fresh `GoogleGenAI` instance per call (not the singleton) for `imageConfig` support

#### `generateComponentThumbnail(componentName, customPrompt?): Promise<string>`

- Wrapper around `generateConceptImage()` with `'1K'` size, `'1:1'` aspect ratio, search enabled
- Uses `PROMPTS.GENERATE_THUMBNAIL(componentName)` for studio photo prompt

#### `generateCircuitVideo(prompt, aspectRatio, imageBase64?): Promise<string>`

- Model: `VIDEO` (Veo 2 -- veo-2.0-generate-001)
- Uses `generateVideos` API (async operation with polling)
- Polls every 5 seconds until `operation.done`
- **Important gotcha**: Returns `${videoUri}&key=${apiKey}` -- Veo URLs require the API key appended
- Supports optional input image for image-to-video generation
- Resolution: `'720p'`, `numberOfVideos: 1`
- AI Studio integration for 403 retry

#### `embedText(text): Promise<number[]>`

- Model: `EMBEDDING` (text-embedding-004)
- Uses `ai.models.embedContent()` API
- Returns float vector array from `result.embeddings[0].values`
- Used by RAG service for semantic search

---

### HUD Fragment Generation

**File**: `services/gemini/features/hud.ts` (49 lines)

#### `generateHUDFragment(targetName, targetType, context?): Promise<string>`

- Model: `PART_FINDER` (Flash)
- Config: `maxOutputTokens: 50`, `temperature: 0.2`
- Returns a punchy 1-sentence technical insight (max 100 characters) for the Tactical HUD overlay
- Truncates to 97 chars + "..." if over limit
- **In-memory cache**: `Map<string, string>` keyed by `{name}-{type}-{context}`. Prevents redundant API calls for the same component.
- Strips markdown formatting (`*`, `#`, backticks)
- Fallback: `'DATA ERROR: Specifications unavailable.'`

---

### Predictive Suggestions

**File**: `services/gemini/features/predictions.ts` (40 lines)

#### `generatePredictions(context: AIContext): Promise<PredictiveAction[]>`

- Model: `PART_FINDER` (Flash)
- Config: `temperature: 0.3`, `responseMimeType: "application/json"`
- Returns 3 most likely next design actions categorized as:
  - `connectivity`: Missing wires or standard connections (GND, VCC, I2C)
  - `safety`: Missing protection components (resistors, capacitors)
  - `config`: Setting component values or naming nodes
- Each prediction has: `id`, `type`, `action` (with `type`, `payloadJson`, `label`, `safe`), `confidence` (0-1), `reasoning`
- Post-processes `payloadJson` strings back to parsed objects

---

### Simulation Analysis

**File**: `services/gemini/features/simulation.ts` (39 lines)

#### `analyzeSimulation(result: SimulationResult): Promise<string>`

- Model: `CONTEXT_CHAT_DEFAULT` (Flash)
- Analyzes simulation results for: direct short circuits, floating pin errors, over-voltage risks
- Returns professional engineering safety summary
- **Connectivity check**: Returns offline message if not connected
- Fallback: `'Analysis unavailable due to system error.'`

---

### Proactive Suggestions and Project Ideas

**File**: `services/gemini/features/suggestions.ts` (61 lines)

#### `suggestProjectsFromInventory(inventory: ElectronicComponent[]): Promise<string>`

- Model: `SUGGEST_PROJECTS` (Flash)
- Formats inventory as comma-delimited `name (quantity)` list
- Returns Markdown list of 3 creative project ideas with bold titles
- Mentions if extra common parts (resistors, wires) are needed

#### `generateProactiveSuggestions(context, diagramComponents?, diagramConnections?): Promise<string[]>`

- Model: `CONTEXT_CHAT_DEFAULT` (Flash)
- Schema: `PROACTIVE_SUGGESTIONS_SCHEMA` with JSON response mode
- Returns 1-3 brief actionable suggestions (each under 100 characters)
- Uses `normalizeProactiveSuggestions()` parser for format normalization

---

### Bill of Materials (BOM)

**File**: `services/gemini/features/bom.ts` (40 lines)

#### `fetchPartDetails(items: BOMItem[]): Promise<Partial<BOMItem>[]>`

- Model: `PART_FINDER` (Flash)
- Config: `temperature: 0.2`, `responseMimeType: "application/json"`
- Takes BOM items with name and type, returns enriched data: MPN (Manufacturer Part Number), estimated price (USD), datasheet URL
- Returns empty array on failure (non-throwing)

---

### Datasheet Extraction

**File**: `services/gemini/features/datasheets.ts` (58 lines)

#### `extractPinoutFromPDF(base64Data: string): Promise<ScrapedMetadata | null>`

- Model: `CONTEXT_CHAT_DEFAULT` (Flash) with multimodal PDF input
- Config: `temperature: 0.1`, `responseMimeType: "application/json"`
- Extracts from PDF datasheets:
  - Pin configuration: number, name, function
  - Absolute maximum ratings: voltageMin, voltageMax, currentLimit
  - Logic level: `"3.3V"`, `"5V"`, `"Adjustable"`, `"Other"`
  - Confidence score: 0 to 1
- Returns null on failure

---

### Version Summarization

**File**: `services/gemini/features/versioning.ts` (34 lines)

#### `summarizeDiagramDiff(diff: DiffSet): Promise<string>`

- Model: `CONTEXT_CHAT_DEFAULT` (Flash)
- Takes a `DiffSet` with added/removed/modified components and connections
- Returns Git commit-style summary: `"AI Summary: [description]"`
- Fallback: `'AI Summary: Structural modifications to diagram.'`

---

## Live Audio Streaming

**File**: `services/liveAudio.ts` (312 lines)

The `LiveSession` class manages real-time bidirectional audio streaming with Gemini Live.

### Architecture

```
Microphone -> ScriptProcessorNode -> PCM16 Base64 -> WebSocket -> Gemini Live
                                                                      |
Browser <-- AudioBufferSourceNode <-- PCM16 Decode <-- WebSocket <-- Model Audio
```

### Configuration Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `INPUT_SAMPLE_RATE` | 16000 Hz | Microphone capture rate |
| `OUTPUT_SAMPLE_RATE` | 24000 Hz | Model audio playback rate |
| `MODEL_NAME` | `MODELS.AUDIO_REALTIME` (`gemini-2.5-flash-live`) | Live streaming model |

### Class: `LiveSession`

**Constructor**: `new LiveSession(onStatusChange: (status: string) => void)`

Creates a fresh `GoogleGenAI` instance (not the singleton) and accepts a status callback.

**Status values**: `'connecting'`, `'active'`, `'disconnected'`, `'error'`

#### Key Methods

| Method | Purpose |
|--------|---------|
| `setVisualContextProviders(providers)` | Register functions that return canvas/camera Blobs for multimodal context |
| `connect()` | Initialize audio contexts, get user media, establish WebSocket connection |
| `disconnect()` | Close session, cleanup all resources |

#### `connect()` Flow

1. Create input `AudioContext` at 16kHz, output `AudioContext` at 24kHz
2. Create `GainNode` for output volume control
3. Request microphone access via `navigator.mediaDevices.getUserMedia({ audio: true })`
4. Call `ai.live.connect()` with:
   - Model: `gemini-2.5-flash-live`
   - Response modalities: `[Modality.AUDIO]`
   - Voice: `'Kore'` (prebuilt voice)
   - System instruction: CircuitMind electronics assistant persona
   - Callbacks: `onopen`, `onmessage`, `onclose`, `onerror`
5. On open: Start audio input pipeline + visual context stream

#### Audio Input Pipeline (`startAudioInput`)

- Creates `MediaStreamAudioSourceNode` from microphone stream
- Uses `ScriptProcessorNode` (4096 buffer, mono) for raw PCM access
- On each audio chunk:
  1. Get `Float32Array` channel data
  2. Convert to PCM16 Int16 via `pcm16BlobFromFloat32()` (clamp + scale)
  3. Encode to Base64 via custom `encode()` function
  4. Send via `session.sendRealtimeInput({ media: { data, mimeType: 'audio/pcm;rate=16000' } })`

#### Visual Context Stream (`startVisualContextStream`)

- Sends visual snapshots every 5 seconds via `setInterval`
- Uses `requestIdleCallback` (with `setTimeout` fallback) for non-blocking capture
- Iterates through registered `visualContextProviders`, converting each `Blob` to Base64
- Sends as `inlineData` parts with `mimeType: 'image/jpeg'`
- Enables multimodal context: the AI can see the diagram canvas + camera feed while listening

#### Audio Output (`handleServerMessage`)

- Handles `serverContent.interrupted` by stopping all playing audio sources
- Extracts `base64Audio` from `serverContent.modelTurn.parts[0].inlineData.data`
- Decodes PCM16 to `AudioBuffer` via `audioBufferFromPcm16()`: Int16 -> Float32 normalization
- Schedules playback with seamless chaining: `nextStartTime += audioBuffer.duration`
- Tracks active `AudioBufferSourceNode` instances for cleanup

#### Cleanup (`cleanup()`)

Thorough resource disposal:
- Stop all media tracks
- Disconnect and close ScriptProcessor, MediaStreamSource
- Close input AudioContext
- Clear visual context interval
- Stop all active audio sources, clear the Set
- Close output AudioContext
- Null all references, reset `nextStartTime`

### Critical Note

`liveSessionRef` in the UI components uses `useRef`, NOT `useState`. This is because the WebSocket session object must not trigger re-renders and must persist across renders.

---

## AI Context System

**File**: `services/aiContextBuilder.ts` (316 lines)

Builds comprehensive context objects that give the AI awareness of the full application state.

### Core Interface: `AIContext`

```typescript
interface AIContext {
  currentDiagramId?: string;
  currentDiagramTitle?: string;
  componentCount: number;
  connectionCount: number;
  selectedComponentId?: string;
  selectedComponentName?: string;
  activeSelectionPath?: string;  // e.g., "esp32-1.pins.GPIO13"
  componentList?: string[];
  recentActions: string[];
  recentHistory?: ActionDelta[];
  activeView: 'canvas' | 'component-editor' | 'inventory' | 'settings';
  inventorySummary: string;
  userProfile?: unknown;
  relevantLessons?: unknown[];
  viewport?: string;
}
```

### Exported Functions

#### `buildAIContext(options: BuildContextOptions): Promise<AIContext>`

Assembles the full context from:
- Diagram state (title, components, connections)
- Inventory (summarized by type counts)
- Selected component (from inventory or diagram)
- Active view
- Viewport (zoom level, pan offset)
- Recent actions (from `storage.getRecentActions()`)
- Recent history (`ActionDelta[]` for timeline awareness)
- User profile (from `userProfileService`)
- Relevant lessons (from `correctionService` for prior user corrections)

#### `buildContextPrompt(context: AIContext): string`

Serializes `AIContext` to a text prompt section with clear delimiters:

```
=== CURRENT APP STATE ===
User: Tyler (pro)
Tone Preference: technical
Diagram: "LED Blinker"
- 3 components, 4 connections
Components on Canvas:
  - [mcu1] Arduino Uno (microcontroller)
  - [led1] Red LED (actuator)
Selected: Arduino Uno (ID: mcu1)
Focus Path: mcu1.pins.GPIO13
Active View: canvas
Inventory: 5 components: 2 microcontrollers, 2 sensors, 1 power
Timeline Awareness (Recent Actions):
  - [10:30:15] addComponent (component_add)
Prior User Corrections:
  - When asked "how to blink LED", do NOT say "use delay()". Instead: use millis() for non-blocking
=== END STATE ===
```

#### `buildDetailedDiagramContext(diagram: WiringDiagram): string`

Generates a Markdown-formatted diagram description with full component list (including FZPZ pin data), descriptions, and connection traces.

#### `buildProactiveSuggestionContext(options: BuildContextOptions): string`

Builds a targeted context for proactive suggestions by analyzing:
- Unconnected components
- Low component count (<3)
- Missing power supply
- Low stock items
- Selected component missing datasheet

---

## RAG and Knowledge Services

### Knowledge Service

**File**: `services/knowledgeService.ts` (77 lines)

Provides a hardcoded `DOCS_BUNDLE` array of meta-knowledge documents about the app itself. Three documents:

1. **Component Reference**: DiagramCanvas features, Inventory, ThreeViewer security, ComponentEditorModal tabs
2. **Architecture & State**: Global state structure, layout z-index, file upload handling
3. **Shortcuts**: Keyboard shortcuts (Ctrl+0 reset, +/- zoom, Space+drag pan)

| Method | Purpose |
|--------|---------|
| `knowledgeService.search(query)` | Case-insensitive substring search across titles and content |
| `knowledgeService.getAllKnowledge()` | Returns all documents concatenated |

### RAG Service

**File**: `services/ragService.ts` (101 lines)

Vector-based retrieval-augmented generation using embeddings and cosine similarity.

| Method | Purpose |
|--------|---------|
| `ragService.init()` | Load from localStorage (`cm_vector_store`) or bootstrap from `DOCS_BUNDLE` |
| `ragService.bootstrapKnowledge()` | Chunk `DOCS_BUNDLE` by headers, embed each chunk, store |
| `ragService.addDocument(id, content, metadata)` | Embed content and add to chunk store |
| `ragService.search(query, limit?)` | Embed query, rank chunks by cosine similarity, return top N |
| `ragService.save()` | Persist chunks to localStorage |

**Chunk Interface**:
```typescript
interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: { source: string; title: string };
  embedding?: number[];
}
```

**Cosine Similarity**: Standard dot product / (norm_a * norm_b) implementation.

**Usage in AI Pipeline**: The `CONTEXT_AWARE_CHAT` prompt checks if the user's message is a meta-question. If so, it initializes the RAG service (lazy) and searches for relevant knowledge chunks. Results are injected into the system prompt as `RELEVANT KNOWLEDGE BASE`. Falls back to static `knowledgeService.getAllKnowledge()` if RAG returns no results.

---

## AI Autonomy and Action Safety

**File**: `types.ts`, lines 81-290

### Action Type Enum

All 23 action types that the AI can suggest:

| Category | Actions | Default Safe |
|----------|---------|:------------:|
| Viewport | `highlight`, `centerOn`, `zoomTo`, `panTo`, `resetView`, `highlightWire` | Yes |
| UI State | `openInventory`, `closeInventory`, `openSettings`, `closeSettings`, `toggleSidebar`, `setTheme`, `openComponentEditor`, `switchGenerationMode` | Yes |
| Project State | `undo`, `redo`, `saveDiagram` | Yes |
| Project State | `loadDiagram` | No |
| Diagram Editing | `addComponent`, `updateComponent`, `removeComponent`, `clearCanvas`, `createConnection`, `removeConnection` | No |
| Forms | `fillField`, `saveComponent` | No |
| User Profile | `setUserLevel`, `learnFact` | Yes |
| Vision | `analyzeVisuals` | Yes |

### Safety Classification (`ACTION_SAFETY`)

The `ACTION_SAFETY` record maps every `ActionType` to a boolean. `true` = safe to auto-execute, `false` = requires user confirmation.

**Safe actions** (auto-execute): All viewport, UI state, undo/redo/save, profile, and vision actions.
**Unsafe actions** (require confirmation): All diagram mutations, form operations, and loadDiagram.

### Autonomy Settings (`AIAutonomySettings`)

```typescript
interface AIAutonomySettings {
  autoExecuteSafeActions: boolean;
  customSafeActions: ActionType[];
  customUnsafeActions: ActionType[];
}
```

Users can override the default safety classification by adding actions to `customSafeActions` or `customUnsafeActions`. The `autoExecuteSafeActions` toggle disables all auto-execution.

### Action Execution Flow

```
AI Response -> Parse suggestedActions -> For each action:
  1. Check ACTION_SAFETY[action.type]
  2. Check user overrides (customSafe/customUnsafe)
  3. If safe && autoExecuteSafeActions: auto-execute immediately
  4. If unsafe: render confirmation button in chat UI
  5. Log to aiMetricsService + auditService
```

---

## Code Generation Sandboxing

**File**: `services/threeCodeValidator.ts` (66 lines)

Security validator for AI-generated Three.js code before execution.

### Approach: Whitelist-Based Validation

#### Forbidden Patterns (Blocklist)

| Pattern | Threat |
|---------|--------|
| `eval(`, `Function(` | Arbitrary code execution |
| `import(`, `require(` | Module loading |
| `fetch(`, `XMLHttpRequest`, `WebSocket` | Network access |
| `window`, `document` | DOM access |
| `localStorage`, `sessionStorage`, `cookie` | Storage access |
| `postMessage`, `self[`, `globalThis` | Scope escape |
| `Process`, `child_process` | System access |
| `__proto__`, `constructor[` | Prototype pollution |

#### Required Patterns (Must use at least one)

- `THREE.` -- Three.js namespace
- `Primitives.` or `Materials.` -- App-provided safe APIs

#### Validation Result

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

#### Length Limit

Maximum code length: 50,000 characters (50KB).

### Execution Environment

The validated code runs inside a `new Function()` body (not a `<script>` tag) with `THREE`, `Primitives`, and `Materials` injected as available globals. This provides a sandboxed scope -- the code cannot access the outer application scope.

---

## AI Metrics and Observability

**File**: `services/aiMetricsService.ts` (108 lines)

### Metric Interface

```typescript
interface AIMetric {
  id: string;
  timestamp: number;
  model: string;
  operation: string;
  latencyMs: number;
  success: boolean;
  userSatisfaction?: number;  // 1-5 rating
  error?: string;
}
```

### Engineering Event Interface

```typescript
interface EngineeringEvent {
  id: string;
  timestamp: number;
  type: 'action_execute' | 'diagram_update' | 'ai_suggestion_accept' | 'ai_suggestion_reject' | 'checkpoint_created';
  payload: Record<string, unknown>;
}
```

### Storage

- Metrics: `localStorage.cm_ai_metrics` (max 1000 entries, FIFO eviction)
- Events: `localStorage.cm_eng_events` (max 1000 entries, FIFO eviction)

### Class: `EngineeringMetricsService`

| Method | Purpose |
|--------|---------|
| `logAiMetric(metric)` | Log AI call, returns UUID for feedback tracking |
| `getAverageLatency(operation?)` | Mean latency in ms, optionally filtered by operation |
| `getSuccessRate(operation?)` | Success percentage, optionally filtered by operation |
| `logEvent(type, payload)` | Log engineering event (action execution, suggestion acceptance) |
| `getAiMetrics()` | Retrieve all stored AI metrics |
| `getEvents()` | Retrieve all stored engineering events |
| `recordAiFeedback(metricId, score)` | Attach user satisfaction score to a specific metric |

### Legacy Compatibility Shim

The `aiMetricsService` export wraps the class methods for backward compatibility:

```typescript
export const aiMetricsService = {
  logMetric: (m) => engineeringMetricsService.logAiMetric(m),
  recordFeedback: (id, s) => engineeringMetricsService.recordAiFeedback(id, s),
  getMetrics: () => engineeringMetricsService.getAiMetrics(),
  getAverageLatency: (op?) => engineeringMetricsService.getAverageLatency(op),
  getSuccessRate: (op?) => engineeringMetricsService.getSuccessRate(op)
};
```

### Metrics Pipeline

Every AI function call follows this pattern:
```
const startTime = Date.now();
try {
  const response = await ai.models.generateContent({...});
  aiMetricsService.logMetric({ model, operation, latencyMs: Date.now() - startTime, success: true });
  return result;
} catch (error) {
  aiMetricsService.logMetric({ model, operation, latencyMs: Date.now() - startTime, success: false, error: String(error) });
  throw error;
}
```

The `healthMonitor.recordAiLatency()` is also called in the chat module for system-wide health tracking.

---

## Standards Service (Grounding Data)

**File**: `services/standardsService.ts` (97 lines)

Provides IPC-7351 standard package dimensions and hardcoded board component maps for grounding AI-generated 3D models.

### IPC Package Lookup

```typescript
interface IPCPackage {
  body_width: number;
  body_length: number;
  height: number;
  pitch?: number;
  pin_count: number;
  pin_type: 'gullwing' | 'through-hole' | 'chip';
}
```

`standardsService.getPackage(name)`: Looks up component package dimensions from `assets/standards/ipc_dimensions.json`. Supports exact match, normalized match (uppercase, hyphen-separated), and substring match.

### Board Component Maps

Three hardcoded board definitions:

| Board | Dimensions | Sub-components |
|-------|-----------|----------------|
| Arduino Uno R3 | 68.6 x 53.3mm | ATmega328P (DIP-28), USB-B, Barrel Jack, 4 headers, 16MHz oscillator, Reset button |
| ESP32 DevKit V1 | 28.0 x 54.6mm | ESP32-WROOM chip, Micro-USB, 2 pin headers (15 each), EN + BOOT buttons |
| Raspberry Pi Pico | 21.0 x 51.0mm | RP2040 chip, Micro-USB, 2 pin headers (20 each), BOOTSEL button |

`standardsService.getBoardMap(name)`: Looks up board maps with normalized name matching.

These maps provide exact placement coordinates for the 3D code generation prompt, eliminating the need for AI to guess component positions on well-known boards.

---

## AI-Related Hooks

### `useAIContextBuilder`

**File**: `hooks/useAIContextBuilder.ts` (86 lines)

React hook that reactively builds `AIContext` from current app state and runs a prediction loop.

**Parameters**: diagram, inventory, canvasSelectionId, selectedComponent, isSettingsOpen, recentHistory, activeSelectionPath, canvasRef, isLoading, aiActions

**Behavior**:
1. Rebuilds `AIContext` via `buildAIContext()` whenever dependencies change
2. Runs `predictionEngine.predict(aiContext)` 1.5 seconds after context stabilizes
3. Stages predicted actions via `aiActions.stageActions(predictions)`

**Returns**: `AIContext | null`

### `useEditorAIChat`

**File**: `hooks/useEditorAIChat.ts` (216 lines)

Manages the AI chat session within the ComponentEditorModal.

**State**: `showAiChat`, `chatInput`, `chatMessages[]`, `isChatLoading`

**Key function -- `handleSendChat(overrideInput?)`**:
1. Adds user message to chat
2. Builds current component state from form values
3. Converts chat messages to API history format
4. Calls `assistComponentEditor()` with history, component data, and instruction
5. Applies returned `updates` to form fields via `applyUpdates()`
6. Adds AI response with optional `foundImages` and `suggestedActions` (`GENERATE_IMAGE`, `GENERATE_3D`)

**`selectFoundImage(url)`**: Sets form image URL and adds confirmation to chat.

**`handleAction(action)`**: Triggers image generation or 3D model generation + tab switch.

**`applyUpdates(updates, setters)`**: Maps partial ElectronicComponent fields to individual form setter functions (name, type, description, pins, datasheetUrl, threeDModelUrl, imageUrl, quantity).

---

## Module Barrel Export

**File**: `services/gemini/index.ts` (19 lines)

Aggregates all exports from the gemini module:

```typescript
// Core exports
export * from './types';
export * from './client';
export * from './prompts';
export * from './parsers';

// Feature exports
export * from './features/wiring';
export * from './features/components';
export * from './features/chat';
export * from './features/media';
export * from './features/suggestions';
export * from './features/hud';
export * from './features/predictions';
export * from './features/simulation';
export * from './features/bom';
export * from './features/datasheets';
export * from './features/versioning';
```

The legacy `services/geminiService.ts` re-exports this barrel plus adds `describeDiagram()` (accessibility feature that generates spatial narration for screen readers).

---

## Error Handling Patterns

### Standard Pattern (Most Features)

```typescript
try {
  const response = await ai.models.generateContent({...});
  aiMetricsService.logMetric({...success: true});
  return result;
} catch (error) {
  aiMetricsService.logMetric({...success: false, error: String(error)});
  console.error("Operation Error", error);
  throw error;  // Caller handles
}
```

### Graceful Degradation Pattern (Non-Critical Features)

Used by: `generateHUDFragment`, `suggestProjectsFromInventory`, `analyzeSimulation`, `summarizeDiagramDiff`, `fetchPartDetails`

```typescript
try {
  return result;
} catch (error) {
  console.error('Error:', error);
  return fallbackValue;  // Don't throw, return safe default
}
```

### Rich Error Messages Pattern (User-Facing)

Used by `explainComponent()`:

- 401/invalid key -> "Your Gemini API key may be invalid or expired"
- 429/quota/rate -> "Too many requests. Please wait"
- network/fetch -> "Couldn't connect to the AI service"
- Other -> Generic error with message

### Connectivity Guard Pattern

Used by `chatWithAI`, `chatWithContext`, `analyzeSimulation`:

```typescript
if (!connectivityService.getIsOnline()) {
  auditService.log('warn', 'operation', 'AI requested but system is offline');
  return offlineMessage;
}
```

### AI Studio Retry Pattern (Media)

Used by `generateConceptImage`, `generateCircuitVideo`:

```typescript
try {
  return await executeRequest();
} catch (error) {
  if (error.status === 403 || error.message.includes('PERMISSION_DENIED')) {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      return await executeRequest();  // Single retry
    }
  }
  throw error;
}
```

---

## Caching Strategies

| Cache | Storage | Scope | Eviction | Used By |
|-------|---------|-------|----------|---------|
| 3D Code cache | `localStorage` (`cm_3d_code_{key}`) | Per component+type+instructions+precision | Manual (force=true) | `generateComponent3DCode()` |
| HUD Fragment cache | In-memory `Map` | Per name+type+context | Session-lifetime (lost on reload) | `generateHUDFragment()` |
| AI Metrics | `localStorage` (`cm_ai_metrics`) | Global | FIFO at 1000 entries | `aiMetricsService` |
| Engineering Events | `localStorage` (`cm_eng_events`) | Global | FIFO at 1000 entries | `aiMetricsService` |
| RAG Chunks | `localStorage` (`cm_vector_store`) | Global | Manual | `ragService` |

---

## Critical Gotchas

1. **Gemini JSON mode + Tools incompatibility**: `responseMimeType: "application/json"` cannot be used when `tools` (like `googleSearch`) are enabled. The chat module conditionally disables structured output when grounding tools are active.

2. **OBJECT schemas MUST have properties**: Every Gemini schema with `type: Type.OBJECT` must include `properties: {}` or the API rejects the request.

3. **Veo video URLs require API key**: Video generation returns a URI that needs `&key=${apiKey}` appended for access.

4. **liveSessionRef uses useRef not useState**: The WebSocket session must not trigger re-renders.

5. **ScriptProcessorNode deprecation**: `liveAudio.ts` uses `ScriptProcessorNode` which is deprecated but still widely supported. The alternative `AudioWorkletNode` would require a separate worklet file.

6. **3D code cleanup is aggressive**: The `generateComponent3DCode()` function has 5 stages of output cleanup (markdown stripping, prose removal, arrow function unwrapping, bracket balancing, parenthesis stripping). This is necessary because AI models frequently wrap output despite explicit instructions not to.

7. **Self-correction pass doubles latency**: The 3D code generation runs two model calls (Pro for generation, Flash for review), plus optional deep spec search and visual analysis. Total pipeline can be 4 API calls.

8. **AI Studio window.aistudio**: The `generateConceptImage` and `generateCircuitVideo` functions create fresh `GoogleGenAI` instances (not the singleton) because they need the latest API key from `getApiKey()` for the `imageConfig`/video request. This means key changes are picked up immediately.

9. **RAG lazy initialization**: `ragService.init()` is only called when a meta-question is detected. The first meta-question in a session triggers embedding generation for all knowledge chunks, which incurs multiple `text-embedding-004` API calls.

10. **Correction service integration**: The context-aware chat system includes prior user corrections from `correctionService.getRelevantLessons()`. These are injected into the prompt as explicit "do NOT say X, instead say Y" instructions, enabling the AI to learn from user feedback across sessions.

---

## File Reference Summary

| File | LOC | Functions | Purpose |
|------|-----|-----------|---------|
| `services/gemini/client.ts` | 75 | 4 | Singleton client + 20 model constants |
| `services/gemini/types.ts` | 273 | 0 (types only) | 13 interfaces + 7 schemas |
| `services/gemini/prompts.ts` | 390 | 18 | All prompt templates |
| `services/gemini/parsers.ts` | 92 | 4 | Response parsing + normalization |
| `services/gemini/index.ts` | 19 | 0 (barrel) | Module aggregation |
| `services/gemini/features/wiring.ts` | 64 | 1 | Wiring diagram generation |
| `services/gemini/features/chat.ts` | 300 | 2 | Standard + context-aware chat |
| `services/gemini/features/components.ts` | 525 | 7 | Component intelligence suite |
| `services/gemini/features/media.ts` | 246 | 7 | Audio, image, video, embeddings |
| `services/gemini/features/hud.ts` | 49 | 1 | HUD fragment generation |
| `services/gemini/features/predictions.ts` | 40 | 1 | Predictive design actions |
| `services/gemini/features/simulation.ts` | 39 | 1 | Simulation analysis |
| `services/gemini/features/suggestions.ts` | 61 | 2 | Proactive suggestions + projects |
| `services/gemini/features/bom.ts` | 40 | 1 | BOM part details |
| `services/gemini/features/datasheets.ts` | 58 | 1 | PDF datasheet extraction |
| `services/gemini/features/versioning.ts` | 34 | 1 | Diff summarization |
| `services/liveAudio.ts` | 312 | 1 class | Real-time audio streaming |
| `services/aiContextBuilder.ts` | 316 | 4 | Context building + prompt serialization |
| `services/aiMetricsService.ts` | 108 | 7 | Metrics + engineering events |
| `services/knowledgeService.ts` | 77 | 2 | Static meta-knowledge bundle |
| `services/ragService.ts` | 101 | 5 | Vector RAG with embeddings |
| `services/threeCodeValidator.ts` | 66 | 1 | 3D code security validation |
| `services/standardsService.ts` | 97 | 2 | IPC standards + board maps |
| `services/geminiService.ts` | 35 | 1 + re-exports | Legacy facade |
| `hooks/useAIContextBuilder.ts` | 86 | 1 | Reactive context + prediction loop |
| `hooks/useEditorAIChat.ts` | 216 | 1 | Editor AI chat management |
| **Total** | **~3,429** | **~55** | |
