import { jsPDF } from 'jspdf';
import { WiringDiagram, ElectronicComponent } from '../types';
import { bomService } from './bomService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExportFormat = 'svg' | 'png' | 'pdf' | 'bom-csv' | 'bom-json';
export type ExportScope = 'all' | 'selected';
export type PngResolution = 1 | 2 | 4;

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  /** Only used for PNG exports */
  pngResolution?: PngResolution;
  /** Component IDs when scope is 'selected' */
  selectedIds?: Set<string>;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function sanitizeTitle(title: string): string {
  return title.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function scopeDiagram(
  diagram: WiringDiagram,
  scope: ExportScope,
  selectedIds?: Set<string>
): WiringDiagram {
  if (scope === 'all' || !selectedIds || selectedIds.size === 0) return diagram;
  const components = diagram.components.filter((c) => selectedIds.has(c.id));
  const componentIds = new Set(components.map((c) => c.id));
  const connections = diagram.connections.filter(
    (conn) => componentIds.has(conn.fromComponentId) && componentIds.has(conn.toComponentId)
  );
  return { ...diagram, components, connections };
}

// ---------------------------------------------------------------------------
// SVG Export
// ---------------------------------------------------------------------------

function exportSVG(
  svgElement: SVGSVGElement,
  diagram: WiringDiagram
): ExportResult {
  const bbox = svgElement.getBBox();
  const padding = 40;

  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  svgClone.setAttribute(
    'viewBox',
    `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`
  );
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
  const filename = `${sanitizeTitle(diagram.title)}-${timestamp()}.svg`;

  return { blob, filename };
}

// ---------------------------------------------------------------------------
// PNG Export
// ---------------------------------------------------------------------------

function exportPNG(
  svgElement: SVGSVGElement,
  diagram: WiringDiagram,
  resolution: PngResolution = 2
): Promise<ExportResult> {
  return new Promise((resolve, reject) => {
    const bbox = svgElement.getBBox();
    const padding = 40;
    const width = (bbox.width + padding * 2) * resolution;
    const height = (bbox.height + padding * 2) * resolution;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Failed to create canvas context'));

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute(
      'viewBox',
      `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`
    );
    svgClone.setAttribute('width', String(width));
    svgClone.setAttribute('height', String(height));

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render SVG to image'));
    };
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              blob,
              filename: `${sanitizeTitle(diagram.title)}-${timestamp()}.png`,
            });
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        },
        'image/png'
      );
    };
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// PDF Export (3-page: diagram, component list, wiring table)
// ---------------------------------------------------------------------------

async function exportPDF(
  svgElement: SVGSVGElement,
  diagram: WiringDiagram,
  inventory: ElectronicComponent[]
): Promise<ExportResult> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
  const margin = 0.5;
  const pageW = 8.5 - margin * 2;
  const title = diagram.title || 'Untitled Circuit';
  const ts = new Date().toLocaleString();

  const drawHeader = (pageNum: number, totalPages: number) => {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(title, margin, 0.35);
    doc.text(`Exported: ${ts}`, 8.5 - margin, 0.35, { align: 'right' });
    doc.setFontSize(8);
    doc.text(`Page ${pageNum} of ${totalPages}`, 8.5 / 2, 10.75, { align: 'center' });
  };

  // --- Page 1: Diagram Image ---
  drawHeader(1, 3);
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Circuit Diagram', margin, 0.8);

  // Render SVG to PNG for embedding
  try {
    const pngResult = await exportPNG(svgElement, diagram, 2);
    const arrayBuf = await pngResult.blob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuf).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const imgData = `data:image/png;base64,${base64}`;

    const bbox = svgElement.getBBox();
    const aspectRatio = (bbox.width + 80) / (bbox.height + 80);
    let imgW = pageW;
    let imgH = imgW / aspectRatio;
    const maxH = 9;
    if (imgH > maxH) {
      imgH = maxH;
      imgW = imgH * aspectRatio;
    }

    doc.addImage(imgData, 'PNG', margin, 1.0, imgW, imgH);
  } catch {
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('(Diagram image could not be rendered)', margin, 1.5);
  }

  // --- Page 2: Component List ---
  doc.addPage();
  drawHeader(2, 3);
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Component List', margin, 0.8);

  const bom = bomService.generateBOM(diagram, inventory);
  const colWidths = [2.0, 1.2, 1.5, 0.6, 1.5, 0.7];
  const headers = ['Name', 'Type', 'MPN', 'Qty', 'Package', 'Price'];
  let y = 1.1;

  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.setFont('helvetica', 'bold');
  headers.forEach((h, i) => {
    const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, x, y);
  });
  doc.setFont('helvetica', 'normal');
  y += 0.05;
  doc.setDrawColor(200);
  doc.line(margin, y, margin + pageW, y);
  y += 0.2;

  doc.setFontSize(8);
  doc.setTextColor(0);
  bom.items.forEach((item) => {
    if (y > 10.2) {
      doc.addPage();
      y = 0.8;
    }
    const row = [
      item.name,
      item.type,
      item.mpn || '-',
      String(item.quantity),
      '-',
      item.estimatedPrice ? `$${item.estimatedPrice.toFixed(2)}` : '-',
    ];
    row.forEach((cell, i) => {
      const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(cell.substring(0, 25), x, y);
    });
    y += 0.22;
  });

  // Total
  y += 0.1;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Components: ${bom.items.length}`, margin, y);
  if (bom.totalEstimatedCost > 0) {
    doc.text(`Estimated Cost: $${bom.totalEstimatedCost.toFixed(2)}`, margin + 3, y);
  }

  // --- Page 3: Wiring Connections ---
  doc.addPage();
  drawHeader(3, 3);
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Wiring Connections', margin, 0.8);

  const wireHeaders = ['#', 'From Component', 'From Pin', 'To Component', 'To Pin', 'Label'];
  const wireColW = [0.3, 1.8, 1.0, 1.8, 1.0, 1.6];
  y = 1.1;

  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.setFont('helvetica', 'bold');
  wireHeaders.forEach((h, i) => {
    const x = margin + wireColW.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, x, y);
  });
  doc.setFont('helvetica', 'normal');
  y += 0.05;
  doc.setDrawColor(200);
  doc.line(margin, y, margin + pageW, y);
  y += 0.2;

  doc.setFontSize(8);
  doc.setTextColor(0);
  const compMap = new Map(diagram.components.map((c) => [c.id, c.name]));
  diagram.connections.forEach((conn, idx) => {
    if (y > 10.2) {
      doc.addPage();
      y = 0.8;
    }
    const row = [
      String(idx + 1),
      compMap.get(conn.fromComponentId) || conn.fromComponentId,
      conn.fromPin,
      compMap.get(conn.toComponentId) || conn.toComponentId,
      conn.toPin,
      conn.description || '-',
    ];
    row.forEach((cell, i) => {
      const x = margin + wireColW.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(cell.substring(0, 22), x, y);
    });
    y += 0.22;
  });

  if (diagram.connections.length === 0) {
    doc.setTextColor(150);
    doc.text('No wiring connections in this diagram.', margin, y);
  }

  const pdfBlob = doc.output('blob');
  return {
    blob: pdfBlob,
    filename: `${sanitizeTitle(diagram.title)}-${timestamp()}.pdf`,
  };
}

// ---------------------------------------------------------------------------
// BOM CSV Export
// ---------------------------------------------------------------------------

function exportBOMCSV(
  diagram: WiringDiagram,
  inventory: ElectronicComponent[]
): ExportResult {
  const bom = bomService.generateBOM(diagram, inventory);
  const rows = bom.items
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
    .map((item) => ({
      'Component Name': item.name,
      Type: item.type,
      Value: '-',
      Quantity: item.quantity,
      'Package Type': '-',
      'Manufacturer Part Number': item.mpn || '-',
    }));

  const header = Object.keys(rows[0] || {}).join(',');
  const csv = [
    header,
    ...rows.map((r) =>
      Object.values(r)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');

  return {
    blob: new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    filename: `${sanitizeTitle(diagram.title)}-bom-${timestamp()}.csv`,
  };
}

// ---------------------------------------------------------------------------
// BOM JSON Export
// ---------------------------------------------------------------------------

function exportBOMJSON(
  diagram: WiringDiagram,
  inventory: ElectronicComponent[]
): ExportResult {
  const bom = bomService.generateBOM(diagram, inventory);
  const payload = {
    diagramName: diagram.title,
    exportTimestamp: new Date().toISOString(),
    totalComponents: bom.items.reduce((sum, i) => sum + i.quantity, 0),
    components: bom.items
      .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
      .map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        value: null,
        quantity: item.quantity,
        packageType: null,
        manufacturerPartNumber: item.mpn || null,
      })),
  };

  return {
    blob: new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    filename: `${sanitizeTitle(diagram.title)}-bom-${timestamp()}.json`,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const exportService = {
  exportSVG,
  exportPNG,
  exportPDF,
  exportBOMCSV,
  exportBOMJSON,
  scopeDiagram,
  triggerDownload,
};
