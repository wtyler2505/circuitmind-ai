import React, { useState, useEffect } from 'react';
import { ElectronicComponent } from '../../../types';
import { partStorageService } from '../../../services/partStorageService';
import { FzpzLoader } from '../../../services/fzpzLoader';

interface FzpzVisualProps {
  component: ElectronicComponent;
}

/**
 * FzpzVisual
 * 
 * Renders the high-fidelity breadboard view from a .fzpz file.
 * Normalizes the SVG to the 10px = 0.1" grid.
 */
export const FzpzVisual: React.FC<FzpzVisualProps> = ({ component }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState<string>('0 0 100 100');

  useEffect(() => {
    const loadSvg = async () => {
      if (!component.fzpzSource) return;

      try {
        // Try cache first
        const cached = await partStorageService.getPart(component.id);
        if (cached?.breadboardSvg) {
          setSvgContent(cached.breadboardSvg);
        } else {
          // Parse on the fly
          const part = await FzpzLoader.load(component.fzpzSource);
          setSvgContent(part.svgs.breadboard || null);
          
          // Update cache if missing views
          if (cached) {
            await partStorageService.savePart({
              ...cached,
              breadboardSvg: part.svgs.breadboard
            });
          }
        }
      } catch (e) {
        console.error('Failed to load FZPZ visual', e);
      }
    };

    loadSvg();
  }, [component.id, component.fzpzSource]);

  useEffect(() => {
    if (!svgContent) return;

    // Extract viewBox from string
    const match = svgContent.match(/viewBox=["']([^"']+)["']/);
    if (match) {
      setViewBox(match[1]);
    }
  }, [svgContent]);

  if (!svgContent) {
    return (
      <rect 
        width={component.footprint?.width || 50} 
        height={component.footprint?.height || 50} 
        fill="#333" 
        stroke="#666" 
        strokeWidth="1"
      />
    );
  }

  // Inject the SVG content
  // We need to strip the <svg> tags and just keep the inner content,
  // OR render it inside a <g> with scaling.
  
  // Clean SVG: remove xmlns and the root <svg> tag but keep children
  const innerContent = svgContent
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\/svg>/i, '');

  const width = component.footprint?.width || 10;
  const height = component.footprint?.height || 10;

  return (
    <g 
      className="fzpz-content"
      dangerouslySetInnerHTML={{ __html: innerContent }}
    />
  );
};
