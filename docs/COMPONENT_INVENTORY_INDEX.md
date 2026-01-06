# Component Inventory Index

A quick map of core UI components and where to change them.

## App Shell
- `App.tsx` — main layout, toolbar, status rail, and canvas wiring.
- `index.css` — global styling, panel system, background, glass surfaces.

## Sidebars
- Left Inventory: `components/Inventory.tsx`
- Right Assistant: `components/AssistantSidebar.tsx`
- Chat Panel: `components/ChatPanel.tsx`
- Conversation Switcher: `components/ConversationSwitcher.tsx`

## Canvas
- `components/DiagramCanvas.tsx` — wiring diagram canvas, overlays, minimap, zoom/reset.
- `components/diagram/*` — SVG nodes, wires, gradients.

## Modals
- Component Editor: `components/ComponentEditorModal.tsx`
- Settings: `components/SettingsPanel.tsx`
- 3D Viewer: `components/ThreeViewer.tsx`

## Hooks + State
- `hooks/useConversations.ts` — chat data + persistence.
- `hooks/useAIActions.ts` — AI action dispatch.

## Services
- `services/geminiService.ts` — Gemini integration.
- `services/aiContextBuilder.ts` — context prompt building.

## Docs
- `docs/screenshots/UI_AUDIT_REPORT.md` — UI audit findings and deep focus log.
- `docs/UI_STYLE_GUIDE.md` — visual rules.
- `docs/UI_TOKENS_REFERENCE.md` — token map.
