import { render, screen } from '@testing-library/react';
import { beforeAll, vi } from 'vitest';
import ChatPanel from '../ChatPanel';

const createBaseProps = () => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  onSwitchConversation: vi.fn(),
  onCreateConversation: vi.fn(),
  onDeleteConversation: vi.fn(),
  onRenameConversation: vi.fn(),
  onSendMessage: vi.fn().mockResolvedValue(undefined),
});

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    writable: true,
  });
});

describe('ChatPanel', () => {
  it('chatPanel_expandedControls_haveAriaLabels', () => {
    render(
      <ChatPanel
        {...createBaseProps()}
        onToggleExpand={vi.fn()}
        onDeepThinkingChange={vi.fn()}
        onModeChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Attach image or video')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimize chat')).toBeInTheDocument();
    expect(screen.getByLabelText('Enable deep thinking')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Image mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Video mode')).toBeInTheDocument();
  });

  it('chatPanel_collapsedButton_hasAriaLabel', () => {
    render(
      <ChatPanel
        {...createBaseProps()}
        isExpanded={false}
        onToggleExpand={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
  });
});
