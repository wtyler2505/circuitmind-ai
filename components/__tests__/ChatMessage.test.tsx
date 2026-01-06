import { render, screen } from '@testing-library/react';
import ChatMessage from '../ChatMessage';
import { EnhancedChatMessage } from '../../types';

const buildMessage = (content: string): EnhancedChatMessage => ({
  id: 'msg-1',
  conversationId: 'conv-1',
  role: 'model',
  content,
  timestamp: 1700000000000,
  linkedComponents: [],
  suggestedActions: [],
});

describe('ChatMessage', () => {
  it('renders markdown safely without injecting html', () => {
    const { container } = render(
      <ChatMessage message={buildMessage('Hello **bold** `code` <script>alert("x")</script>')} />
    );
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('code')).toBeInTheDocument();
  });
});
