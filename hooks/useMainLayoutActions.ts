import { useCallback, useState } from 'react';
import { useDiagram } from '../contexts/DiagramContext';
import { useInventory } from '../contexts/InventoryContext';
import { useSelection } from '../contexts/SelectionContext';
import { useToastApi } from './useToast';
import { explainComponent, generateComponent3DCode } from '../services/gemini/features/components';
import type { DiagramCanvasRef } from '../components/DiagramCanvas';
import type { ElectronicComponent, WiringDiagram } from '../types';
import type { IndexedDocument } from '../services/search/searchIndexer';

interface UseMainLayoutActionsOptions {
  canvasRef: React.RefObject<DiagramCanvasRef | null>;
}

export const useMainLayoutActions = ({ canvasRef }: UseMainLayoutActionsOptions) => {
  const { inventory, setInventory, updateItem } = useInventory();
  const { diagram, updateDiagram } = useDiagram();
  const { setSelectedComponentId: setCanvasSelectionId } = useSelection();
  const toast = useToastApi();

  const [selectedComponent, setSelectedComponent] = useState<ElectronicComponent | null>(null);
  const [modalContent, setModalContent] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    componentId: string;
  } | null>(null);
  const [isGenerating3D, setIsGenerating3D] = useState(false);

  const handleOpenComponentInfo = useCallback(async (component: ElectronicComponent) => {
    setSelectedComponent(component);
    const explain = await explainComponent(component.name);
    setModalContent(explain);
    setContextMenu(null);
  }, []);

  const handleComponentSelect = useCallback(
    (componentId: string) => {
      setCanvasSelectionId(componentId);
      setContextMenu(null);
    },
    [setCanvasSelectionId]
  );

  const handleComponentContextMenu = useCallback(
    (componentId: string, x: number, y: number) => {
      setCanvasSelectionId(componentId);
      setContextMenu({ x, y, componentId });
    },
    [setCanvasSelectionId]
  );

  const handleCanvasBackgroundClick = useCallback(() => {
    setCanvasSelectionId(null);
    setContextMenu(null);
  }, [setCanvasSelectionId]);

  const handleSearchSelect = useCallback(
    (doc: IndexedDocument) => {
      if (doc.category === 'component' || doc.category === 'diagram') {
        const id =
          doc.category === 'component'
            ? (doc.reference as { id: string })?.id
            : (doc.reference as string);
        canvasRef.current?.highlightComponent(id, { color: '#00f3ff', duration: 3000, pulse: true });
        canvasRef.current?.centerOnComponent(id, 1.2);
        setCanvasSelectionId(id);
      }
    },
    [setCanvasSelectionId, canvasRef]
  );

  const handleChatComponentClick = useCallback(
    (componentId: string) => {
      canvasRef.current?.highlightComponent(componentId, {
        color: '#00f3ff',
        duration: 3000,
        pulse: true,
      });
      canvasRef.current?.centerOnComponent(componentId, 1.2);
      setCanvasSelectionId(componentId);
    },
    [setCanvasSelectionId, canvasRef]
  );

  const handleGenerate3D = useCallback(
    async (
      name?: string,
      type?: string,
      prompt?: string,
      imageUrl?: string,
      precision?: 'draft' | 'masterpiece'
    ) => {
      if (!selectedComponent && !name) return;

      const targetName = name || selectedComponent?.name || '';
      const targetType = type || selectedComponent?.type || 'other';
      const targetImage = imageUrl || selectedComponent?.imageUrl;
      const targetPrecision = precision || selectedComponent?.precisionLevel || 'draft';
      const isRegenerate = Boolean(selectedComponent?.threeCode);

      setIsGenerating3D(true);
      toast.info(isRegenerate ? 'Regenerating 3D Geometry...' : 'Synthesizing 3D Geometry...');

      try {
        const code = await generateComponent3DCode(
          targetName,
          targetType,
          prompt,
          true,
          targetImage,
          targetPrecision
        );

        const updated = {
          ...(selectedComponent || {}),
          name: targetName,
          type: targetType as ElectronicComponent['type'],
          threeCode: code,
          precisionLevel: targetPrecision,
        } as ElectronicComponent;

        setSelectedComponent(updated);
        updateItem(updated);

        if (diagram?.components.some((c) => c.id === updated.id)) {
          updateDiagram({
            ...diagram,
            components: diagram.components.map((c) => (c.id === updated.id ? updated : c)),
          });
        }

        toast.success(isRegenerate ? '3D Geometry Refined' : '3D Geometry Synthesized');
      } catch (error) {
        console.error('3D Generation Error:', error);
        toast.error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsGenerating3D(false);
      }
    },
    [selectedComponent, diagram, updateDiagram, updateItem, toast]
  );

  const handleComponentDrop = useCallback(
    (component: ElectronicComponent, x: number, y: number) => {
      if (!diagram) return;
      const newComponent = { ...component, id: `comp-${Date.now()}`, position: { x, y } };
      updateDiagram({
        ...diagram,
        components: [...diagram.components, newComponent],
      });
    },
    [diagram, updateDiagram]
  );

  const handleComponentDoubleClick = useCallback(
    (component: ElectronicComponent) => {
      handleOpenComponentInfo(component);
    },
    [handleOpenComponentInfo]
  );

  const handleContextMenuDuplicate = useCallback(
    (comp: ElectronicComponent) => {
      if (!diagram) return;
      const newComp = {
        ...comp,
        id: `${comp.sourceInventoryId || 'comp'}-${Date.now()}`,
        name: `${comp.name} (Copy)`,
      };
      updateDiagram({
        ...diagram,
        components: [...diagram.components, newComp],
      });
    },
    [diagram, updateDiagram]
  );

  const handleContextMenuDelete = useCallback(
    (componentId: string) => {
      if (!diagram) return;
      updateDiagram({
        ...diagram,
        components: diagram.components.filter((c) => c.id !== componentId),
        connections: diagram.connections.filter(
          (c) => c.fromComponentId !== componentId && c.toComponentId !== componentId
        ),
      });
    },
    [diagram, updateDiagram]
  );

  return {
    // State
    inventory,
    setInventory,
    diagram,
    updateDiagram,
    selectedComponent,
    setSelectedComponent,
    modalContent,
    contextMenu,
    setContextMenu,
    isGenerating3D,

    // Handlers
    handleOpenComponentInfo,
    handleComponentSelect,
    handleComponentContextMenu,
    handleCanvasBackgroundClick,
    handleSearchSelect,
    handleChatComponentClick,
    handleGenerate3D,
    handleComponentDrop,
    handleComponentDoubleClick,
    handleContextMenuDuplicate,
    handleContextMenuDelete,
  };
};
