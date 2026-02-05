# CircuitMind AI - Consolidated Audit Report
**Date:** Sat Jan  3 01:25:44 PM CST 2026
**Scope:** Full System Audit (Code, UI, UX, Metrics)
**Note:** This document consolidates findings from Code Audit, System UI Audit, Visual Audit, and raw complexity metrics.

---

# PART 1: CODE AUDIT REPORT

# CircuitMind AI - Code Audit Report

**Generated**: 2026-01-03 (Updated)
**Auditors**: Claude Code + Gemini (Multi-AI Analysis)
**Scope**: App.tsx, components/, hooks/, services/, index.css
**Tools**: scc, lizard, tokei, rg, ast-grep, fd
**Artifacts**: /tmp/audit/scc-report.json, /tmp/audit/complexity.csv, /tmp/audit/tokei.json

**Cross-References**:
- [UI_AUDIT_REPORT.md](../screenshots/UI_AUDIT_REPORT.md) - Visual audit (543 screenshots)
- [FULL_SYSTEM_UI_AUDIT_REPORT.md](../screenshots/FULL_SYSTEM_UI_AUDIT_REPORT.md) - System UI audit

Note: UI audit ledgers in docs/screenshots/UI_AUDIT_REPORT.md and docs/screenshots/FULL_SYSTEM_UI_AUDIT_REPORT.md label UI-001..003 differently from the user-provided mapping. The Root Cause Mapping below follows the requested meanings (UI-001 text truncation, UI-002 focus states, UI-003 touch targets) and references both audits where relevant.

## Executive Summary - Top 5 Critical Findings
1. Untrusted 3D code execution via new Function in components/ThreeViewer.tsx:211 and components/diagram/Diagram3DView.tsx:659. Current token blocking helps but still leaves injection risk.
2. getComponentShape in components/diagram/componentShapes.ts:557 has CCN 49 and is used by both 2D and 3D rendering, making layout defects high-impact.
3. Icon-only buttons lack aria-label and visible focus styles (70 matches, 0 with aria-label). Examples: components/ConversationSwitcher.tsx:236, components/SettingsPanel.tsx:316, components/ChatPanel.tsx:463.
4. Touch targets under 44px are common, especially h-5/w-5 and h-6/w-6 controls. Examples: components/ChatPanel.tsx:543, components/ChatPanel.tsx:777, components/Inventory.tsx:810.
5. Text truncation is enforced in multiple high-salience labels (truncate/line-clamp + max widths), causing information loss. Examples: App.tsx:1784, components/ConversationSwitcher.tsx:129, components/ChatPanel.tsx:513.

## Metrics Dashboard
- TypeScript (scc): 63 files, 21,415 lines; code 17,570; comments 1,547; blanks 2,298; complexity 2,825.
- Complexity (lizard on App.tsx/components/hooks/services): 511 functions, avg CCN 2.04, max CCN 49, CCN > 10 count 6.
- Largest files (LOC): App.tsx 1967; components/diagram/Diagram3DView.tsx 1809; components/DiagramCanvas.tsx 1445; components/Inventory.tsx 1291; services/geminiService.ts 1272.
- Type coverage proxy: 99.98 percent (any usage 4 / TS code lines 17,570).
- State and render heuristics: useState 65; useMemo/useCallback 107; inline style usages 17; onClick arrow handlers 66.
- Styling drift: hardcoded hex colors 251 occurrences in components/ and index.css; focus: classes in 6 files only.
- Icon-only buttons: 70 matches; aria-label present in 0 matches.

## Issue Ledger
| ID | File:Line | Severity | Effort | Finding |
| --- | --- | --- | --- | --- |
| C-001 | components/diagram/componentShapes.ts:557 | High | High | CCN 49 getComponentShape drives 2D/3D shapes; hard to reason, high regression risk. |
| C-002 | services/componentValidator.ts:53 | High | Medium | validateDiagramInventoryConsistency CCN 16; validation failures ripple into UI and data sync. |
| C-003 | services/geminiService.ts:1 | High | High | 1272 LOC monolith mixing prompt logic, parsing, and routing. |
| C-004 | App.tsx:1 | High | High | 1967 LOC central state hub; coupling increases UI drift and regressions. |
| C-005 | components/ThreeViewer.tsx:211 | High | Medium | new Function executes AI-generated code; token blocklist is not a full sandbox. |
| C-006 | components/diagram/Diagram3DView.tsx:659 | High | Medium | new Function executes 3D code in diagram view; same injection surface. |
| C-007 | components/ConversationSwitcher.tsx:236 | High | Low | Icon-only buttons lack aria-label and focus-visible styles. |
| C-008 | components/SettingsPanel.tsx:316 | Medium | Low | Close button lacks focus-visible state; keyboard users lose focus cues. |
| C-009 | components/ChatPanel.tsx:543 | High | Low | h-5 w-5 icon buttons under 44px touch target. |
| C-010 | components/Inventory.tsx:810 | Medium | Low | w-3 h-3 checkbox hit area is too small on touch. |
| C-011 | App.tsx:1784 | Medium | Low | Conversation title truncated at max-w 120px; loses context. |
| C-012 | components/ConversationSwitcher.tsx:129 | Medium | Low | Active conversation label truncated with max width. |
| C-013 | components/diagram/componentShapes.ts:39 | Medium | Medium | Hardcoded color palette duplicates tokens; visual drift risk. |

## Root Cause Mapping (UI audit cross-reference)
| UI ID (requested meaning) | Code root cause | Evidence |
| --- | --- | --- |
| UI-001 (text truncation) | Truncate/line-clamp plus max widths on primary labels and context chips. | App.tsx:1784, components/ConversationSwitcher.tsx:129, components/ChatPanel.tsx:513, components/ChatMessage.tsx:213. |
| UI-002 (focus states) | No shared focus-visible utility for icon buttons; most icon buttons rely on hover only. | components/ConversationSwitcher.tsx:236, components/SettingsPanel.tsx:316, components/ComponentEditorModal.tsx:369. UI_AUDIT_REPORT.md action plan calls out focus ring standardization. |
| UI-003 (touch targets) | Icon controls use h-5/w-5, h-6/w-6, p-1 and w-3/h-3 checkboxes without min-44px enforcement. | components/ChatPanel.tsx:543, components/ChatPanel.tsx:777, components/Inventory.tsx:810. UI_AUDIT_REPORT.md flags <44px hit areas. |

## Refactoring Candidates
- App.tsx (1967 LOC) - central state and UI wiring; split into state, layout, and feature modules.
- components/diagram/Diagram3DView.tsx (1809 LOC) - 3D pipeline, UI, and data logic interleaved.
- components/DiagramCanvas.tsx (1445 LOC) - routing, rendering, and AI highlight logic combined.
- services/geminiService.ts (1272 LOC) - API orchestration, prompts, and parsing mixed together.
- components/Inventory.tsx (1291 LOC) - inventory UI plus AI tooling in one file.
- components/ComponentEditorModal.tsx (1110 LOC) - tabs, form, and media tooling combined.
- components/SettingsPanel.tsx (928 LOC) - settings UI and validation in a single file.
- components/ChatPanel.tsx (798 LOC) - chat UI and controls combined.
- components/diagram/componentShapes.ts (697 LOC) - hardcoded geometry and colors, needs data-driven refactor.

## Action Plan - Prioritized Fixes (with code examples)
### P1 - Accessibility and touch targets
1. Introduce a shared IconButton component enforcing aria-label, focus-visible, and min-44px hit area.
2. Replace icon-only buttons with IconButton and remove ad-hoc p-1/h-5 sizing.
3. Add a global focus-visible ring utility class for consistency.

Example: standardized icon button
```tsx
type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function IconButton({ label, className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={clsx(
        'min-h-11 min-w-11 inline-flex items-center justify-center rounded-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60',
        'hover:bg-white/10 text-slate-300 hover:text-white',
        className
      )}
      {...props}
    />
  );
}
```

### P2 - Text truncation and overflow (UI-001)
1. Replace fixed max widths with flex + min-w-0 and provide title tooltips.
2. Only line-clamp long text when there is a clear affordance to expand.

Example: safe truncation with tooltip
```tsx
<div className="min-w-0">
  <span className="block truncate" title={title}>
    {title}
  </span>
</div>
```

### P3 - Security hardening for AI-generated code
1. Move execution to a sandboxed iframe or Web Worker; expose only a safe API surface.
2. Upgrade validation to AST-level whitelisting and enforce timeouts per render call.

### P4 - Complexity reduction
1. Extract componentShapes into data tables plus focused geometry helpers; keep CCN under 10 per function.
2. Split geminiService into client, prompts, and parsers; add schema validation helpers.
3. Split App.tsx and Diagram3DView.tsx into container + presentational components and hooks.

---

## Extended Analysis (2026-01-03 Update)

### State Management Density Analysis

| Component | useState | useEffect | useRef | Risk Level |
|-----------|----------|-----------|--------|------------|
| DiagramCanvas.tsx | 22 | 5 | 3 | **State Explosion** |
| Inventory.tsx | 20 | 3 | 6 | **State Explosion** |
| ComponentEditorModal.tsx | 20 | 5 | 3 | **State Explosion** |
| SettingsPanel.tsx | 7 | 2 | 2 | Moderate |
| ChatPanel.tsx | 7 | 3 | 4 | Moderate |
| useConversations.ts | 5 | 2 | 2 | Acceptable |
| ThreeViewer.tsx | 4 | 3 | 9 | Moderate |

### Performance Pattern Analysis

| Pattern | Count | Status | Recommendation |
|---------|-------|--------|----------------|
| React.memo usage | 1 (ChatMessage only) | **Critical Gap** | Add to heavy components |
| useMemo usage | 18 | Adequate | - |
| useCallback usage | 90+ | Good | - |
| Inline style objects | 17 | Medium Risk | Extract to constants |
| Inline arrow handlers | 0 | Good | - |

### Accessibility Gaps (Detailed)

**Images Missing alt Attributes**:
| File | Count | Fix Priority |
|------|-------|--------------|
| ComponentEditorModal.tsx | 2 | High |
| Inventory.tsx | 3 | High |
| ChatMessage.tsx | 1 | High |

**Focus State Coverage**:
- `focus:` rules in index.css: **0** (Critical gap)
- Components with aria-label: SettingsPanel, AssistantSidebar, ChatPanel, DiagramCanvas
- Components MISSING aria-label: ConversationSwitcher icon buttons

### Type Safety Summary

| Metric | Count | Status |
|--------|-------|--------|
| `: any` usage | 4 files | Good |
| `as any` assertions | 9 instances | Medium |
| `as unknown` assertions | 0 | Good |
| Non-null `!.` assertions | 0 | Good |

**Files with `as any`**:
- liveAudio.ts (3)
- ThreeViewer.tsx (2)
- Diagram3DView.tsx (2)
- geminiService.ts (1)
- aiContextBuilder.ts (1)

### Error Handling Coverage

| Service | try-catch | catch | console.error | Status |
|---------|-----------|-------|---------------|--------|
| geminiService.ts | 23 | 21 | 14 | Well-covered |
| storage.ts | 3 | 1 | 0 | Needs work |
| liveAudio.ts | 3 | 3 | 3 | Adequate |
| aiMetricsService.ts | 3 | 2 | 0 | Needs work |
| apiKeyStorage.ts | 2 | 1 | 2 | Adequate |

### Security Scan Results

| Check | Status | Evidence |
|-------|--------|----------|
| dangerouslySetInnerHTML | **Clean** | No usage found |
| eval() | **Clean** | Documentation reference only |
| new Function() | **Warning** | ThreeViewer.tsx:211, Diagram3DView.tsx:659 (blocked tokens help) |
| localStorage exposure | **Monitor** | 20+ direct accesses (API keys stored) |
| External URL injection | **Clean** | No unvalidated external URLs |

### Bundle Size Risks

| Pattern | Count | Risk |
|---------|-------|------|
| `import * as THREE` | 3 files | Expected (three.js) |
| `import * as` (handlers) | 4 files | Internal modules, OK |
| Large library full imports | 0 | Good |
| Dynamic imports (code splitting) | 0 | **Opportunity** |

---

## Quick Fix Commands

```bash
# Find all images missing alt
rg "<img" components/ | rg -v "alt="

# Find all icon-only buttons
rg "<button[^>]*>[^<]*<svg" components/

# Count useState per file
rg "useState" components/ -c | sort -t: -k2 -rn

# Find components over 500 LOC
fd -e tsx components/ --exec sh -c 'wc -l "$1" | awk "\$1 > 500 {print}"' _ {}

# Check focus state coverage
rg "focus:" index.css components/
```

---

*Report generated by multi-phase CLI audit using scc, lizard, tokei, ast-grep, rg, fd*


---

# PART 2: FULL SYSTEM UI AUDIT REPORT

# UI/UX Audit Report - Full System UI (CircuitMind AI)

## Table of Contents
- [Executive Summary](#executive-summary)
- [Methodology](#methodology)
- [Findings by Category](#findings-by-category)
- [Per-Section Analysis](#per-section-analysis)
- [Consistency & Drift Analysis](#consistency--drift-analysis)
- [Accessibility & IA Review](#accessibility--ia-review)
- [Issue Ledger](#issue-ledger)
- [Prioritized Action Plan](#prioritized-action-plan)
- [Design Token Harvest](#design-token-harvest)

---

## Executive Summary

The CircuitMind AI interface presents a professional, "Cyber-Industrial" aesthetic tailored for engineering workflows. The dark theme is cohesive, and the modular structure (Sidebars, Modals, Canvas) is well-defined. However, there are significant opportunities to reduce cognitive load in the Asset Manager and improve the accessibility of interactive states.

### Key Findings
1. **Strong Visual Identity**: The "Cyber" theme is consistently applied with a clear primary accent (`#00f3ff`).
2. **Density Issues in Asset Manager**: The inventory list (Asset Manager) suffers from high information density and unclear primary actions (Add to Diagram vs. Select).
3. **Contrast & Hierarchy Drift**: Some secondary text (e.g., "30 PINS" badges) uses low-contrast backgrounds that may fail WCAG AA.
4. **Modal Overshadowing**: Modals use a heavy backdrop blur that effectively isolates tasks but lacks consistent padding for internal content.

### Critical Recommendations
1. **Simplify Asset Manager Cards**: Use a more distinct "Add" affordance to separate selection from diagram insertion.
2. **Standardize Component Badges**: Consolidate badge styles across the Inventory and Component Editor.
3. **Enhance Focus Indicators**: Ensure consistent focus rings across all inputs (Chat, Filter, API Key).
4. **Refine Sidebar Transitions**: Implement clearer visual cues when sidebars are "Locked" vs "Floating".

---

## Methodology
- **Reasoning Method**: Manual Visual Reasoning (Primary) + Filename State Inference.
- **Analysis Framework**: Heuristic Evaluation (Nielsen-Molich) + WCAG 2.2 AA Contrast Analysis.
- **Tools**: Manual inspection of 500+ screenshots across viewports (1920x1080 to mobile).

---

## Findings by Category

### 1. Visual Design Analysis
- **Theme Consistency**: The application maintains a strict dark palette. Accent colors are used effectively for primary actions (e.g., "LIST" tab active state).
- **Visual Noise**: The background uses a subtle gradient that adds depth without being "tacky" (as per user mandates).
- **Issue**: The "Mic" and "Settings" icons in the top right lack labels, relying entirely on iconography which may be ambiguous for new users.

### 2. Information Architecture Analysis
- **Navigation**: The top header is reserved for system-level controls (Save/Load/Undo), while the bottom is for AI interaction. This "Control sandwich" is intuitive.
- **Asset Manager**: The hierarchical grouping by category (MICROCONTROLLER, SENSOR) is excellent for wayfinding.
- **Issue**: The "Total Assets: 142 units" label is small and positioned near the title, making it easy to miss.

### 3. Interactive Elements Analysis
- **Buttons**: Square corners reinforce the "industrial" feel. Hover states are generally clear but disabled states (Undo/Redo) could be more distinct from the background.
- **Chat Input**: The chat bar is prominent and uses a clear placeholder. The "Mode" buttons (Chat, Image, Video) are grouped logically but could use tooltips for clarity.

### 4. Technical Quality Assessment
- **Responsiveness**: (Based on `07-responsive`) The 2D diagram scales well, but the left sidebar (Asset Manager) becomes problematic on mobile, likely requiring a full-screen overlay mode.
- **Typography**: Uses a clean sans-serif (Inter/Roboto style) with a monospace font for technical data (API keys, code). This is an effective "Engineer-first" approach.

---

## Per-Section Analysis

### 1. App Shell (docs/screenshots/01-app-shell)
- **Description**: Overall application layout including the main canvas area and global controls.
- **Checklist**:
    - Visual hierarchy clarity: **Pass**
    - Alignment: **Pass**
    - Content density: **Pass**
- **Findings**: The layout feels balanced. The "CircuitMind Session" dropdown provides clear context for the current work.
- **Recommendation**: Add a subtle border or drop shadow to the session dropdown to distinguish it from the background more clearly.

### 2. Asset Manager / Inventory (docs/screenshots/03-inventory)
- **Description**: Left-hand panel for component selection and management.
- **Checklist**:
    - Spacing scale: **Fail** (Items feel cramped)
    - Truncation issues: **Pass** (Handled well with ellipses)
    - Accessibility cues: **Fail** (Low contrast on pin badges)
- **Findings**: The +/- counter for quantities is small. On high-DPI screens, these hit targets may be too small for quick interaction.
- **Recommendation**: Increase padding around the +/- buttons to at least 44x44px equivalent hit area.

### 3. Settings Modal (docs/screenshots/04-modals)
- **Description**: Central modal for API configuration and AI settings.
- **Checklist**:
    - Feedback states: **Pass**
    - Trust/Safety cues: **Pass** (Clear warning about local storage)
- **Findings**: The "REQUIRED" tag on the API key field is helpful. The "Clear Key" link is dangerously close to the primary actions; it should be styled as a secondary/destructive button.

---

## Consistency & Drift Analysis

### Component Drift
- **Tabs**: The tabs in the Inventory (`LIST`, `ADD NEW`, `TOOLS`) use a filled cyan box for active state, whereas the Settings Modal tabs use a bottom-border underline.
    - **Fix**: Standardize tab styles. Underline is preferred for modals; filled is better for utility panels.
- **Icons**: Some icons are outlined (Header), while some are filled (Chat modes).
    - **Fix**: Move toward a unified outlined style for the entire shell.

---

## Issue Ledger

| ID | Severity | Evidence | Recommendation | Effort |
| :--- | :--- | :--- | :--- | :--- |
| UI-001 | Medium | `inventory-list.png` | Increase hit targets for component quantity +/- buttons. | Low |
| UI-002 | High | `settings-modal.png` | Standardize Tab styles between Inventory and Settings. | Low |
| UI-003 | Medium | `chat-input.png` | Add tooltips to Mode buttons (Image/Video). | Medium |
| UI-004 | Low | `header-full.png` | Add text labels to Mic/Settings in high-width viewports. | Low |

---

## Prioritized Action Plan

### Quick Wins (Next 48 Hours)
1. **Unify Tab Styles**: Choose either "Border-bottom" or "Filled" for all tab components.
2. **Increase Badge Contrast**: Update the background for technical badges (PINS, VOLTAGE) to a slightly lighter grey or more saturated dark-cyan.

### Medium-Term
1. **Interactive Tooltips**: Implement a shared tooltip component for all icon-only buttons.
2. **Sidebar Mobile View**: Implement a "Full-page" mobile variant for the Asset Manager.

---

## Design Token Harvest

Suggested additions to `tailwind.config.js` or `index.css`:
- `--cyber-cyan-muted`: `rgba(0, 243, 255, 0.1)` (for hover backgrounds)
- `--panel-bg-glass`: `rgba(13, 17, 23, 0.8)` (for sidebars)
- `--status-warning-dim`: `rgba(255, 184, 0, 0.2)`

---

## Appendix: Accessibility Checklist
- [x] Color Contrast (Primary Text): **Pass**
- [ ] Color Contrast (Secondary Data): **Fail** (Needs Review)
- [x] Focus Indicators: **Pass**
- [ ] Screen Reader Labels (Icon-only buttons): **Fail** (Aria-labels needed)


---

# PART 3: DETAILED UI VISUAL AUDIT REPORT

# UI/UX Audit Report - docs/screenshots

## Table of Contents
- Executive Summary
- Methodology
- Findings by Category
- Per-Screenshot Findings
- Consistency / Drift Analysis
- Coverage Matrix
- Issue Ledger
- Action Plan
- Code Examples
- Mockups
- Design Token Harvest
- Appendix

## Executive Summary
- Strong visual cohesion across dark panels and neon accents; the UI reads as a single system.
- Large proportion of screenshots show low luminance variance (avg std_lum 27.1); contrast may be thin for microcopy.
- Control density is high; edge_density avg 0.138 with some dense outliers that can raise cognitive load.
- State coverage is good for hover/focus/empty, but true error/disabled coverage is limited in filenames.
- Many atomic controls are under 44px; verify touch targets for mobile layouts.

Critical recommendations:
1. Run a targeted contrast pass on small text, disabled states, and microcopy; confirm WCAG 2.2 AA.
2. Normalize action semantics (save/load/delete/reset) with consistent color and label hierarchy across panels.
3. Consolidate dense header/toolbars into grouped clusters with separators and clearer labels.
4. Ensure mobile touch targets >= 44px for atomic icons and toggles.
5. Add explicit error-state captures for forms and destructive actions to complete the state matrix.

## Methodology
- Screenshots source: /home/wtyler/circuitmind-ai/docs/screenshots (543 PNG files)
- Contact sheets generated via montage for full-collection visual sweep (28 sheets).
- Metrics computed via PIL + numpy: mean_lum, std_lum, white_ratio, edge_density (gradient threshold).
- Metadata via identify, exiftool, pngcheck; pHash for duplicate clustering.
- OCR explicitly skipped per user request (text length marked as "skipped").
- PNG optimization scan aborted to avoid long runtime; can be rerun if needed.
- No BASELINE_DIR provided: regression diffs not executed.
- No BASE_URL provided: Lighthouse/pa11y not executed.

## Findings by Category

1) Visual Design Analysis
- Evidence: 01-app-shell/app-full-page.png, 02-header/header-full.png, 03-panels/inventory-addnew-panel.png, 02-canvas-views/001_2d-diagram-generated_1920x1080.png
- Current state: strong dark theme with teal accents; avg mean_lum 30.1 indicates low overall brightness.
- Issues: thin contrast in microcopy and disabled states (std_lum < 10 in many captures). Severity: Medium.
- Reasoning: automated luminance variance + visual review of contact sheets.
- Recommendations:
  1. Introduce a slightly brighter secondary text token for microcopy and disabled labels.
  2. Reserve neon accent for primary actions only; use muted cyan for tertiary actions.
  3. Increase line-height for body microcopy by 1-2px to improve legibility.
- Priority: High. Effort: Medium.

2) Information Architecture Analysis
- Evidence: 03-inventory/04-tab-list-view.png, 03-panels/inventory-tab-list.png, 05-chat/chat-mode-button.png
- Current state: panel tabs and header actions are present; labeling is minimal.
- Issues: header actions and panel actions are close in style, reducing hierarchy. Severity: Medium.
- Reasoning: visual grouping from contact sheets.
- Recommendations:
  1. Add action grouping with separators and subtle background blocks.
  2. Add short labels or tooltips for icon-only actions to reduce recall burden.
- Priority: Medium. Effort: Low.

3) Interactive Elements Analysis
- Evidence: 08-buttons/*, 10-forms/*, 08-canvas/01-zoom-in-btn.png
- Current state: extensive state coverage for buttons/inputs (hover/focus/checked/unchecked).
- Issues: some atomic controls below 44px; touch target sizing risk. Severity: Low.
- Reasoning: metrics-based size scan + per-control review.
- Recommendations:
  1. Add invisible hit areas to icon buttons for mobile breakpoints.
  2. Standardize focus rings to a single thickness and color token.
- Priority: Medium. Effort: Low.

4) Technical Quality Assessment
- Evidence: pngcheck warning on 03-panels/inventory-header.png.
- Issues: zlib warning on PNG export (low risk). Severity: Low.
- Reasoning: pngcheck output.
- Recommendations: re-export the PNG with consistent zlib or rebuild asset pipeline.
- Priority: Low. Effort: Low.

5) User Experience Evaluation
- Evidence: 02-canvas-views/001_2d-diagram-generated_1920x1080.png, 07-responsive/*
- Current state: dense desktop UI with clear canvas centrality; responsive captures exist.
- Issues: empty/idle states are visible but limited in variety; error states rarely captured. Severity: Medium.
- Recommendations:
  1. Add explicit error state captures for input validation and action failures.
  2. Add contextual empty-state guidance in sidebars and diagram view.
- Priority: High. Effort: Medium.

## Per-Screenshot Findings
Checklist abbreviations: VH=Visual hierarchy, Grid=Alignment, Space=Spacing scale, Type=Typography, Cntr=Contrast, Cons=Consistency, Aff=Affordance, Fbk=Feedback state, Err=Error/empty/loading, Nav=Navigation awareness, Dens=Content density, Trunc=Truncation, Target=Touch target, A11y=Accessibility cues, Safety=Trust/safety cues

| Screenshot | Description | VH | Grid | Space | Type | Cntr | Cons | Aff | Fbk | Err | Nav | Dens | Trunc | Target | A11y | Safety |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `01-app-shell/001_empty-state_default_1920x1080.png` | 01-app-shell: 001 empty state default 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/01-default.png` | 01-app-shell: 01 default | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/02-fullpage.png` | 01-app-shell: 02 fullpage | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/03-1920x1080.png` | 01-app-shell: 03 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/04-1440x900.png` | 01-app-shell: 04 1440x900 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/05-1024x768.png` | 01-app-shell: 05 1024x768 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/06-tablet.png` | 01-app-shell: 06 tablet | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/07-mobile.png` | 01-app-shell: 07 mobile | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-1280x720.png` | 01-app-shell: app 1280x720 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-1440x900.png` | 01-app-shell: app 1440x900 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-1920x1080.png` | 01-app-shell: app 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-default-state.png` | 01-app-shell: app default state | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-full-page.png` | 01-app-shell: app full page | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `02-canvas-views/001_2d-diagram-generated_1920x1080.png` | 02-canvas-views: 001 2d diagram generated 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `02-canvas-views/002_3d-view_1920x1080.png` | 02-canvas-views: 002 3d view 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `02-header/01-header-full.png` | 02-header: 01 header full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `02-header/02-logo.png` | 02-header: 02 logo | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/03-btn-undo.png` | 02-header: 03 btn undo | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/04-btn-redo.png` | 02-header: 04 btn redo | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/05-btn-save.png` | 02-header: 05 btn save | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/06-btn-load.png` | 02-header: 06 btn load | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/07-btn-settings.png` | 02-header: 07 btn settings | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/header-full.png` | 02-header: header full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `02-header/load-button.png` | 02-header: load button | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/logo.png` | 02-header: logo | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/redo-button-disabled.png` | 02-header: redo button disabled | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `02-header/save-button.png` | 02-header: save button | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/settings-button.png` | 02-header: settings button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `02-header/undo-button-disabled.png` | 02-header: undo button disabled | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `02-header/voice-mode-button.png` | 02-header: voice mode button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `03-inventory/01-panel-open.png` | 03-inventory: 01 panel open | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-inventory/02-panel-locked.png` | 03-inventory: 02 panel locked | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-inventory/03-tab-add-new-btn.png` | 03-inventory: 03 tab add new btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-inventory/03-tab-list-btn.png` | 03-inventory: 03 tab list btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-inventory/03-tab-tools-btn.png` | 03-inventory: 03 tab tools btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-inventory/04-tab-add-new-view.png` | 03-inventory: 04 tab add new view | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-inventory/04-tab-list-view.png` | 03-inventory: 04 tab list view | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-inventory/04-tab-tools-view.png` | 03-inventory: 04 tab tools view | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-addnew-panel.png` | 03-panels: inventory addnew panel | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-category-actuator.png` | 03-panels: inventory category actuator | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-category-microcontroller.png` | 03-panels: inventory category microcontroller | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-category-other.png` | 03-panels: inventory category other | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-category-power.png` | 03-panels: inventory category power | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-category-sensor.png` | 03-panels: inventory category sensor | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-filter-active.png` | 03-panels: inventory filter active | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-filter-input.png` | 03-panels: inventory filter input | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-header.png` | 03-panels: inventory header | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-panel-locked.png` | 03-panels: inventory panel locked | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-panel-open.png` | 03-panels: inventory panel open | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-tab-addnew.png` | 03-panels: inventory tab addnew | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-tab-list.png` | 03-panels: inventory tab list | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-tab-tools.png` | 03-panels: inventory tab tools | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-tools-panel.png` | 03-panels: inventory tools panel | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-sidebars/001_inventory-panel_open_1920x1080.png` | 03-sidebars: 001 inventory panel open 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/01-arduino-uno-r35v-arduino--hover.png` | 04-components: 01 arduino uno r35v arduino  hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/01-arduino-uno-r35v-arduino-.png` | 04-components: 01 arduino uno r35v arduino  | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/02-arduino-mega-2560-r35v-ar-hover.png` | 04-components: 02 arduino mega 2560 r35v ar hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/02-arduino-mega-2560-r35v-ar.png` | 04-components: 02 arduino mega 2560 r35v ar | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/03-esp32-devkit-38-pin3-3v-d-hover.png` | 04-components: 03 esp32 devkit 38 pin3 3v d hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/03-esp32-devkit-38-pin3-3v-d.png` | 04-components: 03 esp32 devkit 38 pin3 3v d | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/04-nodemcu-esp8266-amica-v23-hover.png` | 04-components: 04 nodemcu esp8266 amica v23 hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/04-nodemcu-esp8266-amica-v23.png` | 04-components: 04 nodemcu esp8266 amica v23 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/05-sparkfun-blynk-boardesp82-hover.png` | 04-components: 05 sparkfun blynk boardesp82 hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/05-sparkfun-blynk-boardesp82.png` | 04-components: 05 sparkfun blynk boardesp82 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/06-dccduino-nanoarduino-nano-hover.png` | 04-components: 06 dccduino nanoarduino nano hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/06-dccduino-nanoarduino-nano.png` | 04-components: 06 dccduino nanoarduino nano | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/07-hc-sr04-ultrasonic-sensor-hover.png` | 04-components: 07 hc sr04 ultrasonic sensor hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/07-hc-sr04-ultrasonic-sensor.png` | 04-components: 07 hc sr04 ultrasonic sensor | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/08-hc-sr501-pir-motion-senso-hover.png` | 04-components: 08 hc sr501 pir motion senso hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/08-hc-sr501-pir-motion-senso.png` | 04-components: 08 hc sr501 pir motion senso | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/09-dht11-temperature---humid-hover.png` | 04-components: 09 dht11 temperature   humid hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/09-dht11-temperature---humid.png` | 04-components: 09 dht11 temperature   humid | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/10-gy-521-mpu6050-6-dof-imu6-hover.png` | 04-components: 10 gy 521 mpu6050 6 dof imu6 hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/10-gy-521-mpu6050-6-dof-imu6.png` | 04-components: 10 gy 521 mpu6050 6 dof imu6 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-full.png` | 04-modals: component editor full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-tab-3d-model.png` | 04-modals: component editor tab 3d model | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-tab-edit.png` | 04-modals: component editor tab edit | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-tab-image.png` | 04-modals: component editor tab image | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-tab-info.png` | 04-modals: component editor tab info | Fail | Pass | Pass | Fail | Fail | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/settings-apikey-tab.png` | 04-modals: settings apikey tab | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/settings-autonomy-tab.png` | 04-modals: settings autonomy tab | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/settings-modal-full.png` | 04-modals: settings modal full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-settings-modal/001_settings-api-key_1920x1080.png` | 04-settings-modal: 001 settings api key 1920x1080 | Fail | Pass | Pass | Fail | Fail | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-settings-modal/002_settings-ai-autonomy_1920x1080.png` | 04-settings-modal: 002 settings ai autonomy 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-settings-modal/003_settings-layout_1920x1080.png` | 04-settings-modal: 003 settings layout 1920x1080 | Pass | Pass | Pass | Pass | Fail | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-chat/chat-attach-button.png` | 05-chat: chat attach button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/chat-deep-thinking-toggle.png` | 05-chat: chat deep thinking toggle | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/chat-input-empty.png` | 05-chat: chat input empty | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `05-chat/chat-input-with-text.png` | 05-chat: chat input with text | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `05-chat/chat-minimize-button.png` | 05-chat: chat minimize button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/chat-minimized.png` | 05-chat: chat minimized | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-chat/chat-mode-button.png` | 05-chat: chat mode button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/chat-session-button.png` | 05-chat: chat session button | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `05-chat/image-mode-button.png` | 05-chat: image mode button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/video-mode-button.png` | 05-chat: video mode button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-component-editor/001_component-editor-info_1920x1080.png` | 05-component-editor: 001 component editor info 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-component-editor/002_component-editor-edit_1920x1080.png` | 05-component-editor: 002 component editor edit 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/01-editor-full.png` | 05-modals: 01 editor full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/02-editor-tab-3d-model.png` | 05-modals: 02 editor tab 3d model | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/02-editor-tab-edit.png` | 05-modals: 02 editor tab edit | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/02-editor-tab-image.png` | 05-modals: 02 editor tab image | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/02-editor-tab-info.png` | 05-modals: 02 editor tab info | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/04-ai-assistant-btn.png` | 05-modals: 04 ai assistant btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `05-modals/05-editor-with-ai-chat.png` | 05-modals: 05 editor with ai chat | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-canvas/canvas-awaiting-message.png` | 06-canvas: canvas awaiting message | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `06-canvas/canvas-dragdrop-hint.png` | 06-canvas: canvas dragdrop hint | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-canvas/canvas-empty.png` | 06-canvas: canvas empty | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | Pass | NA | NA |
| `06-interactive-states/001_conversation-switcher-dropdown_1920x1080.png` | 06-interactive-states: 001 conversation switcher dropdown 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-settings/01-settings-full.png` | 06-settings: 01 settings full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-settings/02-tab-ai-autonomy.png` | 06-settings: 02 tab ai autonomy | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-settings/02-tab-api-key.png` | 06-settings: 02 tab api key | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-chat/01-panel-full.png` | 07-chat: 01 panel full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-chat/02-input.png` | 07-chat: 02 input | Pass | Pass | Pass | Pass | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/03-mode-selector.png` | 07-chat: 03 mode selector | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/04-mode-btn-1.png` | 07-chat: 04 mode btn 1 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/04-mode-btn-2.png` | 07-chat: 04 mode btn 2 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/04-mode-btn-3.png` | 07-chat: 04 mode btn 3 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/05-send-btn.png` | 07-chat: 05 send btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/06-upload-btn.png` | 07-chat: 06 upload btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/07-messages-area.png` | 07-chat: 07 messages area | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-0.png` | 07-inventory-components: component 0 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-1.png` | 07-inventory-components: component 1 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-2.png` | 07-inventory-components: component 2 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-inventory-components/component-3.png` | 07-inventory-components: component 3 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-4.png` | 07-inventory-components: component 4 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-5.png` | 07-inventory-components: component 5 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-inventory-components/component-6.png` | 07-inventory-components: component 6 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-7.png` | 07-inventory-components: component 7 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-8.png` | 07-inventory-components: component 8 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-responsive/001_2d-diagram_1440x900.png` | 07-responsive: 001 2d diagram 1440x900 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/002_2d-diagram_1024x768.png` | 07-responsive: 002 2d diagram 1024x768 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/003_2d-diagram_768x1024_tablet.png` | 07-responsive: 003 2d diagram 768x1024 tablet | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/004_2d-diagram_430x932_mobile.png` | 07-responsive: 004 2d diagram 430x932 mobile | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/005_2d-diagram_393x852_mobile.png` | 07-responsive: 005 2d diagram 393x852 mobile | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/006_2d-diagram_375x667_mobile-se.png` | 07-responsive: 006 2d diagram 375x667 mobile se | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/007_2d-diagram_320x568_mobile-legacy.png` | 07-responsive: 007 2d diagram 320x568 mobile legacy | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `08-buttons/--normal.png` | 08-buttons:   normal | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/add-new-normal.png` | 08-buttons: add new normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/add-to-diagram-normal.png` | 08-buttons: add to diagram normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/attach-image-or-video-hover.png` | 08-buttons: attach image or video hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/attach-image-or-video-normal.png` | 08-buttons: attach image or video normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-0-hover.png` | 08-buttons: btn 0 hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-0-normal.png` | 08-buttons: btn 0 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-10-normal.png` | 08-buttons: btn 10 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-100-normal.png` | 08-buttons: btn 100 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-101-normal.png` | 08-buttons: btn 101 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-104-normal.png` | 08-buttons: btn 104 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-105-normal.png` | 08-buttons: btn 105 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-106-normal.png` | 08-buttons: btn 106 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-107-normal.png` | 08-buttons: btn 107 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-11-normal.png` | 08-buttons: btn 11 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-110-normal.png` | 08-buttons: btn 110 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-111-normal.png` | 08-buttons: btn 111 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-112-normal.png` | 08-buttons: btn 112 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-113-normal.png` | 08-buttons: btn 113 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-116-normal.png` | 08-buttons: btn 116 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-117-normal.png` | 08-buttons: btn 117 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-118-normal.png` | 08-buttons: btn 118 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-119-normal.png` | 08-buttons: btn 119 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-122-normal.png` | 08-buttons: btn 122 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-123-normal.png` | 08-buttons: btn 123 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-124-normal.png` | 08-buttons: btn 124 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-125-normal.png` | 08-buttons: btn 125 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-128-normal.png` | 08-buttons: btn 128 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-129-normal.png` | 08-buttons: btn 129 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-130-normal.png` | 08-buttons: btn 130 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-131-normal.png` | 08-buttons: btn 131 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-134-normal.png` | 08-buttons: btn 134 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-135-normal.png` | 08-buttons: btn 135 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-136-normal.png` | 08-buttons: btn 136 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-137-normal.png` | 08-buttons: btn 137 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-14-normal.png` | 08-buttons: btn 14 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-140-normal.png` | 08-buttons: btn 140 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-141-normal.png` | 08-buttons: btn 141 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-142-normal.png` | 08-buttons: btn 142 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-143-normal.png` | 08-buttons: btn 143 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-146-normal.png` | 08-buttons: btn 146 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-147-normal.png` | 08-buttons: btn 147 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-148-normal.png` | 08-buttons: btn 148 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-149-normal.png` | 08-buttons: btn 149 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-15-normal.png` | 08-buttons: btn 15 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-152-normal.png` | 08-buttons: btn 152 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-153-normal.png` | 08-buttons: btn 153 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-154-normal.png` | 08-buttons: btn 154 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-155-normal.png` | 08-buttons: btn 155 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-158-normal.png` | 08-buttons: btn 158 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-159-normal.png` | 08-buttons: btn 159 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-16-normal.png` | 08-buttons: btn 16 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-160-normal.png` | 08-buttons: btn 160 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-161-normal.png` | 08-buttons: btn 161 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-164-normal.png` | 08-buttons: btn 164 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-165-normal.png` | 08-buttons: btn 165 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-166-normal.png` | 08-buttons: btn 166 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-167-normal.png` | 08-buttons: btn 167 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-17-normal.png` | 08-buttons: btn 17 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-170-normal.png` | 08-buttons: btn 170 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-171-normal.png` | 08-buttons: btn 171 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-172-normal.png` | 08-buttons: btn 172 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-173-normal.png` | 08-buttons: btn 173 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-176-normal.png` | 08-buttons: btn 176 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-177-normal.png` | 08-buttons: btn 177 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-178-normal.png` | 08-buttons: btn 178 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-179-normal.png` | 08-buttons: btn 179 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-182-normal.png` | 08-buttons: btn 182 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-183-normal.png` | 08-buttons: btn 183 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-184-normal.png` | 08-buttons: btn 184 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-185-normal.png` | 08-buttons: btn 185 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-188-normal.png` | 08-buttons: btn 188 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-189-normal.png` | 08-buttons: btn 189 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-190-normal.png` | 08-buttons: btn 190 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-191-normal.png` | 08-buttons: btn 191 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-194-normal.png` | 08-buttons: btn 194 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-195-normal.png` | 08-buttons: btn 195 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-196-normal.png` | 08-buttons: btn 196 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-197-normal.png` | 08-buttons: btn 197 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-2-normal.png` | 08-buttons: btn 2 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-20-normal.png` | 08-buttons: btn 20 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-200-normal.png` | 08-buttons: btn 200 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-201-normal.png` | 08-buttons: btn 201 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-202-normal.png` | 08-buttons: btn 202 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-203-normal.png` | 08-buttons: btn 203 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-206-normal.png` | 08-buttons: btn 206 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-207-normal.png` | 08-buttons: btn 207 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-208-normal.png` | 08-buttons: btn 208 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-209-normal.png` | 08-buttons: btn 209 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-21-normal.png` | 08-buttons: btn 21 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-212-normal.png` | 08-buttons: btn 212 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-213-normal.png` | 08-buttons: btn 213 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-214-normal.png` | 08-buttons: btn 214 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-215-normal.png` | 08-buttons: btn 215 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-218-normal.png` | 08-buttons: btn 218 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-219-normal.png` | 08-buttons: btn 219 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-22-normal.png` | 08-buttons: btn 22 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-220-normal.png` | 08-buttons: btn 220 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-221-normal.png` | 08-buttons: btn 221 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-224-normal.png` | 08-buttons: btn 224 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-225-normal.png` | 08-buttons: btn 225 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-226-normal.png` | 08-buttons: btn 226 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-227-normal.png` | 08-buttons: btn 227 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-23-normal.png` | 08-buttons: btn 23 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-230-normal.png` | 08-buttons: btn 230 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-231-normal.png` | 08-buttons: btn 231 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-232-normal.png` | 08-buttons: btn 232 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-233-normal.png` | 08-buttons: btn 233 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-236-normal.png` | 08-buttons: btn 236 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-237-normal.png` | 08-buttons: btn 237 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-238-normal.png` | 08-buttons: btn 238 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-239-normal.png` | 08-buttons: btn 239 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-242-normal.png` | 08-buttons: btn 242 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-243-normal.png` | 08-buttons: btn 243 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-244-normal.png` | 08-buttons: btn 244 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-245-normal.png` | 08-buttons: btn 245 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-248-normal.png` | 08-buttons: btn 248 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-249-normal.png` | 08-buttons: btn 249 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-250-normal.png` | 08-buttons: btn 250 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-251-normal.png` | 08-buttons: btn 251 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-254-normal.png` | 08-buttons: btn 254 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-255-normal.png` | 08-buttons: btn 255 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-256-normal.png` | 08-buttons: btn 256 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-257-normal.png` | 08-buttons: btn 257 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-26-normal.png` | 08-buttons: btn 26 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-260-normal.png` | 08-buttons: btn 260 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-261-normal.png` | 08-buttons: btn 261 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-262-normal.png` | 08-buttons: btn 262 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-263-normal.png` | 08-buttons: btn 263 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-266-normal.png` | 08-buttons: btn 266 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-267-normal.png` | 08-buttons: btn 267 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-268-normal.png` | 08-buttons: btn 268 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-269-normal.png` | 08-buttons: btn 269 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-27-normal.png` | 08-buttons: btn 27 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-272-normal.png` | 08-buttons: btn 272 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-273-normal.png` | 08-buttons: btn 273 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-274-normal.png` | 08-buttons: btn 274 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-275-normal.png` | 08-buttons: btn 275 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-278-normal.png` | 08-buttons: btn 278 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-279-normal.png` | 08-buttons: btn 279 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-28-normal.png` | 08-buttons: btn 28 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-280-normal.png` | 08-buttons: btn 280 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-281-normal.png` | 08-buttons: btn 281 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-284-normal.png` | 08-buttons: btn 284 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-285-normal.png` | 08-buttons: btn 285 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-286-normal.png` | 08-buttons: btn 286 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-287-normal.png` | 08-buttons: btn 287 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-29-normal.png` | 08-buttons: btn 29 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-290-normal.png` | 08-buttons: btn 290 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-291-normal.png` | 08-buttons: btn 291 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-292-normal.png` | 08-buttons: btn 292 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-293-normal.png` | 08-buttons: btn 293 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-296-normal.png` | 08-buttons: btn 296 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-297-normal.png` | 08-buttons: btn 297 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-298-normal.png` | 08-buttons: btn 298 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-299-normal.png` | 08-buttons: btn 299 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-302-normal.png` | 08-buttons: btn 302 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-303-normal.png` | 08-buttons: btn 303 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-304-normal.png` | 08-buttons: btn 304 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-305-normal.png` | 08-buttons: btn 305 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-308-normal.png` | 08-buttons: btn 308 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-309-normal.png` | 08-buttons: btn 309 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-310-normal.png` | 08-buttons: btn 310 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-311-normal.png` | 08-buttons: btn 311 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-314-normal.png` | 08-buttons: btn 314 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-315-normal.png` | 08-buttons: btn 315 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-316-normal.png` | 08-buttons: btn 316 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-317-normal.png` | 08-buttons: btn 317 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-32-normal.png` | 08-buttons: btn 32 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-320-normal.png` | 08-buttons: btn 320 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-321-normal.png` | 08-buttons: btn 321 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-322-normal.png` | 08-buttons: btn 322 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-33-normal.png` | 08-buttons: btn 33 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-34-normal.png` | 08-buttons: btn 34 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-35-normal.png` | 08-buttons: btn 35 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-38-normal.png` | 08-buttons: btn 38 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-39-normal.png` | 08-buttons: btn 39 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-40-normal.png` | 08-buttons: btn 40 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-41-normal.png` | 08-buttons: btn 41 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-44-normal.png` | 08-buttons: btn 44 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-45-normal.png` | 08-buttons: btn 45 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-46-normal.png` | 08-buttons: btn 46 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-47-normal.png` | 08-buttons: btn 47 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-50-normal.png` | 08-buttons: btn 50 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-51-normal.png` | 08-buttons: btn 51 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-52-normal.png` | 08-buttons: btn 52 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-53-normal.png` | 08-buttons: btn 53 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-56-normal.png` | 08-buttons: btn 56 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-57-normal.png` | 08-buttons: btn 57 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-58-normal.png` | 08-buttons: btn 58 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-59-normal.png` | 08-buttons: btn 59 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-62-normal.png` | 08-buttons: btn 62 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-63-normal.png` | 08-buttons: btn 63 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-64-normal.png` | 08-buttons: btn 64 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-65-normal.png` | 08-buttons: btn 65 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-68-normal.png` | 08-buttons: btn 68 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-69-normal.png` | 08-buttons: btn 69 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-70-normal.png` | 08-buttons: btn 70 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-71-normal.png` | 08-buttons: btn 71 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-74-normal.png` | 08-buttons: btn 74 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-75-normal.png` | 08-buttons: btn 75 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-76-normal.png` | 08-buttons: btn 76 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-77-normal.png` | 08-buttons: btn 77 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-8-normal.png` | 08-buttons: btn 8 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-80-normal.png` | 08-buttons: btn 80 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-81-normal.png` | 08-buttons: btn 81 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-82-normal.png` | 08-buttons: btn 82 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-83-normal.png` | 08-buttons: btn 83 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-86-normal.png` | 08-buttons: btn 86 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-87-normal.png` | 08-buttons: btn 87 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-88-normal.png` | 08-buttons: btn 88 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-89-normal.png` | 08-buttons: btn 89 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-9-normal.png` | 08-buttons: btn 9 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-92-normal.png` | 08-buttons: btn 92 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-93-normal.png` | 08-buttons: btn 93 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-94-normal.png` | 08-buttons: btn 94 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-95-normal.png` | 08-buttons: btn 95 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-98-normal.png` | 08-buttons: btn 98 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-99-normal.png` | 08-buttons: btn 99 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/chat-mode-hover.png` | 08-buttons: chat mode hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/chat-mode-normal.png` | 08-buttons: chat mode normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/circuitmind-session-hover.png` | 08-buttons: circuitmind session hover | Pass | Pass | Pass | NA | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/circuitmind-session-normal.png` | 08-buttons: circuitmind session normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/delete-item-normal.png` | 08-buttons: delete item normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/edit-details-normal.png` | 08-buttons: edit details normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/enable-deep-thinking-hover.png` | 08-buttons: enable deep thinking hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/enable-deep-thinking-normal.png` | 08-buttons: enable deep thinking normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/generate-thumbnail-normal.png` | 08-buttons: generate thumbnail normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/image-mode-hover.png` | 08-buttons: image mode hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/image-mode-normal.png` | 08-buttons: image mode normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/list-normal.png` | 08-buttons: list normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/load-hover.png` | 08-buttons: load hover | Pass | Pass | Pass | NA | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/load-normal.png` | 08-buttons: load normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/lock-sidebar-open-normal.png` | 08-buttons: lock sidebar open normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/minimize-chat-hover.png` | 08-buttons: minimize chat hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/minimize-chat-normal.png` | 08-buttons: minimize chat normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/open-inventory-hover.png` | 08-buttons: open inventory hover | Pass | Pass | Pass | Pass | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/open-inventory-normal.png` | 08-buttons: open inventory normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/open-settings-hover.png` | 08-buttons: open settings hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/open-settings-normal.png` | 08-buttons: open settings normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/redo-hover.png` | 08-buttons: redo hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/redo-normal.png` | 08-buttons: redo normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/save-hover.png` | 08-buttons: save hover | Pass | Pass | Pass | NA | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/save-normal.png` | 08-buttons: save normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/send-message-hover.png` | 08-buttons: send message hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/send-message-normal.png` | 08-buttons: send message normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/toggle-live-voice-mode-hover.png` | 08-buttons: toggle live voice mode hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/toggle-live-voice-mode-normal.png` | 08-buttons: toggle live voice mode normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/tools-normal.png` | 08-buttons: tools normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/undo-hover.png` | 08-buttons: undo hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/undo-normal.png` | 08-buttons: undo normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/video-mode-hover.png` | 08-buttons: video mode hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/video-mode-normal.png` | 08-buttons: video mode normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-canvas/01-zoom-in-btn.png` | 08-canvas: 01 zoom in btn | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-canvas/02-zoom-out-btn.png` | 08-canvas: 02 zoom out btn | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-canvas/03-reset-view-btn.png` | 08-canvas: 03 reset view btn | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-canvas/04-search-input.png` | 08-canvas: 04 search input | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-canvas/06-full-workspace.png` | 08-canvas: 06 full workspace | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `08-canvas/07-full-workspace.png` | 08-canvas: 07 full workspace | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `10-forms/ask-about-your-circuit----empty.png` | 10-forms: ask about your circuit    empty | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/ask-about-your-circuit----filled.png` | 10-forms: ask about your circuit    filled | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/ask-about-your-circuit----focus.png` | 10-forms: ask about your circuit    focus | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/checkbox-0-unchecked.png` | 10-forms: checkbox 0 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-1-unchecked.png` | 10-forms: checkbox 1 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-2-unchecked.png` | 10-forms: checkbox 2 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-3-unchecked.png` | 10-forms: checkbox 3 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-4-unchecked.png` | 10-forms: checkbox 4 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-5-unchecked.png` | 10-forms: checkbox 5 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-6-unchecked.png` | 10-forms: checkbox 6 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-7-unchecked.png` | 10-forms: checkbox 7 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-8-unchecked.png` | 10-forms: checkbox 8 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-9-unchecked.png` | 10-forms: checkbox 9 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/filter-assets----empty.png` | 10-forms: filter assets    empty | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/filter-assets----filled.png` | 10-forms: filter assets    filled | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/filter-assets----focus.png` | 10-forms: filter assets    focus | Pass | Pass | Pass | NA | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-1-empty.png` | 10-forms: input 1 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-1-focus.png` | 10-forms: input 1 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-10-empty.png` | 10-forms: input 10 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-10-focus.png` | 10-forms: input 10 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-11-empty.png` | 10-forms: input 11 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-11-focus.png` | 10-forms: input 11 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-12-empty.png` | 10-forms: input 12 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-12-focus.png` | 10-forms: input 12 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-13-empty.png` | 10-forms: input 13 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-13-focus.png` | 10-forms: input 13 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-14-empty.png` | 10-forms: input 14 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-14-focus.png` | 10-forms: input 14 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-15-empty.png` | 10-forms: input 15 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-15-focus.png` | 10-forms: input 15 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-16-empty.png` | 10-forms: input 16 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-16-focus.png` | 10-forms: input 16 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-17-empty.png` | 10-forms: input 17 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-17-focus.png` | 10-forms: input 17 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-18-empty.png` | 10-forms: input 18 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-18-focus.png` | 10-forms: input 18 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-19-empty.png` | 10-forms: input 19 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-19-focus.png` | 10-forms: input 19 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-2-empty.png` | 10-forms: input 2 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-2-focus.png` | 10-forms: input 2 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-20-empty.png` | 10-forms: input 20 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-20-focus.png` | 10-forms: input 20 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-21-empty.png` | 10-forms: input 21 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-21-focus.png` | 10-forms: input 21 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-22-empty.png` | 10-forms: input 22 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-22-focus.png` | 10-forms: input 22 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-23-empty.png` | 10-forms: input 23 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-23-focus.png` | 10-forms: input 23 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-24-empty.png` | 10-forms: input 24 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-24-focus.png` | 10-forms: input 24 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-25-empty.png` | 10-forms: input 25 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-25-focus.png` | 10-forms: input 25 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-26-empty.png` | 10-forms: input 26 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-26-focus.png` | 10-forms: input 26 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-27-empty.png` | 10-forms: input 27 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-27-focus.png` | 10-forms: input 27 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-28-empty.png` | 10-forms: input 28 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-28-focus.png` | 10-forms: input 28 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-29-empty.png` | 10-forms: input 29 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-29-focus.png` | 10-forms: input 29 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-3-empty.png` | 10-forms: input 3 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-3-focus.png` | 10-forms: input 3 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-30-empty.png` | 10-forms: input 30 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-30-focus.png` | 10-forms: input 30 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-31-empty.png` | 10-forms: input 31 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-31-focus.png` | 10-forms: input 31 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-32-empty.png` | 10-forms: input 32 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-32-focus.png` | 10-forms: input 32 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-33-empty.png` | 10-forms: input 33 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-33-focus.png` | 10-forms: input 33 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-34-empty.png` | 10-forms: input 34 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-34-focus.png` | 10-forms: input 34 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-35-empty.png` | 10-forms: input 35 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-35-focus.png` | 10-forms: input 35 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-36-empty.png` | 10-forms: input 36 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-36-focus.png` | 10-forms: input 36 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-37-empty.png` | 10-forms: input 37 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-37-focus.png` | 10-forms: input 37 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-38-empty.png` | 10-forms: input 38 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-38-focus.png` | 10-forms: input 38 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-39-empty.png` | 10-forms: input 39 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-39-focus.png` | 10-forms: input 39 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-4-empty.png` | 10-forms: input 4 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-4-focus.png` | 10-forms: input 4 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-40-empty.png` | 10-forms: input 40 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-40-focus.png` | 10-forms: input 40 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-41-empty.png` | 10-forms: input 41 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-41-focus.png` | 10-forms: input 41 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-42-empty.png` | 10-forms: input 42 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-42-focus.png` | 10-forms: input 42 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-43-empty.png` | 10-forms: input 43 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-43-focus.png` | 10-forms: input 43 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-44-empty.png` | 10-forms: input 44 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-44-focus.png` | 10-forms: input 44 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-45-empty.png` | 10-forms: input 45 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-45-focus.png` | 10-forms: input 45 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-46-empty.png` | 10-forms: input 46 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-46-focus.png` | 10-forms: input 46 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-47-empty.png` | 10-forms: input 47 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-47-focus.png` | 10-forms: input 47 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-48-empty.png` | 10-forms: input 48 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-48-focus.png` | 10-forms: input 48 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-49-empty.png` | 10-forms: input 49 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-49-focus.png` | 10-forms: input 49 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-5-empty.png` | 10-forms: input 5 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-5-focus.png` | 10-forms: input 5 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-50-empty.png` | 10-forms: input 50 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-50-focus.png` | 10-forms: input 50 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-51-empty.png` | 10-forms: input 51 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-51-focus.png` | 10-forms: input 51 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-52-empty.png` | 10-forms: input 52 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-52-focus.png` | 10-forms: input 52 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-53-empty.png` | 10-forms: input 53 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-53-focus.png` | 10-forms: input 53 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-54-empty.png` | 10-forms: input 54 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-54-focus.png` | 10-forms: input 54 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-55-empty.png` | 10-forms: input 55 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-55-focus.png` | 10-forms: input 55 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-56-empty.png` | 10-forms: input 56 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-56-focus.png` | 10-forms: input 56 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-57-empty.png` | 10-forms: input 57 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-57-focus.png` | 10-forms: input 57 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-58-empty.png` | 10-forms: input 58 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-58-focus.png` | 10-forms: input 58 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-59-empty.png` | 10-forms: input 59 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-59-focus.png` | 10-forms: input 59 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-6-empty.png` | 10-forms: input 6 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-6-focus.png` | 10-forms: input 6 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-60-empty.png` | 10-forms: input 60 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-60-focus.png` | 10-forms: input 60 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-61-empty.png` | 10-forms: input 61 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-61-focus.png` | 10-forms: input 61 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-62-empty.png` | 10-forms: input 62 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-62-focus.png` | 10-forms: input 62 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-7-empty.png` | 10-forms: input 7 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-7-focus.png` | 10-forms: input 7 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-8-empty.png` | 10-forms: input 8 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-8-focus.png` | 10-forms: input 8 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-9-empty.png` | 10-forms: input 9 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-9-focus.png` | 10-forms: input 9 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `12-typography/h1-0.png` | 12-typography: h1 0 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h2-0.png` | 12-typography: h2 0 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-0.png` | 12-typography: h3 0 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-1.png` | 12-typography: h3 1 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-2.png` | 12-typography: h3 2 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-3.png` | 12-typography: h3 3 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-4.png` | 12-typography: h3 4 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-5.png` | 12-typography: h3 5 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |

Per-screenshot details:

### `01-app-shell/001_empty-state_default_1920x1080.png`
- Description: 01-app-shell: 001 empty state default 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=Pass, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=759720 bytes, OCR=skipped, edge_density=0.203, mean_lum=11.2, std_lum=11.2, white_ratio=0.000, phash=d4f0e9292d2b3b4c

### `01-app-shell/01-default.png`
- Description: 01-app-shell: 01 default
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37450 bytes, OCR=skipped, edge_density=0.029, mean_lum=27.8, std_lum=13.7, white_ratio=0.000, phash=c87ee26ee862e20b

### `01-app-shell/02-fullpage.png`
- Description: 01-app-shell: 02 fullpage
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=40220 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.5, std_lum=16.6, white_ratio=0.000, phash=c87ae83ea627a24b

### `01-app-shell/03-1920x1080.png`
- Description: 01-app-shell: 03 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1920x1080, file_size=45204 bytes, OCR=skipped, edge_density=0.018, mean_lum=27.1, std_lum=12.4, white_ratio=0.000, phash=e26eea7ab8389819

### `01-app-shell/04-1440x900.png`
- Description: 01-app-shell: 04 1440x900
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1440x900, file_size=42508 bytes, OCR=skipped, edge_density=0.025, mean_lum=28.2, std_lum=14.5, white_ratio=0.000, phash=e868e87ab233b323

### `01-app-shell/05-1024x768.png`
- Description: 01-app-shell: 05 1024x768
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1024x768, file_size=39867 bytes, OCR=skipped, edge_density=0.036, mean_lum=29.7, std_lum=17.3, white_ratio=0.000, phash=c0f8e02eac2fae4e

### `01-app-shell/06-tablet.png`
- Description: 01-app-shell: 06 tablet
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 768x1024, file_size=42125 bytes, OCR=skipped, edge_density=0.034, mean_lum=28.8, std_lum=16.8, white_ratio=0.000, phash=c0f0f079a82fa83f

### `01-app-shell/07-mobile.png`
- Description: 01-app-shell: 07 mobile
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 375x812, file_size=29285 bytes, OCR=skipped, edge_density=0.057, mean_lum=31.2, std_lum=23.1, white_ratio=0.001, phash=80c8c06e637ee37e

### `01-app-shell/app-1280x720.png`
- Description: 01-app-shell: app 1280x720
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37933 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `01-app-shell/app-1440x900.png`
- Description: 01-app-shell: app 1440x900
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1440x900, file_size=40254 bytes, OCR=skipped, edge_density=0.025, mean_lum=27.8, std_lum=15.6, white_ratio=0.000, phash=e86dea37b233a203

### `01-app-shell/app-1920x1080.png`
- Description: 01-app-shell: app 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1920x1080, file_size=43155 bytes, OCR=skipped, edge_density=0.018, mean_lum=26.6, std_lum=13.2, white_ratio=0.000, phash=e266ea7ab819b819

### `01-app-shell/app-default-state.png`
- Description: 01-app-shell: app default state
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=35957 bytes, OCR=skipped, edge_density=0.029, mean_lum=27.8, std_lum=16.4, white_ratio=0.000, phash=c86fe24de867e20c

### `01-app-shell/app-full-page.png`
- Description: 01-app-shell: app full page
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37933 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `02-canvas-views/001_2d-diagram-generated_1920x1080.png`
- Description: 02-canvas-views: 001 2d diagram generated 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272890 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `02-canvas-views/002_3d-view_1920x1080.png`
- Description: 02-canvas-views: 002 3d view 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=940439 bytes, OCR=skipped, edge_density=0.179, mean_lum=49.2, std_lum=50.1, white_ratio=0.006, phash=c3c3673e3c3c3c28

### `02-header/01-header-full.png`
- Description: 02-header: 01 header full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x56, file_size=8410 bytes, OCR=skipped, edge_density=0.070, mean_lum=25.5, std_lum=24.3, white_ratio=0.004, phash=eb7f0003ff7f0101

### `02-header/02-logo.png`
- Description: 02-header: 02 logo
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 158x33, file_size=3034 bytes, OCR=skipped, edge_density=0.286, mean_lum=57.6, std_lum=73.0, white_ratio=0.057, phash=8d1270ade49b8b76

### `02-header/03-btn-undo.png`
- Description: 02-header: 03 btn undo
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 33x33, file_size=369 bytes, OCR=skipped, edge_density=0.077, mean_lum=21.4, std_lum=6.5, white_ratio=0.000, phash=cecd31b2cecd3032

### `02-header/04-btn-redo.png`
- Description: 02-header: 04 btn redo
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 33x33, file_size=338 bytes, OCR=skipped, edge_density=0.072, mean_lum=21.4, std_lum=6.5, white_ratio=0.000, phash=9b1864e79a986567

### `02-header/05-btn-save.png`
- Description: 02-header: 05 btn save
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Add grouping or reduce simultaneous highlights to lower visual noise.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 56x27, file_size=1019 bytes, OCR=skipped, edge_density=0.351, mean_lum=52.9, std_lum=32.8, white_ratio=0.000, phash=ce74314fc633944e

### `02-header/06-btn-load.png`
- Description: 02-header: 06 btn load
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 57x27, file_size=933 bytes, OCR=skipped, edge_density=0.312, mean_lum=46.4, std_lum=16.7, white_ratio=0.000, phash=db3c6543d13cc42b

### `02-header/07-btn-settings.png`
- Description: 02-header: 07 btn settings
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Add grouping or reduce simultaneous highlights to lower visual noise.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 38x39, file_size=1590 bytes, OCR=skipped, edge_density=0.352, mean_lum=46.8, std_lum=31.0, white_ratio=0.000, phash=cf34209ecf3cc964

### `02-header/header-full.png`
- Description: 02-header: header full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37903 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.3, std_lum=17.6, white_ratio=0.000, phash=e84bea26a627ca4b

### `02-header/load-button.png`
- Description: 02-header: load button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 57x27, file_size=839 bytes, OCR=skipped, edge_density=0.301, mean_lum=46.1, std_lum=16.6, white_ratio=0.000, phash=df3c6543d138c42b

### `02-header/logo.png`
- Description: 02-header: logo
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 158x33, file_size=3000 bytes, OCR=skipped, edge_density=0.282, mean_lum=57.1, std_lum=72.5, white_ratio=0.054, phash=8d1072ade59b8b72

### `02-header/redo-button-disabled.png`
- Description: 02-header: redo button disabled
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
  - Low: Disabled state captured; confirm contrast is still legible.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
  - Increase text/icon contrast or lighten panel surface for small typography.
- Metrics: Dimensions: 45x45, file_size=414 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=9b3964c69b196666

### `02-header/save-button.png`
- Description: 02-header: save button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 56x27, file_size=954 bytes, OCR=skipped, edge_density=0.334, mean_lum=52.2, std_lum=32.4, white_ratio=0.000, phash=ce3031cfc632b46d

### `02-header/settings-button.png`
- Description: 02-header: settings button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1730 bytes, OCR=skipped, edge_density=0.284, mean_lum=44.2, std_lum=27.2, white_ratio=0.000, phash=cd2120dfcb784c75

### `02-header/undo-button-disabled.png`
- Description: 02-header: undo button disabled
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
  - Low: Disabled state captured; confirm contrast is still legible.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
  - Increase text/icon contrast or lighten panel surface for small typography.
- Metrics: Dimensions: 45x45, file_size=457 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=cc6c33b3cc4c3333

### `02-header/voice-mode-button.png`
- Description: 02-header: voice mode button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1556 bytes, OCR=skipped, edge_density=0.268, mean_lum=43.3, std_lum=25.8, white_ratio=0.000, phash=cc2323dd8b74cc96

### `03-inventory/01-panel-open.png`
- Description: 03-inventory: 01 panel open
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=111405 bytes, OCR=skipped, edge_density=0.091, mean_lum=30.1, std_lum=25.4, white_ratio=0.002, phash=9f678f7aea682041

### `03-inventory/02-panel-locked.png`
- Description: 03-inventory: 02 panel locked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=111729 bytes, OCR=skipped, edge_density=0.091, mean_lum=30.1, std_lum=25.5, white_ratio=0.002, phash=9f678f7aea682041

### `03-inventory/03-tab-add-new-btn.png`
- Description: 03-inventory: 03 tab add new btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1087 bytes, OCR=skipped, edge_density=0.170, mean_lum=158.3, std_lum=40.5, white_ratio=0.000, phash=e465939e6467913c

### `03-inventory/03-tab-list-btn.png`
- Description: 03-inventory: 03 tab list btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=609 bytes, OCR=skipped, edge_density=0.078, mean_lum=166.4, std_lum=26.8, white_ratio=0.000, phash=b666cd9933664433

### `03-inventory/03-tab-tools-btn.png`
- Description: 03-inventory: 03 tab tools btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=892 bytes, OCR=skipped, edge_density=0.119, mean_lum=163.4, std_lum=32.6, white_ratio=0.000, phash=e5399cc665391167

### `03-inventory/04-tab-add-new-view.png`
- Description: 03-inventory: 04 tab add new view
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=94021 bytes, OCR=skipped, edge_density=0.081, mean_lum=28.8, std_lum=23.8, white_ratio=0.001, phash=8e60cc6be82be30f

### `03-inventory/04-tab-list-view.png`
- Description: 03-inventory: 04 tab list view
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=111720 bytes, OCR=skipped, edge_density=0.091, mean_lum=30.1, std_lum=25.5, white_ratio=0.002, phash=9f678f7aea682041

### `03-inventory/04-tab-tools-view.png`
- Description: 03-inventory: 04 tab tools view
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=80808 bytes, OCR=skipped, edge_density=0.070, mean_lum=28.5, std_lum=22.6, white_ratio=0.001, phash=8ef08760ea783a5d

### `03-panels/inventory-addnew-panel.png`
- Description: 03-panels: inventory addnew panel
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37899 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `03-panels/inventory-category-actuator.png`
- Description: 03-panels: inventory category actuator
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-category-microcontroller.png`
- Description: 03-panels: inventory category microcontroller
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-category-other.png`
- Description: 03-panels: inventory category other
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-category-power.png`
- Description: 03-panels: inventory category power
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-category-sensor.png`
- Description: 03-panels: inventory category sensor
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-filter-active.png`
- Description: 03-panels: inventory filter active
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37899 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `03-panels/inventory-filter-input.png`
- Description: 03-panels: inventory filter input
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x34, file_size=3459 bytes, OCR=skipped, edge_density=0.140, mean_lum=36.9, std_lum=52.3, white_ratio=0.025, phash=c03fc1c43bbcc13e

### `03-panels/inventory-header.png`
- Description: 03-panels: inventory header
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: High white ratio; possible export artifact or missing background.
  - Low: Small target (<44px); verify touch sizing on mobile.
- Recommendations:
  - Add grouping or reduce simultaneous highlights to lower visual noise.
  - Re-capture with correct background or ensure transparency renders to dark.
- Metrics: Dimensions: 186x28, file_size=3402 bytes, OCR=skipped, edge_density=0.559, mean_lum=72.3, std_lum=89.2, white_ratio=0.143, phash=83ce7cb1327f8388

### `03-panels/inventory-panel-locked.png`
- Description: 03-panels: inventory panel locked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=65690 bytes, OCR=skipped, edge_density=0.075, mean_lum=28.7, std_lum=23.7, white_ratio=0.002, phash=9edf8e78aa618701

### `03-panels/inventory-panel-open.png`
- Description: 03-panels: inventory panel open
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=67191 bytes, OCR=skipped, edge_density=0.075, mean_lum=29.4, std_lum=23.9, white_ratio=0.002, phash=9edf8e70ea618740

### `03-panels/inventory-tab-addnew.png`
- Description: 03-panels: inventory tab addnew
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `03-panels/inventory-tab-list.png`
- Description: 03-panels: inventory tab list
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `03-panels/inventory-tab-tools.png`
- Description: 03-panels: inventory tab tools
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `03-panels/inventory-tools-panel.png`
- Description: 03-panels: inventory tools panel
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37899 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `03-sidebars/001_inventory-panel_open_1920x1080.png`
- Description: 03-sidebars: 001 inventory panel open 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=724299 bytes, OCR=skipped, edge_density=0.196, mean_lum=11.6, std_lum=14.3, white_ratio=0.000, phash=d781a329396a7a5c

### `04-components/01-arduino-uno-r35v-arduino--hover.png`
- Description: 04-components: 01 arduino uno r35v arduino  hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7068 bytes, OCR=skipped, edge_density=0.163, mean_lum=47.8, std_lum=33.0, white_ratio=0.008, phash=fefe6c0000019fdf

### `04-components/01-arduino-uno-r35v-arduino-.png`
- Description: 04-components: 01 arduino uno r35v arduino 
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6031 bytes, OCR=skipped, edge_density=0.145, mean_lum=29.0, std_lum=35.8, white_ratio=0.008, phash=ecfc3f0100031fdf

### `04-components/02-arduino-mega-2560-r35v-ar-hover.png`
- Description: 04-components: 02 arduino mega 2560 r35v ar hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7296 bytes, OCR=skipped, edge_density=0.177, mean_lum=47.8, std_lum=33.5, white_ratio=0.008, phash=fefe240101019fdf

### `04-components/02-arduino-mega-2560-r35v-ar.png`
- Description: 04-components: 02 arduino mega 2560 r35v ar
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6221 bytes, OCR=skipped, edge_density=0.159, mean_lum=29.3, std_lum=36.6, white_ratio=0.008, phash=ecfc370220031fdf

### `04-components/03-esp32-devkit-38-pin3-3v-d-hover.png`
- Description: 04-components: 03 esp32 devkit 38 pin3 3v d hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7560 bytes, OCR=skipped, edge_density=0.168, mean_lum=48.4, std_lum=33.8, white_ratio=0.008, phash=fefe6c010001b79f

### `04-components/03-esp32-devkit-38-pin3-3v-d.png`
- Description: 04-components: 03 esp32 devkit 38 pin3 3v d
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6574 bytes, OCR=skipped, edge_density=0.150, mean_lum=29.7, std_lum=37.4, white_ratio=0.008, phash=ecfc1f0100313f9f

### `04-components/04-nodemcu-esp8266-amica-v23-hover.png`
- Description: 04-components: 04 nodemcu esp8266 amica v23 hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7562 bytes, OCR=skipped, edge_density=0.181, mean_lum=48.1, std_lum=34.0, white_ratio=0.008, phash=fefe0c010001bfdf

### `04-components/04-nodemcu-esp8266-amica-v23.png`
- Description: 04-components: 04 nodemcu esp8266 amica v23
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6541 bytes, OCR=skipped, edge_density=0.163, mean_lum=29.7, std_lum=37.6, white_ratio=0.008, phash=ecfc1f0020233fcf

### `04-components/05-sparkfun-blynk-boardesp82-hover.png`
- Description: 04-components: 05 sparkfun blynk boardesp82 hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7386 bytes, OCR=skipped, edge_density=0.165, mean_lum=48.1, std_lum=33.3, white_ratio=0.008, phash=fefe7c0000011fdf

### `04-components/05-sparkfun-blynk-boardesp82.png`
- Description: 04-components: 05 sparkfun blynk boardesp82
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6382 bytes, OCR=skipped, edge_density=0.147, mean_lum=29.4, std_lum=36.4, white_ratio=0.008, phash=ecfc3f0000033fdf

### `04-components/06-dccduino-nanoarduino-nano-hover.png`
- Description: 04-components: 06 dccduino nanoarduino nano hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7006 bytes, OCR=skipped, edge_density=0.176, mean_lum=47.7, std_lum=33.5, white_ratio=0.008, phash=fefe240101019fdf

### `04-components/06-dccduino-nanoarduino-nano.png`
- Description: 04-components: 06 dccduino nanoarduino nano
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=5962 bytes, OCR=skipped, edge_density=0.157, mean_lum=29.1, std_lum=36.5, white_ratio=0.008, phash=ecfc3f0100013fdf

### `04-components/07-hc-sr04-ultrasonic-sensor-hover.png`
- Description: 04-components: 07 hc sr04 ultrasonic sensor hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6908 bytes, OCR=skipped, edge_density=0.162, mean_lum=47.7, std_lum=32.7, white_ratio=0.008, phash=fefee0010101b3df

### `04-components/07-hc-sr04-ultrasonic-sensor.png`
- Description: 04-components: 07 hc sr04 ultrasonic sensor
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=5879 bytes, OCR=skipped, edge_density=0.144, mean_lum=29.0, std_lum=35.8, white_ratio=0.008, phash=ecfcb60100313bdf

### `04-components/08-hc-sr501-pir-motion-senso-hover.png`
- Description: 04-components: 08 hc sr501 pir motion senso hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6731 bytes, OCR=skipped, edge_density=0.171, mean_lum=47.4, std_lum=32.9, white_ratio=0.008, phash=fefec0010101b7df

### `04-components/08-hc-sr501-pir-motion-senso.png`
- Description: 04-components: 08 hc sr501 pir motion senso
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=5691 bytes, OCR=skipped, edge_density=0.154, mean_lum=28.9, std_lum=35.9, white_ratio=0.008, phash=ecfc030101333fdf

### `04-components/09-dht11-temperature---humid-hover.png`
- Description: 04-components: 09 dht11 temperature   humid hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6414 bytes, OCR=skipped, edge_density=0.162, mean_lum=48.0, std_lum=33.2, white_ratio=0.008, phash=fefe6c0100019f9f

### `04-components/09-dht11-temperature---humid.png`
- Description: 04-components: 09 dht11 temperature   humid
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=5380 bytes, OCR=skipped, edge_density=0.144, mean_lum=29.1, std_lum=36.1, white_ratio=0.008, phash=ecfc3f0300013bdf

### `04-components/10-gy-521-mpu6050-6-dof-imu6-hover.png`
- Description: 04-components: 10 gy 521 mpu6050 6 dof imu6 hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7085 bytes, OCR=skipped, edge_density=0.173, mean_lum=47.3, std_lum=32.8, white_ratio=0.008, phash=fefec0010101b7df

### `04-components/10-gy-521-mpu6050-6-dof-imu6.png`
- Description: 04-components: 10 gy 521 mpu6050 6 dof imu6
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6024 bytes, OCR=skipped, edge_density=0.154, mean_lum=28.8, std_lum=35.7, white_ratio=0.008, phash=ecfc210101333fdf

### `04-modals/component-editor-full.png`
- Description: 04-modals: component editor full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=63492 bytes, OCR=skipped, edge_density=0.056, mean_lum=14.3, std_lum=12.0, white_ratio=0.000, phash=9eff8e78aa608701

### `04-modals/component-editor-tab-3d-model.png`
- Description: 04-modals: component editor tab 3d model
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=104337 bytes, OCR=skipped, edge_density=0.093, mean_lum=13.1, std_lum=17.5, white_ratio=0.001, phash=d6c6ce2d29319879

### `04-modals/component-editor-tab-edit.png`
- Description: 04-modals: component editor tab edit
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=117633 bytes, OCR=skipped, edge_density=0.107, mean_lum=17.3, std_lum=20.6, white_ratio=0.002, phash=c6d6ec2731393878

### `04-modals/component-editor-tab-image.png`
- Description: 04-modals: component editor tab image
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=98324 bytes, OCR=skipped, edge_density=0.092, mean_lum=18.2, std_lum=25.2, white_ratio=0.001, phash=92649a2c6c9b6d9b

### `04-modals/component-editor-tab-info.png`
- Description: 04-modals: component editor tab info
- Checklist: VH=Fail, Grid=Pass, Space=Pass, Type=Fail, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=4255 bytes, OCR=skipped, edge_density=0.000, mean_lum=5.0, std_lum=0.0, white_ratio=0.000, phash=8000000000000000

### `04-modals/settings-apikey-tab.png`
- Description: 04-modals: settings apikey tab
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=74217 bytes, OCR=skipped, edge_density=0.062, mean_lum=15.4, std_lum=18.1, white_ratio=0.000, phash=da667119641bdb64

### `04-modals/settings-autonomy-tab.png`
- Description: 04-modals: settings autonomy tab
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=92724 bytes, OCR=skipped, edge_density=0.066, mean_lum=17.3, std_lum=20.3, white_ratio=0.000, phash=ce66b127250f649b

### `04-modals/settings-modal-full.png`
- Description: 04-modals: settings modal full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=67069 bytes, OCR=skipped, edge_density=0.056, mean_lum=15.1, std_lum=18.1, white_ratio=0.000, phash=ca667199641bdb64

### `04-settings-modal/001_settings-api-key_1920x1080.png`
- Description: 04-settings-modal: 001 settings api key 1920x1080
- Checklist: VH=Fail, Grid=Pass, Space=Pass, Type=Fail, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=265235 bytes, OCR=skipped, edge_density=0.040, mean_lum=4.2, std_lum=7.2, white_ratio=0.000, phash=dd8723298c6633d9

### `04-settings-modal/002_settings-ai-autonomy_1920x1080.png`
- Description: 04-settings-modal: 002 settings ai autonomy 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=299671 bytes, OCR=skipped, edge_density=0.046, mean_lum=5.4, std_lum=10.2, white_ratio=0.000, phash=dc83230c33597c5f

### `04-settings-modal/003_settings-layout_1920x1080.png`
- Description: 04-settings-modal: 003 settings layout 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=278497 bytes, OCR=skipped, edge_density=0.043, mean_lum=4.7, std_lum=8.9, white_ratio=0.000, phash=dc8723098c765c7e

### `05-chat/chat-attach-button.png`
- Description: 05-chat: chat attach button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1067 bytes, OCR=skipped, edge_density=0.113, mean_lum=39.2, std_lum=35.5, white_ratio=0.000, phash=993366ce9a3119c7

### `05-chat/chat-deep-thinking-toggle.png`
- Description: 05-chat: chat deep thinking toggle
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=543 bytes, OCR=skipped, edge_density=0.061, mean_lum=36.5, std_lum=24.0, white_ratio=0.000, phash=cc673399cc667039

### `05-chat/chat-input-empty.png`
- Description: 05-chat: chat input empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=2991 bytes, OCR=skipped, edge_density=0.054, mean_lum=66.2, std_lum=12.5, white_ratio=0.000, phash=fc0303fcfc0381fc

### `05-chat/chat-input-with-text.png`
- Description: 05-chat: chat input with text
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=5098 bytes, OCR=skipped, edge_density=0.061, mean_lum=68.1, std_lum=22.7, white_ratio=0.003, phash=e10c1ef3e30c1cf3

### `05-chat/chat-minimize-button.png`
- Description: 05-chat: chat minimize button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=379 bytes, OCR=skipped, edge_density=0.028, mean_lum=33.8, std_lum=15.6, white_ratio=0.000, phash=cd673298cd63329c

### `05-chat/chat-minimized.png`
- Description: 05-chat: chat minimized
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=31213 bytes, OCR=skipped, edge_density=0.019, mean_lum=9.5, std_lum=15.0, white_ratio=0.000, phash=88f5a2ddaae68ac8

### `05-chat/chat-mode-button.png`
- Description: 05-chat: chat mode button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=813 bytes, OCR=skipped, edge_density=0.091, mean_lum=136.5, std_lum=23.8, white_ratio=0.026, phash=99cc6633cccc3366

### `05-chat/chat-session-button.png`
- Description: 05-chat: chat session button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 206x32, file_size=3144 bytes, OCR=skipped, edge_density=0.210, mean_lum=52.0, std_lum=37.7, white_ratio=0.000, phash=c46d299796697893

### `05-chat/image-mode-button.png`
- Description: 05-chat: image mode button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=553 bytes, OCR=skipped, edge_density=0.110, mean_lum=73.7, std_lum=31.2, white_ratio=0.000, phash=9964669b99646673

### `05-chat/video-mode-button.png`
- Description: 05-chat: video mode button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=652 bytes, OCR=skipped, edge_density=0.091, mean_lum=66.3, std_lum=10.8, white_ratio=0.000, phash=9999666699993366

### `05-component-editor/001_component-editor-info_1920x1080.png`
- Description: 05-component-editor: 001 component editor info 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=388546 bytes, OCR=skipped, edge_density=0.073, mean_lum=8.4, std_lum=15.5, white_ratio=0.000, phash=dcc4232b2633737c

### `05-component-editor/002_component-editor-edit_1920x1080.png`
- Description: 05-component-editor: 002 component editor edit 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=352492 bytes, OCR=skipped, edge_density=0.070, mean_lum=7.9, std_lum=13.1, white_ratio=0.000, phash=dd85238926337676

### `05-modals/01-editor-full.png`
- Description: 05-modals: 01 editor full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=174350 bytes, OCR=skipped, edge_density=0.133, mean_lum=17.5, std_lum=17.6, white_ratio=0.001, phash=cfc6347a68716931

### `05-modals/02-editor-tab-3d-model.png`
- Description: 05-modals: 02 editor tab 3d model
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=153837 bytes, OCR=skipped, edge_density=0.119, mean_lum=12.1, std_lum=15.3, white_ratio=0.001, phash=97ce8f6969703831

### `05-modals/02-editor-tab-edit.png`
- Description: 05-modals: 02 editor tab edit
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=185962 bytes, OCR=skipped, edge_density=0.142, mean_lum=16.2, std_lum=21.4, white_ratio=0.002, phash=cfc6bc6969712819

### `05-modals/02-editor-tab-image.png`
- Description: 05-modals: 02 editor tab image
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=156269 bytes, OCR=skipped, edge_density=0.121, mean_lum=17.1, std_lum=24.0, white_ratio=0.001, phash=9b669b78649b6491

### `05-modals/02-editor-tab-info.png`
- Description: 05-modals: 02 editor tab info
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=174350 bytes, OCR=skipped, edge_density=0.133, mean_lum=17.5, std_lum=17.6, white_ratio=0.001, phash=cfc6347a68716931

### `05-modals/04-ai-assistant-btn.png`
- Description: 05-modals: 04 ai assistant btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Add grouping or reduce simultaneous highlights to lower visual noise.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 97x22, file_size=1282 bytes, OCR=skipped, edge_density=0.352, mean_lum=31.5, std_lum=16.7, white_ratio=0.000, phash=95786a8f953bf060

### `05-modals/05-editor-with-ai-chat.png`
- Description: 05-modals: 05 editor with ai chat
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=198231 bytes, OCR=skipped, edge_density=0.150, mean_lum=18.8, std_lum=22.8, white_ratio=0.002, phash=d7932d6d3a382c4c

### `06-canvas/canvas-awaiting-message.png`
- Description: 06-canvas: canvas awaiting message
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 324x29, file_size=315 bytes, OCR=skipped, edge_density=0.007, mean_lum=20.3, std_lum=3.7, white_ratio=0.000, phash=ffff00ff00ff0000

### `06-canvas/canvas-dragdrop-hint.png`
- Description: 06-canvas: canvas dragdrop hint
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37776 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.9, std_lum=17.4, white_ratio=0.000, phash=e86aea26a627ca4b

### `06-canvas/canvas-empty.png`
- Description: 06-canvas: canvas empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=Pass, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=35847 bytes, OCR=skipped, edge_density=0.029, mean_lum=27.8, std_lum=16.4, white_ratio=0.000, phash=c86fe24de867e20c

### `06-interactive-states/001_conversation-switcher-dropdown_1920x1080.png`
- Description: 06-interactive-states: 001 conversation switcher dropdown 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=727967 bytes, OCR=skipped, edge_density=0.197, mean_lum=11.7, std_lum=14.4, white_ratio=0.000, phash=d781a3293973725c

### `06-settings/01-settings-full.png`
- Description: 06-settings: 01 settings full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=87174 bytes, OCR=skipped, edge_density=0.078, mean_lum=14.2, std_lum=14.5, white_ratio=0.000, phash=ce667119241b9f66

### `06-settings/02-tab-ai-autonomy.png`
- Description: 06-settings: 02 tab ai autonomy
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=102288 bytes, OCR=skipped, edge_density=0.076, mean_lum=15.9, std_lum=16.8, white_ratio=0.000, phash=ce66716f250e249b

### `06-settings/02-tab-api-key.png`
- Description: 06-settings: 02 tab api key
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=87174 bytes, OCR=skipped, edge_density=0.078, mean_lum=14.2, std_lum=14.5, white_ratio=0.000, phash=ce667119241b9f66

### `07-chat/01-panel-full.png`
- Description: 07-chat: 01 panel full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x712, file_size=94416 bytes, OCR=skipped, edge_density=0.078, mean_lum=16.7, std_lum=18.2, white_ratio=0.001, phash=ce4ef14f250e249b

### `07-chat/02-input.png`
- Description: 07-chat: 02 input
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 1140x42, file_size=2707 bytes, OCR=skipped, edge_density=0.038, mean_lum=18.9, std_lum=1.0, white_ratio=0.000, phash=f4348174fc8f833c

### `07-chat/03-mode-selector.png`
- Description: 07-chat: 03 mode selector
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: Small target (<44px); verify touch sizing on mobile.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Add grouping or reduce simultaneous highlights to lower visual noise.
- Metrics: Dimensions: 97x28, file_size=1933 bytes, OCR=skipped, edge_density=0.470, mean_lum=27.6, std_lum=8.8, white_ratio=0.000, phash=e1f0371f10e4d917

### `07-chat/04-mode-btn-1.png`
- Description: 07-chat: 04 mode btn 1
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 31x24, file_size=797 bytes, OCR=skipped, edge_density=0.250, mean_lum=141.7, std_lum=37.4, white_ratio=0.067, phash=98cf3134ce934ccd

### `07-chat/04-mode-btn-2.png`
- Description: 07-chat: 04 mode btn 2
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 32x24, file_size=668 bytes, OCR=skipped, edge_density=0.311, mean_lum=138.5, std_lum=25.4, white_ratio=0.000, phash=807d65f655999866

### `07-chat/04-mode-btn-3.png`
- Description: 07-chat: 04 mode btn 3
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 32x24, file_size=732 bytes, OCR=skipped, edge_density=0.292, mean_lum=123.5, std_lum=22.3, white_ratio=0.000, phash=a09a9e65559b15ce

### `07-chat/05-send-btn.png`
- Description: 07-chat: 05 send btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=909 bytes, OCR=skipped, edge_density=0.169, mean_lum=71.0, std_lum=18.6, white_ratio=0.000, phash=d53871c7087d8a76

### `07-chat/06-upload-btn.png`
- Description: 07-chat: 06 upload btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=984 bytes, OCR=skipped, edge_density=0.135, mean_lum=37.7, std_lum=27.8, white_ratio=0.000, phash=993164ce9e3899d3

### `07-chat/07-messages-area.png`
- Description: 07-chat: 07 messages area
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 359x618, file_size=41281 bytes, OCR=skipped, edge_density=0.142, mean_lum=25.1, std_lum=32.9, white_ratio=0.006, phash=c433333323331f1f

### `07-inventory-components/component-0.png`
- Description: 07-inventory-components: component 0
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x96, file_size=2536 bytes, OCR=skipped, edge_density=0.072, mean_lum=20.1, std_lum=14.8, white_ratio=0.000, phash=d0fedf0f07d00703

### `07-inventory-components/component-1.png`
- Description: 07-inventory-components: component 1
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 107x78, file_size=2928 bytes, OCR=skipped, edge_density=0.136, mean_lum=37.0, std_lum=50.0, white_ratio=0.027, phash=83937c6c78939356

### `07-inventory-components/component-2.png`
- Description: 07-inventory-components: component 2
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=1254 bytes, OCR=skipped, edge_density=0.189, mean_lum=34.5, std_lum=49.0, white_ratio=0.000, phash=b4695ab54b2d9a54

### `07-inventory-components/component-3.png`
- Description: 07-inventory-components: component 3
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x96, file_size=7319 bytes, OCR=skipped, edge_density=0.120, mean_lum=35.7, std_lum=38.5, white_ratio=0.009, phash=c064cb3f1f3fc1c0

### `07-inventory-components/component-4.png`
- Description: 07-inventory-components: component 4
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 107x78, file_size=2928 bytes, OCR=skipped, edge_density=0.136, mean_lum=37.0, std_lum=50.0, white_ratio=0.027, phash=83937c6c78939356

### `07-inventory-components/component-5.png`
- Description: 07-inventory-components: component 5
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=1254 bytes, OCR=skipped, edge_density=0.189, mean_lum=34.5, std_lum=49.0, white_ratio=0.000, phash=b4695ab54b2d9a54

### `07-inventory-components/component-6.png`
- Description: 07-inventory-components: component 6
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x96, file_size=7319 bytes, OCR=skipped, edge_density=0.120, mean_lum=35.7, std_lum=38.5, white_ratio=0.009, phash=c064cb3f1f3fc1c0

### `07-inventory-components/component-7.png`
- Description: 07-inventory-components: component 7
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 107x78, file_size=2928 bytes, OCR=skipped, edge_density=0.136, mean_lum=37.0, std_lum=50.0, white_ratio=0.027, phash=83937c6c78939356

### `07-inventory-components/component-8.png`
- Description: 07-inventory-components: component 8
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=1254 bytes, OCR=skipped, edge_density=0.189, mean_lum=34.5, std_lum=49.0, white_ratio=0.000, phash=b4695ab54b2d9a54

### `07-responsive/001_2d-diagram_1440x900.png`
- Description: 07-responsive: 001 2d diagram 1440x900
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272910 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/002_2d-diagram_1024x768.png`
- Description: 07-responsive: 002 2d diagram 1024x768
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272910 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/003_2d-diagram_768x1024_tablet.png`
- Description: 07-responsive: 003 2d diagram 768x1024 tablet
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272910 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/004_2d-diagram_430x932_mobile.png`
- Description: 07-responsive: 004 2d diagram 430x932 mobile
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272908 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/005_2d-diagram_393x852_mobile.png`
- Description: 07-responsive: 005 2d diagram 393x852 mobile
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272920 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/006_2d-diagram_375x667_mobile-se.png`
- Description: 07-responsive: 006 2d diagram 375x667 mobile se
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272801 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/007_2d-diagram_320x568_mobile-legacy.png`
- Description: 07-responsive: 007 2d diagram 320x568 mobile legacy
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272910 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `08-buttons/--normal.png`
- Description: 08-buttons:   normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 19x19, file_size=246 bytes, OCR=skipped, edge_density=0.100, mean_lum=15.8, std_lum=1.2, white_ratio=0.000, phash=a8f8aae9cc9c9f02

### `08-buttons/add-new-normal.png`
- Description: 08-buttons: add new normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `08-buttons/add-to-diagram-normal.png`
- Description: 08-buttons: add to diagram normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/attach-image-or-video-hover.png`
- Description: 08-buttons: attach image or video hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1060 bytes, OCR=skipped, edge_density=0.113, mean_lum=39.8, std_lum=38.1, white_ratio=0.000, phash=993366ce9a3119c7

### `08-buttons/attach-image-or-video-normal.png`
- Description: 08-buttons: attach image or video normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1067 bytes, OCR=skipped, edge_density=0.113, mean_lum=39.2, std_lum=35.5, white_ratio=0.000, phash=993366ce9a3119c7

### `08-buttons/btn-0-hover.png`
- Description: 08-buttons: btn 0 hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x64, file_size=511 bytes, OCR=skipped, edge_density=0.119, mean_lum=23.2, std_lum=18.2, white_ratio=0.000, phash=e2961f92c3921f93

### `08-buttons/btn-0-normal.png`
- Description: 08-buttons: btn 0 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x64, file_size=474 bytes, OCR=skipped, edge_density=0.103, mean_lum=21.3, std_lum=19.4, white_ratio=0.000, phash=8aaa25aa9daa75aa

### `08-buttons/btn-10-normal.png`
- Description: 08-buttons: btn 10 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-100-normal.png`
- Description: 08-buttons: btn 100 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-101-normal.png`
- Description: 08-buttons: btn 101 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-104-normal.png`
- Description: 08-buttons: btn 104 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-105-normal.png`
- Description: 08-buttons: btn 105 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-106-normal.png`
- Description: 08-buttons: btn 106 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-107-normal.png`
- Description: 08-buttons: btn 107 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-11-normal.png`
- Description: 08-buttons: btn 11 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-110-normal.png`
- Description: 08-buttons: btn 110 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-111-normal.png`
- Description: 08-buttons: btn 111 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-112-normal.png`
- Description: 08-buttons: btn 112 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-113-normal.png`
- Description: 08-buttons: btn 113 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-116-normal.png`
- Description: 08-buttons: btn 116 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-117-normal.png`
- Description: 08-buttons: btn 117 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-118-normal.png`
- Description: 08-buttons: btn 118 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-119-normal.png`
- Description: 08-buttons: btn 119 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-122-normal.png`
- Description: 08-buttons: btn 122 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-123-normal.png`
- Description: 08-buttons: btn 123 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-124-normal.png`
- Description: 08-buttons: btn 124 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-125-normal.png`
- Description: 08-buttons: btn 125 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-128-normal.png`
- Description: 08-buttons: btn 128 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-129-normal.png`
- Description: 08-buttons: btn 129 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-130-normal.png`
- Description: 08-buttons: btn 130 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-131-normal.png`
- Description: 08-buttons: btn 131 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-134-normal.png`
- Description: 08-buttons: btn 134 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-135-normal.png`
- Description: 08-buttons: btn 135 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-136-normal.png`
- Description: 08-buttons: btn 136 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-137-normal.png`
- Description: 08-buttons: btn 137 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-14-normal.png`
- Description: 08-buttons: btn 14 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-140-normal.png`
- Description: 08-buttons: btn 140 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-141-normal.png`
- Description: 08-buttons: btn 141 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-142-normal.png`
- Description: 08-buttons: btn 142 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-143-normal.png`
- Description: 08-buttons: btn 143 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-146-normal.png`
- Description: 08-buttons: btn 146 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-147-normal.png`
- Description: 08-buttons: btn 147 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-148-normal.png`
- Description: 08-buttons: btn 148 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-149-normal.png`
- Description: 08-buttons: btn 149 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-15-normal.png`
- Description: 08-buttons: btn 15 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-152-normal.png`
- Description: 08-buttons: btn 152 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-153-normal.png`
- Description: 08-buttons: btn 153 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-154-normal.png`
- Description: 08-buttons: btn 154 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-155-normal.png`
- Description: 08-buttons: btn 155 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-158-normal.png`
- Description: 08-buttons: btn 158 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-159-normal.png`
- Description: 08-buttons: btn 159 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-16-normal.png`
- Description: 08-buttons: btn 16 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-160-normal.png`
- Description: 08-buttons: btn 160 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-161-normal.png`
- Description: 08-buttons: btn 161 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-164-normal.png`
- Description: 08-buttons: btn 164 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-165-normal.png`
- Description: 08-buttons: btn 165 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-166-normal.png`
- Description: 08-buttons: btn 166 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-167-normal.png`
- Description: 08-buttons: btn 167 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-17-normal.png`
- Description: 08-buttons: btn 17 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-170-normal.png`
- Description: 08-buttons: btn 170 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-171-normal.png`
- Description: 08-buttons: btn 171 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-172-normal.png`
- Description: 08-buttons: btn 172 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-173-normal.png`
- Description: 08-buttons: btn 173 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-176-normal.png`
- Description: 08-buttons: btn 176 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-177-normal.png`
- Description: 08-buttons: btn 177 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-178-normal.png`
- Description: 08-buttons: btn 178 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-179-normal.png`
- Description: 08-buttons: btn 179 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-182-normal.png`
- Description: 08-buttons: btn 182 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-183-normal.png`
- Description: 08-buttons: btn 183 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-184-normal.png`
- Description: 08-buttons: btn 184 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-185-normal.png`
- Description: 08-buttons: btn 185 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-188-normal.png`
- Description: 08-buttons: btn 188 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-189-normal.png`
- Description: 08-buttons: btn 189 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-190-normal.png`
- Description: 08-buttons: btn 190 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-191-normal.png`
- Description: 08-buttons: btn 191 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-194-normal.png`
- Description: 08-buttons: btn 194 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-195-normal.png`
- Description: 08-buttons: btn 195 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-196-normal.png`
- Description: 08-buttons: btn 196 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-197-normal.png`
- Description: 08-buttons: btn 197 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-2-normal.png`
- Description: 08-buttons: btn 2 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-20-normal.png`
- Description: 08-buttons: btn 20 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-200-normal.png`
- Description: 08-buttons: btn 200 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-201-normal.png`
- Description: 08-buttons: btn 201 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-202-normal.png`
- Description: 08-buttons: btn 202 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-203-normal.png`
- Description: 08-buttons: btn 203 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-206-normal.png`
- Description: 08-buttons: btn 206 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-207-normal.png`
- Description: 08-buttons: btn 207 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-208-normal.png`
- Description: 08-buttons: btn 208 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-209-normal.png`
- Description: 08-buttons: btn 209 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-21-normal.png`
- Description: 08-buttons: btn 21 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-212-normal.png`
- Description: 08-buttons: btn 212 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-213-normal.png`
- Description: 08-buttons: btn 213 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-214-normal.png`
- Description: 08-buttons: btn 214 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-215-normal.png`
- Description: 08-buttons: btn 215 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-218-normal.png`
- Description: 08-buttons: btn 218 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-219-normal.png`
- Description: 08-buttons: btn 219 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-22-normal.png`
- Description: 08-buttons: btn 22 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-220-normal.png`
- Description: 08-buttons: btn 220 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-221-normal.png`
- Description: 08-buttons: btn 221 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-224-normal.png`
- Description: 08-buttons: btn 224 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-225-normal.png`
- Description: 08-buttons: btn 225 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-226-normal.png`
- Description: 08-buttons: btn 226 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-227-normal.png`
- Description: 08-buttons: btn 227 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-23-normal.png`
- Description: 08-buttons: btn 23 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-230-normal.png`
- Description: 08-buttons: btn 230 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-231-normal.png`
- Description: 08-buttons: btn 231 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-232-normal.png`
- Description: 08-buttons: btn 232 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-233-normal.png`
- Description: 08-buttons: btn 233 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-236-normal.png`
- Description: 08-buttons: btn 236 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-237-normal.png`
- Description: 08-buttons: btn 237 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-238-normal.png`
- Description: 08-buttons: btn 238 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-239-normal.png`
- Description: 08-buttons: btn 239 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-242-normal.png`
- Description: 08-buttons: btn 242 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-243-normal.png`
- Description: 08-buttons: btn 243 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-244-normal.png`
- Description: 08-buttons: btn 244 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-245-normal.png`
- Description: 08-buttons: btn 245 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-248-normal.png`
- Description: 08-buttons: btn 248 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-249-normal.png`
- Description: 08-buttons: btn 249 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-250-normal.png`
- Description: 08-buttons: btn 250 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-251-normal.png`
- Description: 08-buttons: btn 251 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-254-normal.png`
- Description: 08-buttons: btn 254 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-255-normal.png`
- Description: 08-buttons: btn 255 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-256-normal.png`
- Description: 08-buttons: btn 256 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-257-normal.png`
- Description: 08-buttons: btn 257 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-26-normal.png`
- Description: 08-buttons: btn 26 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-260-normal.png`
- Description: 08-buttons: btn 260 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-261-normal.png`
- Description: 08-buttons: btn 261 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-262-normal.png`
- Description: 08-buttons: btn 262 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-263-normal.png`
- Description: 08-buttons: btn 263 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-266-normal.png`
- Description: 08-buttons: btn 266 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-267-normal.png`
- Description: 08-buttons: btn 267 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-268-normal.png`
- Description: 08-buttons: btn 268 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-269-normal.png`
- Description: 08-buttons: btn 269 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-27-normal.png`
- Description: 08-buttons: btn 27 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-272-normal.png`
- Description: 08-buttons: btn 272 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-273-normal.png`
- Description: 08-buttons: btn 273 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-274-normal.png`
- Description: 08-buttons: btn 274 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-275-normal.png`
- Description: 08-buttons: btn 275 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-278-normal.png`
- Description: 08-buttons: btn 278 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-279-normal.png`
- Description: 08-buttons: btn 279 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-28-normal.png`
- Description: 08-buttons: btn 28 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-280-normal.png`
- Description: 08-buttons: btn 280 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-281-normal.png`
- Description: 08-buttons: btn 281 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-284-normal.png`
- Description: 08-buttons: btn 284 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-285-normal.png`
- Description: 08-buttons: btn 285 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-286-normal.png`
- Description: 08-buttons: btn 286 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-287-normal.png`
- Description: 08-buttons: btn 287 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-29-normal.png`
- Description: 08-buttons: btn 29 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-290-normal.png`
- Description: 08-buttons: btn 290 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-291-normal.png`
- Description: 08-buttons: btn 291 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-292-normal.png`
- Description: 08-buttons: btn 292 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-293-normal.png`
- Description: 08-buttons: btn 293 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-296-normal.png`
- Description: 08-buttons: btn 296 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-297-normal.png`
- Description: 08-buttons: btn 297 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-298-normal.png`
- Description: 08-buttons: btn 298 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-299-normal.png`
- Description: 08-buttons: btn 299 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-302-normal.png`
- Description: 08-buttons: btn 302 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-303-normal.png`
- Description: 08-buttons: btn 303 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-304-normal.png`
- Description: 08-buttons: btn 304 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-305-normal.png`
- Description: 08-buttons: btn 305 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-308-normal.png`
- Description: 08-buttons: btn 308 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-309-normal.png`
- Description: 08-buttons: btn 309 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-310-normal.png`
- Description: 08-buttons: btn 310 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-311-normal.png`
- Description: 08-buttons: btn 311 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-314-normal.png`
- Description: 08-buttons: btn 314 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-315-normal.png`
- Description: 08-buttons: btn 315 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-316-normal.png`
- Description: 08-buttons: btn 316 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-317-normal.png`
- Description: 08-buttons: btn 317 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-32-normal.png`
- Description: 08-buttons: btn 32 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-320-normal.png`
- Description: 08-buttons: btn 320 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-321-normal.png`
- Description: 08-buttons: btn 321 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-322-normal.png`
- Description: 08-buttons: btn 322 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-33-normal.png`
- Description: 08-buttons: btn 33 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-34-normal.png`
- Description: 08-buttons: btn 34 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-35-normal.png`
- Description: 08-buttons: btn 35 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-38-normal.png`
- Description: 08-buttons: btn 38 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-39-normal.png`
- Description: 08-buttons: btn 39 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-40-normal.png`
- Description: 08-buttons: btn 40 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-41-normal.png`
- Description: 08-buttons: btn 41 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-44-normal.png`
- Description: 08-buttons: btn 44 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-45-normal.png`
- Description: 08-buttons: btn 45 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-46-normal.png`
- Description: 08-buttons: btn 46 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-47-normal.png`
- Description: 08-buttons: btn 47 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-50-normal.png`
- Description: 08-buttons: btn 50 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-51-normal.png`
- Description: 08-buttons: btn 51 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-52-normal.png`
- Description: 08-buttons: btn 52 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-53-normal.png`
- Description: 08-buttons: btn 53 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-56-normal.png`
- Description: 08-buttons: btn 56 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-57-normal.png`
- Description: 08-buttons: btn 57 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-58-normal.png`
- Description: 08-buttons: btn 58 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-59-normal.png`
- Description: 08-buttons: btn 59 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-62-normal.png`
- Description: 08-buttons: btn 62 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-63-normal.png`
- Description: 08-buttons: btn 63 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-64-normal.png`
- Description: 08-buttons: btn 64 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-65-normal.png`
- Description: 08-buttons: btn 65 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-68-normal.png`
- Description: 08-buttons: btn 68 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-69-normal.png`
- Description: 08-buttons: btn 69 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-70-normal.png`
- Description: 08-buttons: btn 70 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-71-normal.png`
- Description: 08-buttons: btn 71 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-74-normal.png`
- Description: 08-buttons: btn 74 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-75-normal.png`
- Description: 08-buttons: btn 75 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-76-normal.png`
- Description: 08-buttons: btn 76 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-77-normal.png`
- Description: 08-buttons: btn 77 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-8-normal.png`
- Description: 08-buttons: btn 8 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-80-normal.png`
- Description: 08-buttons: btn 80 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-81-normal.png`
- Description: 08-buttons: btn 81 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-82-normal.png`
- Description: 08-buttons: btn 82 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-83-normal.png`
- Description: 08-buttons: btn 83 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-86-normal.png`
- Description: 08-buttons: btn 86 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-87-normal.png`
- Description: 08-buttons: btn 87 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-88-normal.png`
- Description: 08-buttons: btn 88 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-89-normal.png`
- Description: 08-buttons: btn 89 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-9-normal.png`
- Description: 08-buttons: btn 9 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-92-normal.png`
- Description: 08-buttons: btn 92 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-93-normal.png`
- Description: 08-buttons: btn 93 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-94-normal.png`
- Description: 08-buttons: btn 94 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-95-normal.png`
- Description: 08-buttons: btn 95 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-98-normal.png`
- Description: 08-buttons: btn 98 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-99-normal.png`
- Description: 08-buttons: btn 99 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/chat-mode-hover.png`
- Description: 08-buttons: chat mode hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=813 bytes, OCR=skipped, edge_density=0.091, mean_lum=136.5, std_lum=23.8, white_ratio=0.026, phash=99cc6633cccc3366

### `08-buttons/chat-mode-normal.png`
- Description: 08-buttons: chat mode normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=813 bytes, OCR=skipped, edge_density=0.091, mean_lum=136.5, std_lum=23.8, white_ratio=0.026, phash=99cc6633cccc3366

### `08-buttons/circuitmind-session-hover.png`
- Description: 08-buttons: circuitmind session hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 206x32, file_size=3230 bytes, OCR=skipped, edge_density=0.209, mean_lum=73.1, std_lum=33.8, white_ratio=0.000, phash=846d3997846d7897

### `08-buttons/circuitmind-session-normal.png`
- Description: 08-buttons: circuitmind session normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 206x32, file_size=3128 bytes, OCR=skipped, edge_density=0.210, mean_lum=52.1, std_lum=38.1, white_ratio=0.000, phash=c46d2997866d7893

### `08-buttons/delete-item-normal.png`
- Description: 08-buttons: delete item normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/edit-details-normal.png`
- Description: 08-buttons: edit details normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/enable-deep-thinking-hover.png`
- Description: 08-buttons: enable deep thinking hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=551 bytes, OCR=skipped, edge_density=0.061, mean_lum=37.4, std_lum=28.7, white_ratio=0.006, phash=cc3333cccc336479

### `08-buttons/enable-deep-thinking-normal.png`
- Description: 08-buttons: enable deep thinking normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=543 bytes, OCR=skipped, edge_density=0.061, mean_lum=36.5, std_lum=24.0, white_ratio=0.000, phash=cc673399cc667039

### `08-buttons/generate-thumbnail-normal.png`
- Description: 08-buttons: generate thumbnail normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/image-mode-hover.png`
- Description: 08-buttons: image mode hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=553 bytes, OCR=skipped, edge_density=0.110, mean_lum=73.7, std_lum=31.2, white_ratio=0.000, phash=9964669b99646673

### `08-buttons/image-mode-normal.png`
- Description: 08-buttons: image mode normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=553 bytes, OCR=skipped, edge_density=0.110, mean_lum=73.7, std_lum=31.2, white_ratio=0.000, phash=9964669b99646673

### `08-buttons/list-normal.png`
- Description: 08-buttons: list normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `08-buttons/load-hover.png`
- Description: 08-buttons: load hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 57x27, file_size=835 bytes, OCR=skipped, edge_density=0.301, mean_lum=46.1, std_lum=16.5, white_ratio=0.000, phash=df3c6543d138c42b

### `08-buttons/load-normal.png`
- Description: 08-buttons: load normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 57x27, file_size=839 bytes, OCR=skipped, edge_density=0.301, mean_lum=46.1, std_lum=16.6, white_ratio=0.000, phash=df3c6543d138c42b

### `08-buttons/lock-sidebar-open-normal.png`
- Description: 08-buttons: lock sidebar open normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/minimize-chat-hover.png`
- Description: 08-buttons: minimize chat hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=353 bytes, OCR=skipped, edge_density=0.028, mean_lum=34.2, std_lum=18.8, white_ratio=0.000, phash=cc3333cccc3333cc

### `08-buttons/minimize-chat-normal.png`
- Description: 08-buttons: minimize chat normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=379 bytes, OCR=skipped, edge_density=0.028, mean_lum=33.8, std_lum=15.6, white_ratio=0.000, phash=cd673298cd63329c

### `08-buttons/open-inventory-hover.png`
- Description: 08-buttons: open inventory hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x64, file_size=154 bytes, OCR=skipped, edge_density=0.000, mean_lum=23.0, std_lum=0.0, white_ratio=0.000, phash=8000000000000000

### `08-buttons/open-inventory-normal.png`
- Description: 08-buttons: open inventory normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x64, file_size=474 bytes, OCR=skipped, edge_density=0.103, mean_lum=21.3, std_lum=19.4, white_ratio=0.000, phash=8aaa25aa9daa75aa

### `08-buttons/open-settings-hover.png`
- Description: 08-buttons: open settings hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1730 bytes, OCR=skipped, edge_density=0.284, mean_lum=44.2, std_lum=27.2, white_ratio=0.000, phash=cd2120dfcb784c75

### `08-buttons/open-settings-normal.png`
- Description: 08-buttons: open settings normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1730 bytes, OCR=skipped, edge_density=0.284, mean_lum=44.2, std_lum=27.2, white_ratio=0.000, phash=cd2120dfcb784c75

### `08-buttons/redo-hover.png`
- Description: 08-buttons: redo hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 45x45, file_size=414 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=9b3964c69b196666

### `08-buttons/redo-normal.png`
- Description: 08-buttons: redo normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 45x45, file_size=414 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=9b3964c69b196666

### `08-buttons/save-hover.png`
- Description: 08-buttons: save hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 56x27, file_size=952 bytes, OCR=skipped, edge_density=0.334, mean_lum=52.2, std_lum=32.4, white_ratio=0.000, phash=ce3031cfc632b46d

### `08-buttons/save-normal.png`
- Description: 08-buttons: save normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 56x27, file_size=954 bytes, OCR=skipped, edge_density=0.334, mean_lum=52.2, std_lum=32.4, white_ratio=0.000, phash=ce3031cfc632b46d

### `08-buttons/send-message-hover.png`
- Description: 08-buttons: send message hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=974 bytes, OCR=skipped, edge_density=0.149, mean_lum=108.6, std_lum=26.9, white_ratio=0.000, phash=d52855d7047d1357

### `08-buttons/send-message-normal.png`
- Description: 08-buttons: send message normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=980 bytes, OCR=skipped, edge_density=0.149, mean_lum=92.6, std_lum=26.9, white_ratio=0.000, phash=dc2875d3447d02d7

### `08-buttons/toggle-live-voice-mode-hover.png`
- Description: 08-buttons: toggle live voice mode hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1556 bytes, OCR=skipped, edge_density=0.268, mean_lum=43.3, std_lum=25.8, white_ratio=0.000, phash=cc2323dd8b74cc96

### `08-buttons/toggle-live-voice-mode-normal.png`
- Description: 08-buttons: toggle live voice mode normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1556 bytes, OCR=skipped, edge_density=0.268, mean_lum=43.3, std_lum=25.8, white_ratio=0.000, phash=cc2323dd8b74cc96

### `08-buttons/tools-normal.png`
- Description: 08-buttons: tools normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `08-buttons/undo-hover.png`
- Description: 08-buttons: undo hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 45x45, file_size=457 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=cc6c33b3cc4c3333

### `08-buttons/undo-normal.png`
- Description: 08-buttons: undo normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 45x45, file_size=457 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=cc6c33b3cc4c3333

### `08-buttons/video-mode-hover.png`
- Description: 08-buttons: video mode hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=652 bytes, OCR=skipped, edge_density=0.091, mean_lum=66.3, std_lum=10.8, white_ratio=0.000, phash=9999666699993366

### `08-buttons/video-mode-normal.png`
- Description: 08-buttons: video mode normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=652 bytes, OCR=skipped, edge_density=0.091, mean_lum=66.3, std_lum=10.8, white_ratio=0.000, phash=9999666699993366

### `08-canvas/01-zoom-in-btn.png`
- Description: 08-canvas: 01 zoom in btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 42x42, file_size=551 bytes, OCR=skipped, edge_density=0.119, mean_lum=32.3, std_lum=12.6, white_ratio=0.000, phash=959581a1e96979d9

### `08-canvas/02-zoom-out-btn.png`
- Description: 08-canvas: 02 zoom out btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 42x42, file_size=551 bytes, OCR=skipped, edge_density=0.119, mean_lum=32.3, std_lum=12.6, white_ratio=0.000, phash=959581a1e96979d9

### `08-canvas/03-reset-view-btn.png`
- Description: 08-canvas: 03 reset view btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 42x42, file_size=551 bytes, OCR=skipped, edge_density=0.119, mean_lum=32.3, std_lum=12.6, white_ratio=0.000, phash=959581a1e96979d9

### `08-canvas/04-search-input.png`
- Description: 08-canvas: 04 search input
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 174x34, file_size=438 bytes, OCR=skipped, edge_density=0.062, mean_lum=28.8, std_lum=11.5, white_ratio=0.000, phash=807f78fe807c78e0

### `08-canvas/06-full-workspace.png`
- Description: 08-canvas: 06 full workspace
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=54129 bytes, OCR=skipped, edge_density=0.043, mean_lum=30.1, std_lum=17.7, white_ratio=0.000, phash=c86bf03ab237a247

### `08-canvas/07-full-workspace.png`
- Description: 08-canvas: 07 full workspace
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=95155 bytes, OCR=skipped, edge_density=0.076, mean_lum=28.9, std_lum=24.0, white_ratio=0.002, phash=9fc78f7bea688040

### `10-forms/ask-about-your-circuit----empty.png`
- Description: 10-forms: ask about your circuit    empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=2991 bytes, OCR=skipped, edge_density=0.054, mean_lum=66.2, std_lum=12.5, white_ratio=0.000, phash=fc0303fcfc0381fc

### `10-forms/ask-about-your-circuit----filled.png`
- Description: 10-forms: ask about your circuit    filled
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=2456 bytes, OCR=skipped, edge_density=0.019, mean_lum=65.2, std_lum=12.3, white_ratio=0.001, phash=ff0000ffff0000ff

### `10-forms/ask-about-your-circuit----focus.png`
- Description: 10-forms: ask about your circuit    focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=3124 bytes, OCR=skipped, edge_density=0.030, mean_lum=65.5, std_lum=12.1, white_ratio=0.000, phash=fc0303fcfc0303fc

### `10-forms/checkbox-0-unchecked.png`
- Description: 10-forms: checkbox 0 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-1-unchecked.png`
- Description: 10-forms: checkbox 1 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-2-unchecked.png`
- Description: 10-forms: checkbox 2 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-3-unchecked.png`
- Description: 10-forms: checkbox 3 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-4-unchecked.png`
- Description: 10-forms: checkbox 4 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-5-unchecked.png`
- Description: 10-forms: checkbox 5 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-6-unchecked.png`
- Description: 10-forms: checkbox 6 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-7-unchecked.png`
- Description: 10-forms: checkbox 7 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-8-unchecked.png`
- Description: 10-forms: checkbox 8 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-9-unchecked.png`
- Description: 10-forms: checkbox 9 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/filter-assets----empty.png`
- Description: 10-forms: filter assets    empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x34, file_size=3459 bytes, OCR=skipped, edge_density=0.140, mean_lum=36.9, std_lum=52.3, white_ratio=0.025, phash=c03fc1c43bbcc13e

### `10-forms/filter-assets----filled.png`
- Description: 10-forms: filter assets    filled
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x34, file_size=3460 bytes, OCR=skipped, edge_density=0.138, mean_lum=36.6, std_lum=51.8, white_ratio=0.024, phash=c03fc1c43bbcc13e

### `10-forms/filter-assets----focus.png`
- Description: 10-forms: filter assets    focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x34, file_size=3459 bytes, OCR=skipped, edge_density=0.140, mean_lum=36.9, std_lum=52.3, white_ratio=0.025, phash=c03fc1c43bbcc13e

### `10-forms/input-1-empty.png`
- Description: 10-forms: input 1 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-1-focus.png`
- Description: 10-forms: input 1 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-10-empty.png`
- Description: 10-forms: input 10 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-10-focus.png`
- Description: 10-forms: input 10 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-11-empty.png`
- Description: 10-forms: input 11 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-11-focus.png`
- Description: 10-forms: input 11 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-12-empty.png`
- Description: 10-forms: input 12 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-12-focus.png`
- Description: 10-forms: input 12 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-13-empty.png`
- Description: 10-forms: input 13 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-13-focus.png`
- Description: 10-forms: input 13 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-14-empty.png`
- Description: 10-forms: input 14 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-14-focus.png`
- Description: 10-forms: input 14 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-15-empty.png`
- Description: 10-forms: input 15 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-15-focus.png`
- Description: 10-forms: input 15 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-16-empty.png`
- Description: 10-forms: input 16 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-16-focus.png`
- Description: 10-forms: input 16 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-17-empty.png`
- Description: 10-forms: input 17 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-17-focus.png`
- Description: 10-forms: input 17 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-18-empty.png`
- Description: 10-forms: input 18 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-18-focus.png`
- Description: 10-forms: input 18 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-19-empty.png`
- Description: 10-forms: input 19 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-19-focus.png`
- Description: 10-forms: input 19 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-2-empty.png`
- Description: 10-forms: input 2 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-2-focus.png`
- Description: 10-forms: input 2 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-20-empty.png`
- Description: 10-forms: input 20 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-20-focus.png`
- Description: 10-forms: input 20 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-21-empty.png`
- Description: 10-forms: input 21 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-21-focus.png`
- Description: 10-forms: input 21 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-22-empty.png`
- Description: 10-forms: input 22 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-22-focus.png`
- Description: 10-forms: input 22 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-23-empty.png`
- Description: 10-forms: input 23 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-23-focus.png`
- Description: 10-forms: input 23 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-24-empty.png`
- Description: 10-forms: input 24 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-24-focus.png`
- Description: 10-forms: input 24 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-25-empty.png`
- Description: 10-forms: input 25 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-25-focus.png`
- Description: 10-forms: input 25 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-26-empty.png`
- Description: 10-forms: input 26 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-26-focus.png`
- Description: 10-forms: input 26 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-27-empty.png`
- Description: 10-forms: input 27 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-27-focus.png`
- Description: 10-forms: input 27 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-28-empty.png`
- Description: 10-forms: input 28 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-28-focus.png`
- Description: 10-forms: input 28 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-29-empty.png`
- Description: 10-forms: input 29 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-29-focus.png`
- Description: 10-forms: input 29 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-3-empty.png`
- Description: 10-forms: input 3 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-3-focus.png`
- Description: 10-forms: input 3 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-30-empty.png`
- Description: 10-forms: input 30 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-30-focus.png`
- Description: 10-forms: input 30 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-31-empty.png`
- Description: 10-forms: input 31 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-31-focus.png`
- Description: 10-forms: input 31 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-32-empty.png`
- Description: 10-forms: input 32 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-32-focus.png`
- Description: 10-forms: input 32 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-33-empty.png`
- Description: 10-forms: input 33 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-33-focus.png`
- Description: 10-forms: input 33 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-34-empty.png`
- Description: 10-forms: input 34 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-34-focus.png`
- Description: 10-forms: input 34 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-35-empty.png`
- Description: 10-forms: input 35 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-35-focus.png`
- Description: 10-forms: input 35 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-36-empty.png`
- Description: 10-forms: input 36 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-36-focus.png`
- Description: 10-forms: input 36 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-37-empty.png`
- Description: 10-forms: input 37 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-37-focus.png`
- Description: 10-forms: input 37 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-38-empty.png`
- Description: 10-forms: input 38 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-38-focus.png`
- Description: 10-forms: input 38 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-39-empty.png`
- Description: 10-forms: input 39 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-39-focus.png`
- Description: 10-forms: input 39 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-4-empty.png`
- Description: 10-forms: input 4 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-4-focus.png`
- Description: 10-forms: input 4 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-40-empty.png`
- Description: 10-forms: input 40 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-40-focus.png`
- Description: 10-forms: input 40 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-41-empty.png`
- Description: 10-forms: input 41 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-41-focus.png`
- Description: 10-forms: input 41 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-42-empty.png`
- Description: 10-forms: input 42 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-42-focus.png`
- Description: 10-forms: input 42 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-43-empty.png`
- Description: 10-forms: input 43 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-43-focus.png`
- Description: 10-forms: input 43 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-44-empty.png`
- Description: 10-forms: input 44 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-44-focus.png`
- Description: 10-forms: input 44 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-45-empty.png`
- Description: 10-forms: input 45 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-45-focus.png`
- Description: 10-forms: input 45 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-46-empty.png`
- Description: 10-forms: input 46 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-46-focus.png`
- Description: 10-forms: input 46 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-47-empty.png`
- Description: 10-forms: input 47 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-47-focus.png`
- Description: 10-forms: input 47 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-48-empty.png`
- Description: 10-forms: input 48 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-48-focus.png`
- Description: 10-forms: input 48 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-49-empty.png`
- Description: 10-forms: input 49 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-49-focus.png`
- Description: 10-forms: input 49 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-5-empty.png`
- Description: 10-forms: input 5 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-5-focus.png`
- Description: 10-forms: input 5 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-50-empty.png`
- Description: 10-forms: input 50 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-50-focus.png`
- Description: 10-forms: input 50 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-51-empty.png`
- Description: 10-forms: input 51 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-51-focus.png`
- Description: 10-forms: input 51 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-52-empty.png`
- Description: 10-forms: input 52 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-52-focus.png`
- Description: 10-forms: input 52 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-53-empty.png`
- Description: 10-forms: input 53 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-53-focus.png`
- Description: 10-forms: input 53 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-54-empty.png`
- Description: 10-forms: input 54 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-54-focus.png`
- Description: 10-forms: input 54 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-55-empty.png`
- Description: 10-forms: input 55 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-55-focus.png`
- Description: 10-forms: input 55 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-56-empty.png`
- Description: 10-forms: input 56 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-56-focus.png`
- Description: 10-forms: input 56 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-57-empty.png`
- Description: 10-forms: input 57 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-57-focus.png`
- Description: 10-forms: input 57 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-58-empty.png`
- Description: 10-forms: input 58 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-58-focus.png`
- Description: 10-forms: input 58 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-59-empty.png`
- Description: 10-forms: input 59 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-59-focus.png`
- Description: 10-forms: input 59 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-6-empty.png`
- Description: 10-forms: input 6 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-6-focus.png`
- Description: 10-forms: input 6 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-60-empty.png`
- Description: 10-forms: input 60 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-60-focus.png`
- Description: 10-forms: input 60 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-61-empty.png`
- Description: 10-forms: input 61 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-61-focus.png`
- Description: 10-forms: input 61 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-62-empty.png`
- Description: 10-forms: input 62 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-62-focus.png`
- Description: 10-forms: input 62 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-7-empty.png`
- Description: 10-forms: input 7 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-7-focus.png`
- Description: 10-forms: input 7 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-8-empty.png`
- Description: 10-forms: input 8 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-8-focus.png`
- Description: 10-forms: input 8 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-9-empty.png`
- Description: 10-forms: input 9 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-9-focus.png`
- Description: 10-forms: input 9 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `12-typography/h1-0.png`
- Description: 12-typography: h1 0
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 158x33, file_size=3000 bytes, OCR=skipped, edge_density=0.282, mean_lum=57.1, std_lum=72.5, white_ratio=0.054, phash=8d1072ade59b8b72

### `12-typography/h2-0.png`
- Description: 12-typography: h2 0
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 186x28, file_size=1956 bytes, OCR=skipped, edge_density=0.145, mean_lum=38.5, std_lum=55.5, white_ratio=0.028, phash=847b847b708f708f

### `12-typography/h3-0.png`
- Description: 12-typography: h3 0
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-1.png`
- Description: 12-typography: h3 1
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-2.png`
- Description: 12-typography: h3 2
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-3.png`
- Description: 12-typography: h3 3
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-4.png`
- Description: 12-typography: h3 4
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-5.png`
- Description: 12-typography: h3 5
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 180x29, file_size=168 bytes, OCR=skipped, edge_density=0.000, mean_lum=20.0, std_lum=0.0, white_ratio=0.000, phash=8000000000000000

## Consistency / Drift Analysis
- Duplicate clusters (pHash) show heavy reuse of button/checkbox assets; largest group size: 217.
- Potential drift risks: header actions vs panel actions use different accent emphasis (see 02-header/* vs 08-buttons/*).
- Typography variance: h3 samples in 12-typography appear consistent but spacing varies across panels.
- Token drift candidate: border/shadow intensity differs between app shell and modals (01-app-shell/* vs 04-modals/*).

## Coverage Matrix
States detected from filenames:

| State | Count | Coverage |
| --- | --- | --- |
| active | 1 | Present |
| checked | 10 | Present |
| disabled | 2 | Present |
| empty | 67 | Present |
| focus | 64 | Present |
| generated | 1 | Present |
| hover | 26 | Present |
| locked | 2 | Present |
| normal | 237 | Present |
| open | 8 | Present |
| unchecked | 10 | Present |

Viewports detected:

| Viewport | Count | Notes |
| --- | --- | --- |
| full | 11 | |
| full-page | 1 | |
| legacy | 1 | |
| mobile | 5 | |
| se | 29 | |
| tablet | 2 | |

Missing coverage flags:
- Error states: low representation (only filename matches in a few items).
- Disabled states: very few captures in filenames.
- Loading states: present but limited by filename count.

## Issue Ledger
| ID | Severity | Evidence | Recommendation | Effort |
| --- | --- | --- | --- | --- |
| UI-001 | Medium | 10-forms/* (std_lum < 10 in many inputs) | Increase microcopy contrast token for dark surfaces. | Medium |
| UI-002 | Medium | 02-header/*, 03-panels/* | Group header actions and panel actions with separators and labels. | Medium |
| UI-003 | Low | 08-buttons/* (min dim < 44px) | Increase hit area for icon buttons on mobile. | Low |
| UI-004 | Low | 03-panels/inventory-header.png | Re-export PNG to remove zlib warning. | Low |
| UI-005 | Medium | 07-responsive/* | Add explicit error/disabled states for responsive layouts. | Medium |

## Action Plan
Quick Wins (High impact, low effort):
1. Add 44px hit area wrappers to icon buttons and toggles.
2. Standardize focus ring width and cyan tone across controls.
3. Re-export the inventory header PNG with consistent zlib settings.

Medium-Term Improvements:
1. Increase microcopy contrast token and verify AA on dark surfaces.
2. Add labeled groupings in the top bar and sidebars for clearer hierarchy.
3. Expand error/disabled/loading coverage in screenshots and UI states.

Long-Term Enhancements:
1. Build a dedicated component state gallery with automated snapshot generation.
2. Add a design token linter for contrast and spacing checks.

## Code Examples
1) Increase microcopy contrast
```css
:root {
  --text-muted: #8fa3b8;
  --text-muted-strong: #a9bfd6;
}
.text-muted { color: var(--text-muted-strong); }
```

2) Icon button hit area
```css
.icon-btn {
  width: 28px; height: 28px;
  position: relative;
}
.icon-btn::after {
  content: ""; position: absolute;
  inset: -8px; /* expands to 44px target */
}
```

3) Header action grouping
```css
.header-group { display: flex; gap: 8px; padding: 0 8px; }
.header-group + .header-group { border-left: 1px solid #1d2a3a; }
```

4) Focus ring standardization
```css
:root { --focus-ring: 0 0 0 2px rgba(0, 243, 255, 0.55); }
.focusable:focus-visible { box-shadow: var(--focus-ring); }
```

## Mockups
Before (dense header with flat action row):
```
[Logo] [Undo][Redo][Save][Load][Settings][Voice] [Session]
```
After (grouped actions with separators):
```
[Logo] [Undo][Redo] | [Save][Load] | [Settings][Voice]   [Session]
```

## Design Token Harvest
- Spacing: 4, 8, 12, 16, 24 (inferred from button padding and panel gutters; verify in CSS).
- Radius: mostly 0-2px (cut-corner aesthetic).
- Shadows: subtle panel shadows, stronger modal depth.
- Colors (inferred):
  - Background: near-black blue (#0b0f18 to #0f1625 range).
  - Accent cyan/teal: #00f3ff family for primary actions and focus rings.
  - Accent yellow: used for primary highlight (lightning icon).
- Typography: compact sans; small sizes require stronger contrast token.

## Appendix
Color/contrast notes:
- avg mean_lum 30.1, avg std_lum 27.1; low variance suggests microcopy contrast risk.
Typography scale:
- h3 samples present (12-typography/*); verify line-height and cap-height alignment.
Component inventory (by folder):
- 01-app-shell: 13
- 02-canvas-views: 2
- 02-header: 15
- 03-inventory: 8
- 03-panels: 15
- 03-sidebars: 1
- 04-components: 20
- 04-modals: 8
- 04-settings-modal: 3
- 05-chat: 10
- 05-component-editor: 2
- 05-modals: 7
- 06-canvas: 3
- 06-interactive-states: 1
- 06-settings: 3
- 07-chat: 9
- 07-inventory-components: 9
- 07-responsive: 7
- 08-buttons: 253
- 08-canvas: 6
- 10-forms: 140
- 12-typography: 8

---

# PART 4: APPENDIX - COMPLEXITY METRICS (CSV)

9,7,55,0,9,"(anonymous)@720-728@App.tsx","App.tsx","(anonymous)","(anonymous)",720,728
3,1,22,0,3,"(anonymous)@730-732@App.tsx","App.tsx","(anonymous)","(anonymous)",730,732
14,7,76,0,14,"(anonymous)@742-755@App.tsx","App.tsx","(anonymous)","(anonymous)",742,755
5,3,34,0,5,"(anonymous)@758-762@App.tsx","App.tsx","(anonymous)","(anonymous)",758,762
7,3,23,0,7,"(anonymous)@766-772@App.tsx","App.tsx","(anonymous)","(anonymous)",766,772
7,3,23,0,7,"(anonymous)@773-779@App.tsx","App.tsx","(anonymous)","(anonymous)",773,779
1,1,1,0,1,"(anonymous)@803-803@App.tsx","App.tsx","(anonymous)","(anonymous)",803,803
1,1,1,0,1,"(anonymous)@810-810@App.tsx","App.tsx","(anonymous)","(anonymous)",810,810
11,7,72,0,13,"(anonymous)@802-814@App.tsx","App.tsx","(anonymous)","(anonymous)",802,814
8,5,32,0,8,"(anonymous)@836-843@App.tsx","App.tsx","(anonymous)","(anonymous)",836,843
8,5,32,0,8,"(anonymous)@844-851@App.tsx","App.tsx","(anonymous)","(anonymous)",844,851
10,7,66,0,10,"(anonymous)@852-861@App.tsx","App.tsx","(anonymous)","(anonymous)",852,861
10,7,66,0,10,"(anonymous)@862-871@App.tsx","App.tsx","(anonymous)","(anonymous)",862,871
15,5,64,0,15,"(anonymous)@874-888@App.tsx","App.tsx","(anonymous)","(anonymous)",874,888
7,3,40,0,7,"(anonymous)@891-897@App.tsx","App.tsx","(anonymous)","(anonymous)",891,897
7,3,38,0,7,"(anonymous)@899-905@App.tsx","App.tsx","(anonymous)","(anonymous)",899,905
7,3,38,0,7,"(anonymous)@907-913@App.tsx","App.tsx","(anonymous)","(anonymous)",907,913
7,3,38,0,7,"(anonymous)@915-921@App.tsx","App.tsx","(anonymous)","(anonymous)",915,921
7,3,38,0,7,"(anonymous)@923-929@App.tsx","App.tsx","(anonymous)","(anonymous)",923,929
7,3,38,0,7,"(anonymous)@931-937@App.tsx","App.tsx","(anonymous)","(anonymous)",931,937
7,3,38,0,7,"(anonymous)@939-945@App.tsx","App.tsx","(anonymous)","(anonymous)",939,945
1,1,1,0,1,"(anonymous)@949-949@App.tsx","App.tsx","(anonymous)","(anonymous)",949,949
21,17,125,0,22,"(anonymous)@948-969@App.tsx","App.tsx","(anonymous)","(anonymous)",948,969
1,1,1,0,1,"(anonymous)@973-973@App.tsx","App.tsx","(anonymous)","(anonymous)",973,973
1,1,1,0,1,"(anonymous)@990-990@App.tsx","App.tsx","(anonymous)","(anonymous)",990,990
17,7,97,0,20,"(anonymous)@972-991@App.tsx","App.tsx","(anonymous)","(anonymous)",972,991
1,1,1,0,1,"(anonymous)@995-995@App.tsx","App.tsx","(anonymous)","(anonymous)",995,995
7,3,30,0,7,"(anonymous)@994-1000@App.tsx","App.tsx","(anonymous)","(anonymous)",994,1000
6,5,26,0,6,"(anonymous)@1008-1013@App.tsx","App.tsx","(anonymous)","(anonymous)",1008,1013
1,1,1,0,1,"(anonymous)@1027-1027@App.tsx","App.tsx","(anonymous)","(anonymous)",1027,1027
10,5,62,0,10,"(anonymous)@1026-1035@App.tsx","App.tsx","(anonymous)","(anonymous)",1026,1035
6,3,20,0,6,"autoSync@1041-1046@App.tsx","App.tsx","autoSync","autoSync",1041,1046
10,5,81,0,10,"(anonymous)@1053-1062@App.tsx","App.tsx","(anonymous)","(anonymous)",1053,1062
10,5,72,0,10,"(anonymous)@1066-1075@App.tsx","App.tsx","(anonymous)","(anonymous)",1066,1075
1,1,1,0,1,"(anonymous)@1124-1124@App.tsx","App.tsx","(anonymous)","(anonymous)",1124,1124
1,1,1,0,1,"(anonymous)@1127-1127@App.tsx","App.tsx","(anonymous)","(anonymous)",1127,1127
1,1,1,0,1,"(anonymous)@1129-1129@App.tsx","App.tsx","(anonymous)","(anonymous)",1129,1129
1,1,1,0,1,"(anonymous)@1133-1133@App.tsx","App.tsx","(anonymous)","(anonymous)",1133,1133
1,1,1,0,1,"(anonymous)@1134-1134@App.tsx","App.tsx","(anonymous)","(anonymous)",1134,1134
1,1,1,0,1,"(anonymous)@1137-1137@App.tsx","App.tsx","(anonymous)","(anonymous)",1137,1137
34,19,267,0,42,"(anonymous)@1104-1145@App.tsx","App.tsx","(anonymous)","(anonymous)",1104,1145
1,1,1,0,1,"(anonymous)@1185-1185@App.tsx","App.tsx","(anonymous)","(anonymous)",1185,1185
1,1,1,0,1,"(anonymous)@1190-1190@App.tsx","App.tsx","(anonymous)","(anonymous)",1190,1190
1,1,1,0,1,"(anonymous)@1191-1191@App.tsx","App.tsx","(anonymous)","(anonymous)",1191,1191
1,1,1,0,1,"(anonymous)@1195-1195@App.tsx","App.tsx","(anonymous)","(anonymous)",1195,1195
1,1,1,0,1,"(anonymous)@1196-1196@App.tsx","App.tsx","(anonymous)","(anonymous)",1196,1196
1,1,1,0,1,"(anonymous)@1198-1198@App.tsx","App.tsx","(anonymous)","(anonymous)",1198,1198
50,25,378,0,59,"(anonymous)@1148-1206@App.tsx","App.tsx","(anonymous)","(anonymous)",1148,1206
1,1,7,0,1,"(anonymous)@1257-1257@App.tsx","App.tsx","(anonymous)","(anonymous)",1257,1257
1,2,15,0,1,"(anonymous)@1331-1331@App.tsx","App.tsx","(anonymous)","(anonymous)",1331,1331
1,1,10,0,1,"(anonymous)@1331-1331@App.tsx","App.tsx","(anonymous)","(anonymous)",1331,1331
1,2,15,0,1,"(anonymous)@1351-1351@App.tsx","App.tsx","(anonymous)","(anonymous)",1351,1351
1,1,10,0,1,"(anonymous)@1351-1351@App.tsx","App.tsx","(anonymous)","(anonymous)",1351,1351
1,2,15,0,1,"components@1355-1355@App.tsx","App.tsx","components","components",1355,1355
235,24,1678,1,639,"App@718-1356@App.tsx","App.tsx","App","App const inventory setInventory useState ElectronicComponent useEffect const toast useToast const history setHistory useState past WiringDiagram present WiringDiagram null future WiringDiagram useEffect const isLoading setIsLoading useState const setLoadingText useState const isInventoryOpen setIsInventoryOpen useState const inventoryPinnedDefault setInventoryPinnedDefault useState const isSettingsOpen setIsSettingsOpen useState const selectedComponent setSelectedComponent useState ElectronicComponent null const modalContent setModalContent useState const isGenerating3D setIsGenerating3D useState const setGenerate3DError useState string null const generationMode setGenerationMode useState const imageSize setImageSize useState const aspectRatio setAspectRatio useState const useDeepThinking setUseDeepThinking useState const isRecording setIsRecording useState const mediaRecorderRef useRef MediaRecorder null const audioChunksRef useRef Blob useEffect const isLiveActive setIsLiveActive useState const liveStatus setLiveStatus useState const liveSessionRef useRef LiveSession null const canvasRef useRef const conversationManager useConversations const aiContext setAIContext useState AIContext null const proactiveSuggestions setProactiveSuggestions useState string const inventoryDefaultWidth 360 const assistantDefaultWidth 380 const inventoryWidthRange min 280 max 520 const assistantWidthRange min 300 max 560 const clampWidth Math min const isAssistantOpen setIsAssistantOpen useState const isAssistantPinned setIsAssistantPinned useState const inventoryWidth setInventoryWidth useState const assistantWidth setAssistantWidth useState const autonomySettings setAutonomySettings useState useEffect useEffect useEffect useEffect useEffect useEffect useEffect useEffect useEffect useEffect const toggleLiveMode async if liveSessionRef current disconnect setIsLiveActive else setIsLiveActive liveSessionRef current new LiveSession if liveSessionRef current setVisualContextProvider else console warn await liveSessionRef current connect const updateDiagram useCallback useInventorySync const handleDiagramChange updateDiagram function handleUndo setHistory function handleRedo setHistory const handleComponentDrop const newInstance ElectronicComponent component id sourceInventoryId component id const currentDiagram history present title components connections explanation const newDiagram currentDiagram components currentDiagram components newInstance updateDiagram const handleInventoryRemove useCallback const handleInventoryDeleteMany useCallback const startRecording async try const stream await navigator mediaDevices getUserMedia const mediaRecorder new MediaRecorder mediaRecorderRef current mediaRecorder audioChunksRef current mediaRecorder ondataavailable if audioChunksRef current push mediaRecorder start setIsRecording catch const message err instanceof Error err message console error toast error const stopRecording if mediaRecorderRef current onstop async const audioBlob new Blob setIsRecording setLoadingText setIsLoading try const reader new FileReader reader readAsDataURL reader onloadend async const base64Audio reader result as string const transcription await transcribeAudio setIsLoading if handleSendEnhancedMessage else toast warning catch toast error setIsLoading mediaRecorderRef current stream getTracks forEach mediaRecorderRef current stop const saveDiagram if return const data diagram history present timestamp Date now localStorage setItem conversationManager addMessage const loadDiagram const saved localStorage getItem if try const parsed JSON parse if updateDiagram conversationManager addMessage catch console error const aiActions useAIActions const handleComponentClick async setSelectedComponent const explain await explainComponent setModalContent const handleGenerate3D async if return setIsGenerating3D setGenerate3DError try const code await generateComponent3DCode const updated selectedComponent threeCode code setSelectedComponent setInventory catch const errorMsg e instanceof Error e message setGenerate3DError toast error finally setIsGenerating3D const handleGenerate3DForComponent async if return setIsGenerating3D toast info try const code await generateComponent3DCode const updated component threeCode code setInventory if updateDiagram",718,1356
2,1,9,0,2,"(anonymous)@1396-1397@App.tsx","App.tsx","(anonymous)","(anonymous)",1396,1397
1,1,9,0,1,"(anonymous)@1398-1398@App.tsx","App.tsx","(anonymous)","(anonymous)",1398,1398
1,3,13,0,1,"(anonymous)@1402-1402@App.tsx","App.tsx","(anonymous)","(anonymous)",1402,1402
4,1,28,0,4,"(anonymous)@1403-1406@App.tsx","App.tsx","(anonymous)","(anonymous)",1403,1406
6,1,26,0,6,"(anonymous)@1452-1457@App.tsx","App.tsx","(anonymous)","(anonymous)",1452,1457
1,1,1,0,1,"(anonymous)@1554-1554@App.tsx","App.tsx","(anonymous)","(anonymous)",1554,1554
1,1,1,0,1,"(anonymous)@1566-1566@App.tsx","App.tsx","(anonymous)","(anonymous)",1566,1566
14,5,91,0,15,"(anonymous)@1553-1567@App.tsx","App.tsx","(anonymous)","(anonymous)",1553,1567
1,1,1,0,1,"(anonymous)@1581-1581@App.tsx","App.tsx","(anonymous)","(anonymous)",1581,1581
1,1,1,0,1,"(anonymous)@1582-1582@App.tsx","App.tsx","(anonymous)","(anonymous)",1582,1582
1,1,1,0,1,"(anonymous)@1589-1589@App.tsx","App.tsx","(anonymous)","(anonymous)",1589,1589
1,1,1,0,1,"(anonymous)@1599-1599@App.tsx","App.tsx","(anonymous)","(anonymous)",1599,1599
1,1,1,0,1,"(anonymous)@1603-1603@App.tsx","App.tsx","(anonymous)","(anonymous)",1603,1603
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
1,1,1,0,1,"(anonymous)@1608-1608@App.tsx","App.tsx","(anonymous)","(anonymous)",1608,1608
4,2,39,0,4,"(anonymous)@250-253@components/diagram/componentShapes.ts","components/diagram/componentShapes.ts","(anonymous)","(anonymous)",250,253
9,3,76,0,14,"(anonymous)@243-256@components/diagram/componentShapes.ts","components/diagram/componentShapes.ts","(anonymous)","(anonymous)",243,256
7,1,32,0,7,"(anonymous)@259-265@components/diagram/componentShapes.ts","components/diagram/componentShapes.ts","(anonymous)","(anonymous)",259,265
7,1,37,0,34,"generateSVGDefs@239-272@components/diagram/componentShapes.ts","components/diagram/componentShapes.ts","generateSVGDefs","generateSVGDefs ( )",239,272
1,1,8,0,1,"(anonymous)@666-666@components/diagram/componentShapes.ts","components/diagram/componentShapes.ts","(anonymous)","(anonymous)",666,666
20,3,119,0,21,"(anonymous)@654-674@components/diagram/componentShapes.ts","components/diagram/componentShapes.ts","(anonymous)","(anonymous)",654,674
10,4,62,0,11,"(anonymous)@681-691@components/diagram/componentShapes.ts","components/diagram/componentShapes.ts","(anonymous)","(anonymous)",681,691
28,6,238,2,68,"calculatePinPositions@629-696@components/diagram/componentShapes.ts","components/diagram/componentShapes.ts","calculatePinPositions","calculatePinPositions ( shape : ComponentShape , pins : string [ ] )",629,696
49,49,477,2,141,"getComponentShape@557-697@components/diagram/componentShapes.ts","components/diagram/componentShapes.ts","getComponentShape","getComponentShape ( type : string , name? : string )",557,697
4,1,27,0,4,"(anonymous)@6-9@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",6,9
1,1,8,0,1,"(anonymous)@13-13@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",13,13
8,2,46,0,8,"vi.fn@12-19@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","vi.fn","vi.fn",12,19
10,4,137,1,17,"vi.fn@12-28@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","vi.fn","vi.fn ( conversation : Conversation )",12,28
1,1,2,0,1,"vi.fn@32-32@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","vi.fn","vi.fn",32,32
4,1,34,0,4,"vi.fn@32-35@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","vi.fn","vi.fn ( )",32,35
5,1,31,0,5,"(anonymous)@37-41@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",37,41
1,1,4,0,1,"(anonymous)@44-44@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",44,44
1,1,14,0,1,"(anonymous)@46-46@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",46,46
6,1,54,0,8,"(anonymous)@43-50@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",43,50
1,1,4,0,1,"(anonymous)@53-53@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",53,53
9,1,45,0,9,"(anonymous)@55-63@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",55,63
1,1,13,0,1,"(anonymous)@65-65@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",65,65
5,1,32,0,15,"(anonymous)@52-66@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",52,66
4,1,24,0,26,"(anonymous)@42-67@hooks/__tests__/useConversations.test.ts","hooks/__tests__/useConversations.test.ts","(anonymous)","(anonymous)",42,67
4,1,13,0,4,"handleUndo@4-7@hooks/actions/appControlHandlers.ts","hooks/actions/appControlHandlers.ts","handleUndo","handleUndo",4,7
4,1,13,0,4,"handleRedo@9-12@hooks/actions/appControlHandlers.ts","hooks/actions/appControlHandlers.ts","handleRedo","handleRedo",9,12
4,1,13,0,4,"handleSaveDiagram@14-17@hooks/actions/appControlHandlers.ts","hooks/actions/appControlHandlers.ts","handleSaveDiagram","handleSaveDiagram",14,17
4,1,13,0,4,"handleLoadDiagram@19-22@hooks/actions/appControlHandlers.ts","hooks/actions/appControlHandlers.ts","handleLoadDiagram","handleLoadDiagram",19,22
5,2,36,0,5,"handleSetUserLevel@24-28@hooks/actions/appControlHandlers.ts","hooks/actions/appControlHandlers.ts","handleSetUserLevel","handleSetUserLevel",24,28
5,2,36,0,5,"handleLearnFact@30-34@hooks/actions/appControlHandlers.ts","hooks/actions/appControlHandlers.ts","handleLearnFact","handleLearnFact",30,34
7,1,41,0,7,"reader.onloadend@62-68@hooks/actions/appControlHandlers.ts","hooks/actions/appControlHandlers.ts","reader.onloadend","reader.onloadend",62,68
12,3,70,0,38,"handleAnalyzeVisuals@36-73@hooks/actions/appControlHandlers.ts","hooks/actions/appControlHandlers.ts","handleAnalyzeVisuals","handleAnalyzeVisuals",36,73
7,1,30,2,7,"openInventory@11-17@hooks/actions/navHandlers.ts","hooks/actions/navHandlers.ts","openInventory","openInventory ( _payload : unknown , context : ActionContext )",11,17
7,1,30,2,7,"closeInventory@19-25@hooks/actions/navHandlers.ts","hooks/actions/navHandlers.ts","closeInventory","closeInventory ( _payload : unknown , context : ActionContext )",19,25
7,1,30,2,7,"openSettings@27-33@hooks/actions/navHandlers.ts","hooks/actions/navHandlers.ts","openSettings","openSettings ( _payload : unknown , context : ActionContext )",27,33
7,1,30,2,7,"closeSettings@35-41@hooks/actions/navHandlers.ts","hooks/actions/navHandlers.ts","closeSettings","closeSettings ( _payload : unknown , context : ActionContext )",35,41
1,1,8,0,1,"(anonymous)@47-47@hooks/actions/navHandlers.ts","hooks/actions/navHandlers.ts","(anonymous)","(anonymous)",47,47
11,2,68,2,11,"openComponentEditor@43-53@hooks/actions/navHandlers.ts","hooks/actions/navHandlers.ts","openComponentEditor","openComponentEditor ( payload : ComponentEditorPayload , context : ActionContext )",43,53
7,1,32,2,7,"switchGenerationMode@55-61@hooks/actions/navHandlers.ts","hooks/actions/navHandlers.ts","switchGenerationMode","switchGenerationMode ( payload : SwitchModePayload , context : ActionContext )",55,61
1,1,2,0,1,"(anonymous)@12-12@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",12,12
1,1,2,0,1,"(anonymous)@13-13@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",13,13
1,1,2,0,1,"(anonymous)@14-14@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",14,14
1,1,2,0,1,"(anonymous)@15-15@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",15,15
1,1,2,0,1,"(anonymous)@16-16@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",16,16
1,1,5,0,1,"(anonymous)@18-18@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",18,18
1,1,2,0,1,"(anonymous)@20-20@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",20,20
1,1,2,0,1,"(anonymous)@21-21@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",21,21
1,1,2,0,1,"(anonymous)@22-22@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",22,22
1,1,2,0,1,"(anonymous)@23-23@hooks/actions/types.ts","hooks/actions/types.ts","(anonymous)","(anonymous)",23,23
1,1,5,0,1,">@40-40@hooks/actions/types.ts","hooks/actions/types.ts",">",">",40,40
1,1,11,0,1,"generateId@4-4@hooks/actions/diagramHandlers.ts","hooks/actions/diagramHandlers.ts","generateId","generateId",4,4
8,2,50,0,8,"generateId@41-48@hooks/actions/diagramHandlers.ts","hooks/actions/diagramHandlers.ts","generateId","generateId ( )",41,48
8,2,46,0,8,"generateId@82-89@hooks/actions/diagramHandlers.ts","hooks/actions/diagramHandlers.ts","generateId","generateId ( )",82,89
1,1,6,0,1,"diagram.components.filter@93-93@hooks/actions/diagramHandlers.ts","hooks/actions/diagramHandlers.ts","diagram.components.filter","diagram.components.filter",93,93
8,2,52,0,8,"generateId@115-122@hooks/actions/diagramHandlers.ts","hooks/actions/diagramHandlers.ts","generateId","generateId ( )",115,122
8,2,55,0,8,"generateId@155-162@hooks/actions/diagramHandlers.ts","hooks/actions/diagramHandlers.ts","generateId","generateId ( )",155,162
1,1,4,0,1,"diagram.connections.filter@166-166@hooks/actions/diagramHandlers.ts","hooks/actions/diagramHandlers.ts","diagram.connections.filter","diagram.connections.filter",166,166
3,1,20,1,3,"getHandler@49-51@hooks/actions/index.ts","hooks/actions/index.ts","getHandler","getHandler ( type : ActionType )",49,51
8,1,55,2,8,"highlight@31-38@hooks/actions/canvasHandlers.ts","hooks/actions/canvasHandlers.ts","highlight","highlight ( payload : HighlightPayload , context : ActionContext )",31,38
8,1,45,2,8,"centerOn@40-47@hooks/actions/canvasHandlers.ts","hooks/actions/canvasHandlers.ts","centerOn","centerOn ( payload : CenterOnPayload , context : ActionContext )",40,47
7,1,36,2,7,"zoomTo@49-55@hooks/actions/canvasHandlers.ts","hooks/actions/canvasHandlers.ts","zoomTo","zoomTo ( payload : ZoomToPayload , context : ActionContext )",49,55
7,1,40,2,7,"panTo@57-63@hooks/actions/canvasHandlers.ts","hooks/actions/canvasHandlers.ts","panTo","panTo ( payload : PanToPayload , context : ActionContext )",57,63
7,1,33,2,7,"resetView@65-71@hooks/actions/canvasHandlers.ts","hooks/actions/canvasHandlers.ts","resetView","resetView ( _payload : unknown , context : ActionContext )",65,71
8,1,55,2,8,"highlightWire@73-80@hooks/actions/canvasHandlers.ts","hooks/actions/canvasHandlers.ts","highlightWire","highlightWire ( payload : HighlightWirePayload , context : ActionContext )",73,80
1,1,2,0,1,"useActionHistory@13-13@hooks/useActionHistory.ts","hooks/useActionHistory.ts","useActionHistory","useActionHistory",13,13
1,1,13,0,1,"(anonymous)@18-18@hooks/useActionHistory.ts","hooks/useActionHistory.ts","(anonymous)","(anonymous)",18,18
3,1,10,0,3,"useCallback@17-19@hooks/useActionHistory.ts","hooks/useActionHistory.ts","useCallback","useCallback",17,19
4,1,17,0,4,"(anonymous)@21-24@hooks/useActionHistory.ts","hooks/useActionHistory.ts","(anonymous)","(anonymous)",21,24
7,3,47,0,8,"(anonymous)@26-33@hooks/useActionHistory.ts","hooks/useActionHistory.ts","(anonymous)","(anonymous)",26,33
12,3,48,0,13,"getStoredSettings@6-18@hooks/useAutonomySettings.ts","hooks/useAutonomySettings.ts","getStoredSettings","getStoredSettings",6,18
6,2,28,0,6,"saveSettings@20-25@hooks/useAutonomySettings.ts","hooks/useAutonomySettings.ts","saveSettings","saveSettings",20,25
5,1,23,0,5,"(anonymous)@34-38@hooks/useAutonomySettings.ts","hooks/useAutonomySettings.ts","(anonymous)","(anonymous)",34,38
5,5,39,0,5,"(anonymous)@40-44@hooks/useAutonomySettings.ts","hooks/useAutonomySettings.ts","(anonymous)","(anonymous)",40,44
10,1,74,0,21,"useAutonomySettings@31-51@hooks/useAutonomySettings.ts","hooks/useAutonomySettings.ts","useAutonomySettings","useAutonomySettings ( )",31,51
1,1,10,0,1,"generateId@13-13@hooks/useConversations.ts","hooks/useConversations.ts","generateId","generateId",13,13
5,2,40,0,5,"generateTitle@16-20@hooks/useConversations.ts","hooks/useConversations.ts","generateTitle","generateTitle",16,20
1,1,5,0,1,"createConversation@33-33@hooks/useConversations.ts","hooks/useConversations.ts","createConversation","createConversation",33,33
1,1,5,0,1,"switchConversation@34-34@hooks/useConversations.ts","hooks/useConversations.ts","switchConversation","switchConversation",34,34
1,1,5,0,1,"deleteConversation@35-35@hooks/useConversations.ts","hooks/useConversations.ts","deleteConversation","deleteConversation",35,35
1,1,5,0,1,"renameConversation@36-36@hooks/useConversations.ts","hooks/useConversations.ts","renameConversation","renameConversation",36,36
1,1,5,0,1,"addMessage@41-41@hooks/useConversations.ts","hooks/useConversations.ts","addMessage","addMessage",41,41
1,1,5,0,1,"updateMessage@42-42@hooks/useConversations.ts","hooks/useConversations.ts","updateMessage","updateMessage",42,42
1,1,5,0,1,"getOrCreatePrimaryConversation@45-45@hooks/useConversations.ts","hooks/useConversations.ts","getOrCreatePrimaryConversation","getOrCreatePrimaryConversation",45,45
1,1,5,0,1,"refreshConversations@46-46@hooks/useConversations.ts","hooks/useConversations.ts","refreshConversations","refreshConversations",46,46
1,1,6,0,1,"(anonymous)@59-59@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",59,59
1,1,1,0,1,"(anonymous)@116-116@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",116,116
1,2,14,0,1,"(anonymous)@116-116@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",116,116
25,1,120,0,26,"generateId@97-122@hooks/useConversations.ts","hooks/useConversations.ts","generateId","generateId ( )",97,122
3,1,6,1,3,"setIsLoading@125-127@hooks/useConversations.ts","hooks/useConversations.ts","setIsLoading","setIsLoading ( false )",125,127
31,8,184,0,65,"init@66-130@hooks/useConversations.ts","hooks/useConversations.ts","init","init",66,130
1,1,7,0,1,"(anonymous)@147-147@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",147,147
12,2,61,0,14,"||@139-152@hooks/useConversations.ts","hooks/useConversations.ts","||","|| ( isPrimary ? 'CircuitMind Session' : 'New Conversation' )",139,152
4,1,16,0,4,"(anonymous)@155-158@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",155,158
3,1,6,1,3,"setIsLoading@172-174@hooks/useConversations.ts","hooks/useConversations.ts","setIsLoading","setIsLoading ( false )",172,174
1,1,6,0,1,"(anonymous)@179-179@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",179,179
1,1,10,0,1,"(anonymous)@179-179@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",179,179
1,1,6,0,1,"(anonymous)@183-183@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",183,183
12,3,67,0,15,"(anonymous)@177-191@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",177,191
1,1,6,0,1,"(anonymous)@195-195@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",195,195
8,2,41,0,9,"(anonymous)@194-202@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",194,202
1,2,12,0,1,"(anonymous)@205-205@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",205,205
1,1,10,0,1,"(anonymous)@205-205@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",205,205
6,3,23,0,6,"(anonymous)@233-238@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",233,238
1,1,6,0,1,"(anonymous)@240-240@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",240,240
1,1,1,0,1,"(anonymous)@252-252@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",252,252
1,2,12,0,1,"(anonymous)@252-252@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",252,252
25,7,166,0,34,"generateId@224-257@hooks/useConversations.ts","hooks/useConversations.ts","generateId","generateId ( )",224,257
1,1,6,0,1,"(anonymous)@264-264@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",264,264
1,2,12,0,1,"(anonymous)@273-273@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",273,273
1,1,10,0,1,"(anonymous)@273-273@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",273,273
10,2,50,0,12,"(anonymous)@263-274@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",263,274
7,2,27,0,7,"(anonymous)@279-285@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",279,285
4,1,16,0,4,"(anonymous)@288-291@hooks/useConversations.ts","hooks/useConversations.ts","(anonymous)","(anonymous)",288,291
29,2,132,2,29,"migrateMessage@318-346@hooks/useConversations.ts","hooks/useConversations.ts","migrateMessage","migrateMessage ( old : { id : string ; role : 'user' | 'model' | 'system' ; content : string ; timestamp? : number ; diagramData? : WiringDiagram ; image? : string ; video? : string ; groundingSources? : GroundingSource [ ] ; audioResponse? : string ; } , conversationId : string )",318,346
1,1,2,0,1,"onSync?@24-24@hooks/useInventorySync.ts","hooks/useInventorySync.ts","onSync?","onSync?",24,24
1,1,2,0,1,"onValidationFail?@26-26@hooks/useInventorySync.ts","hooks/useInventorySync.ts","onValidationFail?","onValidationFail?",26,26
1,1,2,0,1,"syncNow@31-31@hooks/useInventorySync.ts","hooks/useInventorySync.ts","syncNow","syncNow",31,31
1,1,6,0,1,"validateNow@33-33@hooks/useInventorySync.ts","hooks/useInventorySync.ts","validateNow","validateNow",33,33
2,1,3,0,2,"useInventorySync@51-52@hooks/useInventorySync.ts","hooks/useInventorySync.ts","useInventorySync","useInventorySync",51,52
19,5,78,0,23,"useCallback@70-92@hooks/useInventorySync.ts","hooks/useInventorySync.ts","useCallback","useCallback",70,92
20,5,94,0,26,"(anonymous)@97-122@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",97,122
3,1,6,0,3,"(anonymous)@132-134@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",132,134
6,2,31,0,9,"(anonymous)@127-135@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",127,135
1,1,28,0,1,"(anonymous)@145-145@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",145,145
5,2,17,0,5,"(anonymous)@164-168@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",164,168
16,5,72,0,30,"(anonymous)@140-169@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",140,169
10,4,45,0,13,"(anonymous)@174-186@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",174,186
3,1,26,0,3,"(anonymous)@223-225@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",223,225
9,2,57,0,12,"(anonymous)@217-228@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",217,228
5,2,17,0,5,"(anonymous)@230-234@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",230,234
9,4,56,0,29,"(anonymous)@207-235@hooks/useInventorySync.ts","hooks/useInventorySync.ts","(anonymous)","(anonymous)",207,235
9,1,55,3,39,"useDevValidation@200-238@hooks/useInventorySync.ts","hooks/useInventorySync.ts","useDevValidation","useDevValidation ( inventory : ElectronicComponent [ ] , diagram : WiringDiagram | null , debounceMs = 300 )",200,238
1,1,2,0,1,"(anonymous)@15-15@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",15,15
1,1,2,0,1,"(anonymous)@16-16@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",16,16
1,1,2,0,1,"(anonymous)@17-17@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",17,17
1,1,2,0,1,"(anonymous)@18-18@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",18,18
1,1,2,0,1,"(anonymous)@19-19@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",19,19
1,1,2,0,1,"(anonymous)@22-22@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",22,22
1,1,2,0,1,"(anonymous)@23-23@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",23,23
1,1,2,0,1,"(anonymous)@24-24@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",24,24
1,1,2,0,1,"(anonymous)@25-25@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",25,25
14,1,61,0,17,"(anonymous)@41-57@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",41,57
31,4,230,1,52,"useAIActions@28-79@hooks/useAIActions.ts","hooks/useAIActions.ts","useAIActions","useAIActions ( options : UseAIActionsOptions )",28,79
1,1,7,0,1,"(anonymous)@88-88@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",88,88
15,5,72,0,16,"(anonymous)@82-97@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",82,97
1,1,4,0,1,"(anonymous)@100-100@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",100,100
1,1,10,0,1,"(anonymous)@100-100@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",100,100
4,1,18,0,4,"(anonymous)@99-102@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",99,102
1,1,4,0,1,"(anonymous)@105-105@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",105,105
1,1,10,0,1,"(anonymous)@105-105@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",105,105
3,1,10,0,3,"(anonymous)@104-106@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",104,106
1,1,9,0,1,"(anonymous)@108-108@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",108,108
3,1,13,0,3,"(anonymous)@111-113@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",111,113
3,1,11,0,3,"(anonymous)@115-117@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",115,117
3,1,11,0,3,"(anonymous)@119-121@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",119,121
3,1,10,0,3,"(anonymous)@123-125@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",123,125
1,1,9,0,1,"(anonymous)@127-127@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",127,127
1,1,9,0,1,"(anonymous)@128-128@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",128,128
1,1,9,0,1,"(anonymous)@129-129@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",129,129
1,1,9,0,1,"(anonymous)@130-130@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",130,130
1,1,6,0,1,"(anonymous)@133-133@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",133,133
4,2,24,0,4,"(anonymous)@132-135@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",132,135
3,1,7,0,3,"(anonymous)@137-139@hooks/useAIActions.ts","hooks/useAIActions.ts","(anonymous)","(anonymous)",137,139
1,1,2,0,1,"(anonymous)@8-8@services/__tests__/aiMetricsService.test.ts","services/__tests__/aiMetricsService.test.ts","(anonymous)","(anonymous)",8,8
5,1,31,0,5,"(anonymous)@5-9@services/__tests__/aiMetricsService.test.ts","services/__tests__/aiMetricsService.test.ts","(anonymous)","(anonymous)",5,9
18,1,101,0,19,"(anonymous)@11-29@services/__tests__/aiMetricsService.test.ts","services/__tests__/aiMetricsService.test.ts","(anonymous)","(anonymous)",11,29
8,1,128,0,9,"(anonymous)@31-39@services/__tests__/aiMetricsService.test.ts","services/__tests__/aiMetricsService.test.ts","(anonymous)","(anonymous)",31,39
5,1,63,0,6,"(anonymous)@41-46@services/__tests__/aiMetricsService.test.ts","services/__tests__/aiMetricsService.test.ts","(anonymous)","(anonymous)",41,46
8,1,33,0,8,"(anonymous)@49-56@services/__tests__/aiMetricsService.test.ts","services/__tests__/aiMetricsService.test.ts","(anonymous)","(anonymous)",49,56
1,1,6,0,1,"(anonymous)@63-63@services/__tests__/aiMetricsService.test.ts","services/__tests__/aiMetricsService.test.ts","(anonymous)","(anonymous)",63,63
8,1,97,0,17,"(anonymous)@48-64@services/__tests__/aiMetricsService.test.ts","services/__tests__/aiMetricsService.test.ts","(anonymous)","(anonymous)",48,64
7,1,50,0,62,"(anonymous)@4-65@services/__tests__/aiMetricsService.test.ts","services/__tests__/aiMetricsService.test.ts","(anonymous)","(anonymous)",4,65
4,1,28,0,4,"(anonymous)@6-9@services/__tests__/geminiService.test.ts","services/__tests__/geminiService.test.ts","(anonymous)","(anonymous)",6,9
9,1,55,0,9,"(anonymous)@11-19@services/__tests__/geminiService.test.ts","services/__tests__/geminiService.test.ts","(anonymous)","(anonymous)",11,19
3,1,24,0,3,"(anonymous)@21-23@services/__tests__/geminiService.test.ts","services/__tests__/geminiService.test.ts","(anonymous)","(anonymous)",21,23
5,1,32,0,20,"(anonymous)@5-24@services/__tests__/geminiService.test.ts","services/__tests__/geminiService.test.ts","(anonymous)","(anonymous)",5,24
8,1,34,0,8,"createComponent@21-28@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","createComponent","createComponent",21,28
6,1,17,0,6,"createDiagram@30-35@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","createDiagram","createDiagram",30,35
8,1,65,0,10,"(anonymous)@42-51@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",42,51
13,1,90,0,16,"(anonymous)@53-68@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",53,68
16,1,141,0,19,"(anonymous)@70-88@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",70,88
1,1,6,0,1,"(anonymous)@104-104@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",104,104
13,1,96,0,16,"(anonymous)@90-105@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",90,105
1,1,6,0,1,"(anonymous)@121-121@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",121,121
13,1,108,0,16,"(anonymous)@107-122@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",107,122
12,1,90,0,15,"(anonymous)@124-138@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",124,138
12,1,86,0,17,"(anonymous)@140-156@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",140,156
9,1,72,0,117,"(anonymous)@41-157@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",41,157
7,1,55,0,9,"(anonymous)@164-172@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",164,172
8,1,74,0,10,"(anonymous)@174-183@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",174,183
9,1,87,0,11,"(anonymous)@185-195@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",185,195
9,1,97,0,11,"(anonymous)@197-207@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",197,207
6,1,42,0,46,"(anonymous)@163-208@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",163,208
6,1,43,0,8,"(anonymous)@215-222@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",215,222
10,1,97,0,12,"(anonymous)@224-235@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",224,235
6,1,50,0,9,"(anonymous)@237-245@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",237,245
5,1,32,0,33,"(anonymous)@214-246@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",214,246
21,1,144,0,23,"(anonymous)@253-275@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",253,275
8,1,40,0,10,"(anonymous)@277-286@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",277,286
4,1,22,0,36,"(anonymous)@252-287@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",252,287
12,1,94,0,14,"(anonymous)@294-307@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",294,307
14,1,91,0,16,"(anonymous)@309-324@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",309,324
4,1,22,0,33,"(anonymous)@293-325@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",293,325
16,1,117,0,18,"(anonymous)@332-349@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",332,349
15,1,150,0,18,"(anonymous)@351-368@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",351,368
7,1,64,0,9,"(anonymous)@370-378@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",370,378
5,1,32,0,49,"(anonymous)@331-379@services/__tests__/componentValidator.test.ts","services/__tests__/componentValidator.test.ts","(anonymous)","(anonymous)",331,379
7,2,19,0,7,"getStoredApiKey@8-14@services/apiKeyStorage.ts","services/apiKeyStorage.ts","getStoredApiKey","getStoredApiKey",8,14
15,4,82,0,16,"setStoredApiKey@16-31@services/apiKeyStorage.ts","services/apiKeyStorage.ts","setStoredApiKey","setStoredApiKey",16,31
1,1,10,0,1,"(anonymous)@32-32@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",32,32
1,1,13,0,1,"(anonymous)@33-33@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",33,33
4,1,29,0,4,"(anonymous)@42-45@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",42,45
17,4,144,1,31,"summarizeInventory@21-51@services/aiContextBuilder.ts","services/aiContextBuilder.ts","summarizeInventory","summarizeInventory ( inventory : ElectronicComponent [ ] ) ( actions : ActionRecord [ ] )",21,51
1,1,6,0,1,"(anonymous)@86-86@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",86,86
1,1,6,0,1,"(anonymous)@87-87@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",87,87
33,9,195,1,46,"buildAIContext@64-109@services/aiContextBuilder.ts","services/aiContextBuilder.ts","buildAIContext","buildAIContext ( options : BuildContextOptions )",64,109
1,1,12,0,1,"(anonymous)@159-159@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",159,159
34,7,268,1,57,"buildContextPrompt@114-170@services/aiContextBuilder.ts","services/aiContextBuilder.ts","buildContextPrompt","buildContextPrompt ( context : AIContext )",114,170
9,4,70,0,9,"(anonymous)@181-189@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",181,189
1,1,8,0,1,"(anonymous)@196-196@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",196,196
1,1,8,0,1,"(anonymous)@197-197@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",197,197
8,2,75,0,8,"(anonymous)@195-202@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",195,202
14,3,118,1,41,"buildDetailedDiagramContext@170-210@services/aiContextBuilder.ts","services/aiContextBuilder.ts","buildDetailedDiagramContext","buildDetailedDiagramContext ( diagram : WiringDiagram )",170,210
4,1,20,0,4,"(anonymous)@220-223@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",220,223
1,1,10,0,1,"(anonymous)@224-224@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",224,224
1,1,6,0,1,"(anonymous)@235-235@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",235,235
1,1,4,0,1,"(anonymous)@242-242@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",242,242
1,1,6,0,1,"(anonymous)@249-249@services/aiContextBuilder.ts","services/aiContextBuilder.ts","(anonymous)","(anonymous)",249,249
32,9,244,1,49,"buildProactiveSuggestionContext@210-258@services/aiContextBuilder.ts","services/aiContextBuilder.ts","buildProactiveSuggestionContext","buildProactiveSuggestionContext ( options : BuildContextOptions )",210,258
8,4,34,0,11,"getApiKey@111-121@services/geminiService.ts","services/geminiService.ts","getApiKey","getApiKey",111,121
4,3,47,0,4,"(anonymous)@202-205@services/geminiService.ts","services/geminiService.ts","(anonymous)","(anonymous)",202,205
41,3,192,0,53,"generateWiringDiagram@198-250@services/geminiService.ts","services/geminiService.ts","generateWiringDiagram","generateWiringDiagram",198,250
25,3,123,0,27,"explainComponent@263-289@services/geminiService.ts","services/geminiService.ts","explainComponent","explainComponent",263,289
38,3,233,0,40,"smartFillComponent@293-332@services/geminiService.ts","services/geminiService.ts","smartFillComponent","smartFillComponent",293,332
1,1,22,0,1,"(anonymous)@371-371@services/geminiService.ts","services/geminiService.ts","(anonymous)","(anonymous)",371,371
65,2,335,0,68,"assistComponentEditor@345-412@services/geminiService.ts","services/geminiService.ts","assistComponentEditor","assistComponentEditor",345,412
22,3,161,0,22,"augmentComponentData@420-441@services/geminiService.ts","services/geminiService.ts","augmentComponentData","augmentComponentData",420,441
24,3,158,0,25,"findComponentSpecs@445-469@services/geminiService.ts","services/geminiService.ts","findComponentSpecs","findComponentSpecs",445,469
30,3,232,0,34,"identifyComponentFromImage@473-506@services/geminiService.ts","services/geminiService.ts","identifyComponentFromImage","identifyComponentFromImage",473,506
1,1,1,0,1,"(anonymous)@64-64@services/knowledgeService.ts","services/knowledgeService.ts","(anonymous)","(anonymous)",64,64
1,1,11,0,1,"(anonymous)@70-70@services/knowledgeService.ts","services/knowledgeService.ts","(anonymous)","(anonymous)",70,70
9,3,72,0,11,"search@61-71@services/knowledgeService.ts","services/knowledgeService.ts","search","search",61,71
1,1,11,0,1,"(anonymous)@74-74@services/knowledgeService.ts","services/knowledgeService.ts","(anonymous)","(anonymous)",74,74
3,1,16,0,3,"getAllKnowledge@73-75@services/knowledgeService.ts","services/knowledgeService.ts","getAllKnowledge","getAllKnowledge",73,75
1,1,2,0,1,"(anonymous)@14-14@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",14,14
6,2,35,0,6,"getCachedMaterial@14-19@services/threePrimitives.ts","services/threePrimitives.ts","getCachedMaterial","getCachedMaterial",14,19
7,1,34,0,7,"IC_BODY@23-29@services/threePrimitives.ts","services/threePrimitives.ts","IC_BODY","IC_BODY",23,29
6,1,31,0,6,"(anonymous)@32-37@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",32,37
2,1,10,0,9,"(anonymous)@32-40@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",32,40
6,1,31,0,6,"(anonymous)@40-45@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",40,45
2,1,10,0,9,"(anonymous)@40-48@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",40,48
6,1,31,0,6,"(anonymous)@48-53@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",48,53
2,1,10,0,9,"(anonymous)@48-56@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",48,56
6,1,31,0,6,"(anonymous)@56-61@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",56,61
2,1,10,0,9,"(anonymous)@56-64@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",56,64
7,1,37,0,7,"(anonymous)@64-70@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",64,70
2,1,10,0,10,"(anonymous)@64-73@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",64,73
6,1,31,0,6,"(anonymous)@73-78@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",73,78
2,1,10,0,9,"(anonymous)@73-81@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",73,81
9,1,47,0,9,"(anonymous)@81-89@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",81,89
2,1,15,0,12,"(anonymous)@81-92@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",81,92
6,1,29,0,6,"(anonymous)@92-97@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",92,97
2,1,14,0,7,"(anonymous)@92-98@services/threePrimitives.ts","services/threePrimitives.ts","(anonymous)","(anonymous)",92,98
46,6,393,0,60,"createTraceTexture@107-166@services/threePrimitives.ts","services/threePrimitives.ts","createTraceTexture","createTraceTexture",107,166
13,1,144,0,18,"createICBody@175-192@services/threePrimitives.ts","services/threePrimitives.ts","createICBody","createICBody",175,192
38,8,379,0,45,"createPinRow@197-241@services/threePrimitives.ts","services/threePrimitives.ts","createPinRow","createPinRow",197,241
12,1,133,0,15,"createCylinderBody@246-260@services/threePrimitives.ts","services/threePrimitives.ts","createCylinderBody","createCylinderBody",246,260
22,3,216,0,24,"createHeader@265-288@services/threePrimitives.ts","services/threePrimitives.ts","createHeader","createHeader",265,288
14,2,129,0,15,"createUSBPort@293-307@services/threePrimitives.ts","services/threePrimitives.ts","createUSBPort","createUSBPort",293,307
18,1,200,0,20,"createDCJack@312-331@services/threePrimitives.ts","services/threePrimitives.ts","createDCJack","createDCJack",312,331
6,1,49,0,6,"createOscillator@336-341@services/threePrimitives.ts","services/threePrimitives.ts","createOscillator","createOscillator",336,341
12,1,117,0,13,"createButton@346-358@services/threePrimitives.ts","services/threePrimitives.ts","createButton","createButton",346,358
18,2,151,0,18,"createLabel@363-380@services/threePrimitives.ts","services/threePrimitives.ts","createLabel","createLabel",363,380
12,2,95,0,21,"createPCB@385-405@services/threePrimitives.ts","services/threePrimitives.ts","createPCB","createPCB",385,405
6,5,88,0,7,"(anonymous)@34-40@services/circuitAnalysisService.ts","services/circuitAnalysisService.ts","(anonymous)","(anonymous)",34,40
20,7,128,0,21,"(anonymous)@43-63@services/circuitAnalysisService.ts","services/circuitAnalysisService.ts","(anonymous)","(anonymous)",43,63
1,3,32,0,1,"(anonymous)@66-66@services/circuitAnalysisService.ts","services/circuitAnalysisService.ts","(anonymous)","(anonymous)",66,66
1,3,27,0,1,"(anonymous)@76-76@services/circuitAnalysisService.ts","services/circuitAnalysisService.ts","(anonymous)","(anonymous)",76,76
1,3,27,0,1,"(anonymous)@77-77@services/circuitAnalysisService.ts","services/circuitAnalysisService.ts","(anonymous)","(anonymous)",77,77
1,2,19,0,1,"(anonymous)@88-88@services/circuitAnalysisService.ts","services/circuitAnalysisService.ts","(anonymous)","(anonymous)",88,88
1,1,13,0,1,"(anonymous)@89-89@services/circuitAnalysisService.ts","services/circuitAnalysisService.ts","(anonymous)","(anonymous)",89,89
1,1,6,0,1,"isValid@102-102@services/circuitAnalysisService.ts","services/circuitAnalysisService.ts","isValid","isValid",102,102
42,6,245,0,84,"analyze@26-109@services/circuitAnalysisService.ts","services/circuitAnalysisService.ts","analyze","analyze",26,109
1,1,16,0,1,"isWordBoundary@71-71@services/responseParser.ts","services/responseParser.ts","isWordBoundary","isWordBoundary",71,71
1,1,8,0,1,"(anonymous)@90-90@services/responseParser.ts","services/responseParser.ts","(anonymous)","(anonymous)",90,90
42,10,303,2,61,"parseComponentMentions@38-98@services/responseParser.ts","services/responseParser.ts","parseComponentMentions","parseComponentMentions ( text : string , availableComponents : ElectronicComponent [ ] )",38,98
18,3,134,0,25,"logMetric@22-46@services/aiMetricsService.ts","services/aiMetricsService.ts","logMetric","logMetric",22,46
8,3,35,0,8,"(anonymous)@52-59@services/aiMetricsService.ts","services/aiMetricsService.ts","(anonymous)","(anonymous)",52,59
1,1,6,0,1,"(anonymous)@63-63@services/aiMetricsService.ts","services/aiMetricsService.ts","(anonymous)","(anonymous)",63,63
1,1,8,0,1,"(anonymous)@66-66@services/aiMetricsService.ts","services/aiMetricsService.ts","(anonymous)","(anonymous)",66,66
7,3,64,0,8,"(anonymous)@61-68@services/aiMetricsService.ts","services/aiMetricsService.ts","(anonymous)","(anonymous)",61,68
1,1,6,0,1,"(anonymous)@72-72@services/aiMetricsService.ts","services/aiMetricsService.ts","(anonymous)","(anonymous)",72,72
1,1,4,0,1,"(anonymous)@75-75@services/aiMetricsService.ts","services/aiMetricsService.ts","(anonymous)","(anonymous)",75,75
7,3,61,0,8,"(anonymous)@70-77@services/aiMetricsService.ts","services/aiMetricsService.ts","(anonymous)","(anonymous)",70,77
1,1,6,0,1,"(anonymous)@85-85@services/aiMetricsService.ts","services/aiMetricsService.ts","(anonymous)","(anonymous)",85,85
14,4,94,0,16,"(anonymous)@79-94@services/aiMetricsService.ts","services/aiMetricsService.ts","(anonymous)","(anonymous)",79,94
6,3,43,0,6,"(anonymous)@22-27@services/datasetService.ts","services/datasetService.ts","(anonymous)","(anonymous)",22,27
1,1,8,0,1,"(anonymous)@33-33@services/datasetService.ts","services/datasetService.ts","(anonymous)","(anonymous)",33,33
1,1,8,0,1,"(anonymous)@51-51@services/datasetService.ts","services/datasetService.ts","(anonymous)","(anonymous)",51,51
18,9,140,0,32,"(anonymous)@31-62@services/datasetService.ts","services/datasetService.ts","(anonymous)","(anonymous)",31,62
1,1,7,0,1,"(anonymous)@65-65@services/datasetService.ts","services/datasetService.ts","(anonymous)","(anonymous)",65,65
16,3,123,0,61,"exportTrainingData@11-71@services/datasetService.ts","services/datasetService.ts","exportTrainingData","exportTrainingData",11,71
12,1,97,0,12,"downloadDataset@73-84@services/datasetService.ts","services/datasetService.ts","downloadDataset","downloadDataset",73,84
8,2,41,0,10,"init@22-31@services/ragService.ts","services/ragService.ts","init","init ( )",22,31
1,1,6,0,1,"(anonymous)@39-39@services/ragService.ts","services/ragService.ts","(anonymous)","(anonymous)",39,39
1,1,6,0,1,"(anonymous)@39-39@services/ragService.ts","services/ragService.ts","(anonymous)","(anonymous)",39,39
14,4,117,0,18,"bootstrapKnowledge@33-50@services/ragService.ts","services/ragService.ts","bootstrapKnowledge","bootstrapKnowledge ( )",33,50
11,1,54,3,14,"addDocument@52-65@services/ragService.ts","services/ragService.ts","addDocument","addDocument ( id : string , content : string , metadata : any )",52,65
5,2,38,0,5,"scored@73-77@services/ragService.ts","services/ragService.ts","scored","scored",73,77
1,1,8,0,1,"scored.sort@81-81@services/ragService.ts","services/ragService.ts","scored.sort","scored.sort",81,81
1,1,4,0,1,"(anonymous)@83-83@services/ragService.ts","services/ragService.ts","(anonymous)","(anonymous)",83,83
11,2,105,2,11,"cosineSimilarity@93-103@services/ragService.ts","services/ragService.ts","cosineSimilarity","cosineSimilarity ( vecA : number [ ] , vecB : number [ ] )",93,103
22,3,93,0,24,"getProfile@30-53@services/userProfileService.ts","services/userProfileService.ts","getProfile","getProfile",30,53
3,1,16,0,3,"saveProfile@55-57@services/userProfileService.ts","services/userProfileService.ts","saveProfile","saveProfile",55,57
5,1,24,0,5,"updateExperience@59-63@services/userProfileService.ts","services/userProfileService.ts","updateExperience","updateExperience",59,63
10,1,51,0,10,"addFact@65-74@services/userProfileService.ts","services/userProfileService.ts","addFact","addFact",65,74
12,8,93,0,17,"detectAndSetLevelFromQuery@77-93@services/userProfileService.ts","services/userProfileService.ts","detectAndSetLevelFromQuery","detectAndSetLevelFromQuery",77,93
1,1,2,0,1,"sendRealtimeInput@13-13@services/liveAudio.ts","services/liveAudio.ts","sendRealtimeInput","sendRealtimeInput",13,13
1,1,2,0,1,"sendMedia?@14-14@services/liveAudio.ts","services/liveAudio.ts","sendMedia?","sendMedia?",14,14
1,1,2,0,1,"close@15-15@services/liveAudio.ts","services/liveAudio.ts","close","close",15,15
8,2,53,1,8,"encode@24-31@services/liveAudio.ts","services/liveAudio.ts","encode","encode ( bytes : Uint8Array )",24,31
9,2,62,1,9,"decode@33-41@services/liveAudio.ts","services/liveAudio.ts","decode","decode ( base64 : string )",33,41
4,1,17,1,4,"encode@53-56@services/liveAudio.ts","services/liveAudio.ts","encode","encode ( new Uint8Array ( int16 . buffer )",53,56
14,2,99,2,15,"audioBufferFromPcm16@59-73@services/liveAudio.ts","services/liveAudio.ts","audioBufferFromPcm16","audioBufferFromPcm16 ( base64Data : string , ctx : AudioContext )",59,73
4,1,24,0,5,"reader.onloadend@79-83@services/liveAudio.ts","services/liveAudio.ts","reader.onloadend","reader.onloadend",79,83
6,1,32,0,10,"(anonymous)@77-86@services/liveAudio.ts","services/liveAudio.ts","(anonymous)","(anonymous)",77,86
3,1,25,1,12,"blobToBase64@76-87@services/liveAudio.ts","services/liveAudio.ts","blobToBase64","blobToBase64 ( blob : Blob )",76,87
1,1,2,0,1,"(anonymous)@100-100@services/liveAudio.ts","services/liveAudio.ts","(anonymous)","(anonymous)",100,100
1,1,2,0,1,"(anonymous)@104-104@services/liveAudio.ts","services/liveAudio.ts","(anonymous)","(anonymous)",104,104
1,1,7,0,1,"(anonymous)@110-110@services/liveAudio.ts","services/liveAudio.ts","(anonymous)","(anonymous)",110,110
5,1,37,0,6,"onopen@144-149@services/liveAudio.ts","services/liveAudio.ts","onopen","onopen",144,149
3,1,9,0,3,"onmessage@150-152@services/liveAudio.ts","services/liveAudio.ts","onmessage","onmessage",150,152
4,1,15,0,4,"onclose@153-156@services/liveAudio.ts","services/liveAudio.ts","onclose","onclose",153,156
5,1,22,0,5,"onerror@157-161@services/liveAudio.ts","services/liveAudio.ts","onerror","onerror",157,161
3,1,13,0,3,"(anonymous)@184-186@services/liveAudio.ts","services/liveAudio.ts","(anonymous)","(anonymous)",184,186
5,1,33,0,8,"this.processor.onaudioprocess@180-187@services/liveAudio.ts","services/liveAudio.ts","this.processor.onaudioprocess","this.processor.onaudioprocess",180,187
13,2,49,0,20,"(anonymous)@205-224@services/liveAudio.ts","services/liveAudio.ts","(anonymous)","(anonymous)",205,224
8,2,41,0,27,"setInterval@200-226@services/liveAudio.ts","services/liveAudio.ts","setInterval","setInterval",200,226
1,1,6,0,1,"(anonymous)@236-236@services/liveAudio.ts","services/liveAudio.ts","(anonymous)","(anonymous)",236,236
6,1,35,1,6,"if@235-240@services/liveAudio.ts","services/liveAudio.ts","if","if ( serverContent? . interrupted )",235,240
3,1,11,0,3,"source.onended@257-259@services/liveAudio.ts","services/liveAudio.ts","source.onended","source.onended",257,259
7,3,37,1,7,"if@264-270@services/liveAudio.ts","services/liveAudio.ts","if","if ( this . session )",264,270
1,1,6,0,1,"(anonymous)@276-276@services/liveAudio.ts","services/liveAudio.ts","(anonymous)","(anonymous)",276,276
1,1,6,0,1,"(anonymous)@286-286@services/liveAudio.ts","services/liveAudio.ts","(anonymous)","(anonymous)",286,286
1,1,8,0,1,"(anonymous)@61-61@services/componentValidator.ts","services/componentValidator.ts","(anonymous)","(anonymous)",61,61
107,16,604,4,144,"validateDiagramInventoryConsistency@53-196@services/componentValidator.ts","services/componentValidator.ts","validateDiagramInventoryConsistency","validateDiagramInventoryConsistency ( diagram : WiringDiagram , inventory : ElectronicComponent [ ] ) ( diagramComp : ElectronicComponent , inventoryComp : ElectronicComponent ) ( a : Set < T > , b : Set < T > )",53,196
1,1,1,0,1,"(anonymous)@213-213@services/componentValidator.ts","services/componentValidator.ts","(anonymous)","(anonymous)",213,213
2,2,12,0,2,"(anonymous)@250-251@services/componentValidator.ts","services/componentValidator.ts","(anonymous)","(anonymous)",250,251
46,10,261,4,67,"analyzeUsage@196-262@services/componentValidator.ts","services/componentValidator.ts","analyzeUsage","analyzeUsage ( inventoryId : string , currentDiagram : WiringDiagram , savedDiagrams : WiringDiagram [ ] = [ ] ) ( componentId : string , connections : WireConnection [ ] )",196,262
33,4,144,3,41,"determineOrphanAction@262-302@services/componentValidator.ts","services/componentValidator.ts","determineOrphanAction","determineOrphanAction ( inventoryId : string , currentDiagram : WiringDiagram , savedDiagrams : WiringDiagram [ ] = [ ] )",262,302
1,1,8,0,1,"(anonymous)@316-316@services/componentValidator.ts","services/componentValidator.ts","(anonymous)","(anonymous)",316,316
22,4,128,2,33,"syncComponentWithInventory@312-344@services/componentValidator.ts","services/componentValidator.ts","syncComponentWithInventory","syncComponentWithInventory ( diagramComp : ElectronicComponent , inventory : ElectronicComponent [ ] )",312,344
7,2,36,0,10,"(anonymous)@350-359@services/componentValidator.ts","services/componentValidator.ts","(anonymous)","(anonymous)",350,359
14,1,60,2,25,"syncDiagramWithInventory@344-368@services/componentValidator.ts","services/componentValidator.ts","syncDiagramWithInventory","syncDiagramWithInventory ( diagram : WiringDiagram , inventory : ElectronicComponent [ ] )",344,368
1,1,4,0,1,"(anonymous)@378-378@services/componentValidator.ts","services/componentValidator.ts","(anonymous)","(anonymous)",378,378
8,3,50,0,10,"(anonymous)@381-390@services/componentValidator.ts","services/componentValidator.ts","(anonymous)","(anonymous)",381,390
2,2,20,0,2,"(anonymous)@395-396@services/componentValidator.ts","services/componentValidator.ts","(anonymous)","(anonymous)",395,396
19,1,108,2,33,"removeOrphanedComponents@374-406@services/componentValidator.ts","services/componentValidator.ts","removeOrphanedComponents","removeOrphanedComponents ( diagram : WiringDiagram , inventory : ElectronicComponent [ ] )",374,406
16,4,163,2,19,"logValidationResult@415-433@services/componentValidator.ts","services/componentValidator.ts","logValidationResult","logValidationResult ( result : ValidationResult , label = 'Validation' )",415,433
10,5,93,0,17,"getPackage@46-62@services/standardsService.ts","services/standardsService.ts","getPackage","getPackage",46,62
8,4,62,0,8,"getBoardMap@63-70@services/standardsService.ts","services/standardsService.ts","getBoardMap","getBoardMap",63,70
19,6,188,0,20,"request.onupgradeneeded@28-47@services/storage.ts","services/storage.ts","request.onupgradeneeded","request.onupgradeneeded",28,47
1,1,7,0,1,"request.onsuccess@49-49@services/storage.ts","services/storage.ts","request.onsuccess","request.onsuccess",49,49
1,1,7,0,1,"request.onerror@50-50@services/storage.ts","services/storage.ts","request.onerror","request.onerror",50,50
6,1,40,0,27,"(anonymous)@25-51@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",25,51
3,1,15,0,29,"openDB@24-52@services/storage.ts","services/storage.ts","openDB","openDB",24,52
17,7,79,0,17,"setItem@59-75@services/storage.ts","services/storage.ts","setItem","setItem",59,75
3,1,10,0,3,"getItem@77-79@services/storage.ts","services/storage.ts","getItem","getItem",77,79
1,1,7,0,1,"(anonymous)@85-85@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",85,85
1,1,7,0,1,"(anonymous)@86-86@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",86,86
5,2,27,0,5,"(anonymous)@96-100@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",96,100
19,4,111,0,27,"handleQuotaExceeded@81-107@services/storage.ts","services/storage.ts","handleQuotaExceeded","handleQuotaExceeded",81,107
1,1,4,0,1,"tx.oncomplete@119-119@services/storage.ts","services/storage.ts","tx.oncomplete","tx.oncomplete",119,119
1,1,7,0,1,"tx.onerror@120-120@services/storage.ts","services/storage.ts","tx.onerror","tx.onerror",120,120
6,1,46,0,6,"(anonymous)@116-121@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",116,121
4,1,26,0,9,"recordAction@114-122@services/storage.ts","services/storage.ts","recordAction","recordAction",114,122
1,1,8,0,1,"(anonymous)@133-133@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",133,133
4,1,35,0,4,"request.onsuccess@131-134@services/storage.ts","services/storage.ts","request.onsuccess","request.onsuccess",131,134
1,1,7,0,1,"request.onerror@135-135@services/storage.ts","services/storage.ts","request.onerror","request.onerror",135,135
7,1,54,0,11,"(anonymous)@126-136@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",126,136
4,1,23,0,14,"getRecentActions@124-137@services/storage.ts","services/storage.ts","getRecentActions","getRecentActions",124,137
1,1,4,0,1,"tx.oncomplete@144-144@services/storage.ts","services/storage.ts","tx.oncomplete","tx.oncomplete",144,144
1,1,7,0,1,"tx.onerror@145-145@services/storage.ts","services/storage.ts","tx.onerror","tx.onerror",145,145
6,1,46,0,6,"(anonymous)@141-146@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",141,146
4,1,26,0,9,"deleteAction@139-147@services/storage.ts","services/storage.ts","deleteAction","deleteAction",139,147
1,1,4,0,1,"tx.oncomplete@158-158@services/storage.ts","services/storage.ts","tx.oncomplete","tx.oncomplete",158,158
1,1,7,0,1,"tx.onerror@159-159@services/storage.ts","services/storage.ts","tx.onerror","tx.onerror",159,159
6,1,46,0,6,"(anonymous)@155-160@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",155,160
4,1,26,0,9,"saveConversation@153-161@services/storage.ts","services/storage.ts","saveConversation","saveConversation",153,161
1,1,8,0,1,"(anonymous)@170-170@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",170,170
4,1,35,0,4,"request.onsuccess@168-171@services/storage.ts","services/storage.ts","request.onsuccess","request.onsuccess",168,171
1,1,7,0,1,"request.onerror@172-172@services/storage.ts","services/storage.ts","request.onerror","request.onerror",172,172
6,1,49,0,9,"(anonymous)@165-173@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",165,173
4,1,23,0,12,"listConversations@163-174@services/storage.ts","services/storage.ts","listConversations","listConversations",163,174
7,2,30,0,7,"request.onsuccess@186-192@services/storage.ts","services/storage.ts","request.onsuccess","request.onsuccess",186,192
1,1,4,0,1,"tx.oncomplete@193-193@services/storage.ts","services/storage.ts","tx.oncomplete","tx.oncomplete",193,193
1,1,7,0,1,"tx.onerror@194-194@services/storage.ts","services/storage.ts","tx.onerror","tx.onerror",194,194
10,1,98,0,18,"(anonymous)@178-195@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",178,195
4,1,26,0,21,"deleteConversation@176-196@services/storage.ts","services/storage.ts","deleteConversation","deleteConversation",176,196
1,1,4,0,1,"(anonymous)@200-200@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",200,200
4,2,22,0,4,"getPrimaryConversation@198-201@services/storage.ts","services/storage.ts","getPrimaryConversation","getPrimaryConversation",198,201
1,1,4,0,1,"tx.oncomplete@208-208@services/storage.ts","services/storage.ts","tx.oncomplete","tx.oncomplete",208,208
1,1,7,0,1,"tx.onerror@209-209@services/storage.ts","services/storage.ts","tx.onerror","tx.onerror",209,209
6,1,46,0,6,"(anonymous)@205-210@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",205,210
4,1,26,0,9,"saveMessage@203-211@services/storage.ts","services/storage.ts","saveMessage","saveMessage",203,211
1,1,8,0,1,"(anonymous)@221-221@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",221,221
4,1,28,0,4,"request.onsuccess@219-222@services/storage.ts","services/storage.ts","request.onsuccess","request.onsuccess",219,222
1,1,7,0,1,"request.onerror@223-223@services/storage.ts","services/storage.ts","request.onerror","request.onerror",223,223
7,1,65,0,10,"(anonymous)@215-224@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",215,224
4,1,23,0,13,"loadMessages@213-225@services/storage.ts","services/storage.ts","loadMessages","loadMessages",213,225
1,1,7,0,1,"(anonymous)@238-238@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",238,238
3,1,10,0,3,"(.onsuccess@237-239@services/storage.ts","services/storage.ts","(.onsuccess","(.onsuccess",237,239
1,1,4,0,1,"tx.oncomplete@241-241@services/storage.ts","services/storage.ts","tx.oncomplete","tx.oncomplete",241,241
1,1,7,0,1,"tx.onerror@242-242@services/storage.ts","services/storage.ts","tx.onerror","tx.onerror",242,242
7,1,57,0,11,"(anonymous)@233-243@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",233,243
4,1,26,0,14,"saveInventoryToDB@231-244@services/storage.ts","services/storage.ts","saveInventoryToDB","saveInventoryToDB",231,244
1,2,10,0,1,"request.onsuccess@251-251@services/storage.ts","services/storage.ts","request.onsuccess","request.onsuccess",251,251
3,1,10,0,3,"(anonymous)@250-252@services/storage.ts","services/storage.ts","(anonymous)","(anonymous)",250,252
6,1,51,0,8,"loadInventoryFromDB@246-253@services/storage.ts","services/storage.ts","loadInventoryFromDB","loadInventoryFromDB",246,253


---

# PART 5: APPENDIX - SCC METRICS (JSON)

[{"Name":"Markdown","Bytes":839330,"CodeBytes":0,"Lines":18350,"Code":14165,"Comment":0,"Blank":4185,"Complexity":0,"Count":87,"WeightedComplexity":0,"Files":[],"LineLength":null,"ULOC":0},{"Name":"TypeScript","Bytes":768884,"CodeBytes":0,"Lines":21415,"Code":17570,"Comment":1547,"Blank":2298,"Complexity":2825,"Count":63,"WeightedComplexity":0,"Files":[],"LineLength":null,"ULOC":0},{"Name":"JSON","Bytes":2423547,"CodeBytes":0,"Lines":60555,"Code":60555,"Comment":0,"Blank":0,"Complexity":0,"Count":31,"WeightedComplexity":0,"Files":[],"LineLength":null,"ULOC":0},{"Name":"C++","Bytes":5721,"CodeBytes":0,"Lines":274,"Code":188,"Comment":40,"Blank":46,"Complexity":12,"Count":13,"WeightedComplexity":0,"Files":[],"LineLength":null,"ULOC":0},{"Name":"CSV","Bytes":2943,"CodeBytes":0,"Lines":77,"Code":77,"Comment":0,"Blank":0,"Complexity":0,"Count":13,"WeightedComplexity":0,"Files":[],"LineLength":null,"ULOC":0},{"Name":"Plain Text","Bytes":5422,"CodeBytes":0,"Lines":94,"Code":94,"Comment":0,"Blank":0,"Complexity":0,"Count":13,"WeightedComplexity":0,"Files":[],"LineLength":null,"ULOC":0},{"Name":"JavaScript","Bytes":7220,"CodeBytes":0,"Lines":247,"Code":85,"Comment":160,"Blank":2,"Complexity":0,"Count":3,"WeightedComplexity":0,"Files":[],"LineLength":null,"ULOC":0},{"Name":"CSS","Bytes":9679,"CodeBytes":0,"Lines":445,"Code":354,"Comment":31,"Blank":60,"Complexity":0,"Count":1,"WeightedComplexity":0,"Files":[],"LineLength":null,"ULOC":0},{"Name":"HTML","Bytes":934,"CodeBytes":0,"Lines":27,"Code":27,"Comment":0,"Blank":0,"Complexity":0,"Count":1,"WeightedComplexity":0,"Files":[],"LineLength":null,"ULOC":0}]

---

# PART 6: APPENDIX - TOKEI METRICS (JSON)

{"Arduino C++":{"blanks":46,"children":{},"code":188,"comments":40,"inaccurate":false,"reports":[{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/sketch.ino","stats":{"blanks":5,"blobs":{},"code":21,"comments":2}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/sketch.ino","stats":{"blanks":0,"blobs":{},"code":9,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/sketch.ino","stats":{"blanks":4,"blobs":{},"code":20,"comments":2}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/sketch.ino","stats":{"blanks":8,"blobs":{},"code":23,"comments":10}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/sketch.ino","stats":{"blanks":3,"blobs":{},"code":10,"comments":7}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/sketch.ino","stats":{"blanks":3,"blobs":{},"code":15,"comments":2}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/sketch.ino","stats":{"blanks":4,"blobs":{},"code":17,"comments":2}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/sketch.ino","stats":{"blanks":4,"blobs":{},"code":12,"comments":4}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/sketch.ino","stats":{"blanks":3,"blobs":{},"code":11,"comments":3}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/sketch.ino","stats":{"blanks":5,"blobs":{},"code":22,"comments":2}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/sketch.ino","stats":{"blanks":1,"blobs":{},"code":0,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/sketch.ino","stats":{"blanks":3,"blobs":{},"code":13,"comments":4}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/sketch.ino","stats":{"blanks":3,"blobs":{},"code":15,"comments":2}}]},"CSS":{"blanks":60,"children":{},"code":354,"comments":31,"inaccurate":false,"reports":[{"name":"./index.css","stats":{"blanks":60,"blobs":{},"code":354,"comments":31}}]},"HTML":{"blanks":0,"children":{"JavaScript":[{"name":"./index.html","stats":{"blanks":0,"blobs":{},"code":11,"comments":0}}]},"code":16,"comments":0,"inaccurate":false,"reports":[{"name":"./index.html","stats":{"blanks":0,"blobs":{"JavaScript":{"blanks":0,"blobs":{},"code":11,"comments":0}},"code":16,"comments":0}}]},"JSON":{"blanks":0,"children":{},"code":70675,"comments":0,"inaccurate":false,"reports":[{"name":"./metadata.json","stats":{"blanks":0,"blobs":{},"code":8,"comments":0}},{"name":"./tmp/audit/tokei.json","stats":{"blanks":0,"blobs":{},"code":0,"comments":0}},{"name":"./tmp/audit/scc-report.json","stats":{"blanks":0,"blobs":{},"code":1,"comments":0}},{"name":"./package.json","stats":{"blanks":0,"blobs":{},"code":55,"comments":0}},{"name":"./assets/standards/ipc_dimensions.json","stats":{"blanks":0,"blobs":{},"code":66,"comments":0}},{"name":"./tsconfig.json","stats":{"blanks":0,"blobs":{},"code":29,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier4.json","stats":{"blanks":0,"blobs":{},"code":6078,"comments":0}},{"name":"./package-lock.json","stats":{"blanks":0,"blobs":{},"code":10200,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier5.json","stats":{"blanks":0,"blobs":{},"code":8115,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier3.json","stats":{"blanks":0,"blobs":{},"code":4767,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/plan.json","stats":{"blanks":0,"blobs":{},"code":57,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/plan.json","stats":{"blanks":0,"blobs":{},"code":0,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/plan.json","stats":{"blanks":0,"blobs":{},"code":69,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier1.json","stats":{"blanks":0,"blobs":{},"code":2697,"comments":0}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/plan.json","stats":{"blanks":0,"blobs":{},"code":31,"comments":0}},{"name":"./docs/misc/inventory/inventory.production.json","stats":{"blanks":0,"blobs":{},"code":10535,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/plan.json","stats":{"blanks":0,"blobs":{},"code":45,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/plan.json","stats":{"blanks":0,"blobs":{},"code":92,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/plan.json","stats":{"blanks":0,"blobs":{},"code":102,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/plan.json","stats":{"blanks":0,"blobs":{},"code":29,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/plan.json","stats":{"blanks":0,"blobs":{},"code":89,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/plan.json","stats":{"blanks":0,"blobs":{},"code":91,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/plan.json","stats":{"blanks":0,"blobs":{},"code":56,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/plan.json","stats":{"blanks":0,"blobs":{},"code":56,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_crossref.json","stats":{"blanks":0,"blobs":{},"code":8666,"comments":0}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/plan.json","stats":{"blanks":0,"blobs":{},"code":22,"comments":0}},{"name":"./docs/misc/inventory/wiring_ruleset/wiring_ruleset.json","stats":{"blanks":0,"blobs":{},"code":1352,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier2.json","stats":{"blanks":0,"blobs":{},"code":3431,"comments":0}},{"name":"./docs/misc/inventory/inventory.production.min.json","stats":{"blanks":0,"blobs":{},"code":1,"comments":0}},{"name":"./docs/audits/lighthouse/localhost_3000-20260101T084816.json","stats":{"blanks":0,"blobs":{},"code":13935,"comments":0}}]},"JavaScript":{"blanks":11,"children":{},"code":215,"comments":21,"inaccurate":false,"reports":[{"name":"./postcss.config.js","stats":{"blanks":0,"blobs":{},"code":5,"comments":0}},{"name":"./tailwind.config.js","stats":{"blanks":0,"blobs":{},"code":49,"comments":1}},{"name":"./eslint.config.js","stats":{"blanks":11,"blobs":{},"code":161,"comments":20}}]},"Markdown":{"blanks":4097,"children":{"Bash":[{"name":"./CLAUDE.md","stats":{"blanks":0,"blobs":{},"code":3,"comments":0}},{"name":"./CODEX_DONE.md","stats":{"blanks":0,"blobs":{},"code":167,"comments":0}},{"name":"./GEMINI.md","stats":{"blanks":0,"blobs":{},"code":6,"comments":1}},{"name":"./ref/visual-analysis-tools.md","stats":{"blanks":13,"blobs":{},"code":53,"comments":17}},{"name":"./docs/SCREENSHOT_CAPTURE_PLAYBOOK.md","stats":{"blanks":0,"blobs":{},"code":5,"comments":1}}],"Css":[{"name":"./docs/screenshots/UI_AUDIT_REPORT.md","stats":{"blanks":0,"blobs":{},"code":17,"comments":0}}],"Json":[{"name":"./docs/misc/inventory/electronics_inventory_tier3.md","stats":{"blanks":0,"blobs":{},"code":15,"comments":0}}],"Python":[{"name":"./ref/visual-analysis-tools.md","stats":{"blanks":9,"blobs":{},"code":21,"comments":6}}],"Tsx":[{"name":"./docs/audits/CODE_AUDIT_REPORT.md","stats":{"blanks":2,"blobs":{},"code":18,"comments":1}}],"TypeScript":[{"name":"./CLAUDE.md","stats":{"blanks":0,"blobs":{},"code":5,"comments":0}},{"name":"./ref/services.md","stats":{"blanks":1,"blobs":{},"code":14,"comments":3}},{"name":"./ref/components.md","stats":{"blanks":0,"blobs":{},"code":11,"comments":1}},{"name":"./ref/patterns.md","stats":{"blanks":9,"blobs":{},"code":88,"comments":17}},{"name":"./ref/pitfalls.md","stats":{"blanks":5,"blobs":{},"code":15,"comments":10}},{"name":"./ref/types.md","stats":{"blanks":0,"blobs":{},"code":111,"comments":4}},{"name":"./docs/data/types.md","stats":{"blanks":0,"blobs":{},"code":25,"comments":0}},{"name":"./docs/refactor-useAIActions.md","stats":{"blanks":6,"blobs":{},"code":41,"comments":9}},{"name":"./docs/services/gemini-api.md","stats":{"blanks":0,"blobs":{},"code":9,"comments":1}},{"name":"./docs/frontend/diagram-canvas.md","stats":{"blanks":0,"blobs":{},"code":15,"comments":8}}]},"code":0,"comments":13343,"inaccurate":false,"reports":[{"name":"./AGENTS.md","stats":{"blanks":18,"blobs":{},"code":0,"comments":40}},{"name":"./CLAUDE.md","stats":{"blanks":26,"blobs":{"Bash":{"blanks":0,"blobs":{},"code":3,"comments":0},"TypeScript":{"blanks":0,"blobs":{},"code":5,"comments":0}},"code":0,"comments":71}},{"name":"./plans/advanced-ai-workflows.md","stats":{"blanks":25,"blobs":{},"code":0,"comments":77}},{"name":"./plans/improved-ui-components.md","stats":{"blanks":16,"blobs":{},"code":0,"comments":68}},{"name":"./CODEX_DONE.md","stats":{"blanks":352,"blobs":{"Bash":{"blanks":0,"blobs":{},"code":167,"comments":0}},"code":0,"comments":663}},{"name":"./GEMINI.md","stats":{"blanks":21,"blobs":{"Bash":{"blanks":0,"blobs":{},"code":6,"comments":1}},"code":0,"comments":94}},{"name":"./README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":13}},{"name":"./docs/DECISIONS.md","stats":{"blanks":2,"blobs":{},"code":0,"comments":21}},{"name":"./docs/misc/inventory/electronics_inventory_enhanced.md","stats":{"blanks":215,"blobs":{},"code":0,"comments":637}},{"name":"./docs/misc/inventory/electronics_inventory_tier2.md","stats":{"blanks":710,"blobs":{},"code":0,"comments":1441}},{"name":"./docs/misc/inventory/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":8}},{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/README.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":16}},{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":20}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":5}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":18}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/README.md","stats":{"blanks":9,"blobs":{},"code":0,"comments":31}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/troubleshooting.md","stats":{"blanks":1,"blobs":{},"code":0,"comments":13}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":23}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/troubleshooting.md","stats":{"blanks":1,"blobs":{},"code":0,"comments":11}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/README.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":16}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":5}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":9}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":22}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":18}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":10}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":21}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":5}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/troubleshooting.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":3}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/README.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":16}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":9}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":20}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":9}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":18}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/README.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":16}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/electronics_inventory_tier5.md","stats":{"blanks":134,"blobs":{},"code":0,"comments":316}},{"name":"./docs/misc/inventory/electronics_inventory_tier3.md","stats":{"blanks":629,"blobs":{"Json":{"blanks":0,"blobs":{},"code":15,"comments":0}},"code":0,"comments":938}},{"name":"./docs/misc/inventory/wiring_ruleset/wiring_ruleset.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":56}},{"name":"./docs/misc/inventory/CHANGELOG.md","stats":{"blanks":4,"blobs":{},"code":0,"comments":12}},{"name":"./docs/misc/inventory/electronics_inventory_tier4.md","stats":{"blanks":139,"blobs":{},"code":0,"comments":267}},{"name":"./docs/misc/hacks-and-secrets.md","stats":{"blanks":16,"blobs":{},"code":0,"comments":26}},{"name":"./docs/UI_CHANGE_REVIEW_TEMPLATE.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":23}},{"name":"./docs/UI_STYLE_GUIDE.md","stats":{"blanks":11,"blobs":{},"code":0,"comments":51}},{"name":"./docs/UI_TOKENS_REFERENCE.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":36}},{"name":"./docs/COMPONENT_INVENTORY_INDEX.md","stats":{"blanks":8,"blobs":{},"code":0,"comments":27}},{"name":"./PROJECT_STATUS_REPORT.md","stats":{"blanks":9,"blobs":{},"code":0,"comments":34}},{"name":"./ref/services.md","stats":{"blanks":40,"blobs":{"TypeScript":{"blanks":1,"blobs":{},"code":14,"comments":3}},"code":0,"comments":108}},{"name":"./ref/components.md","stats":{"blanks":42,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":11,"comments":1}},"code":0,"comments":102}},{"name":"./ref/patterns.md","stats":{"blanks":36,"blobs":{"TypeScript":{"blanks":9,"blobs":{},"code":88,"comments":17}},"code":0,"comments":56}},{"name":"./ref/pitfalls.md","stats":{"blanks":18,"blobs":{"TypeScript":{"blanks":5,"blobs":{},"code":15,"comments":10}},"code":0,"comments":52}},{"name":"./ref/architecture.md","stats":{"blanks":26,"blobs":{},"code":0,"comments":102}},{"name":"./ref/types.md","stats":{"blanks":21,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":111,"comments":4}},"code":0,"comments":50}},{"name":"./docs/misc/inventory/electronics_inventory_tier1.md","stats":{"blanks":483,"blobs":{},"code":0,"comments":649}},{"name":"./ref/visual-analysis-tools.md","stats":{"blanks":62,"blobs":{"Bash":{"blanks":13,"blobs":{},"code":53,"comments":17},"Python":{"blanks":9,"blobs":{},"code":21,"comments":6}},"code":0,"comments":139}},{"name":"./docs/screenshots/MANIFEST.md","stats":{"blanks":31,"blobs":{},"code":0,"comments":112}},{"name":"./docs/screenshots/FULL_SYSTEM_UI_AUDIT_REPORT.md","stats":{"blanks":34,"blobs":{},"code":0,"comments":104}},{"name":"./docs/data/types.md","stats":{"blanks":10,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":25,"comments":0}},"code":0,"comments":14}},{"name":"./docs/UX_PRINCIPLES.md","stats":{"blanks":8,"blobs":{},"code":0,"comments":26}},{"name":"./docs/SCREENSHOT_CAPTURE_PLAYBOOK.md","stats":{"blanks":7,"blobs":{"Bash":{"blanks":0,"blobs":{},"code":5,"comments":1}},"code":0,"comments":26}},{"name":"./docs/research/ai-3d-model-generator.md","stats":{"blanks":21,"blobs":{},"code":0,"comments":110}},{"name":"./docs/research/3d-generation-improvements.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":33}},{"name":"./docs/research/3d-model-generation-strategy.md","stats":{"blanks":22,"blobs":{},"code":0,"comments":76}},{"name":"./docs/LIVE_REVIEW_LOG.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":22}},{"name":"./docs/VISUAL_DRIFT_AUDIT_GUIDE.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":23}},{"name":"./docs/frontend/components.md","stats":{"blanks":22,"blobs":{},"code":0,"comments":43}},{"name":"./docs/frontend/architecture.md","stats":{"blanks":21,"blobs":{},"code":0,"comments":34}},{"name":"./docs/refactor-useAIActions.md","stats":{"blanks":22,"blobs":{"TypeScript":{"blanks":6,"blobs":{},"code":41,"comments":9}},"code":0,"comments":78}},{"name":"./docs/README.md","stats":{"blanks":11,"blobs":{},"code":0,"comments":34}},{"name":"./docs/COMPONENT_CONSISTENCY_CHECKLIST.md","stats":{"blanks":8,"blobs":{},"code":0,"comments":31}},{"name":"./docs/IMPLEMENTATION_NOTES.md","stats":{"blanks":5,"blobs":{},"code":0,"comments":33}},{"name":"./docs/audits/CODE_AUDIT_REPORT.md","stats":{"blanks":22,"blobs":{"Tsx":{"blanks":2,"blobs":{},"code":18,"comments":1}},"code":0,"comments":69}},{"name":"./docs/services/gemini-api.md","stats":{"blanks":11,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":9,"comments":1}},"code":0,"comments":47}},{"name":"./docs/services/audio-video.md","stats":{"blanks":5,"blobs":{},"code":0,"comments":27}},{"name":"./docs/IMPROVEMENTS.md","stats":{"blanks":18,"blobs":{},"code":0,"comments":57}},{"name":"./docs/screenshots/UI_AUDIT_REPORT.md","stats":{"blanks":573,"blobs":{"Css":{"blanks":0,"blobs":{},"code":17,"comments":0}},"code":0,"comments":5647}},{"name":"./docs/frontend/diagram-canvas.md","stats":{"blanks":39,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":15,"comments":8}},"code":0,"comments":148}}]},"Plain Text":{"blanks":0,"children":{},"code":0,"comments":94,"inaccurate":false,"reports":[{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":8}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":5}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":10}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":11}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":1}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":10}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":10}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}}]},"TSX":{"blanks":1168,"children":{},"code":11289,"comments":613,"inaccurate":false,"reports":[{"name":"./hooks/useToast.tsx","stats":{"blanks":30,"blobs":{},"code":154,"comments":27}},{"name":"./components/AssistantSidebar.tsx","stats":{"blanks":17,"blobs":{},"code":192,"comments":0}},{"name":"./components/DiagramCanvas.tsx","stats":{"blanks":147,"blobs":{},"code":1230,"comments":68}},{"name":"./components/diagram/Wire.tsx","stats":{"blanks":25,"blobs":{},"code":165,"comments":18}},{"name":"./components/ThreeViewer.tsx","stats":{"blanks":55,"blobs":{},"code":410,"comments":40}},{"name":"./components/diagram/DiagramNode.tsx","stats":{"blanks":85,"blobs":{},"code":667,"comments":41}},{"name":"./components/diagram/Diagram3DView.tsx","stats":{"blanks":264,"blobs":{},"code":1336,"comments":210}},{"name":"./components/Inventory.tsx","stats":{"blanks":84,"blobs":{},"code":1173,"comments":34}},{"name":"./components/ErrorBoundary.tsx","stats":{"blanks":9,"blobs":{},"code":44,"comments":1}},{"name":"./components/ConversationSwitcher.tsx","stats":{"blanks":21,"blobs":{},"code":258,"comments":13}},{"name":"./components/__tests__/DiagramCanvas.test.tsx","stats":{"blanks":79,"blobs":{},"code":296,"comments":18}},{"name":"./components/__tests__/ThreeViewer.test.tsx","stats":{"blanks":7,"blobs":{},"code":151,"comments":0}},{"name":"./components/SettingsPanel.tsx","stats":{"blanks":36,"blobs":{},"code":868,"comments":24}},{"name":"./components/__tests__/ChatMessage.test.tsx","stats":{"blanks":2,"blobs":{},"code":22,"comments":0}},{"name":"./components/ChatPanel.tsx","stats":{"blanks":51,"blobs":{},"code":719,"comments":28}},{"name":"./components/__tests__/ComponentEditorModal.test.tsx","stats":{"blanks":11,"blobs":{},"code":62,"comments":0}},{"name":"./components/__tests__/SettingsPanel.test.tsx","stats":{"blanks":13,"blobs":{},"code":87,"comments":0}},{"name":"./components/__tests__/Inventory.test.tsx","stats":{"blanks":11,"blobs":{},"code":68,"comments":0}},{"name":"./components/ComponentEditorModal.tsx","stats":{"blanks":60,"blobs":{},"code":1040,"comments":10}},{"name":"./components/__tests__/ChatPanel.test.tsx","stats":{"blanks":12,"blobs":{},"code":69,"comments":0}},{"name":"./index.tsx","stats":{"blanks":9,"blobs":{},"code":61,"comments":1}},{"name":"./components/ChatMessage.tsx","stats":{"blanks":35,"blobs":{},"code":414,"comments":21}},{"name":"./App.tsx","stats":{"blanks":105,"blobs":{},"code":1803,"comments":59}}]},"Total":{"blanks":6459,"children":{"Arduino":[{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/sketch.ino","stats":{"blanks":5,"blobs":{},"code":21,"comments":2}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/sketch.ino","stats":{"blanks":0,"blobs":{},"code":9,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/sketch.ino","stats":{"blanks":4,"blobs":{},"code":20,"comments":2}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/sketch.ino","stats":{"blanks":8,"blobs":{},"code":23,"comments":10}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/sketch.ino","stats":{"blanks":3,"blobs":{},"code":10,"comments":7}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/sketch.ino","stats":{"blanks":3,"blobs":{},"code":15,"comments":2}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/sketch.ino","stats":{"blanks":4,"blobs":{},"code":17,"comments":2}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/sketch.ino","stats":{"blanks":4,"blobs":{},"code":12,"comments":4}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/sketch.ino","stats":{"blanks":3,"blobs":{},"code":11,"comments":3}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/sketch.ino","stats":{"blanks":5,"blobs":{},"code":22,"comments":2}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/sketch.ino","stats":{"blanks":1,"blobs":{},"code":0,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/sketch.ino","stats":{"blanks":3,"blobs":{},"code":13,"comments":4}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/sketch.ino","stats":{"blanks":3,"blobs":{},"code":15,"comments":2}}],"Css":[{"name":"./index.css","stats":{"blanks":60,"blobs":{},"code":354,"comments":31}}],"Html":[{"name":"./index.html","stats":{"blanks":0,"blobs":{"JavaScript":{"blanks":0,"blobs":{},"code":11,"comments":0}},"code":16,"comments":0}}],"JavaScript":[{"name":"./postcss.config.js","stats":{"blanks":0,"blobs":{},"code":5,"comments":0}},{"name":"./tailwind.config.js","stats":{"blanks":0,"blobs":{},"code":49,"comments":1}},{"name":"./eslint.config.js","stats":{"blanks":11,"blobs":{},"code":161,"comments":20}}],"Json":[{"name":"./metadata.json","stats":{"blanks":0,"blobs":{},"code":8,"comments":0}},{"name":"./tmp/audit/tokei.json","stats":{"blanks":0,"blobs":{},"code":0,"comments":0}},{"name":"./tmp/audit/scc-report.json","stats":{"blanks":0,"blobs":{},"code":1,"comments":0}},{"name":"./package.json","stats":{"blanks":0,"blobs":{},"code":55,"comments":0}},{"name":"./assets/standards/ipc_dimensions.json","stats":{"blanks":0,"blobs":{},"code":66,"comments":0}},{"name":"./tsconfig.json","stats":{"blanks":0,"blobs":{},"code":29,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier4.json","stats":{"blanks":0,"blobs":{},"code":6078,"comments":0}},{"name":"./package-lock.json","stats":{"blanks":0,"blobs":{},"code":10200,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier5.json","stats":{"blanks":0,"blobs":{},"code":8115,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier3.json","stats":{"blanks":0,"blobs":{},"code":4767,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/plan.json","stats":{"blanks":0,"blobs":{},"code":57,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/plan.json","stats":{"blanks":0,"blobs":{},"code":0,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/plan.json","stats":{"blanks":0,"blobs":{},"code":69,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier1.json","stats":{"blanks":0,"blobs":{},"code":2697,"comments":0}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/plan.json","stats":{"blanks":0,"blobs":{},"code":31,"comments":0}},{"name":"./docs/misc/inventory/inventory.production.json","stats":{"blanks":0,"blobs":{},"code":10535,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/plan.json","stats":{"blanks":0,"blobs":{},"code":45,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/plan.json","stats":{"blanks":0,"blobs":{},"code":92,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/plan.json","stats":{"blanks":0,"blobs":{},"code":102,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/plan.json","stats":{"blanks":0,"blobs":{},"code":29,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/plan.json","stats":{"blanks":0,"blobs":{},"code":89,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/plan.json","stats":{"blanks":0,"blobs":{},"code":91,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/plan.json","stats":{"blanks":0,"blobs":{},"code":56,"comments":0}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/plan.json","stats":{"blanks":0,"blobs":{},"code":56,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_crossref.json","stats":{"blanks":0,"blobs":{},"code":8666,"comments":0}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/plan.json","stats":{"blanks":0,"blobs":{},"code":22,"comments":0}},{"name":"./docs/misc/inventory/wiring_ruleset/wiring_ruleset.json","stats":{"blanks":0,"blobs":{},"code":1352,"comments":0}},{"name":"./docs/misc/inventory/electronics_inventory_tier2.json","stats":{"blanks":0,"blobs":{},"code":3431,"comments":0}},{"name":"./docs/misc/inventory/inventory.production.min.json","stats":{"blanks":0,"blobs":{},"code":1,"comments":0}},{"name":"./docs/audits/lighthouse/localhost_3000-20260101T084816.json","stats":{"blanks":0,"blobs":{},"code":13935,"comments":0}}],"Markdown":[{"name":"./AGENTS.md","stats":{"blanks":18,"blobs":{},"code":0,"comments":40}},{"name":"./CLAUDE.md","stats":{"blanks":26,"blobs":{"Bash":{"blanks":0,"blobs":{},"code":3,"comments":0},"TypeScript":{"blanks":0,"blobs":{},"code":5,"comments":0}},"code":0,"comments":71}},{"name":"./plans/advanced-ai-workflows.md","stats":{"blanks":25,"blobs":{},"code":0,"comments":77}},{"name":"./plans/improved-ui-components.md","stats":{"blanks":16,"blobs":{},"code":0,"comments":68}},{"name":"./CODEX_DONE.md","stats":{"blanks":352,"blobs":{"Bash":{"blanks":0,"blobs":{},"code":167,"comments":0}},"code":0,"comments":663}},{"name":"./GEMINI.md","stats":{"blanks":21,"blobs":{"Bash":{"blanks":0,"blobs":{},"code":6,"comments":1}},"code":0,"comments":94}},{"name":"./README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":13}},{"name":"./docs/DECISIONS.md","stats":{"blanks":2,"blobs":{},"code":0,"comments":21}},{"name":"./docs/misc/inventory/electronics_inventory_enhanced.md","stats":{"blanks":215,"blobs":{},"code":0,"comments":637}},{"name":"./docs/misc/inventory/electronics_inventory_tier2.md","stats":{"blanks":710,"blobs":{},"code":0,"comments":1441}},{"name":"./docs/misc/inventory/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":8}},{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/README.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":16}},{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":20}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":5}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":18}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/README.md","stats":{"blanks":9,"blobs":{},"code":0,"comments":31}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/troubleshooting.md","stats":{"blanks":1,"blobs":{},"code":0,"comments":13}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":23}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/troubleshooting.md","stats":{"blanks":1,"blobs":{},"code":0,"comments":11}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/README.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":16}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":5}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":9}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":22}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":18}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":10}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":21}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":5}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/troubleshooting.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":3}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/README.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":16}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":9}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":20}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":9}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/README.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":18}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/README.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":16}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/wiring_table.md","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/electronics_inventory_tier5.md","stats":{"blanks":134,"blobs":{},"code":0,"comments":316}},{"name":"./docs/misc/inventory/electronics_inventory_tier3.md","stats":{"blanks":629,"blobs":{"Json":{"blanks":0,"blobs":{},"code":15,"comments":0}},"code":0,"comments":938}},{"name":"./docs/misc/inventory/wiring_ruleset/wiring_ruleset.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":56}},{"name":"./docs/misc/inventory/CHANGELOG.md","stats":{"blanks":4,"blobs":{},"code":0,"comments":12}},{"name":"./docs/misc/inventory/electronics_inventory_tier4.md","stats":{"blanks":139,"blobs":{},"code":0,"comments":267}},{"name":"./docs/misc/hacks-and-secrets.md","stats":{"blanks":16,"blobs":{},"code":0,"comments":26}},{"name":"./docs/UI_CHANGE_REVIEW_TEMPLATE.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":23}},{"name":"./docs/UI_STYLE_GUIDE.md","stats":{"blanks":11,"blobs":{},"code":0,"comments":51}},{"name":"./docs/UI_TOKENS_REFERENCE.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":36}},{"name":"./docs/COMPONENT_INVENTORY_INDEX.md","stats":{"blanks":8,"blobs":{},"code":0,"comments":27}},{"name":"./PROJECT_STATUS_REPORT.md","stats":{"blanks":9,"blobs":{},"code":0,"comments":34}},{"name":"./ref/services.md","stats":{"blanks":40,"blobs":{"TypeScript":{"blanks":1,"blobs":{},"code":14,"comments":3}},"code":0,"comments":108}},{"name":"./ref/components.md","stats":{"blanks":42,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":11,"comments":1}},"code":0,"comments":102}},{"name":"./ref/patterns.md","stats":{"blanks":36,"blobs":{"TypeScript":{"blanks":9,"blobs":{},"code":88,"comments":17}},"code":0,"comments":56}},{"name":"./ref/pitfalls.md","stats":{"blanks":18,"blobs":{"TypeScript":{"blanks":5,"blobs":{},"code":15,"comments":10}},"code":0,"comments":52}},{"name":"./ref/architecture.md","stats":{"blanks":26,"blobs":{},"code":0,"comments":102}},{"name":"./ref/types.md","stats":{"blanks":21,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":111,"comments":4}},"code":0,"comments":50}},{"name":"./docs/misc/inventory/electronics_inventory_tier1.md","stats":{"blanks":483,"blobs":{},"code":0,"comments":649}},{"name":"./ref/visual-analysis-tools.md","stats":{"blanks":62,"blobs":{"Bash":{"blanks":13,"blobs":{},"code":53,"comments":17},"Python":{"blanks":9,"blobs":{},"code":21,"comments":6}},"code":0,"comments":139}},{"name":"./docs/screenshots/MANIFEST.md","stats":{"blanks":31,"blobs":{},"code":0,"comments":112}},{"name":"./docs/screenshots/FULL_SYSTEM_UI_AUDIT_REPORT.md","stats":{"blanks":34,"blobs":{},"code":0,"comments":104}},{"name":"./docs/data/types.md","stats":{"blanks":10,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":25,"comments":0}},"code":0,"comments":14}},{"name":"./docs/UX_PRINCIPLES.md","stats":{"blanks":8,"blobs":{},"code":0,"comments":26}},{"name":"./docs/SCREENSHOT_CAPTURE_PLAYBOOK.md","stats":{"blanks":7,"blobs":{"Bash":{"blanks":0,"blobs":{},"code":5,"comments":1}},"code":0,"comments":26}},{"name":"./docs/research/ai-3d-model-generator.md","stats":{"blanks":21,"blobs":{},"code":0,"comments":110}},{"name":"./docs/research/3d-generation-improvements.md","stats":{"blanks":7,"blobs":{},"code":0,"comments":33}},{"name":"./docs/research/3d-model-generation-strategy.md","stats":{"blanks":22,"blobs":{},"code":0,"comments":76}},{"name":"./docs/LIVE_REVIEW_LOG.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":22}},{"name":"./docs/VISUAL_DRIFT_AUDIT_GUIDE.md","stats":{"blanks":6,"blobs":{},"code":0,"comments":23}},{"name":"./docs/frontend/components.md","stats":{"blanks":22,"blobs":{},"code":0,"comments":43}},{"name":"./docs/frontend/architecture.md","stats":{"blanks":21,"blobs":{},"code":0,"comments":34}},{"name":"./docs/refactor-useAIActions.md","stats":{"blanks":22,"blobs":{"TypeScript":{"blanks":6,"blobs":{},"code":41,"comments":9}},"code":0,"comments":78}},{"name":"./docs/README.md","stats":{"blanks":11,"blobs":{},"code":0,"comments":34}},{"name":"./docs/COMPONENT_CONSISTENCY_CHECKLIST.md","stats":{"blanks":8,"blobs":{},"code":0,"comments":31}},{"name":"./docs/IMPLEMENTATION_NOTES.md","stats":{"blanks":5,"blobs":{},"code":0,"comments":33}},{"name":"./docs/audits/CODE_AUDIT_REPORT.md","stats":{"blanks":22,"blobs":{"Tsx":{"blanks":2,"blobs":{},"code":18,"comments":1}},"code":0,"comments":69}},{"name":"./docs/services/gemini-api.md","stats":{"blanks":11,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":9,"comments":1}},"code":0,"comments":47}},{"name":"./docs/services/audio-video.md","stats":{"blanks":5,"blobs":{},"code":0,"comments":27}},{"name":"./docs/IMPROVEMENTS.md","stats":{"blanks":18,"blobs":{},"code":0,"comments":57}},{"name":"./docs/screenshots/UI_AUDIT_REPORT.md","stats":{"blanks":573,"blobs":{"Css":{"blanks":0,"blobs":{},"code":17,"comments":0}},"code":0,"comments":5647}},{"name":"./docs/frontend/diagram-canvas.md","stats":{"blanks":39,"blobs":{"TypeScript":{"blanks":0,"blobs":{},"code":15,"comments":8}},"code":0,"comments":148}}],"Text":[{"name":"./docs/misc/inventory/examples_library/circuit_006_mpu6050_motion/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}},{"name":"./docs/misc/inventory/examples_library/circuit_001_blink/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/circuit_003_temp_humidity/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":8}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/dht11_temperature_humidity_example/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/examples_crossref/arduino_blink_led_example/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":5}},{"name":"./docs/misc/inventory/examples_library/circuit_004_servo_control/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":6}},{"name":"./docs/misc/inventory/examples_library/circuit_008_ws2812b_strip/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":10}},{"name":"./docs/misc/inventory/examples_library/circuit_010_stepper_motor/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":11}},{"name":"./docs/misc/inventory/examples_library/circuit_011_relay_control/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":1}},{"name":"./docs/misc/inventory/examples_library/circuit_009_rfid_reader/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":10}},{"name":"./docs/misc/inventory/examples_library/circuit_007_esp32_ultrasonic/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":10}},{"name":"./docs/misc/inventory/examples_library/circuit_005_i2c_lcd/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}},{"name":"./docs/misc/inventory/examples_library/circuit_002_ultrasonic_distance/diagram_prompt.txt","stats":{"blanks":0,"blobs":{},"code":0,"comments":7}}],"Tsx":[{"name":"./hooks/useToast.tsx","stats":{"blanks":30,"blobs":{},"code":154,"comments":27}},{"name":"./components/AssistantSidebar.tsx","stats":{"blanks":17,"blobs":{},"code":192,"comments":0}},{"name":"./components/DiagramCanvas.tsx","stats":{"blanks":147,"blobs":{},"code":1230,"comments":68}},{"name":"./components/diagram/Wire.tsx","stats":{"blanks":25,"blobs":{},"code":165,"comments":18}},{"name":"./components/ThreeViewer.tsx","stats":{"blanks":55,"blobs":{},"code":410,"comments":40}},{"name":"./components/diagram/DiagramNode.tsx","stats":{"blanks":85,"blobs":{},"code":667,"comments":41}},{"name":"./components/diagram/Diagram3DView.tsx","stats":{"blanks":264,"blobs":{},"code":1336,"comments":210}},{"name":"./components/Inventory.tsx","stats":{"blanks":84,"blobs":{},"code":1173,"comments":34}},{"name":"./components/ErrorBoundary.tsx","stats":{"blanks":9,"blobs":{},"code":44,"comments":1}},{"name":"./components/ConversationSwitcher.tsx","stats":{"blanks":21,"blobs":{},"code":258,"comments":13}},{"name":"./components/__tests__/DiagramCanvas.test.tsx","stats":{"blanks":79,"blobs":{},"code":296,"comments":18}},{"name":"./components/__tests__/ThreeViewer.test.tsx","stats":{"blanks":7,"blobs":{},"code":151,"comments":0}},{"name":"./components/SettingsPanel.tsx","stats":{"blanks":36,"blobs":{},"code":868,"comments":24}},{"name":"./components/__tests__/ChatMessage.test.tsx","stats":{"blanks":2,"blobs":{},"code":22,"comments":0}},{"name":"./components/ChatPanel.tsx","stats":{"blanks":51,"blobs":{},"code":719,"comments":28}},{"name":"./components/__tests__/ComponentEditorModal.test.tsx","stats":{"blanks":11,"blobs":{},"code":62,"comments":0}},{"name":"./components/__tests__/SettingsPanel.test.tsx","stats":{"blanks":13,"blobs":{},"code":87,"comments":0}},{"name":"./components/__tests__/Inventory.test.tsx","stats":{"blanks":11,"blobs":{},"code":68,"comments":0}},{"name":"./components/ComponentEditorModal.tsx","stats":{"blanks":60,"blobs":{},"code":1040,"comments":10}},{"name":"./components/__tests__/ChatPanel.test.tsx","stats":{"blanks":12,"blobs":{},"code":69,"comments":0}},{"name":"./index.tsx","stats":{"blanks":9,"blobs":{},"code":61,"comments":1}},{"name":"./components/ChatMessage.tsx","stats":{"blanks":35,"blobs":{},"code":414,"comments":21}},{"name":"./App.tsx","stats":{"blanks":105,"blobs":{},"code":1803,"comments":59}}],"TypeScript":[{"name":"./hooks/useInventorySync.ts","stats":{"blanks":37,"blobs":{},"code":152,"comments":49}},{"name":"./hooks/actions/canvasHandlers.ts","stats":{"blanks":11,"blobs":{},"code":69,"comments":0}},{"name":"./hooks/actions/index.ts","stats":{"blanks":6,"blobs":{},"code":35,"comments":10}},{"name":"./hooks/actions/navHandlers.ts","stats":{"blanks":8,"blobs":{},"code":53,"comments":0}},{"name":"./hooks/actions/types.ts","stats":{"blanks":3,"blobs":{},"code":27,"comments":10}},{"name":"./hooks/actions/appControlHandlers.ts","stats":{"blanks":10,"blobs":{},"code":46,"comments":17}},{"name":"./hooks/useAutonomySettings.ts","stats":{"blanks":8,"blobs":{},"code":41,"comments":2}},{"name":"./hooks/useActionHistory.ts","stats":{"blanks":8,"blobs":{},"code":36,"comments":0}},{"name":"./hooks/useConversations.ts","stats":{"blanks":44,"blobs":{},"code":274,"comments":28}},{"name":"./hooks/__tests__/useConversations.test.ts","stats":{"blanks":9,"blobs":{},"code":58,"comments":0}},{"name":"./types.ts","stats":{"blanks":33,"blobs":{},"code":186,"comments":30}},{"name":"./tests/setup.ts","stats":{"blanks":1,"blobs":{},"code":6,"comments":0}},{"name":"./hooks/useAIActions.ts","stats":{"blanks":22,"blobs":{},"code":137,"comments":7}},{"name":"./hooks/actions/diagramHandlers.ts","stats":{"blanks":27,"blobs":{},"code":143,"comments":1}},{"name":"./playwright.config.ts","stats":{"blanks":7,"blobs":{},"code":39,"comments":2}},{"name":"./scripts/capture-all.ts","stats":{"blanks":110,"blobs":{},"code":397,"comments":118}},{"name":"./components/diagram/index.ts","stats":{"blanks":4,"blobs":{},"code":24,"comments":1}},{"name":"./scripts/capture-debug.ts","stats":{"blanks":36,"blobs":{},"code":99,"comments":21}},{"name":"./components/diagram/componentShapes.ts","stats":{"blanks":52,"blobs":{},"code":552,"comments":93}},{"name":"./scripts/capture-screenshots.ts","stats":{"blanks":87,"blobs":{},"code":465,"comments":69}},{"name":"./services/storage.ts","stats":{"blanks":31,"blobs":{},"code":198,"comments":24}},{"name":"./services/standardsService.ts","stats":{"blanks":8,"blobs":{},"code":60,"comments":3}},{"name":"./services/componentValidator.ts","stats":{"blanks":57,"blobs":{},"code":296,"comments":80}},{"name":"./services/userProfileService.ts","stats":{"blanks":11,"blobs":{},"code":78,"comments":5}},{"name":"./services/liveAudio.ts","stats":{"blanks":38,"blobs":{},"code":236,"comments":25}},{"name":"./services/ragService.ts","stats":{"blanks":18,"blobs":{},"code":76,"comments":9}},{"name":"./services/datasetService.ts","stats":{"blanks":16,"blobs":{},"code":59,"comments":10}},{"name":"./services/aiMetricsService.ts","stats":{"blanks":17,"blobs":{},"code":76,"comments":2}},{"name":"./services/circuitAnalysisService.ts","stats":{"blanks":14,"blobs":{},"code":86,"comments":11}},{"name":"./services/responseParser.ts","stats":{"blanks":15,"blobs":{},"code":238,"comments":27}},{"name":"./services/knowledgeService.ts","stats":{"blanks":4,"blobs":{},"code":71,"comments":1}},{"name":"./services/threePrimitives.ts","stats":{"blanks":55,"blobs":{},"code":283,"comments":68}},{"name":"./services/aiContextBuilder.ts","stats":{"blanks":42,"blobs":{},"code":170,"comments":51}},{"name":"./services/__tests__/geminiService.test.ts","stats":{"blanks":4,"blobs":{},"code":20,"comments":0}},{"name":"./services/__tests__/aiMetricsService.test.ts","stats":{"blanks":10,"blobs":{},"code":55,"comments":0}},{"name":"./services/apiKeyStorage.ts","stats":{"blanks":3,"blobs":{},"code":23,"comments":5}},{"name":"./services/__tests__/componentValidator.test.ts","stats":{"blanks":79,"blobs":{},"code":271,"comments":29}},{"name":"./services/geminiService.ts","stats":{"blanks":116,"blobs":{},"code":1078,"comments":79}},{"name":"./docs/misc/inventory/wiring_ruleset/wiring-validator.ts","stats":{"blanks":15,"blobs":{},"code":100,"comments":28}},{"name":"./vite.config.ts","stats":{"blanks":1,"blobs":{},"code":40,"comments":0}}]},"code":89090,"comments":15057,"inaccurate":false,"reports":[]},"TypeScript":{"blanks":1077,"children":{},"code":6353,"comments":915,"inaccurate":false,"reports":[{"name":"./hooks/useInventorySync.ts","stats":{"blanks":37,"blobs":{},"code":152,"comments":49}},{"name":"./hooks/actions/canvasHandlers.ts","stats":{"blanks":11,"blobs":{},"code":69,"comments":0}},{"name":"./hooks/actions/index.ts","stats":{"blanks":6,"blobs":{},"code":35,"comments":10}},{"name":"./hooks/actions/navHandlers.ts","stats":{"blanks":8,"blobs":{},"code":53,"comments":0}},{"name":"./hooks/actions/types.ts","stats":{"blanks":3,"blobs":{},"code":27,"comments":10}},{"name":"./hooks/actions/appControlHandlers.ts","stats":{"blanks":10,"blobs":{},"code":46,"comments":17}},{"name":"./hooks/useAutonomySettings.ts","stats":{"blanks":8,"blobs":{},"code":41,"comments":2}},{"name":"./hooks/useActionHistory.ts","stats":{"blanks":8,"blobs":{},"code":36,"comments":0}},{"name":"./hooks/useConversations.ts","stats":{"blanks":44,"blobs":{},"code":274,"comments":28}},{"name":"./hooks/__tests__/useConversations.test.ts","stats":{"blanks":9,"blobs":{},"code":58,"comments":0}},{"name":"./types.ts","stats":{"blanks":33,"blobs":{},"code":186,"comments":30}},{"name":"./tests/setup.ts","stats":{"blanks":1,"blobs":{},"code":6,"comments":0}},{"name":"./hooks/useAIActions.ts","stats":{"blanks":22,"blobs":{},"code":137,"comments":7}},{"name":"./hooks/actions/diagramHandlers.ts","stats":{"blanks":27,"blobs":{},"code":143,"comments":1}},{"name":"./playwright.config.ts","stats":{"blanks":7,"blobs":{},"code":39,"comments":2}},{"name":"./scripts/capture-all.ts","stats":{"blanks":110,"blobs":{},"code":397,"comments":118}},{"name":"./components/diagram/index.ts","stats":{"blanks":4,"blobs":{},"code":24,"comments":1}},{"name":"./scripts/capture-debug.ts","stats":{"blanks":36,"blobs":{},"code":99,"comments":21}},{"name":"./components/diagram/componentShapes.ts","stats":{"blanks":52,"blobs":{},"code":552,"comments":93}},{"name":"./scripts/capture-screenshots.ts","stats":{"blanks":87,"blobs":{},"code":465,"comments":69}},{"name":"./services/storage.ts","stats":{"blanks":31,"blobs":{},"code":198,"comments":24}},{"name":"./services/standardsService.ts","stats":{"blanks":8,"blobs":{},"code":60,"comments":3}},{"name":"./services/componentValidator.ts","stats":{"blanks":57,"blobs":{},"code":296,"comments":80}},{"name":"./services/userProfileService.ts","stats":{"blanks":11,"blobs":{},"code":78,"comments":5}},{"name":"./services/liveAudio.ts","stats":{"blanks":38,"blobs":{},"code":236,"comments":25}},{"name":"./services/ragService.ts","stats":{"blanks":18,"blobs":{},"code":76,"comments":9}},{"name":"./services/datasetService.ts","stats":{"blanks":16,"blobs":{},"code":59,"comments":10}},{"name":"./services/aiMetricsService.ts","stats":{"blanks":17,"blobs":{},"code":76,"comments":2}},{"name":"./services/circuitAnalysisService.ts","stats":{"blanks":14,"blobs":{},"code":86,"comments":11}},{"name":"./services/responseParser.ts","stats":{"blanks":15,"blobs":{},"code":238,"comments":27}},{"name":"./services/knowledgeService.ts","stats":{"blanks":4,"blobs":{},"code":71,"comments":1}},{"name":"./services/threePrimitives.ts","stats":{"blanks":55,"blobs":{},"code":283,"comments":68}},{"name":"./services/aiContextBuilder.ts","stats":{"blanks":42,"blobs":{},"code":170,"comments":51}},{"name":"./services/__tests__/geminiService.test.ts","stats":{"blanks":4,"blobs":{},"code":20,"comments":0}},{"name":"./services/__tests__/aiMetricsService.test.ts","stats":{"blanks":10,"blobs":{},"code":55,"comments":0}},{"name":"./services/apiKeyStorage.ts","stats":{"blanks":3,"blobs":{},"code":23,"comments":5}},{"name":"./services/__tests__/componentValidator.test.ts","stats":{"blanks":79,"blobs":{},"code":271,"comments":29}},{"name":"./services/geminiService.ts","stats":{"blanks":116,"blobs":{},"code":1078,"comments":79}},{"name":"./docs/misc/inventory/wiring_ruleset/wiring-validator.ts","stats":{"blanks":15,"blobs":{},"code":100,"comments":28}},{"name":"./vite.config.ts","stats":{"blanks":1,"blobs":{},"code":40,"comments":0}}]}}