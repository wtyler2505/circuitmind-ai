import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../tests/test-utils';
import AssistantSidebar from '../AssistantSidebar';
import { useLayout } from '../../contexts/LayoutContext';

// Mock the context
vi.mock('../../contexts/LayoutContext', async () => {
  const actual = await vi.importActual('../../contexts/LayoutContext');
  return {
    ...actual,
    useLayout: vi.fn(),
    LayoutProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  };
});

describe('AssistantSidebar', () => {
  const mockSetAssistantOpen = vi.fn();
  const mockSetAssistantPinned = vi.fn();
  const mockSetAssistantWidth = vi.fn();

  const defaultContext = {
    isAssistantOpen: true,
    setAssistantOpen: mockSetAssistantOpen,
    assistantPinned: true,
    setAssistantPinned: mockSetAssistantPinned,
    assistantWidth: 380,
    setAssistantWidth: mockSetAssistantWidth,
    assistantDefaultWidth: 380,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLayout as any).mockReturnValue(defaultContext);
  });

  it('renders children correctly', () => {
    render(
      <AssistantSidebar>
        <div data-testid="sidebar-content">Content</div>
      </AssistantSidebar>
    );
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
  });

  it('handles mouse leave safely when relatedTarget is null', () => {
    render(
      <AssistantSidebar>
        <div>Content</div>
      </AssistantSidebar>
    );

    const sidebar = screen.getByRole('complementary');
    
    // Create a mouse event with null relatedTarget
    const mouseLeaveEvent = new MouseEvent('mouseleave', {
      bubbles: true,
      cancelable: true,
      relatedTarget: null
    });

    // Should not throw
    fireEvent(sidebar, mouseLeaveEvent);
  });

  it('handles mouse leave safely when relatedTarget is not a Node (e.g. Window)', () => {
    render(
      <AssistantSidebar>
        <div>Content</div>
      </AssistantSidebar>
    );

    const sidebar = screen.getByRole('complementary');
    
    // XMLHttpRequest is an EventTarget but not a Node
    const relatedTarget = new XMLHttpRequest();
    const mouseLeaveEvent = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
        relatedTarget: relatedTarget
    });
    
    fireEvent(sidebar, mouseLeaveEvent);
  });

  it('toggles pinned state on button click', () => {
    render(
      <AssistantSidebar>
        <div>Content</div>
      </AssistantSidebar>
    );

    const toggleBtn = screen.getByRole('button', { name: /unlock assistant sidebar/i });
    fireEvent.click(toggleBtn);
    expect(mockSetAssistantPinned).toHaveBeenCalledWith(false);
    expect(mockSetAssistantOpen).toHaveBeenCalledWith(false); // Should close on unpin
  });

  it('opens sidebar on mouse enter when unpinned', () => {
    (useLayout as any).mockReturnValue({
      ...defaultContext,
      assistantPinned: false,
      isAssistantOpen: false
    });

    render(
      <AssistantSidebar>
        <div>Content</div>
      </AssistantSidebar>
    );

    const sidebar = screen.getByRole('complementary');
    fireEvent.mouseEnter(sidebar);
    expect(mockSetAssistantOpen).toHaveBeenCalledWith(true);
  });
});
