import { useState, useRef, useEffect, useCallback } from 'react';
import type { ElectronicComponent } from '../types';
import { assistComponentEditor } from '../services/geminiService';

type ComponentType = ElectronicComponent['type'];

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: string[];
  actions?: ('GENERATE_IMAGE' | 'GENERATE_3D')[];
}

interface EditorFormValues {
  editedName: string;
  editedType: ComponentType;
  editedDescription: string;
  editedPins: string;
  editedDatasheetUrl: string;
  editedThreeDModelUrl: string;
  editedImageUrl: string;
  editedQuantity: number;
}

interface FormSetters {
  setEditedName: (val: string) => void;
  setEditedType: (val: ComponentType) => void;
  setEditedDescription: (val: string) => void;
  setEditedPins: (val: string) => void;
  setEditedDatasheetUrl: (val: string) => void;
  setEditedThreeDModelUrl: (val: string) => void;
  setEditedImageUrl: (val: string) => void;
  setEditedQuantity: (val: number) => void;
}

export interface UseEditorAIChatReturn {
  showAiChat: boolean;
  setShowAiChat: (show: boolean) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  handleSendChat: (overrideInput?: string) => Promise<void>;
  selectFoundImage: (url: string) => void;
  handleAction: (action: string) => Promise<void>;
}

export function useEditorAIChat(
  formValues: EditorFormValues,
  formSetters: FormSetters,
  onGenerateThumbnail: () => void,
  onGenerate3D: (name: string, type: string, prompt?: string, imageUrl?: string, precision?: 'draft' | 'masterpiece') => void,
  editedPrecisionLevel: 'draft' | 'masterpiece',
  threeDPrompt: string,
  setActiveTab: (tab: 'info' | 'edit' | '3d' | 'image') => void
): UseEditorAIChatReturn {
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Hi! I can help you edit this component. I have access to search and can find datasheets or images for you. How can I help?',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    if (showAiChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showAiChat]);

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
        name: formValues.editedName,
        type: formValues.editedType,
        description: formValues.editedDescription,
        pins: formValues.editedPins
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p),
        datasheetUrl: formValues.editedDatasheetUrl,
        threeDModelUrl: formValues.editedThreeDModelUrl,
        imageUrl: formValues.editedImageUrl,
        quantity: formValues.editedQuantity,
      };

      const apiHistory = chatMessages.map((m) => ({ role: m.role, text: m.text }));

      try {
        const { updates, reply, foundImages, suggestedActions } =
          await assistComponentEditor(apiHistory, currentData, userMsg);

        applyUpdates(updates, formSetters);

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
    [chatInput, chatMessages, formValues, formSetters]
  );

  const selectFoundImage = useCallback(
    (url: string) => {
      formSetters.setEditedImageUrl(url);
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'user', text: 'Use this image.' },
      ]);
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: 'Updated component image.' },
      ]);
    },
    [formSetters]
  );

  const handleAction = useCallback(
    async (action: string) => {
      if (action === 'GENERATE_IMAGE') {
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'user', text: 'Generate an image for this component.' },
        ]);
        onGenerateThumbnail();
      } else if (action === 'GENERATE_3D') {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            text: 'Generate a 3D model code for this.',
          },
        ]);
        onGenerate3D(
          formValues.editedName,
          formValues.editedType,
          threeDPrompt,
          formValues.editedImageUrl,
          editedPrecisionLevel
        );
        setActiveTab('3d');
      }
    },
    [formValues, onGenerateThumbnail, onGenerate3D, threeDPrompt, editedPrecisionLevel, setActiveTab]
  );

  return {
    showAiChat,
    setShowAiChat,
    chatInput,
    setChatInput,
    chatMessages,
    isChatLoading,
    chatEndRef,
    handleSendChat,
    selectFoundImage,
    handleAction,
  };
}

function applyUpdates(
  updates: Partial<ElectronicComponent>,
  setters: FormSetters
): void {
  if (updates.name) setters.setEditedName(updates.name);
  if (updates.type) setters.setEditedType(updates.type as ComponentType);
  if (updates.description) setters.setEditedDescription(updates.description);
  if (updates.pins) setters.setEditedPins(updates.pins.join(', '));
  if (updates.datasheetUrl) setters.setEditedDatasheetUrl(updates.datasheetUrl);
  if (updates.threeDModelUrl) setters.setEditedThreeDModelUrl(updates.threeDModelUrl);
  if (updates.imageUrl) setters.setEditedImageUrl(updates.imageUrl);
  if (updates.quantity !== undefined) setters.setEditedQuantity(updates.quantity);
}
