import { describe, it, expect } from 'vitest';
import {
  validateImportPartPayload,
  validateValidatePartPayload,
  validateCreatePartFromTemplatePayload,
  validateEditPartMetadataPayload,
  validateDeletePartFromCatalogPayload,
  validateRepairPartDiagnosticsPayload,
} from '../lifecycleSchemas';

describe('lifecycleSchemas', () => {
  // ── ImportPart ──────────────────────────────────────────────────────────
  describe('validateImportPartPayload', () => {
    it('accepts valid payload with url', () => {
      const result = validateImportPartPayload({
        name: 'Arduino Uno',
        url: 'https://example.com/part.fzpz',
        targetCollection: 'local',
      });
      expect(result.valid).toBe(true);
    });

    it('accepts valid payload with fzpzData', () => {
      const result = validateImportPartPayload({
        name: 'LED Red',
        fzpzData: 'UEsDBBQAAAA...',
        targetCollection: 'catalog',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects when name is missing', () => {
      const result = validateImportPartPayload({
        url: 'https://example.com/part.fzpz',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('name');
    });

    it('rejects when both url and fzpzData are missing', () => {
      const result = validateImportPartPayload({
        name: 'Test Part',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('url or fzpzData');
    });

    it('rejects invalid url format', () => {
      const result = validateImportPartPayload({
        name: 'Test',
        url: 'not-a-url',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('URL');
    });

    it('rejects null payload', () => {
      expect(validateImportPartPayload(null).valid).toBe(false);
    });

    it('rejects non-object payload', () => {
      expect(validateImportPartPayload('string').valid).toBe(false);
    });
  });

  // ── ValidatePart ────────────────────────────────────────────────────────
  describe('validateValidatePartPayload', () => {
    it('accepts valid payload', () => {
      const result = validateValidatePartPayload({
        componentId: 'comp-123',
        checkConnectors: true,
        checkFootprint: true,
        checkBuses: false,
      });
      expect(result.valid).toBe(true);
    });

    it('accepts payload with only componentId (booleans optional)', () => {
      const result = validateValidatePartPayload({
        componentId: 'comp-456',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects missing componentId', () => {
      const result = validateValidatePartPayload({
        checkConnectors: true,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('componentId');
    });

    it('rejects non-boolean checkConnectors', () => {
      const result = validateValidatePartPayload({
        componentId: 'comp-123',
        checkConnectors: 'yes',
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── CreatePartFromTemplate ──────────────────────────────────────────────
  describe('validateCreatePartFromTemplatePayload', () => {
    it('accepts valid payload', () => {
      const result = validateCreatePartFromTemplatePayload({
        name: 'My Resistor',
        templateType: 'resistor',
        pinCount: 2,
      });
      expect(result.valid).toBe(true);
    });

    it('accepts payload with specs', () => {
      const result = validateCreatePartFromTemplatePayload({
        name: 'Custom IC',
        templateType: 'ic',
        pinCount: 16,
        specs: { package: 'DIP-16', voltage: '5V' },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects invalid templateType', () => {
      const result = validateCreatePartFromTemplatePayload({
        name: 'Test',
        templateType: 'transistor',
        pinCount: 3,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('templateType');
    });

    it('rejects non-positive pinCount', () => {
      const result = validateCreatePartFromTemplatePayload({
        name: 'Test',
        templateType: 'led',
        pinCount: 0,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pinCount');
    });

    it('rejects non-integer pinCount', () => {
      const result = validateCreatePartFromTemplatePayload({
        name: 'Test',
        templateType: 'led',
        pinCount: 2.5,
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── EditPartMetadata ────────────────────────────────────────────────────
  describe('validateEditPartMetadataPayload', () => {
    it('accepts valid payload with name update', () => {
      const result = validateEditPartMetadataPayload({
        componentId: 'comp-123',
        updates: { name: 'Updated Name' },
      });
      expect(result.valid).toBe(true);
    });

    it('accepts payload with footprint update', () => {
      const result = validateEditPartMetadataPayload({
        componentId: 'comp-123',
        updates: { footprint: { width: 10, height: 5 } },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects missing updates', () => {
      const result = validateEditPartMetadataPayload({
        componentId: 'comp-123',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('updates');
    });

    it('rejects empty name in updates', () => {
      const result = validateEditPartMetadataPayload({
        componentId: 'comp-123',
        updates: { name: '' },
      });
      expect(result.valid).toBe(false);
    });

    it('rejects invalid footprint in updates', () => {
      const result = validateEditPartMetadataPayload({
        componentId: 'comp-123',
        updates: { footprint: { width: 'big' } },
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── DeletePartFromCatalog ───────────────────────────────────────────────
  describe('validateDeletePartFromCatalogPayload', () => {
    it('accepts valid payload', () => {
      const result = validateDeletePartFromCatalogPayload({
        componentId: 'comp-123',
        deleteFromBackend: true,
      });
      expect(result.valid).toBe(true);
    });

    it('accepts payload without deleteFromBackend (optional)', () => {
      const result = validateDeletePartFromCatalogPayload({
        componentId: 'comp-123',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects non-boolean deleteFromBackend', () => {
      const result = validateDeletePartFromCatalogPayload({
        componentId: 'comp-123',
        deleteFromBackend: 'yes',
      });
      expect(result.valid).toBe(false);
    });
  });

  // ── RepairPartDiagnostics ───────────────────────────────────────────────
  describe('validateRepairPartDiagnosticsPayload', () => {
    it('accepts valid payload', () => {
      const result = validateRepairPartDiagnosticsPayload({
        componentId: 'comp-123',
        autoFix: true,
      });
      expect(result.valid).toBe(true);
    });

    it('accepts payload with issues list', () => {
      const result = validateRepairPartDiagnosticsPayload({
        componentId: 'comp-123',
        autoFix: false,
        issues: ['MISSING_TERMINAL', 'SVG_VIEWBOX_MISMATCH'],
      });
      expect(result.valid).toBe(true);
    });

    it('rejects non-string items in issues', () => {
      const result = validateRepairPartDiagnosticsPayload({
        componentId: 'comp-123',
        autoFix: true,
        issues: [123, 'MISSING_TERMINAL'],
      });
      expect(result.valid).toBe(false);
    });
  });
});
