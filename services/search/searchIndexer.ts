import MiniSearch from 'minisearch';

export type SearchableCategory = 'component' | 'diagram' | 'knowledge' | 'action';

export interface IndexedDocument {
  id: string;
  category: SearchableCategory;
  title: string;
  body: string;
  tags?: string[];
  reference?: unknown;
}

class SearchIndexer {
  private miniSearch: MiniSearch<IndexedDocument>;

  constructor() {
    this.miniSearch = new MiniSearch({
      fields: ['title', 'body', 'tags'],
      storeFields: ['category', 'title', 'body', 'reference'],
      searchOptions: {
        boost: { title: 2 },
        fuzzy: 0.2,
        prefix: true
      }
    });
  }

  /**
   * Adds or updates documents in the index.
   */
  index(docs: IndexedDocument[]) {
    this.miniSearch.removeAll(); // For now, rebuild since local state is small
    this.miniSearch.addAll(docs);
  }

  /**
   * Performs a search across the index.
   */
  search(query: string, category?: SearchableCategory): IndexedDocument[] {
    // MiniSearch SearchResult includes stored fields at runtime but not in TS types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchOptions = category ? { filter: (res: any) => res.category === category } : undefined;
    return this.miniSearch.search(query, searchOptions) as unknown as IndexedDocument[];
  }

  clear() {
    this.miniSearch.removeAll();
  }
}

export const searchIndexer = new SearchIndexer();
