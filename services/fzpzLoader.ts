
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
    
    // Naive parsing of SVG dimensions for now
    // TODO: Use a real DOMParser or regex to get width/height/viewBox
    const widthMatch = breadboardSvg.match(/width=["']([\d.]+)in["']/);
    const heightMatch = breadboardSvg.match(/height=["']([\d.]+)in["']/);
    
    let width = 10; // Default 1 inch
    let height = 10;
    
    if (widthMatch) width = parseFloat(widthMatch[1]) * 10; // in -> 0.1in units
    if (heightMatch) height = parseFloat(heightMatch[1]) * 10;
    
    return {
      width,
      height,
      pins: [] // TODO: Map connectors
    };
  }
}
