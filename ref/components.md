# CircuitMind AI - Components Reference

## Component Structure

```
components/
├── diagram/                 # Diagram-specific components
│   ├── Diagram3DView.tsx   # Three.js 3D canvas (1833 LOC)
│   ├── DiagramNode.tsx     # Component nodes (820 LOC)
│   ├── componentShapes.ts  # SVG shape definitions (685 LOC)
│   ├── Wire.tsx            # Connection rendering
│   └── diagramState.ts     # State utilities
│
├── inventory/              # Inventory components
│   ├── InventoryItem.tsx   # Single item card
│   ├── InventoryList.tsx   # Item list container
│   └── inventoryUtils.ts   # Helper utilities
│
├── layout/                 # Layout components
│   ├── AppHeader.tsx       # Top header bar
│   ├── AppLayout.tsx       # Main wrapper
│   └── StatusRail.tsx      # Status indicator
│
├── DiagramCanvas.tsx       # 2D SVG diagram (1227 LOC)
├── ChatPanel.tsx           # AI chat interface (820 LOC)
├── ChatMessage.tsx         # Message renderer (472 LOC)
├── ComponentEditorModal.tsx # Component editor (1159 LOC)
├── Inventory.tsx           # Component library (987 LOC)
├── SettingsPanel.tsx       # Settings modal (876 LOC)
├── ThreeViewer.tsx         # 3D model viewer (469 LOC)
├── MainLayout.tsx          # Main app layout (487 LOC)
├── AssistantSidebar.tsx    # AI assistant sidebar
├── ConversationSwitcher.tsx # Conversation list
├── ErrorBoundary.tsx       # Error handling
└── IconButton.tsx          # Icon button component
```

---

## Diagram Components

### Diagram3DView.tsx (1833 LOC)

**Purpose**: Three.js canvas for 3D component visualization.

**Key Features**:
- Orbit controls with auto-rotation
- Ambient + directional lighting
- Component mesh rendering from AI-generated code
- Scene disposal on unmount

**Props**:
```typescript
interface Diagram3DVprops {
  diagram: WiringDiagram | null;
  selectedComponentId?: string;
  onComponentClick?: (id: string) => void;
}
```

### DiagramNode.tsx (820 LOC)

**Purpose**: Individual component node in 2D/3D diagram.

**Key Features**:
- Drag & drop positioning
- Pin visualization
- Selection/highlight states
- Context menu support

### DiagramCanvas.tsx (1227 LOC)

**Purpose**: SVG rendering of 2D wiring diagrams.

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

**Key Features**:
- Smart wire routing (Bezier + zig-zag fallback)
- Pan and zoom controls
- Component drag & drop
- Missing pin indicator (red pulsing dot)
- Search highlighting

**Props**:
```typescript
interface DiagramCanvasProps {
  diagram: WiringDiagram | null;
  onComponentSelect?: (id: string) => void;
  onComponentContextMenu?: (id: string, x: number, y: number) => void;
  onComponentDoubleClick?: (component: ElectronicComponent) => void;
  onDiagramUpdate?: (diagram: WiringDiagram) => void;
  onComponentDrop?: (component: ElectronicComponent, x: number, y: number) => void;
}
```

### Wire.tsx

**Purpose**: Connection wire rendering between components.

**Features**:
- Bezier curve paths
- Color-coded by signal type
- Highlight/pulse animations
- Arrow markers for direction

---

## Chat Components

### ChatPanel.tsx (820 LOC)

**Purpose**: Full chat interface with conversation management.

**Props**:
```typescript
interface ChatPanelProps {
  conversations: Conversation[];
  messages: EnhancedChatMessage[];
  onSendMessage: (content: string, options?: SendOptions) => void;
  onComponentClick?: (id: string) => void;
  onActionClick?: (action: ActionIntent) => void;
  context?: AIContext;
  generationMode: 'chat' | 'image' | 'video';
  onModeChange: (mode: GenerationMode) => void;
}
```

**Features**:
- Conversation switcher
- Mode toggle (chat/image/video)
- Deep thinking toggle
- File/image attachments
- Audio recording
- Suggested actions display
- Proactive suggestions

### ChatMessage.tsx (472 LOC)

**Purpose**: Individual message renderer.

**Handles**:
- Markdown rendering
- Component mention highlighting (clickable)
- Action button display
- Image/video attachment display
- Grounding source links
- System messages

---

## Editor Components

### ComponentEditorModal.tsx (1159 LOC)

**Purpose**: Multi-tab component editor with AI assistant.

**Tabs**:
1. **INFO** - AI-generated explanation, data sources
2. **EDIT** - Name, type, description, pins
3. **IMAGE** - Component photo/reference
4. **3D MODEL** - ThreeViewer + code generation

**AI Assistant Features**:
- Embedded chat sidebar
- Component-aware context
- Smart fill suggestions
- Pin recommendations

### ThreeViewer.tsx (469 LOC)

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

### Inventory.tsx (987 LOC)

**Purpose**: Slide-out component library sidebar.

**Features**:
- Search and filter
- Category grouping
- Bulk actions (delete, update)
- Drag & drop to canvas
- Low stock indicators
- Quick add button

**Z-Index**: 40 (above canvas, below modals)

### InventoryItem.tsx

**Purpose**: Single inventory item card.

**Displays**:
- Component name & type
- Quantity badge
- Stock status indicator
- Quick actions (edit, delete)

### InventoryList.tsx

**Purpose**: Virtualized list of inventory items.

**Features**:
- Lazy loading for large inventories
- Category headers
- Selection state

---

## Layout Components

### MainLayout.tsx (487 LOC)

**Purpose**: Main application layout orchestrator.

**Structure**:
```
┌─────────────────────────────────────────────┐
│              AppHeader                      │
├─────────┬─────────────────────┬────────────┤
│         │                     │            │
│ Inven-  │   DiagramCanvas     │ Assistant  │
│  tory   │        OR           │  Sidebar   │
│         │   Diagram3DView     │            │
│         │                     │            │
├─────────┴─────────────────────┴────────────┤
│              ChatPanel                      │
└─────────────────────────────────────────────┘
```

### AppHeader.tsx

**Purpose**: Top navigation bar.

**Contains**:
- Logo + title
- View mode toggle (2D/3D)
- Undo/redo buttons
- Settings button
- User profile

### StatusRail.tsx

**Purpose**: Vertical status indicator rail.

**Displays**:
- Connection status
- AI processing indicator
- Error/warning badges

---

## Settings Components

### SettingsPanel.tsx (876 LOC)

**Purpose**: Configuration modal.

**Tabs**:
1. **API KEY** - Gemini API key configuration
2. **AI AUTONOMY** - Action safety settings
3. **LAYOUT** - UI customization

**Key Behaviors**:
- API key saved to `localStorage.cm_gemini_api_key`
- 100ms delay before reload after key change (race condition fix)
- Action classification customization

---

## Utility Components

### ErrorBoundary.tsx

**Purpose**: Graceful error handling UI.

**Displays**:
- Error message
- Stack trace
- Reboot button (full page reload)
- Cyberpunk-themed error screen

### ConversationSwitcher.tsx

**Purpose**: Conversation list for sidebar navigation.

**Features**:
- Recent conversations list
- Create new conversation
- Delete with confirmation
- Inline rename
- Active highlight

### IconButton.tsx

**Purpose**: Reusable icon button with tooltip.

**Props**:
```typescript
interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
}
```

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
