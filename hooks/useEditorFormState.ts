import { useState, useEffect } from 'react';
import type { ElectronicComponent } from '../types';

export interface EditorFormState {
  editedName: string;
  setEditedName: (name: string) => void;
  editedType: ElectronicComponent['type'];
  setEditedType: (type: ElectronicComponent['type']) => void;
  editedDescription: string;
  setEditedDescription: (desc: string) => void;
  editedPins: string;
  setEditedPins: (pins: string) => void;
  editedDatasheetUrl: string;
  setEditedDatasheetUrl: (url: string) => void;
  editedThreeDModelUrl: string;
  setEditedThreeDModelUrl: (url: string) => void;
  editedImageUrl: string;
  setEditedImageUrl: (url: string) => void;
  editedQuantity: number;
  setEditedQuantity: (qty: number) => void;
  editedPrecisionLevel: 'draft' | 'masterpiece';
  setEditedPrecisionLevel: (level: 'draft' | 'masterpiece') => void;
  hasChanges: boolean;
}

export function useEditorFormState(component: ElectronicComponent): EditorFormState {
  const [editedName, setEditedName] = useState(component.name);
  const [editedType, setEditedType] = useState<ElectronicComponent['type']>(component.type);
  const [editedDescription, setEditedDescription] = useState(component.description);
  const [editedPins, setEditedPins] = useState(component.pins?.join(', ') || '');
  const [editedDatasheetUrl, setEditedDatasheetUrl] = useState(component.datasheetUrl || '');
  const [editedThreeDModelUrl, setEditedThreeDModelUrl] = useState(component.threeDModelUrl || '');
  const [editedImageUrl, setEditedImageUrl] = useState(component.imageUrl || '');
  const [editedQuantity, setEditedQuantity] = useState(component.quantity || 1);
  const [editedPrecisionLevel, setEditedPrecisionLevel] = useState<'draft' | 'masterpiece'>(
    component.precisionLevel || 'draft'
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when component changes
  useEffect(() => {
    setEditedName(component.name);
    setEditedType(component.type);
    setEditedDescription(component.description);
    setEditedPins(component.pins?.join(', ') || '');
    setEditedDatasheetUrl(component.datasheetUrl || '');
    setEditedThreeDModelUrl(component.threeDModelUrl || '');
    setEditedImageUrl(component.imageUrl || '');
    setEditedQuantity(component.quantity || 1);
    setEditedPrecisionLevel(component.precisionLevel || 'draft');
  }, [component]);

  // Track changes for Save button state
  useEffect(() => {
    const pinsStr = component.pins?.join(', ') || '';
    const isDirty =
      editedName !== component.name ||
      editedType !== component.type ||
      editedDescription !== component.description ||
      editedPins !== pinsStr ||
      editedDatasheetUrl !== (component.datasheetUrl || '') ||
      editedThreeDModelUrl !== (component.threeDModelUrl || '') ||
      editedImageUrl !== (component.imageUrl || '') ||
      editedQuantity !== (component.quantity || 1) ||
      editedPrecisionLevel !== (component.precisionLevel || 'draft');

    setHasChanges(isDirty);
  }, [
    editedName,
    editedType,
    editedDescription,
    editedPins,
    editedDatasheetUrl,
    editedThreeDModelUrl,
    editedImageUrl,
    editedQuantity,
    editedPrecisionLevel,
    component,
  ]);

  return {
    editedName,
    setEditedName,
    editedType,
    setEditedType,
    editedDescription,
    setEditedDescription,
    editedPins,
    setEditedPins,
    editedDatasheetUrl,
    setEditedDatasheetUrl,
    editedThreeDModelUrl,
    setEditedThreeDModelUrl,
    editedImageUrl,
    setEditedImageUrl,
    editedQuantity,
    setEditedQuantity,
    editedPrecisionLevel,
    setEditedPrecisionLevel,
    hasChanges,
  };
}

export function buildSavePayload(
  component: ElectronicComponent,
  form: EditorFormState
): ElectronicComponent {
  const pinsArray = form.editedPins
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return {
    ...component,
    name: form.editedName,
    type: form.editedType,
    description: form.editedDescription,
    pins: pinsArray,
    datasheetUrl: form.editedDatasheetUrl,
    threeDModelUrl: form.editedThreeDModelUrl,
    imageUrl: form.editedImageUrl,
    quantity: form.editedQuantity,
    precisionLevel: form.editedPrecisionLevel,
  };
}
