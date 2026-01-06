# Feature Implementation Plan: Advanced AI Workflows

## 📋 Todo Checklist
- [x] **Phase 1: Deep Memory (Vector RAG)**
    - [x] Set up a local vector store (`client-vector-search` installed, but using manual cosine similarity for robustness).
    - [x] Create an indexing pipeline for `docs/` and component datasheets (`ragService.ts`).
    - [x] Integrate retrieval into `geminiService.ts` context building.
- [x] **Phase 2: Visual Intelligence Loop**
    - [x] Implement `captureCanvasSnapshot` utility (using `html2canvas` or SVG serialization).
    - [x] Add `visualize` tool to Gemini (`analyzeVisuals` action).
    - [x] Update `chatWithContext` to support "Vision Checks" for layout critique.
- [x] **Phase 3: Agentic Workflows (Genkit Integration)**
    - [x] Define Genkit Flows for complex tasks (Simulated via client-side logic and `loadingText`).
    - [x] Expose these flows via the `useAIActions` hook.
    - [x] Implement "Thinking Steps" UI to show the user the AI's reasoning process (`ChatPanel` status updates).
- [x] **Phase 4: Adaptive Fine-Tuning Loop**
    - [x] Implement "Feedback" buttons (Thumbs Up/Down) on AI responses.
    - [x] Log successful/failed prompt-response pairs to a local dataset (`aiMetricsService`).
    - [x] Create a script to export this dataset for Gemini fine-tuning (`datasetService` + `SettingsPanel`).

## 🔍 Analysis & Investigation

### Codebase Structure
The project is a React 19 + Vite application with a centralized `App.tsx` state. The AI logic resides in `services/geminiService.ts`, utilizing the `@google/genai` SDK. Recent updates have added `userProfileService.ts` (Memory) and `knowledgeService.ts` (Static Knowledge).

### Current Architecture
- **AI Brain**: `geminiService.ts` handles direct API calls.
- **Context**: `aiContextBuilder.ts` aggregates app state (Inventory, Diagram, User Profile).
- **Control**: `useAIActions.ts` provides a bridge for the AI to execute UI actions (Redo, Save, Pan, etc.).
- **Memory**: Currently limited to `localStorage` (User Profile) and a hardcoded `DOCS_BUNDLE`.

### Integration Points
- **Genkit**: A `.genkit` directory exists, but the framework is not actively used in the main application flow.
- **Visuals**: The `DiagramCanvas` exposes `useImperativeHandle` for control but doesn't yet support image export for *AI consumption* (only user download).

### Challenges
- **Latency**: Adding RAG and Vision analysis will increase response time. "Optimistic UI" updates and streaming responses are critical.
- **Token Limits**: Sending full datasheets or large SVGs will eat into the context window (though Gemini 1.5/2.0 has a massive window, cost/latency is the concern).
- **Browser Limits**: Local vector search in the browser has memory constraints.

## 📝 Implementation Plan

### Phase 1: Deep Memory (Vector RAG)

**Goal**: Replace `knowledgeService.ts` hardcoded strings with a scalable vector search.

1.  **Step 1**: Install Vector Library
    - Action: Install a lightweight client-side vector DB (e.g., `client-vector-search` or `voy-search`).
    - File: `package.json`

2.  **Step 2**: Implement `RAGService`
    - Create `services/ragService.ts`.
    - Implement `indexDocument(content, metadata)` and `search(query)`.
    - Create a bootstrap script to index `docs/` on app load (if index is empty).

3.  **Step 3**: Integrate with `GeminiService`
    - Modify `chatWithContext` in `services/geminiService.ts`.
    - Instead of `knowledgeService.getAllKnowledge()`, call `ragService.search(userMessage)`.
    - Inject only the *relevant* chunks into the system prompt.

### Phase 2: Visual Intelligence Loop

**Goal**: Give the AI "Eyes" to critique layout and aesthetics.

1.  **Step 1**: Canvas Snapshot Utility
    - Modify `components/DiagramCanvas.tsx` to expose a `getSnapshotBlob()` method via `ref`.
    - Use `XMLSerializer` to turn the SVG into a Blob/Base64 string.

2.  **Step 2**: "Look" Tool
    - Add a tool definition `lookAtCanvas` to `geminiService.ts`.
    - When the AI invokes this tool, the client triggers `getSnapshotBlob()`.
    - The image is then sent back to Gemini Pro Vision in a subsequent turn.

### Phase 3: Agentic Workflows (Genkit)

**Goal**: Move complex logic (e.g., "Design a Power Supply") out of the frontend and into structured Flows.

1.  **Step 1**: Define Flows
    - Create `services/flows/circuitDesignFlow.ts` using Genkit SDK (if running a backend) OR emulate the "Flow" pattern on the client using chained Gemini calls.
    - *Constraint Check*: Since this is a "Local-First" app, we likely stick to Client-Side chaining unless a local Node server is running. We will implement **Client-Side Agents** using the `Code Execution` tool or simple chain-of-thought prompting.

2.  **Step 2**: "Thinking" UI
    - Update `ChatPanel.tsx` to support "intermediate steps" (e.g., "Searching datasheets...", "Verifying voltage levels...").
    - Use the `gemini-2.0-flash-thinking` model parameters if available, or simulate with multi-turn UI updates.

### Phase 4: Adaptive Fine-Tuning & Feedback

**Goal**: Train the AI to be *CircuitMind* specific.

1.  **Step 1**: Feedback UI
    - Modify `components/ChatMessage.tsx` to add Thumbs Up/Down buttons to AI messages.
    - Store feedback in `services/aiMetricsService.ts`.

2.  **Step 2**: Dataset Export
    - Create a utility in `SettingsPanel` to "Export Training Data".
    - Formats the chat history + user feedback into JSONL format compatible with Gemini Fine-tuning.

## 🎯 Success Criteria
- [x] **Knowledge**: AI can answer specific questions from `docs/` that are *not* in the system prompt (proved via RAG).
- [x] **Vision**: AI can critique the *visual positioning* of components (e.g., "The resistors are too crowded").
- [x] **Reasoning**: Complex requests (e.g., "Design a 5V buck converter") show intermediate "Thinking" steps.
- [x] **Satisfaction**: User Feedback logging is functional.