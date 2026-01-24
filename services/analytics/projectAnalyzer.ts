import { WiringDiagram } from '../../types';
import { engineeringMetricsService } from '../aiMetricsService';

export interface ProjectScorecard {
  totalComponents: number;
  connectionDensity: number;
  aiAcceptanceRate: number;
  engineeringVelocity: number; // Events per hour
}

class ProjectAnalyzer {
  /**
   * Calculates a complexity and utility scorecard for a project.
   */
  analyze(diagram: WiringDiagram | null): ProjectScorecard {
    const events = engineeringMetricsService.getEvents();
    
    // 1. Connection Density
    const componentCount = diagram?.components.length || 0;
    const connectionCount = diagram?.connections.length || 0;
    const density = componentCount > 0 ? connectionCount / componentCount : 0;

    // 2. AI Acceptance Rate
    const accepts = events.filter(e => e.type === 'ai_suggestion_accept').length;
    const rejects = events.filter(e => e.type === 'ai_suggestion_reject').length;
    const totalAi = accepts + rejects;
    const aiRate = totalAi > 0 ? (accepts / totalAi) * 100 : 0;

    // 3. Engineering Velocity (Events per hour)
    let velocity = 0;
    if (events.length > 1) {
      const first = events[0].timestamp;
      const last = events[events.length - 1].timestamp;
      const hours = (last - first) / 3600000;
      velocity = hours > 0 ? events.length / hours : 0;
    }

    return {
      totalComponents: componentCount,
      connectionDensity: parseFloat(density.toFixed(2)),
      aiAcceptanceRate: Math.round(aiRate),
      engineeringVelocity: Math.round(velocity)
    };
  }
}

export const projectAnalyzer = new ProjectAnalyzer();
