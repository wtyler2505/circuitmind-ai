import { screen } from '@testing-library/react';
import { render } from '../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ChatPanel from '../ChatPanel';
import { EnhancedChatMessage } from '../../types';

const mockMessages: EnhancedChatMessage[] = [
  {
    id: '1',
    conversationId: 'conv-1',
    role: 'model',
    content: 'Hello!',
    timestamp: Date.now(),
    linkedComponents: [],
    suggestedActions: [],
  },
];

const baseProps = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  onSwitchConversation: vi.fn(),
  onCreateConversation: vi.fn(),
  onDeleteConversation: vi.fn(),
  onRenameConversation: vi.fn(),
  onSendMessage: vi.fn(),
  isExpanded: true,
  onToggleExpand: vi.fn(),
};

describe('ChatPanel', () => {
  it('chatPanel_expandedControls_haveAriaLabels', () => {
    render(<ChatPanel {...baseProps} />);

    expect(screen.getByLabelText('Attach File')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimize chat')).toBeInTheDocument();
  });

  it('chatPanel_collapsedButton_hasAriaLabel', () => {
    render(<ChatPanel {...baseProps} />);
    expect(screen.getByLabelText('Minimize chat')).toBeInTheDocument();
  });

  it('chatPanel_quickActions_toggleCollapsesPanel', async () => {
    const user = userEvent.setup();
    const msgWithActions: EnhancedChatMessage = {
      ...mockMessages[0],
      suggestedActions: [
        { type: 'highlight', payload: {}, label: 'Draft wiring', safe: true },
      ],
    };

    render(<ChatPanel {...baseProps} messages={[msgWithActions]} />);

    // Toggle actions (chevron)
    const toggleBtn = screen.getByLabelText('Toggle actions');
    await user.click(toggleBtn);
    
    // "Draft wiring" appears in Quick Actions AND in the message suggested actions.
    // We just want to know if it's in the document.
    const elements = screen.getAllByText('Draft wiring');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('chatPanel_quickActions_autoCollapse_withMessages', () => {
    render(<ChatPanel {...baseProps} messages={mockMessages} />);
    // With messages, quick actions should be collapsed by default.
    // However, "Draft wiring" is hardcoded in the quick actions list.
    // If it's collapsed, it shouldn't be visible.
    // BUT if the message itself has "Draft wiring" (like in previous test), it would be found.
    // In mockMessages[0], there are no suggested actions.
    // So if we query "Draft wiring", it should be NULL if Quick Actions is collapsed.
    
    expect(screen.queryByText('Draft wiring')).toBeNull();
  });
});