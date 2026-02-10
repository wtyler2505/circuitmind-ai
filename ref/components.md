# CircuitMind AI - Components Reference

## Component Structure

```
components/
├── diagram/                     # Diagram-specific components
│   ├── 3d/                     # 3D rendering utilities
│   │   ├── codeValidation.ts   # Three.js code validation
│   │   ├── geometryFactories.ts # Geometry generators
│   │   ├── lodFactories.ts     # Level-of-detail factories
│   │   ├── materials.ts        # Material definitions
│   │   ├── pinCoordinates.ts   # Pin coordinate mapping
│   │   └── wireUtils.ts        # 3D wire utilities
│   │
│   ├── canvas/                 # 2D canvas components
│   │   ├── Canvas2DContent.tsx # Main 2D content renderer
│   │   ├── CanvasMinimap.tsx   # Minimap overlay
│   │   ├── CanvasOverlays.tsx  # Canvas UI overlays
│   │   ├── CanvasToolbar.tsx   # Canvas toolbar
│   │   ├── ExportDialog.tsx    # Export dialog
│   │   ├── resolveWireColor.ts # Wire color resolution
│   │   ├── SvgDefs.tsx         # SVG definitions (filters, markers)
│   │   └── WireLabelEditor.tsx # Wire label editing
│   │
│   ├── parts/                  # Part rendering
│   │   ├── Breadboard.tsx      # Breadboard visual
│   │   └── FzpzVisual.tsx      # FZPZ part rendering
│   │
│   ├── wiring/                 # Wire rendering
│   │   └── BezierWire.tsx      # Bezier/Catmull-Rom wire paths
│   │
│   ├── Diagram3DView.tsx       # Three.js 3D canvas (120 LOC)
│   ├── DiagramNode.tsx         # Component nodes (1055 LOC)
│   ├── componentShapes.ts      # SVG shape definitions (696 LOC)
│   ├── Wire.tsx                # Connection wire rendering
│   ├── diagramState.ts         # State utilities
│   ├── diagramUtils.ts         # Diagram helper utilities
│   ├── ConflictResolver.tsx    # Collaboration conflict resolution
│   ├── DiffOverlay.tsx         # Diagram diff visualization
│   ├── MismatchMarker.tsx      # Component mismatch indicator
│   ├── NeuralCursor.tsx        # AI-driven cursor
│   ├── PinTooltip.tsx          # Pin hover tooltip
│   ├── PredictiveGhost.tsx     # AI prediction ghost overlay
│   ├── RemoteCursor.tsx        # Remote collaborator cursor
│   ├── TacticalHUD.tsx         # Tactical heads-up display
│   └── index.ts                # Barrel exports
│
├── inventory/                  # Inventory components
│   ├── InventoryItem.tsx       # Single item card
│   ├── InventoryList.tsx       # Virtualized item list (VList)
│   ├── InventoryAddForm.tsx    # Add component form
│   ├── InventoryToolsPanel.tsx # Inventory tools panel
│   ├── BOMModal.tsx            # Bill of Materials modal
│   ├── MacroPanel.tsx          # Macro recording/playback panel
│   └── inventoryUtils.ts       # Helper utilities
│
├── inventory-mgmt/             # Advanced inventory management (server-backed)
│   ├── InventoryMgmtView.tsx   # Full management view
│   ├── InventoryBrowser.tsx    # Browse/search inventory
│   ├── InventoryDetail.tsx     # Component detail view
│   ├── CaptureWizard.tsx       # Component capture wizard
│   ├── FileUploadCapture.tsx   # File-based capture
│   ├── WebcamCapture.tsx       # Webcam-based capture
│   ├── VoiceRecorder.tsx       # Voice note recorder
│   ├── ReviewQueue.tsx         # Capture review queue
│   ├── LocationManager.tsx     # Storage location manager
│   ├── StockAdjuster.tsx       # Stock level adjuster
│   ├── ExportPanel.tsx         # Export panel (PDF/CSV/JSON)
│   └── SyncStatusBar.tsx       # Sync status indicator
│
├── layout/                     # Layout components
│   ├── assistant/              # Assistant sidebar
│   │   ├── AssistantContent.tsx # Assistant content renderer
│   │   └── AssistantTabs.tsx    # Tab switching for assistant
│   │
│   ├── AppHeader.tsx           # Top navigation bar
│   ├── AppLayout.tsx           # Main wrapper
│   ├── StatusRail.tsx          # Vertical status indicator
│   ├── OmniSearch.tsx          # Global search overlay
│   ├── SimControls.tsx         # Simulation control panel
│   ├── MentorOverlay.tsx       # Tutorial mentor overlay
│   ├── BootcampPanel.tsx       # Guided bootcamp panel
│   ├── ModeSelector.tsx        # Mode selection control
│   ├── ContextMenuOverlay.tsx  # Context menu
│   ├── CyberToast.tsx          # Cyberpunk toast notification
│   ├── HardwareTerminal.tsx    # Hardware serial terminal
│   ├── CommsLog.tsx            # Communications log
│   ├── CollaboratorList.tsx    # Collaboration participants
│   ├── SystemVitals.tsx        # System health vitals
│   ├── SystemLogViewer.tsx     # System log viewer
│   ├── DebugWorkbench.tsx      # Debug tools panel
│   ├── AnalyticsDashboard.tsx  # Analytics dashboard view
│   ├── ProjectTimeline.tsx     # Project timeline
│   └── SecurityReport.tsx      # Security audit report
│
├── dashboard/                  # Dashboard widgets
│   ├── DashboardView.tsx       # Dashboard container
│   ├── WidgetLibrary.tsx       # Widget catalog
│   ├── WidgetWrapper.tsx       # Widget frame wrapper
│   ├── OscilloscopeWidget.tsx  # Oscilloscope display
│   ├── LogicAnalyzerWidget.tsx # Logic analyzer display
│   ├── HeatmapWidget.tsx       # Heatmap visualization
│   ├── AnalogGauge.tsx         # Analog gauge display
│   └── Sparkline.tsx           # Sparkline chart
│
├── auth/                       # Authentication components
│   ├── Gatekeeper.tsx          # Auth gate component
│   └── PermissionGuard.tsx     # Permission-based guard
│
├── settings/                   # Settings sub-panels
│   ├── ConfigPortal.tsx        # General configuration
│   ├── DeveloperPortal.tsx     # Developer tools
│   ├── DiagnosticsView.tsx     # System diagnostics
│   ├── LocalizationSettings.tsx # Language/locale settings
│   ├── PartsManager.tsx        # Parts library management
│   ├── ProfileSettings.tsx     # User profile settings
│   └── SyncPanel.tsx           # Sync configuration
│
├── collab/                     # Collaboration components
│   ├── CollaboratorList.tsx    # Collaborator list
│   └── PeerRoutingService.ts   # Peer routing logic
│
├── timeline/                   # Timeline components
│   ├── CircuitDiffOverlay.tsx  # Circuit diff overlay
│   └── ProjectTimeline.tsx     # Project timeline view
│
├── __tests__/                  # Component tests
│
├── DiagramCanvas.tsx           # 2D SVG diagram (388 LOC)
├── ChatPanel.tsx               # AI chat interface (865 LOC)
├── ChatMessage.tsx             # Message renderer (506 LOC)
├── ComponentEditorModal.tsx    # Component editor (650 LOC, lazy-loaded)
├── Inventory.tsx               # Component library (554 LOC)
├── SettingsPanel.tsx           # Settings modal (1060 LOC)
├── ThreeViewer.tsx             # 3D model viewer (350 LOC, lazy-loaded)
├── MainLayout.tsx              # Main app layout (421 LOC)
├── AssistantSidebar.tsx        # AI assistant sidebar
├── ConversationSwitcher.tsx    # Conversation list
├── ErrorBoundary.tsx           # Error handling
└── IconButton.tsx              # Reusable icon button
```

---

## Diagram Components

### DiagramCanvas.tsx (388 LOC)

**Purpose**: SVG rendering of 2D wiring diagrams. Orchestrates canvas using 6 extracted hooks.

**Exposed Ref API** (`DiagramCanvasRef`):
```typescript
interface DiagramCanvasRef {
  highlightComponent(id: string, options?: HighlightOptions): void;
  highlightWire(index: number, options?: HighlightOptions): void;
  clearHighlight(id: string): void;
  clearWireHighlight(index: number): void;
  centerOnComponent(id: string, zoom?: number): void;
  setZoom(level: number): void;
  getZoom(): number;
  setPan(x: number, y: number): void;
  getPan(): { x: number; y: number };
  resetView(): void;
  setComponentPosition(id: string, x: number, y: number): void;
  getComponentPosition(id: string): { x: number; y: number } | undefined;
  getAllComponentPositions(): Map<string, { x: number; y: number }>;
}
```

**Canvas Sub-Components** (extracted to `diagram/canvas/`):
- `Canvas2DContent.tsx` -- main SVG content renderer
- `CanvasMinimap.tsx` -- minimap overview
- `CanvasOverlays.tsx` -- overlay UI elements
- `CanvasToolbar.tsx` -- toolbar controls
- `ExportDialog.tsx` -- export options dialog
- `SvgDefs.tsx` -- SVG filter and marker definitions
- `WireLabelEditor.tsx` -- inline wire label editing
- `resolveWireColor.ts` -- wire color resolution logic

### Diagram3DView.tsx (120 LOC)

**Purpose**: Three.js canvas for 3D component visualization. Wrapper that loads ThreeViewer.

### DiagramNode.tsx (1055 LOC)

**Purpose**: Individual component node in the 2D diagram.

**Key Features**:
- Drag & drop positioning
- Pin visualization with tooltips (`PinTooltip.tsx`)
- Selection/highlight states
- Context menu support
- SVG shape rendering from `componentShapes.ts` (696 LOC, 40+ shape definitions)

### Wire.tsx

**Purpose**: Connection wire rendering between components.

**Features**:
- Bezier curve paths (extended by `wiring/BezierWire.tsx` for Catmull-Rom splines)
- Color-coded by signal type (via `canvas/resolveWireColor.ts`)
- Highlight/pulse animations
- Arrow markers for direction

### Diagram Overlay Components

| Component | Purpose |
|-----------|---------|
| `PredictiveGhost.tsx` | AI prediction ghost overlay showing suggested placements |
| `NeuralCursor.tsx` | AI-driven cursor feedback |
| `TacticalHUD.tsx` | Tactical heads-up display with circuit info |
| `DiffOverlay.tsx` | Diagram diff visualization for version comparison |
| `ConflictResolver.tsx` | Collaboration conflict resolution UI |
| `MismatchMarker.tsx` | Marks mismatches between inventory and diagram |
| `RemoteCursor.tsx` | Remote collaborator cursor display |

### 3D Utilities (diagram/3d/)

| File | Purpose |
|------|---------|
| `codeValidation.ts` | Validates AI-generated Three.js code |
| `geometryFactories.ts` | Factory functions for 3D geometries |
| `lodFactories.ts` | Level-of-detail mesh factories |
| `materials.ts` | Material definitions for 3D rendering |
| `pinCoordinates.ts` | Pin coordinate mapping for 3D layout |
| `wireUtils.ts` | 3D wire rendering utilities |

### Part Renderers (diagram/parts/)

| Component | Purpose |
|-----------|---------|
| `Breadboard.tsx` | Breadboard visual rendering |
| `FzpzVisual.tsx` | Renders Fritzing (.fzpz) part visuals from SVG data |

---

## Chat Components

### ChatPanel.tsx (865 LOC)

**Purpose**: Full chat interface with conversation management.

**Features**:
- Conversation switcher
- Mode toggle (chat/image/video)
- Deep thinking toggle
- File/image attachments
- Audio recording
- Suggested actions display
- Proactive suggestions

### ChatMessage.tsx (506 LOC)

**Purpose**: Individual message renderer (wrapped in `React.memo`).

**Handles**:
- Markdown rendering
- Component mention highlighting (clickable)
- Action button display
- Image/video attachment display
- Grounding source links
- System messages
- Deep thinking content display

---

## Editor Components

### ComponentEditorModal.tsx (650 LOC, lazy-loaded)

**Purpose**: Multi-tab component editor with AI assistant.

**Tabs**:
1. **INFO** -- AI-generated explanation, data sources
2. **EDIT** -- Name, type, description, pins
3. **IMAGE** -- Component photo/reference
4. **3D MODEL** -- ThreeViewer + code generation

### ThreeViewer.tsx (350 LOC, lazy-loaded)

**Purpose**: Three.js canvas for 3D model preview.

**Code Execution Pattern**:
```typescript
// AI-generated code executed via new Function, NOT eval
const meshFn = new Function('THREE', 'Primitives', code);
const mesh = meshFn(THREE, Primitives);
scene.add(mesh);
```

**Features**:
- Orbit controls
- Auto-rotation toggle
- Screenshot export
- Fullscreen mode

---

## Inventory Components

### Inventory.tsx (554 LOC)

**Purpose**: Slide-out component library sidebar.

**Features**:
- Search and filter
- Category grouping
- Bulk actions (delete, update)
- Drag & drop to canvas
- Low stock indicators
- Quick add via `InventoryAddForm.tsx`
- BOM generation via `BOMModal.tsx`
- Macro recording via `MacroPanel.tsx`

**Z-Index**: 40 (above canvas, below modals)

### Inventory Management (inventory-mgmt/)

Full-stack inventory management view connected to the Express backend.

| Component | Purpose |
|-----------|---------|
| `InventoryMgmtView.tsx` | Root view container |
| `InventoryBrowser.tsx` | Browse/search with server-backed catalog |
| `InventoryDetail.tsx` | Component detail panel |
| `CaptureWizard.tsx` | Multi-step component capture (photo, voice, file) |
| `WebcamCapture.tsx` | Webcam-based component identification |
| `FileUploadCapture.tsx` | File upload for identification |
| `VoiceRecorder.tsx` | Voice note recording |
| `ReviewQueue.tsx` | Review captured components before saving |
| `LocationManager.tsx` | Physical storage location management |
| `StockAdjuster.tsx` | Stock level adjustments |
| `ExportPanel.tsx` | Export to PDF/CSV/JSON |
| `SyncStatusBar.tsx` | Client-server sync indicator |

---

## Layout Components

### MainLayout.tsx (421 LOC)

**Purpose**: Main application layout orchestrator.

**Structure**:
```
+---------------------------------------------+
|              AppHeader                      |
+---------+---------------------+-------------+
|         |                     |             |
| Inven-  |   DiagramCanvas     |  Assistant  |
|  tory   |        OR           |  Sidebar    |
|         |   DashboardView     |             |
|         |   InventoryMgmtView |             |
+---------+---------------------+-------------+
|              ChatPanel                      |
+---------------------------------------------+
```

**Views**: `canvas` | `dashboard` | `inventory-mgmt`

### Layout Sub-Components

| Component | Purpose |
|-----------|---------|
| `AppHeader.tsx` | Top navigation bar with logo, mode toggle, undo/redo, settings |
| `AppLayout.tsx` | Main wrapper layout |
| `StatusRail.tsx` | Vertical status indicator rail |
| `OmniSearch.tsx` | Global search overlay (Cmd+K) |
| `SimControls.tsx` | Simulation control panel |
| `MentorOverlay.tsx` | Tutorial mentor overlay |
| `BootcampPanel.tsx` | Guided bootcamp panel |
| `ModeSelector.tsx` | Mode selection control |
| `ContextMenuOverlay.tsx` | Right-click context menu |
| `CyberToast.tsx` | Cyberpunk-themed toast notification |
| `HardwareTerminal.tsx` | Hardware serial terminal |
| `CommsLog.tsx` | Communications log |
| `CollaboratorList.tsx` | Collaboration participants list |
| `SystemVitals.tsx` | System health vitals display |
| `SystemLogViewer.tsx` | System log viewer |
| `DebugWorkbench.tsx` | Debug tools panel |
| `AnalyticsDashboard.tsx` | Analytics dashboard view |
| `ProjectTimeline.tsx` | Project timeline |
| `SecurityReport.tsx` | Security audit report |

### Assistant Sidebar (layout/assistant/)

| Component | Purpose |
|-----------|---------|
| `AssistantContent.tsx` | Assistant panel content renderer |
| `AssistantTabs.tsx` | Tab switching (chat, suggestions, actions) |

---

## Dashboard Components

### DashboardView.tsx

**Purpose**: Widget-based dashboard using `react-grid-layout`.

| Widget | Purpose |
|--------|---------|
| `OscilloscopeWidget.tsx` | Oscilloscope waveform display |
| `LogicAnalyzerWidget.tsx` | Logic analyzer timing display |
| `HeatmapWidget.tsx` | Heatmap visualization |
| `AnalogGauge.tsx` | Analog gauge display |
| `Sparkline.tsx` | Sparkline chart |
| `WidgetLibrary.tsx` | Widget catalog for adding widgets |
| `WidgetWrapper.tsx` | Common widget frame wrapper |

---

## Settings Components

### SettingsPanel.tsx (1060 LOC)

**Purpose**: Configuration modal with 7 sub-panels.

**Tabs**: API Key, AI Autonomy, Layout, Profile, Localization, Sync, Developer

**Sub-Panels** (in `settings/`):

| Component | Purpose |
|-----------|---------|
| `ConfigPortal.tsx` | General configuration |
| `DeveloperPortal.tsx` | Developer tools and debug options |
| `DiagnosticsView.tsx` | System diagnostics |
| `LocalizationSettings.tsx` | Language and locale settings |
| `PartsManager.tsx` | Parts library management |
| `ProfileSettings.tsx` | User profile settings |
| `SyncPanel.tsx` | Sync configuration |

---

## Auth Components

| Component | Purpose |
|-----------|---------|
| `Gatekeeper.tsx` | Authentication gate -- blocks UI until authenticated |
| `PermissionGuard.tsx` | Permission-based access control guard |

---

## Collaboration Components

| Component | Purpose |
|-----------|---------|
| `collab/CollaboratorList.tsx` | Collaborator list for P2P sessions |
| `collab/PeerRoutingService.ts` | Peer routing logic for WebRTC |

---

## Timeline Components

| Component | Purpose |
|-----------|---------|
| `timeline/CircuitDiffOverlay.tsx` | Visual diff overlay for circuit versions |
| `timeline/ProjectTimeline.tsx` | Project timeline visualization |

---

## Utility Components

### ErrorBoundary.tsx

**Purpose**: Graceful error handling UI with cyberpunk-themed error screen.

### ConversationSwitcher.tsx

**Purpose**: Conversation list for sidebar navigation. Supports create, delete, rename, and active highlight.

### IconButton.tsx

**Purpose**: Reusable icon button with tooltip support.

---

## Component Patterns

### Ref Forwarding

Major components expose imperative APIs via refs:

```typescript
// DiagramCanvas
const canvasRef = useRef<DiagramCanvasRef>(null);
canvasRef.current?.highlightComponent('comp-1', { color: 'cyan', pulse: true });
canvasRef.current?.centerOnComponent('comp-1', 1.5);
```

### Props Drilling vs Context

| Data | Approach |
|------|----------|
| Diagram state | DiagramContext |
| Inventory | InventoryContext |
| Layout | LayoutContext |
| Component-specific | Props |
| Event handlers | Props |

### Z-Index Stacking

| Layer | Z-Index | Components |
|-------|---------|------------|
| Canvas | z-0 | DiagramCanvas, Diagram3DView |
| Header | z-10 | AppHeader |
| Chat | z-20 | ChatPanel |
| Inventory | z-40 | Inventory |
| Modals | z-50 | ComponentEditorModal, SettingsPanel |
