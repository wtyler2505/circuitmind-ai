// Hardcoded "Meta-Knowledge" for the AI to understand the app itself
export const DOCS_BUNDLE = [
  {
    title: 'Component Reference',
    content: `
# DiagramCanvas
Interactive SVG renderer. 
- Auto-Layout: MCUs center, Power left, Sensors right.
- Smart Routing: Cubic Bezier curves.
- Pin Matching: Maps connections to component pins.
- Pan/Zoom: SVG transform matrix.
- Wire Editing: Click wire to rename.

# Inventory
Sidebar manager. Search filtering.

# ThreeViewer
Wrapper around Three.js.
- Security: Gates code execution behind "RUN 3D CODE" button.
- Fallback: ErrorBoundary prevents crashes.

# ComponentEditorModal
- INFO tab: Description and AI explanation.
- EDIT tab: Manual form + AI Auto-Fill (Google Search).
- IMAGE tab: Upload or AI Generate (Gemini Image).
- 3D MODEL tab: AI Code Gen for Three.js.
`
  },
  {
    title: 'Architecture & State',
    content: `
# Global State (App.tsx)
Centralized state, no Redux.
- Inventory: localStorage.cm_inventory.
- History: Undo/Redo stack for WiringDiagram.
- Mode: 'chat', 'image', 'video'.
- Live Session: useRef for WebSocket.

# Layout
Z-Index: Canvas(0) < Header(10) < Chat(20) < Inventory(40) < Modals(50).

# File Upload
Images -> Vision models.
Videos -> Multimodal.
Audio -> Whisper-like endpoint.
`
  },
  {
    title: 'Shortcuts',
    content: `
- Ctrl/Cmd + 0: Reset View.
- + / =: Zoom In.
- -: Zoom Out.
- Space + Drag: Pan (or just drag background).
- Delete/Backspace: Remove selected wire (if implemented).
`
  }
];

export const knowledgeService = {
  search: (query: string): string => {
    const lowerQuery = query.toLowerCase();
    const results = DOCS_BUNDLE.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) || 
      doc.content.toLowerCase().includes(lowerQuery)
    );
    
    if (results.length === 0) return "";
    
    return results.map(r => `## ${r.title}\n${r.content}`).join('\n\n');
  },
  
  getAllKnowledge: (): string => {
    return DOCS_BUNDLE.map(r => `## ${r.title}\n${r.content}`).join('\n\n');
  }
};
