# FZPZ Studio — Design Review & Gap Analysis

**Reviewer:** Claude (requested by Tyler)  
**Document Version Under Review:** v1.2  
**Date:** February 9, 2026  
**Methodology:** Multi-dimensional analysis using backward reasoning, constraint analysis, systems thinking, and first-principles evaluation across 7 domains.

---

## Review Summary

The architecture document is **significantly above average** for a solo project design spec. The data model is well-conceived, the Fritzing-specific knowledge (copper layer nesting, connector ID conventions, font issues) shows real domain expertise, and the phased roadmap is pragmatic. That said, there are **~71 findings** across 7 categories, ranging from critical blockers to nice-to-have polish. The most impactful gaps are in the data model type safety, the missing import capability, SVG rendering performance strategy, and the untapped depth of Gemini integration.

**Verdict:** This doc gets you to 75% of a shippable MVP. The remaining 25% is what this review addresses.

---

## 1. Critical Data Model Issues

These will cause bugs or architectural rewrites if not addressed before Phase 1 code is written.

### 1.1 Shape Type Needs Discriminated Unions

The current `Shape` interface uses optional fields (`w?`, `h?`, `r?`, `d?`) for all shape types. TypeScript can't enforce that a `"rect"` actually has `w` and `h`, or that a `"circle"` has `r`. This **will** lead to runtime errors.

**Fix:** Use a discriminated union pattern:

```typescript
interface BaseShape {
  id: string;
  x: number;
  y: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  rotation?: number;
  locked?: boolean;
  visible?: boolean;     // NEW: hide without delete
  name?: string;         // NEW: label for layer panel
  zIndex?: number;       // NEW: explicit render order
}

interface RectShape extends BaseShape {
  type: "rect";
  w: number;
  h: number;
  rx?: number;           // NEW: rounded corners
  ry?: number;           // NEW: rounded corners
}

interface CircleShape extends BaseShape {
  type: "circle";
  r: number;
}

interface PathShape extends BaseShape {
  type: "path";
  d: string;
}

interface TextShape extends BaseShape {
  type: "text";
  content: string;       // NEW: the actual text
  fontSize: number;      // NEW: required for text
  fontFamily?: string;   // NEW: defaults to "OCRA"
  textAnchor?: "start" | "middle" | "end"; // NEW
}

interface GroupShape extends BaseShape {
  type: "group";
  children: Shape[];     // NEW: groups contain children
}

type Shape = RectShape | CircleShape | PathShape | TextShape | GroupShape;
```

**Why this matters:** Without this, every component that handles shapes needs `if (shape.type === "rect" && shape.w !== undefined)` guards everywhere instead of TypeScript doing the work.

### 1.2 Connector-to-Shape Linkage is Missing

The `Connector` type has position points per view but **no reference to which Shape(s) visually represent it**. When a user clicks a gold pin circle on the breadboard, how does the app know which Connector it belongs to?

**Fix:** Add shape references to Connector:

```typescript
interface Connector {
  // ...existing fields...
  
  // Links to visual representations in each view
  shapeIds: {
    breadboard?: string;   // Shape ID of the visual pin element
    schematic?: string;
    pcb?: string;
  };
}
```

### 1.3 PCB Pad Data is Missing from Connector

The Connector type has no PCB-specific properties. Without these, the exporter can't generate valid copper pads.

**Fix:** Add pad specification:

```typescript
interface PadSpec {
  padShape: "round" | "square" | "oblong" | "custom";
  padWidth: number;       // Outer copper dimension
  padHeight: number;      // Outer copper dimension (same as width for round)
  holeDiameter?: number;  // For THT only. Absence = SMD pad
  thermalRelief?: boolean;
}

interface Connector {
  // ...existing fields...
  padSpec: PadSpec;       // Required for PCB export
}
```

### 1.4 Icon View is Declared but Unspecified

`ViewType` includes `"icon"` but `PartState.views` only has `breadboard`, `schematic`, and `pcb`. The icon view (used for the Fritzing parts bin thumbnail) has zero specification.

**Fix:** Either add `icon: Shape[]` to views (manual icon creation), or specify auto-generation logic: "Scale breadboard view to fit a 32×32 unit bounding box, simplify paths, export as 4th SVG." The auto-generation approach is recommended for MVP.

### 1.5 Missing ViewBox Specification

Each exported SVG needs a `viewBox` attribute calculated from the bounding box of all elements in that view. The document doesn't specify where this is stored or how it's calculated.

**Fix:** Add to PartState:

```typescript
views: {
  breadboard: { shapes: Shape[]; viewBox?: BoundingBox };
  schematic:  { shapes: Shape[]; viewBox?: BoundingBox };
  pcb:        { shapes: Shape[]; viewBox?: BoundingBox };
};

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

At export time, auto-calculate from shape bounds if not manually set.

### 1.6 Connector ID Deletion Problem

The doc says IDs auto-increment (`connector0`, `connector1`, `connector2`...) but doesn't address deletion. If the user deletes `connector1`, the remaining IDs are `connector0` and `connector2`. Fritzing handles sparse IDs, but some older versions and third-party tools expect sequential numbering.

**Recommendation:** Keep IDs sparse internally (never re-index on delete — that would break bus references). At **export time**, re-map to sequential IDs. Maintain an internal `stableId` (UUID) for references and a computed `exportId` for the final file.

### 1.7 Bus Dangling Reference

`Bus.nodeMembers` references connector IDs, but there's no validation that those IDs still exist after a connector is deleted.

**Fix:** Implement a `cascadeDelete` pattern: deleting a connector also removes it from all buses. Add a Zustand middleware or subscription that enforces referential integrity on every state mutation that touches connectors.

### 1.8 Properties/Specs are Insufficient for FZP Export

The `.fzp` XML `<properties>` section supports **arbitrary key-value pairs** that appear in Fritzing's Inspector panel. The current `specs` object is rigid and incomplete.

**Fix:** Replace or supplement `specs` with:

```typescript
properties: Record<string, {
  value: string;
  showInLabel?: boolean;  // Show on part label in Fritzing
}>;
// Example: { "resistance": { value: "10k", showInLabel: true }, 
//            "tolerance": { value: "5%", showInLabel: false } }
```

---

## 2. Architectural Gaps

### 2.1 No Import Capability (CRITICAL)

The document only covers **export**. There is no specification for importing existing `.fzpz` files. This is arguably the single biggest feature gap — the majority of use cases involve *editing* an existing part, not creating from scratch.

**Required:** A parser that reverses the export process:
1. Unzip `.fzpz` with `jszip`
2. Parse `.fzp` XML with `xml-js` (or `fast-xml-parser`) → populate `meta`, `connectors`, `buses`, `properties`
3. Parse each SVG → reconstruct `Shape[]` for each view
4. Reconstruct connector-to-shape mappings by matching SVG element IDs to connector IDs

**Complexity:** SVG-to-Shape reconstruction is the hard part. Third-party SVGs may use transforms, groups, and path data that don't map cleanly to primitive shapes. Consider importing paths as opaque `PathShape` objects and letting users decompose them manually.

### 2.2 No Web Worker Architecture

SVG serialization, zip packaging, XML generation, and AI API calls should **not** block the main thread. The document doesn't mention Web Workers at all.

**Fix:** Implement a worker pool:
- **Export Worker:** Handles SVG serialization + zip packaging
- **AI Worker:** Handles Gemini API calls + response parsing
- **Validation Worker:** Runs DRC checks in background

Use `comlink` library for ergonomic worker communication.

### 2.3 No Error Recovery Strategy

"Smart Save to LocalStorage" is mentioned but underspecified. What happens when:
- State is corrupted mid-mutation?
- LocalStorage quota is exceeded?
- Browser crashes during export?

**Fix:**
- Use `IndexedDB` via `idb-keyval` instead of LocalStorage (larger quota, better for structured data)
- Save versioned snapshots (keep last 5 states, not just current)
- Implement a `recoverFromCorruption()` function that attempts to load the most recent valid snapshot
- Add an "Export Recovery Data" option that dumps raw JSON state for manual inspection

### 2.4 No Testing Strategy

Zero mention of tests. For a tool that generates XML and SVG that must be byte-perfect for Fritzing compatibility, this is a critical gap.

**Minimum viable test strategy:**
- **Unit tests:** Connector ID generation, coordinate conversion math, bus validation logic
- **Snapshot tests:** Export a known DIP-8 part → compare output XML/SVG against golden files
- **Integration tests:** Generate part → load in Fritzing headless validation (if available)
- **Visual regression:** Screenshot canvas → compare against baseline (Playwright)
- Use `vitest` (pairs with Vite).

### 2.5 Canvas Performance Strategy

A QFP-208 package generates ~600+ SVG elements per view. No mention of performance optimization.

**Options to evaluate:**
1. **SVG with viewport culling:** Only render elements within the visible viewport. Use `IntersectionObserver` or manual bounds checking.
2. **Canvas 2D rendering with `react-konva`:** Render to Canvas for editing, generate SVG only at export. Better performance but loses native SVG interactivity.
3. **Hybrid:** Use SVG for small parts (<100 elements), auto-switch to Canvas for large parts.

**Recommendation:** Start with SVG + culling (simpler, adequate for 90% of parts). Add Canvas fallback later if performance is an issue.

### 2.6 Missing Clipboard Operations

No specification for Copy, Paste, Cut, or Duplicate operations. These are table-stakes for any editor.

**Spec needed:**
- Copy/Paste within a view (shapes + connectors)
- Copy between views (with coordinate mapping)
- System clipboard integration (paste SVG from external tools)
- Duplicate with offset (Ctrl+D → creates copy at +10, +10 offset)

### 2.7 No Alignment / Distribution Tools

Missing: Align Left, Align Right, Center Horizontal, Center Vertical, Distribute Evenly. Essential for clean schematics and symmetric layouts.

### 2.8 No Measurement Tool

Click two points → display distance in current units. Essential for verifying dimensions match datasheets.

---

## 3. Fritzing-Specific Technical Pitfalls

The document catches several pitfalls (copper layers, font issues, terminal points) but misses these:

### 3.1 SVG Namespace Declarations

Fritzing SVGs **must** include proper namespace declarations:

```xml
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:fritzing="http://fritzing.org/ns/0.1"
     version="1.2">
```

Missing the `fritzing` namespace will cause silent failures in some Fritzing versions. The document doesn't mention namespace handling.

### 3.2 SVG "Safe Subset"

Fritzing's SVG parser is limited. The exporter must restrict output to a safe subset:
- **No CSS `style` attributes** — must use presentation attributes (`fill="red"` not `style="fill:red"`)
- **No `clip-path` or `mask`** — silently ignored
- **No CSS transforms** — must use SVG `transform` attribute
- **No `<use>` or `<defs>` references** in some contexts
- **No `data-*` attributes** — will be preserved but ignored

The document should include a "Fritzing SVG Compatibility Matrix" as a reference.

### 3.3 Fritzing Version Targeting

Different Fritzing versions have slightly different XML schemas. The document should explicitly target **Fritzing 0.9.3b** (the most widely used version) and note compatibility considerations for 1.0+.

### 3.4 Subpart Support

Some Fritzing parts have subparts (dual op-amp with IC-A and IC-B sections). The data model has no concept of subparts. This is an **acceptable limitation for MVP** but should be documented as a known gap.

### 3.5 Text-to-Path Conversion

The document correctly identifies the need but doesn't specify the implementation. Use `opentype.js` for client-side font-to-path conversion. **Critical detail:** Convert at export time only, not in the editor canvas (path-converted text is not editable).

Add `opentype.js` to the tech stack.

---

## 4. Gemini API Integration — Complete Catalog

The document's Section 4.3 only scratches the surface. Here is a comprehensive integration map organized by priority tier.

### Tier 1: Core Workflows (Build These First)

| # | Feature | Trigger | Input | Output |
|---|---------|---------|-------|--------|
| 1 | **Datasheet Pin Extraction** | User pastes text or uploads PDF | Text/PDF content | `Connector[]` JSON |
| 2 | **Footprint from Package Drawing** | User uploads dimension drawing image | Image (Gemini Vision) | `PadSpec[]` + body dimensions |
| 3 | **Auto-Complete Metadata** | User enters part number (e.g., "NE555") | Part number string | `meta` object: description, family, tags, variant |
| 4 | **Natural Language Part Creation** | User types free-form description | "4-pin male header, 2.54mm pitch" | Complete `PartState` scaffold |

### Tier 2: Smart Editor Assistance (Build After MVP)

| # | Feature | Trigger | Input | Output |
|---|---------|---------|-------|--------|
| 5 | **Smart Pin Naming** | User places N pins without names | Pin count + part family | Suggested `name` for each connector |
| 6 | **Schematic Layout Suggestion** | User has named pins but no schematic | `Connector[]` with names/types | Suggested pin placement (power top/bottom, I/O left/right per IEEE) |
| 7 | **Pin Assignment Error Detection** | User finishes pin naming | Pin names + part family | Warning list: "VCC is typically pin 8, not pin 4" |
| 8 | **SVG Export Validation** | After export generation | Generated SVG strings | Compatibility issues list |
| 9 | **Breadboard Appearance Suggestion** | User has schematic but no breadboard | Package type + pin count | Color, body proportions, label placement suggestions |

### Tier 3: Advanced / Experimental

| # | Feature | Trigger | Input | Output |
|---|---------|---------|-------|--------|
| 10 | **Photo-to-Part Pipeline** | User uploads photo of physical component | Camera image (Gemini Vision) | Package ID, estimated dimensions, starter geometry |
| 11 | **Batch Variant Generation** | User requests multiple package variants | Base part + variant list | Multiple `PartState` objects |
| 12 | **Contextual Help System** | User hovers over UI element or asks "why" | UI context + question | Explanation of Fritzing convention |
| 13 | **Community Part Search** | User starts new part | Part name/description | Links to similar existing parts (if index available) |

### Integration Architecture Requirements

**Service Layer:** All Gemini calls should route through a dedicated `AiService` class, not be scattered across components.

```typescript
class AiService {
  private queue: RequestQueue;
  private cache: Map<string, CachedResponse>;
  
  async extractPins(text: string): Promise<Connector[]>;
  async generateMetadata(partNumber: string): Promise<Partial<PartMeta>>;
  async suggestPinNames(count: number, family: string): Promise<string[]>;
  async validateSvg(svg: string): Promise<ValidationIssue[]>;
  async createFromDescription(description: string): Promise<Partial<PartState>>;
}
```

**Critical Design Principles:**
1. **AI is enhancement, not dependency.** Every feature must work manually if Gemini is unavailable.
2. **Structured output mode.** Use Gemini's JSON schema enforcement (structured outputs) for reliable parsing — no regex on natural language.
3. **Human-in-the-loop.** AI suggestions always go through a review/approve UI before modifying state. Never auto-apply.
4. **Response caching.** Same part number → cached result. Use IndexedDB for persistence.
5. **Rate limiting.** Queue system prevents API throttling.
6. **Context injection.** When sending prompts, serialize only the relevant slice of PartState (pin list, not entire geometry) to minimize token usage.
7. **Diff-based updates.** AI returns JSON patches (`Partial<PartState>`), not full state replacements.

### Gemini Vision Opportunities

The Vision API opens up particularly powerful workflows:

- **Dimension Drawing Reader:** Photograph a datasheet's mechanical drawing → extract package dimensions, pad positions, and pitch. This alone would save hours per part.
- **Existing Part Photographing:** Users can photograph a physical component and get a starting point for the breadboard view (body color, label text, pin arrangement).
- **PCB Footprint from Photo:** Photograph the bottom of a component → estimate pad layout.

These Vision features should be marketed as the flagship AI capability — they solve the most painful part of Fritzing part creation.

---

## 5. UX & Workflow Improvements

### 5.1 Command Palette (High Priority)

Add a `Ctrl+K` / `Cmd+K` command palette (like VS Code). This is transformative for keyboard-first workflows:
- Type "export" → Export .fzpz
- Type "dip" → Open DIP Generator
- Type "pin" → Switch to Pin Tool
- Type "zoom fit" → Fit canvas to content

For ADHD workflows where you think faster than you can navigate nested menus, this is the single highest-impact UX addition.

### 5.2 Part Completeness Progress Indicator

A persistent widget showing completion status across all views:

```
┌────────────────────────────────────┐
│ ■ Metadata     ✓ Complete          │
│ ■ Breadboard   ✓ 8/8 pins placed  │
│ ■ Schematic    ⚠ 3 ghost pins     │
│ ■ PCB          ✗ Not started       │
│ ■ Connectors   ✓ All named         │
│ ━━━━━━━━━━━━━━━━━ 65%             │
└────────────────────────────────────┘
```

Provides dopamine hits on completion and eliminates "did I forget something?" anxiety at export time.

### 5.3 Status Bar

Bottom of screen: `X: 45.2mm | Y: 12.7mm | Zoom: 150% | Snap: 0.1" | Tool: Pin | Selection: 3 objects`

Standard in every professional editor. Zero reason to omit it.

### 5.4 Focus Mode

A toggle that hides all panels except the canvas and a minimal floating toolbar. Reduces visual noise for deep work sessions.

### 5.5 Keyboard Shortcuts System

The doc mentions a few single-letter shortcuts but needs:
- A shortcut registry (prevents conflicts)
- `?` key opens shortcut cheat sheet overlay
- Customizable bindings (stored in preferences)
- Multi-key combos for advanced operations

### 5.6 Onboarding Tutorial

First-run interactive walkthrough: "Let's build a 4-pin header together." Walks through placing shapes → adding pins → naming pins → switching views → exporting. Target completion time: 3 minutes. This is critical because the target audience (hobbyists frustrated with Fritzing) may not be experienced with vector editors.

### 5.7 Undo/Redo History Panel

Instead of just Ctrl+Z blindly, show a visual history:
```
> [Current] Moved Pin 3 to (45, 20)
  Renamed Pin 2 → "GND"
  Added Pin 2
  Added Rectangle (body)
  ── Session Start ──
```

Click any entry to jump to that state. The Zundo middleware already stores the stack — this just visualizes it.

### 5.8 Theme Options

The doc specifies one dark theme. Add at minimum:
- **Default Dark** (current spec)
- **High Contrast** (accessibility)
- **OLED Black** (true black backgrounds for OLED displays)
- **Light Mode** (some users need it; don't assume dark-only)

---

## 6. Tech Stack Recommendations

### 6.1 Add These Libraries

| Library | Purpose | Why |
|---------|---------|-----|
| `opentype.js` | Text-to-path conversion | Required for font-safe export (doc identifies need but doesn't list library) |
| `paper.js` or `@svgdotjs/svg.js` | Path boolean operations | Union, intersection, subtraction of paths. Raw SVG path math is brutal without it. |
| `zod` | Runtime schema validation | Validate PartState on load/save. Catches corruption before it propagates. |
| `idb-keyval` | IndexedDB wrapper | Better than LocalStorage: larger quota, structured data, async. |
| `hotkeys-js` | Keyboard shortcut management | Handles combos, conflicts, scoping. |
| `@dnd-kit/core` | Drag-and-drop | For Pin Wizard reordering and Bus Manager drag-to-group. |
| `comlink` | Web Worker communication | Ergonomic typed RPC to workers for export/AI tasks. |
| `pdfjs-dist` | PDF text extraction | Client-side PDF parsing for datasheet uploads to Gemini. |

### 6.2 Replace `xml-js`

`xml-js` hasn't been actively maintained. Switch to **`fast-xml-parser`** — faster, actively maintained, better TypeScript support, and handles edge cases in Fritzing's XML more reliably.

### 6.3 Reconsider `styled-components` for SVG

For SVG elements numbering in the hundreds, CSS-in-JS has per-element runtime overhead. For the canvas specifically, use direct SVG presentation attributes (`fill`, `stroke`, `transform`) set via React props. Reserve Tailwind/CSS-in-JS for the UI shell (panels, modals, inputs).

### 6.4 Explicitly Specify Vite

The doc doesn't mention a bundler. **Vite** is the obvious choice for React in 2025/2026. State it explicitly so build tooling decisions don't drift.

### 6.5 Consider React 19

If starting from scratch, React 19's compiler eliminates the need for manual `useMemo`/`useCallback` in the canvas rendering hot path. This is meaningful for an SVG editor with potentially hundreds of re-rendering elements.

---

## 7. Missing Features That Would Differentiate

Ranked by impact-to-effort ratio:

### Must-Have for MVP
1. **Import existing .fzpz** — Without this, the tool only serves users creating from scratch (minority use case)
2. **DRC validation** — Minimum pad size, clearance checks, missing holes. Prevents "works in editor, broken in Fritzing" syndrome
3. **SVG import** — Import existing SVG artwork into breadboard view. Many users have hand-drawn SVGs

### Should-Have for v1.0
4. **Measurement tool** — Click two points → distance in current units
5. **Alignment/distribution tools** — Align left, center, distribute evenly
6. **Part templates** — Save partial designs as reusable starting points
7. **Version history** — Snapshots with "v1.0 → v1.1 fixed pad sizes" annotations
8. **Pin mirroring** — Symmetric packages: change one side, offer to mirror

### Nice-to-Have for v2.0
9. **Export to KiCad / Eagle** — Dramatically expands audience
10. **Offline PWA** — Progressive Web App for internet-free work
11. **Collaborative viewing** — Share a link for someone to view (not edit)
12. **Batch variant export** — Export DIP-8 and SOIC-8 versions in one operation
13. **Fritzing community repo integration** — Direct publish to GitHub parts repo

---

## 8. Roadmap Critique & Suggestions

### The Current Phases Are Correct in Sequence

The build order (Vector Engine → Pin Logic → View System → Exporter) is sound. Each phase builds on the previous one's foundation.

### Suggested Additions to Each Phase

**Phase 1 additions:**
- Add `zod` schema validation from day 1
- Add IndexedDB auto-save from day 1
- Add keyboard shortcut infrastructure from day 1
- Specify Vite as the bundler

**Phase 2 additions:**
- Build the command palette alongside the Inspector
- Add the status bar
- Add clipboard operations (copy/paste/duplicate)

**Phase 3 additions:**
- Build the import parser alongside the view system (they share SVG parsing logic)
- Add alignment tools
- Add measurement tool

**Phase 4 additions:**
- Add DRC validation before export
- Add SVG namespace handling to the exporter
- Build the "Fritzing SVG safe subset" filter
- Add Gemini integration for export validation

### Suggested Phase 5: AI Integration

After Phase 4 (working export), add:
- Gemini service layer
- Datasheet pin extraction
- Auto-complete metadata
- Natural language part creation
- Vision-based footprint extraction

This should be its own phase because AI features require a working baseline to enhance.

---

## 9. Questions the Document Doesn't Answer

1. **Deployment target?** Self-hosted? Vercel? Electron wrapper for desktop? This affects offline capability, file system access, and performance.
2. **Multi-user?** Any future plans for accounts, saved parts in the cloud, sharing? This affects data model serialization decisions now.
3. **Monetization?** Open source? Freemium with AI features gated? This affects architecture (API key management, rate limiting).
4. **Browser support?** Chrome-only? Firefox? Safari? SVG rendering differences between browsers are real and affect the canvas implementation.
5. **Maximum part complexity?** What's the upper bound? A simple 2-pin resistor vs. a 256-pin BGA have wildly different performance requirements.
6. **Undo granularity?** Does every mouse movement during a drag count as an undo step? Or only the final position? This affects Zundo configuration significantly.
7. **Localization?** English-only? The Fritzing community is heavily international (especially Germany, where Fritzing originated).

---

## 10. Summary of Findings by Priority

### 🔴 Critical (Fix Before Coding)
- Discriminated union types for Shape (§1.1)
- Connector-to-Shape linkage (§1.2)
- Import capability specification (§2.1)
- Connector ID deletion strategy (§1.6)

### 🟡 Important (Fix During Development)
- PCB pad data in Connector (§1.3)
- Icon view specification (§1.4)
- ViewBox calculation (§1.5)
- Bus dangling references (§1.7)
- SVG namespace declarations (§3.1)
- Web Worker architecture (§2.2)
- Safe SVG subset specification (§3.2)
- Testing strategy (§2.4)

### 🟢 Recommended (Add When Possible)
- Command palette (§5.1)
- Part completeness indicator (§5.2)
- Status bar (§5.3)
- Keyboard shortcut system (§5.5)
- DRC validation (§7, #2)
- Alignment tools (§7, #5)
- Gemini integration tiers 1-2 (§4)

### 🔵 Future / Nice-to-Have
- Collaborative viewing
- KiCad/Eagle export
- Offline PWA
- Theme variants
- Subpart support

---

*End of Review. This document should be maintained alongside the master architecture document and updated as findings are resolved.*
