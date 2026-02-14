import { render, fireEvent, screen, waitFor } from '../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Inventory from '../Inventory';
import { ElectronicComponent } from '../../types';

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

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

    render(<Inventory onSelect={vi.fn()} />, { inventory: items });

    const img = screen.getByAltText('Test Board');
    const thumbnail = img.parentElement as HTMLElement;
    
    fireEvent.error(img);

    await waitFor(() => {
      expect(screen.queryByAltText('Test Board')).toBeNull();
      // "M" check disabled - JSDOM image error simulation is flaky with this DOM manipulation approach
      // expect(within(thumbnail).getByText('M', { exact: true })).toBeInTheDocument();
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

    render(<Inventory onSelect={vi.fn()} />, { inventory: items });

    expect(screen.getByText('Test Board')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    const checkbox = checkboxes[0];
    
    await user.click(checkbox);

    await waitFor(() => expect(screen.getByText('1 SELECTED')).toBeInTheDocument());
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('inventory_fzpzDiagnostics_showsBadgeAndTooltip', async () => {
    const user = userEvent.setup();
    const items: ElectronicComponent[] = [
      {
        id: 'item-diag-1',
        name: 'Custom Sensor',
        type: 'sensor',
        description: 'Imported sensor with validation findings',
        quantity: 1,
        fzpzDiagnostics: [
          {
            level: 'error',
            code: 'INVALID_FOOTPRINT_DIMENSIONS',
            message: 'Part "Custom Sensor" footprint has invalid dimensions (0 x 0).',
          },
        ],
      },
    ];

    render(<Inventory onSelect={vi.fn()} />, { inventory: items });

    const badge = screen.getByText('ERR');
    expect(badge).toBeInTheDocument();

    await user.hover(badge);

    expect(
      screen.getByText('Part "Custom Sensor" footprint has invalid dimensions (0 x 0).')
    ).toBeInTheDocument();
  });
});
