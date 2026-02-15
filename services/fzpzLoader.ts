
import JSZip from 'jszip';
import { xml2js, ElementCompact } from 'xml-js';
import {
  ElectronicComponent,
  ComponentFootprint,
  ConnectorMeta,
  ConnectorViewTarget,
} from '../types';
import { parseSvgDimension, toGridUnits } from './unitNormalization';

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

// ── Internal types for raw FZP XML structures ───────────────────────────────

/** Raw <p> element inside a connector view (xml-js compact format) */
interface RawViewP {
  _attributes?: {
    svgId?: string;
    layer?: string;
    terminalId?: string;
  };
}

/** Raw connector element from the FZP XML */
interface RawConnector {
  _attributes?: {
    id?: string;
    name?: string;
    type?: string;
  };
  views?: {
    breadboardView?: { p?: RawViewP | RawViewP[] };
    schematicView?: { p?: RawViewP | RawViewP[] };
    pcbView?: { p?: RawViewP | RawViewP[] };
  };
}

/** Raw bus element from the FZP XML */
interface RawBusNodeMember {
  _attributes?: { connectorId?: string };
}

interface RawBus {
  _attributes?: { id?: string };
  nodeMember?: RawBusNodeMember | RawBusNodeMember[];
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
    const connectorMeta = this.extractConnectorMeta(module);

    // Parse buses: prefer explicit <buses> XML, fall back to regex heuristics
    const xmlBuses = this.parseBuses(module);
    const internalBuses = xmlBuses.length > 0
      ? xmlBuses.map((b) => b.connectorIds)
      : this.deriveInternalBuses(module.title?._text || '', connectorNames);

    const footprint = this.extractFootprint(module, svgs.breadboard);
    const diagnostics = this.validatePartMetadata(
      module.title?._text || 'Unknown Part',
      connectorNames,
      footprint,
      connectorMeta,
      svgs.breadboard
    );

    // Build Component Data
    const component: Partial<ElectronicComponent> = {
      name: module.title?._text || 'Unknown Part',
      description: module.label?._text || '',
      type: 'other', // Default, needs heuristic
      fzpzSource: file instanceof File ? await file.arrayBuffer() : file,
      footprint,
      pins: connectorNames,
      internalBuses,
      connectorMeta,
    };

    return {
      moduleId,
      fzp: module,
      svgs: this.sanitizeSvgs(svgs),
      component,
      diagnostics,
    };
  }

  // ── Bus Parsing ─────────────────────────────────────────────────────────────

  /**
   * Parse explicit `<buses>` element from the FZP XML module.
   *
   * Fritzing FZP structure:
   * ```xml
   * <buses>
   *   <bus id="internal1">
   *     <nodeMember connectorId="connector0"/>
   *     <nodeMember connectorId="connector1"/>
   *   </bus>
   * </buses>
   * ```
   *
   * Returns an array of named bus definitions with their member connector IDs.
   * Returns empty array if no `<buses>` element exists (caller falls back to heuristics).
   */
  static parseBuses(module: Record<string, unknown>): Array<{ name: string; connectorIds: string[] }> {
    const mod = module as { buses?: { bus?: RawBus | RawBus[] } };
    if (!mod.buses?.bus) return [];

    const rawBuses = Array.isArray(mod.buses.bus) ? mod.buses.bus : [mod.buses.bus];
    const result: Array<{ name: string; connectorIds: string[] }> = [];

    for (const bus of rawBuses) {
      if (!bus || typeof bus !== 'object') continue;

      const name = bus._attributes?.id || 'unnamed';
      const members = bus.nodeMember;
      if (!members) continue;

      const memberArray = Array.isArray(members) ? members : [members];
      const connectorIds: string[] = [];

      for (const member of memberArray) {
        const cid = member._attributes?.connectorId;
        if (cid) connectorIds.push(cid);
      }

      if (connectorIds.length > 0) {
        result.push({ name, connectorIds });
      }
    }

    return result;
  }

  // ── Connector Metadata Extraction ───────────────────────────────────────────

  /**
   * Extract rich ConnectorMeta[] from the FZP XML, including per-view SVG
   * targets with terminal sub-element IDs.
   *
   * FZP connector structure:
   * ```xml
   * <connector id="connector0" name="GND" type="male">
   *   <views>
   *     <breadboardView>
   *       <p layer="breadboard" svgId="connector0pin" terminalId="connector0terminal"/>
   *     </breadboardView>
   *     <schematicView>
   *       <p layer="schematic" svgId="connector0pin" terminalId="connector0terminal"/>
   *     </schematicView>
   *     <pcbView>
   *       <p layer="copper0" svgId="connector0pad"/>
   *     </pcbView>
   *   </views>
   * </connector>
   * ```
   */
  private static extractConnectorMeta(module: Record<string, unknown>): ConnectorMeta[] {
    const normalizedModule = module as { connectors?: { connector?: unknown } };
    const connectors = normalizedModule.connectors?.connector;
    if (!connectors) return [];

    const connectorArray = Array.isArray(connectors) ? connectors : [connectors];
    const result: ConnectorMeta[] = [];

    for (const raw of connectorArray) {
      if (!raw || typeof raw !== 'object') continue;
      const c = raw as RawConnector;

      const id = c._attributes?.id;
      if (!id) continue;

      const name = c._attributes?.name || id;
      const rawType = c._attributes?.type?.toLowerCase();
      const type: ConnectorMeta['type'] =
        rawType === 'male' ? 'male'
        : rawType === 'female' ? 'female'
        : rawType === 'pad' ? 'pad'
        : 'unknown';

      const views: ConnectorMeta['views'] = {};
      let terminalId: string | undefined;

      // Extract view targets
      const viewMappings: Array<{
        viewKey: 'breadboardView' | 'schematicView' | 'pcbView';
        targetKey: 'breadboard' | 'schematic' | 'pcb';
      }> = [
        { viewKey: 'breadboardView', targetKey: 'breadboard' },
        { viewKey: 'schematicView', targetKey: 'schematic' },
        { viewKey: 'pcbView', targetKey: 'pcb' },
      ];

      for (const { viewKey, targetKey } of viewMappings) {
        const viewData = c.views?.[viewKey];
        if (!viewData?.p) continue;

        // A view can have multiple <p> elements (multiple layers).
        // We take the first one that has an svgId as the primary target.
        const pArray = Array.isArray(viewData.p) ? viewData.p : [viewData.p];
        const primaryP = pArray.find((p) => p._attributes?.svgId) || pArray[0];
        if (!primaryP?._attributes) continue;

        const target: ConnectorViewTarget = {
          svgId: primaryP._attributes.svgId || '',
          layer: primaryP._attributes.layer,
          terminalId: primaryP._attributes.terminalId,
        };

        // If this <p> has a terminalId, derive the terminal SVG element id
        if (target.terminalId) {
          target.terminalSvgId = target.terminalId;
          // Record the first terminalId encountered as the connector-level terminalId
          if (!terminalId) {
            terminalId = target.terminalId;
          }
        }

        views[targetKey] = target;
      }

      result.push({
        id,
        name,
        type,
        views,
        terminalId,
      });
    }

    return result;
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  private static validatePartMetadata(
    partName: string,
    connectorNames: string[],
    footprint: ComponentFootprint | undefined,
    connectorMeta: ConnectorMeta[],
    breadboardSvg?: string
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

    // NEW: Check for connectors with view <p> elements but missing terminalId
    for (const meta of connectorMeta) {
      const hasAnyView = meta.views.breadboard || meta.views.schematic || meta.views.pcb;
      if (hasAnyView && !meta.terminalId) {
        // Check if any of the view targets have a <p> but no terminalId
        const viewsWithoutTerminal: string[] = [];
        if (meta.views.breadboard?.svgId && !meta.views.breadboard.terminalId) {
          viewsWithoutTerminal.push('breadboard');
        }
        if (meta.views.schematic?.svgId && !meta.views.schematic.terminalId) {
          viewsWithoutTerminal.push('schematic');
        }
        if (meta.views.pcb?.svgId && !meta.views.pcb.terminalId) {
          viewsWithoutTerminal.push('pcb');
        }
        if (viewsWithoutTerminal.length > 0) {
          diagnostics.push({
            level: 'warning',
            code: 'MISSING_TERMINAL',
            message: `Connector "${meta.name}" (${meta.id}) has view target(s) in [${viewsWithoutTerminal.join(', ')}] but no terminalId for precise pin positioning.`,
          });
        }
      }
    }

    // NEW: Check for connectors that exist but have no <p> elements in any view
    for (const meta of connectorMeta) {
      const hasNoViews = !meta.views.breadboard && !meta.views.schematic && !meta.views.pcb;
      if (hasNoViews) {
        diagnostics.push({
          level: 'warning',
          code: 'MISSING_VIEW_TARGET',
          message: `Connector "${meta.name}" (${meta.id}) exists in FZP but has no <p> elements in any view.`,
        });
      }
    }

    // NEW: SVG viewBox vs explicit dimensions mismatch check
    if (breadboardSvg) {
      this.validateSvgViewBoxConsistency(partName, breadboardSvg, diagnostics);
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

  /**
   * Check whether the SVG's explicit width/height and its viewBox dimensions
   * imply incompatible aspect ratios. This catches parts where the SVG was
   * edited in a tool that set width/height independently from the viewBox.
   */
  private static validateSvgViewBoxConsistency(
    partName: string,
    svgContent: string,
    diagnostics: FzpzDiagnostic[]
  ): void {
    const parser = new DOMParser(); // eslint-disable-line no-undef
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return;

    const wAttr = svgEl.getAttribute('width');
    const hAttr = svgEl.getAttribute('height');
    const viewBoxAttr = svgEl.getAttribute('viewBox');

    // Only check when both explicit dimensions AND viewBox exist
    if (!wAttr || !hAttr || !viewBoxAttr) return;

    const parsedW = parseSvgDimension(wAttr);
    const parsedH = parseSvgDimension(hAttr);

    // Can't compare if we couldn't parse the dimensions
    if (parsedW.value === 0 || parsedH.value === 0) return;

    const vbParts = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
    if (vbParts.length < 4 || vbParts.some(isNaN)) return;

    const vbW = vbParts[2];
    const vbH = vbParts[3];
    if (vbW === 0 || vbH === 0) return;

    const explicitAspect = parsedW.value / parsedH.value;
    const viewBoxAspect = vbW / vbH;

    // Allow 10% tolerance for floating-point / rounding differences
    const ratio = explicitAspect / viewBoxAspect;
    if (ratio < 0.9 || ratio > 1.1) {
      diagnostics.push({
        level: 'warning',
        code: 'SVG_VIEWBOX_MISMATCH',
        message: `Part "${partName}" breadboard SVG has mismatched aspect ratios: explicit ${wAttr}x${hAttr} vs viewBox ${viewBoxAttr}.`,
      });
    }
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

    // Parse SVG dimensions using unitNormalization
    let width = 10;
    let height = 10;

    const parser = new DOMParser(); // eslint-disable-line no-undef
    const doc = parser.parseFromString(breadboardSvg, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');

    if (svgEl) {
      const wAttr = svgEl.getAttribute('width');
      const hAttr = svgEl.getAttribute('height');
      const viewBox = svgEl.getAttribute('viewBox');

      // Use parseSvgDimension for structured unit parsing, then convert to grid units
      const parsedW = parseSvgDimension(wAttr || '');
      const parsedH = parseSvgDimension(hAttr || '');

      if (parsedW.value > 0) {
        width = toGridUnits(parsedW.value, parsedW.unit);
      }
      if (parsedH.value > 0) {
        height = toGridUnits(parsedH.value, parsedH.unit);
      }

      // Fallback to viewBox if width/height missing or zero
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
