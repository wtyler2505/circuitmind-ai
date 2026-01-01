import { describe, expect, it } from 'vitest';

import { normalizeProactiveSuggestions } from '../geminiService';

describe('normalizeProactiveSuggestions', () => {
  it('keeps string suggestions and trims whitespace', () => {
    const result = normalizeProactiveSuggestions(['  Add a resistor  ', 'Check wiring']);
    expect(result).toEqual(['Add a resistor', 'Check wiring']);
  });

  it('converts object labels to strings and ignores invalid items', () => {
    const result = normalizeProactiveSuggestions([
      { id: '1', label: 'Tidy the power rails' },
      { id: '2', label: '' },
      { id: '3', label: 42 },
      null,
    ]);
    expect(result).toEqual(['Tidy the power rails']);
  });

  it('returns empty array for non-array input', () => {
    expect(normalizeProactiveSuggestions({ id: '1', label: 'oops' })).toEqual([]);
  });
});
