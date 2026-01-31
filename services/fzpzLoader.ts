
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
      svgs: this.sanitizeSvgs(svgs),
      component
    };
  }

  private static sanitizeSvgs(svgs: FritzingPart['svgs']): FritzingPart['svgs'] {
    const sanitized: FritzingPart['svgs'] = {};
    for (const [view, content] of Object.entries(svgs)) {
      if (!content) continue;
      // Basic sanitization: remove scripts and event handlers
      let clean = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '')
        .replace(/on\w+='[^']*'/g, '');
      
      sanitized[view as keyof FritzingPart['svgs']] = clean;
    }
    return sanitized;
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
    
    const parser = new DOMParser(); // eslint-disable-line no-undef
    const doc = parser.parseFromString(breadboardSvg, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    
    if (svgEl) {
      const wAttr = svgEl.getAttribute('width');
      const hAttr = svgEl.getAttribute('height');
      const viewBox = svgEl.getAttribute('viewBox');
      
      const parseUnit = (val: string | null): number => {
          if (!val) return 0;
          const num = parseFloat(val);
          if (val.endsWith('in')) return num * 10; // 1in = 10 units (0.1" grid)
          if (val.endsWith('mm')) return (num / 25.4) * 10; // 25.4mm = 1in = 10 units
          if (val.endsWith('mil')) return num / 10; // 1000mil = 1in = 10 units -> 100mil = 1 unit
          if (val.endsWith('px')) return (num / 96) * 10; // Assume 96dpi
          return num; // Unknown, assume 1/1000 inch (mil) if large, or inches if small
      };
      
      width = parseUnit(wAttr);
      height = parseUnit(hAttr);

      // Fallback to viewBox if width/height missing
      if (!width || !height) {
          if (viewBox) {
              const [, , w, h] = viewBox.split(/\s+/).map(parseFloat);
              // If large numbers, assume mil
              width = w > 50 ? w / 10 : w;
              height = h > 50 ? h / 10 : h;
          } else {
              width = 10;
              height = 10;
          }
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
                let x = 0, y = 0;
                if (el.tagName === 'circle') {
                    x = parseFloat(el.getAttribute('cx') || '0');
                    y = parseFloat(el.getAttribute('cy') || '0');
                } else if (el.tagName === 'rect') {
                    x = parseFloat(el.getAttribute('x') || '0') + parseFloat(el.getAttribute('width') || '0') / 2;
                    y = parseFloat(el.getAttribute('y') || '0') + parseFloat(el.getAttribute('height') || '0') / 2;
                } else {
                    // Try to find a child circle or rect or use bounding box centroid
                    const child = el.querySelector('circle, rect');
                    if (child) {
                         if (child.tagName === 'circle') {
                            x = parseFloat(child.getAttribute('cx') || '0');
                            y = parseFloat(child.getAttribute('cy') || '0');
                        } else {
                            x = parseFloat(child.getAttribute('x') || '0') + parseFloat(child.getAttribute('width') || '0') / 2;
                            y = parseFloat(child.getAttribute('y') || '0') + parseFloat(child.getAttribute('height') || '0') / 2;
                        }
                    }
                }
                
                // Normalize coordinates
                const viewBox = svgEl?.getAttribute('viewBox')?.split(/\s+/) || ['0', '0', '100', '100'];
                const vbW = parseFloat(viewBox[2]);
                const vbH = parseFloat(viewBox[3]);
                
                const scaleX = width / vbW;
                const scaleY = height / vbH;
                
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
}
