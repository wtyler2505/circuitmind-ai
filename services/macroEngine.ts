import { ActionIntent } from '../types';

export interface WorkflowStep {
  id: string;
  action: ActionIntent;
  description: string;
  delay?: number; // ms
}

export interface MacroWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  author: 'user' | 'ai' | 'system';
  created: number;
}

export type ExecutionProgress = (stepIndex: number, total: number) => void;

class MacroEngine {
  /**
   * Executes a sequence of actions with optional delays.
   */
  async execute(
    steps: WorkflowStep[], 
    executeAction: (action: ActionIntent) => Promise<any>,
    onProgress?: ExecutionProgress
  ): Promise<void> {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      if (onProgress) onProgress(i, steps.length);
      
      await executeAction(step.action);
      
      if (step.delay) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }
    }
  }
}

export const macroEngine = new MacroEngine();
