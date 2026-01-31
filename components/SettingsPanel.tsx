import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../hooks/useToast';
import { ActionType, ACTION_SAFETY, AIAutonomySettings } from '../types';
import { getStoredApiKey, setStoredApiKey } from '../services/apiKeyStorage';
import { datasetService } from '../services/datasetService';
import IconButton from './IconButton';
import { useLayout } from '../contexts/LayoutContext';
import { DeveloperPortal } from './settings/DeveloperPortal';
import { ConfigPortal } from './settings/ConfigPortal';
import { DiagnosticsView } from './settings/DiagnosticsView';
import { LocalizationSettings } from './settings/LocalizationSettings';
import { ProfileSettings } from './settings/ProfileSettings';
import { PartsManager } from './settings/PartsManager';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autonomySettings?: AIAutonomySettings;
  onAutonomySettingsChange?: (settings: AIAutonomySettings) => void;
  initialTab?: 'api' | 'profile' | 'parts' | 'ai' | 'layout' | 'dev' | 'config' | 'diagnostics' | 'locale';
}

// Human-readable labels for action types
const ACTION_LABELS: Record<ActionType, { label: string; description: string; category: string }> =
  {
    // Canvas actions
    highlight: { label: 'Highlight Component', description: 'Add visual glow to a component', category: 'Canvas' },
    centerOn: { label: 'Center View', description: 'Pan canvas to focus on component', category: 'Canvas' },
    zoomTo: { label: 'Zoom', description: 'Change zoom level', category: 'Canvas' },
    panTo: { label: 'Pan', description: 'Move view to coordinates', category: 'Canvas' },
    resetView: { label: 'Reset View', description: 'Reset pan and zoom to default', category: 'Canvas' },
    highlightWire: { label: 'Highlight Wire', description: 'Add visual glow to a connection', category: 'Canvas' },

    // Navigation actions
    openInventory: { label: 'Open Inventory', description: 'Show component library sidebar', category: 'Navigation' },
    closeInventory: { label: 'Close Inventory', description: 'Hide component library sidebar', category: 'Navigation' },
    openSettings: { label: 'Open Settings', description: 'Show settings panel', category: 'Navigation' },
    closeSettings: { label: 'Close Settings', description: 'Hide settings panel', category: 'Navigation' },
    openComponentEditor: { label: 'Open Editor', description: 'Open component detail editor', category: 'Navigation' },
    switchGenerationMode: { label: 'Switch Mode', description: 'Change AI generation mode', category: 'Navigation' },
    toggleSidebar: { label: 'Toggle Sidebar', description: 'Expand/Collapse sidebars', category: 'Navigation' },
    setTheme: { label: 'Set Theme', description: 'Change UI visual theme', category: 'Navigation' },

    // Project actions
    undo: { label: 'Undo', description: 'Revert last change', category: 'Project' },
    redo: { label: 'Redo', description: 'Reapply reverted change', category: 'Project' },
    saveDiagram: { label: 'Save Diagram', description: 'Save current state to local storage', category: 'Project' },
    loadDiagram: { label: 'Load Diagram', description: 'Load state from local storage', category: 'Project' },

    // Diagram modification actions
    addComponent: { label: 'Add Component', description: 'Insert new component into diagram', category: 'Diagram' },
    updateComponent: { label: 'Update Component', description: 'Modify component properties', category: 'Diagram' },
    removeComponent: { label: 'Remove Component', description: 'Delete component from diagram', category: 'Diagram' },
    clearCanvas: { label: 'Clear Canvas', description: 'Remove all components', category: 'Diagram' },
    createConnection: { label: 'Create Connection', description: 'Wire two components together', category: 'Diagram' },
    removeConnection: { label: 'Remove Connection', description: 'Delete wire from diagram', category: 'Diagram' },

    // Form actions
    fillField: { label: 'Fill Form Field', description: 'Auto-populate form input', category: 'Forms' },
    saveComponent: { label: 'Save Component', description: 'Save component changes', category: 'Forms' },
    
    // Profile actions (Background)
    setUserLevel: { label: 'Set Experience', description: 'Adjust AI teaching level', category: 'System' },
    learnFact: { label: 'Learn Fact', description: 'Save user preference/fact', category: 'System' },
    analyzeVisuals: { label: 'Analyze Visuals', description: 'Take canvas snapshot for AI', category: 'System' },
  };

const CATEGORIES = ['Canvas', 'Navigation', 'Project', 'Diagram', 'Forms', 'System'] as const;
const INVENTORY_WIDTH_RANGE = { min: 280, max: 520, default: 360 };
const ASSISTANT_WIDTH_RANGE = { min: 300, max: 560, default: 380 };

type LayoutSnapshot = {
  inventoryOpen: boolean;
  inventoryPinned: boolean;
  assistantOpen: boolean;
  assistantPinned: boolean;
  inventoryWidth: number;
  assistantWidth: number;
};

// Default autonomy settings
const getDefaultAutonomySettings = (): AIAutonomySettings => ({
  autoExecuteSafeActions: true,
  customSafeActions: [],
  customUnsafeActions: [],
});

// Determine if action is safe based on settings
const isActionSafe = (actionType: ActionType, settings: AIAutonomySettings): boolean => {
  if (settings.customSafeActions.includes(actionType)) return true;
  if (settings.customUnsafeActions.includes(actionType)) return false;
  return ACTION_SAFETY[actionType] ?? false;
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  autonomySettings,
  onAutonomySettingsChange,
  initialTab = 'api',
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'api' | 'profile' | 'parts' | 'ai' | 'layout' | 'dev' | 'config' | 'diagnostics' | 'locale'>(initialTab);
  const resetSnapshotRef = useRef<LayoutSnapshot | null>(null);
  const toast = useToast();
  
  const {
    isInventoryOpen, setInventoryOpen,
    inventoryPinned, setInventoryPinned,
    inventoryWidth, setInventoryWidth,
    isAssistantOpen, setAssistantOpen,
    assistantPinned, setAssistantPinned,
    assistantWidth, setAssistantWidth,
    inventoryDefaultWidth,
    assistantDefaultWidth,
    neuralLinkEnabled, setNeuralLinkEnabled
  } = useLayout();

  // Local autonomy settings state (if not controlled externally)
  const [localAutonomy, setLocalAutonomy] = useState<AIAutonomySettings>(
    getDefaultAutonomySettings
  );

  // Use external settings if provided, otherwise use local state
  const currentAutonomy = autonomySettings || localAutonomy;

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      const stored = getStoredApiKey();
      setApiKey(stored || '');
      setSaved(false);
      setTestStatus('idle');

      // Load stored autonomy settings if not controlled externally
      if (!autonomySettings) {
        try {
          const storedAutonomy = localStorage.getItem('cm_ai_autonomy');
          if (storedAutonomy) {
            setLocalAutonomy(JSON.parse(storedAutonomy));
          }
        } catch {
          // Ignore errors
        }
      }
    }
  }, [isOpen, autonomySettings, initialTab]);


  // Update autonomy settings
  const updateAutonomy = (updates: Partial<AIAutonomySettings>) => {
    const newSettings = { ...currentAutonomy, ...updates };
    if (onAutonomySettingsChange) {
      onAutonomySettingsChange(newSettings);
    } else {
      setLocalAutonomy(newSettings);
      try {
        localStorage.setItem('cm_ai_autonomy', JSON.stringify(newSettings));
      } catch {
        console.error('Failed to save autonomy settings');
      }
    }
  };

  const handleResetLayout = () => {
    resetSnapshotRef.current = {
      inventoryOpen: isInventoryOpen,
      inventoryPinned: inventoryPinned,
      assistantOpen: isAssistantOpen,
      assistantPinned: assistantPinned,
      inventoryWidth: inventoryWidth,
      assistantWidth: assistantWidth,
    };

    setInventoryOpen(false); // Default
    setInventoryPinned(false);
    setAssistantOpen(true);
    setAssistantPinned(true);
    setInventoryWidth(inventoryDefaultWidth);
    setAssistantWidth(assistantDefaultWidth);

    toast.info('Layout reset', 2000, {
      label: 'Undo',
      onClick: handleResetUndo,
    });
  };

  const handleResetUndo = () => {
    const snapshot = resetSnapshotRef.current;
    if (!snapshot) return;

    setInventoryOpen(snapshot.inventoryOpen);
    setInventoryPinned(snapshot.inventoryPinned);
    setAssistantOpen(snapshot.assistantOpen);
    setAssistantPinned(snapshot.assistantPinned);
    setInventoryWidth(snapshot.inventoryWidth);
    setAssistantWidth(snapshot.assistantWidth);
  };

  // Toggle action safety override
  const toggleActionSafe = (actionType: ActionType) => {
    const isSafe = isActionSafe(actionType, currentAutonomy);
    const defaultSafe = ACTION_SAFETY[actionType];

    if (isSafe) {
      // Currently safe, make it unsafe
      if (defaultSafe) {
        // Default is safe, add to customUnsafe
        updateAutonomy({
          customSafeActions: currentAutonomy.customSafeActions.filter((a) => a !== actionType),
          customUnsafeActions: [
            ...currentAutonomy.customUnsafeActions.filter((a) => a !== actionType),
            actionType,
          ],
        });
      } else {
        // Default is unsafe, remove from customSafe
        updateAutonomy({
          customSafeActions: currentAutonomy.customSafeActions.filter((a) => a !== actionType),
        });
      }
    } else {
      // Currently unsafe, make it safe
      if (defaultSafe) {
        // Default is safe, remove from customUnsafe
        updateAutonomy({
          customUnsafeActions: currentAutonomy.customUnsafeActions.filter((a) => a !== actionType),
        });
      } else {
        // Default is unsafe, add to customSafe
        updateAutonomy({
          customSafeActions: [
            ...currentAutonomy.customSafeActions.filter((a) => a !== actionType),
            actionType,
          ],
          customUnsafeActions: currentAutonomy.customUnsafeActions.filter((a) => a !== actionType),
        });
      }
    }
  };

  // Reset to defaults
  const resetAutonomyToDefaults = () => {
    updateAutonomy({
      autoExecuteSafeActions: true,
      customSafeActions: [],
      customUnsafeActions: [],
    });
  };

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setSaved(true);
    // Add small delay to ensure localStorage write completes before reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      return;
    }
    setTestStatus('testing');
    try {
      // Simple test: try to list models
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`
      );
      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch {
      setTestStatus('error');
    }
  };

  const handleClear = () => {
    setApiKey('');
    setStoredApiKey('');
    setSaved(false);
    setTestStatus('idle');
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-950 rounded-xl shadow-2xl w-full max-w-lg mx-4 border border-slate-800/80">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-neon-cyan"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-white uppercase tracking-[0.3em]">Settings</h2>
          </div>
          <IconButton icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>} label="Close settings" variant="ghost" onClick={onClose} />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${
              activeTab === 'api' 
                ? 'border-neon-cyan text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            API KEY
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${
              activeTab === 'profile' 
                ? 'border-neon-pink text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            PROFILE
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${
              activeTab === 'parts' 
                ? 'border-neon-cyan text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            PARTS
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${
              activeTab === 'ai' 
                ? 'border-neon-purple text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            AI AUTONOMY
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${
              activeTab === 'layout' 
                ? 'border-neon-amber text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            LAYOUT
          </button>
          <button
            onClick={() => setActiveTab('dev')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${
              activeTab === 'dev' 
                ? 'border-neon-green text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            DEVELOPER
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${
              activeTab === 'config' 
                ? 'border-neon-amber text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            CONFIG
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${
              activeTab === 'diagnostics' 
                ? 'border-red-500 text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            DIAGNOSTICS
          </button>
          <button
            onClick={() => setActiveTab('locale')}
            className={`flex-1 min-w-[80px] py-3 text-sm font-bold tracking-wider transition-colors border-b-2 ${
              activeTab === 'locale' 
                ? 'border-neon-cyan text-white bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            LOCALE
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pb-12 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-950/60">
          {/* API Key Tab */}
          {activeTab === 'api' && (
            <>
              {/* API Key Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">Gemini API Key</label>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                  >
                    {showKey ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-300">
                  Get your API key from{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              {/* Test Status */}
              {testStatus !== 'idle' && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                    testStatus === 'testing'
                      ? 'bg-blue-900/30 text-blue-300'
                      : testStatus === 'success'
                        ? 'bg-green-900/30 text-green-300'
                        : 'bg-red-900/30 text-red-300'
                  }`}
                >
                  {testStatus === 'testing' && (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Testing connection...
                    </>
                  )}
                  {testStatus === 'success' && (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      API key is valid!
                    </>
                  )}
                  {testStatus === 'error' && (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Invalid API key or connection error
                    </>
                  )}
                </div>
              )}

              {/* Saved notification */}
              {saved && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900/30 text-green-300 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Settings saved! Reloading...
                </div>
              )}

              {/* Info box */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-gray-300">
                    <p>
                      Your API key is stored locally in your browser and never sent to any server
                      except Google's Gemini API.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileSettings />
          )}

          {/* Parts Tab */}
          {activeTab === 'parts' && (
            <PartsManager />
          )}

          {/* AI Autonomy Tab */}
          {activeTab === 'ai' && (
            <>
              {/* Master Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Auto-Execute Safe Actions
                    </label>
                    <p className="text-xs text-gray-300 mt-1">
                      AI will automatically perform safe actions without asking
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateAutonomy({
                        autoExecuteSafeActions: !currentAutonomy.autoExecuteSafeActions,
                      })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      currentAutonomy.autoExecuteSafeActions ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        currentAutonomy.autoExecuteSafeActions ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Categories */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">Action Permissions</h3>
                  <button
                    onClick={resetAutonomyToDefaults}
                    className="text-xs text-gray-300 hover:text-gray-200 transition-colors"
                  >
                    Reset to defaults
                  </button>
                </div>

                {CATEGORIES.map((category) => {
                  const categoryActions = (Object.keys(ACTION_LABELS) as ActionType[]).filter(
                    (actionType) => ACTION_LABELS[actionType].category === category
                  );

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            category === 'Canvas' || category === 'Navigation'
                              ? 'text-green-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {category}
                        </span>
                        <span className="text-xs text-gray-300">
                          (
                          {category === 'Canvas' || category === 'Navigation'
                            ? 'safe by default'
                            : 'requires confirmation'}
                          )
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {categoryActions.map((actionType) => {
                          const { label, description } = ACTION_LABELS[actionType];
                          const isSafe = isActionSafe(actionType, currentAutonomy);
                          const isCustomized =
                            currentAutonomy.customSafeActions.includes(actionType) ||
                            currentAutonomy.customUnsafeActions.includes(actionType);

                          return (
                            <div
                              key={actionType}
                              className={`flex items-center justify-between p-2.5 gap-3 rounded-lg ${
                                isCustomized ? 'bg-gray-700/50' : 'bg-gray-800/30'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-gray-200">{label}</span>
                                  {isCustomized && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-500/20">
                                      custom
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{description}</p>
                              </div>
                              <button
                                onClick={() => toggleActionSafe(actionType)}
                                aria-label={`Toggle ${label} permission`}
                                className={`shrink-0 min-w-[60px] px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all border ${
                                  isSafe
                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30'
                                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
                                }`}
                              >
                                {isSafe ? 'Auto' : 'Ask'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info box */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>
                      <strong className="text-cyan-300">Auto</strong> = AI executes immediately
                      without asking
                    </p>
                    <p>
                      <strong className="text-amber-300">Ask</strong> = AI shows action button for
                      you to confirm
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Dataset Export */}
              <div className="flex justify-end pt-2 border-t border-gray-700/50">
                  <button
                    onClick={() => datasetService.downloadDataset()}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Export Training Data (JSONL)
                  </button>
              </div>
            </>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Sidebar Defaults</h3>
                <p className="text-xs text-slate-400">
                  Set how the sidebars behave on launch. Changes apply immediately.
                </p>
              </div>

              <div className="grid gap-4">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Inventory Sidebar</p>
                        <p className="text-xs text-slate-400">Component library on the left.</p>
                      </div>
                    </div>
                    <label className="flex items-center justify-between text-xs text-slate-300">
                      <span>Open on launch</span>
                      <input
                        type="checkbox"
                        checked={isInventoryOpen}
                        onChange={(event) => setInventoryOpen(event.target.checked)}
                        className="h-4 w-4"
                        style={{ accentColor: '#00f3ff' }}
                        aria-label="Inventory open on launch"
                      />
                    </label>
                    <label className="flex items-center justify-between text-xs text-slate-300">
                      <span>Pinned by default (disable auto-hide)</span>
                      <input
                        type="checkbox"
                        checked={inventoryPinned}
                        onChange={(event) => setInventoryPinned(event.target.checked)}
                        className="h-4 w-4"
                        style={{ accentColor: '#00f3ff' }}
                        aria-label="Inventory pinned by default"
                      />
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Width</span>
                        <span className="text-slate-400">{inventoryWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min={INVENTORY_WIDTH_RANGE.min}
                        max={INVENTORY_WIDTH_RANGE.max}
                        step={10}
                        value={inventoryWidth}
                        onChange={(event) => setInventoryWidth(Number(event.target.value))}
                        className="w-full accent-cyan-400"
                        aria-label="Inventory sidebar width"
                      />
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        <span>{INVENTORY_WIDTH_RANGE.min}px</span>
                        <button
                          type="button"
                          onClick={() => setInventoryWidth(INVENTORY_WIDTH_RANGE.default)}
                          className="text-slate-400 hover:text-neon-cyan transition-colors"
                        >
                          Reset
                        </button>
                        <span>{INVENTORY_WIDTH_RANGE.max}px</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Assistant Sidebar</p>
                        <p className="text-xs text-slate-400">AI assistant and chat on the right.</p>
                      </div>
                    </div>
                    <label className="flex items-center justify-between text-xs text-slate-300">
                      <span>Open on launch</span>
                      <input
                        type="checkbox"
                        checked={isAssistantOpen}
                        onChange={(event) => setAssistantOpen(event.target.checked)}
                        className="h-4 w-4"
                        style={{ accentColor: '#ffaa00' }}
                        aria-label="Assistant open on launch"
                      />
                    </label>
                    <label className="flex items-center justify-between text-xs text-slate-300">
                      <span>Pinned by default (disable auto-hide)</span>
                      <input
                        type="checkbox"
                        checked={assistantPinned}
                        onChange={(event) => setAssistantPinned(event.target.checked)}
                        className="h-4 w-4"
                        style={{ accentColor: '#ffaa00' }}
                        aria-label="Assistant pinned by default"
                      />
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Width</span>
                        <span className="text-slate-400">{assistantWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min={ASSISTANT_WIDTH_RANGE.min}
                        max={ASSISTANT_WIDTH_RANGE.max}
                        step={10}
                        value={assistantWidth}
                        onChange={(event) => setAssistantWidth(Number(event.target.value))}
                        className="w-full accent-amber-400"
                        aria-label="Assistant sidebar width"
                      />
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        <span>{ASSISTANT_WIDTH_RANGE.min}px</span>
                        <button
                          type="button"
                          onClick={() => setAssistantWidth(ASSISTANT_WIDTH_RANGE.default)}
                          className="text-slate-400 hover:text-neon-amber transition-colors"
                        >
                          Reset
                        </button>
                        <span>{ASSISTANT_WIDTH_RANGE.max}px</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neon-purple/30 bg-neon-purple/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse" />
                          Neural Link
                        </div>
                        <p className="text-xs text-slate-400">Hand gesture controls (requires webcam).</p>
                      </div>
                      <button
                        onClick={() => setNeuralLinkEnabled(!neuralLinkEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          neuralLinkEnabled ? 'bg-neon-purple' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            neuralLinkEnabled ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Reset layout defaults</p>
                      <p className="text-xs text-slate-400">
                        Clears sidebar widths and restores pinned/open defaults.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetLayout}
                      className="inline-flex items-center justify-center px-3 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-neon-cyan border border-neon-cyan/60 bg-slate-900/80 hover:bg-neon-cyan/15 hover:border-neon-cyan transition-colors cut-corner-sm"
                    >
                      Reset Layout
                    </button>
                  </div>
                </div>
            </div>
          )}

          {/* Developer Tab */}
          {activeTab === 'dev' && (
            <DeveloperPortal />
          )}

          {/* Config Tab */}
          {activeTab === 'config' && (
            <ConfigPortal />
          )}

          {/* Diagnostics Tab */}
          {activeTab === 'diagnostics' && (
            <DiagnosticsView />
          )}

          {/* Locale Tab */}
          {activeTab === 'locale' && (
            <LocalizationSettings />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/70 panel-rail panel-frame">
          <button
            onClick={handleClear}
            className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-300 border border-slate-700/70 bg-slate-900/60 hover:text-red-300 hover:border-red-400/70 transition-colors cut-corner-sm"
          >
            Clear Key
          </button>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-2">
              <button
                onClick={handleTest}
                disabled={!apiKey.trim() || testStatus === 'testing'}
                className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-100 border border-slate-700/70 bg-slate-900/80 hover:border-amber-400/70 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cut-corner-sm"
              >
                Test Connection
              </button>
              <button
                onClick={handleSave}
                disabled={!apiKey.trim()}
                className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-neon-cyan border border-neon-cyan/60 bg-slate-900/80 hover:border-neon-cyan hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed cut-corner-sm"
              >
                Save & Apply
              </button>
            </div>
            {!apiKey.trim() && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Enter your Gemini API key to enable Test Connection.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsPanel;