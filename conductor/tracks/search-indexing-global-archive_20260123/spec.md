# Spec: Search & Indexing (Global Archive)

## Goal
Provide a unified, lightning-fast "Command Center" for information retrieval, allowing users to find any component, project, technical fact, or previous AI insight instantly.

## Background
As CircuitMind AI scales to handle hundreds of components and multiple design iterations, manual navigation becomes inefficient. A global search index turns the entire workspace into a queryable database.

## Architecture
- **MiniSearch Engine**: A client-side text search engine that provides ranking, fuzzy matching, and prefix search.
- **Web Worker Orchestrator**: Handles the heavy lifting of parsing project JSONs and chat logs off the main thread.
- **Unified Interface**: A "Command Palette" style modal that follows modern productivity tool conventions (e.g., VS Code, Slack, Raycast).

## Data Model
```typescript
type SearchableCategory = 'component' | 'diagram' | 'knowledge' | 'action';

interface IndexedDocument {
  id: string; // Global UUID or reference path
  category: SearchableCategory;
  title: string;
  body: string; // Full text for indexing
  tags: string[];
  reference: any; // Link to the original object
}

interface SearchResponse {
  results: IndexedDocument[];
  queryTime: number;
}
```

## Security & Privacy
- Indexing is 100% local.
- No data is sent to external servers for indexing.
- Search queries are only shared with Gemini if the user explicitly triggers a "Semantic AI Search" fallback.
