import { useState, useCallback } from 'react';
import { Tutorial, TutorialStep } from '../types';
import { GUIDED_TUTORIALS } from '../data/guidedTutorials';

export interface UseTutorialReturn {
  activeTutorial: Tutorial | null;
  currentStep: TutorialStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isActive: boolean;
  startTutorial: (tutorialId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

export function useTutorialOverlay(): UseTutorialReturn {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const totalSteps = activeTutorial?.steps.length ?? 0;
  const currentStep = activeTutorial?.steps[currentStepIndex] ?? null;
  const isActive = activeTutorial !== null;

  const resetState = useCallback(() => {
    setActiveTutorial(null);
    setCurrentStepIndex(0);
  }, []);

  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = GUIDED_TUTORIALS.find((t) => t.id === tutorialId);
    if (!tutorial) {
      console.warn(`[useTutorial] Tutorial not found: ${tutorialId}`);
      return;
    }
    setActiveTutorial(tutorial);
    setCurrentStepIndex(0);
  }, []);

  const completeTutorial = useCallback(() => {
    resetState();
  }, [resetState]);

  const nextStep = useCallback(() => {
    if (!activeTutorial) return;

    if (currentStepIndex >= activeTutorial.steps.length - 1) {
      // Last step -- auto-complete
      completeTutorial();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [activeTutorial, currentStepIndex, completeTutorial]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTutorial = useCallback(() => {
    resetState();
  }, [resetState]);

  return {
    activeTutorial,
    currentStep,
    currentStepIndex,
    totalSteps,
    isActive,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
  };
}
