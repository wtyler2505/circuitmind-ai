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
