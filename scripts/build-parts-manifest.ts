import * as fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { xml2js, ElementCompact } from 'xml-js';

const PARTS_DIR = 'public/parts';
const MANIFEST_FILE = 'public/parts/parts-manifest.json';

interface ManifestItem {
  id: string;
  name: string;
  type: string;
  description: string;
  fzpzUrl: string;
  pins: string[];
}

async function buildManifest() {
  const files = fs.readdirSync(PARTS_DIR).filter(f => f.endsWith('.fzpz'));
  const manifest: ManifestItem[] = [];

  for (const file of files) {
    const filePath = path.join(PARTS_DIR, file);
    const buffer = fs.readFileSync(filePath);
    
    const zip = new JSZip();
    const contents = await zip.loadAsync(buffer);
    
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
      console.warn(`No .fzp found in ${file}`);
      continue;
    }
    
    // Parse FZP XML
    const fzp = xml2js(fzpContent, { compact: true }) as ElementCompact;
    const module = fzp.module;
    const moduleId = module._attributes.moduleId;
    
    const pins: string[] = [];
    const connectors = module.connectors?.connector;
    if (connectors) {
      const connArray = Array.isArray(connectors) ? connectors : [connectors];
      connArray.forEach((c: any) => {
        pins.push(c._attributes.name || c._attributes.id);
      });
    }

    // Try to get type from properties
    let type = 'other';
    const props = module.properties?.property;
    if (props) {
      const propArray = Array.isArray(props) ? props : [props];
      const typeProp = propArray.find((p: any) => p._attributes.name === 'type');
      if (typeProp) {
        type = typeProp._text || 'other';
      }
    }

    manifest.push({
      id: moduleId,
      name: module.title?._text || file.replace('.fzpz', ''),
      type: type,
      description: module.description?._text || module.label?._text || '',
      fzpzUrl: `/parts/${file}`,
      pins: pins
    });
    
    console.log(`Indexed ${moduleId} (${file})`);
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written to ${MANIFEST_FILE}`);
}

buildManifest().catch(console.error);
