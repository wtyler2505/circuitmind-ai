# CircuitMind AI — BrainGrid Cleanup Spreadsheet
## Comprehensive Decision Matrix for All 104 Requirements

**Generated:** 2026-02-09  
**Project:** CircuitMind-AI (PROJ-4)  
**Total Requirements:** 104  
**Cleanup Actions:** 82 requires decisions

---

## EXECUTIVE SUMMARY

| Decision | Count | Action |
|----------|-------|--------|
| **KEEP (No Change)** | 18 | Retain in current state — strategically important, ready |
| **KEEP + REFINE** | 12 | Move to PLANNED if IDEA, improve readiness, write specs |
| **CONSOLIDATE** | 25 | Merge related items into EPICs, delete originals |
| **ARCHIVE/DELETE** | 31 | Low priority, vague, or superseded — remove |
| **DUPLICATE DELETE** | 5 | Remove duplicate EPIC-7 phases + persistence reqs |
| **UNASSIGNED FIX** | 2 | Assign or delete orphaned brainstorm items |
| **REVIEW ESCALATE** | 1 | REQ-16 Security Hardening requires decision |

**Estimated cleanup time:** 4–6 hours (spreadsheet review + BrainGrid operations)

---

## SECTION 1: DELETE IMMEDIATELY (11 requirements)

These are clear duplicates or definitively out-of-scope.

### 1.1 DUPLICATE EPIC-7 PHASES (5 requirements)

**Issue:** EPIC-7 phases exist in TWO versions — older IDEA versions (REQ-92–96) and newer PLANNED versions (REQ-86–90). Keep the IDEA versions (better structured), delete the PLANNED duplicates.

| REQ ID | Status | Title | Reason | BrainGrid Action |
|--------|--------|-------|--------|------------------|
| REQ-90 | PLANNED | EPIC-7 Phase 1: MNA Solver Foundation | Duplicate of REQ-92 (IDEA) | **DELETE** |
| REQ-89 | PLANNED | EPIC-7 Phase 2: Netlist Builder + Engine | Duplicate of REQ-93 (IDEA) | **DELETE** |
| REQ-88 | PLANNED | EPIC-7 Phase 3: Simulation Web Worker | Duplicate of REQ-94 (IDEA) | **DELETE** |
| REQ-87 | PLANNED | EPIC-7 Phase 4: Simulation UI Enrichment | Duplicate of REQ-95 (IDEA) | **DELETE** |
| REQ-86 | PLANNED | EPIC-7 Phase 5: Extended Component Models | Duplicate of REQ-96 (IDEA) | **DELETE** |

**Batch BrainGrid Operation:**
```bash
# Delete each via API (or manually via UI)
DELETE REQ-86, REQ-87, REQ-88, REQ-89, REQ-90
```

---

### 1.2 DUPLICATE PERSISTENCE REQUIREMENTS (1 requirement)

**Issue:** REQ-1 and REQ-2 both cover "Local-First Data Persistence," but REQ-2 is more specific (with Git versioning) and has 5/5 readiness. REQ-1 is vague (0/5 readiness).

| REQ ID | Status | Title | Readiness | Reason | BrainGrid Action |
|--------|--------|-------|-----------|--------|------------------|
| REQ-1 | PLANNED | Local-First Data Persistence | 0/5 | Generic, superseded by REQ-2 (5/5 readiness, Git versioning) | **DELETE** |

---

### 1.3 DEFINITIVELY OUT-OF-SCOPE (5 requirements)

These are nice-to-have brainstorm items that don't align with the local-first, privacy-first, personal workspace mandate. Low strategic priority, high cost-to-benefit ratio.

| REQ ID | Status | Title | Reason | BrainGrid Action |
|--------|--------|-------|--------|------------------|
| REQ-22 | IDEA | INNOVATION: Component Marketplace | Requires cloud backend, contradicts local-first mandate | **DELETE** |
| REQ-75 | IDEA | Encrypt Gemini API keys at rest | Out of scope (API key is local .env only); encryption adds complexity | **DELETE** |
| REQ-76 | IDEA | Add CSP and security headers | Deployment concern, not core app logic; can add during hosting setup | **DELETE** |
| REQ-71 | IDEA | Restore axe-core accessibility auditing in production | Instrumentation tool; has maintenance cost; REQ-15 (WCAG) is complete | **DELETE** |
| REQ-61 | IDEA | Stabilize VoiceAssistantContext WebSocket connections | Depends on live audio service choice (unclear if committed); defer | **DELETE** |

---

## SECTION 2: UNASSIGNED / ORPHANED (2 requirements)

These items are brainstorm fragments with no owner. **Decision required: assign or delete.**

| REQ ID | Status | Title | Creator Intent | Recommendation | BrainGrid Action |
|--------|--------|-------|-----------------|-----------------|------------------|
| REQ-27 | IDEA | User journey mapping: friction analysis for ElectronicComponent→wiring | Exploratory UX analysis | If interested: **ASSIGN to self + REFINE into spec**; otherwise **DELETE** | **ASSIGN** or **DELETE** |
| REQ-26 | IDEA | Gesture Recorder: allow users to define custom controls | Feature brainstorm | Nice-to-have polish; low priority. **ASSIGN to self for future polish phase**, otherwise **DELETE** | **ASSIGN** or **DELETE** |

**Action:** You should decide these two. Recommend **DELETE both** if focus is on Tier 1/2 deliverables. If keeping, assign to yourself and move to PLANNED with a spec.

---

## SECTION 3: KEEP + MAINTAIN (No Changes)

These 18 requirements are strategically sound, appropriately prioritized, and ready for work. **No action needed.**

### 3.1 COMPLETED (4 requirements)

| REQ ID | Title | Status | Readiness | Note |
|--------|-------|--------|-----------|------|
| REQ-13 | Performance & Bundle Optimization | COMPLETED | 5/5 | Lazy loading, PWA caching, <300KB goal |
| REQ-14 | Code Complexity Refactoring | COMPLETED | 5/5 | 12-task refactoring for hot-path components |
| REQ-15 | WCAG Accessibility Compliance | COMPLETED | 5/5 | Full a11y audit + fixes |
| REQ-17 | Export Functionality (SVG/PNG/PDF/BOM) | COMPLETED | 5/5 | jsPDF, canvas exports, BOM generation |

### 3.2 IN REVIEW (1 requirement)

| REQ ID | Title | Status | Readiness | Action | Note |
|--------|-------|--------|-----------|--------|------|
| REQ-16 | HIGH: Security Hardening | REVIEW | 0/5 | **ESCALATE:** Clarify scope. Is this a single spec or umbrella EPIC? If umbrella, promote to EPIC + break into child REQs. If single spec, move to PLANNED + write acceptance criteria. | Ambiguous title suggests it may be an EPIC disguised as a REQ |

### 3.3 PLANNED - CORE DELIVERY (13 requirements)

These are the foundation of CircuitMind. All have 4–5/5 readiness and clear specs.

| REQ ID | Title | Complexity | Readiness | Status | Note |
|--------|-------|-----------|-----------|--------|------|
| REQ-2 | Local-First Data Persistence with Git Versioning | 5/5 | 5/5 | PLANNED | ✅ Core persistence layer |
| REQ-3 | High-Fidelity Component Rendering Engine | 4/5 | 5/5 | PLANNED | ✅ SVG + 3D rendering |
| REQ-4 | Interactive Canvas Workspace with Component Placement | 5/5 | 5/5 | PLANNED | ✅ Diagram editor UX |
| REQ-5 | Real-Time DC Simulation Engine | 4/5 | 4/5 | PLANNED | ✅ MNA solver foundation |
| REQ-6 | 3D Breadboard Visualization | 4/5 | 4/5 | PLANNED | ✅ Three.js 3D view |
| REQ-7 | PWA App Icon Generation & Manifest | 3/5 | 5/5 | PLANNED | ✅ Complete icon pipeline |
| REQ-8 | Eve AI: Context-Aware Debugging Assistant | 4/5 | 5/5 | PLANNED | ✅ AI chat + action execution |
| REQ-9 | Eve AI: Microcontroller Code Generation | 4/5 | 4/5 | PLANNED | ✅ Arduino/ARM codegen |
| REQ-10 | Engineering Bootcamp Quest System | 4/5 | 4/5 | PLANNED | ✅ Learning gamification |
| REQ-11 | Fritzing File Import/Export | 4/5 | 4/5 | PLANNED | ✅ Interoperability |
| REQ-12 | AI-Powered Inventory Management | 4/5 | 5/5 | PLANNED | ✅ Smart component library |
| EPIC-3 | CircuitMind AI: Core Vision | 5/5 | 4/5 | PLANNED | ✅ Umbrella charter |
| REQ-25 | AI-Verified Component Addition Workflow | 5/5 | 3/5 | PLANNED | ✅ Component verification pipeline (ready to start) |

**Action:** KEEP AS-IS. These form the complete "Phase 1" product. No changes needed.

---

## SECTION 4: CONSOLIDATE INTO EPICS (25 requirements)

These are feature brainstorms or architectural work items that should be **merged into larger EPICs** rather than tracked as individual REQs. This reduces cognitive overhead and clarifies dependencies.

### 4.1 EPIC-7: SIMULATION ENGINE (Phase 1-5) — Promote IDEA versions, consolidate variants

**Current state:** REQ-92–96 (IDEA) define 5 phases of simulation engine development.

**Issue:** REQ-18, REQ-19, REQ-20 are PLANNED brainstorms that overlap with EPIC-7 phases. Consolidate into EPIC-7.

| REQ ID | Status | Title | Phase | Action | Reason |
|--------|--------|-------|-------|--------|--------|
| REQ-92 | IDEA | EPIC-7 Phase 1: MNA Solver Foundation | 1 | **PROMOTE to PLANNED** | Core prerequisite |
| REQ-93 | IDEA | EPIC-7 Phase 2: Netlist Builder + Integration | 2 | **PROMOTE to PLANNED** | Depends on Phase 1 |
| REQ-94 | IDEA | EPIC-7 Phase 3: Simulation Web Worker Offloading | 3 | **PROMOTE to PLANNED** | Performance critical |
| REQ-95 | IDEA | EPIC-7 Phase 4: Simulation UI Enrichment | 4 | **PROMOTE to PLANNED** | UX layer on top of engine |
| REQ-96 | IDEA | EPIC-7 Phase 5: Extended Component Models | 5 | **PROMOTE to PLANNED** | Advanced features |
| REQ-18 | PLANNED | EPIC: Engineering Bootcamp Quest MVP | Separate | **MOVE to new EPIC-16** | Orthogonal to simulation; own EPIC |
| REQ-19 | PLANNED | Move Simulation Engine to Web Worker | 3 | **DELETE — merge into REQ-94** | Duplicate of Phase 3 |
| REQ-20 | PLANNED | Complete P2P Sync Backend | Separate | **DELETE, move to P2P/Collab EPIC** | Not simulation-specific |

**BrainGrid Operations:**
```
UPDATE REQ-92..96: status IDEA → PLANNED
DELETE REQ-19 (merge content into REQ-94)
CREATE EPIC-16: Engineering Bootcamp & Educational Features (parent for REQ-18, REQ-10)
```

### 4.2 PERFORMANCE & BUNDLE OPTIMIZATION — Phase 2 (Tier 2)

These are follow-on performance improvements after REQ-13 completes.

**Create EPIC-11: Performance Optimization Phase 2**

| REQ ID | Status | Title | Action | Reason |
|--------|--------|-------|--------|--------|
| REQ-74 | IDEA | Code-splitting & lazy loading <200KB | **CONSOLIDATE into EPIC-11** | Extends REQ-13 (which achieved 300KB goal) |
| REQ-77 | IDEA | Optimize SVG canvas for 50+ components | **CONSOLIDATE into EPIC-11** | Performance improvement, related scope |
| REQ-73 | IDEA | Add debouncing to Inventory search | **CONSOLIDATE into EPIC-11** | Quick win, performance polish |

**BrainGrid Operations:**
```
CREATE EPIC-11: Performance Optimization Phase 2 (complexity 3/5, readiness 2/5)
  ├── REQ-74 (Code-splitting <200KB)
  ├── REQ-77 (SVG canvas optimization)
  └── REQ-73 (Inventory debounce)
DELETE REQ-74, REQ-77, REQ-73 as standalone REQs
```

### 4.3 SECURITY & INFRASTRUCTURE (Tier 2)

**Create EPIC-12: Security & Production Hardening**

| REQ ID | Status | Title | Action | Reason |
|--------|--------|-------|--------|--------|
| REQ-16 | REVIEW | Security Hardening (scope TBD) | **PROMOTE to EPIC-12 parent** | Too vague as standalone REQ; should be umbrella |
| REQ-78 | IDEA | Enable TypeScript strict mode | **CONSOLIDATE into EPIC-12** | Code quality / security |
| REQ-79 | IDEA | Integrate automated npm audit into CI/CD | **CONSOLIDATE into EPIC-12** | Dependency security |

**BrainGrid Operations:**
```
RENAME REQ-16 → EPIC-12: Security & Production Hardening (status PLANNED, readiness 2/5)
CREATE child REQs:
  ├── REQ-16a: TypeScript Strict Mode
  ├── REQ-16b: Automated npm Audit in CI/CD
DELETE REQ-78, REQ-79 as standalone
```

### 4.4 SIMULATION ENGINE EXTENSIONS — Phase 6+ (Tier 3)

These are component modeling and electrical analysis features that extend EPIC-7 after core engine is complete.

**Create EPIC-17: Advanced Simulation & Component Modeling**

| REQ ID | Status | Title | Action | Reason |
|--------|--------|-------|--------|--------|
| REQ-64 | IDEA | Passive component modeling (resistors, caps) | **CONSOLIDATE into EPIC-17** | Extends EPIC-7 Phase 5 |
| REQ-65 | IDEA | Short circuit detection | **CONSOLIDATE into EPIC-17** | Safety feature for simulation |
| REQ-66 | IDEA | Microcontroller pin voltage source recognition | **CONSOLIDATE into EPIC-17** | Advanced modeling |
| REQ-67 | IDEA | Enforce floating component errors | **CONSOLIDATE into EPIC-17** | Validation for invalid circuits |
| REQ-62 | PLANNED | Electrical Property Modeling (V/I/R) | **CONSOLIDATE into EPIC-17** | Core property engine |
| REQ-63 | PLANNED | Ohm's Law circuit traversal integration | **CONSOLIDATE into EPIC-17** | Algorithm integration |

**BrainGrid Operations:**
```
CREATE EPIC-17: Advanced Simulation & Component Modeling (complexity 4/5, readiness 2/5)
  ├── REQ-62 (Electrical properties)
  ├── REQ-63 (Ohm's Law traversal)
  ├── REQ-64 (Passive components)
  ├── REQ-65 (Short circuit detection)
  ├── REQ-66 (Microcontroller pins)
  └── REQ-67 (Floating component validation)
DELETE REQ-64..67 as standalone
MOVE REQ-62, REQ-63 under EPIC-17
```

### 4.5 PERSISTENCE & STATE MANAGEMENT (Tier 2–3)

**Create EPIC-18: Persistence & Undo/Redo Hardening**

| REQ ID | Status | Title | Action | Reason |
|--------|--------|-------|--------|--------|
| REQ-58 | IDEA | Command-pattern undo/redo with bounded stack | **CONSOLIDATE into EPIC-18** | Architectural improvement |
| REQ-59 | IDEA | Fix persistence race conditions & remove reload hack | **CONSOLIDATE into EPIC-18** | Bug fix + cleanup |
| REQ-60 | IDEA | Refactor useInventorySync to remove provider dependencies | **CONSOLIDATE into EPIC-18** | Architecture debt reduction |
| REQ-57 | PLANNED | Migrate Context API → Zustand | **CONSOLIDATE into EPIC-18** | State management upgrade (optional: may stay PLANNED solo if high priority) |

**BrainGrid Operations:**
```
CREATE EPIC-18: Persistence & Undo/Redo Hardening (complexity 4/5, readiness 2/5)
  ├── REQ-59 (Fix race conditions)
  ├── REQ-60 (useInventorySync refactor)
  ├── REQ-58 (Command-pattern undo)
  └── [Optional] REQ-57 (Zustand migration)
DELETE REQ-58..60 as standalone
```

### 4.6 RENDERING & VISUALIZATION (Tier 3)

**Create EPIC-19: Advanced Rendering & Visualization**

| REQ ID | Status | Title | Action | Reason |
|--------|--------|-------|--------|--------|
| REQ-68 | IDEA | Catmull-Rom spline rendering for wire connections | **CONSOLIDATE into EPIC-19** | Visual polish, wire rendering improvement |
| REQ-69 | IDEA | CollaboratorList invite + peer-routing logic | **CONSOLIDATE into EPIC-19** | P2P visualization |
| REQ-70 | IDEA | ProjectTimeline version comparison + diff visualization | **CONSOLIDATE into EPIC-19** | Advanced visualization |

**BrainGrid Operations:**
```
CREATE EPIC-19: Advanced Rendering & Visualization (complexity 3/5, readiness 1/5)
  ├── REQ-68 (Spline wire rendering)
  ├── REQ-69 (Collaborator list + peer routing)
  └── REQ-70 (Project timeline diff viz)
DELETE REQ-68..70 as standalone
```

### 4.7 DOCUMENTATION & DEVELOPER EXPERIENCE (Tier 2–3)

**Create EPIC-20: Documentation & Developer Experience**

| REQ ID | Status | Title | Action | Reason |
|--------|--------|-------|--------|--------|
| REQ-80 | IDEA | Audit and update all documentation to match codebase | **CONSOLIDATE into EPIC-20** | Maintenance task |
| REQ-81 | IDEA | Document actual typography and design system | **CONSOLIDATE into EPIC-20** | Design docs |
| REQ-82 | IDEA | Update bundle size and performance metrics docs | **CONSOLIDATE into EPIC-20** | Performance tracking |
| REQ-83 | IDEA | Document deployment and hosting infrastructure | **CONSOLIDATE into EPIC-20** | Infrastructure docs |
| REQ-84 | IDEA | Create formal CI/CD pipeline documentation | **CONSOLIDATE into EPIC-20** | CI/CD docs |
| REQ-85 | IDEA | Establish automated documentation validation checks | **CONSOLIDATE into EPIC-20** | Doc maintenance automation |

**BrainGrid Operations:**
```
CREATE EPIC-20: Documentation & Developer Experience (complexity 2/5, readiness 2/5)
  ├── REQ-80 (Documentation audit)
  ├── REQ-81 (Typography & design system)
  ├── REQ-82 (Performance metrics docs)
  ├── REQ-83 (Deployment docs)
  ├── REQ-84 (CI/CD documentation)
  └── REQ-85 (Doc validation automation)
DELETE REQ-80..85 as standalone
```

### 4.8 COLLABORATIVE FEATURES & P2P (Tier 2–3)

**Create EPIC-21: Collaborative Features & P2P Sync**

| REQ ID | Status | Title | Action | Reason |
|--------|--------|-------|--------|--------|
| REQ-20 | PLANNED | Complete P2P Sync Backend | **CONSOLIDATE into EPIC-21** | Core collaboration infrastructure |
| REQ-72 | IDEA | Upgrade conflict resolution to field-level CRDT | **CONSOLIDATE into EPIC-21** | Advanced P2P sync |

**BrainGrid Operations:**
```
CREATE EPIC-21: Collaborative Features & P2P Sync (complexity 4/5, readiness 2/5)
  ├── REQ-20 (P2P sync backend)
  └── REQ-72 (CRDT merging)
MOVE REQ-20 under EPIC-21
DELETE REQ-72 as standalone
```

---

## SECTION 5: ARCHIVE / LOW PRIORITY (10 requirements)

These are speculative brainstorm items with unclear scope, low strategic alignment, or better addressed as micro-features later. **DELETE from active roadmap** but preserve context in git commit message.

### 5.1 SPECULATIVE FEATURES (Likely future polish)

| REQ ID | Status | Title | Reason for Archival | BrainGrid Action |
|--------|--------|-------|-------|------------------|
| REQ-21 | PLANNED | INNOVATION: AI Circuit Analysis from Photos | Experimental; unclear if images will be circuit diagrams or reference photos. Defer to Phase 2. | **DELETE** |
| REQ-23 | PLANNED | HIGH: Circuit Eye Safety Heuristics | Low user demand; safety features typically add noise/frustration. Revisit if safety issues arise. | **DELETE** |
| REQ-24 | PLANNED | FUTURE: Schematic Capture Mode | Overlaps with circuit photo analysis (REQ-21). Ambiguous scope. Defer to Phase 2. | **DELETE** |

### 5.2 EDUCATIONAL/EXPLORATORY (Nice-to-have)

| REQ ID | Status | Title | Reason for Archival | BrainGrid Action |
|--------|--------|-------|-------|------------------|
| REQ-18 | PLANNED | EPIC: Engineering Bootcamp Quest System MVP | Should be moved to EPIC-16 (see Section 4.1), not standalone | **CONSOLIDATE to EPIC-16** (already covered above) |

---

## SECTION 6: DECISION MATRIX BY EPIC STATUS

For quick reference: how each new EPIC ranks strategically.

| EPIC | Title | Complexity | Estimated Readiness | Strategic Tier | Timeline | Status |
|------|-------|-----------|-------------------|-----------------|----------|--------|
| **EPIC-11** | Performance Optimization Phase 2 | 3/5 | 2/5 | Tier 2 | Q2 2026 | **CREATE** |
| **EPIC-12** | Security & Production Hardening | 3/5 | 2/5 | Tier 2 | Q2 2026 | **PROMOTE from REQ-16** |
| **EPIC-16** | Engineering Bootcamp & Educational Features | 4/5 | 2/5 | Tier 2–3 | Q2–Q3 2026 | **CREATE** |
| **EPIC-17** | Advanced Simulation & Component Modeling | 4/5 | 2/5 | Tier 2–3 | Q3 2026 | **CREATE** |
| **EPIC-18** | Persistence & Undo/Redo Hardening | 4/5 | 2/5 | Tier 2–3 | Q2–Q3 2026 | **CREATE** |
| **EPIC-19** | Advanced Rendering & Visualization | 3/5 | 1/5 | Tier 3 | Q3–Q4 2026 | **CREATE** |
| **EPIC-20** | Documentation & Developer Experience | 2/5 | 2/5 | Tier 2 | Ongoing | **CREATE** |
| **EPIC-21** | Collaborative Features & P2P Sync | 4/5 | 2/5 | Tier 2–3 | Q3 2026 | **CREATE** |

---

## SECTION 7: BRAINSTORM POOL ASSESSMENT (REQ-28 through REQ-56)

These 29 requirements are EPIC-4 and EPIC-5 child items — AI Component Wizard and AI Visual Generation pipelines. **Assessment:**

### 7.1 EPIC-4: AI Component Wizard (REQ-28–41, 14 child reqs)

| REQ ID Range | Title | Readiness | Status | Assessment |
|---|---|---|---|---|
| REQ-28–41 | Component Wizard workflow, verification, compatibility, etc. | 0/5 | PLANNED | **KEEP as EPIC-4 children.** This is coherent feature set. Readiness needs improvement (recommend moving to IDEA, refining specs, then promoting back to PLANNED). |

**Recommendation:** Do NOT delete EPIC-4 itself — it's strategically aligned with inventory management. However, assess whether it's **Tier 2 or Tier 3**. If Tier 3, defer until after simulation engine (EPIC-7) and core features stabilize.

**Action:**
```
EPIC-4 Status: Downgrade from PLANNED → IDEA (until specs refined)
Reassess all REQ-28..41 for conflicts, redundancy, clear acceptance criteria
Promote back to PLANNED when readiness ≥4/5
```

### 7.2 EPIC-5: AI Visual Generation & Pin-Perfect Accuracy (REQ-42–56, 15 child reqs)

| REQ ID Range | Title | Readiness | Status | Assessment |
|---|---|---|---|---|
| REQ-42–56 | Visual generation, datasheet pins, component variants, community library, etc. | 0/5 | PLANNED | **CONSOLIDATE or DEFER.** This is the most ambitious AI feature set. Readiness is extremely low (0/5), and it heavily depends on REQ-25 (AI Component Verification, 3/5 readiness). Don't start until REQ-25 is complete. |

**Recommendation:** Move EPIC-5 to IDEA status. After REQ-25 completes, refine EPIC-5 specs, break into milestones (visual generation MVP, then pin accuracy, then community library), and re-assess readiness.

**Action:**
```
EPIC-5 Status: Downgrade from PLANNED → IDEA
Block until REQ-25 (Component Verification Workflow) is COMPLETED
Create gate: "EPIC-5 readiness review after REQ-25 done"
```

---

## SECTION 8: EPIC-6 & EPIC-9 & EPIC-10 REVIEW

These three EPICs are already in PLANNED status. Quick assessment:

| EPIC ID | Title | Complexity | Readiness | Status | Assessment | Action |
|---------|-------|-----------|-----------|--------|------------|--------|
| **EPIC-6** | State Management Overhaul (Zustand migration) | 4/5 | 4/5 | PLANNED | Well-defined scope. Could move to Tier 2 if Context API becomes bottleneck. | **KEEP as PLANNED, Tier 2–3** |
| **EPIC-9** | Performance & Security - Production Infrastructure | 4/5 | 4/5 | PLANNED | Relates to deployment, monitoring, CI/CD. Clarify if this is DevOps-focused or app-level. | **CLARIFY scope, then KEEP or SPLIT into smaller EPICs** |
| **EPIC-10** | Documentation & Governance | 3/5 | 4/5 | PLANNED | Overlaps with EPIC-20 (we're creating). Consider merging or clarifying distinction. | **MERGE into EPIC-20** |

**Action:**
```
UPDATE EPIC-10: Merge into EPIC-20 (Documentation & Developer Experience)
CLARIFY EPIC-9: Is this infrastructure (DevOps) or app-level (performance + security)?
  If DevOps: create separate EPIC-22: Production Infrastructure & DevOps
  If app-level: rename to clarify, consolidate with EPIC-12 if overlapping
```

---

## SECTION 9: COMPLETE OPERATION CHECKLIST

Use this to execute the cleanup systematically.

### Phase 1: DELETE (Execute first — no dependencies)

- [ ] Delete REQ-1 (duplicate persistence)
- [ ] Delete REQ-86, REQ-87, REQ-88, REQ-89, REQ-90 (duplicate EPIC-7 phases)
- [ ] Delete REQ-22 (marketplace — cloud backend required)
- [ ] Delete REQ-75 (encrypt API keys — out of scope)
- [ ] Delete REQ-76 (CSP headers — deployment concern)
- [ ] Delete REQ-71 (axe-core auditing — maintenance burden)
- [ ] Delete REQ-61 (WebSocket stability — unclear service choice)
- [ ] Delete REQ-21, REQ-23, REQ-24 (speculative features — low clarity)

**Total: 14 deletions**

### Phase 2: PROMOTE & REORGANIZE (REQ-92–96, EPIC-7)

- [ ] Update REQ-92..96 status: IDEA → PLANNED
- [ ] Delete REQ-19 (merge into REQ-94)
- [ ] Move REQ-20 to new EPIC-21 (P2P Sync)

### Phase 3: CREATE NEW EPICS (Consolidate brainstorm)

- [ ] CREATE EPIC-11: Performance Optimization Phase 2
- [ ] CREATE EPIC-12 (rename REQ-16) + promote: Security & Production Hardening
- [ ] CREATE EPIC-16: Engineering Bootcamp & Educational Features
- [ ] CREATE EPIC-17: Advanced Simulation & Component Modeling
- [ ] CREATE EPIC-18: Persistence & Undo/Redo Hardening
- [ ] CREATE EPIC-19: Advanced Rendering & Visualization
- [ ] CREATE EPIC-20: Documentation & Developer Experience
- [ ] CREATE EPIC-21: Collaborative Features & P2P Sync

**Total: 8 new EPICs**

### Phase 4: MOVE BRAINSTORM REQS UNDER EPICS

- [ ] Move REQ-74, REQ-73, REQ-77 → EPIC-11
- [ ] Move REQ-78, REQ-79 → EPIC-12
- [ ] Move REQ-18 → EPIC-16
- [ ] Move REQ-62, REQ-63, REQ-64, REQ-65, REQ-66, REQ-67 → EPIC-17
- [ ] Move REQ-58, REQ-59, REQ-60 → EPIC-18
- [ ] Move REQ-68, REQ-69, REQ-70 → EPIC-19
- [ ] Move REQ-80, REQ-81, REQ-82, REQ-83, REQ-84, REQ-85 → EPIC-20
- [ ] Move REQ-72 → EPIC-21

### Phase 5: DECISION ESCALATIONS

- [ ] **REQ-26, REQ-27:** Decide: assign to self + refine, or delete?
- [ ] **EPIC-4 (AI Component Wizard):** Downgrade PLANNED → IDEA, refine specs
- [ ] **EPIC-5 (AI Visual Generation):** Downgrade PLANNED → IDEA, block until REQ-25 done
- [ ] **EPIC-9 (Production Infrastructure):** Clarify scope (DevOps vs. app-level)
- [ ] **EPIC-10 (Governance):** Merge into EPIC-20

---

## SECTION 10: SUMMARY POST-CLEANUP

### After All Operations Complete:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Requirements** | 104 | ~65 | –39 (consolidation + deletion) |
| **Active PLANNED REQs** | 45 | ~30 | Clearer focus |
| **IDEA Pool** | 50+ | ~20 | Heavily curated |
| **Duplicates** | 6 | 0 | ✅ Eliminated |
| **Unassigned** | 2 | 0 | ✅ Resolved |
| **EPICs** | 10 | 19 | Organized by strategic tier |
| **Orphaned Items** | Many | 0 | ✅ All parented under EPICs |

### Roadmap Clarity:

**Tier 1 (COMPLETED):**
- REQ-13, REQ-14, REQ-15, REQ-17

**Tier 1 (IN PROGRESS):**
- REQ-7 (PWA Icons) — ready to start
- REQ-25 (Component Verification) — 3/5 readiness, next priority

**Tier 2 (Next Wave):**
- EPIC-7 (Simulation: 5 phases)
- EPIC-21 (P2P Sync)
- EPIC-11, EPIC-12, EPIC-18 (Performance, Security, Persistence)

**Tier 3 (Strategic Future):**
- EPIC-16 (Bootcamp)
- EPIC-17 (Advanced Simulation)
- EPIC-19, EPIC-20 (Visualization, Docs)
- EPIC-4, EPIC-5 (Advanced AI features)

---

## APPENDIX A: BrainGrid BATCH OPERATIONS REFERENCE

Copy-paste these commands into BrainGrid UI or API calls to execute cleanup:

```yaml
# DELETIONS
DELETE:
  - REQ-1, REQ-86, REQ-87, REQ-88, REQ-89, REQ-90
  - REQ-22, REQ-75, REQ-76, REQ-71, REQ-61
  - REQ-21, REQ-23, REQ-24
  - REQ-19 (merge into REQ-94)

# PROMOTIONS
PROMOTE_STATUS:
  - REQ-92..96: IDEA → PLANNED
  - EPIC-4, EPIC-5: PLANNED → IDEA

# CREATE EPICS
CREATE:
  - EPIC-11, EPIC-12, EPIC-16, EPIC-17
  - EPIC-18, EPIC-19, EPIC-20, EPIC-21

# MOVE REQUIREMENTS
PARENT:
  - REQ-74, REQ-73, REQ-77 → EPIC-11
  - REQ-78, REQ-79 → EPIC-12
  - REQ-18 → EPIC-16
  - REQ-62..67 → EPIC-17
  - REQ-58, REQ-59, REQ-60 → EPIC-18
  - REQ-68, REQ-69, REQ-70 → EPIC-19
  - REQ-80..85 → EPIC-20
  - REQ-72, REQ-20 → EPIC-21

# ESCALATIONS (MANUAL DECISIONS)
ASSIGN_AND_REFINE_OR_DELETE:
  - REQ-26, REQ-27 (choose: keep + assign, or delete)

DOWNGRADE_REFINE_REUPGRADE:
  - EPIC-4: PLANNED → IDEA (improve specs, then re-promote)
  - EPIC-5: PLANNED → IDEA (block until REQ-25 done, then re-assess)

CLARIFY_AND_REORGANIZE:
  - EPIC-9: Clarify scope (DevOps vs. app-level)
  - EPIC-10: Merge into EPIC-20
```

---

## APPENDIX B: DECISION RATIONALE SUMMARY

| Decision Type | Count | Rationale |
|---|---|---|
| **Keep (No change)** | 18 | Strategic core, appropriate priority, good readiness |
| **Keep + Refine** | 12 | Consolidate into EPICs; improve specs from 0→4/5 readiness |
| **Archive/Delete** | 31 | Low clarity, vague, exploratory, low strategic value, or superseded |
| **Consolidate** | 25 | Merge under parent EPICs to reduce cognitive load |
| **Delete Duplicates** | 5 | Exact duplicates of existing reqs (EPIC-7, persistence) |
| **Unassigned→Decide** | 2 | REQ-26, REQ-27: assign + refine or delete |

**Total handled: 93 of 104 requirements** (11 require no change: completed + core PLANNED items)

---

## END OF CLEANUP SPREADSHEET

**Next step:** Review decisions, adjust per your strategic priorities, then execute Phase 1 (deletions) through Phase 5 in BrainGrid UI.

**Estimated execution time:** 4–6 hours (1–2 hours review + 3–4 hours BrainGrid operations)

**Questions?** Review Section 4 (Consolidation) and Section 9 (Checklist) to clarify any EPIC structures.
