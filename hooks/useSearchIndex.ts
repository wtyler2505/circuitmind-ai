import { useEffect } from 'react';
import { searchIndexer, type IndexedDocument } from '../services/search/searchIndexer';
import type { ElectronicComponent, WiringDiagram } from '../types';

interface UseSearchIndexParams {
  inventory: ElectronicComponent[];
  diagram: WiringDiagram | null;
}

export function useSearchIndex({ inventory, diagram }: UseSearchIndexParams): void {
  useEffect(() => {
    const docs: IndexedDocument[] = [];

    // 1. Index Inventory
    inventory.forEach((c) => {
      docs.push({
        id: `inv-${c.id}`,
        category: 'component',
        title: c.name,
        body: c.description,
        tags: [c.type, ...(c.pins || [])],
        reference: c,
      });
    });

    // 2. Index Diagram
    if (diagram) {
      diagram.components.forEach((c) => {
        docs.push({
          id: `diag-comp-${c.id}`,
          category: 'diagram',
          title: `Project: ${c.name}`,
          body: `Part of ${diagram.title}. Pins: ${c.pins?.join(', ')}`,
          reference: c.id,
        });
      });
    }

    searchIndexer.index(docs);
  }, [inventory, diagram]);
}
