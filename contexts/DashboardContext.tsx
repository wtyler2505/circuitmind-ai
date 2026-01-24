import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardWidget {
  id: string;
  type: string;
  layout: WidgetLayout;
  props?: any;
}

interface DashboardContextType {
  widgets: DashboardWidget[];
  isEditMode: boolean;
  setEditMode: (edit: boolean) => void;
  addWidget: (type: string) => void;
  removeWidget: (id: string) => void;
  updateLayout: (layout: WidgetLayout[]) => void;
  resetDashboard: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'vitals-1', type: 'vitals', layout: { i: 'vitals-1', x: 0, y: 0, w: 4, h: 2 } },
  { id: 'terminal-1', type: 'terminal', layout: { i: 'terminal-1', x: 4, y: 0, w: 8, h: 4 } }
];

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('cm_dashboard_widgets');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });
  const [isEditMode, setEditMode] = useState(false);

  const saveWidgets = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem('cm_dashboard_widgets', JSON.stringify(newWidgets));
  };

  const addWidget = useCallback((type: string) => {
    const id = `${type}-${Date.now()}`;
    const newWidget: DashboardWidget = {
      id,
      type,
      layout: { i: id, x: 0, y: Infinity, w: 4, h: 4 }
    };
    saveWidgets([...widgets, newWidget]);
  }, [widgets]);

  const removeWidget = useCallback((id: string) => {
    saveWidgets(widgets.filter(w => w.id !== id));
  }, [widgets]);

  const updateLayout = useCallback((layout: WidgetLayout[]) => {
    const nextWidgets = widgets.map(w => {
      const l = layout.find(l => l.i === w.id);
      return l ? { ...w, layout: l } : w;
    });
    saveWidgets(nextWidgets);
  }, [widgets]);

  const resetDashboard = useCallback(() => {
    saveWidgets(DEFAULT_WIDGETS);
  }, []);

  return (
    <DashboardContext.Provider value={{
      widgets,
      isEditMode,
      setEditMode,
      addWidget,
      removeWidget,
      updateLayout,
      resetDashboard
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
