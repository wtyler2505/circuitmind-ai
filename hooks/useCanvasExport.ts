import { useState, useCallback } from 'react';
import type { WiringDiagram } from '../types';

type ExportStatus = 'idle' | 'exporting' | 'done' | 'error';

function resetStatusAfterDelay(setter: (s: ExportStatus) => void, status: ExportStatus) {
  setter(status);
  setTimeout(() => setter('idle'), 1500);
}

export function useCanvasExport(
  svgRef: React.RefObject<SVGSVGElement | null>,
  diagram: WiringDiagram | null
) {
  const [svgExportStatus, setSvgExportStatus] = useState<ExportStatus>('idle');
  const [pngExportStatus, setPngExportStatus] = useState<ExportStatus>('idle');

  const handleExportSVG = useCallback(() => {
    if (!svgRef.current || !diagram) {
      resetStatusAfterDelay(setSvgExportStatus, 'error');
      return;
    }
    setSvgExportStatus('exporting');
    try {
      const svg = svgRef.current;
      const bbox = svg.getBBox();
      const padding = 40;

      const svgClone = svg.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
      svgClone.setAttribute('width', String(bbox.width + padding * 2));
      svgClone.setAttribute('height', String(bbox.height + padding * 2));

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', String(bbox.x - padding));
      bg.setAttribute('y', String(bbox.y - padding));
      bg.setAttribute('width', String(bbox.width + padding * 2));
      bg.setAttribute('height', String(bbox.height + padding * 2));
      bg.setAttribute('fill', '#0f172a');
      svgClone.insertBefore(bg, svgClone.firstChild);

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagram.title.replace(/\s+/g, '_')}_diagram.svg`;
      link.click();
      URL.revokeObjectURL(url);
      resetStatusAfterDelay(setSvgExportStatus, 'done');
    } catch (_e) {
      console.error('SVG export failed:', _e);
      resetStatusAfterDelay(setSvgExportStatus, 'error');
    }
  }, [diagram, svgRef]);

  const handleExportPNG = useCallback(() => {
    if (!svgRef.current || !diagram) {
      resetStatusAfterDelay(setPngExportStatus, 'error');
      return;
    }
    setPngExportStatus('exporting');
    try {
      const svg = svgRef.current;
      const bbox = svg.getBBox();
      const padding = 40;
      const scale = 2;
      const width = (bbox.width + padding * 2) * scale;
      const height = (bbox.height + padding * 2) * scale;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resetStatusAfterDelay(setPngExportStatus, 'error');
        return;
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const svgClone = svg.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
      svgClone.setAttribute('width', String(width));
      svgClone.setAttribute('height', String(height));

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resetStatusAfterDelay(setPngExportStatus, 'error');
      };
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `${diagram.title.replace(/\s+/g, '_')}_diagram.png`;
            link.click();
            URL.revokeObjectURL(pngUrl);
            resetStatusAfterDelay(setPngExportStatus, 'done');
          } else {
            resetStatusAfterDelay(setPngExportStatus, 'error');
          }
        }, 'image/png');
      };
      img.src = url;
    } catch (_e) {
      console.error('PNG export failed:', _e);
      resetStatusAfterDelay(setPngExportStatus, 'error');
    }
  }, [diagram, svgRef]);

  const getSnapshotBlob = useCallback(async (): Promise<Blob | null> => {
    if (!svgRef.current || !diagram) return null;
    const svg = svgRef.current;
    const bbox = svg.getBBox();
    const padding = 40;
    const targetWidth = 1024;
    const scale = targetWidth / (bbox.width + padding * 2);
    const width = targetWidth;
    const height = (bbox.height + padding * 2) * scale;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const svgClone = svg.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
    svgClone.setAttribute('width', String(width));
    svgClone.setAttribute('height', String(height));

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.8);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }, [diagram, svgRef]);

  return {
    svgExportStatus,
    pngExportStatus,
    handleExportSVG,
    handleExportPNG,
    getSnapshotBlob,
  };
}
