/**
 * Component Form Validation Service
 *
 * Pure functions for validating and transforming component editor form data.
 * Extracted from ComponentEditorModal to enable reuse and testing.
 */

import type { ElectronicComponent } from '../types';

// ============================================
// Types
// ============================================

/** Shape of the editable form fields in the component editor */
export interface ComponentFormFields {
  editedName: string;
  editedType: ElectronicComponent['type'];
  editedDescription: string;
  editedPins: string;
  editedDatasheetUrl: string;
  editedThreeDModelUrl: string;
  editedImageUrl: string;
  editedQuantity: number;
  editedPrecisionLevel: 'draft' | 'masterpiece';
}

// ============================================
// Pin Parsing & Validation
// ============================================

/**
 * Parse a comma-separated pin string into a trimmed, non-empty array of pin names.
 *
 * @example
 * parsePinsString('VCC, GND, D1, D2') // => ['VCC', 'GND', 'D1', 'D2']
 * parsePinsString('  , ,  ') // => []
 */
export function parsePinsString(pinsStr: string): string[] {
  return pinsStr
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

// ============================================
// Dirty Check (Change Detection)
// ============================================

/**
 * Determine whether the form fields have diverged from the original component.
 * Used to enable/disable the Save button.
 */
export function isFormDirty(
  fields: ComponentFormFields,
  component: ElectronicComponent
): boolean {
  const pinsStr = component.pins?.join(', ') || '';

  return (
    fields.editedName !== component.name ||
    fields.editedType !== component.type ||
    fields.editedDescription !== component.description ||
    fields.editedPins !== pinsStr ||
    fields.editedDatasheetUrl !== (component.datasheetUrl || '') ||
    fields.editedThreeDModelUrl !== (component.threeDModelUrl || '') ||
    fields.editedImageUrl !== (component.imageUrl || '') ||
    fields.editedQuantity !== (component.quantity || 1) ||
    fields.editedPrecisionLevel !== (component.precisionLevel || 'draft')
  );
}

// ============================================
// Component Construction
// ============================================

/**
 * Build an updated ElectronicComponent by merging form field values
 * onto the original component. Pins are parsed from the comma-separated string.
 */
export function buildComponentFromFormState(
  component: ElectronicComponent,
  fields: ComponentFormFields
): ElectronicComponent {
  return {
    ...component,
    name: fields.editedName,
    type: fields.editedType,
    description: fields.editedDescription,
    pins: parsePinsString(fields.editedPins),
    datasheetUrl: fields.editedDatasheetUrl,
    threeDModelUrl: fields.editedThreeDModelUrl,
    imageUrl: fields.editedImageUrl,
    quantity: fields.editedQuantity,
    precisionLevel: fields.editedPrecisionLevel,
  };
}

// ============================================
// Image Utilities
// ============================================

/**
 * Resize a base64-encoded image to fit within maxWidth x maxHeight,
 * maintaining aspect ratio. Returns a JPEG data URL at 70% quality
 * with a white background fill.
 *
 * Falls back to the original string on error.
 */
export function resizeImage(
  base64Str: string,
  maxWidth = 800,
  maxHeight = 800
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
}

// ============================================
// Form Field Initialization
// ============================================

/**
 * Derive initial form field values from an ElectronicComponent.
 * Used when the component prop changes (e.g. switching to a different component).
 */
export function getInitialFormFields(component: ElectronicComponent): ComponentFormFields {
  return {
    editedName: component.name,
    editedType: component.type,
    editedDescription: component.description,
    editedPins: component.pins?.join(', ') || '',
    editedDatasheetUrl: component.datasheetUrl || '',
    editedThreeDModelUrl: component.threeDModelUrl || '',
    editedImageUrl: component.imageUrl || '',
    editedQuantity: component.quantity || 1,
    editedPrecisionLevel: component.precisionLevel || 'draft',
  };
}
