# FZPZ Studio — Design Review Addendum (5-Pass Deep Dive)

**Supplements:** FZPZ-Studio-Design-Review.md (original review)  
**Date:** February 9, 2026  
**Total New Findings:** 73 items across 5 systematic passes  
**Combined Total (with original review):** ~144 findings

---

## Pass 1: Data Model Field-by-Field Audit

Every field in every interface was evaluated for missing constraints, ambiguous semantics, and type-safety gaps.

### P1-01: `meta.label` (RefDes Prefix) Has No Validation

The field accepts free text but Fritzing expects short prefixes: `R` (resistor), `U` (IC), `J` (connector), `C` (capacitor), `L` (inductor), `D` (diode), `Q` (transistor), `SW` (switch), `LED`, etc.

**Fix:** Constrain with regex `^[A-Z]{1,3}$` or better — provide a dropdown of standard prefixes mapped to the `family` field. When family is "Resistor", auto-suggest "R".

### P1-02: `meta.version` Has No Format Specification

Is this semver (`1.0.0`), simple decimal (`1.0`), or free text? Fritzing's FZP uses a simple string `<version>` tag.

**Fix:** Recommend semver format. Validate with regex `^\d+\.\d+(\.\d+)?$`. Default to `"1.0.0"` on new parts.

### P1-03: `meta.tags` Has No Constraints

No maximum count, no length limits per tag, no character restrictions. Fritzing's parts search has practical limits.

**Fix:** Max 20 tags, max 50 characters each, lowercase alphanumeric + hyphens only. Auto-lowercase on input. Warn on duplicates.

### P1-04: `specs.package` Conflates Mounting Type and Package Type

`"DIP" | "SMD" | "THT" | "Custom"` mixes a package name (DIP) with mounting categories (SMD, THT). "SMD" is not a package — SOIC, QFP, and BGA are all SMD packages.

**Fix:** Split into two fields:

```typescript
mountingType: "through-hole" | "surface-mount" | "hybrid";
packageType: "DIP" | "SIP" | "SOIC" | "SOP" | "QFP" | "QFN" | "BGA" | 
             "SOT-23" | "SOT-223" | "TO-92" | "TO-220" | "TO-3" | 
             "DPAK" | "Custom";
```

### P1-05: `specs.pins` Will Desynchronize from `connectors.length`

Having both `specs.pins: number` and `connectors: Connector[]` creates two sources of truth for pin count. They will inevitably drift.

**Fix:** Remove `specs.pins`. Derive pin count as a computed property:

```typescript
get pinCount(): number { return this.connectors.length; }
```

### P1-06: `specs.width`/`specs.height` Units Are Ambiguous

Described as "Physical width in mm" but the internal coordinate system uses "1 Unit = 10 mils". Are `width`/`height` in mm (physical) or internal units? If mm, where's the conversion?

**Fix:** Rename to `physicalWidth_mm` and `physicalHeight_mm` to make units explicit. These should be input fields for the user, used by generators and for reference — not derived from shapes.

### P1-07: `Shape.rotation` Has No Specified Origin

SVG rotation requires a center point: `transform="rotate(45, cx, cy)"`. The Shape type has `rotation: number` but no rotation origin.

**Fix:** Always rotate around shape center (auto-calculated from bounding box). Document this explicitly. If custom origins are ever needed, add:

```typescript
rotationOrigin?: Point; // Default: center of bounding box
```

### P1-08: `Shape.strokeWidth` Has No Unit Specification

Is strokeWidth in internal units? Does it scale on export? A 2-unit stroke at breadboard export = 0.02 inches. Is that correct? At PCB export = 0.508mm. The exporter must apply the same conversion factor to strokeWidth as to dimensions.

**Fix:** Specify: "All Shape numeric properties (x, y, w, h, r, strokeWidth) are in internal units and undergo the same unit conversion at export time."

### P1-09: `Connector.type` Is Incomplete for Fritzing

`"male" | "female" | "pad"` — Fritzing also supports connector types `"wire"` and `"bus"`. More importantly, there is no `direction` field for schematic conventions.

**Fix:**

```typescript
type: "male" | "female" | "pad" | "wire";
direction?: "input" | "output" | "bidirectional" | "passive" | "power";
```

The `direction` field drives auto-placement logic for schematics (inputs left, outputs right, power top/bottom per IEEE Std 315).

### P1-10: Terminal Position Data Is Missing from Connector

The doc's Section 7 says terminal points must be explicit 1×1 rects at pin endpoints. The Connector type has `terminalId?: string` but no **position** data for the terminal. The exporter needs to know WHERE to place the terminal element.

**Fix:** Add per-view terminal positions:

```typescript
breadboardTerminal?: Point;
schematicTerminal?: Point;
pcbTerminal?: Point;  // Usually same as pad center, but not always
```

Or derive terminal position from the pin's visual shape endpoint (requires connector-to-shape linkage from original review §1.2).

### P1-11: `Point` Has No Validation Constraints

`{ x: number, y: number }` accepts `NaN`, `Infinity`, and `-Infinity`. These will corrupt SVG output.

**Fix:** Runtime validation via Zod:

```typescript
const PointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});
```

### P1-12: `Bus` Has No Human-Readable Name

The FZP XML `<bus>` element has a `name` attribute: `<bus id="ground" name="Ground">`. The current Bus interface only has `id` and `nodeMembers`. Users will see `bus0` instead of "Ground Bus" in the Bus Manager.

**Fix:**

```typescript
interface Bus {
  id: string;
  name: string;            // Human-readable: "Ground", "VCC", "Data Bus"
  nodeMembers: string[];
}
```

### P1-13: `ui.selection` Can't Distinguish Shape IDs from Connector IDs

`selection: string[]` holds "Shape/Connector IDs" but if a Shape and Connector theoretically share the same ID string, the selection system can't distinguish them.

**Fix:** Either guarantee globally unique IDs across all entities (UUIDs handle this), or use tagged references:

```typescript
type SelectionRef = 
  | { type: "shape"; id: string }
  | { type: "connector"; id: string };

selection: SelectionRef[];
```

UUID approach is simpler and recommended.

---

## Pass 2: UI/UX Specification Forensics

Every UI element described in Sections 3 and 6 evaluated for underspecification, contradictions, and missing interaction patterns.

### P2-01: Icon View Tab Is Missing from View Switcher

`ViewType` declares `"icon"` but the View Switcher UI only lists `Breadboard | Schematic | PCB | Metadata`. The icon view has no editing surface.

**Fix:** Either add an Icon tab to the switcher (with a simplified canvas), or document that icon SVG is auto-generated from the breadboard view at export time and not user-editable. The auto-generation approach is recommended for MVP.

### P2-02: Auto-Save Status Indicator Is Unspecified

"Smart Save: LocalStorage auto-save status" — but what states does this indicator display?

**Fix:** Define a state machine:

```
IDLE → SAVING → SAVED("2s ago") → IDLE
IDLE → SAVING → ERROR("Storage full") → IDLE
```

Auto-save trigger: Debounced 2 seconds after last state mutation. Display: Green dot = saved, yellow dot = unsaved changes, red dot = save failed. Clicking the indicator shows last save time and any errors.

### P2-03: Export Failure UX Is Undefined

"The 'Compile' button triggers validation and download" — but what happens when validation fails?

**Fix:** On export click: (1) Run full validation suite. (2) If errors exist, open a modal with an itemized list: error icon + description + "Go to Issue" button that navigates to the relevant view/element. (3) Distinguish blocking errors (cannot export) from warnings (can export with risks). (4) If no errors, proceed to download.

### P2-04: Pin Auto-Increment Logic Is Dangerously Underspecified

"Smart logic auto-increments pin numbers (1, 2, 3...) or labels (D0, D1, D2...)" — This is the most complex toolbar feature and gets one sentence.

**Fix:** Specify the algorithm:

1. Look at the last manually-named connector.
2. Parse trailing number: `"D7"` → prefix `"D"`, number `7`.
3. Next auto-name: `"D8"`.
4. If no pattern detected, use `"Pin {N}"` where N = `connectors.length + 1`.
5. On deletion, don't re-number — next pin still increments from highest existing number.
6. Allow override: user can always manually rename after placement.

### P2-05: Generator Interaction Model Is Ambiguous

Are generators click-to-place tools or modal wizards? Section 3 lists them as toolbar tools, Section 4.5 describes a "Chip Wizard" dialog.

**Fix:** Clarify: clicking a Generator tool in the toolbar opens a **modal wizard dialog** where the user configures package type, pin count, and options. Pressing "Generate" populates the active view and creates connectors. This is NOT a click-to-place tool.

### P2-06: Reference Image Tool Access Pattern Is Missing

How does the user activate and interact with the reference image tool? What's the flow?

**Fix:** Specify: (1) Click Reference tool in toolbar → file picker opens. (2) Image loads behind all content at 50% opacity. (3) A floating mini-panel appears with: opacity slider (0-100%), scale/calibrate button, rotate slider, and "Remove Image" button. (4) Reference images are per-view (different image for breadboard vs PCB). (5) Reference image data is stored in `ui` state (not exported).

### P2-07: Zoom Behavior Is Completely Unspecified

No zoom limits, no zoom-to-cursor behavior, no scroll wheel sensitivity, no touch support.

**Fix:**

- **Range:** 5% to 6400% (covers "see entire canvas" to "sub-pixel editing")
- **Behavior:** Zoom to cursor position (scroll wheel), zoom to center (keyboard +/-)
- **Scroll wheel:** Each detent = 10% change (multiplicative, not additive)
- **Keyboard:** `Ctrl+=` zoom in, `Ctrl+-` zoom out, `Ctrl+0` reset to 100%, `Ctrl+Shift+0` fit to content
- **Touch:** Pinch-to-zoom supported via PointerEvents
- **Trackpad:** Two-finger scroll = pan, pinch = zoom

### P2-08: Grid Subdivision Creates Fractional Units

"Subdivisions: 0.025 inch" = 2.5 internal units. This is not an integer, creating floating-point alignment issues.

**Fix:** Constrain subdivisions to integer internal units: 5 units (0.05"), 2 units (0.02"), or 1 unit (0.01"). Remove the 0.025" option.

### P2-09: Snap Radius Must Be Screen-Relative

"Magnetic snapping to grid intersections" — but no snap threshold specified. If the threshold is in world coordinates, it behaves differently at different zoom levels.

**Fix:** Snap radius = 8 screen pixels (constant regardless of zoom). Convert to world coordinates dynamically: `worldSnapRadius = 8 / zoom`. This ensures consistent snapping feel at all zoom levels.

### P2-10: Overlay Layer System Is Unspecified

Ghost Pins are mentioned as overlays, but there's no general overlay layer specification.

**Fix:** Define overlay types (all non-exporting):

| Overlay | Visibility | Description |
|---------|-----------|-------------|
| Grid | Toggleable (`G` key) | Primary + subdivision lines |
| Ghost Pins | Always on when unplaced | Semi-transparent indicators |
| Selection Handles | On selection | Resize handles, rotation grip |
| Bounding Box | On selection | Dotted outline around selected shapes |
| Smart Guides | During drag | Alignment lines to other objects |
| Measurement | On measurement tool | Distance readout between two points |
| Cursor Crosshair | On precision mode | Full-canvas crosshair following cursor |

### P2-11: Multi-Select Inspector Behavior Is Undefined

What does the Properties Panel show when 3 shapes are selected?

**Fix:** Show shared properties with "Mixed" indicators:

- Properties with the same value across all selected: show the value, editable (batch edit)
- Properties with differing values: show "Mixed" placeholder, editable (overwrites all)
- Properties unique to some shape types: hidden (don't show `r` when a rect and circle are both selected)

### P2-12: Pin Wizard Paste Feature Needs Full Specification

"Supports pasting columns from Excel/Datasheets" is one sentence for a complex feature.

**Fix:** Specify:

1. **Parse format:** Tab-separated values (TSV) from Excel/Google Sheets copy
2. **Column mapping:** First row treated as headers. Auto-map columns: "Pin" → designator, "Name" → name, "Type" → type, "Description" → description
3. **Unrecognized columns:** Ignored with a notification
4. **Conflict handling:** If pasted pins overlap with existing pin numbers, show a merge dialog: "Replace existing", "Skip conflicts", "Append as new pins"
5. **Validation:** After paste, highlight any rows with missing required fields (designator, name)
6. **Undo:** Entire paste operation is a single undo step

### P2-13: Event System Should Use PointerEvents

"Must handle onMouseDown, onMouseMove, onMouseUp" — this is 2015 thinking. Modern approach uses PointerEvents for unified mouse/touch/pen support.

**Fix:** Use `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`. This automatically handles mouse, touch, and pen input without separate event handlers. Add `touch-action: none` CSS to the canvas to prevent browser gesture interference.

Also missing: right-click context menu specification, double-click behavior (open text editor? open properties?).

### P2-14: Coordinate Conversion Functions Need Explicit Math

`screenToWorld` and `worldToScreen` are the most critical functions in the app and get one bullet point.

**Fix:** Specify explicitly. Assuming zoom/pan is implemented via SVG transform on a root `<g>` element:

```typescript
function screenToWorld(screenX: number, screenY: number, pan: Point, zoom: number): Point {
  // Subtract canvas element offset first (getBoundingClientRect)
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  };
}

function worldToScreen(worldX: number, worldY: number, pan: Point, zoom: number): Point {
  return {
    x: worldX * zoom + pan.x,
    y: worldY * zoom + pan.y,
  };
}
```

Implementation: Apply `transform` attribute to a root `<g>` inside the `<svg>`: `<g transform="translate(${pan.x}, ${pan.y}) scale(${zoom})">`. The `<svg>` element itself has a fixed viewBox matching the viewport dimensions.

### P2-15: Inspector Input Commits Create Undo Pollution

"Changes dispatch UPDATE_SHAPE immediately" — every keystroke in a text field creates an undo entry. Renaming "GND" to "VCC" requires 6 undo steps.

**Fix:** Use "commit on blur or Enter" pattern. While typing, changes are local to the input component. When the user presses Enter or clicks away (blur), a single `UPDATE_SHAPE` action is dispatched. This creates one undo entry for the entire rename operation.

Alternative: Zustand temporal middleware can be configured to batch rapid updates within a time window (200ms) into a single undo step.

---

## Pass 3: Export/Compiler Logic Deep Dive

The exporter is the make-or-break component. Every export detail was cross-referenced against actual Fritzing file format requirements.

### P3-01: Complete FZP XML Skeleton Is Missing

The document never shows the actual XML structure the exporter must produce. The full skeleton (see corrected version below) reveals several missing data fields.

**Required FZP structure:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<module fritzingVersion="0.9.3b" moduleId="{GUID}">
  <version>{meta.version}</version>
  <title>{meta.title}</title>
  <description>{meta.description}</description>
  <author>{meta.author}</author>
  <date>{export_date}</date>
  <url>{meta.url}</url>
  <label>{meta.label}</label>
  <tags>
    <tag>{each tag}</tag>
  </tags>
  <properties>
    <property name="family">{meta.family}</property>
    <property name="{key}">{value}</property>
  </properties>
  <views>
    <breadboardView>
      <layers image="svg.breadboard.{GUID}_breadboard.svg">
        <layer layerId="breadboard"/>
      </layers>
    </breadboardView>
    <schematicView>
      <layers image="svg.schematic.{GUID}_schematic.svg">
        <layer layerId="schematic"/>
      </layers>
    </schematicView>
    <pcbView>
      <layers image="svg.pcb.{GUID}_pcb.svg">
        <layer layerId="copper0"/>
        <layer layerId="copper1"/>
        <layer layerId="silkscreen"/>
      </layers>
    </pcbView>
    <iconView>
      <layers image="svg.icon.{GUID}_icon.svg">
        <layer layerId="icon"/>
      </layers>
    </iconView>
  </views>
  <connectors>
    <connector id="connector0" name="{name}" type="{type}">
      <description>{description}</description>
      <views>
        <breadboardView>
          <p layer="breadboard" svgId="connector0pin" terminalId="connector0terminal"/>
        </breadboardView>
        <schematicView>
          <p layer="schematic" svgId="connector0pin" terminalId="connector0terminal"/>
        </schematicView>
        <pcbView>
          <p layer="copper0" svgId="connector0pad"/>
          <p layer="copper1" svgId="connector0pad"/>
        </pcbView>
      </views>
    </connector>
  </connectors>
  <buses>
    <bus id="{bus.id}">
      <nodeMember connectorId="connector0"/>
    </bus>
  </buses>
</module>
```

**Missing fields revealed by this skeleton:**
- `moduleId` — globally unique GUID. Must be in PartState. Add `meta.moduleId: string` (auto-generated UUID).
- `date` — export date. Auto-populate at export time. Not user-editable.
- `url` — optional project/documentation URL. Add `meta.url?: string`.
- `fritzingVersion` — hardcode `"0.9.3b"` as default, allow override.

### P3-02: PCB FZP Layer References Require Dual Entries

For THT connectors, the FZP XML `<pcbView>` must have TWO `<p>` elements — one for `copper0` and one for `copper1` — both referencing the same SVG element ID. The doc mentions the SVG group nesting but not this FZP requirement. Both must agree.

### P3-03: SVG Filename Convention Is Unspecified

The FZP `<layers image="...">` references SVG files by path. The ZIP structure and filenames must match exactly.

**Fix:** Define the convention:

```
{GUID}.fzp
svg/breadboard/{GUID}_breadboard.svg
svg/schematic/{GUID}_schematic.svg
svg/pcb/{GUID}_pcb.svg
svg/icon/{GUID}_icon.svg
```

Where `{GUID}` is `meta.moduleId`. The FZP image attributes reference relative paths within the ZIP.

### P3-04: ZIP Directory Structure Is Unspecified

The doc says "bundle 4 text strings" but doesn't specify the ZIP path structure.

**Fix:** Fritzing expects:

```
part.{GUID}.fzp
svg.breadboard.{GUID}_breadboard.svg
svg.schematic.{GUID}_schematic.svg
svg.pcb.{GUID}_pcb.svg
svg.icon.{GUID}_icon.svg
```

Note: some Fritzing versions use flat structure (no directories), others use nested. The flat structure (shown above with dots in filenames) is most compatible. Verify against Fritzing 0.9.3b's expectations.

### P3-05: SVG Document Wrapper Structure Is Missing

The doc describes copper layer nesting but never shows the complete SVG document structure.

**Fix:** Complete SVG templates:

**Breadboard SVG:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="{width}in" height="{height}in"
     viewBox="0 0 {vb_w} {vb_h}">
  <g id="breadboard">
    <!-- All shapes here -->
    <!-- Pin elements with id="connector{N}pin" -->
    <!-- Terminal elements with id="connector{N}terminal" (1x1 invisible rects) -->
  </g>
</svg>
```

**PCB SVG:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="{width}mm" height="{height}mm"
     viewBox="0 0 {vb_w} {vb_h}">
  <g id="silkscreen">
    <!-- Package outline, labels -->
  </g>
  <g id="copper1">
    <g id="copper0">
      <!-- THT pads (exist on both layers) -->
      <!-- id="connector{N}pad" on each -->
    </g>
    <!-- SMD pads (top layer only) go here, outside copper0 -->
  </g>
</svg>
```

**Critical:** The `width`/`height` attributes use UNIT SUFFIXES: `in` for breadboard/schematic, `mm` for PCB. The viewBox is unitless.

### P3-06: Terminal Element Auto-Generation

The exporter must auto-generate terminal elements for every connector in breadboard and schematic views. These are invisible 1×1 unit rectangles at the wire snap point:

```xml
<rect id="connector0terminal" x="{tx}" y="{ty}" width="1" height="1" 
      fill="none" stroke="none" stroke-width="0"/>
```

Position (`tx`, `ty`) comes from `Connector.breadboardTerminal` or `Connector.schematicTerminal`. If not specified, default to the connector's point position.

### P3-07: The Document Says 3 SVGs — It's 4

"Bundle these 4 text strings (1 XML, 3 SVGs)" — incorrect. Fritzing parts have 4 SVGs: breadboard, schematic, PCB, **and icon**. The icon SVG is omitted throughout the export specification.

**Fix:** Generate 4 SVGs. For MVP, auto-generate the icon SVG by scaling the breadboard SVG to fit a 32×32 unit bounding box.

### P3-08: SVG Unit Suffix Handling at Export

The doc says "Export in inches" and "Export in mm" but doesn't specify the mechanism. It's the `width` and `height` attributes on the `<svg>` element:

```
Breadboard: width="{val}in" height="{val}in"
Schematic:  width="{val}in" height="{val}in"  
PCB:        width="{val}mm" height="{val}mm"
Icon:       width="{val}in" height="{val}in"
```

The viewBox numbers are unitless and proportional. All internal coordinates in the viewBox undergo the same conversion.

### P3-09: THT Pad SVG Pattern Is Incomplete

The doc's drill hole description says "Circle Radius = (Hole Diameter / 2) + Ring Width" but doesn't give the exact SVG pattern.

**Fix:** Precise THT pad pattern:

```xml
<circle id="connector0pad" 
        cx="{x}" cy="{y}" 
        r="{(holeDiameter/2) + (ringWidth/2)}"
        fill="none" 
        stroke="#F7BD13" 
        stroke-width="{ringWidth}"/>
```

Fritzing derives the drill diameter from the inner edge of the ring: `drillDiameter = (r - strokeWidth/2) * 2`. The `fill="none"` is what tells Fritzing "this is a hole, not a filled circle."

### P3-10: Text Export Should Offer Path vs. Text Toggle

"Export text as path by default" — correct for visual fidelity, but path-converted text is uneditable in Fritzing. Users who want to tweak labels later can't.

**Fix:** Export settings dialog with toggle:

- ☑ Convert text to paths (guaranteed appearance, not editable in Fritzing)
- ☐ Keep text as SVG text (editable in Fritzing, may render differently on systems without the font)

Default: paths. Power users can switch.

---

## Pass 4: Feature Logic Stress Testing

Each feature walked through as user workflows to find broken paths, race conditions, and unhandled edge cases.

### P4-01: Grid Rendering Needs Adaptive Density

At low zoom (10%), primary grid lines (every 10 units) are 1 pixel apart — an illegible mess. At high zoom (3200%), grid lines are 320 pixels apart — too sparse to be useful.

**Fix:** Adaptive grid:

| Zoom Range | Grid Shown | Subdivision Shown |
|-----------|-----------|-------------------|
| < 25% | Every 100 units (0.1") | None |
| 25% – 100% | Every 10 units (0.01") | None |
| 100% – 400% | Every 10 units | Every 5 units |
| > 400% | Every 10 units | Every 1 unit |

Grid lines fade in/out during zoom transitions for smooth visual experience.

### P4-02: Negative Coordinates Are Unaddressed

What happens if a user drags a shape left of `(0, 0)`?

**Fix:** Allow negative coordinates (true infinite canvas). The export viewBox auto-calculates from the bounding box of all content, which may have a negative origin. This is valid SVG and valid Fritzing.

### P4-03: StrokeWidth Must Convert at Export

The coordinate conversion section specifies how `x`, `y`, `w`, `h` convert to inches/mm at export. But `strokeWidth` is never mentioned. A 2-unit stroke = 0.02" or 0.508mm — it MUST undergo the same conversion.

**Fix:** Add explicit rule: "All numeric SVG attributes (x, y, width, height, r, cx, cy, stroke-width, font-size) undergo the same unit conversion at export."

### P4-04: Ghost Pins Pile Up at Origin

"App renders a ghost pin at (0,0)" — 20 ghost pins stack at the same point, becoming impossible to select individually.

**Fix:** Auto-distribute ghost pins along the left margin of the canvas viewport, spaced 15 units apart vertically. Label each with its connector name. Alternatively, render ghost pins in a sidebar list (click to place) rather than on the canvas.

### P4-05: View Enablement Toggle Is Missing

"Cannot export until all Ghost Pins are placed in all enabled views" — but there's no mechanism to enable/disable views. Some Fritzing parts ARE breadboard-only or schematic-only.

**Fix:** Add per-view enablement toggles in the View Switcher:

```
[✓ Breadboard] [✓ Schematic] [✓ PCB] [Metadata]
```

Disabled views: no shapes, no ghost pins, no SVG generated at export. The FZP XML still references the view but points to an empty/placeholder SVG.

### P4-06: No Auto-Layout Helper for Ghost Pins in Schematic

When switching from breadboard to schematic, users face a blank canvas with 20+ ghost pins to manually arrange. No guidance on schematic conventions.

**Fix:** Add a "Suggest Layout" button in schematic view that uses pin names/types to propose a standard IEEE layout:

- Power pins (VCC, VDD) → top
- Ground pins (GND, VSS) → bottom  
- Input pins → left side
- Output pins → right side
- Bidirectional → right side

User can accept, modify, or reject the suggestion.

### P4-07: AI Prompt Engineering Is Naive

The datasheet pin extraction prompt is a simple template. Real datasheet text is messy.

**Fix:** Use this improved prompt pattern:

```
You are a component datasheet parser. Extract the pinout table from the following text.

RULES:
- Output ONLY valid JSON array, no explanation
- Each pin: {"designator": number, "name": string, "type": "input"|"output"|"power"|"ground"|"bidirectional"|"passive"|"unknown"}
- If pin function is unclear, use type "unknown"
- Pin designators must be integers starting from 1
- Pin names should be UPPERCASE
- Ignore non-pin information (absolute max ratings, DC characteristics, etc.)

TEXT:
{user_pasted_text}
```

Temperature: 0.1. Use Gemini's structured output mode (JSON schema enforcement) for reliable parsing.

### P4-08: AI Merge Needs Preview/Diff, Not Auto-Apply

"Directly merged into PartState via MERGE_AI_DATA" — dangerous if AI hallucinates.

**Fix:** AI responses populate a **staging area**, not the live state. UI shows a diff:

```
┌ AI Suggestion ─────────────────────┐
│ + Add connector0: "GND" (power)    │
│ + Add connector1: "TRIG" (input)   │
│ + Add connector2: "OUT" (output)   │
│ ~ Change title: "NE555 Timer"      │
│                                    │
│ [Accept All] [Review Each] [Reject]│
└────────────────────────────────────┘
```

"Accept All" = single undo step. "Review Each" = step through one at a time.

### P4-09: Vision Uploads Need Preprocessing

Users will upload blurry photos, rotated images, multi-page PDFs.

**Fix:** After file selection, show a preprocessing dialog:

1. **Image:** Crop tool, rotation slider, brightness/contrast adjusters
2. **PDF:** Page selector (which page has the pinout/footprint?)
3. **Size limit:** Max 10MB, auto-downscale images > 4096px on any axis
4. **Supported formats:** PNG, JPG, WebP, PDF

### P4-10: `GenOptions` Interface Is Undefined

`generatePackage(type, pins, options: GenOptions)` — GenOptions is referenced but never defined.

**Fix:**

```typescript
interface GenOptions {
  pitch_mm: number;            // Pin-to-pin center distance (2.54 for standard DIP)
  bodyWidth_mm: number;        // IC body width between pin rows
  bodyLength_mm?: number;      // Auto-calculated from pin count + pitch if omitted
  padShape: "round" | "square" | "oblong";
  holeDiameter_mm: number;     // THT only (0 for SMD)
  padDiameter_mm: number;      // THT outer ring diameter
  padWidth_mm?: number;        // SMD pad width
  padHeight_mm?: number;       // SMD pad height
  pinNumbering: "ccw" | "zigzag" | "linear"; // DIP=ccw, SIP=linear, Header=zigzag
  pin1Marker: "dot" | "notch" | "bevel" | "none";
  silkOutline: boolean;        // Generate silkscreen package outline
  silkLineWidth_mm: number;    // Typically 0.15mm or 0.2mm
}
```

### P4-11: Generator Package List Is Incomplete

Missing common packages: SOT-23, SOT-223, TO-92, TO-220, DPAK, barrel jack, USB, RJ45.

**Fix:** Design the generator architecture as a **plugin system**:

```typescript
interface PackageGenerator {
  type: string;
  displayName: string;
  icon: string;
  defaultOptions: GenOptions;
  generate(pins: number, options: GenOptions): Partial<PartState>;
  validate(pins: number, options: GenOptions): ValidationError[];
}

const generators: Map<string, PackageGenerator> = new Map();
generators.set("DIP", new DIPGenerator());
generators.set("SOIC", new SOICGenerator());
// Easy to add new generators later
```

### P4-12: Reference Image Calibration Doesn't Handle Rotation

Two-point calibration sets scale but not rotation. Tilted datasheet images will be scaled correctly but remain rotated.

**Fix:** Upgrade to three-point calibration:

1. Points 1 and 2: define a known distance AND angle (rotation correction)
2. Point 3: defines the origin (optional — defaults to top-left of image)

Or simpler: two-point calibration + manual rotation slider (±45° range, 0.1° increments). Most images only need slight rotation correction.

### P4-13: Reference Images Should Be Per-View

Can the user have different reference images for breadboard vs. PCB? Almost certainly needed — breadboard reference is a component photo, PCB reference is a footprint drawing.

**Fix:** Store reference images per view in the UI state:

```typescript
ui: {
  referenceImages: {
    breadboard?: { dataUrl: string; opacity: number; transform: Matrix };
    schematic?: { dataUrl: string; opacity: number; transform: Matrix };
    pcb?: { dataUrl: string; opacity: number; transform: Matrix };
  };
}
```

### P4-14: Grid Visibility Toggle Is Missing

No way to hide the grid. Needed for: checking final appearance, tracing reference images, screenshots.

**Fix:** `G` key toggles grid visibility. Snap-to-grid continues to function even when grid is hidden (separate concerns). Show grid state in status bar: `Grid: On | Snap: 0.1"`.

### P4-15: Custom Grid Spacing Is Missing

Some components use non-standard pitch: 2.0mm (Japanese), 1.27mm (fine-pitch), 1.0mm, 0.5mm.

**Fix:** Add grid spacing presets + custom input:

- Presets: 2.54mm (0.1"), 2.0mm, 1.27mm (0.05"), 1.0mm, 0.5mm
- Custom: numeric input in mm or mils
- Keyboard shortcut to cycle presets: `Shift+G`

---

## Pass 5: Security, Reliability, Edge Cases, and Failure Modes

Adversarial analysis — what breaks, what's exploitable, what happens in weird states.

### P5-01: XSS via Exported SVG/XML

User text (part name, description, pin names) is embedded in SVG and XML. A description containing `<script>alert('xss')</script>` creates an XSS vector when the SVG is viewed in a browser.

**Fix:** All user text must be XML-escaped before embedding in export output. Use the XML library's built-in escaping — never manually concatenate user text into XML strings. Escape: `<` → `&lt;`, `>` → `&gt;`, `&` → `&amp;`, `"` → `&quot;`, `'` → `&apos;`.

### P5-02: Gemini API Key Exposure

Client-side SPA means the API key is in the JavaScript bundle, visible in DevTools.

**Fix:** Options ranked by security:

1. **Best:** Thin backend proxy (Cloudflare Worker or Vercel Edge Function) that holds the key server-side
2. **Acceptable:** User provides their own API key (stored in localStorage, never transmitted except to Gemini)
3. **Acceptable for personal use:** Domain-restricted API key with strict rate limits

For an open-source tool, option 2 (BYOK — Bring Your Own Key) is the most practical.

### P5-03: No File Size Limits on Image Upload

Unconstrained uploads can crash the browser tab (large images consume massive memory when decoded).

**Fix:**

- Max file size: 10MB
- Accepted formats: PNG, JPG, WebP, GIF (for reference images); PNG, JPG, WebP, PDF (for AI vision)
- Auto-resize: Images larger than 4096×4096 are downscaled client-side before storing
- Memory management: Revoke object URLs after use (`URL.revokeObjectURL`)

### P5-04: Storage Quota Exceeded Handling

Auto-save to IndexedDB/LocalStorage can silently fail if quota is exceeded.

**Fix:**

```typescript
async function autoSave(state: PartState): Promise<SaveResult> {
  try {
    await idbSet('currentPart', state);
    return { status: 'saved', timestamp: Date.now() };
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Try to free space by removing old snapshots
      await pruneOldSnapshots();
      try {
        await idbSet('currentPart', state);
        return { status: 'saved', timestamp: Date.now() };
      } catch {
        return { status: 'error', message: 'Storage full. Export your work manually.' };
      }
    }
    return { status: 'error', message: error.message };
  }
}
```

### P5-05: CORS for Gemini API Calls

Direct browser-to-Gemini calls require proper CORS handling. The Gemini API does support browser calls with an API key, but the `@google/generative-ai` JavaScript SDK handles this.

**Fix:** Use the official `@google/generative-ai` npm package. Add it to the tech stack. It handles CORS, authentication, and structured output natively.

### P5-06: Empty Part Export Behavior Is Undefined

User clicks Export with no shapes and no connectors.

**Fix:** Validate before export. Minimum requirements for a valid Fritzing part:

- Title is not empty
- At least one view has at least one shape
- (Connectors can be zero — valid for mechanical parts)

If requirements not met, show validation errors in the export modal. Do NOT generate an empty file.

### P5-07: Single-Pin and Zero-Pin Parts

Test points (1 pin) and logos/mounting holes (0 pins) are valid Fritzing parts.

**Fix:** Explicitly support:

- **0 connectors:** Valid. Bus Manager shows "No connectors." Export generates empty `<connectors/>` section.
- **1 connector:** Valid. Bus Manager shows the pin but doesn't suggest buses (meaningless with 1 pin).
- **Pin Tool:** First pin is always `connector0`, regardless of how many previously existed and were deleted.

### P5-08: Overlapping Connector Positions

Two pins at the same coordinates cause unpredictable wire snapping in Fritzing.

**Fix:** Validation warning (not blocking error): "Connectors {A} and {B} are at the same position in {view}. This may cause unexpected behavior in Fritzing." Highlight overlapping connectors in yellow.

### P5-09: Text Length Limits for Fritzing Compatibility

Extremely long part names or descriptions may overflow Fritzing's Inspector panel.

**Fix:** Enforce practical limits:

| Field | Max Length | Enforcement |
|-------|-----------|-------------|
| Title | 100 chars | Hard limit |
| Description | 2000 chars | Hard limit |
| Pin Name | 50 chars | Hard limit |
| Pin Description | 200 chars | Hard limit |
| Tag | 50 chars | Hard limit |
| Author | 100 chars | Hard limit |

Show character count and remaining characters in input fields.

### P5-10: Unicode in SVG Element IDs

Part title "Résistance 10kΩ" is fine for display, but SVG element IDs and FZP `moduleId` must be ASCII-safe.

**Fix:** Two separate string handling paths:

- **Display strings** (title, description, pin names): Full Unicode, XML-escaped at export
- **Identifier strings** (moduleId, connector IDs, SVG element IDs): ASCII only, auto-generated, never user-edited

### P5-11: Concurrent Browser Tab Editing

Two tabs editing the same part via auto-save creates a last-write-wins race.

**Fix:** Use `BroadcastChannel` API to detect concurrent sessions:

```typescript
const channel = new BroadcastChannel('fzpz-studio');
channel.onmessage = (event) => {
  if (event.data.type === 'SESSION_ACTIVE') {
    showWarning('This part is open in another tab. Changes may conflict.');
  }
};
channel.postMessage({ type: 'SESSION_ACTIVE', tabId: crypto.randomUUID() });
```

### P5-12: Undo Operates Globally Across Views

User draws in Breadboard, switches to Schematic, undoes — the breadboard change disappears while they're looking at schematic.

**Fix:** Global undo is industry standard (Figma, Illustrator, KiCad all do this). But show a toast notification when the undone action was in a different view: `"Undone: Added rectangle in Breadboard view"`. Include a "Show" link in the toast that switches to the affected view.

### P5-13: Undo Stack Depth Limit

Unbounded history consumes unbounded memory over long sessions.

**Fix:** Configure Zundo with max 200 history entries. When limit is reached, oldest entries are dropped. Show remaining undo steps in the status bar or history panel.

### P5-14: Redo Invalidation in History Panel

When user undoes then makes a new change, the redo branch is destroyed. The History Panel must visualize this (grayed-out entries that disappear, or a branch indicator).

**Fix:** The History Panel shows linear history. Entries after the current position are shown grayed/struck-through with a note: "These steps will be lost if you make a new change." On new change, they're removed from display.

### P5-15: Race Condition — Auto-Save During Export

If auto-save and export both try to read state simultaneously, and a mutation happens between, the exported file could be inconsistent.

**Fix:** At export start, capture an immutable snapshot of the state:

```typescript
function exportPart(): void {
  const snapshot = structuredClone(useStore.getState().part);
  // All export logic uses `snapshot`, never live state
  exportWorker.postMessage({ type: 'EXPORT', data: snapshot });
}
```

Immer's immutable references make this even simpler — just capture the current reference before starting export.

### P5-16: AI Response Arrives After Manual Changes

User sends AI pin extraction, then manually modifies pins while waiting. AI response arrives and tries to merge, creating conflicts.

**Fix:** AI responses go to a staging queue, not live state. When response arrives:

1. Compare AI suggestion against current state
2. If no conflicts: show suggestion for approval
3. If conflicts: highlight conflicts in the review UI, let user resolve each one
4. NEVER auto-merge

### P5-17: No Accessibility Specification

Zero WCAG compliance mentioned in the entire document.

**Fix (minimum viable accessibility):**

- All UI controls (panels, buttons, inputs) meet WCAG AA contrast ratio (4.5:1 for text, 3:1 for large text)
- All interactive elements are keyboard-focusable (tab order through toolbar → canvas → inspector)
- ARIA labels on icon-only buttons: `aria-label="Pin Tool (N)"`
- Canvas operations announced to screen readers via `aria-live` region: "Pin 3 placed at 50, 100"
- Respect `prefers-reduced-motion` media query (disable zoom animations, grid fade transitions)
- Focus visible indicators on all interactive elements (not just browser default)

Canvas SVG elements themselves are NOT accessibility targets (too complex for screen reader navigation). Instead, provide the Pin Wizard table and Properties Panel as accessible alternatives to canvas interaction.

### P5-18: No React Error Boundaries

A thrown error in one component crashes the entire app.

**Fix:** Wrap each major section in an Error Boundary:

| Boundary | Covers | Fallback |
|----------|--------|----------|
| `<CanvasErrorBoundary>` | Canvas + overlays | "Canvas error. Your data is safe. Reload to recover." + auto-save status |
| `<InspectorErrorBoundary>` | Right panel | "Inspector error. Try selecting a different element." |
| `<ToolbarErrorBoundary>` | Left toolbar | "Toolbar error. Use keyboard shortcuts while we fix this." |
| `<AppErrorBoundary>` | Entire app (outer) | "Something went wrong. Your last auto-save: {timestamp}. [Export Recovery Data]" |

The "Export Recovery Data" button in the outermost boundary dumps `JSON.stringify(store.getState())` as a downloadable file. This is the ultimate safety net.

### P5-19: No Loading/Progress States

No specification for what users see during async operations.

**Fix:** Required loading states:

| Operation | Duration | UI Treatment |
|-----------|----------|-------------|
| Import .fzpz | 1-5s | Full-screen overlay with progress bar + "Parsing..." |
| AI request | 3-15s | Inline spinner in AI panel + "Analyzing datasheet..." with elapsed time |
| Export/compile | 1-3s | Button shows spinner + "Compiling..." then "Download ready ✓" |
| Reference image load | 0.5-3s | Canvas placeholder shimmer where image will appear |
| Auto-save | <100ms | Green pulse on save indicator (subtle) |

All async operations must have timeout handling (30s max → "Request timed out. Try again?").

### P5-20: No Unsaved Changes Warning on Navigation

User has unsaved changes and closes the browser tab. Work is lost.

**Fix:** 

```typescript
window.addEventListener('beforeunload', (event) => {
  if (hasUnsavedChanges()) {
    event.preventDefault();
    // Modern browsers show their own generic message
  }
});
```

Combined with auto-save, this provides defense in depth: auto-save catches most cases, `beforeunload` catches the rest.

---

## Consolidated Priority Matrix (All Passes)

### 🔴 Critical — Fix Before Any Code

| ID | Finding | Section |
|----|---------|---------|
| P1-04 | Package/mounting type conflation | Data Model |
| P1-05 | specs.pins duplicates connectors.length | Data Model |
| P1-07 | Rotation origin unspecified | Data Model |
| P3-01 | FZP XML skeleton missing (reveals missing fields) | Export |
| P3-04 | ZIP directory structure unspecified | Export |
| P3-07 | 4 SVGs required, not 3 | Export |
| P2-15 | Undo pollution from immediate input commits | UX |

### 🟡 Important — Fix During Phase 1-2

| ID | Finding | Section |
|----|---------|---------|
| P1-01 | RefDes label validation | Data Model |
| P1-08 | StrokeWidth unit ambiguity | Data Model |
| P1-09 | Connector.type incomplete, missing direction | Data Model |
| P1-10 | Terminal position data missing | Data Model |
| P1-12 | Bus has no human-readable name | Data Model |
| P2-07 | Zoom behavior unspecified | UX |
| P2-08 | Grid subdivision creates fractional units | UX |
| P2-09 | Snap radius must be screen-relative | UX |
| P2-13 | Use PointerEvents not MouseEvents | Architecture |
| P2-14 | Coordinate conversion math unspecified | Architecture |
| P3-05 | SVG document wrapper structure missing | Export |
| P3-06 | Terminal element auto-generation | Export |
| P3-08 | SVG unit suffix handling | Export |
| P3-09 | THT pad SVG pattern incomplete | Export |
| P4-03 | StrokeWidth must convert at export | Export |
| P4-10 | GenOptions interface undefined | Generators |
| P5-01 | XSS via exported SVG/XML | Security |
| P5-02 | API key exposure | Security |
| P5-17 | No accessibility specification | Accessibility |
| P5-18 | No Error Boundaries | Reliability |

### 🟢 Recommended — Build Into Phases 2-4

| ID | Finding | Section |
|----|---------|---------|
| P1-02 | Version format unspecified | Data Model |
| P1-03 | Tags have no constraints | Data Model |
| P1-06 | Width/height units ambiguous | Data Model |
| P1-11 | Point allows NaN/Infinity | Data Model |
| P1-13 | Selection can't distinguish shape vs connector | Data Model |
| P2-01 | Icon view tab missing | UX |
| P2-02 | Auto-save state machine | UX |
| P2-03 | Export failure UX | UX |
| P2-04 | Pin auto-increment algorithm | UX |
| P2-05 | Generator interaction model | UX |
| P2-06 | Reference image tool flow | UX |
| P2-10 | Overlay layer system | Architecture |
| P2-11 | Multi-select inspector behavior | UX |
| P2-12 | Pin Wizard paste specification | UX |
| P4-01 | Adaptive grid rendering | Canvas |
| P4-02 | Negative coordinates support | Canvas |
| P4-04 | Ghost pins pile up at origin | UX |
| P4-05 | View enablement toggle | UX |
| P4-06 | Schematic auto-layout helper | UX |
| P4-07 | Improved AI prompts | AI |
| P4-08 | AI merge preview/diff | AI |
| P4-11 | Generator plugin architecture | Architecture |
| P4-12 | Reference image rotation calibration | UX |
| P4-13 | Per-view reference images | UX |
| P4-14 | Grid visibility toggle | UX |
| P4-15 | Custom grid spacing | UX |
| P5-04 | Storage quota handling | Reliability |
| P5-06 | Empty part export behavior | Validation |
| P5-07 | Single/zero pin parts | Validation |
| P5-08 | Overlapping connector warning | Validation |
| P5-09 | Text length limits | Validation |
| P5-12 | Undo across views notification | UX |
| P5-15 | Export state snapshot | Reliability |
| P5-19 | Loading/progress states | UX |
| P5-20 | Unsaved changes warning | Reliability |

### 🔵 Nice-to-Have — Post-MVP

| ID | Finding | Section |
|----|---------|---------|
| P3-10 | Text export path vs text toggle | Export |
| P4-09 | Vision upload preprocessing | AI |
| P5-03 | File size limits on upload | Security |
| P5-05 | CORS / Gemini SDK setup | AI |
| P5-10 | Unicode in identifiers | Validation |
| P5-11 | Concurrent tab detection | Reliability |
| P5-13 | Undo stack depth limit | Performance |
| P5-14 | Redo invalidation visualization | UX |
| P5-16 | AI response conflict resolution | AI |

---

*End of Addendum. Combined with the original review, this provides 144 actionable findings for the FZPZ Studio architecture document.*
