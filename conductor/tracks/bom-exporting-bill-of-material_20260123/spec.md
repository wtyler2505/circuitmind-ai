# Spec: BOM Exporting (Bill of Materials)

## Goal
Enable users to transition from a digital wiring diagram to a physical hardware purchase list by generating an accurate, professional, and detailed Bill of Materials.

## Background
Creating a shopping list for a project is currently a manual process. Users have to list every component and quantity by hand. This track automates list generation, stock checking, and price estimation.

## Architecture
- **Aggregation Logic:** Iterates through the `WiringDiagram.components` array and groups by `sourceInventoryId`.
- **Enrichment Layer:** Uses `Inventory` metadata and Gemini AI to fill in missing technical details (Manufacturer Part Numbers, standard packages).
- **Client-Side Generation:** Generates files directly in the browser to maintain "Local-First" privacy.

## Data Model
```typescript
interface BOMItem {
  id: string;
  name: string;
  quantity: number;
  type: string;
  mpn?: string; // Manufacturer Part Number
  estimatedPrice?: number;
  datasheetUrl?: string;
  inInventory: boolean;
  currentStock: number;
}

interface BOMReport {
  title: string;
  timestamp: number;
  items: BOMItem[];
  totalEstimatedCost: number;
}
```

## Security & Privacy
- Export files are generated on the user's machine.
- Stock levels and inventory data are never sent to external servers except for specific AI lookup requests.
