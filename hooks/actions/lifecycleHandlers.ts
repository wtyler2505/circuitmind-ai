import { ActionContext, HandlerResult } from './types';
import { ElectronicComponent } from '../../types';
import {
  ImportPartPayload,
  ValidatePartPayload,
  CreatePartFromTemplatePayload,
  EditPartMetadataPayload,
  DeletePartFromCatalogPayload,
  RepairPartDiagnosticsPayload,
  validateImportPartPayload,
  validateValidatePartPayload,
  validateCreatePartFromTemplatePayload,
  validateEditPartMetadataPayload,
  validateDeletePartFromCatalogPayload,
  validateRepairPartDiagnosticsPayload,
} from '../../services/lifecycleSchemas';

const generateId = () => `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Check if the backend API is reachable.
 * Returns true if the /api/health endpoint responds OK.
 */
async function isBackendReachable(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// =====================================
// importPart
// =====================================

export async function handleImportPart(
  payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  const validation = validateImportPartPayload(payload);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const p = payload as ImportPartPayload;
  const targetCollection = p.targetCollection ?? 'local';

  // If importing to backend catalog, check reachability
  if (targetCollection === 'catalog') {
    const reachable = await isBackendReachable();
    if (!reachable) {
      return {
        success: false,
        error: 'Backend catalog is not available. Operation stored for sync.',
      };
    }
  }

  // Build a minimal ElectronicComponent from the import data
  const newComponent: ElectronicComponent = {
    id: generateId(),
    name: p.name,
    type: 'other',
    description: `Imported part: ${p.name}`,
    pins: [],
  };

  // If FZPZ data is provided, store it as a reference
  if (p.fzpzData) {
    // Convert base64 to ArrayBuffer for fzpzSource
    try {
      const binaryStr = atob(p.fzpzData);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      newComponent.fzpzSource = bytes.buffer;
    } catch {
      return { success: false, error: 'Failed to decode FZPZ base64 data' };
    }
  }

  if (p.url) {
    newComponent.fzpzUrl = p.url;
  }

  // Add to local inventory
  context.setInventory((prev) => [...prev, newComponent]);

  return { success: true };
}

// =====================================
// validatePart
// =====================================

export async function handleValidatePart(
  payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  const validation = validateValidatePartPayload(payload);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const p = payload as ValidatePartPayload;
  const checkConnectors = p.checkConnectors ?? true;
  const checkFootprint = p.checkFootprint ?? true;
  const checkBuses = p.checkBuses ?? true;

  const component = context.inventory.find((c) => c.id === p.componentId);
  if (!component) {
    return { success: false, error: `Component ${p.componentId} not found in inventory` };
  }

  const diagnostics: { level: 'warning' | 'error'; code: string; message: string }[] = [];

  // Connector checks
  if (checkConnectors) {
    if (!component.connectorMeta || component.connectorMeta.length === 0) {
      diagnostics.push({
        level: 'warning',
        code: 'NO_CONNECTORS',
        message: 'Component has no connector metadata. Pin wiring may be inaccurate.',
      });
    } else {
      // Check for connectors missing view targets
      const missingViews = component.connectorMeta.filter(
        (c) => !c.views.breadboard && !c.views.schematic && !c.views.pcb
      );
      if (missingViews.length > 0) {
        diagnostics.push({
          level: 'warning',
          code: 'CONNECTORS_NO_VIEWS',
          message: `${missingViews.length} connector(s) have no view targets: ${missingViews.map((c) => c.name).join(', ')}`,
        });
      }
    }
  }

  // Footprint checks
  if (checkFootprint) {
    if (!component.footprint) {
      diagnostics.push({
        level: 'warning',
        code: 'NO_FOOTPRINT',
        message: 'Component has no footprint defined. Layout placement may be approximate.',
      });
    } else if (component.footprint.pins.length === 0) {
      diagnostics.push({
        level: 'error',
        code: 'FOOTPRINT_NO_PINS',
        message: 'Footprint is defined but has zero pin positions.',
      });
    }
  }

  // Bus checks
  if (checkBuses) {
    if (component.internalBuses && component.internalBuses.length > 0) {
      // Verify bus pins reference actual pins on the component
      const pinSet = new Set(component.pins || []);
      for (const bus of component.internalBuses) {
        const unknownPins = bus.filter((pin) => !pinSet.has(pin));
        if (unknownPins.length > 0) {
          diagnostics.push({
            level: 'error',
            code: 'BUS_UNKNOWN_PINS',
            message: `Bus references pins not in component pin list: ${unknownPins.join(', ')}`,
          });
        }
      }
    }
  }

  // Store diagnostics on the component
  if (diagnostics.length > 0) {
    context.setInventory((prev) =>
      prev.map((c) =>
        c.id === p.componentId ? { ...c, fzpzDiagnostics: diagnostics } : c
      )
    );
  }

  return { success: true };
}

// =====================================
// createPartFromTemplate
// =====================================

const TEMPLATE_PIN_DEFAULTS: Record<string, string[]> = {
  resistor: ['1', '2'],
  capacitor: ['1', '2'],
  led: ['Anode', 'Cathode'],
  ic: [], // Dynamically generated
  connector: [], // Dynamically generated
  custom: [],
};

const TEMPLATE_TYPE_MAP: Record<string, ElectronicComponent['type']> = {
  resistor: 'other',
  capacitor: 'other',
  led: 'actuator',
  ic: 'microcontroller',
  connector: 'other',
  custom: 'other',
};

export async function handleCreatePartFromTemplate(
  payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  const validation = validateCreatePartFromTemplatePayload(payload);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const p = payload as CreatePartFromTemplatePayload;

  // Generate pin labels
  let pins = TEMPLATE_PIN_DEFAULTS[p.templateType] || [];
  if (pins.length === 0 || p.pinCount > pins.length) {
    // Generate numbered pins for IC/connector/custom or when more pins needed
    pins = Array.from({ length: p.pinCount }, (_, i) => `Pin ${i + 1}`);
  } else {
    pins = pins.slice(0, p.pinCount);
  }

  const newComponent: ElectronicComponent = {
    id: generateId(),
    name: p.name,
    type: TEMPLATE_TYPE_MAP[p.templateType] || 'other',
    description: `${p.templateType.charAt(0).toUpperCase() + p.templateType.slice(1)} created from template`,
    pins,
  };

  // Apply specs if provided
  if (p.specs) {
    // Map common spec keys to electrical properties
    const electrical: ElectronicComponent['electrical'] = {};
    if (p.specs.resistance) electrical.resistance = parseFloat(p.specs.resistance);
    if (p.specs.forwardVoltage) electrical.forwardVoltage = parseFloat(p.specs.forwardVoltage);
    if (p.specs.maxCurrent) electrical.maxCurrent = parseFloat(p.specs.maxCurrent);
    if (p.specs.outputVoltage) electrical.outputVoltage = parseFloat(p.specs.outputVoltage);

    if (Object.keys(electrical).length > 0) {
      newComponent.electrical = electrical;
    }
  }

  context.setInventory((prev) => [...prev, newComponent]);

  return { success: true };
}

// =====================================
// editPartMetadata
// =====================================

export async function handleEditPartMetadata(
  payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  const validation = validateEditPartMetadataPayload(payload);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const p = payload as EditPartMetadataPayload;
  const component = context.inventory.find((c) => c.id === p.componentId);
  if (!component) {
    return { success: false, error: `Component ${p.componentId} not found in inventory` };
  }

  const patch: Partial<ElectronicComponent> = {};

  if (p.updates.name !== undefined) patch.name = p.updates.name;
  if (p.updates.description !== undefined) patch.description = p.updates.description;

  if (p.updates.footprint) {
    // Merge with existing footprint, preserving pin positions
    patch.footprint = {
      width: p.updates.footprint.width,
      height: p.updates.footprint.height,
      pins: component.footprint?.pins || [],
    };
  }

  // specs don't have a direct field on ElectronicComponent -- store as electrical hints
  if (p.updates.specs) {
    const electrical: ElectronicComponent['electrical'] = { ...component.electrical };
    if (p.updates.specs.resistance) electrical.resistance = parseFloat(p.updates.specs.resistance);
    if (p.updates.specs.forwardVoltage) electrical.forwardVoltage = parseFloat(p.updates.specs.forwardVoltage);
    if (p.updates.specs.maxCurrent) electrical.maxCurrent = parseFloat(p.updates.specs.maxCurrent);
    if (p.updates.specs.outputVoltage) electrical.outputVoltage = parseFloat(p.updates.specs.outputVoltage);
    patch.electrical = electrical;
  }

  context.setInventory((prev) =>
    prev.map((c) => (c.id === p.componentId ? { ...c, ...patch } : c))
  );

  return { success: true };
}

// =====================================
// deletePartFromCatalog
// =====================================

export async function handleDeletePartFromCatalog(
  payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  const validation = validateDeletePartFromCatalogPayload(payload);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const p = payload as DeletePartFromCatalogPayload;
  const deleteFromBackend = p.deleteFromBackend ?? false;

  const exists = context.inventory.some((c) => c.id === p.componentId);
  if (!exists) {
    return { success: false, error: `Component ${p.componentId} not found in inventory` };
  }

  // If deleting from backend catalog too, check reachability
  if (deleteFromBackend) {
    const reachable = await isBackendReachable();
    if (!reachable) {
      return {
        success: false,
        error: 'Backend catalog is not available. Operation stored for sync.',
      };
    }

    // Attempt backend deletion via the API
    try {
      const res = await fetch(`/api/catalog/${p.componentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ message: res.statusText }));
        // Non-fatal: still remove locally but warn about backend
        console.warn('Backend catalog deletion failed:', errBody.message);
      }
    } catch (err) {
      console.warn('Backend catalog deletion request failed:', err);
    }
  }

  // Remove from local inventory
  context.setInventory((prev) => prev.filter((c) => c.id !== p.componentId));

  return { success: true };
}

// =====================================
// repairPartDiagnostics
// =====================================

export async function handleRepairPartDiagnostics(
  payload: unknown,
  context: ActionContext
): Promise<HandlerResult> {
  const validation = validateRepairPartDiagnosticsPayload(payload);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const p = payload as RepairPartDiagnosticsPayload;
  const autoFix = p.autoFix ?? false;

  const component = context.inventory.find((c) => c.id === p.componentId);
  if (!component) {
    return { success: false, error: `Component ${p.componentId} not found in inventory` };
  }

  // Re-run validation to get current diagnostics
  const diagnostics: { level: 'warning' | 'error'; code: string; message: string }[] = [];
  const fixes: string[] = [];

  // Check connectors
  if (!component.connectorMeta || component.connectorMeta.length === 0) {
    diagnostics.push({
      level: 'warning',
      code: 'NO_CONNECTORS',
      message: 'Component has no connector metadata.',
    });
  }

  // Check footprint
  if (!component.footprint) {
    if (autoFix && component.pins && component.pins.length > 0) {
      // Auto-generate a simple linear footprint from pin list
      const pinPositions = component.pins.map((pin, i) => ({
        id: pin,
        x: i * 2.54, // 0.1" spacing
        y: 0,
      }));
      context.setInventory((prev) =>
        prev.map((c) =>
          c.id === p.componentId
            ? {
                ...c,
                footprint: {
                  width: Math.max(component.pins!.length * 2.54, 5),
                  height: 5,
                  pins: pinPositions,
                },
              }
            : c
        )
      );
      fixes.push('Auto-generated linear footprint from pin list');
    } else {
      diagnostics.push({
        level: 'warning',
        code: 'NO_FOOTPRINT',
        message: 'Component has no footprint defined.',
      });
    }
  }

  // Check bus integrity
  if (component.internalBuses && component.internalBuses.length > 0) {
    const pinSet = new Set(component.pins || []);
    for (let bIdx = 0; bIdx < component.internalBuses.length; bIdx++) {
      const bus = component.internalBuses[bIdx];
      const unknownPins = bus.filter((pin) => !pinSet.has(pin));
      if (unknownPins.length > 0) {
        if (autoFix) {
          // Remove unknown pins from the bus
          const fixedBuses = [...component.internalBuses];
          fixedBuses[bIdx] = bus.filter((pin) => pinSet.has(pin));
          context.setInventory((prev) =>
            prev.map((c) =>
              c.id === p.componentId ? { ...c, internalBuses: fixedBuses } : c
            )
          );
          fixes.push(`Removed unknown pins from bus ${bIdx}: ${unknownPins.join(', ')}`);
        } else {
          diagnostics.push({
            level: 'error',
            code: 'BUS_UNKNOWN_PINS',
            message: `Bus ${bIdx} references pins not in component: ${unknownPins.join(', ')}`,
          });
        }
      }
    }
  }

  // Filter to only target specific issues if the caller specified them
  const filteredDiagnostics = p.issues
    ? diagnostics.filter((d) => p.issues!.includes(d.code))
    : diagnostics;

  // Update diagnostics on component
  context.setInventory((prev) =>
    prev.map((c) =>
      c.id === p.componentId ? { ...c, fzpzDiagnostics: filteredDiagnostics } : c
    )
  );

  return { success: true };
}
