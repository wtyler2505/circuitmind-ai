/**
 * Accessibility Tests (WCAG 2.1 AA)
 *
 * Uses jest-axe to run automated axe-core checks against rendered components.
 * These tests catch common a11y violations: missing labels, bad ARIA usage,
 * contrast issues, keyboard traps, etc.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Minimal context stubs for components that require context providers
// ---------------------------------------------------------------------------

vi.mock('../contexts/LayoutContext', () => ({
  useLayout: () => ({
    isInventoryOpen: false,
    setInventoryOpen: vi.fn(),
    inventoryPinned: false,
    setInventoryPinned: vi.fn(),
    inventoryWidth: 360,
    setInventoryWidth: vi.fn(),
    isAssistantOpen: true,
    setAssistantOpen: vi.fn(),
    assistantPinned: true,
    setAssistantPinned: vi.fn(),
    assistantWidth: 380,
    setAssistantWidth: vi.fn(),
    inventoryDefaultWidth: 360,
    assistantDefaultWidth: 380,
    neuralLinkEnabled: false,
    setNeuralLinkEnabled: vi.fn(),
  }),
}));

vi.mock('../hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock('../services/apiKeyStorage', () => ({
  getStoredApiKey: () => '',
  setStoredApiKey: vi.fn(),
}));

vi.mock('../services/datasetService', () => ({
  datasetService: { downloadDataset: vi.fn() },
}));

vi.mock('../services/search/searchIndexer', () => ({
  searchIndexer: { search: () => [] },
}));

vi.mock('../contexts/DiagramContext', () => ({
  useDiagram: () => ({
    diagram: null,
    updateDiagram: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
    saveToQuickSlot: vi.fn(),
    loadFromQuickSlot: vi.fn(),
  }),
  DiagramProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../contexts/VoiceAssistantContext', () => ({
  useVoiceAssistant: () => ({
    isLiveActive: false,
    liveStatus: 'idle',
    toggleLiveMode: vi.fn(),
    lastTranscription: null,
    clearTranscription: vi.fn(),
  }),
}));

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    user: { name: 'Test User', email: 'test@example.com', preferences: { wiringColors: {} } },
    updateUser: vi.fn(),
  }),
}));

vi.mock('../contexts/DashboardContext', () => ({
  useDashboard: () => ({
    isEditMode: false,
    setEditMode: vi.fn(),
    widgets: [],
  }),
}));

vi.mock('../contexts/InventoryContext', () => ({
  useInventory: () => ({
    inventory: [],
    setInventory: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  }),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { name: 'Test User' },
    isAuthenticated: true,
  }),
}));

vi.mock('../services/gitService', () => ({
  gitService: {
    log: vi.fn().mockResolvedValue([]),
    isInitialized: vi.fn().mockResolvedValue(false),
  },
}));

vi.mock('../services/collabService', () => ({
  collabService: {
    getPresence: () => null,
    isConnected: false,
  },
}));

vi.mock('../services/partStorageService', () => ({
  partStorageService: {
    getThumbnail: vi.fn().mockResolvedValue(null),
    getPart: vi.fn().mockResolvedValue(null),
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Accessibility: ConversationSwitcher', () => {
  it('trigger button has no axe violations', async () => {
    const ConversationSwitcher =
      (await import('../components/ConversationSwitcher')).default;

    const { container } = render(
      <ConversationSwitcher
        conversations={[
          {
            id: '1',
            title: 'Test Chat',
            isPrimary: true,
            messageCount: 3,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ]}
        activeConversationId="1"
        onSwitchConversation={vi.fn()}
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onRenameConversation={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility: OmniSearch', () => {
  it('has no axe violations when open', async () => {
    const { OmniSearch } = await import('../components/layout/OmniSearch');

    const { container } = render(
      <OmniSearch isOpen={true} onClose={vi.fn()} onSelect={vi.fn()} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15_000);
});

describe('Accessibility: SettingsPanel', () => {
  it('has no axe violations when open', async () => {
    const SettingsPanel =
      (await import('../components/SettingsPanel')).default;

    const { container } = render(
      <SettingsPanel isOpen={true} onClose={vi.fn()} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// Component-level axe tests (REQ-15 Task 12)
// ---------------------------------------------------------------------------

describe('Accessibility: ChatMessage', () => {
  it('model message has no axe violations', async () => {
    const ChatMessage = (await import('../components/ChatMessage')).default;

    const { container } = render(
      <ChatMessage
        message={{
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'model',
          content: 'Hello **world**',
          timestamp: Date.now(),
          linkedComponents: [],
          suggestedActions: [],
        }}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15_000);

  it('user message has no axe violations', async () => {
    const ChatMessage = (await import('../components/ChatMessage')).default;

    const { container } = render(
      <ChatMessage
        message={{
          id: 'msg-2',
          conversationId: 'conv-1',
          role: 'user',
          content: 'How do I wire an LED?',
          timestamp: Date.now(),
          linkedComponents: [],
          suggestedActions: [],
        }}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15_000);
});

describe('Accessibility: AppHeader', () => {
  it('has no axe violations', async () => {
    const { AppHeader } = await import('../components/layout/AppHeader');

    const { container } = render(<AppHeader />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});

describe('Accessibility: ComponentEditorModal', () => {
  it('has no axe violations when rendered', async () => {
    const ComponentEditorModal =
      (await import('../components/ComponentEditorModal')).default;

    const testComponent = {
      id: 'comp-1',
      name: 'Test Resistor',
      type: 'other' as const,
      description: 'A 10k resistor',
      pins: ['pin1', 'pin2'],
      quantity: 5,
    };

    const { container } = render(
      <ComponentEditorModal
        component={testComponent}
        onClose={vi.fn()}
        onSave={vi.fn()}
        explanation=""
        isGenerating3D={false}
        onGenerate3D={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility: InventoryItem', () => {
  it('has no axe violations', async () => {
    const { default: InventoryItem } = await import(
      '../components/inventory/InventoryItem'
    );

    const testItem = {
      id: 'item-1',
      name: 'Arduino Uno',
      type: 'microcontroller' as const,
      description: 'Development board',
      pins: ['D0', 'D1', 'GND', '5V'],
      quantity: 1,
    };

    const { container } = render(
      <InventoryItem
        item={testItem}
        isSelected={false}
        onToggleSelection={vi.fn()}
        onDragStart={vi.fn()}
        onDoubleClick={vi.fn()}
        onAddToCanvas={vi.fn()}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility: Inventory', () => {
  it('empty inventory has no axe violations', async () => {
    const Inventory = (await import('../components/Inventory')).default;

    const { container } = render(<Inventory onSelect={vi.fn()} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility: AssistantSidebar', () => {
  it('has no axe violations when open', async () => {
    const AssistantSidebar =
      (await import('../components/AssistantSidebar')).default;

    const { container } = render(
      <AssistantSidebar>
        <div>Chat content</div>
      </AssistantSidebar>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});


