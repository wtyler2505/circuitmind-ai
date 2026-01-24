# Spec: Smart Component Metadata (Datasheet Scraping)

## Goal
Automate the tedious process of entering component specifications and pinouts by extracting them directly from manufacturer datasheets (PDFs) using Gemini's multimodal capabilities.

## Background
Currently, adding a new component requires manually typing every pin name and technical spec. Datasheets contain this info but are often 100+ pages long. This track turns "Search & Copy" into "Upload & Verify".

## Architecture
- **Multimodal ingestion:** Users upload a PDF or provide a URL.
- **Page-Selective Analysis:** Gemini identifies the "Pin Configuration" and "Absolute Maximum Ratings" pages first.
- **Structured Data Mapping:** Extracts a JSON-compatible map of pins and specs.

## Data Model
```typescript
interface ScrapedMetadata {
  pins: { number: number; name: string; function: string }[];
  specs: {
    voltageMin: number;
    voltageMax: number;
    currentLimit?: number;
    logicLevel: '3.3V' | '5V' | 'Adjustable';
  };
  confidence: number;
}
```

## Security & Privacy
- PDFs are processed via Gemini API (Vision/Document processing).
- Extracted data is stored locally.
