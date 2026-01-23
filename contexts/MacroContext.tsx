import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ActionIntent } from '../types';
import { MacroWorkflow, WorkflowStep, macroEngine } from '../services/macroEngine';

interface MacroContextType {
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  recordedSteps: WorkflowStep[];
  addRecordedStep: (action: ActionIntent) => void;
  clearRecordedSteps: () => void;
  savedMacros: MacroWorkflow[];
  saveMacro: (name: string) => void;
  runMacro: (macro: MacroWorkflow, executeAction: (action: ActionIntent) => Promise<any>) => Promise<void>;
}

const MacroContext = createContext<MacroContextType | undefined>(undefined);

export const MacroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<WorkflowStep[]>([]);
  const [savedMacros, setSavedMacros] = useState<MacroWorkflow[]>(() => {
    try {
      const saved = localStorage.getItem('cm_macros');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecordedStep = useCallback((action: ActionIntent) => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      action,
      description: action.label
    };
    setRecordedSteps(prev => [...prev, newStep]);
  }, []);

  const clearRecordedSteps = useCallback(() => setRecordedSteps([]), []);

  const saveMacro = useCallback((name: string) => {
    const newMacro: MacroWorkflow = {
      id: Date.now().toString(),
      name,
      steps: [...recordedSteps],
      author: 'user',
      created: Date.now()
    };
    const nextMacros = [...savedMacros, newMacro];
    setSavedMacros(nextMacros);
    localStorage.setItem('cm_macros', JSON.stringify(nextMacros));
    clearRecordedSteps();
    setIsRecording(false);
  }, [recordedSteps, savedMacros, clearRecordedSteps]);

  const runMacro = useCallback(async (macro: MacroWorkflow, executeAction: (action: ActionIntent) => Promise<any>) => {
    await macroEngine.execute(macro.steps, executeAction);
  }, []);

  return (
    <MacroContext.Provider value={{
      isRecording,
      setIsRecording,
      recordedSteps,
      addRecordedStep,
      clearRecordedSteps,
      savedMacros,
      saveMacro,
      runMacro
    }}>
      {children}
    </MacroContext.Provider>
  );
};

export const useMacros = () => {
  const context = useContext(MacroContext);
  if (context === undefined) {
    throw new Error('useMacros must be used within a MacroProvider');
  }
  return context;
};
