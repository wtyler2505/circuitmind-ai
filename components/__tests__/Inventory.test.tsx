import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Inventory from '../Inventory';
import { ElectronicComponent } from '../../types';
import { ToastProvider } from '../../hooks/useToast';

const baseProps = {
  onAddItem: vi.fn(),
  onRemoveItem: vi.fn(),
  onSelect: vi.fn(),
  onUpdateItem: vi.fn(),
  toggleOpen: vi.fn(),
  onOpen: vi.fn(),
  onClose: vi.fn(),
};

const renderWithToast = (ui: JSX.Element) => render(<ToastProvider>{ui}</ToastProvider>);

describe('Inventory', () => {
  it('inventory_thumbnailError_showsFallbackIcon', async () => {
    const items: ElectronicComponent[] = [
      {
        id: 'item-1',
        name: 'Test Board',
        type: 'microcontroller',
        description: 'Test item',
        pins: [],
        quantity: 1,
        imageUrl: 'http://example.com/broken.jpg',
      },
    ];

    renderWithToast(<Inventory {...baseProps} items={items} isOpen={true} />);

    const img = screen.getByAltText('Test Board');
    const thumbnail = img.parentElement as HTMLElement;
    expect(img).toHaveAttribute('loading', 'lazy');

    fireEvent.error(img);

    await waitFor(() => {
      expect(screen.queryByAltText('Test Board')).toBeNull();
      expect(within(thumbnail).getByText('M', { exact: true })).toBeInTheDocument();
    });
  });

  it('inventory_bulkSelection_showsActionBar', async () => {
    const user = userEvent.setup();
    const items: ElectronicComponent[] = [
      {
        id: 'item-1',
        name: 'Test Board',
        type: 'microcontroller',
        description: 'Test item',
        pins: [],
        quantity: 1,
      },
    ];

    renderWithToast(
      <Inventory
        {...baseProps}
        items={items}
        isOpen={true}
        onDeleteMany={vi.fn()}
        onUpdateMany={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /select test board/i });
    await user.click(checkbox);

    await waitFor(() => expect(screen.getByText('1 selected')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /export selected/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /mark selected low stock/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /delete selected/i })).toBeEnabled();
  }, 10000);
});
