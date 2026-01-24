# Implementation Plan: Customizable Dashboards (Control Room)

## 📋 Todo Checklist
- [ ] **Infrastructure: Dashboard Grid**
    - [x] Integrate `react-grid-layout`.
    - [x] Create `contexts/DashboardContext.tsx`.
    - [x] Define the `Widget` interface and registry.
- [ ] **UI: Widget Wrapper & Library**
    - [x] Create `components/dashboard/WidgetWrapper.tsx` (Chrome for widgets).
    - [x] Build `components/dashboard/WidgetLibrary.tsx` (The "Picker").
    - [ ] Create a "Dashboard View" layout that toggles with the main canvas.
- [ ] **Core Widgets: Initial Set**
    - [x] Port `HardwareTerminal` to a Widget.
    - [x] Port `SystemVitals` to a Widget.
    - [x] Create a `DiagramThumbnail` Widget.
    - [ ] Create an `AIChatMini` Widget.
- [ ] **Logic: Persistence & Layout**
    - [x] Implement `saveLayoutToLocal()` and `loadLayoutFromLocal()`.
    - [x] Add "Project-Specific" dashboard support.
- [ ] **Refinement: UX & Transitions**
    - [x] Implement "Edit Mode" (enables drag/resize).
    - [x] Add "AI Suggest Layout" button using Gemini.
    - [x] Smooth entrance/exit animations for widgets.

## Testing Strategy
- **Unit Tests:** Verify layout serialization/deserialization logic.
- **Visual Tests:** Playwright tests to ensure widgets don't overlap and resize handles work.
