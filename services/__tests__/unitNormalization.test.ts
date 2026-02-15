import { describe, it, expect } from 'vitest';
import {
  milToMm,
  mmToMil,
  milToInch,
  inchToMil,
  milToPx,
  pxToMil,
  milToGridUnits,
  gridUnitsToMil,
  parseSvgDimension,
  toMil,
  toGridUnits,
  parseViewBox,
  createViewBoxNormalizers,
  MILS_PER_MM,
  MILS_PER_INCH,
  MILS_PER_GRID_UNIT,
  DEFAULT_DPI,
} from '../unitNormalization';

describe('unitNormalization', () => {
  // ── Constants ──────────────────────────────────────────────────────────
  describe('constants', () => {
    it('MILS_PER_MM is approximately 39.37', () => {
      expect(MILS_PER_MM).toBeCloseTo(39.3701, 3);
    });

    it('MILS_PER_INCH is exactly 1000', () => {
      expect(MILS_PER_INCH).toBe(1000);
    });

    it('MILS_PER_GRID_UNIT is exactly 100', () => {
      expect(MILS_PER_GRID_UNIT).toBe(100);
    });

    it('DEFAULT_DPI is 96', () => {
      expect(DEFAULT_DPI).toBe(96);
    });
  });

  // ── Mil ↔ mm ──────────────────────────────────────────────────────────
  describe('mil ↔ mm', () => {
    it('milToMm: 1000 mil → 25.4 mm', () => {
      expect(milToMm(1000)).toBeCloseTo(25.4, 4);
    });

    it('mmToMil: 25.4 mm → 1000 mil', () => {
      expect(mmToMil(25.4)).toBeCloseTo(1000, 4);
    });

    it('round-trip: mmToMil(milToMm(x)) ≈ x', () => {
      expect(mmToMil(milToMm(500))).toBeCloseTo(500, 8);
    });
  });

  // ── Mil ↔ inch ────────────────────────────────────────────────────────
  describe('mil ↔ inch', () => {
    it('milToInch: 1000 mil → 1 inch', () => {
      expect(milToInch(1000)).toBe(1);
    });

    it('inchToMil: 0.1 inch → 100 mil', () => {
      expect(inchToMil(0.1)).toBe(100);
    });
  });

  // ── Mil ↔ px ──────────────────────────────────────────────────────────
  describe('mil ↔ px', () => {
    it('milToPx at 96 DPI: 1000 mil → 96 px', () => {
      expect(milToPx(1000)).toBe(96);
    });

    it('pxToMil at 96 DPI: 96 px → 1000 mil', () => {
      expect(pxToMil(96)).toBeCloseTo(1000, 4);
    });

    it('custom DPI: milToPx at 72 DPI: 1000 mil → 72 px', () => {
      expect(milToPx(1000, 72)).toBe(72);
    });
  });

  // ── Grid units ────────────────────────────────────────────────────────
  describe('grid units', () => {
    it('milToGridUnits: 100 mil → 1 grid unit', () => {
      expect(milToGridUnits(100)).toBe(1);
    });

    it('milToGridUnits: 1000 mil (1 inch) → 10 grid units', () => {
      expect(milToGridUnits(1000)).toBe(10);
    });

    it('gridUnitsToMil: 10 → 1000 mil', () => {
      expect(gridUnitsToMil(10)).toBe(1000);
    });
  });

  // ── parseSvgDimension ─────────────────────────────────────────────────
  describe('parseSvgDimension', () => {
    it('parses "100px"', () => {
      expect(parseSvgDimension('100px')).toEqual({ value: 100, unit: 'px' });
    });

    it('parses "2.54mm"', () => {
      expect(parseSvgDimension('2.54mm')).toEqual({ value: 2.54, unit: 'mm' });
    });

    it('parses "1000mil"', () => {
      expect(parseSvgDimension('1000mil')).toEqual({ value: 1000, unit: 'mil' });
    });

    it('parses "1in"', () => {
      expect(parseSvgDimension('1in')).toEqual({ value: 1, unit: 'in' });
    });

    it('parses unitless "50"', () => {
      expect(parseSvgDimension('50')).toEqual({ value: 50, unit: '' });
    });

    it('handles empty string', () => {
      expect(parseSvgDimension('')).toEqual({ value: 0, unit: '' });
    });

    it('handles whitespace', () => {
      expect(parseSvgDimension('  25.4mm  ')).toEqual({ value: 25.4, unit: 'mm' });
    });

    it('returns zero for invalid input', () => {
      expect(parseSvgDimension('abc')).toEqual({ value: 0, unit: '' });
    });

    it('handles negative values', () => {
      expect(parseSvgDimension('-10px')).toEqual({ value: -10, unit: 'px' });
    });
  });

  // ── toMil (unified converter) ─────────────────────────────────────────
  describe('toMil', () => {
    it('mil → mil (identity)', () => {
      expect(toMil(500, 'mil')).toBe(500);
    });

    it('mm → mil', () => {
      expect(toMil(25.4, 'mm')).toBeCloseTo(1000, 4);
    });

    it('in → mil', () => {
      expect(toMil(1, 'in')).toBe(1000);
    });

    it('px → mil (96 DPI)', () => {
      expect(toMil(96, 'px')).toBeCloseTo(1000, 4);
    });

    it('unitless → mil (treated as px)', () => {
      expect(toMil(96, '')).toBeCloseTo(1000, 4);
    });
  });

  // ── toGridUnits (unified converter) ───────────────────────────────────
  describe('toGridUnits', () => {
    it('1in → 10 grid units', () => {
      expect(toGridUnits(1, 'in')).toBe(10);
    });

    it('25.4mm → 10 grid units', () => {
      expect(toGridUnits(25.4, 'mm')).toBeCloseTo(10, 1);
    });

    it('1000mil → 10 grid units', () => {
      expect(toGridUnits(1000, 'mil')).toBe(10);
    });
  });

  // ── parseViewBox ──────────────────────────────────────────────────────
  describe('parseViewBox', () => {
    it('parses standard viewBox', () => {
      expect(parseViewBox('0 0 1000 500')).toEqual({
        minX: 0, minY: 0, width: 1000, height: 500,
      });
    });

    it('parses viewBox with offsets', () => {
      expect(parseViewBox('10 20 800 600')).toEqual({
        minX: 10, minY: 20, width: 800, height: 600,
      });
    });

    it('parses comma-separated viewBox', () => {
      expect(parseViewBox('0,0,500,400')).toEqual({
        minX: 0, minY: 0, width: 500, height: 400,
      });
    });

    it('returns default for null', () => {
      expect(parseViewBox(null)).toEqual({
        minX: 0, minY: 0, width: 100, height: 100,
      });
    });

    it('returns default for empty string', () => {
      expect(parseViewBox('')).toEqual({
        minX: 0, minY: 0, width: 100, height: 100,
      });
    });

    it('returns default for invalid viewBox', () => {
      expect(parseViewBox('bad data')).toEqual({
        minX: 0, minY: 0, width: 100, height: 100,
      });
    });
  });

  // ── createViewBoxNormalizers ───────────────────────────────────────────
  describe('createViewBoxNormalizers', () => {
    it('normalizes viewBox coordinates to grid units', () => {
      // 1 inch wide SVG, viewBox 0 0 1000 1000
      const { normalizeX, normalizeY } = createViewBoxNormalizers(
        'in',
        { width: 1000, height: 1000 },
        { width: 1, height: 1 }
      );

      // viewBox midpoint (500, 500) → grid (5, 5) since 1in = 10 grid units
      expect(normalizeX(500)).toBeCloseTo(5, 4);
      expect(normalizeY(500)).toBeCloseTo(5, 4);
    });

    it('handles viewBox with offsets', () => {
      const { normalizeX, normalizeY } = createViewBoxNormalizers(
        'in',
        { width: 1000, height: 1000, minX: 100, minY: 200 },
        { width: 1, height: 1 }
      );

      // (100, 200) should map to origin (0, 0)
      expect(normalizeX(100)).toBeCloseTo(0, 4);
      expect(normalizeY(200)).toBeCloseTo(0, 4);
    });

    it('returns 0 for zero-dimension viewBox', () => {
      const { normalizeX, normalizeY } = createViewBoxNormalizers(
        'in',
        { width: 0, height: 0 },
        { width: 1, height: 1 }
      );

      expect(normalizeX(500)).toBe(0);
      expect(normalizeY(500)).toBe(0);
    });
  });
});
