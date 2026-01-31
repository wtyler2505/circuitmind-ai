
import JSZip from 'jszip';
import { xml2js, ElementCompact } from 'xml-js';
import { ElectronicComponent, ComponentFootprint } from '../types';

export interface FritzingPart {
  moduleId: string;
  fzp: ElementCompact;
  svgs: {
    breadboard?: string;
    schematic?: string;
    pcb?: string;
    icon?: string;
  };
  component: Partial<ElectronicComponent>;
}

export class FzpzLoader {
  
  static async load(file: File | ArrayBuffer): Promise<FritzingPart> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    let fzpFile = '';
    let fzpContent = '';
    
    // Find .fzp file
    for (const filename of Object.keys(contents.files)) {
      if (filename.endsWith('.fzp')) {
        fzpFile = filename;
        fzpContent = await contents.files[filename].async('text');
        break;
      }
    }
    
    if (!fzpFile) {
      throw new Error('Invalid FZPZ: No .fzp metadata found');
    }
    
    // Parse FZP XML
    const fzp = xml2js(fzpContent, { compact: true }) as ElementCompact;
    const module = fzp.module;
    const moduleId = module._attributes.moduleId;
    
    const svgs: FritzingPart['svgs'] = {};
    
    // Extract SVG layers
    const views = module.views;
    if (views.breadboardView?.layers?._attributes?.image) {
      svgs.breadboard = await this.extractSvg(zip, views.breadboardView.layers._attributes.image);
    }
    if (views.schematicView?.layers?._attributes?.image) {
      svgs.schematic = await this.extractSvg(zip, views.schematicView.layers._attributes.image);
    }
    
    // Build Component Data
    const component: Partial<ElectronicComponent> = {
      name: module.title?._text || 'Unknown Part',
      description: module.label?._text || '',
      type: 'other', // Default, needs heuristic
      fzpzSource: file instanceof File ? await file.arrayBuffer() : file,
      footprint: this.extractFootprint(module, svgs.breadboard)
    };
    
    return {
      moduleId,
      fzp: module,
      svgs,
      component
    };
  }
  
  private static async extractSvg(zip: JSZip, path: string): Promise<string> {
    // Fritzing paths are often relative like 'breadboard/foo.svg'
    // But zip might be flat or nested.
    // Standard .fzpz is flat with 'svg.breadboard.foo.svg' naming
    
    // Try exact path
    if (zip.file(path)) {
        return await zip.file(path)!.async('text');
    }
    
    // Try flattening path (standard fzpz structure)
    // image='breadboard/part.svg' -> 'svg.breadboard.part.svg'
    const parts = path.split('/');
    const flatName = `svg.${parts.join('.')}`;
    
    // Search for fuzzy match
    const matchingFile = Object.keys(zip.files).find(f => f.endsWith(parts[parts.length - 1]));
    if (matchingFile) {
        return await zip.file(matchingFile)!.async('text');
    }
    
    return '';
  }
  
  private static extractFootprint(fzp: ElementCompact, breadboardSvg?: string): ComponentFootprint | undefined {
    if (!breadboardSvg) return undefined;
    
    // Parse SVG dimensions
    let width = 10;
    let height = 10;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(breadboardSvg, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    
    if (svgEl) {
      // Try to get viewBox first
      const viewBox = svgEl.getAttribute('viewBox');
      if (viewBox) {
        const [, , w, h] = viewBox.split(/\s+/).map(parseFloat);
        // Fritzing SVGs are usually in 1/1000 inch units if viewBox is used without units? 
        // Actually, we need to respect the unit system.
        // For simplicity, let's look at width/height attributes which usually have units
        const wAttr = svgEl.getAttribute('width');
        const hAttr = svgEl.getAttribute('height');
        
        const parseUnit = (val: string | null): number => {
            if (!val) return 1;
            if (val.endsWith('in')) return parseFloat(val) * 10; // 1in = 10 units
            if (val.endsWith('mm')) return parseFloat(val) / 2.54; // 2.54mm = 1 unit
            if (val.endsWith('px')) return parseFloat(val) / 100; // Assume 100dpi
            return parseFloat(val); // Unknown, assume raw
        };
        
        width = parseUnit(wAttr) || (w / 100); // Fallback
        height = parseUnit(hAttr) || (h / 100);
      }
    }
    
    const pins: ComponentFootprint['pins'] = [];
    
    // Map connectors
    const connectors = fzp.module.connectors.connector;
    const connectorArray = Array.isArray(connectors) ? connectors : [connectors];
    
    connectorArray.forEach((c: any) => {
        const id = c._attributes.id;
        const breadboardLayer = c.views?.breadboardView?.p;
        const svgId = breadboardLayer?._attributes?.svgId;
        
        if (svgId && doc) {
            const el = doc.getElementById(svgId);
            if (el) {
                // Get centroid of the element
                // In a real DOM, we'd use getBBox(), but in jsdom/simulated environment it's hard.
                // We'll try to read cx/cy if circle, or x/y if rect
                let x = 0, y = 0;
                if (el.tagName === 'circle') {
                    x = parseFloat(el.getAttribute('cx') || '0');
                    y = parseFloat(el.getAttribute('cy') || '0');
                } else if (el.tagName === 'rect') {
                    x = parseFloat(el.getAttribute('x') || '0') + parseFloat(el.getAttribute('width') || '0') / 2;
                    y = parseFloat(el.getAttribute('y') || '0') + parseFloat(el.getAttribute('height') || '0') / 2;
                } else if (el.tagName === 'g') {
                    // Try to find a child circle or rect
                    const child = el.querySelector('circle, rect');
                    if (child) {
                         if (child.tagName === 'circle') {
                            x = parseFloat(child.getAttribute('cx') || '0');
                            y = parseFloat(child.getAttribute('cy') || '0');
                        }
                    }
                }
                
                // Scale coordinates if viewBox is vastly different from width/height
                // This is a naive implementation; rigorous matrix transform needed for production
                // Assuming SVG coordinates match the unit scale roughly or we normalize
                // For "God Mode" parts, we enforce units. For wild parts, it's wild west.
                
                // Normalize to 0.1" grid units
                // If width is in inches (e.g. 1in), and coord is 500 (mil), we need to divide by 100
                const svgWidthRaw = parseFloat(svgEl?.getAttribute('viewBox')?.split(/\s+/)[2] || '100');
                const scaleX = width / svgWidthRaw;
                const scaleY = height / (parseFloat(svgEl?.getAttribute('viewBox')?.split(/\s+/)[3] || '100'));
                
                pins.push({
                    id,
                    x: x * scaleX,
                    y: y * scaleY,
                    svgElementId: svgId
                });
            }
        }
    });
    
    return {
      width,
      height,
      pins
    };
  }
}
