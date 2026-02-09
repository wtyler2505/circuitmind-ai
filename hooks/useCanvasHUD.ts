import { useCallback, useRef } from 'react';
import type { ElectronicComponent } from '../types';
import { useHUD } from '../contexts/HUDContext';
import { useSelection } from '../contexts/SelectionContext';

export function useCanvasHUD(containerRef: React.RefObject<HTMLDivElement | null>) {
  const { addFragment, removeFragment } = useHUD();
  const { setActiveSelectionPath } = useSelection();
  const activeFragments = useRef<Map<string, string>>(new Map());

  const handleComponentEnter = useCallback((e: React.MouseEvent, component: ElectronicComponent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = addFragment({
      targetId: component.id,
      type: 'info',
      content: `${component.name}: ${component.description || 'Electronic Component'}`,
      position: { x: e.clientX - rect.left + 20, y: e.clientY - rect.top - 20 },
      priority: 1,
    });
    activeFragments.current.set(component.id, id);
  }, [addFragment, containerRef]);

  const handleComponentLeave = useCallback((_e: React.MouseEvent, component: ElectronicComponent) => {
    setActiveSelectionPath(undefined);
    const id = activeFragments.current.get(component.id);
    if (id) {
      removeFragment(id);
      activeFragments.current.delete(component.id);
    }
  }, [removeFragment, setActiveSelectionPath]);

  const handlePinEnter = useCallback((e: React.MouseEvent, componentId: string, pin: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setActiveSelectionPath(`${componentId}.pins.${pin}`);
    const id = addFragment({
      targetId: `${componentId}-${pin}`,
      type: 'tip',
      content: `PIN ${pin}: Interface line. Hover for specs.`,
      position: { x: e.clientX - rect.left + 20, y: e.clientY - rect.top - 20 },
      priority: 2,
    });
    activeFragments.current.set(`${componentId}-${pin}`, id);
  }, [addFragment, setActiveSelectionPath, containerRef]);

  const handlePinLeave = useCallback((_e: React.MouseEvent, componentId: string, pin: string) => {
    setActiveSelectionPath(undefined);
    const id = activeFragments.current.get(`${componentId}-${pin}`);
    if (id) {
      removeFragment(id);
      activeFragments.current.delete(`${componentId}-${pin}`);
    }
  }, [removeFragment, setActiveSelectionPath]);

  return {
    handleComponentEnter,
    handleComponentLeave,
    handlePinEnter,
    handlePinLeave,
  };
}
