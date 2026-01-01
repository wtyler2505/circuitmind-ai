import { render, screen } from '@testing-library/react';
import SettingsPanel from '../SettingsPanel';

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('settingsPanel_emptyApiKey_showsTestDisabledReason', () => {
    render(
      <SettingsPanel
        isOpen={true}
        onClose={() => undefined}
      />
    );

    expect(
      screen.getByText('Enter your Gemini API key to enable Test Connection.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Connection' })).toBeDisabled();
  });
});
