import { render, screen } from '@testing-library/react';
import DiagramCanvas from '../DiagramCanvas';
import { WiringDiagram } from '../../types';

describe('DiagramCanvas', () => {
  it('shows an empty state when the diagram has no components', () => {
    const diagram: WiringDiagram = {
      title: 'Empty Diagram',
      components: [],
      connections: [],
      explanation: '',
    };

    render(
      <DiagramCanvas
        diagram={diagram}
        onComponentClick={() => undefined}
        onDiagramUpdate={() => undefined}
      />
    );

    expect(screen.getByText('Canvas is ready.')).toBeInTheDocument();
    expect(screen.getByText(/Drag parts from the Asset Manager/i)).toBeInTheDocument();
  });
});
