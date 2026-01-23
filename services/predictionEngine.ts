import { AIContext, ActionIntent } from '../types';

/**
 * PredictiveAction represents a suggested design move that hasn't been executed yet.
 */
export interface PredictiveAction {
  id: string;
  action: ActionIntent;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  type: 'connectivity' | 'safety' | 'config';
}

class PredictionEngine {
  /**
   * Generates a list of suggested actions based on the current workspace context.
   */
  async predict(context: AIContext): Promise<PredictiveAction[]> {
    const suggestions: PredictiveAction[] = [];

    // 1. Simple heuristic: If a component is selected and has power pins, suggest connecting to rails
    if (context.selectedComponentId && context.selectedComponentName) {
      // GND Suggestion
      suggestions.push({
        id: `predict-gnd-${context.selectedComponentId}`,
        type: 'connectivity',
        action: {
          type: 'createConnection',
          payload: {
            fromComponentId: context.selectedComponentId,
            fromPin: 'GND',
            toComponentId: 'power-rail',
            toPin: 'GND'
          },
          label: `Connect ${context.selectedComponentName} GND`,
          safe: true
        },
        confidence: 0.9,
        reasoning: 'Standard grounding pattern for integrated circuits.'
      });

      // VCC Suggestion
      suggestions.push({
        id: `predict-vcc-${context.selectedComponentId}`,
        type: 'connectivity',
        action: {
          type: 'createConnection',
          payload: {
            fromComponentId: context.selectedComponentId,
            fromPin: 'VCC',
            toComponentId: 'power-rail',
            toPin: 'VCC'
          },
          label: `Power ${context.selectedComponentName}`,
          safe: true
        },
        confidence: 0.85,
        reasoning: 'Standard power rail connection.'
      });
    }

    // 2. Logic for missing safety components (e.g. decoupling caps)
    if (context.componentCount > 5 && !context.componentList?.some(c => c.toLowerCase().includes('capacitor'))) {
      suggestions.push({
        id: 'predict-safety-cap',
        type: 'safety',
        action: {
          type: 'addComponent',
          payload: {
            type: 'other',
            name: '0.1uF Capacitor',
            description: 'Decoupling capacitor for power stability'
          },
          label: 'Add decoupling capacitor',
          safe: true
        },
        confidence: 0.7,
        reasoning: 'Large circuits often benefit from power rail stabilization.'
      });
    }

    return suggestions;
  }
}

export const predictionEngine = new PredictionEngine();
