import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import Inventory from '../Inventory';
import { ElectronicComponent } from '../../types';

const baseProps = {
  onAddItem: vi.fn(),
  onRemoveItem: vi.fn(),
  onSelect: vi.fn(),
  onUpdateItem: vi.fn(),
  toggleOpen: vi.fn(),
  onOpen: vi.fn(),
  onClose: vi.fn(),
};

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

    render(
      <Inventory
        {...baseProps}
        items={items}
        isOpen={true}
      />
    );

    const img = screen.getByAltText('Test Board');
    const thumbnail = img.parentElement as HTMLElement;
    expect(img).toHaveAttribute('loading', 'lazy');

    fireEvent.error(img);

    await waitFor(() => {
      expect(screen.queryByAltText('Test Board')).toBeNull();
      expect(within(thumbnail).getByText('M', { exact: true })).toBeInTheDocument();
    });
  });
});
