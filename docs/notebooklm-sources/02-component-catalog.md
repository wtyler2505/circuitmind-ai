# 02 -- Component Catalog (Exhaustive)

> Every React component in CircuitMind AI, documented for NotebookLM ingestion.
> Generated 2026-02-08. Source: `/home/wtyler/circuitmind-ai/components/`

---

## Table of Contents

1. [Component Hierarchy Tree](#component-hierarchy-tree)
2. [Root-Level Components](#root-level-components)
3. [Diagram Components](#diagram-components)
4. [Layout Components](#layout-components)
5. [Inventory Components](#inventory-components)
6. [Dashboard Components](#dashboard-components)
7. [Auth Components](#auth-components)
8. [Settings Components](#settings-components)
9. [Lazy-Loaded Components](#lazy-loaded-components)
10. [SVG Rendering Internals](#svg-rendering-internals)
11. [Three.js Lifecycle](#threejs-lifecycle)

---

## Component Hierarchy Tree

```
App.tsx (17 context providers)
  Gatekeeper (auth gate -- z-1000)
  AppLayout (layout shell)
    AppHeader (role="banner", z-20)
      CollaboratorList
      ModeSelector
      BOMModal (conditional)
      SecurityReport (conditional)
      WidgetLibrary (conditional, in dropdown)
    Inventory (left sidebar)
      InventoryItem[] (memo'd, custom areEqual)
      BOMModal (conditional)
    AssistantSidebar (right sidebar, resizable 300-560px)
      AssistantContent (memo'd)
        AssistantTabs (7 tabs, resizable)
        ChatPanel
          ConversationSwitcher
          ChatMessage[] (memo'd, custom areEqual)
        BootcampPanel
        ProjectTimeline
        DebugWorkbench
        AnalyticsDashboard
        SystemLogViewer
    DiagramCanvas (main area)
      CanvasToolbar (zoom, search, filter, snap, export)
      SvgDefs (gradients, filters, markers)
      CanvasMinimap (memo'd)
      DiagramNode[] (memo'd)
        Pin[] (memo'd)
        TelemetryOverlay
        PinStatusDot
        FzpzVisual | BreadboardVisual | detail renderers
      Wire[] (memo'd)
        BezierWire
      PredictiveGhost
      CanvasOverlays (DropZone, EmptyDiagram, NoDiagram)
      ContextMenuOverlay (conditional)
      WireLabelEditor (conditional)
      Diagram3DView (lazy, conditional)
        ThreeViewer (lazy)
      TacticalHUD (Portal to document.body)
    DashboardView (conditional, when dashboard mode)
      WidgetWrapper[]
        SystemVitals | HardwareTerminal | ProjectTimeline
        OscilloscopeWidget | LogicAnalyzerWidget
        AnalogGauge | HeatmapWidget
    StatusRail (footer bar, z-20)
      SystemVitals
    SimControls (debug mode only)
    MentorOverlay (tutorial, z-40)
    OmniSearch (modal, z-500)
    CyberToast (notifications, z-300)
    ErrorBoundary (wraps assistant content)
  ComponentEditorModal (lazy, z-50)
  SettingsPanel (conditional, z-50)
    SyncPanel (sub-panel)
```

---

## Root-Level Components

### MainLayout
- **Path**: `components/MainLayout.tsx` (~608 LOC after refactor)
- **Props**: None (orchestrator, consumes contexts directly)
- **Contexts consumed**: LayoutContext, DiagramContext, InventoryContext, VoiceAssistantContext, AssistantStateContext, ConversationContext, UserContext, SelectionContext, TelemetryContext, HUDContext, DashboardContext
- **Internal state**: viewMode, contextMenu, editingComponent, searchOpen, assistantTab, proactiveSuggestions, isGenerating3D, explanation, diagram3DRef
- **Child components**: AppLayout, AppHeader, Inventory, AssistantSidebar, AssistantContent, DiagramCanvas, ComponentEditorModal (lazy), SettingsPanel, OmniSearch, SimControls, MentorOverlay, CyberToast, DashboardView
- **Event handlers**: handleSendMessage, handleComponentClick, handleActionClick, handleComponentEdit, handleDuplicate, handleDelete, handleGenerate3D, handleSearchSelect
- **Memoization**: React.memo on the component; extracted hooks (useMainLayoutActions, useEditorFormState, useEditorAIChat, useSearchIndex, useKeyboardShortcuts, useSecurityAudit, useCanvasExport, useGestureTracking)
- **CSS/Styling**: Tailwind utility classes, cyberpunk theme (panel-surface, cut-corner-*, neon-cyan/purple)
- **Accessibility**: Keyboard shortcuts (Ctrl+K for search, Ctrl+Z/Y for undo/redo), focus management
- **Notable logic**: Action dispatch hub via useAIActions; proactive suggestions from AI; dual persistence (localStorage + IndexedDB); 3D view ref forwarding via useImperativeHandle

### DiagramCanvas
- **Path**: `components/DiagramCanvas.tsx` (~313 LOC after refactor)
- **Props**: diagram, positions, onComponentClick, onContextMenu, onComponentEdit, onDuplicate, onDelete, onGenerate3D, viewMode, onViewModeToggle, searchOpen, diagram3DRef
- **Contexts consumed**: DiagramContext (via extracted hooks)
- **Internal state**: Managed via extracted hooks (useCanvasInteraction, useCanvasLayout, useCanvasWiring, useCanvasHighlights, useCanvasHUD)
- **Child components**: CanvasToolbar, SvgDefs, CanvasMinimap, DiagramNode[], Wire[], PredictiveGhost, CanvasOverlays, ContextMenuOverlay, WireLabelEditor, Diagram3DView, TacticalHUD
- **Event handlers**: onPointerDown (pan start), onPointerMove (pan/wire draw), onPointerUp (drop), onWheel (zoom), onDragOver/Drop (inventory DnD), onContextMenu, keyboard (Space to pan)
- **Memoization**: Component-level React.memo; heavy use of useMemo for filteredComponents, node positions, wire colors, diagram bounds
- **CSS/Styling**: SVG canvas with CSS grid background pattern; `canvas-grid` class for dot grid
- **Accessibility**: role="application" on canvas; individual nodes have role="button" with aria-labels; keyboard navigation (arrow keys for nudge)
- **Notable logic**: Coordinate transforms between screen and SVG space; snap-to-grid; minimap viewport tracking; drag-and-drop from inventory creates new components; wire drawing mode (pin-to-pin)

### Inventory
- **Path**: `components/Inventory.tsx` (~980 LOC)
- **Props**: None (sidebar, consumes contexts)
- **Contexts consumed**: InventoryContext, DiagramContext, LayoutContext
- **Internal state**: searchQuery, filterType, sortBy, selectedItems, isImporting, brokenImages, showBOMModal
- **Child components**: InventoryItem[], BOMModal
- **Event handlers**: handleAddToCanvas, handleEdit, handleRemove, handleDragStart, handleImport (FZPZ), handleBulkAction, handleSort, handleSearch
- **Memoization**: React.memo wrapper; filtered/sorted inventory via useMemo
- **CSS/Styling**: Tailwind, custom scrollbar, cut-corner-sm, panel-surface
- **Accessibility**: Search input with aria-label; items are keyboard navigable (Enter to add, Space to select, Delete to remove, E to edit)
- **Notable logic**: FZPZ file import via FzpzLoader service; drag-and-drop to canvas; bulk operations (select all, delete selected); broken image tracking

### ComponentEditorModal
- **Path**: `components/ComponentEditorModal.tsx` (~1320 LOC)
- **Props**: component, onSave, onClose, explanation, isGenerating3D, onGenerate3D
- **Contexts consumed**: None (pure modal)
- **Internal state**: Multi-tab form (details, pins, 3d, notes); formData mirrors component; AI chat state
- **Child components**: ThreeViewer (lazy), internal tab panels
- **Memoization**: None at component level
- **CSS/Styling**: Fixed overlay z-50, backdrop blur, panel-frame, cut-corner-md
- **Accessibility**: role="dialog", aria-modal="true", aria-labelledby, useFocusTrap, Escape to close
- **Notable logic**: Multi-tab editor (Details, Pins, 3D Preview, Notes); AI-assisted editing via useEditorAIChat; 3D model generation; pin management (add/remove/reorder); image URL input with preview

### ThreeViewer
- **Path**: `components/ThreeViewer.tsx` (~large, lazy-loaded)
- **Props**: code, isLoading, onError
- **Contexts consumed**: None
- **Internal state**: Three.js scene, camera, renderer, controls refs
- **Memoization**: React.memo
- **CSS/Styling**: Canvas fills container
- **Accessibility**: Canvas element with aria-label
- **Notable logic**: Executes AI-generated Three.js code in sandboxed scope; scene disposal on unmount/code change; OrbitControls for interaction; resize observer for responsive canvas; error boundary for malformed code

### SettingsPanel
- **Path**: `components/SettingsPanel.tsx` (~1000 LOC)
- **Props**: None (reads LayoutContext for open/close)
- **Contexts consumed**: LayoutContext, UserContext, AuthContext
- **Internal state**: activeTab (7 tabs: profile, ai, display, audio, keybinds, sync, about)
- **Child components**: SyncPanel, internal sub-panels
- **Memoization**: None
- **CSS/Styling**: Fixed overlay z-50, panel-frame, cut-corner-md
- **Accessibility**: useFocusTrap, role="dialog", aria-modal="true", Escape to close
- **Notable logic**: API key management; user persona selection; display preferences; audio settings; keybind configuration; initial tab can be set via setSettingsInitialTab

### ChatPanel
- **Path**: `components/ChatPanel.tsx` (~866 LOC)
- **Props**: ~30 properties covering conversations, messages, actions, context, suggestions, modes, deep thinking, voice input, image/video controls, headerActions
- **Contexts consumed**: useConnectivity (for online status)
- **Internal state**: inputValue, attachment (file), isDragging, showContextDetails, isQuickActionsOpen, isQuickActionsPinned, visibleCount
- **Child components**: ConversationSwitcher, ChatMessage[], QuickActions section
- **Event handlers**: handleSend, handleKeyDown (Enter/Shift+Enter), handleDrop (file upload), handleScroll (lazy loading)
- **Memoization**: Messages grouped by date via useMemo; lazy rendering (shows visibleCount messages, loads 20 more on scroll-to-top)
- **CSS/Styling**: Flex column layout, custom scrollbar, drag-and-drop overlay
- **Accessibility**: aria-label on input; keyboard submit (Enter); file drop zone
- **Notable logic**: QUICK_ACTIONS array (draft-wiring, check-pins, inventory-audit, layout-tidy); proactive suggestions from AI; generation mode selector (text/image/video); deep thinking toggle; recording controls for voice

### ChatMessage
- **Path**: `components/ChatMessage.tsx` (~507 LOC)
- **Props**: message (EnhancedChatMessage), onComponentClick, onActionClick, isStreaming, onFeedback
- **Memoization**: React.memo with custom comparison (compares message.id, content, isStreaming, executedActions.length)
- **Child sub-components**: MarkdownContent (memo'd), ComponentChips, ActionButtons, ExecutedActions, SourceLinks, DiagramPreview, MediaAttachment, StreamingIndicator, MessageFeedback
- **CSS/Styling**: Conditional styling for user vs assistant messages; code block syntax highlighting
- **Accessibility**: role on message container; aria-live for streaming
- **Notable logic**: ReactMarkdown with remarkGfm and remarkBreaks; inline component chips (clickable, link to inventory); action buttons (clickable, trigger AI actions); executed action status display; grounding source links; diagram preview rendering; media attachment display (image/video); feedback thumbs up/down

### ConversationSwitcher
- **Path**: `components/ConversationSwitcher.tsx` (~354 LOC)
- **Props**: conversations, activeConversationId, onSwitchConversation, onCreateConversation, onDeleteConversation, onRenameConversation
- **Internal state**: isOpen, editingId, editTitle
- **Event handlers**: handleStartEdit, handleSaveEdit, handleKeyDown, handleDelete
- **Memoization**: None
- **CSS/Styling**: Dropdown overlay, panel-surface, backdrop-blur-xl
- **Accessibility**: aria-expanded, aria-haspopup="listbox", role="listbox", role="option", aria-selected, aria-label; keyboard navigation (ArrowUp/Down, Enter, Space, Escape)
- **Notable logic**: Sort conversations (primary first, then by updatedAt); inline rename with input field; confirm before delete; outside click to close

### ErrorBoundary
- **Path**: `components/ErrorBoundary.tsx` (~119 LOC)
- **Props**: children
- **Internal state**: hasError, errorInfo (class component state)
- **Memoization**: N/A (class component)
- **CSS/Styling**: Full-screen error overlay with cyberpunk styling
- **Accessibility**: Error message displayed prominently
- **Notable logic**: getDerivedStateFromError + componentDidCatch; saves crash state to sessionStorage; three recovery options: Reboot (reload), Try Restore (reload with saved state), Safe Mode (clear all storage and reload)

### IconButton
- **Path**: `components/IconButton.tsx` (~59 LOC)
- **Props**: label (required, used as aria-label), icon, onClick, disabled, size, variant, className
- **Memoization**: React.memo + forwardRef
- **CSS/Styling**: Variants: primary, secondary, ghost, danger; Sizes: sm (32px min), md (44px min), lg (48px min); focus-visible-ring utility
- **Accessibility**: Enforced aria-label via required `label` prop; focus-visible ring
- **Notable logic**: Simple reusable button; displayName set for DevTools

### AssistantSidebar
- **Path**: `components/AssistantSidebar.tsx` (~146 LOC)
- **Props**: children
- **Contexts consumed**: LayoutContext (assistantOpen, assistantPinned, assistantWidth, setAssistantWidth, setAssistantOpen)
- **Internal state**: None (delegates to context)
- **Hooks**: useClickOutside, useResizeHandler, useHoverBehavior
- **CSS/Styling**: Absolute positioned, right-0, resizable width (300-560px), panel-surface, backdrop-blur
- **Accessibility**: Resize handle with role="separator", aria-valuenow, keyboard accessible (ArrowLeft/Right to resize, double-click to reset)
- **Notable logic**: Hover-to-open when unpinned; click-outside-to-close when unpinned; resize via drag handle; width persisted via context

---

## Diagram Components

### DiagramNode
- **Path**: `components/diagram/DiagramNode.tsx` (~1028 LOC)
- **Props**: component, position, isHovered, isSelected, highlight, onPointerDown, onSelect, onContextMenu, onDoubleClick, onPinPointerDown, onPinPointerUp, onMouseEnter, onMouseLeave, onPinEnter, onPinLeave, onNudge (14 event handler props)
- **Contexts consumed**: TelemetryContext (liveData), SimulationContext (result)
- **Internal state**: None (derived from props + contexts)
- **Child sub-components**: Pin (memo'd), TelemetryOverlay, PinStatusDot, detail renderers (MicrocontrollerDetails, ArduinoUnoDetails, SensorDetails, DHT11Details, LCD1602Details, BreadboardDetails, ActuatorDetails, PowerDetails, ResistorDetails, CapacitorDetails, GenericDetails), FzpzVisual, BreadboardVisual
- **Memoization**: memo() wrapper; Pin sub-component memo'd; all event handlers wrapped in useCallback; shape and pinPositions computed via useMemo
- **CSS/Styling**: SVG `<g>` with transform for position; glow effects for selection/hover/highlight; drop shadow for 3D depth; transition-colors
- **Accessibility**: tabIndex=0, role="button", aria-label with component name/type/selected/error state; keyboard: Enter/Space to select, Escape to blur, Arrow keys for nudge (Shift+Arrow for 10px)
- **Notable logic**: Smart pin color coding by function (VCC=red, GND=black, I2C=blue, SPI=purple, Serial=green/orange, Analog=teal); componentShapes registry for type-specific rendering; FZPZ footprint override for width/height; quantity badge; logic error detection from simulation state; pin positions calculated by calculatePinPositions with special handling for Arduino Uno, resistor, capacitor

### Wire
- **Path**: `components/diagram/Wire.tsx` (~109 LOC)
- **Props**: connection (WireConnection), index, startComponent, endComponent, startPos, endPos, highlight, onEditClick, onDelete
- **Memoization**: memo() wrapper
- **Child components**: BezierWire
- **CSS/Styling**: SVG `<g>`, cursor-pointer, hover opacity
- **Accessibility**: None (SVG path, no ARIA)
- **Notable logic**: Calculates wire start/end points from component positions and pin indices; pins on left/right based on relative positions; description label rendered at midpoint; context menu for delete; double-click for edit

### BezierWire
- **Path**: `components/diagram/wiring/BezierWire.tsx` (~93 LOC)
- **Props**: start, end, points (optional WirePoint[]), color, selected
- **Memoization**: None
- **CSS/Styling**: SVG path with drop-shadow filter; 3-layer rendering (selection highlight, core wire, insulation shine)
- **Notable logic**: calculateBezierPath function generates cubic Bezier for 2-point wires or linear segments for multi-point wires (TODO: Catmull-Rom spline); control points calculated from distance with 150px cap; Fritzing-style wire rendering with insulation shine overlay

### PredictiveGhost
- **Path**: `components/diagram/PredictiveGhost.tsx` (~119 LOC)
- **Props**: stagedActions (PredictiveAction[]), diagram, positions, zoom, onAccept, onReject
- **Memoization**: None
- **CSS/Styling**: SVG `<g>` with dashed stroke, opacity 0.6; accept/reject buttons with cyberpunk styling
- **Accessibility**: None
- **Notable logic**: Renders translucent AI-suggested connections; uses componentShapes for pin position calculations; Bezier curve rendering with dashed pattern; accept/reject UI per suggestion

### TacticalHUD
- **Path**: `components/diagram/TacticalHUD.tsx` (~114 LOC)
- **Props**: None (consumes HUDContext)
- **Contexts consumed**: HUDContext (fragments, isVisible, removeFragment)
- **Memoization**: None
- **CSS/Styling**: React Portal to document.body; fixed bottom-right; framer-motion animations; type-based coloring (warning=amber, tip=green, info=cyan)
- **Accessibility**: None (informational overlay)
- **Notable logic**: Uses createPortal to render outside the SVG canvas; spring animations for entry/exit; scanning line CSS effect; auto-dismiss via removeFragment

### ConflictResolver
- **Path**: `components/diagram/ConflictResolver.tsx` (~80 LOC)
- **Props**: local (WiringDiagram), remote (WiringDiagram), onResolve
- **Memoization**: None
- **CSS/Styling**: Fixed overlay, backdrop blur, panel-frame
- **Accessibility**: role="alertdialog", aria-modal="true", useFocusTrap
- **Notable logic**: Side-by-side comparison of local vs remote diagram state; "KEEP LOCAL" vs "ACCEPT REMOTE" resolution; displays component counts for each version

### Diagram3DView
- **Path**: `components/diagram/Diagram3DView.tsx` (~120 LOC visible, ~1950 LOC total)
- **Props**: diagram, positions, onComponentClick, onGenerate3D
- **Hooks**: useDiagram3DScene (scene setup, camera, renderer, OrbitControls), useDiagram3DSync (syncs diagram state to 3D scene), useDiagram3DTelemetry (real-time data visualization in 3D)
- **Memoization**: memo() wrapper
- **CSS/Styling**: Canvas fills container; Neural Link toggle; missing 3D models overlay
- **Accessibility**: None (3D canvas)
- **Notable logic**: useImperativeHandle exposes getSnapshotBlob for parent to capture screenshots; Neural Link toggle connects telemetry to 3D visualization; missing models list with generate buttons

### componentShapes.ts (non-component utility)
- **Path**: `components/diagram/componentShapes.ts` (~697 LOC)
- **Exports**: ComponentShape interface, PinDefinition interface, COMPONENT_SHAPES record, specific shapes (ARDUINO_UNO_SHAPE, RESISTOR_SHAPE, CAPACITOR_SHAPE, DHT11_SHAPE, LCD1602_SHAPE, BREADBOARD_SHAPE), ARDUINO_UNO_PINS layout, SVG_GRADIENTS array, SVG_FILTERS array, getComponentShape(), calculatePinPositions(), generateSVGDefs()
- **Notable logic**: Shape matching via SHAPE_MATCHERS array (pattern-based name matching); 8 SVG gradient definitions for realistic materials (Arduino PCB, copper, LCD screen, breadboard, etc.); 3 SVG filter definitions (drop shadows); special pin layout for Arduino Uno with all 30+ pins mapped to exact positions; 2-terminal handling for resistors and capacitors

### Canvas Sub-components

#### CanvasToolbar
- **Path**: `components/diagram/canvas/CanvasToolbar.tsx` (~212 LOC)
- **Props**: dispatch, searchQuery, onSearchChange, filterType, onFilterChange, snapToGrid, onSnapToggle, viewMode, onViewModeToggle, svgExportStatus, pngExportStatus, onExportSVG, onExportPNG, zoom
- **Memoization**: React.memo on CanvasToolbar and ExportButton sub-component
- **CSS/Styling**: Absolute positioned corners; control-tile class; cut-corner-sm
- **Accessibility**: aria-label on all buttons; aria-pressed for toggles; search input with aria-label; zoom level announced
- **Notable logic**: Zoom controls (+/-/reset with percentage display); search input for component filtering; type filter dropdown; snap-to-grid toggle; 2D/3D view toggle; SVG/PNG export with status feedback (idle/exporting/done/error)

#### CanvasMinimap
- **Path**: `components/diagram/canvas/CanvasMinimap.tsx` (~115 LOC)
- **Props**: filteredComponents, nodePositions, diagramBounds, pan, zoom, containerRect, showMinimap, onMinimapClick, onToggleMinimap
- **Memoization**: React.memo
- **CSS/Styling**: Absolute bottom-right; SVG miniature view; neon-cyan viewport indicator
- **Accessibility**: role="button", tabIndex=0, aria-label, keyboard accessible (Enter/Space)
- **Notable logic**: Color-coded component dots by type; viewport rectangle shows visible area; click to navigate; toggle show/hide

#### CanvasOverlays
- **Path**: `components/diagram/canvas/CanvasOverlays.tsx` (~66 LOC)
- **Exports**: DropZoneOverlay (memo'd), EmptyDiagramOverlay (memo'd), NoDiagramPlaceholder (forwardRef)
- **CSS/Styling**: Dashed border overlay for drop zone; instructional text for empty states
- **Accessibility**: pointer-events-none on overlays
- **Notable logic**: Three states: DropZoneOverlay (during drag), EmptyDiagramOverlay (diagram exists but empty), NoDiagramPlaceholder (no diagram loaded, accepts drops)

#### SvgDefs
- **Path**: `components/diagram/canvas/SvgDefs.tsx` (~48 LOC)
- **Props**: snapToGrid, uniqueColors
- **Memoization**: React.memo
- **Notable logic**: Renders SVG `<defs>` with grid patterns (10px minor, 100px major), all gradients from SVG_GRADIENTS, all filters from SVG_FILTERS, and arrow markers for each unique wire color

#### WireLabelEditor
- **Path**: `components/diagram/canvas/WireLabelEditor.tsx` (~63 LOC)
- **Props**: wireLabelInput, wireLabelPos, zoom, pan, dispatch, onSave
- **Memoization**: React.memo
- **CSS/Styling**: Absolute positioned at wire midpoint; panel styling
- **Accessibility**: autoFocus on input; Enter to save, Escape to cancel
- **Notable logic**: Positioned using zoom/pan transforms; dispatches UPDATE_WIRE_LABEL and CANCEL_EDIT_WIRE actions

#### resolveWireColor.ts
- **Path**: `components/diagram/canvas/resolveWireColor.ts`
- **Type**: Utility function (not a component)
- **Notable logic**: Resolves wire color from connection metadata

### Parts Sub-components

#### FzpzVisual
- **Path**: `components/diagram/parts/FzpzVisual.tsx` (~101 LOC)
- **Props**: component (ElectronicComponent)
- **Internal state**: svgContent, viewBox
- **Notable logic**: Loads SVG from FZPZ source file; tries cache first (partStorageService), falls back to FzpzLoader.load(); DOMPurify.sanitize for XSS prevention (FORBID_TAGS: script/style, FORBID_ATTR: onclick/onload/onerror/onmouseover); renders via dangerouslySetInnerHTML after sanitization; placeholder rect if no SVG loaded

#### BreadboardVisual
- **Path**: `components/diagram/parts/Breadboard.tsx` (~71 LOC)
- **Props**: component (ElectronicComponent)
- **Exports**: BreadboardVisual component, getBreadboardConnectivity utility
- **Notable logic**: If component has fzpzSource + footprint, renders from footprint data; otherwise renders procedural 830-point breadboard with power rails (red +, blue -), 30-column terminal strips (banks A-E and F-J), center divider

### 3D Sub-modules (non-component utilities)
- `components/diagram/3d/codeValidation.ts` -- Validates AI-generated Three.js code
- `components/diagram/3d/geometryFactories.ts` -- Creates Three.js geometries for components
- `components/diagram/3d/lodFactories.ts` -- Level-of-detail mesh factories
- `components/diagram/3d/materials.ts` -- Three.js material definitions
- `components/diagram/3d/pinCoordinates.ts` -- 3D pin position mapping
- `components/diagram/3d/wireUtils.ts` -- 3D wire rendering utilities

---

## Layout Components

### AppLayout
- **Path**: `components/layout/AppLayout.tsx` (~76 LOC)
- **Props**: inventory, assistant, header, statusRail, children (main canvas), modals (slot-based composition)
- **Contexts consumed**: LayoutContext (inventoryWidth, assistantWidth, inventoryPinned, assistantPinned, focusMode)
- **Memoization**: None
- **CSS/Styling**: CSS Grid layout; AnimatePresence for mode transitions with blur effect
- **Accessibility**: Semantic structure (header, main, aside slots)
- **Notable logic**: Dynamic grid column widths from context; focus mode collapses sidebars; smooth transitions via framer-motion

### AppHeader
- **Path**: `components/layout/AppHeader.tsx` (~296 LOC)
- **Props**: None
- **Contexts consumed**: DiagramContext, VoiceAssistantContext, LayoutContext, UserContext, DashboardContext
- **Internal state**: saveStatus, loadStatus, isBOMOpen, isSecurityOpen, isLibraryOpen, currentBranch, isCheckpointing
- **Child components**: CollaboratorList, ModeSelector, BOMModal, SecurityReport, WidgetLibrary
- **Event handlers**: handleCheckpoint (git commit via prompt), handleSave (quick slot), handleLoad (quick slot)
- **Memoization**: React.memo wrapper
- **CSS/Styling**: role="banner", h-10, panel-header, z-20; save/load buttons with multi-state styling (idle/saving/saved/error)
- **Accessibility**: Branch selector has aria-label; buttons have title attributes
- **Notable logic**: Git checkpoint via gitService.commit; branch selector (master/dev); save/load with feedback states; dashboard edit mode toggle; voice mode toggle; security audit button

### CollaboratorList
- **Path**: `components/layout/CollaboratorList.tsx` (~63 LOC)
- **Props**: None
- **Contexts consumed**: AuthContext (currentUser)
- **Internal state**: peers (PeerState[])
- **Notable logic**: Subscribes to collabService.getPresence() awareness; sets local presence with user name and color; renders peer avatars (first initial); invite button placeholder

### ModeSelector
- **Path**: `components/layout/ModeSelector.tsx` (~35 LOC)
- **Props**: None
- **Contexts consumed**: LayoutContext (activeMode, setActiveMode)
- **Notable logic**: Three modes: design (green), wiring (cyan), debug (amber); cut-corner-xs buttons with mode-specific accent colors

### OmniSearch
- **Path**: `components/layout/OmniSearch.tsx` (~113 LOC)
- **Props**: isOpen, onClose, onSelect (IndexedDocument)
- **Internal state**: query, results
- **Hooks**: useFocusTrap
- **Notable logic**: Uses searchIndexer.search() for full-text search; auto-focus input on open; Enter selects first result; Escape closes; category-based result icons (component vs wire); framer-motion entrance animation

### ProjectTimeline
- **Path**: `components/layout/ProjectTimeline.tsx` (~122 LOC)
- **Props**: None
- **Contexts consumed**: DiagramContext (updateDiagram, diagram)
- **Internal state**: history (GitLogEntry[]), isLoading
- **Notable logic**: Loads git history via gitService.log(); revert functionality via gitService.checkout() + readFile('diagram.json'); timeline UI with nodes, timestamps, commit messages; compare button (placeholder)

### SecurityReport
- **Path**: `components/layout/SecurityReport.tsx` (~89 LOC)
- **Props**: onClose
- **Contexts consumed**: DiagramContext (diagram)
- **Hooks**: useFocusTrap
- **Notable logic**: Runs securityAuditor.auditCircuitSafety(diagram); safety score = max(0, 100 - violations * 20); SVG circular progress indicator; violation cards with severity, type, message, remedy

### ContextMenuOverlay
- **Path**: `components/layout/ContextMenuOverlay.tsx` (~126 LOC)
- **Props**: contextMenu ({x, y, componentId}), diagram, onEdit, onDuplicate, onGenerate3D, onDelete, onClose
- **Notable logic**: Four actions: Edit, Duplicate, Generate 3D, Delete (red, separated by divider); positioned at click coordinates; looks up component from diagram by ID

### StatusRail
- **Path**: `components/layout/StatusRail.tsx` (~81 LOC)
- **Props**: None
- **Contexts consumed**: InventoryContext, DiagramContext, useConnectivity, LayoutContext (neuralLinkEnabled)
- **Child components**: SystemVitals
- **Notable logic**: Bottom status bar showing: SYSTEM ONLINE, ASSETS count, DIAG component/connection counts, PWR indicator, LINK (online/offline), NEURAL (neural link enabled), version number

### SystemVitals
- **Path**: `components/layout/SystemVitals.tsx` (~72 LOC)
- **Props**: None
- **Contexts consumed**: HealthContext (metrics)
- **Notable logic**: Displays FPS, Heap (MB), AI Link latency (MS); color-coded by status (healthy=green, warning=amber, critical=red); hover tooltip with detailed diagnostics

### SimControls
- **Path**: `components/layout/SimControls.tsx` (~68 LOC)
- **Props**: None
- **Contexts consumed**: SimulationContext (isSimulating, setSimulating, result), LayoutContext (activeMode)
- **Notable logic**: Only visible in DEBUG mode; toggle switch for simulation; shows logic state (NOMINAL/FAULT), sim load (node count), calc active indicator

### HardwareTerminal
- **Path**: `components/layout/HardwareTerminal.tsx` (~91 LOC)
- **Props**: None
- **Internal state**: logs (string[]), isConnected, autoScroll
- **Notable logic**: Simulated serial log output (2s interval when connected); auto-scroll behavior; clear button; connect/disconnect toggle; log buffer limited to 100 entries

### MentorOverlay
- **Path**: `components/layout/MentorOverlay.tsx` (~66 LOC)
- **Props**: None
- **Contexts consumed**: TutorialContext (activeQuest, currentStepIndex)
- **Notable logic**: Tutorial quest progress overlay; shows current step title, instructions, mentor tip; progress bar; framer-motion animations with mode="wait"

### CyberToast
- **Path**: `components/layout/CyberToast.tsx` (~69 LOC)
- **Props**: None
- **Contexts consumed**: NotificationContext (notifications, dismissNotification)
- **Notable logic**: Fixed bottom-left z-300; severity-based styling (info=cyan, success=green, warning=amber, critical=red with ping indicator); optional action button per notification; framer-motion enter/exit animations with 3D perspective (rotateX)

### AssistantContent
- **Path**: `components/layout/assistant/AssistantContent.tsx` (~170 LOC)
- **Props**: 20+ props covering assistantTab, conversationManager, all ChatPanel props, pin/expand/close controls
- **Memoization**: memo() wrapper
- **Child components**: AssistantTabs, ChatPanel, BootcampPanel, ProjectTimeline, DebugWorkbench, AnalyticsDashboard, SystemLogViewer (tab-based routing)
- **Notable logic**: Tab-based content switching (7 tabs); wraps content in ErrorBoundary; pin/close header actions

### AssistantTabs
- **Path**: `components/layout/assistant/AssistantTabs.tsx` (~193 LOC)
- **Props**: activeTab, onTabChange
- **Internal state**: tabWidths (persisted to localStorage), isResizing
- **Tab types**: chat, bootcamp, history, diagnostic, analytics, audit, logs
- **Notable logic**: 7 icon-based tabs with resizable widths (drag handle, 40-120px range); active tab indicator with framer-motion layoutId animation; tab widths persisted to localStorage.cm_assistant_tab_widths; mouse resize with window event listeners

### Other Layout Components (referenced but not full components):
- `BootcampPanel.tsx` -- Tutorial/learning panel
- `DebugWorkbench.tsx` -- Debug tools panel
- `AnalyticsDashboard.tsx` -- Analytics visualization panel
- `SystemLogViewer.tsx` -- System log viewer panel
- `CommsLog.tsx` -- Communications log

---

## Inventory Components

### InventoryItem
- **Path**: `components/inventory/InventoryItem.tsx` (~171 LOC)
- **Props**: item (ElectronicComponent), isSelected, onToggleSelection, onDragStart, onDoubleClick, onAddToCanvas, onEdit, onRemove, brokenImage, onImageError
- **Internal state**: cachedThumbnail (from partStorageService)
- **Memoization**: memo() with custom comparison (isSelected, item.id, item.quantity, brokenImage)
- **CSS/Styling**: Group hover for action buttons; cut-corner-sm; conditional selected state styling
- **Accessibility**: tabIndex=0; aria-label with name, quantity, stock status, selection state; keyboard: Enter=add to canvas, Space=toggle select, Delete/Backspace=remove, E=edit
- **Notable logic**: Loads cached thumbnail from partStorageService on mount; falls back to item.imageUrl; checkbox for multi-select; hover-revealed action buttons (add, edit, delete); draggable for DnD to canvas; low stock indicator; pin count badge

### BOMModal
- **Path**: `components/inventory/BOMModal.tsx` (~188 LOC)
- **Props**: onClose
- **Contexts consumed**: DiagramContext, InventoryContext, useToast
- **Hooks**: useFocusTrap
- **Internal state**: report (BOMReport), isEnriching
- **Notable logic**: Generates BOM via bomService.generateBOM(); AI enrichment via fetchPartDetails() (adds MPN, pricing); CSV export via Papa.unparse; PDF export via jsPDF with cyberpunk styling (neon cyan text, cyber black background); table with quantity, part name, MPN, stock status, unit price; total estimated cost

---

## Dashboard Components

### DashboardView
- **Path**: `components/dashboard/DashboardView.tsx` (~73 LOC)
- **Props**: None
- **Contexts consumed**: DashboardContext (widgets, updateLayout, isEditMode)
- **Child components**: WidgetWrapper[], WidgetRenderer (internal)
- **Notable logic**: Uses react-grid-layout (ResponsiveGridLayout with WidthProvider); responsive breakpoints (lg/md/sm/xs/xxs); draggable/resizable only in edit mode; WidgetRenderer maps widget type to component (vitals, terminal, timeline, oscilloscope, logic, gauge, heatmap)

### WidgetWrapper
- **Path**: `components/dashboard/WidgetWrapper.tsx` (~64 LOC)
- **Props**: id, title, children, className, style, onMouseDown, onMouseUp, onTouchEnd
- **Memoization**: forwardRef (for react-grid-layout)
- **Contexts consumed**: DashboardContext (isEditMode, removeWidget)
- **Notable logic**: Widget chrome with header (grab handle in edit mode), remove button in edit mode, edit overlay with dashed border

### WidgetLibrary
- **Path**: `components/dashboard/WidgetLibrary.tsx` (~36 LOC)
- **Props**: None
- **Contexts consumed**: DashboardContext (addWidget)
- **Notable logic**: 8 available widget types: vitals, terminal, bom, timeline, oscilloscope, logic, gauge, heatmap; click to add widget

### OscilloscopeWidget
- **Path**: `components/dashboard/OscilloscopeWidget.tsx` (~93 LOC)
- **Props**: streamId, color, min, max
- **Hooks**: useDataStream (from vizEngine)
- **Notable logic**: HTML5 Canvas rendering; grid lines; waveform via ctx.lineTo with glow effect (shadowBlur); snapshot capture (download as PNG); CRT scanline CSS effect overlay

### LogicAnalyzerWidget
- **Path**: `components/dashboard/LogicAnalyzerWidget.tsx` (~50 LOC)
- **Props**: streamId, label, color
- **Hooks**: useDataStream
- **Notable logic**: SVG rendering of digital logic waveform; HIGH/LOW state indicator; step transitions with vertical lines

### AnalogGauge
- **Path**: `components/dashboard/AnalogGauge.tsx` (~58 LOC)
- **Props**: value, min, max, label, unit, color
- **Notable logic**: SVG circular gauge with progress arc; strokeDasharray/strokeDashoffset for arc progress; value text in center

### HeatmapWidget
- **Path**: `components/dashboard/HeatmapWidget.tsx` (~61 LOC)
- **Props**: points (HeatmapPoint[]), width, height, colorRange
- **Notable logic**: CSS Grid-based 2D heatmap; color interpolation between two colors based on value; grid computed via useMemo

### Sparkline
- **Path**: `components/dashboard/Sparkline.tsx` (~44 LOC)
- **Props**: data (number[]), width, height, color, strokeWidth
- **Notable logic**: SVG polyline from data points; auto-scales to min/max; drop-shadow glow effect

---

## Auth Components

### Gatekeeper
- **Path**: `components/auth/Gatekeeper.tsx` (~112 LOC)
- **Props**: None
- **Contexts consumed**: AuthContext (isLocked, isSetup, login, setup)
- **Internal state**: pin, error, loading
- **CSS/Styling**: Fixed inset-0 z-1000; radial gradient background; framer-motion scale animation; cut-corner-md
- **Accessibility**: Hidden username field for password managers (autoComplete="username"); password input with autoComplete="current-password"/"new-password"; form submission via Enter
- **Notable logic**: Two modes: initial setup (create PIN) and login (enter PIN); PIN is numeric only (regex replace); minimum 4 digits; error state with red border glow; loading state during validation

---

## Settings Components

### SyncPanel
- **Path**: `components/settings/SyncPanel.tsx` (~166 LOC)
- **Props**: None
- **Internal state**: peers (PeerNode[]), newPeerIp, newPeerName, isSyncing
- **Notable logic**: Local identification with QR code (QRCodeSVG from qrcode.react); peer management (add/remove via peerDiscoveryService); push/pull sync via syncService; full-screen sync overlay during operation; device list with status indicators

---

## Lazy-Loaded Components

| Component | Chunk | Reason |
|-----------|-------|--------|
| ComponentEditorModal | `component-editor` | Large (~1320 LOC); only opened on edit action |
| ThreeViewer | `three-viewer` (vendor-three chunk) | Three.js dependency (~500KB); only needed for 3D preview |
| Diagram3DView | Part of diagram chunk | Heavy Three.js integration; only when 3D view toggled |

All lazy components use React.lazy() with Suspense fallbacks. The vendor-three chunk is the largest at ~500KB and is only loaded when a user explicitly enters 3D view or opens the component editor's 3D tab.

---

## SVG Rendering Internals

The diagram canvas uses a pure SVG rendering pipeline:

1. **Canvas Structure**: `<svg>` element with dynamic viewBox based on zoom/pan transforms
2. **Defs Layer** (SvgDefs): 8 gradient definitions (Arduino PCB, green PCB, chip black, metallic, copper, DHT11 blue, LCD screen, breadboard), 3 filter definitions (drop shadows), grid patterns (10px minor, 100px major), arrow markers per wire color
3. **Background**: Two `<rect>` elements with grid pattern fills (minor + major)
4. **Wire Layer**: Wire components render before nodes (painter's algorithm); each Wire calculates start/end from component positions + pin indices; BezierWire renders 3-layer path (selection glow, core wire, insulation shine)
5. **Node Layer**: DiagramNode renders per component; body path from componentShapes registry; detail renderers for realistic visuals (USB ports, chips, LEDs, pin headers); Pin sub-components with hit areas, labels, color coding
6. **Overlay Layer**: PredictiveGhost (AI suggestions), WireLabelEditor, ContextMenuOverlay
7. **HUD Layer**: TacticalHUD uses createPortal to escape SVG and render HTML fragments

**Coordinate System**: Origin at top-left; positive X right, positive Y down. Pan is additive offset; zoom is scale transform. Snap-to-grid quantizes to 10px increments.

**Pin Position Calculation**: `calculatePinPositions()` in componentShapes.ts handles 4 strategies:
- FZPZ footprint data (absolute positions from part file)
- Arduino Uno specific layout (30+ named pins at exact positions)
- 2-terminal components (resistor: left/right; capacitor: bottom pair)
- Standard left/right distribution (split pins evenly between sides)

---

## Three.js Lifecycle

The 3D rendering uses Three.js with extracted hooks for separation of concerns:

1. **Scene Setup** (`useDiagram3DScene`):
   - Creates Scene, PerspectiveCamera, WebGLRenderer
   - Adds OrbitControls for interaction
   - Ambient + directional lighting
   - Resize observer for responsive canvas
   - Animation loop via requestAnimationFrame
   - Cleanup: disposes renderer, controls, geometries, materials on unmount

2. **State Sync** (`useDiagram3DSync`):
   - Watches diagram state changes
   - Creates/updates/removes 3D meshes for components
   - Uses geometryFactories for component-specific shapes
   - Uses lodFactories for level-of-detail optimization
   - Positions meshes based on 2D node positions
   - Wire rendering via wireUtils (3D tube geometry)

3. **Telemetry** (`useDiagram3DTelemetry`):
   - When Neural Link enabled, subscribes to TelemetryContext
   - Visualizes real-time pin data as color changes on 3D models
   - Pulse animations for active pins
   - Error highlighting (red) for fault states

4. **Code Generation** (ThreeViewer):
   - AI generates Three.js code via Gemini
   - Code validated by codeValidation.ts (sandboxed execution)
   - Injected into a clean scope with Three.js globals
   - Scene disposal between code changes
   - Error boundary catches malformed code

5. **Snapshot** (Diagram3DView):
   - useImperativeHandle exposes getSnapshotBlob()
   - Renders current frame to canvas.toBlob()
   - Used by parent for 3D preview export
