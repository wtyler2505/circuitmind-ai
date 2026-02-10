import React from 'react';
import * as RGL from 'react-grid-layout';
import { useDashboard, DashboardWidget, WidgetLayout } from '../../contexts/DashboardContext';
import { WidgetWrapper } from './WidgetWrapper';

// Multi-fallback resolver for react-grid-layout
const lib = ((RGL as unknown as Record<string, unknown>).default || RGL) as any;
const Responsive = lib.Responsive || lib;
const WidthProvider = lib.WidthProvider;
const ResponsiveGridLayout = WidthProvider ? WidthProvider(Responsive) : Responsive;

// Import widget components
import { SystemVitals } from '../layout/SystemVitals';
import { HardwareTerminal } from '../layout/HardwareTerminal';
import { ProjectTimeline } from '../layout/ProjectTimeline';
import { OscilloscopeWidget } from './OscilloscopeWidget';
import { LogicAnalyzerWidget } from './LogicAnalyzerWidget';
import { AnalogGauge } from './AnalogGauge';
import { HeatmapWidget } from './HeatmapWidget';

const WidgetRenderer: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  switch (widget.type) {
    case 'vitals':
      return <SystemVitals />;
    case 'terminal':
      return <HardwareTerminal />;
    case 'timeline':
      return <ProjectTimeline />;
    case 'oscilloscope':
      return <OscilloscopeWidget streamId="main-osc" />;
    case 'logic':
      return <LogicAnalyzerWidget streamId="d0-logic" label="PIN_D0" />;
    case 'gauge':
      return <AnalogGauge value={Math.random() * 100} label="LOAD" />;
    case 'heatmap':
      return <HeatmapWidget points={[]} />;
    default:
      return <div className="p-4 text-slate-500 text-[10px]">Unknown Widget: {widget.type}</div>;
  }
};

export const DashboardView: React.FC = () => {
  const { widgets, updateLayout, isEditMode } = useDashboard();

  const layouts = {
    lg: widgets.map(w => w.layout)
  };

  return (
    <div className="w-full h-full bg-cyber-black overflow-y-auto custom-scrollbar p-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={(currentLayout: WidgetLayout[]) => updateLayout(currentLayout)}
        draggableHandle=".cursor-grab"
      >
        {widgets.map(widget => (
          <div key={widget.id}>
            <WidgetWrapper id={widget.id} title={widget.type.toUpperCase()}>
              <WidgetRenderer widget={widget} />
            </WidgetWrapper>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};
