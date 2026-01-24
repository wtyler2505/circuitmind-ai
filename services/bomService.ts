import { WiringDiagram, ElectronicComponent } from '../types';

export interface BOMItem {
  id: string;
  name: string;
  quantity: number;
  type: string;
  mpn?: string;
  estimatedPrice?: number;
  datasheetUrl?: string;
  inInventory: boolean;
  currentStock: number;
}

export interface BOMReport {
  title: string;
  timestamp: number;
  items: BOMItem[];
  totalEstimatedCost: number;
}

class BOMService {
  /**
   * Generates a BOM report from a wiring diagram and local inventory.
   */
  generateBOM(diagram: WiringDiagram, inventory: ElectronicComponent[]): BOMReport {
    const itemMap = new Map<string, BOMItem>();

    // 1. Group components by their source inventory ID
    diagram.components.forEach((comp) => {
      const sourceId = comp.sourceInventoryId || comp.id;
      
      if (itemMap.has(sourceId)) {
        itemMap.get(sourceId)!.quantity += 1;
      } else {
        // Find matching item in inventory for stock levels
        const invItem = inventory.find(i => i.id === sourceId);
        
        itemMap.set(sourceId, {
          id: sourceId,
          name: comp.name,
          quantity: 1,
          type: comp.type,
          mpn: (invItem as any)?.mpn,
          estimatedPrice: (invItem as any)?.price,
          datasheetUrl: comp.datasheetUrl,
          inInventory: !!invItem,
          currentStock: invItem?.quantity || 0
        });
      }
    });

    const items = Array.from(itemMap.values());
    const totalEstimatedCost = items.reduce((acc, item) => acc + (item.estimatedPrice || 0) * item.quantity, 0);

    return {
      title: `${diagram.title} - Bill of Materials`,
      timestamp: Date.now(),
      items,
      totalEstimatedCost
    };
  }
}

export const bomService = new BOMService();
