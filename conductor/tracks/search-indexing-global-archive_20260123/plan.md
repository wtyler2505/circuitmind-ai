# Implementation Plan: Search & Indexing (Global Archive)

## 📋 Todo Checklist
- [ ] **Infrastructure: Search Engine**
    - [x] Integrate `minisearch` for optimized full-text search.
    - [x] Create `services/search/searchIndexer.ts`.
    - [x] Implement background indexing using a Web Worker to ensure zero UI lag.
- [ ] **Logic: Data Crawling**
    - [x] Build indexers for `InventoryContext` (Names, Tags, Descriptions).
    - [x] Build indexers for `WiringDiagram` (Components, Pins, Titles).
    - [x] Index `ConversationContext` (Chat history, code blocks).
    - [x] Integrate with `RAGService` to include indexed technical documents.
- [ ] **UI: Omni-Search Interface**
    - [x] Create `components/layout/OmniSearch.tsx` (Command Palette modal).
    - [x] Implement `Ctrl + K` global keyboard shortcut.
    - [x] Add faceted filtering (e.g., `type:component esp32`).
- [ ] **Logic: Navigation & Smart Jump**
    - [x] Implement routing logic to jump to specific components on the canvas.
    - [x] Add "Action Commands" (e.g., type `> export` to trigger BOM export).
- [ ] **Refinement: Visual Previews**
    - [x] Add "Result Previews" (e.g., showing a component thumbnail in the search dropdown).
    - [x] Implement fuzzy matching for resilient searching.

## Testing Strategy
- **Performance Tests**: Ensure search latency stays under 50ms for a 1000-item index.
- **Accuracy Tests**: Verify that searching a pin name (e.g., "TXD0") returns the parent microcontroller.
