import { WiringDiagram, ElectronicComponent } from '../types';
import { TutorialStep } from '../contexts/TutorialContext';

export const validateStep = (
  step: TutorialStep, 
  diagram: WiringDiagram | null, 
  inventory: ElectronicComponent[]
): boolean => {
  try {
    return step.condition({ diagram, inventory });
  } catch (e) {
    console.error('Tutorial validation error:', e);
    return false;
  }
};
