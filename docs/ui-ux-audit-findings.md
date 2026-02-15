# CircuitMind AI — Exhaustive UI/UX Audit Findings

Complete audit of every user-facing component, interaction, and visual element. Findings range from one-line fixes to strategic redesign opportunities. Severity uses: **Critical** (blocks workflows), **Major** (significant friction), **Minor** (polish/papercut), **Enhancement** (improvement opportunity). Effort uses: **S** (< 1 hr), **M** (1–4 hr), **L** (4+ hr).

---

## 1. Global Design System & Theme

### 1.1 Style Guide Violations — Corner System

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | M | The style guide (`docs/04-process/ui-style-guide.md`) mandates `cut-corner-sm/md` and **no rounded corners**, but ~46 files use `rounded-sm`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`. Most egregious: `InventoryMgmtView`, `InventoryBrowser`, `PartsManager`, `QuestDashboard`, `QuestCard`, `QuestCompletionModal`, `TutorialOverlay`, `CollaboratorList`, `CaptureWizard`. These create a jarring split personality between cyberpunk cut-corner panels and generic rounded elements. |
| Minor | S | `ProfileSettings.tsx` uses `rounded-lg` and `rounded` on inputs/buttons but the adjacent `LocalizationSettings` uses `cut-corner-sm`. Same settings panel, two visual languages. |

### 1.2 Typography Scale — Micro-Text Overuse

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | L | **370 instances** of `text-[7px]`, `text-[8px]`, `text-[9px]`, `text-[10px]` across 66 files. These sub-11px sizes are below WCAG AA minimum for readable body text (especially on non-retina displays). Worst offenders: `ComponentEditorModal` (26), `ChatPanel` (18), `SimControls` (18), `InventoryDetail` (14), `AppHeader` (11), `SystemVitals` (11). |
| Minor | S | No consistent type scale. Labels jump between `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]` without pattern. Should define 3–4 named sizes (e.g., `text-ui-xs`, `text-ui-sm`, `text-ui-base`). |

### 1.3 Color & Contrast

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | M | `text-slate-500` on `bg-cyber-dark` (#050508) fails WCAG AA contrast in many label contexts. Particularly: panel subtitles in `BootcampPanel`, `DebugWorkbench`, `AnalyticsDashboard`, `SystemLogViewer`, `CommsLog`. |
| Minor | S | Inconsistent use of accent colors for similar concepts: `neon-cyan` is used for both "AI/assistant" accent AND "primary action" accent AND "system health good" — too many semantic roles for one color. |

### 1.4 Animation Audit

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | M | 81 instances of `animate-pulse`, `animate-spin`, `animate-bounce` across 38 files. Several are purely decorative and run continuously (e.g., the "REC" badge in `DebugWorkbench`, loading indicators that persist). These consume GPU cycles and may trigger motion-sensitivity issues. No `prefers-reduced-motion` override on custom CSS animations in `index.css`. |
| Minor | S | `HardwareTerminal` simulated logs use `setInterval` every 2s even when the terminal is scrolled out of view. Should pause when not visible. |

### 1.5 Empty `alt` Attributes

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | 18 images across 6 files use `alt=""` (decorative): `CanvasToolbar` (6), `AppHeader` (6), `Inventory` (2), `InventoryToolsPanel` (2), `AssistantSidebar` (1), `InventoryBrowser` (1). Most are action icons that should have descriptive alt text, not empty. Only truly decorative images should be `alt=""`. |

---

## 2. App Shell & Navigation

### 2.1 AppHeader

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | M | Header is information-dense with 10+ actions visible simultaneously. No grouping or visual hierarchy separates "project actions" (save/load/undo) from "mode switching" from "persona/settings". Cognitive load is high for new users. |
| Minor | S | Undo/redo buttons lack disabled state visual feedback when history is empty — they look clickable but do nothing. |
| Minor | S | "Checkpoint" button uses native `window.prompt()` which is jarring and unstyled. Should use an inline input or modal. |
| Enhancement | M | Add a breadcrumb or project name display so users always know which project they're in. Currently the only project identity is in the browser tab title. |

### 2.2 StatusRail

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | **Dead click handler**: Version button at line 70 has `onClick={() => {}}` — a no-op that looks interactive but does nothing. Either remove the button or implement a version/changelog action. |
| Minor | S | StatusRail items are very small (text-[9px]) and closely packed. Touch targets may be undersized on larger touch displays. |

### 2.3 OmniSearch

| Sev | Effort | Finding |
|-----|--------|---------|
| Enhancement | M | OmniSearch (Ctrl+K) is powerful but undiscoverable. No visible search icon in the header hints at its existence. Users who don't know the shortcut will never find it. Add a search trigger button. |

### 2.4 Mode Selector

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Design/Wiring/Debug mode buttons use different accent colors but no tooltip explaining what each mode does. First-time users won't understand the difference. |

---

## 3. Diagram / Canvas

### 3.1 DiagramCanvas

| Sev | Effort | Finding |
|-----|--------|---------|
| Enhancement | M | Canvas has no onboarding state. A blank canvas with no components shows nothing — no hint about how to add components (drag from inventory, use AI, etc.). Should show a centered empty-state prompt. |
| Minor | S | Zoom controls are only accessible via scroll wheel and keyboard shortcuts. No visible zoom +/- buttons on-canvas for mouse-only users. |
| Enhancement | L | No ruler/grid scale indicator. Users working on physical circuit layouts have no dimensional reference. |

### 3.2 CanvasToolbar

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | 6 images use `alt=""` — these are action icons and should have descriptive alt text for screen readers. |
| Minor | S | Toolbar buttons are closely packed with no visual grouping. Related actions (view controls vs. export vs. mode) should be visually separated. |

### 3.3 ContextMenuOverlay

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | M | Context menu has no keyboard navigation (arrow keys to move between items, Enter to select). It only responds to mouse clicks. |
| Minor | S | No `role="menu"` and `role="menuitem"` ARIA attributes. Screen readers will treat this as generic content. |
| Minor | S | Menu doesn't close on click-outside — only on selecting an action. |

### 3.4 DiagramNode / Wiring

| Sev | Effort | Finding |
|-----|--------|---------|
| Enhancement | M | Wire connections don't show signal type or voltage labels inline. Users must mentally track which wires carry what. Inline wire annotations would reduce cognitive load. |

### 3.5 3D View

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | 3D toggle button in canvas toolbar has no loading indicator while Three.js lazy-loads. Users may click multiple times thinking it didn't work. |

---

## 4. Inventory Sidebar

### 4.1 Inventory (Classic)

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Search input has no clear/reset button. Users must manually select-all and delete to clear a search. |
| Minor | S | Category filter tabs ("list", "add", "tools", "macros") use ambiguous single-word labels. "List" and "Add" are actions; "Tools" and "Macros" are features. Inconsistent naming model. |
| Minor | S | Drag-to-canvas affordance is invisible. Nothing visually indicates items are draggable until the user accidentally discovers it. Add a drag handle icon or a tooltip. |
| Enhancement | M | No "recently used" or "favorites" section. Users who frequently use the same 5 components must search/scroll every time. |

### 4.2 InventoryItem

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Action buttons (add to canvas, edit, delete) are `hidden` until hover. Keyboard-only users can never see or discover them since `:hover` doesn't apply. Should show on `:focus-within`. |
| Minor | S | Diagnostic tooltip uses `onMouseEnter/Leave` to toggle — it's not accessible via keyboard. Should use a focus-triggered popover or accessible tooltip pattern. |

### 4.3 InventoryAddForm

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | "Generate image" button next to name field has no tooltip or label — just a lightning bolt icon. Users won't know it uses AI to generate a component thumbnail. |
| Minor | S | After adding a component, the form resets and switches to list tab. No success confirmation or way to undo the add. |
| Enhancement | M | No form validation feedback. If name is empty the submit button is disabled but there's no message explaining why. |

### 4.4 InventoryToolsPanel

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | S | Uses `window.confirm()` for reset action — breaks the cyberpunk UX with a native browser dialog. Should use a styled confirmation modal. |
| Minor | S | "What Can I Build?" AI suggestions render as plain preformatted text. Should use markdown rendering for better readability. |

### 4.5 MacroPanel

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Empty state shows a generic loading spinner (`.loading-tech`) with "No Macros Saved" text. The spinner implies something is loading, not that the list is empty. Use a different empty-state icon. |
| Enhancement | M | No way to edit or rename saved macros. Only options are "run" and the implicit delete (which doesn't exist). |

### 4.6 BOMModal

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | PDF export uses hardcoded font sizes and positions. Long part names or many items will overflow the page without pagination. |
| Enhancement | M | Table has no sorting capability. Users can't sort BOM by quantity, price, or type. |

---

## 5. Inventory Management (Full-Screen)

### 5.1 InventoryMgmtView

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | M | Uses `rounded-lg` throughout instead of `cut-corner-sm/md`. Visually disconnected from the rest of the app's cyberpunk theme. This entire view looks like a different application. |
| Minor | S | Close button is only visible when `onClose` prop is provided. No other way to navigate back if the prop is missing. |

### 5.2 InventoryBrowser

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Search input is uncontrolled (uses `onChange` with debounce but no `value` prop). The displayed text and actual search query can desync if the component re-renders. |
| Minor | S | `alt=""` on thumbnail images — should describe the component name for accessibility. |
| Enhancement | M | No bulk selection or bulk actions. Users managing large inventories must act on items one at a time. |

### 5.3 SyncStatusBar

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Shows "Backend offline" as default state. For users who haven't set up the server, this is a permanent warning that creates alert fatigue. Should show "Local mode" instead and make backend status a secondary indicator. |

---

## 6. Assistant / Chat

### 6.1 AssistantTabs

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | M | 7 tabs (chat, bootcamp, history, diagnostic, analytics, audit, logs) is a lot for a sidebar panel. Many users won't explore past the first 2–3. Consider grouping or collapsing less-used tabs. |
| Minor | S | Tab widths are stored in localStorage and support drag-resizing, but the resize handles are invisible. Users won't discover they can resize tabs. |

### 6.2 ChatPanel

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | M | The input area has many inline controls (mode selector, deep thinking toggle, attachments, voice, context indicator, suggestion chips). This creates a cluttered composition that can overwhelm. Consider progressive disclosure — show advanced controls on expand. |
| Minor | S | Proactive suggestion chips appear below the input but can be clipped by the panel boundary when the sidebar is narrow. |
| Enhancement | L | No message search. Users can't find past messages in long conversations. |
| Enhancement | M | No "copy message" button on AI responses. Users must manually select text to copy. |

### 6.3 ChatMessage

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Code blocks in messages don't have a "copy code" button. Users must manually select. |
| Minor | S | `line-clamp-2` on suggested action descriptions may truncate important context. |

### 6.4 ConversationSwitcher

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | S | Uses `window.confirm()` for delete confirmation — breaks the cyberpunk UX. |
| Minor | S | Conversation list shows only names with no preview text or date. Hard to find a specific past conversation. |

---

## 7. Settings Panel

### 7.1 SettingsPanel (Root)

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | M | **9 tabs** in the settings panel: API, Profile, Parts, AI, Layout, Dev, Config, Diagnostics, Locale. This is sprawling. Users must click through many tabs to find what they need. Should consolidate related sections (e.g., merge Config + Layout, merge Dev + Diagnostics). |
| Minor | S | Tab active state indicator is subtle. The selected tab isn't visually prominent enough against the dark background. |

### 7.2 ProfileSettings

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | S | Uses `alert()` for "Invalid profile file format" and "Failed to import profile" — breaks UX. Use toast notifications. |
| Minor | S | Wiring Color Map editor is a raw JSON textarea. Most users won't understand the JSON format. A visual color picker per wire type would be much more usable. |

### 7.3 ConfigPortal

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | S | Uses `alert()` for "Configuration loaded successfully" and "Invalid configuration file." — breaks UX. |
| Major | S | `window.location.reload()` on import is disruptive. Should apply config changes in-memory and only reload if truly necessary. |

### 7.4 DiagnosticsView

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | S | Uses `alert()` for "Report copied to clipboard" — breaks UX. Use a toast. |

### 7.5 SyncPanel

| Sev | Effort | Finding |
|-----|--------|---------|
| Critical | M | Uses `alert()` for push/pull success/failure (4 instances). These are in async flows where multiple alerts can stack. Very disruptive. |
| Minor | S | Sync overlay uses `z-[100]` which may conflict with other modals. |

### 7.6 PartsManager

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Drop zone says "Click to upload or drag and drop" but actual drag-and-drop is not implemented (`<input type="file">` in a label). The drag-and-drop claim is misleading without `onDrop` handling. |
| Minor | M | Uses `rounded-xl` and `rounded-lg` — visual mismatch with cyberpunk theme. |

### 7.7 LocalizationSettings

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | M | Measurement unit and symbol standard are stored in local `useState` — they don't persist across sessions or propagate to other components. These settings are effectively non-functional. |

---

## 8. Dashboard & Widgets

### 8.1 AnalyticsDashboard

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | "Engineering XP" progress bar is hardcoded to 65% and "Level 14". These should be dynamic based on actual usage data or removed if gamification isn't real. |
| Minor | S | Chart tooltips use raw CSS variable references (`var(--color-neon-cyan)`) in inline styles which may not resolve in all Tailwind v4 configurations. |

### 8.2 SystemVitals

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Tooltip with diagnostics only appears on hover — not keyboard accessible. |
| Minor | S | FPS, Memory, AI Latency labels use `text-[8px]` which is extremely small. |

---

## 9. Tutorial / Quest System

### 9.1 QuestDashboard + QuestCard

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | M | **Completely different visual language.** Uses `gray-*` Tailwind colors, `rounded-xl`, `rounded-lg`, `rounded-full`, gradient backgrounds — none of the cyberpunk design system. Looks like a different app pasted in. |
| Minor | S | Quest prerequisite display shows raw quest IDs ("Requires: quest-1, quest-2") instead of human-readable quest titles. |

### 9.2 QuestCompletionModal

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Confetti animation uses inline `<style>` tag injected on every render. Should be in `index.css` or a CSS module. |
| Minor | S | Same `rounded-2xl`, gray color palette inconsistency as QuestDashboard. |

### 9.3 ActiveQuestChecklist

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Overlaps with `MentorOverlay` position (both `fixed bottom-6 right-6 z-40`). When both are visible they'll collide. |

### 9.4 TutorialOverlay

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Uses `gray-*` colors and `rounded-lg` — same theme mismatch as quest components. |
| Minor | S | Spotlight mask uses a static `id="tutorial-spotlight-mask"` which would conflict if two overlays existed simultaneously. |
| Enhancement | M | Progress dots don't scale well for tutorials with many steps (>10 dots overflow). Consider a numeric indicator or progress bar instead. |

### 9.5 BootcampPanel vs Quest System

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | M | There are **two separate tutorial/learning systems**: the `BootcampPanel` (cyberpunk-themed, uses `TutorialContext`) and the `QuestDashboard` (gray-themed, uses `QuestContext`). They have different data models, different UIs, and different state management. This is confusing — consolidate into one system. |

---

## 10. Timeline & Version Control

### 10.1 ProjectTimeline (layout/)

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | S | Uses `window.confirm()` for revert action and `alert()` for success/failure. 3 instances of browser dialogs. |
| Minor | S | "COMPARE" button has no `onClick` handler — it's a dead button. |

### 10.2 ProjectTimeline (timeline/)

| Sev | Effort | Finding |
|-----|--------|---------|
| Enhancement | M | The horizontal timeline is excellent, but `Shift+click` for comparison mode is undiscoverable. The legend mentions it, but users may not read legends. Add a "Compare" mode toggle button. |

### 10.3 CircuitDiffOverlay

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Summary badge width is calculated from string length * 7.5 — this assumes monospace and won't be accurate for all fonts/sizes. |

---

## 11. Auth & Collaboration

### 11.1 Gatekeeper

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | PIN input `maxLength={8}` but minimum is 4. No visible indicator of acceptable length range. |
| Minor | S | Error message "Invalid Security PIN" appears as absolute positioned text that overlaps the input on small screens. |
| Enhancement | S | No "forgot PIN" recovery option. If user forgets their PIN, they're locked out with no guidance. |

### 11.2 CollaboratorList

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Uses `rounded-full` for avatars and `rounded-lg` for the dropdown — visually reasonable but inconsistent with the cut-corner system used elsewhere. |
| Minor | S | The deprecated `document.execCommand('copy')` is used as a clipboard fallback. This is being removed from browsers. |

---

## 12. Notification & Feedback

### 12.1 CyberToast

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | S | Toast notifications don't have a maximum visible count. In rapid-fire scenarios (e.g., bulk import), toasts could stack infinitely and obscure the UI. |
| Enhancement | S | No persistent notification center. Once a toast disappears, the information is gone. Users who miss a toast lose context. |

### 12.2 Browser Dialogs (Cross-Cutting)

| Sev | Effort | Finding |
|-----|--------|---------|
| Critical | M | **21 instances** of `alert()`, `confirm()`, `prompt()` across 10 files: `SyncPanel` (4), `Inventory` (3), `AppHeader` (3), `ProjectTimeline` (layout, 3), `ConfigPortal` (2), `ProfileSettings` (2), `ConversationSwitcher` (1), `InventoryToolsPanel` (1), `DiagnosticsView` (1). Every single one breaks the themed UX, blocks the JS thread, and is inaccessible. **This is the single highest-impact quick win.** |

---

## 13. Accessibility (Cross-Cutting)

| Sev | Effort | Finding |
|-----|--------|---------|
| Major | L | No skip-to-content link. The 20 context providers and complex layout mean keyboard users must tab through many elements to reach main content. |
| Major | M | Many interactive elements lack visible focus indicators beyond the global `focus-visible:ring`. Custom components like canvas nodes, timeline nodes, and tab bars need explicit focus styles. |
| Minor | M | `prefers-reduced-motion` is not respected by custom CSS animations (`@keyframes` in `index.css` and inline). Only Tailwind's built-in utilities respect it. |
| Minor | S | Several tooltips and diagnostic popovers are mouse-only (hover-triggered). Keyboard users can't access them. |
| Minor | S | Color alone is used to convey status in several places (e.g., diagnostic severity in `InventoryItem`, stock status in `BOMModal`). Should add icons or text labels. |

---

## 14. Performance Perception

| Sev | Effort | Finding |
|-----|--------|---------|
| Minor | M | `AnalyticsDashboard` `ChartContainer` uses `ResizeObserver` + state update which can cause layout thrashing during sidebar animations. The existing debouncing helps but a `requestAnimationFrame` guard would be more robust. |
| Minor | S | `HardwareTerminal` runs a simulated log interval unconditionally when connected. Should use `IntersectionObserver` to pause when not visible. |
| Enhancement | M | Large inventory lists use `VList` (virtua) which is good, but the `InventoryBrowser` in the full management view does not — it renders all items with `AnimatePresence` which will be slow with 100+ items. |

---

## 15. Creative & Innovative UX Ideas

### 15.1 Quick Wins (Immediate Impact, Small Effort)

1. **Replace all browser dialogs** with a reusable `ConfirmModal` component using the existing cyberpunk panel styles and `useFocusTrap`. Single component, used everywhere. (Eliminates 21 jarring interruptions.)
2. **Add keyboard shortcut cheatsheet** — a `?` key binding that shows all available shortcuts in a modal. Many shortcuts exist but are invisible.
3. **Add "copy code" buttons** to AI chat message code blocks.
4. **Show inventory item action buttons on `:focus-within`**, not just `:hover`, fixing keyboard accessibility.
5. **Add a search trigger icon** in the header that opens OmniSearch, making it discoverable.
6. **Fix the dead StatusRail version button** — show a changelog or version info popover.

### 15.2 Near-Term Improvements (Medium Effort, High Value)

7. **Unify the corner system** — audit all `rounded-*` usage and replace with `cut-corner-sm/md` to enforce the cyberpunk visual contract. Create a lint rule or Tailwind plugin to flag `rounded-*` usage.
8. **Unify quest and bootcamp** into a single learning system with one context, one UI, and one theme.
9. **Consolidate settings tabs** — merge related tabs (Config+Layout, Dev+Diagnostics) to reduce from 9 to 5–6 tabs.
10. **Add a notification center** — a dropdown that persists recent notifications (toasts + comms log) so users don't miss important information.
11. **Progressive disclosure in chat input** — collapse advanced controls (deep thinking, voice, attachments) behind an expand toggle. Show only the text input and send button by default.
12. **Contextual empty states** — every empty list/canvas should show helpful guidance specific to that context, not just "No data" with a spinner.
13. **Theme the Inventory Management view** — apply cyberpunk design tokens to bring it into visual consistency.

### 15.3 Strategic Redesign Ideas (Large Effort, Transformative)

14. **Adaptive information density** — detect user's expertise level (already stored in `UserProfile.expertise`) and adjust UI density. Beginners see larger text, more whitespace, prominent labels. Pro users get the current dense layout.
15. **Spatial audio feedback** — for the cyberpunk theme, add subtle UI sounds (click, success, error, drag) using the Web Audio API. Optional, tied to a "sound effects" toggle in settings.
16. **AI-powered UI adaptation** — the assistant already knows the user's context. Let it proactively rearrange sidebar tabs, surface relevant tools, or highlight menu items based on the current task (e.g., if user is debugging, auto-switch to debug mode and open diagnostics).
17. **Radial/pie context menu** — replace the linear context menu on canvas right-click with a radial menu (common in CAD tools). Faster for experienced users since each action is at a consistent angle.
18. **Minimap interaction enhancement** — make the canvas minimap a live viewport controller where users can drag a viewport rectangle to navigate, not just a passive preview.
19. **Component quick-peek** — hovering over a component in the inventory shows a floating preview card with image, specs, pin count, and stock level without needing to click/open.
20. **Command palette enhancement** — extend OmniSearch into a full command palette (like VS Code's Ctrl+Shift+P) that can execute actions, not just search. "Add resistor", "Export BOM", "Switch to debug mode" etc.

---

## 16. Prioritized Execution Roadmap

### Phase 1: Quick Wins (1–2 sessions)

| # | Task | Files | Impact |
|---|------|-------|--------|
| 1 | Replace all 21 `alert/confirm/prompt` with styled modal/toast | 10 files | Critical UX fix |
| 2 | Fix dead `onClick` in StatusRail | `StatusRail.tsx` | Dead code cleanup |
| 3 | Add `:focus-within` to InventoryItem action buttons | `InventoryItem.tsx` | Keyboard a11y |
| 4 | Add search trigger icon in header | `AppHeader.tsx` | Discoverability |
| 5 | Fix empty-state spinners (MacroPanel, CommsLog) | 2 files | Misleading UI |
| 6 | Add copy button to chat code blocks | `ChatMessage.tsx` | User convenience |

### Phase 2: Design System Alignment (2–3 sessions)

| # | Task | Files | Impact |
|---|------|-------|--------|
| 7 | Audit + replace `rounded-*` with `cut-corner-*` | ~46 files | Visual consistency |
| 8 | Define named type scale utilities | `index.css`, `tailwind.config.js` | Typography system |
| 9 | Theme InventoryMgmtView to cyberpunk | ~12 files | Visual consistency |
| 10 | Theme Quest/Tutorial components to cyberpunk | ~5 files | Visual consistency |
| 11 | Consolidate BootcampPanel + QuestDashboard | Multiple | Feature clarity |

### Phase 3: Interaction & Accessibility (2–3 sessions)

| # | Task | Files | Impact |
|---|------|-------|--------|
| 12 | Add skip-to-content link | `index.tsx` or `MainLayout.tsx` | A11y compliance |
| 13 | Add `prefers-reduced-motion` to all custom animations | `index.css` + components | A11y compliance |
| 14 | Make tooltips keyboard-accessible | Multiple | A11y compliance |
| 15 | Add keyboard nav to ContextMenuOverlay | `ContextMenuOverlay.tsx` | A11y |
| 16 | Consolidate settings tabs (9 → 5–6) | `SettingsPanel.tsx` | Reduce complexity |
| 17 | Progressive disclosure in ChatPanel input | `ChatPanel.tsx` | Reduce clutter |

### Phase 4: Innovation & Polish (Ongoing)

| # | Task | Impact |
|---|------|--------|
| 18 | Canvas empty-state onboarding | First-use experience |
| 19 | Command palette (extend OmniSearch) | Power user productivity |
| 20 | Notification center | Information persistence |
| 21 | Component quick-peek on hover | Inventory ergonomics |
| 22 | Adaptive info density by expertise | Personalization |

---

## 17. Preserve / Do-Not-Change Baseline

These elements are working well and should be preserved during refactors unless there is a clear measured benefit.

| Surface | Preserve | Why it works |
|---|---|---|
| Diagram canvas architecture | Hook-extracted canvas logic (`useDiagram*` family) | Maintains separation of concerns and keeps complex interaction logic debuggable. |
| Inventory virtual list | `VList` usage in inventory sidebar | Scales better than naive full-list rendering. |
| Lazy loading strategy | Heavy components (`ThreeViewer`, editor modal sections) | Good first-paint behavior for non-3D workflows. |
| Cyberpunk token foundation | Existing color variables + cut-corner motif | Distinct visual identity worth strengthening, not replacing. |
| Context-driven app orchestration | `MainLayout` + provider model | Enables feature-level evolution without global prop drilling. |
| Toast severity semantics | Info/success/warning/critical styling in `CyberToast` | Fast glanceable status language already exists. |

---

## 18. Evidence Model & Confidence

### 18.1 Evidence Types

- `code-read`: Confirmed directly in source.
- `runtime-observed`: Confirmed through interaction behavior.
- `user-reported`: Based on observed user feedback pattern.

### 18.2 Confidence Scale

- **High**: Deterministic from source or directly reproducible.
- **Medium**: Likely based on source + inferred runtime behavior.
- **Low**: Needs runtime validation before implementation.

### 18.3 Major/Critical Evidence Matrix

| ID | Reference | Severity | Evidence Type | Confidence | Validation Needed |
|---|---|---|---|---|---|
| UX-001 | 1.1 Corner system violations | Major | code-read | High | No |
| UX-002 | 1.2 Micro-text overuse | Major | code-read | High | No |
| UX-003 | 2.1 Header density | Major | code-read | Medium | Yes (task timing study) |
| UX-004 | 4.4 InventoryToolsPanel `confirm()` | Major | code-read | High | No |
| UX-005 | 6.4 ConversationSwitcher `confirm()` | Major | code-read | High | No |
| UX-006 | 7.1 Settings tab sprawl | Major | code-read | Medium | Yes (findability test) |
| UX-007 | 7.2 ProfileSettings `alert()` | Major | code-read | High | No |
| UX-008 | 7.3 ConfigPortal dialogs + reload | Major | code-read | High | No |
| UX-009 | 7.4 DiagnosticsView `alert()` | Major | code-read | High | No |
| UX-010 | 7.5 SyncPanel dialog stack | Critical | code-read | High | No |
| UX-011 | 9.1 Quest visual language split | Major | code-read | High | No |
| UX-012 | 9.5 Dual learning systems | Major | code-read | High | No |
| UX-013 | 10.1 Timeline dialogs | Major | code-read | High | No |
| UX-014 | 12.2 Browser dialogs cross-cutting | Critical | code-read | High | No |
| UX-015 | 13 No skip-to-content link | Major | code-read | High | No |
| UX-016 | 13 Focus indicator gaps | Major | code-read | Medium | Yes (keyboard audit) |

---

## 19. Repro Steps for Major/Critical Findings

Use these steps for verification and regression tests.

| ID | Steps to Reproduce | Expected | Actual |
|---|---|---|---|
| UX-004 | Open Inventory sidebar -> Tools tab -> trigger reset action. | Styled in-app confirmation modal appears. | Native browser `confirm()` appears. |
| UX-005 | Open Chat panel -> Conversation switcher -> delete conversation. | Themed confirmation flow with keyboard support. | Native `confirm()` blocks thread. |
| UX-007 | Settings -> Profile -> import invalid profile file. | Inline/Toast error in app theme. | Native `alert()` popup. |
| UX-008 | Settings -> Config -> import config file. | Non-blocking success/error UX and no full reload unless required. | `alert()` and full `window.location.reload()`. |
| UX-009 | Settings -> Diagnostics -> copy report. | Toast confirmation appears. | Native `alert()` appears. |
| UX-010 | Settings -> Sync -> run push/pull operations (success/fail). | Toast/modal stack with queueing and no blocking dialogs. | Multiple native `alert()` calls can stack. |
| UX-013 | Open layout timeline -> click revert action. | Themed confirmation and result handling. | Native `confirm()` + `alert()` chain. |
| UX-014 | Trigger all flows listed in 12.2. | Unified in-app dialog/feedback system. | 21 browser dialogs across 10 files. |
| UX-015 | Keyboard-only nav from page load. | Skip link appears first, jumps to main content. | No skip link; long tab sequence required. |
| UX-016 | Keyboard-only nav across tabs, canvas controls, timeline nodes. | Clear focus ring/state on all interactive elements. | Multiple controls lack explicit visible focus states. |

---

## 20. Accessibility Checklist (WCAG-Mapped)

| WCAG SC | Requirement | Current Gap | Target Fix | Verification |
|---|---|---|---|---|
| 1.4.3 Contrast (Minimum) | Text contrast >= 4.5:1 | Low-contrast labels (`text-slate-500` on dark backgrounds) | Promote text tokens to compliant shades | Automated contrast scan + manual checks |
| 1.4.4 Resize text | Text remains readable at 200% zoom | Extensive `text-[7px..10px]` usage | Replace micro sizes with named scale >= 12px baseline | Browser zoom + screenshot diff |
| 1.4.11 Non-text contrast | UI controls have sufficient contrast | Some subtle borders/focus states blend into background | Increase border/focus contrast tokens | Visual QA in dark theme |
| 2.1.1 Keyboard | All functions keyboard-operable | Mouse-only context menu and hover-only actions | Add roving tabindex/menu keys and focus-within reveals | Keyboard walkthrough script |
| 2.4.1 Bypass blocks | Skip repetitive nav | No skip-to-content link | Add skip link targeting main canvas/content | Keyboard-first smoke test |
| 2.4.7 Focus visible | Visible indicator on focused controls | Inconsistent custom focus states | Add explicit focus styles per custom component | Focus-state snapshot test |
| 2.5.8 Target size (Minimum) | 24x24 CSS px targets | Dense header/status controls | Increase hit targets and spacing | Pointer target audit |
| 3.2.2 On input | No unexpected context changes | Some settings flows force reload | Avoid full reload, require explicit apply action | Interaction test |
| 4.1.2 Name, role, value | Controls expose semantics | Context menu lacks menu roles | Add `role="menu"` / `menuitem` and labels | Screen reader smoke test |

---

## 21. Phase Success Metrics / Definition of Done

| Phase | Definition of Done | Metrics |
|---|---|---|
| Phase 1 (Quick Wins) | All browser dialogs removed; dead actions fixed; top discoverability and copy affordances shipped. | `alert/confirm/prompt` count = 0, dead click handlers = 0, code-copy adoption event logged. |
| Phase 2 (Design Alignment) | Visual language unified around cut corners + canonical typography tokens. | `rounded-*` violations reduced by >= 90% (or fully removed where policy requires), micro-text count reduced by >= 80%. |
| Phase 3 (Interaction + A11y) | Core flows pass keyboard-only and reduced-motion audits. | Skip link present, focus-visible on all primary controls, no mouse-only critical action paths. |
| Phase 4 (Innovation) | At least 2 strategic UX enhancements released and validated. | Task completion time and user effort reduced in before/after benchmarks. |

---

## 22. Roadmap Dependency Map

| Predecessor | Dependent Tasks | Why Dependency Exists |
|---|---|---|
| Task 1 (replace browser dialogs) | Tasks 10, 20 | Notification center and consistent feedback patterns depend on unified dialog primitives. |
| Task 7 (corner system audit) | Tasks 9, 10 | Theme refactors should consume standardized corner tokens first. |
| Task 8 (type scale utilities) | Tasks 9, 10, 17 | Surface redesigns and chat density tuning need stable typography tokens. |
| Task 11 (consolidate learning systems) | Task 18 | Empty-state onboarding should target the final unified learning model. |
| Task 12 (skip link) + Task 14 (tooltip accessibility) | Task 15 | Context menu keyboard support should align with global keyboard/a11y patterns. |
| Task 16 (settings consolidation) | Task 17 | Chat control disclosure should reuse simplified settings discoverability principles. |

Recommended implementation order inside phases: 1 -> 7/8 -> 9/10/11 -> 12/14/15 -> 16/17 -> 18/19/20/21/22.

---

## 23. Ticket Export Blocks (Backlog-Ready)

### 23.1 Canonical Ticket Template

```md
ID: UX-###
Title: <short imperative title>
Severity: Critical | Major | Minor | Enhancement
Effort: S | M | L
Owner: TBD
Primary File(s): <path list>
Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
Evidence Type: code-read | runtime-observed | user-reported
Verification:
- [ ] Unit/integration tests (if applicable)
- [ ] Manual validation steps completed
Rollback Plan:
- <how to revert safely>
```

### 23.2 Seeded Priority Tickets

| ID | Title | Severity | Effort | Owner | Primary File(s) | Acceptance Criteria (Summary) |
|---|---|---|---|---|---|---|
| UX-014 | Replace browser dialogs globally | Critical | M | TBD | Multiple (10 files) | No native dialogs remain; themed modal/toast used everywhere. |
| UX-010 | Replace SyncPanel alert stack | Critical | M | TBD | `components/settings/SyncPanel.tsx` | Push/pull feedback is non-blocking and queued. |
| UX-015 | Add skip-to-content link | Major | S | TBD | `index.tsx`, `components/MainLayout.tsx` | First tab stop is skip link; targets main content. |
| UX-016 | Add visible focus states to custom controls | Major | M | TBD | Multiple | Keyboard nav exposes clear focus for all primary controls. |
| UX-001 | Enforce cut-corner policy | Major | L | TBD | ~46 files | Rounded corner violations removed or formally exempted. |
| UX-002 | Replace micro-text scale | Major | L | TBD | 66 files | `text-[7..10px]` replaced by canonical typography tokens. |
| UX-006 | Consolidate settings IA | Major | M | TBD | `components/SettingsPanel.tsx` | Tabs reduced 9 -> 5/6 with findability improvements. |
| UX-012 | Merge Bootcamp and Quest systems | Major | L | TBD | Learning feature files | Single learning system, one context, one visual language. |
| UX-013 | Fix timeline dialog flows and dead compare action | Major | M | TBD | `components/layout/ProjectTimeline.tsx` | Compare action functional; no native dialogs. |

---

## 24. Risk & Rollback Notes (Execution Safety)

### 24.1 Phase 1 Risks and Rollbacks

| Risk | Impact | Mitigation | Rollback |
|---|---|---|---|
| Replacing dialogs introduces broken confirmations | Accidental destructive actions | Ship shared `ConfirmModal` with explicit danger mode and focus trap | Revert modal adapter commits per feature slice |
| Toast replacement causes missed critical feedback | User uncertainty | Add severity + sticky option for critical events | Re-enable temporary blocking fallback behind feature flag |
| Dead-button fixes alter behavior unexpectedly | Regressions in workflows | Add interaction tests for affected header/rail actions | Revert specific handler changes |

### 24.2 Phase 2 Risks and Rollbacks

| Risk | Impact | Mitigation | Rollback |
|---|---|---|---|
| Global corner token refactor creates visual regressions | Broken visual consistency | Batch by feature area with screenshot diffs | Revert per-area token migration |
| Typography token migration causes clipping/overflow | Content truncation | Run responsive snapshot pass before merge | Revert token alias map and reapply incrementally |
| Learning-system consolidation breaks state continuity | Lost user progress | Add migration adapter for quest/tutorial progress | Roll back to dual-system toggle while fixing adapter |

---

## 25. Before/After Screenshot Placeholders

Use this checklist for visual QA and changelog artifacts.

| Area | Before Screenshot | After Screenshot | Notes |
|---|---|---|---|
| App header action density | `screenshots/before/header-density.png` | `screenshots/after/header-density.png` | Validate grouping and hit target spacing. |
| Context menu accessibility | `screenshots/before/context-menu.png` | `screenshots/after/context-menu.png` | Show menu roles/focus states if possible. |
| Inventory item actions | `screenshots/before/inventory-item-hover-only.png` | `screenshots/after/inventory-item-focus-within.png` | Demonstrate keyboard discoverability. |
| Settings information architecture | `screenshots/before/settings-9-tabs.png` | `screenshots/after/settings-consolidated.png` | Confirm reduced tab count and findability. |
| Quest/Tutorial visual consistency | `screenshots/before/quest-gray-theme.png` | `screenshots/after/quest-cyberpunk-theme.png` | Confirm design system alignment. |
| Dialog replacement | `screenshots/before/native-alert-confirm.png` | `screenshots/after/themed-modal-toast.png` | Verify no native dialogs remain. |

Recommended capture checkpoints: desktop (1440px), laptop (1280px), tablet (768px), mobile (390px).

---

## Appendix A — Component Coverage Matrix (Audited Files)

Status legend:

- `Audited` = source reviewed during this audit.
- `Referenced` = covered via parent component integration context.

| Area | File | Status |
|---|---|---|
| Root | `App.tsx` | Audited |
| Root | `index.tsx` | Audited |
| Root styling | `index.css` | Audited |
| Root styling | `tailwind.config.js` | Audited |
| Architecture ref | `ref/components.md` | Audited |
| Architecture ref | `ref/architecture.md` | Audited |
| Layout shell | `components/MainLayout.tsx` | Audited |
| Layout shell | `components/layout/AppLayout.tsx` | Audited |
| Layout shell | `components/layout/AppHeader.tsx` | Audited |
| Layout shell | `components/layout/ModeSelector.tsx` | Audited |
| Layout shell | `components/layout/SystemVitals.tsx` | Audited |
| Layout shell | `components/layout/CyberToast.tsx` | Audited |
| Assistant | `components/layout/assistant/AssistantContent.tsx` | Audited |
| Assistant | `components/layout/assistant/AssistantTabs.tsx` | Audited |
| Assistant | `components/ChatPanel.tsx` | Audited |
| Assistant | `components/ChatMessage.tsx` | Audited |
| Assistant | `components/ConversationSwitcher.tsx` | Audited |
| Diagram | `components/diagram/DiagramCanvas.tsx` | Audited |
| Diagram | `components/layout/ContextMenuOverlay.tsx` | Audited |
| Diagram | `components/timeline/CircuitDiffOverlay.tsx` | Audited |
| Diagram | `components/timeline/ProjectTimeline.tsx` | Audited |
| Shared UI | `components/IconButton.tsx` | Audited |
| Inventory classic | `components/Inventory.tsx` | Audited |
| Inventory classic | `components/inventory/InventoryList.tsx` | Audited |
| Inventory classic | `components/inventory/InventoryItem.tsx` | Audited |
| Inventory classic | `components/inventory/InventoryAddForm.tsx` | Audited |
| Inventory classic | `components/inventory/InventoryToolsPanel.tsx` | Audited |
| Inventory classic | `components/inventory/MacroPanel.tsx` | Audited |
| Inventory classic | `components/inventory/BOMModal.tsx` | Audited |
| Inventory management | `components/inventory-mgmt/InventoryMgmtView.tsx` | Audited |
| Inventory management | `components/inventory-mgmt/InventoryBrowser.tsx` | Audited |
| Settings | `components/SettingsPanel.tsx` | Audited |
| Settings | `components/settings/ProfileSettings.tsx` | Audited |
| Settings | `components/settings/LocalizationSettings.tsx` | Audited |
| Settings | `components/settings/ConfigPortal.tsx` | Audited |
| Settings | `components/settings/DeveloperPortal.tsx` | Audited |
| Settings | `components/settings/DiagnosticsView.tsx` | Audited |
| Settings | `components/settings/PartsManager.tsx` | Audited |
| Settings | `components/settings/SyncPanel.tsx` | Audited |
| Security/auth | `components/auth/Gatekeeper.tsx` | Audited |
| Security/auth | `components/auth/PermissionGuard.tsx` | Audited |
| Security/reporting | `components/layout/SecurityReport.tsx` | Audited |
| Collaboration | `components/collab/CollaboratorList.tsx` | Audited |
| Learning | `components/layout/BootcampPanel.tsx` | Audited |
| Learning | `components/quest/QuestDashboard.tsx` | Audited |
| Learning | `components/quest/QuestCard.tsx` | Audited |
| Learning | `components/quest/ActiveQuestChecklist.tsx` | Audited |
| Learning | `components/quest/QuestCompletionModal.tsx` | Audited |
| Learning | `components/quest/TutorialOverlay.tsx` | Audited |
| Diagnostics | `components/layout/DebugWorkbench.tsx` | Audited |
| Diagnostics | `components/layout/AnalyticsDashboard.tsx` | Audited |
| Diagnostics | `components/layout/SystemLogViewer.tsx` | Audited |
| Diagnostics | `components/layout/HardwareTerminal.tsx` | Audited |
| Diagnostics | `components/layout/CommsLog.tsx` | Audited |
| Diagnostics | `components/layout/MentorOverlay.tsx` | Audited |
| Timeline (layout) | `components/layout/ProjectTimeline.tsx` | Audited |
| Editor/modal | `components/ComponentEditorModal.tsx` | Audited |

Coverage result: **57 files audited** and incorporated into the findings.

---

## Appendix B — Runtime Validation Queue

These items have medium-confidence assumptions and should be runtime-validated before implementation sign-off.

| ID | Validation Scenario | Pass Condition |
|---|---|---|
| UX-003 | Header density usability test (novice + experienced users) | Average task time decreases after regrouping actions. |
| UX-006 | Settings findability test | Users find target settings in <= 2 clicks median. |
| UX-016 | Keyboard nav + focus state audit | All primary controls are discoverable and operable via keyboard. |
| 14.1 (ResizeObserver) | Sidebar animation perf profiling | No perceptible jank during panel transitions. |
| 6.2 (Chat clutter) | Message compose task with current vs progressive UI | Fewer mis-clicks and faster first-message send. |

---

## Appendix C — Addendum Completion Checklist

| Requested Addition | Status |
|---|---|
| Component coverage appendix (audited files + status) | Complete |
| Evidence typing model (`code-read`, `runtime-observed`, `user-reported`) | Complete |
| Repro steps for major/critical findings | Complete |
| Success metrics / Definition of Done by phase | Complete |
| WCAG-mapped accessibility checklist | Complete |
| Dependency map across roadmap tasks | Complete |
| Preserve / Do-not-change baseline | Complete |
| Ticket export block + seeded ticket list | Complete |
| Risk/rollback notes for phase 1 and phase 2 | Complete |
| Before/after screenshot placeholders | Complete |
