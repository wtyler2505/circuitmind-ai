/**
 * AI Identifier — Provider abstraction for component identification.
 */

export interface IdentificationResult {
  name: string;
  type: string;
  description: string;
  manufacturer: string;
  mpn: string;
  packageType: string;
  pins: string[];
  specs: Record<string, string>;
  confidence: number;
}

export interface AIProvider {
  identify(images: Buffer[], hints?: string): Promise<IdentificationResult>;
  transcribe(audio: Buffer): Promise<string>;
}

/**
 * Calculates a confidence score based on how many fields were populated.
 */
export function calculateConfidence(result: Partial<IdentificationResult>): number {
  const fields = ['name', 'type', 'description', 'manufacturer', 'mpn', 'packageType'] as const;
  let filled = 0;
  for (const field of fields) {
    if (result[field] && String(result[field]).trim().length > 0) {
      filled++;
    }
  }
  if (result.pins && result.pins.length > 0) filled++;
  if (result.specs && Object.keys(result.specs).length > 0) filled++;

  return Math.round((filled / 8) * 100) / 100;
}

/**
 * Default empty result for fallback.
 */
export function emptyResult(): IdentificationResult {
  return {
    name: 'Unknown Component',
    type: 'other',
    description: '',
    manufacturer: '',
    mpn: '',
    packageType: '',
    pins: [],
    specs: {},
    confidence: 0,
  };
}
