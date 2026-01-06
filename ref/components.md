# CircuitMind AI - Components Reference

## DiagramCanvas.tsx

**Purpose**: SVG rendering of wiring diagrams with interactive features.

**Key Features**:
- Smart wire routing (Bezier curves with zig-zag fallback)
- Component drag & drop positioning
- Pan and zoom controls
- Highlighting and selection

**Exposed Ref API** (`DiagramCanvasRef`):
```typescript
interface DiagramCanvasRef {
  highlightComponent(id: string, options?: HighlightOptions): void;
  highlightWire(index: number, options?: HighlightOptions): void;
  centerOnComponent(id: string, zoom?: number): void;
  setZoom(level: number): void;
  resetView(): void;
  setComponentPosition(id: string, x: number, y: number): void;
}
```

**Missing Pin Indicator**: When AI hallucinates a pin that doesn't exist, renders red pulsing dot at component bottom.

---

## ChatPanel.tsx

**Purpose**: Full chat interface with conversation management.

**Props**:
- `conversations` - List of conversation metadata
- `messages` - Current conversation messages
- `onSendMessage` - Handler for new messages
- `onComponentClick` - Handler for component mentions
- `onActionClick` - Handler for action buttons
- `context` - AI context for proactive suggestions
- `generationMode` - chat/image/video toggle

**Features**:
- Conversation switcher
- Mode toggle (chat/image/video)
- Deep thinking toggle
- File attachments
- Audio recording
- Suggested actions display
- Proactive suggestions

---

## ChatMessage.tsx

**Purpose**: Individual message renderer.

**Handles**:
- Markdown rendering
- Component mention highlighting (clickable)
- Action button display
- Image/video attachment display
- Grounding source links
- System messages

---

## ComponentEditorModal.tsx

**Purpose**: Multi-tab component editor with AI assistant.

**Tabs**:
1. **Details** - Name, type, description
2. **Pins** - Pin list editor
3. **3D Model** - ThreeViewer preview + generation
4. **Datasheet** - External documentation link

**AI Chat Sidebar**:
- Embedded AI assistant
- Component-aware context
- Smart fill suggestions

---

## Inventory.tsx

**Purpose**: Slide-out component library sidebar.

**Features**:
- Search and filter
- Bulk actions (delete, update)
- Drag & drop to canvas
- Category grouping
- Low stock indicators
- Quick add button

**Z-Index**: 40 (above canvas, below modals)

---

## SettingsPanel.tsx

**Purpose**: Configuration modal.

**Sections**:
- API Key configuration
- AI Autonomy settings
- Action safety customization

**API Key Persistence**:
- Saves to `localStorage.cm_gemini_api_key`
- 100ms delay before reload to ensure write completes

---

## ThreeViewer.tsx

**Purpose**: Three.js canvas for 3D component visualization.

**Code Execution Pattern**:
```typescript
// AI-generated code is executed via new Function, NOT eval
const meshFn = new Function('THREE', code);
const mesh = meshFn(THREE);
scene.add(mesh);
```

**Features**:
- Orbit controls
- Ambient + directional lighting
- Auto-rotation option
- Screenshot export

---

## ErrorBoundary.tsx

**Purpose**: Graceful error handling UI.

**Displays**:
- Error message
- Stack trace
- Reboot button (full page reload)
- Cyberpunk-themed error screen

---

## ConversationSwitcher.tsx

**Purpose**: Conversation list for sidebar navigation.

**Features**:
- Recent conversations list
- Create new conversation
- Delete conversation (with confirmation)
- Rename conversation (inline edit)
- Active conversation highlight
