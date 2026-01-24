# Spec: Customizable Dashboards (Control Room)

## Goal
Empower users to build a tailored engineering workspace by arranging functional UI components (widgets) in a flexible, drag-and-drop grid.

## Background
Different engineering tasks require different data visibility. A firmware developer needs the terminal and vitals; a hardware designer needs the 3D viewer and BOM. Dashboards allow users to create the perfect "HUD" for their current task.

## Architecture
- **Grid Engine:** Uses `react-grid-layout` for the responsive, Draggable/Resizable grid.
- **Component Portability:** Existing panels will be refactored into "Widgets" that can live either in a sidebar or on the dashboard grid.
- **State Serialization:** Layout positions (`x`, `y`, `w`, `h`) are stored as JSON in the User Profile or Project metadata.

## Data Model
```typescript
interface DashboardWidget {
  id: string;
  type: string; // Component name
  layout: { x: number; y: number; w: number; h: number };
  props?: Record<string, any>;
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
}
```

## Security & Privacy
- Dashboard configurations are stored entirely locally.
- No interaction data from widgets is sent to external servers beyond existing AI tool calls.
