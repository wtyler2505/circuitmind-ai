import { render, screen, within, waitFor } from '../../tests/test-utils';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SettingsPanel from '../SettingsPanel';

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('settingsPanel_emptyApiKey_showsTestDisabledReason', () => {
    render(<SettingsPanel isOpen={true} onClose={() => undefined} />);

    expect(
      screen.getByText('Enter your Gemini API key to enable Test Connection.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Connection' })).toBeDisabled();
  }, 10000);

  test('settingsPanel_layoutToggles_updatesContext', async () => {
    const user = userEvent.setup();
    
    // Seed initial state in localStorage
    localStorage.setItem('cm_inventory_open_default', 'true');
    localStorage.setItem('cm_assistant_pinned_default', 'true');

    render(<SettingsPanel isOpen={true} onClose={() => undefined} />);

    await user.click(screen.getByRole('button', { name: /layout/i }));
    
    // Verify initial state
    const inventoryToggle = screen.getByLabelText('Inventory open on launch');
    const assistantPinnedToggle = screen.getByLabelText('Assistant pinned by default');
    
    expect(inventoryToggle).toBeChecked();
    expect(assistantPinnedToggle).toBeChecked();

    // Toggle
    await user.click(inventoryToggle);
    await user.click(assistantPinnedToggle);

    // Verify UI update
    expect(inventoryToggle).not.toBeChecked();
    expect(assistantPinnedToggle).not.toBeChecked();
    
    // Verify Persistence
    expect(localStorage.getItem('cm_inventory_open_default')).toBe('false');
    expect(localStorage.getItem('cm_assistant_pinned_default')).toBe('false');
  }, 15000);

  test('settingsPanel_layoutReset_showsUndo_and_restoresSnapshot', async () => {
    const user = userEvent.setup();
    
    // Seed non-default state
    localStorage.setItem('cm_inventory_open_default', 'true');
    localStorage.setItem('cm_inventory_pinned_default', 'true');
    localStorage.setItem('cm_assistant_open_default', 'false');
    localStorage.setItem('cm_assistant_pinned_default', 'false');
    localStorage.setItem('cm_inventory_width', '420');
    localStorage.setItem('cm_assistant_width', '500');

    render(<SettingsPanel isOpen={true} onClose={() => undefined} />);

    await user.click(screen.getByRole('button', { name: /layout/i }));
    
    // Verify initial values in UI
    expect(screen.getByLabelText('Inventory open on launch')).toBeChecked();
    expect(screen.getByLabelText('Assistant sidebar width')).toHaveValue('500');

    // Click Reset
    await user.click(screen.getByRole('button', { name: /reset layout/i }));

    // Verify reset values (defaults)
    // Inventory open default is false
    expect(screen.getByLabelText('Inventory open on launch')).not.toBeChecked(); 
    // Assistant width default is 380
    // Wait for state update if necessary (React 18 automatic batching usually handles this)
    await waitFor(() => {
       expect(screen.getByLabelText('Assistant sidebar width')).toHaveValue('380');
    });

    // Check Undo Toast
    const toast = await screen.findByRole('alert');
    expect(within(toast).getByText(/layout reset/i)).toBeInTheDocument();
    
    // Click Undo
    await user.click(within(toast).getByRole('button', { name: /undo/i }));

    // Verify restored values
    expect(screen.getByLabelText('Inventory open on launch')).toBeChecked();
    expect(screen.getByLabelText('Assistant sidebar width')).toHaveValue('500');
  }, 15000);
});