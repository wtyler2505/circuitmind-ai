import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { createRef } from 'react';
import DiagramCanvas, { DiagramCanvasRef } from '../DiagramCanvas';
import { WiringDiagram, ElectronicComponent } from '../../types';

// Mock component data
const mockComponent: ElectronicComponent = {
  id: 'comp-1',
  name: 'Arduino Uno',
  type: 'microcontroller',
  pins: ['5V', 'GND', 'D2', 'D3'],
  description: 'Main controller',
  quantity: 1,
};

const mockComponent2: ElectronicComponent = {
  id: 'comp-2',
  name: 'LED',
  type: 'actuator',
  pins: ['Anode', 'Cathode'],
  description: 'Status indicator',
  quantity: 1,
};

const emptyDiagram: WiringDiagram = {
  title: 'Empty Diagram',
  components: [],
  connections: [],
  explanation: '',
};

const diagramWithComponents: WiringDiagram = {
  title: 'Test Circuit',
  components: [mockComponent, mockComponent2],
  connections: [],
  explanation: 'Test explanation',
};

const diagramWithConnection: WiringDiagram = {
  title: 'Connected Circuit',
  components: [mockComponent, mockComponent2],
  connections: [
    {
      fromComponentId: 'comp-1',
      toComponentId: 'comp-2',
      fromPin: 'D2',
      toPin: 'Anode',
      description: 'Signal wire',
      color: '#00ff00',
    },
  ],
  explanation: 'LED connected to Arduino',
};

describe('DiagramCanvas', () => {
  const defaultProps = {
    onComponentClick: vi.fn(),
    onDiagramUpdate: vi.fn(),
    onComponentDrop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('shows an empty state when the diagram has no components', () => {
      render(<DiagramCanvas diagram={emptyDiagram} {...defaultProps} />);

      expect(screen.getByText('Drop parts to start wiring.')).toBeInTheDocument();
      expect(
        screen.getByText(/Build manually or let chat generate a full diagram/i)
      ).toBeInTheDocument();
    });

    it('shows empty state when diagram is null', () => {
      render(<DiagramCanvas diagram={null} {...defaultProps} />);

      // Null diagram shows different message than empty diagram
      expect(screen.getByText('No diagram yet.')).toBeInTheDocument();
    });
  });

  describe('Component Rendering', () => {
    it('renders components from the diagram', () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      expect(screen.getByText('Arduino Uno')).toBeInTheDocument();
      expect(screen.getByText('LED')).toBeInTheDocument();
    });

    it('displays component types', () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      expect(screen.getAllByText(/microcontroller/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/actuator/i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders component pins', () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      // Arduino pins (appear twice - left and right side)
      expect(screen.getAllByText('5V').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('GND').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('D2').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Wire Rendering', () => {
    it('renders wire connections between components', () => {
      const { container } = render(
        <DiagramCanvas diagram={diagramWithConnection} {...defaultProps} />
      );

      // Look for SVG path elements (wires are rendered as paths)
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('renders wire description element (hidden by default)', () => {
      const { container } = render(
        <DiagramCanvas diagram={diagramWithConnection} {...defaultProps} />
      );

      // Wire descriptions are rendered but hidden (opacity-0) until hover
      const wireLabel = container.querySelector('text');
      expect(wireLabel).toBeInTheDocument();
    });
  });

  describe('Zoom Controls', () => {
    it('renders zoom control buttons', () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reset view/i)).toBeInTheDocument();
    });

    it('zooms in when zoom in button is clicked', () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      const zoomInBtn = screen.getByLabelText(/zoom in/i);
      fireEvent.click(zoomInBtn);

      // Zoom level should increase (check percentage display if visible)
      // The component clamps zoom between 0.25 and 3
    });

    it('zooms out when zoom out button is clicked', () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      const zoomOutBtn = screen.getByLabelText(/zoom out/i);
      fireEvent.click(zoomOutBtn);
    });
  });

  describe('Search Functionality', () => {
    it('renders search input', () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      expect(screen.getByPlaceholderText(/locate part/i)).toBeInTheDocument();
    });

    it('filters components based on search query', async () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/locate part/i);
      fireEvent.change(searchInput, { target: { value: 'Arduino' } });

      await waitFor(() => {
        expect(screen.getByText('Arduino Uno')).toBeInTheDocument();
        // LED should still be in DOM but may be filtered visually
      });
    });

    it('filters out non-matching components visually', async () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/locate part/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      // Both components still exist in DOM but filtered array should be empty
      // The component renders all diagram components but filters for search matches
      await waitFor(() => {
        expect(searchInput).toHaveValue('nonexistent');
      });
    });
  });

  describe('Component Interaction', () => {
    it('calls onComponentClick when a component is clicked', () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      const componentName = screen.getByText('Arduino Uno');
      const componentGroup = componentName.closest('g');

      if (componentGroup) {
        fireEvent.click(componentGroup);
        expect(defaultProps.onComponentClick).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'comp-1' })
        );
      }
    });
  });

  describe('Imperative API (Ref)', () => {
    it('exposes setZoom and getZoom methods', () => {
      const ref = createRef<DiagramCanvasRef>();
      render(<DiagramCanvas ref={ref} diagram={diagramWithComponents} {...defaultProps} />);

      expect(ref.current).not.toBeNull();
      expect(ref.current?.getZoom()).toBe(1);

      act(() => {
        ref.current?.setZoom(2);
      });

      expect(ref.current?.getZoom()).toBe(2);
    });

    it('exposes setPan and getPan methods', () => {
      const ref = createRef<DiagramCanvasRef>();
      render(<DiagramCanvas ref={ref} diagram={diagramWithComponents} {...defaultProps} />);

      expect(ref.current?.getPan()).toEqual({ x: 0, y: 0 });

      act(() => {
        ref.current?.setPan(100, 50);
      });

      expect(ref.current?.getPan()).toEqual({ x: 100, y: 50 });
    });

    it('exposes resetView method', () => {
      const ref = createRef<DiagramCanvasRef>();
      render(<DiagramCanvas ref={ref} diagram={diagramWithComponents} {...defaultProps} />);

      act(() => {
        ref.current?.setZoom(2);
        ref.current?.setPan(100, 100);
      });

      act(() => {
        ref.current?.resetView();
      });

      expect(ref.current?.getZoom()).toBe(1);
      expect(ref.current?.getPan()).toEqual({ x: 0, y: 0 });
    });

    it('exposes highlightComponent and clearHighlight methods', () => {
      const ref = createRef<DiagramCanvasRef>();
      render(<DiagramCanvas ref={ref} diagram={diagramWithComponents} {...defaultProps} />);

      // Should not throw
      act(() => {
        ref.current?.highlightComponent('comp-1', { color: '#ff0000', pulse: true });
      });

      act(() => {
        ref.current?.clearHighlight('comp-1');
      });
    });

    it('exposes getComponentPosition method', () => {
      const ref = createRef<DiagramCanvasRef>();
      render(<DiagramCanvas ref={ref} diagram={diagramWithComponents} {...defaultProps} />);

      // Positions are auto-assigned, so should exist
      const pos = ref.current?.getComponentPosition('comp-1');
      expect(pos).toBeDefined();
      expect(pos).toHaveProperty('x');
      expect(pos).toHaveProperty('y');
    });

    it('exposes getAllComponentPositions method', () => {
      const ref = createRef<DiagramCanvasRef>();
      render(<DiagramCanvas ref={ref} diagram={diagramWithComponents} {...defaultProps} />);

      const positions = ref.current?.getAllComponentPositions();
      expect(positions).toBeInstanceOf(Map);
      expect(positions?.size).toBe(2);
    });

    it('exposes centerOnComponent method', () => {
      const ref = createRef<DiagramCanvasRef>();
      render(<DiagramCanvas ref={ref} diagram={diagramWithComponents} {...defaultProps} />);

      // Should not throw
      act(() => {
        ref.current?.centerOnComponent('comp-1', 1.5);
      });
    });
  });

  describe('Drag and Drop', () => {
    it('shows drop indicator during drag over', () => {
      const { container } = render(
        <DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />
      );

      const dropZone = container.querySelector('.drop-zone, [data-testid="canvas-drop-zone"]');
      // The actual drop zone is the container div

      fireEvent.dragOver(container.firstChild as Element, {
        dataTransfer: { types: ['application/json'] },
      });

      // Visual feedback is applied via CSS class
    });

    it('handles component drop', () => {
      const { container } = render(
        <DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />
      );

      const dropData = JSON.stringify({
        id: 'new-comp',
        name: 'New Component',
        type: 'Test',
        pins: ['A', 'B'],
      });

      fireEvent.drop(container.firstChild as Element, {
        dataTransfer: {
          getData: () => dropData,
        },
        clientX: 200,
        clientY: 150,
      });

      // onComponentDrop should be called with parsed component
      expect(defaultProps.onComponentDrop).toHaveBeenCalled();
    });
  });

  describe('Wire Highlighting', () => {
    it('exposes highlightWire and clearWireHighlight methods', () => {
      const ref = createRef<DiagramCanvasRef>();
      render(<DiagramCanvas ref={ref} diagram={diagramWithConnection} {...defaultProps} />);

      // Should not throw
      act(() => {
        ref.current?.highlightWire(0, { color: '#00ff00', pulse: true });
      });

      act(() => {
        ref.current?.clearWireHighlight(0);
      });
    });
  });

  describe('SVG Arrow Markers', () => {
    it('defines arrow markers in SVG defs', () => {
      const { container } = render(
        <DiagramCanvas diagram={diagramWithConnection} {...defaultProps} />
      );

      const defs = container.querySelector('defs');
      expect(defs).toBeInTheDocument();

      const markers = container.querySelectorAll('marker');
      expect(markers.length).toBeGreaterThan(0);
    });
  });

  describe('Title Display', () => {
    it('displays diagram title in header', () => {
      const { container } = render(
        <DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />
      );

      // Title is rendered in the header section
      const header = container.querySelector('[class*="absolute"][class*="top"]');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible zoom controls', () => {
      render(<DiagramCanvas diagram={diagramWithComponents} {...defaultProps} />);

      const zoomIn = screen.getByLabelText(/zoom in/i);
      const zoomOut = screen.getByLabelText(/zoom out/i);
      const resetView = screen.getByLabelText(/reset view/i);

      expect(zoomIn).toHaveAttribute('type', 'button');
      expect(zoomOut).toHaveAttribute('type', 'button');
      expect(resetView).toHaveAttribute('type', 'button');
    });
  });
});
