
import JSZip from 'jszip';
import { xml2js, ElementCompact } from 'xml-js';
import { ElectronicComponent, ComponentFootprint } from '../types';

export interface FzpzDiagnostic {
  level: 'warning' | 'error';
  code: string;
  message: string;
}

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
  diagnostics: FzpzDiagnostic[];
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
    
    const connectorNames = this.extractConnectorNames(module);
    const internalBuses = this.deriveInternalBuses(module.title?._text || '', connectorNames);
    const footprint = this.extractFootprint(module, svgs.breadboard);
    const diagnostics = this.validatePartMetadata(module.title?._text || 'Unknown Part', connectorNames, footprint);

    // Build Component Data
    const component: Partial<ElectronicComponent> = {
      name: module.title?._text || 'Unknown Part',
      description: module.label?._text || '',
      type: 'other', // Default, needs heuristic
      fzpzSource: file instanceof File ? await file.arrayBuffer() : file,
      footprint,
      pins: connectorNames,
      internalBuses,
    };
    
    return {
      moduleId,
      fzp: module,
      svgs: this.sanitizeSvgs(svgs),
      component,
      diagnostics,
    };
  }

  private static validatePartMetadata(
    partName: string,
    connectorNames: string[],
    footprint?: ComponentFootprint
  ): FzpzDiagnostic[] {
    const diagnostics: FzpzDiagnostic[] = [];

    if (connectorNames.length === 0) {
      diagnostics.push({
        level: 'warning',
        code: 'NO_CONNECTORS',
        message: `Part "${partName}" has no connectors in metadata.`,
      });
    }

    const uniqueConnectorCount = new Set(connectorNames).size;
    if (uniqueConnectorCount !== connectorNames.length) {
      diagnostics.push({
        level: 'warning',
        code: 'DUPLICATE_CONNECTORS',
        message: `Part "${partName}" contains duplicate connector names/ids.`,
      });
    }

    if (!footprint) {
      diagnostics.push({
        level: 'warning',
        code: 'NO_FOOTPRINT',
        message: `Part "${partName}" has no extractable footprint from breadboard SVG.`,
      });
      return diagnostics;
    }

    if (footprint.width <= 0 || footprint.height <= 0) {
      diagnostics.push({
        level: 'error',
        code: 'INVALID_FOOTPRINT_DIMENSIONS',
        message: `Part "${partName}" footprint has invalid dimensions (${footprint.width} x ${footprint.height}).`,
      });
    }

    const outOfBoundsPins = footprint.pins.filter(
      (pin) => pin.x < 0 || pin.y < 0 || pin.x > footprint.width || pin.y > footprint.height
    );
    if (outOfBoundsPins.length > 0) {
      diagnostics.push({
        level: 'warning',
        code: 'PIN_OUT_OF_BOUNDS',
        message: `Part "${partName}" has ${outOfBoundsPins.length} connector(s) outside footprint bounds.`,
      });
    }

    return diagnostics;
  }

  private static sanitizeSvgs(svgs: FritzingPart['svgs']): FritzingPart['svgs'] {
    const sanitized: FritzingPart['svgs'] = {};
    for (const [view, content] of Object.entries(svgs)) {
      if (!content) continue;
      
      // Basic sanitization: remove scripts and event handlers
      const clean: string = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '')
        .replace(/on\w+='[^']*'/g, '');
      
      sanitized[view as keyof FritzingPart['svgs']] = clean;
    }
    return sanitized;
  }

  private static extractConnectorNames(module: Record<string, unknown>): string[] {
    const normalizedModule = module as { connectors?: { connector?: unknown } };
    const connectors = normalizedModule.connectors?.connector;
    if (!connectors) return [];

    const connectorArray = Array.isArray(connectors) ? connectors : [connectors];
    return connectorArray
      .map((connector) => {
        if (!connector || typeof connector !== 'object') return undefined;
        const attrs = (connector as { _attributes?: { name?: string; id?: string } })._attributes;
        return attrs?.name || attrs?.id;
      })
      .filter((name: unknown): name is string => typeof name === 'string' && name.length > 0);
  }

  private static deriveInternalBuses(partTitle: string, pinNames: string[]): string[][] {
    const lowerTitle = partTitle.toLowerCase();
    const looksLikeBreadboard = lowerTitle.includes('breadboard') || pinNames.some((p) => /^pin_\d+_\d+$/.test(p));
    if (!looksLikeBreadboard || pinNames.length === 0) return [];

    const buses: string[][] = [];
    const stripGroups = new Map<string, string[]>();
    const railGroups = new Map<string, string[]>();

    for (const pin of pinNames) {
      const stripMatch = pin.match(/^pin_(\d+)_(\d+)$/);
      if (stripMatch) {
        const column = stripMatch[1];
        const lane = Number(stripMatch[2]);
        const bank = lane <= 4 ? 'left' : 'right';
        const key = `${column}:${bank}`;
        const arr = stripGroups.get(key) || [];
        arr.push(pin);
        stripGroups.set(key, arr);
        continue;
      }

      const railMatch = pin.match(/^(vcc|gnd)_(top|bottom)_\d+$/i);
      if (railMatch) {
        const key = `${railMatch[1].toLowerCase()}_${railMatch[2].toLowerCase()}`;
        const arr = railGroups.get(key) || [];
        arr.push(pin);
        railGroups.set(key, arr);
      }
    }

    for (const group of stripGroups.values()) {
      if (group.length > 1) buses.push(group);
    }
    for (const group of railGroups.values()) {
      if (group.length > 1) buses.push(group);
    }

    return buses;
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
    
    connectorArray.forEach((connectorUnknown: unknown) => {
        if (!connectorUnknown || typeof connectorUnknown !== 'object') return;
        const c = connectorUnknown as {
          _attributes?: { id?: string };
          views?: { breadboardView?: { p?: { _attributes?: { svgId?: string } } } };
        };

        const id = c._attributes?.id;
        if (!id) return;

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
