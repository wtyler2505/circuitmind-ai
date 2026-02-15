/**
 * Part Lifecycle Payload Schemas
 *
 * Since zod is not a project dependency, we use plain TypeScript interfaces
 * with manual validation functions that return { valid, error? }.
 */

// =====================================
// Payload Interfaces
// =====================================

export interface ImportPartPayload {
  url?: string;
  fzpzData?: string; // base64 encoded
  name: string;
  targetCollection: 'local' | 'catalog';
}

export interface ValidatePartPayload {
  componentId: string;
  checkConnectors: boolean;
  checkFootprint: boolean;
  checkBuses: boolean;
}

export interface CreatePartFromTemplatePayload {
  templateType: 'resistor' | 'capacitor' | 'led' | 'ic' | 'connector' | 'custom';
  name: string;
  pinCount: number;
  specs?: Record<string, string>;
}

export interface EditPartMetadataPayload {
  componentId: string;
  updates: {
    name?: string;
    description?: string;
    specs?: Record<string, string>;
    footprint?: { width: number; height: number };
  };
}

export interface DeletePartFromCatalogPayload {
  componentId: string;
  deleteFromBackend: boolean;
}

export interface RepairPartDiagnosticsPayload {
  componentId: string;
  autoFix: boolean;
  issues?: string[];
}

// =====================================
// Validation Result
// =====================================

interface ValidationResult {
  valid: boolean;
  error?: string;
}

// =====================================
// Validators
// =====================================

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

function isOptionalString(val: unknown): val is string | undefined {
  return val === undefined || typeof val === 'string';
}

function isPositiveInt(val: unknown): val is number {
  return typeof val === 'number' && Number.isInteger(val) && val >= 1;
}

function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean';
}

function isOptionalRecord(val: unknown): val is Record<string, string> | undefined {
  if (val === undefined) return true;
  if (typeof val !== 'object' || val === null || Array.isArray(val)) return false;
  return Object.entries(val).every(
    ([k, v]) => typeof k === 'string' && typeof v === 'string'
  );
}

const TEMPLATE_TYPES = ['resistor', 'capacitor', 'led', 'ic', 'connector', 'custom'] as const;
const COLLECTION_TARGETS = ['local', 'catalog'] as const;

export function validateImportPartPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') return { valid: false, error: 'Payload must be an object' };
  const p = raw as Record<string, unknown>;

  if (!isNonEmptyString(p.name)) return { valid: false, error: 'name is required and must be a non-empty string' };
  if (!isOptionalString(p.url)) return { valid: false, error: 'url must be a string if provided' };
  if (p.url && !/^https?:\/\/.+/.test(p.url)) return { valid: false, error: 'url must be a valid HTTP(S) URL' };
  if (!isOptionalString(p.fzpzData)) return { valid: false, error: 'fzpzData must be a string if provided' };
  if (!p.url && !p.fzpzData) return { valid: false, error: 'Either url or fzpzData must be provided' };

  const target = p.targetCollection ?? 'local';
  if (!COLLECTION_TARGETS.includes(target as typeof COLLECTION_TARGETS[number])) {
    return { valid: false, error: `targetCollection must be one of: ${COLLECTION_TARGETS.join(', ')}` };
  }

  return { valid: true };
}

export function validateValidatePartPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') return { valid: false, error: 'Payload must be an object' };
  const p = raw as Record<string, unknown>;

  if (!isNonEmptyString(p.componentId)) return { valid: false, error: 'componentId is required' };
  // Defaults are applied in the handler, so booleans are optional here
  if (p.checkConnectors !== undefined && !isBoolean(p.checkConnectors)) return { valid: false, error: 'checkConnectors must be a boolean' };
  if (p.checkFootprint !== undefined && !isBoolean(p.checkFootprint)) return { valid: false, error: 'checkFootprint must be a boolean' };
  if (p.checkBuses !== undefined && !isBoolean(p.checkBuses)) return { valid: false, error: 'checkBuses must be a boolean' };

  return { valid: true };
}

export function validateCreatePartFromTemplatePayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') return { valid: false, error: 'Payload must be an object' };
  const p = raw as Record<string, unknown>;

  if (!isNonEmptyString(p.name)) return { valid: false, error: 'name is required and must be a non-empty string' };
  if (!TEMPLATE_TYPES.includes(p.templateType as typeof TEMPLATE_TYPES[number])) {
    return { valid: false, error: `templateType must be one of: ${TEMPLATE_TYPES.join(', ')}` };
  }
  if (!isPositiveInt(p.pinCount)) return { valid: false, error: 'pinCount must be a positive integer' };
  if (!isOptionalRecord(p.specs)) return { valid: false, error: 'specs must be a Record<string, string> if provided' };

  return { valid: true };
}

export function validateEditPartMetadataPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') return { valid: false, error: 'Payload must be an object' };
  const p = raw as Record<string, unknown>;

  if (!isNonEmptyString(p.componentId)) return { valid: false, error: 'componentId is required' };
  if (!p.updates || typeof p.updates !== 'object' || Array.isArray(p.updates)) {
    return { valid: false, error: 'updates must be an object' };
  }

  const updates = p.updates as Record<string, unknown>;
  if (updates.name !== undefined && !isNonEmptyString(updates.name)) return { valid: false, error: 'updates.name must be a non-empty string' };
  if (updates.description !== undefined && typeof updates.description !== 'string') return { valid: false, error: 'updates.description must be a string' };
  if (!isOptionalRecord(updates.specs)) return { valid: false, error: 'updates.specs must be a Record<string, string>' };

  if (updates.footprint !== undefined) {
    if (typeof updates.footprint !== 'object' || updates.footprint === null) return { valid: false, error: 'updates.footprint must be an object' };
    const fp = updates.footprint as Record<string, unknown>;
    if (typeof fp.width !== 'number' || typeof fp.height !== 'number') return { valid: false, error: 'updates.footprint must have numeric width and height' };
  }

  return { valid: true };
}

export function validateDeletePartFromCatalogPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') return { valid: false, error: 'Payload must be an object' };
  const p = raw as Record<string, unknown>;

  if (!isNonEmptyString(p.componentId)) return { valid: false, error: 'componentId is required' };
  // deleteFromBackend defaults to false in handler
  if (p.deleteFromBackend !== undefined && !isBoolean(p.deleteFromBackend)) return { valid: false, error: 'deleteFromBackend must be a boolean' };

  return { valid: true };
}

export function validateRepairPartDiagnosticsPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') return { valid: false, error: 'Payload must be an object' };
  const p = raw as Record<string, unknown>;

  if (!isNonEmptyString(p.componentId)) return { valid: false, error: 'componentId is required' };
  if (p.autoFix !== undefined && !isBoolean(p.autoFix)) return { valid: false, error: 'autoFix must be a boolean' };
  if (p.issues !== undefined) {
    if (!Array.isArray(p.issues) || !p.issues.every((i: unknown) => typeof i === 'string')) {
      return { valid: false, error: 'issues must be an array of strings' };
    }
  }

  return { valid: true };
}
