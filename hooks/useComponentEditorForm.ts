/**
 * useComponentEditorForm
 *
 * Encapsulates all form state, side-effects, and handlers for the
 * ComponentEditorModal. Extracted to reduce the modal component's LOC
 * and make the logic independently testable.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ElectronicComponent } from '../types';
import { useToast } from './useToast';
import {
  generateComponentThumbnail,
  smartFillComponent,
  assistComponentEditor,
  extractPinoutFromPDF,
} from '../services/geminiService';
import { datasheetProcessor } from '../services/datasheetProcessor';
import {
  isFormDirty,
  buildComponentFromFormState,
  resizeImage,
  getInitialFormFields,
} from '../services/componentFormValidation';

// ============================================
// Types
// ============================================

type ComponentType = ElectronicComponent['type'];

/** Chat message specific to the editor AI assistant sidebar */
export interface EditorChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: string[];
  actions?: ('GENERATE_IMAGE' | 'GENERATE_3D')[];
}

export interface UseComponentEditorFormOptions {
  component: ElectronicComponent;
  onSave: (component: ElectronicComponent) => void;
  onGenerate3D: (
    name: string,
    type: string,
    prompt?: string,
    imageUrl?: string,
    precision?: 'draft' | 'masterpiece'
  ) => void;
}

// ============================================
// Hook
// ============================================

export function useComponentEditorForm({
  component,
  onSave,
  onGenerate3D,
}: UseComponentEditorFormOptions) {
  // ------------------------------------------
  // Refs
  // ------------------------------------------
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const datasheetInputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------------
  // Toast
  // ------------------------------------------
  const toast = useToast();

  // ------------------------------------------
  // Tab State
  // ------------------------------------------
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | '3d' | 'image'>('info');

  // ------------------------------------------
  // Edit State (form fields)
  // ------------------------------------------
  const [editedName, setEditedName] = useState(component.name);
  const [editedType, setEditedType] = useState<ComponentType>(component.type);
  const [editedDescription, setEditedDescription] = useState(component.description);
  const [editedPins, setEditedPins] = useState(component.pins?.join(', ') || '');
  const [editedDatasheetUrl, setEditedDatasheetUrl] = useState(component.datasheetUrl || '');
  const [editedThreeDModelUrl, setEditedThreeDModelUrl] = useState(
    component.threeDModelUrl || ''
  );
  const [editedImageUrl, setEditedImageUrl] = useState(component.imageUrl || '');
  const [editedQuantity, setEditedQuantity] = useState(component.quantity || 1);
  const [editedPrecisionLevel, setEditedPrecisionLevel] = useState<'draft' | 'masterpiece'>(
    component.precisionLevel || 'draft'
  );

  // ------------------------------------------
  // Prompt State
  // ------------------------------------------
  const [imagePrompt, setImagePrompt] = useState('');
  const [threeDPrompt, setThreeDPrompt] = useState('');

  // ------------------------------------------
  // UI / Loading State
  // ------------------------------------------
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isExtractingDatasheet, setIsExtractingDatasheet] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [is3DCodeApproved, setIs3DCodeApproved] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // ------------------------------------------
  // AI Chat Assistant State
  // ------------------------------------------
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<EditorChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Hi! I can help you edit this component. I have access to search and can find datasheets or images for you. How can I help?',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [extractionLogs, setExtractionLogs] = useState<string[]>([]);

  // ------------------------------------------
  // Effects
  // ------------------------------------------

  /** Animate extraction log lines while extracting */
  useEffect(() => {
    if (isExtractingDatasheet) {
      const interval = setInterval(() => {
        const logs = [
          'Initializing Neural Vision...',
          'Scanning Datasheet Structure...',
          'Identifying Pin Configuration Table...',
          'Extracting Electrical Characteristics...',
          'Validating Logic Levels...',
          'Normalizing Pin Labels...',
        ];
        setExtractionLogs((prev) => {
          const nextIndex = prev.length % logs.length;
          return [...prev.slice(-4), logs[nextIndex]];
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setExtractionLogs([]);
    }
  }, [isExtractingDatasheet]);

  /** Sync form fields when the component prop changes */
  useEffect(() => {
    const fields = getInitialFormFields(component);
    setEditedName(fields.editedName);
    setEditedType(fields.editedType);
    setEditedDescription(fields.editedDescription);
    setEditedPins(fields.editedPins);
    setEditedDatasheetUrl(fields.editedDatasheetUrl);
    setEditedThreeDModelUrl(fields.editedThreeDModelUrl);
    setEditedImageUrl(fields.editedImageUrl);
    setEditedQuantity(fields.editedQuantity);
    setEditedPrecisionLevel(fields.editedPrecisionLevel);
  }, [component]);

  /** Reset 3D code approval when component identity or code changes */
  useEffect(() => {
    setIs3DCodeApproved(false);
  }, [component.id, component.threeCode]);

  /** Track whether the form is dirty (has unsaved changes) */
  useEffect(() => {
    const dirty = isFormDirty(
      {
        editedName,
        editedType,
        editedDescription,
        editedPins,
        editedDatasheetUrl,
        editedThreeDModelUrl,
        editedImageUrl,
        editedQuantity,
        editedPrecisionLevel,
      },
      component
    );
    setHasChanges(dirty);
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

  /** Scroll chat to bottom when messages change */
  useEffect(() => {
    if (showAiChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showAiChat]);

  /** Reset image error state when image URL changes */
  useEffect(() => {
    setImageLoadError(false);
    if (editedImageUrl) {
      setIsImageLoading(true);
    }
  }, [editedImageUrl]);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------

  const handleDatasheetUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsExtractingDatasheet(true);
      try {
        const base64 = await datasheetProcessor.fileToBase64(file);
        const metadata = await extractPinoutFromPDF(base64);

        if (metadata) {
          if (metadata.pins.length > 0) {
            const pinNames = metadata.pins.map((p) => p.name).join(', ');
            setEditedPins(pinNames);
          }

          const specSummary = `Logic: ${metadata.specs.logicLevel}. Voltage: ${metadata.specs.voltageMin}V - ${metadata.specs.voltageMax}V. ${metadata.specs.currentLimit ? `Max Current: ${metadata.specs.currentLimit}mA.` : ''}`;
          setEditedDescription((prev) => (prev ? `${prev}\n\n${specSummary}` : specSummary));

          toast.success(
            `Extracted ${metadata.pins.length} pins with ${Math.round(metadata.confidence * 100)}% confidence.`
          );
        } else {
          toast.error('Could not extract data from this datasheet.');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error processing PDF datasheet.');
      } finally {
        setIsExtractingDatasheet(false);
        if (datasheetInputRef.current) datasheetInputRef.current.value = '';
      }
    },
    [toast]
  );

  const handleSave = useCallback(() => {
    const updated = buildComponentFromFormState(component, {
      editedName,
      editedType,
      editedDescription,
      editedPins,
      editedDatasheetUrl,
      editedThreeDModelUrl,
      editedImageUrl,
      editedQuantity,
      editedPrecisionLevel,
    });
    onSave(updated);
    setHasChanges(false);
    setActiveTab('info');
  }, [
    component,
    editedName,
    editedType,
    editedDescription,
    editedPins,
    editedDatasheetUrl,
    editedThreeDModelUrl,
    editedImageUrl,
    editedQuantity,
    editedPrecisionLevel,
    onSave,
  ]);

  const handleGenerateThumbnail = useCallback(async () => {
    setIsGeneratingImage(true);
    try {
      const base64 = await generateComponentThumbnail(editedName, imagePrompt);
      setEditedImageUrl(`data:image/png;base64,${base64}`);
      setActiveTab('image');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [editedName, imagePrompt, toast]);

  const handleAiAssist = useCallback(async () => {
    if (!editedName) return;
    setIsAiThinking(true);
    try {
      const result = await smartFillComponent(editedName, editedType);
      if (result.description) setEditedDescription(result.description);
      if (result.pins) setEditedPins(result.pins.join(', '));
      if (result.type) setEditedType(result.type as ComponentType);
      if (result.datasheetUrl) setEditedDatasheetUrl(result.datasheetUrl);
    } catch (_e) {
      toast.warning('AI could not find details for this component.');
    } finally {
      setIsAiThinking(false);
    }
  }, [editedName, editedType, toast]);

  const handleSendChat = useCallback(
    async (overrideInput?: string) => {
      const userMsg = overrideInput || chatInput;
      if (!userMsg.trim()) return;

      setChatInput('');
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'user', text: userMsg },
      ]);
      setIsChatLoading(true);

      const currentData: Partial<ElectronicComponent> = {
        name: editedName,
        type: editedType,
        description: editedDescription,
        pins: editedPins
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p),
        datasheetUrl: editedDatasheetUrl,
        threeDModelUrl: editedThreeDModelUrl,
        imageUrl: editedImageUrl,
        quantity: editedQuantity,
      };

      const apiHistory = chatMessages.map((m) => ({ role: m.role, text: m.text }));

      try {
        const { updates, reply, foundImages, suggestedActions } =
          await assistComponentEditor(apiHistory, currentData, userMsg);

        if (updates.name) setEditedName(updates.name);
        if (updates.type) setEditedType(updates.type as ComponentType);
        if (updates.description) setEditedDescription(updates.description);
        if (updates.pins) setEditedPins(updates.pins.join(', '));
        if (updates.datasheetUrl) setEditedDatasheetUrl(updates.datasheetUrl);
        if (updates.threeDModelUrl) setEditedThreeDModelUrl(updates.threeDModelUrl);
        if (updates.imageUrl) setEditedImageUrl(updates.imageUrl);
        if (updates.quantity !== undefined) setEditedQuantity(updates.quantity);

        const validActions = suggestedActions.filter(
          (a): a is 'GENERATE_IMAGE' | 'GENERATE_3D' =>
            a === 'GENERATE_IMAGE' || a === 'GENERATE_3D'
        );

        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: reply,
            images: foundImages,
            actions: validActions.length > 0 ? validActions : undefined,
          },
        ]);
      } catch (e) {
        console.error(e);
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'model',
            text: 'Sorry, I had trouble searching for that information. Please try again.',
          },
        ]);
      } finally {
        setIsChatLoading(false);
      }
    },
    [
      chatInput,
      chatMessages,
      editedName,
      editedType,
      editedDescription,
      editedPins,
      editedDatasheetUrl,
      editedThreeDModelUrl,
      editedImageUrl,
      editedQuantity,
    ]
  );

  const handleAction = useCallback(
    async (action: string) => {
      if (action === 'GENERATE_IMAGE') {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            text: 'Generate an image for this component.',
          },
        ]);
        handleGenerateThumbnail();
      } else if (action === 'GENERATE_3D') {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            text: 'Generate a 3D model code for this.',
          },
        ]);
        onGenerate3D(editedName, editedType, threeDPrompt, editedImageUrl, editedPrecisionLevel);
        setActiveTab('3d');
      }
    },
    [
      handleGenerateThumbnail,
      onGenerate3D,
      editedName,
      editedType,
      threeDPrompt,
      editedImageUrl,
      editedPrecisionLevel,
    ]
  );

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const resized = await resizeImage(base64);
      setEditedImageUrl(resized);
    };
    reader.readAsDataURL(file);
  }, []);

  const selectFoundImage = useCallback((url: string) => {
    setEditedImageUrl(url);
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text: 'Use this image.' },
    ]);
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'model', text: 'Updated component image.' },
    ]);
  }, []);

  // ------------------------------------------
  // Derived Values
  // ------------------------------------------
  const has3DCode = Boolean(component.threeCode);
  const has3DModel = Boolean(component.threeDModelUrl);
  const canRenderThreeCode = has3DCode && is3DCodeApproved;
  const codePreview = component.threeCode
    ? component.threeCode.split('\n').slice(0, 16).join('\n')
    : '';
  const isCodeTruncated = component.threeCode
    ? component.threeCode.split('\n').length > 16
    : false;

  // ------------------------------------------
  // Return
  // ------------------------------------------
  return {
    // Refs
    fileInputRef,
    chatEndRef,
    datasheetInputRef,

    // Tab
    activeTab,
    setActiveTab,

    // Form fields
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

    // Prompts
    imagePrompt,
    setImagePrompt,
    threeDPrompt,
    setThreeDPrompt,

    // UI / loading state
    isGeneratingImage,
    isAiThinking,
    isExtractingDatasheet,
    hasChanges,
    is3DCodeApproved,
    setIs3DCodeApproved,
    imageLoadError,
    setImageLoadError,
    isImageLoading,
    setIsImageLoading,

    // Chat state
    showAiChat,
    setShowAiChat,
    chatInput,
    setChatInput,
    chatMessages,
    isChatLoading,
    extractionLogs,

    // Handlers
    handleDatasheetUpload,
    handleSave,
    handleGenerateThumbnail,
    handleAiAssist,
    handleSendChat,
    handleAction,
    handleImageUpload,
    selectFoundImage,

    // Derived
    has3DCode,
    has3DModel,
    canRenderThreeCode,
    codePreview,
    isCodeTruncated,
  };
}
