import { useEffect } from 'react';
import { useDiagram } from '../contexts/DiagramContext';
import { useInventory } from '../contexts/InventoryContext';
import { syncService } from '../services/syncService';

export function useSync() {
  const { diagram } = useDiagram();
  const { inventory } = useInventory();

  useEffect(() => {
    // Throttled auto-snapshot
    const timer = setTimeout(async () => {
      await syncService.snapshot({ diagram, inventory });
    }, 5000); // Wait 5s after last change

    return () => clearTimeout(timer);
  }, [diagram, inventory]);
}
