# Implementation Plan: BOM Exporting (Bill of Materials)

## 📋 Todo Checklist
- [ ] **Core Service: BOM Aggregator**
    - [x] Create `services/bomService.ts`.
    - [x] Implement `generateBOMData` to group diagram components by ID and count quantities.
    - [x] Add reconciliation logic with `InventoryContext` to fetch descriptions and stock levels.
- [ ] **Intelligence: MPN & Price Lookup**
    - [x] Create `fetchPartDetails` in `services/geminiService.ts`.
    - [x] Use `gemini-2.5-flash` to suggest MPNs and estimated unit prices.
- [ ] **UI: Preview Modal**
    - [x] Create `components/inventory/BOMModal.tsx`.
    - [x] Build a sleek, sortable data table for the part list.
    - [x] Add "Out of Stock" warnings for components not in inventory.
- [ ] **Export Engine**
    - [x] Integrate `jspdf` for PDF generation (Cyberpunk themed).
    - [x] Implement CSV export using `PapaParse` or basic Blob logic.
- [ ] **Integration**
    - [x] Add "Export BOM" action to `AppHeader` and `Inventory` Tools.
- [ ] **Refinement**
    - [ ] Add "Direct Order" links (Deep links to Mouser/Digi-Key/Amazon).

## Testing Strategy
- **Unit Tests:** Verify that duplicate components in the diagram are correctly summed.
- **Export Tests:** Verify file download triggers and CSV structure.
