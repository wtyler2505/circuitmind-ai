import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify';
import { ElectronicComponent } from '../../../types';
import { partStorageService } from '../../../services/partStorageService';
import { FzpzLoader } from '../../../services/fzpzLoader';
import { FOOTPRINT_CANVAS_SCALE } from '../componentShapes';

/** Supported diagram views matching Fritzing's three-view paradigm. */
export type FzpzViewType = 'breadboard' | 'schematic' | 'pcb';

/** Quality tier for rendering performance tradeoffs. */
export type RenderQuality = 'high' | 'medium' | 'low';

interface FzpzVisualProps {
  component: ElectronicComponent;
  /** Which view to render. Defaults to 'breadboard' for backward compatibility. */
  view?: FzpzViewType;
  /** Rendering quality tier. 'high' = full SVG, 'medium' = will-change hint, 'low' = rasterized canvas. */
  quality?: RenderQuality;
}

/** Threshold: SVGs with more than this many elements get auto-downgraded to 'medium'. */
const COMPLEX_SVG_ELEMENT_THRESHOLD = 1000;

/**
 * Count the approximate number of SVG elements in a string.
 * Uses a lightweight regex rather than DOM parsing for speed.
 */
const countSvgElements = (svg: string): number => {
  const matches = svg.match(/<[a-z][a-z0-9-]*[\s>/]/gi);
  return matches ? matches.length : 0;
};

/**
 * Extract the viewBox attribute from an SVG string.
 * Returns [minX, minY, width, height] or null if not found/invalid.
 */
const parseViewBox = (svg: string): [number, number, number, number] | null => {
  const match = svg.match(/viewBox=["']([^"']+)["']/);
  if (!match) return null;
  const parts = match[1].split(/[\s,]+/).map(Number);
  if (parts.length < 4 || parts.some((v) => !Number.isFinite(v))) return null;
  if (parts[2] <= 0 || parts[3] <= 0) return null;
  return parts as [number, number, number, number];
};

/** DOMPurify config shared across all views. */
const SANITIZE_CONFIG: DOMPurifyConfig = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ['use', 'symbol', 'defs', 'clipPath', 'mask'],
  ADD_ATTR: ['xlink:href', 'clip-path', 'mask', 'transform', 'viewBox'],
  FORBID_TAGS: ['script', 'style'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
};

/**
 * Strip the outer <svg> wrapper but keep all child content.
 */
const extractInnerSvg = (svg: string): string => {
  return svg.replace(/<svg[^>]*>/i, '').replace(/<\/svg>/i, '');
};

/**
 * FzpzVisual
 *
 * Renders high-fidelity SVG from a .fzpz file for any of the three Fritzing views
 * (breadboard, schematic, pcb). Normalizes SVG scaling to the FOOTPRINT_CANVAS_SCALE
 * grid and sanitizes content to prevent XSS from malicious FZPZ files.
 *
 * Quality modes:
 *  - 'high':   Full SVG rendering (default)
 *  - 'medium': Adds will-change hint for complex SVGs (>1000 elements)
 *  - 'low':    Rasterizes to an offscreen canvas for maximum perf
 */
export const FzpzVisual: React.FC<FzpzVisualProps> = memo(function FzpzVisual({
  component,
  view = 'breadboard',
  quality = 'high',
}) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [effectiveQuality, setEffectiveQuality] = useState<RenderQuality>(quality);
  const [rasterDataUrl, setRasterDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pick the right SVG field from cache based on the active view
  const getSvgForView = useCallback(
    (cached: { breadboardSvg?: string; schematicSvg?: string; pcbSvg?: string }): string | undefined => {
      switch (view) {
        case 'schematic':
          return cached.schematicSvg;
        case 'pcb':
          return cached.pcbSvg;
        case 'breadboard':
        default:
          return cached.breadboardSvg;
      }
    },
    [view]
  );

  // Load the SVG for the requested view
  useEffect(() => {
    let cancelled = false;

    const loadSvg = async () => {
      if (!component.fzpzSource) return;

      try {
        // Try cache first
        const cached = await partStorageService.getPart(component.id);
        const cachedSvg = cached ? getSvgForView(cached) : undefined;

        if (cachedSvg) {
          if (!cancelled) setSvgContent(cachedSvg);
        } else {
          // Parse on the fly
          const part = await FzpzLoader.load(component.fzpzSource);
          const freshSvg =
            view === 'schematic'
              ? part.svgs.schematic
              : view === 'pcb'
                ? part.svgs.pcb
                : part.svgs.breadboard;

          if (!cancelled) setSvgContent(freshSvg || null);

          // Update cache with any missing views
          if (cached) {
            const updatedCache = { ...cached };
            if (part.svgs.breadboard && !cached.breadboardSvg)
              updatedCache.breadboardSvg = part.svgs.breadboard;
            if (part.svgs.schematic && !cached.schematicSvg)
              updatedCache.schematicSvg = part.svgs.schematic;
            if (part.svgs.pcb && !cached.pcbSvg)
              updatedCache.pcbSvg = part.svgs.pcb;

            await partStorageService.savePart(updatedCache);
          }
        }
      } catch (e) {
        console.error(`Failed to load FZPZ visual (view=${view})`, e);
      }
    };

    loadSvg();
    return () => {
      cancelled = true;
    };
  }, [component.id, component.fzpzSource, view, getSvgForView]);

  // Auto-downgrade quality for complex SVGs
  useEffect(() => {
    if (!svgContent) return;

    if (quality === 'high') {
      const elementCount = countSvgElements(svgContent);
      if (elementCount > COMPLEX_SVG_ELEMENT_THRESHOLD) {
        setEffectiveQuality('medium');
      } else {
        setEffectiveQuality('high');
      }
    } else {
      setEffectiveQuality(quality);
    }
  }, [svgContent, quality]);

  // Rasterize SVG for 'low' quality mode
  useEffect(() => {
    if (effectiveQuality !== 'low' || !svgContent) {
      setRasterDataUrl(null);
      return;
    }

    const width = component.footprint
      ? component.footprint.width * FOOTPRINT_CANVAS_SCALE
      : 100;
    const height = component.footprint
      ? component.footprint.height * FOOTPRINT_CANVAS_SCALE
      : 100;

    // Build a complete SVG document for rasterization
    const vb = parseViewBox(svgContent);
    const viewBoxAttr = vb ? `viewBox="${vb.join(' ')}"` : '';
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ${viewBoxAttr}>${extractInnerSvg(svgContent)}</svg>`;
    const sanitized = DOMPurify.sanitize(fullSvg, {
      ...SANITIZE_CONFIG,
      ADD_TAGS: [...(SANITIZE_CONFIG.ADD_TAGS as string[]), 'svg'],
    });

    const blob = new Blob([String(sanitized)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = width * 2; // 2x for retina
      offscreen.height = height * 2;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0, width, height);
        setRasterDataUrl(offscreen.toDataURL('image/png'));
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [effectiveQuality, svgContent, component.footprint]);

  // Dimensions for the component
  const width = component.footprint
    ? component.footprint.width * FOOTPRINT_CANVAS_SCALE
    : 50;
  const height = component.footprint
    ? component.footprint.height * FOOTPRINT_CANVAS_SCALE
    : 50;

  // Loading / missing SVG fallback
  if (!svgContent) {
    return (
      <rect
        width={width}
        height={height}
        fill="#333"
        stroke="#666"
        strokeWidth="1"
      />
    );
  }

  // Low quality: render rasterized image
  if (effectiveQuality === 'low' && rasterDataUrl) {
    return (
      <image
        href={rasterDataUrl}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }

  // Sanitize SVG inner content
  const innerContent = extractInnerSvg(svgContent);
  const sanitizedContent = DOMPurify.sanitize(innerContent, SANITIZE_CONFIG);

  // ViewBox normalization: scale SVG content to fit the footprint dimensions
  const vb = parseViewBox(svgContent);
  const hasValidViewBox = vb !== null;
  const scaleX = hasValidViewBox ? width / vb![2] : 1;
  const scaleY = hasValidViewBox ? height / vb![3] : 1;

  // Medium quality: add will-change for GPU compositing
  const willChangeStyle: React.CSSProperties | undefined =
    effectiveQuality === 'medium' ? { willChange: 'transform' } : undefined;

  return (
    <g
      className="fzpz-content"
      transform={
        hasValidViewBox
          ? `translate(${-vb![0] * scaleX} ${-vb![1] * scaleY}) scale(${scaleX} ${scaleY})`
          : undefined
      }
      style={willChangeStyle}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
});
