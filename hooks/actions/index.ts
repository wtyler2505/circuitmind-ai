import { ActionType } from '../../types';
import { ActionHandler } from './types';
import * as canvas from './canvasHandlers';
import * as nav from './navHandlers';
import * as diagram from './diagramHandlers';
import * as app from './appControlHandlers';

export * from './types';

/**
 * Registry mapping action types to their handlers
 */
export const actionHandlers: Partial<Record<ActionType, ActionHandler<unknown>>> = {
  // Canvas actions
  highlight: canvas.highlight,
  centerOn: canvas.centerOn,
  zoomTo: canvas.zoomTo,
  panTo: canvas.panTo,
  resetView: canvas.resetView,
  highlightWire: canvas.highlightWire,

  // Navigation actions
  openInventory: nav.openInventory,
  closeInventory: nav.closeInventory,
  openSettings: nav.openSettings,
  closeSettings: nav.closeSettings,
  openComponentEditor: nav.openComponentEditor,
  switchGenerationMode: nav.switchGenerationMode,

  // Diagram mutation actions
  addComponent: diagram.addComponent,
  removeComponent: diagram.removeComponent,
  clearCanvas: diagram.clearCanvas,
  createConnection: diagram.createConnection,
  removeConnection: diagram.removeConnection,
  
  // App Control (God Mode)
  undo: app.handleUndo,
  redo: app.handleRedo,
  saveDiagram: app.handleSaveDiagram,
  loadDiagram: app.handleLoadDiagram,
  setUserLevel: app.handleSetUserLevel,
  learnFact: app.handleLearnFact,
  analyzeVisuals: app.handleAnalyzeVisuals,
};

/**
 * Get handler for an action type
 */
export function getHandler(type: ActionType): ActionHandler<unknown> | undefined {
  return actionHandlers[type];
}
