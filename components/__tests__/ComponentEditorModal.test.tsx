import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ComponentEditorModal from '../ComponentEditorModal';
import { ElectronicComponent } from '../../types';

vi.mock('../ThreeViewer', () => ({
  default: () => <div data-testid="three-viewer" />,
}));

describe('ComponentEditorModal', () => {
  it('gates 3D code execution until confirmed', async () => {
    const component: ElectronicComponent = {
      id: 'comp-1',
      name: 'Test Component',
      type: 'sensor',
      description: 'Test component description',
      pins: ['VCC', 'GND'],
      threeCode: 'const group = new THREE.Group();\nreturn group;',
    };

    render(
      <ComponentEditorModal
        component={component}
        onClose={() => undefined}
        onSave={() => undefined}
        explanation=""
        isGenerating3D={false}
        onGenerate3D={() => undefined}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '3D MODEL' }));

    expect(screen.getByRole('button', { name: /run 3d code/i })).toBeInTheDocument();
    expect(screen.queryByTestId('three-viewer')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /run 3d code/i }));

    const viewer = await screen
      .findByTestId('three-viewer', {}, { timeout: 2000 })
      .catch(() => null);
    const loading = screen.queryByText(/loading 3d viewer/i);
    expect(viewer || loading).toBeTruthy();
  }, 10000);

  it('shows a 3D empty state when no model is available', async () => {
    const component: ElectronicComponent = {
      id: 'comp-2',
      name: 'No Model',
      type: 'sensor',
      description: 'No model available yet.',
      pins: [],
    };

    render(
      <ComponentEditorModal
        component={component}
        onClose={() => undefined}
        onSave={() => undefined}
        explanation=""
        isGenerating3D={false}
        onGenerate3D={() => undefined}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '3D MODEL' }));

    expect(screen.getByText('No 3D model yet.')).toBeInTheDocument();
  });
});
