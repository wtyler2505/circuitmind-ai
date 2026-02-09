import { useState, useEffect, useRef, useCallback } from 'react';
import type { ElectronicComponent } from '../types';
import { useToast } from './useToast';
import { useEditorFormState, buildSavePayload } from './useEditorFormState';
import {
  generateComponentThumbnail,
  smartFillComponent,
  extractPinoutFromPDF,
} from '../services/geminiService';
import { datasheetProcessor } from '../services/datasheetProcessor';
import { resizeImage } from '../components/ComponentEditorModal';

type ComponentType = ElectronicComponent['type'];

interface UseEditorModalHandlersParams {
  component: ElectronicComponent;
  form: ReturnType<typeof useEditorFormState>;
  onSave: (component: ElectronicComponent) => void;
}

export function useEditorModalHandlers({
  component,
  form,
  onSave,
}: UseEditorModalHandlersParams) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const datasheetInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Local UI state
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | '3d' | 'image'>('info');
  const [imagePrompt, setImagePrompt] = useState('');
  const [threeDPrompt, setThreeDPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isExtractingDatasheet, setIsExtractingDatasheet] = useState(false);
  const [is3DCodeApproved, setIs3DCodeApproved] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [extractionLogs, setExtractionLogs] = useState<string[]>([]);

  // Effects
  useEffect(() => {
    setIs3DCodeApproved(false);
  }, [component.id, component.threeCode]);

  useEffect(() => {
    setImageLoadError(false);
    if (form.editedImageUrl) setIsImageLoading(true);
  }, [form.editedImageUrl]);

  useEffect(() => {
    if (!isExtractingDatasheet) {
      setExtractionLogs([]);
      return;
    }
    const logs = [
      'Initializing Neural Vision...',
      'Scanning Datasheet Structure...',
      'Identifying Pin Configuration Table...',
      'Extracting Electrical Characteristics...',
      'Validating Logic Levels...',
      'Normalizing Pin Labels...',
    ];
    const interval = setInterval(() => {
      setExtractionLogs((prev) => {
        const nextIndex = prev.length % logs.length;
        return [...prev.slice(-4), logs[nextIndex]];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isExtractingDatasheet]);

  // Handlers
  const handleGenerateThumbnail = useCallback(async () => {
    setIsGeneratingImage(true);
    try {
      const base64 = await generateComponentThumbnail(form.editedName, imagePrompt);
      form.setEditedImageUrl(`data:image/png;base64,${base64}`);
      setActiveTab('image');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [form.editedName, imagePrompt, form, toast]);

  const handleAiAssist = useCallback(async () => {
    if (!form.editedName) return;
    setIsAiThinking(true);
    try {
      const result = await smartFillComponent(form.editedName, form.editedType);
      if (result.description) form.setEditedDescription(result.description);
      if (result.pins) form.setEditedPins(result.pins.join(', '));
      if (result.type) form.setEditedType(result.type as ComponentType);
      if (result.datasheetUrl) form.setEditedDatasheetUrl(result.datasheetUrl);
    } catch (_e) {
      toast.warning('AI could not find details for this component.');
    } finally {
      setIsAiThinking(false);
    }
  }, [form, toast]);

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
            form.setEditedPins(metadata.pins.map((p) => p.name).join(', '));
          }
          const specSummary = `Logic: ${metadata.specs.logicLevel}. Voltage: ${metadata.specs.voltageMin}V - ${metadata.specs.voltageMax}V. ${metadata.specs.currentLimit ? `Max Current: ${metadata.specs.currentLimit}mA.` : ''}`;
          form.setEditedDescription(
            form.editedDescription ? `${form.editedDescription}\n\n${specSummary}` : specSummary
          );
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
    [form, toast]
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const resized = await resizeImage(base64);
        form.setEditedImageUrl(resized);
      };
      reader.readAsDataURL(file);
    },
    [form]
  );

  const handleSave = useCallback(() => {
    const updated = buildSavePayload(component, form);
    onSave(updated);
    setActiveTab('info');
  }, [component, form, onSave]);

  // Computed values
  const has3DCode = Boolean(component.threeCode);
  const has3DModel = Boolean(component.threeDModelUrl);
  const canRenderThreeCode = has3DCode && is3DCodeApproved;
  const codePreview = component.threeCode
    ? component.threeCode.split('\n').slice(0, 16).join('\n')
    : '';
  const isCodeTruncated = component.threeCode
    ? component.threeCode.split('\n').length > 16
    : false;

  return {
    // Refs
    fileInputRef,
    datasheetInputRef,
    // Tab
    activeTab,
    setActiveTab,
    // Prompts
    imagePrompt,
    setImagePrompt,
    threeDPrompt,
    setThreeDPrompt,
    // Loading states
    isGeneratingImage,
    isAiThinking,
    isExtractingDatasheet,
    extractionLogs,
    // 3D approval
    is3DCodeApproved,
    setIs3DCodeApproved,
    // Image loading
    imageLoadError,
    setImageLoadError,
    isImageLoading,
    setIsImageLoading,
    // Handlers
    handleGenerateThumbnail,
    handleAiAssist,
    handleDatasheetUpload,
    handleImageUpload,
    handleSave,
    // Computed
    has3DCode,
    has3DModel,
    canRenderThreeCode,
    codePreview,
    isCodeTruncated,
  };
}
