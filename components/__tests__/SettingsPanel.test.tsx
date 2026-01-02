import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SettingsPanel from '../SettingsPanel';

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('settingsPanel_emptyApiKey_showsTestDisabledReason', () => {
    render(<SettingsPanel isOpen={true} onClose={() => undefined} />);

    expect(
      screen.getByText('Enter your Gemini API key to enable Test Connection.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Connection' })).toBeDisabled();
  }, 10000);

  test('settingsPanel_layoutToggles_dispatchUpdates', async () => {
    const user = userEvent.setup();
    const onLayoutSettingsChange = vi.fn();

    render(
      <SettingsPanel
        isOpen={true}
        onClose={() => undefined}
        layoutSettings={{
          inventoryOpen: true,
          inventoryPinned: false,
          assistantOpen: true,
          assistantPinned: true,
        }}
        onLayoutSettingsChange={onLayoutSettingsChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /layout/i }));
    await user.click(screen.getByLabelText('Inventory open on launch'));
    await user.click(screen.getByLabelText('Assistant pinned by default'));

    expect(onLayoutSettingsChange).toHaveBeenCalledWith({ inventoryOpen: false });
    expect(onLayoutSettingsChange).toHaveBeenCalledWith({ assistantPinned: false });
  });

  test('settingsPanel_layoutReset_showsUndo_and_restoresSnapshot', async () => {
    const user = userEvent.setup();
    const onLayoutSettingsChange = vi.fn();

    render(
      <SettingsPanel
        isOpen={true}
        onClose={() => undefined}
        layoutSettings={{
          inventoryOpen: true,
          inventoryPinned: true,
          assistantOpen: false,
          assistantPinned: false,
          inventoryWidth: 420,
          assistantWidth: 500,
        }}
        onLayoutSettingsChange={onLayoutSettingsChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /layout/i }));
    await user.click(screen.getByRole('button', { name: /reset layout/i }));

    expect(onLayoutSettingsChange).toHaveBeenCalledWith({
      inventoryOpen: false,
      inventoryPinned: false,
      assistantOpen: true,
      assistantPinned: true,
      inventoryWidth: 360,
      assistantWidth: 380,
    });

    await user.click(screen.getByRole('button', { name: /restore last layout/i }));

    expect(onLayoutSettingsChange).toHaveBeenLastCalledWith({
      inventoryOpen: true,
      inventoryPinned: true,
      assistantOpen: false,
      assistantPinned: false,
      inventoryWidth: 420,
      assistantWidth: 500,
    });
  });
});
