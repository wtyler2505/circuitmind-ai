import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useDashboard, DashboardWidget } from '../../contexts/DashboardContext';
import { WidgetWrapper } from './WidgetWrapper';

// Import widget components
import { SystemVitals } from '../layout/SystemVitals';
import { HardwareTerminal } from '../layout/HardwareTerminal';
import { ProjectTimeline } from '../layout/ProjectTimeline';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WidgetRenderer: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  switch (widget.type) {
    case 'vitals':
      return <SystemVitals />;
    case 'terminal':
      return <HardwareTerminal />;
    case 'timeline':
      return <ProjectTimeline />;
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
    <div className="w-full h-full bg-[#050608] overflow-y-auto custom-scrollbar p-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={(currentLayout) => updateLayout(currentLayout)}
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
