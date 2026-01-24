# Implementation Plan: Smart Component Metadata (Datasheet Scraping)

## 📋 Todo Checklist
- [ ] **Infrastructure: PDF Processing**
    - [/] Add `PDF.js` or similar lightweight client-side PDF parser (if needed) or rely on Gemini's native PDF support via `gemini-2.5-flash`.
    - [x] Create `services/datasheetProcessor.ts`.
- [ ] **Intelligence: Multimodal Extraction**
    - [x] Implement `extractPinoutFromPDF` in `services/geminiService.ts`.
    - [x] Design prompt for "Pinout Mapping" (Extracting Pin Name, Number, and Function).
    - [x] Implement "Spec Extraction" (Voltage ranges, current limits, logic levels).
- [ ] **UI: Scraping Trigger & Preview**
    - [x] Add "Upload Datasheet" button to `ComponentEditorModal`.
    - [x] Build "Extraction Preview" step where users can confirm/edit detected pins.
    - [x] Add "Processing" HUD overlay with technical progress logs.
- [ ] **Integration: Inventory Enrichment**
    - [x] Update `InventoryContext` to store extracted specs.
    - [x] Add "Verified by AI" badge to components with scraped metadata.
- [ ] **Refinement**
    - [x] Implement local caching of datasheet summaries to avoid re-processing.

## Testing Strategy
- **Manual Tests:** Upload standard datasheets (ATmega328P, ESP32, etc.) and verify pin match.
- **Unit Tests:** Verify JSON schema validation for extracted specs.
