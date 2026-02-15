/**
 * Unit normalization utilities for Fritzing FZPZ part processing.
 *
 * Fritzing parts use a variety of measurement units across their SVG files:
 *   - mil (thousandths of an inch) — most common in US EDA tools
 *   - mm  (millimeters)          — metric parts
 *   - in  (inches)               — through-hole spacing
 *   - px  (CSS pixels)           — SVG default at 96 DPI
 *
 * CircuitMind internally uses 0.1" (100 mil) as one grid unit for footprints.
 * This module provides lossless conversion between all four unit systems,
 * SVG viewBox coordinate normalization, and a dimension-string parser.
 */

// ── Constants ────────────────────────────────────────────────────────────────

/** 1 mm = 39.3701 mil (exactly 1000/25.4) */
export const MILS_PER_MM = 1000 / 25.4; // ≈ 39.37007874

/** 1 inch = 1000 mil */
export const MILS_PER_INCH = 1000;

/** Default DPI for CSS px ↔ physical conversions (W3C spec) */
export const DEFAULT_DPI = 96;

/** CircuitMind grid unit: 1 unit = 100 mil = 0.1 inch */
export const MILS_PER_GRID_UNIT = 100;

// ── Mil ↔ mm ─────────────────────────────────────────────────────────────────

export function milToMm(mil: number): number {
  return mil / MILS_PER_MM;
}

export function mmToMil(mm: number): number {
  return mm * MILS_PER_MM;
}

// ── Mil ↔ inch ───────────────────────────────────────────────────────────────

export function milToInch(mil: number): number {
  return mil / MILS_PER_INCH;
}

export function inchToMil(inch: number): number {
  return inch * MILS_PER_INCH;
}

// ── Mil ↔ px (DPI-aware) ────────────────────────────────────────────────────

export function milToPx(mil: number, dpi: number = DEFAULT_DPI): number {
  // mil → inch → px
  return (mil / MILS_PER_INCH) * dpi;
}

export function pxToMil(px: number, dpi: number = DEFAULT_DPI): number {
  // px → inch → mil
  return (px / dpi) * MILS_PER_INCH;
}

// ── Mil ↔ CircuitMind grid units ─────────────────────────────────────────────

export function milToGridUnits(mil: number): number {
  return mil / MILS_PER_GRID_UNIT;
}

export function gridUnitsToMil(units: number): number {
  return units * MILS_PER_GRID_UNIT;
}

// ── SVG dimension string parser ──────────────────────────────────────────────

export type SvgUnit = 'mil' | 'mm' | 'in' | 'px' | '';

export interface ParsedDimension {
  value: number;
  unit: SvgUnit;
}

/**
 * Parse an SVG dimension string into its numeric value and unit.
 *
 * Handles formats produced by Fritzing and common SVG editors:
 *   "100px"  → { value: 100, unit: 'px' }
 *   "2.54mm" → { value: 2.54, unit: 'mm' }
 *   "100mil" → { value: 100, unit: 'mil' }
 *   "1in"    → { value: 1, unit: 'in' }
 *   "50"     → { value: 50, unit: '' }  (unitless)
 *   ""       → { value: 0, unit: '' }
 */
export function parseSvgDimension(dim: string): ParsedDimension {
  if (!dim || dim.trim() === '') {
    return { value: 0, unit: '' };
  }

  const trimmed = dim.trim();

  // Match optional sign, digits, optional decimal, optional unit suffix
  const match = trimmed.match(/^([+-]?\d*\.?\d+)\s*(mil|mm|in|px)?$/i);
  if (!match) {
    return { value: 0, unit: '' };
  }

  const value = parseFloat(match[1]);
  const rawUnit = (match[2] || '').toLowerCase() as SvgUnit;

  return { value, unit: rawUnit };
}

// ── Convert any supported unit → mil ─────────────────────────────────────────

/**
 * Convert a value in the given source unit to mil.
 * Unitless values are treated as px (SVG default).
 */
export function toMil(value: number, unit: SvgUnit, dpi: number = DEFAULT_DPI): number {
  switch (unit) {
    case 'mil':
      return value;
    case 'mm':
      return mmToMil(value);
    case 'in':
      return inchToMil(value);
    case 'px':
    case '':
      // SVG spec: unitless values are equivalent to px
      return pxToMil(value, dpi);
  }
}

// ── Convert any supported unit → CircuitMind grid units ──────────────────────

/**
 * Convert a value in the given source unit to CircuitMind grid units (0.1").
 */
export function toGridUnits(value: number, unit: SvgUnit, dpi: number = DEFAULT_DPI): number {
  return milToGridUnits(toMil(value, unit, dpi));
}

// ── SVG viewBox coordinate normalization ─────────────────────────────────────

export interface ViewBoxRect {
  width: number;
  height: number;
  minX?: number;
  minY?: number;
}

/**
 * Normalize a coordinate value from an SVG viewBox coordinate system
 * into CircuitMind grid units, accounting for the declared SVG dimensions
 * and their unit.
 *
 * This is the key function for placing pin positions: SVG element coordinates
 * live in viewBox space, but we need them in grid-unit space relative to the
 * component origin.
 *
 * @param value      Raw coordinate from the SVG viewBox space
 * @param sourceUnit Unit of the SVG's declared width/height attributes
 * @param viewBox    Parsed viewBox (width, height, and optionally minX/minY)
 * @param svgDimensions Declared width/height of the <svg> element (in sourceUnit)
 */
export function normalizeToViewBox(
  value: number,
  sourceUnit: SvgUnit,
  viewBox: ViewBoxRect,
  svgDimensions: { width: number; height: number }
): number {
  if (viewBox.width === 0 || viewBox.height === 0) return 0;

  // The SVG coordinate → physical ratio uses the larger dimension to maintain
  // aspect ratio, but we keep x/y independent for non-square parts.
  // viewBox coordinates map linearly: viewBox.width → svgDimensions.width
  // We use the width ratio here; caller should use the appropriate axis.
  const physicalWidth = toGridUnits(svgDimensions.width, sourceUnit);

  // Scale factor: viewBox units → grid units
  const scale = physicalWidth / viewBox.width;

  return value * scale;
}

/**
 * Create independent X and Y normalizers from SVG metadata.
 * Returns functions that convert viewBox coordinates to grid units.
 */
export function createViewBoxNormalizers(
  sourceUnit: SvgUnit,
  viewBox: ViewBoxRect,
  svgDimensions: { width: number; height: number }
): { normalizeX: (vbX: number) => number; normalizeY: (vbY: number) => number } {
  const gridW = toGridUnits(svgDimensions.width, sourceUnit);
  const gridH = toGridUnits(svgDimensions.height, sourceUnit);

  const scaleX = viewBox.width !== 0 ? gridW / viewBox.width : 0;
  const scaleY = viewBox.height !== 0 ? gridH / viewBox.height : 0;

  const minX = viewBox.minX ?? 0;
  const minY = viewBox.minY ?? 0;

  return {
    normalizeX: (vbX: number) => (vbX - minX) * scaleX,
    normalizeY: (vbY: number) => (vbY - minY) * scaleY,
  };
}

// ── viewBox string parser ────────────────────────────────────────────────────

/**
 * Parse an SVG viewBox attribute string ("minX minY width height") into a
 * structured object. Returns a default 100x100 box if parsing fails.
 */
export function parseViewBox(viewBoxStr: string | null | undefined): ViewBoxRect {
  if (!viewBoxStr) {
    return { minX: 0, minY: 0, width: 100, height: 100 };
  }

  const parts = viewBoxStr.trim().split(/[\s,]+/).map(Number);
  if (parts.length < 4 || parts.some(isNaN)) {
    return { minX: 0, minY: 0, width: 100, height: 100 };
  }

  return {
    minX: parts[0],
    minY: parts[1],
    width: parts[2],
    height: parts[3],
  };
}
