import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { WiringDiagram, ElectronicComponent } from '../types';
import { useDiagram } from './DiagramContext';
import { useInventory } from './InventoryContext';
import { validateStep } from '../services/tutorialValidator';

export interface TutorialStep {
  id: string;
  title: string;
  instructions: string;
  mentorTip?: string;
  targetElementId?: string;
  // A function that takes current state and returns if step is done
  condition: (state: { diagram: WiringDiagram | null; inventory: ElectronicComponent[] }) => boolean;
}

export interface TutorialQuest {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  steps: TutorialStep[];
}

interface TutorialContextType {
  activeQuest: TutorialQuest | null;
  currentStepIndex: number;
  completedSteps: string[];
  startQuest: (quest: TutorialQuest) => void;
  nextStep: () => void;
  completeQuest: () => void;
  resetTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeQuest, setActiveQuest] = useState<TutorialQuest | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const { diagram } = useDiagram();
  const { inventory } = useInventory();

  const startQuest = useCallback((quest: TutorialQuest) => {
    setActiveQuest(quest);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
  }, []);

  const nextStep = useCallback(() => {
    if (activeQuest && currentStepIndex < activeQuest.steps.length - 1) {
      setCompletedSteps(prev => [...prev, activeQuest.steps[currentStepIndex].id]);
      setCurrentStepIndex(prev => prev + 1);
    } else if (activeQuest && currentStepIndex === activeQuest.steps.length - 1) {
      completeQuest();
    }
  }, [activeQuest, currentStepIndex]);

  const completeQuest = useCallback(() => {
    setActiveQuest(null);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
  }, []);

  const resetTutorial = useCallback(() => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
  }, []);

  // Auto-validation loop
  useEffect(() => {
    if (activeQuest) {
      const currentStep = activeQuest.steps[currentStepIndex];
      const isDone = validateStep(currentStep, diagram, inventory);
      
      if (isDone) {
        // Use a small delay for better UX
        const timer = setTimeout(() => {
          nextStep();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [activeQuest, currentStepIndex, diagram, inventory, nextStep]);

  return (
    <TutorialContext.Provider value={{
      activeQuest,
      currentStepIndex,
      completedSteps,
      startQuest,
      nextStep,
      completeQuest,
      resetTutorial
    }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
