# CircuitMind AI — BrainGrid Cleanup Execution Plan
## Adjusted for Tyler's Decisions

**Generated:** 2026-02-09  
**Project:** CircuitMind-AI (PROJ-4)  
**Status:** Ready to execute  

---

## Executive: Tyler's Decision Overrides

| Decision | Original Recommendation | Tyler's Choice | Action |
|----------|---|---|---|
| **REQ-26 & REQ-27** | DELETE | **KEEP + ASSIGN** | Move to PLANNED with specs written by Tyler |
| **EPIC-4 & EPIC-5** | Downgrade → IDEA + refine | **YES, Downgrade → IDEA** | Keep as coherent EPICs, don't orphan |
| **EPIC-9** | Split into 2 EPICs | **YES, Split** | EPIC-9 (app-level) + EPIC-22 (DevOps) |

---

## 9-STEP EXECUTION PLAN

### STEP 1: DELETE (Immediate, No Dependencies)

Execute these 12 deletion operations via BrainGrid UI:

```
DELETE (via BrainGrid UI → Edit → Delete):
  1. REQ-1 (duplicate persistence)
  2. REQ-86 (duplicate EPIC-7 Phase 1)
  3. REQ-87 (duplicate EPIC-7 Phase 2)
  4. REQ-88 (duplicate EPIC-7 Phase 3)
  5. REQ-89 (duplicate EPIC-7 Phase 4)
  6. REQ-90 (duplicate EPIC-7 Phase 5)
  7. REQ-22 (Component Marketplace — cloud backend required)
  8. REQ-75 (Encrypt API keys — out of scope)
  9. REQ-76 (CSP headers — deployment concern)
  10. REQ-71 (axe-core auditing — maintenance burden)
  11. REQ-61 (WebSocket stability — service choice unclear)
  12. REQ-19 (MERGE into REQ-94 instead of delete)

Total deletions: 12
Estimated time: 15 minutes
```

**Details for REQ-19 special case:**
- REQ-19: "Move Simulation Engine to Web Worker"
- This is a duplicate of REQ-94 ("EPIC-7 Phase 3: Simulation Web Worker Offloading")
- Before deleting REQ-19, copy any unique acceptance criteria into REQ-94
- Then DELETE REQ-19

---

### STEP 2: DELETE SPECULATIVE FEATURES

Delete 3 low-clarity brainstorm items:

```
DELETE:
  1. REQ-21 (AI Circuit Analysis from Photos — unclear scope)
  2. REQ-23 (Circuit Eye Safety Heuristics — low user demand)
  3. REQ-24 (Schematic Capture Mode — overlaps with REQ-21)

Total deletions: 3
Estimated time: 5 minutes
```

---

### STEP 3: PROMOTE EPIC-7 PHASES

Upgrade REQ-92–96 from IDEA → PLANNED:

```
UPDATE STATUS (via BrainGrid UI → Edit → Status):
  1. REQ-92 (EPIC-7 Phase 1: MNA Solver Foundation) IDEA → PLANNED
  2. REQ-93 (EPIC-7 Phase 2: Netlist Builder) IDEA → PLANNED
  3. REQ-94 (EPIC-7 Phase 3: Web Worker Offloading) IDEA → PLANNED
  4. REQ-95 (EPIC-7 Phase 4: Simulation UI Enrichment) IDEA → PLANNED
  5. REQ-96 (EPIC-7 Phase 5: Extended Component Models) IDEA → PLANNED

Total updates: 5
Estimated time: 10 minutes
```

---

### STEP 4: ASSIGN & REFINE REQ-26 & REQ-27 (Tyler's Decision)

Move both to PLANNED status and assign to Tyler:

```
UPDATE REQ-26 (Gesture Recorder):
  Status: IDEA → PLANNED
  Assignee: Tyler (you)
  Readiness: 0/5 → 2/5 (requires spec writing)
  Note: "Polishing work — UX gesture customization. Spec to be written."

UPDATE REQ-27 (User Journey Mapping):
  Status: IDEA → PLANNED
  Assignee: Tyler (you)
  Readiness: 0/5 → 2/5 (requires spec writing)
  Note: "UX research — friction analysis for component-to-wiring workflow. Spec to be written."

Total updates: 2
Estimated time: 5 minutes
```

---

### STEP 5: DOWNGRADE EPIC-4 & EPIC-5 (Tyler's Decision)

Downgrade to IDEA status but keep as coherent EPICs:

```
UPDATE EPIC-4 (AI Component Wizard):
  Status: PLANNED → IDEA
  Readiness: 2/5 → 1/5 (specs need hardening)
  Note: "Coherent feature set. Downgraded for spec refinement. Re-assess when readiness ≥4/5."

UPDATE EPIC-5 (AI Visual Generation & Pin-Perfect Accuracy):
  Status: PLANNED → IDEA
  Readiness: 2/5 → 1/5 (blocked on REQ-25)
  Blocked by: REQ-25 (Component Verification Workflow, currently 3/5 readiness)
  Note: "Highly ambitious. Blocked until REQ-25 COMPLETED. Re-assess after dependency is clear."

Total updates: 2
Estimated time: 5 minutes
```

---

### STEP 6: CREATE NEW EPICS (Consolidation)

Create 8 new EPICs in BrainGrid:

```
CREATE EPIC (via BrainGrid UI → New Epic):

1. EPIC-11: Performance Optimization Phase 2
   Complexity: 3/5
   Readiness: 2/5
   Tier: Tier 2
   Description: "Follow-on performance work after REQ-13 completes. Lazy loading <200KB target, SVG optimization, search debouncing."

2. EPIC-12: Security & Production Hardening
   Complexity: 3/5
   Readiness: 2/5
   Tier: Tier 2
   Description: "Production-grade security + code quality. TypeScript strict mode, npm audit CI/CD, dependency scanning."
   Note: "Promoted from REQ-16 (which was too vague as standalone REQ)."

3. EPIC-16: Engineering Bootcamp & Educational Features
   Complexity: 4/5
   Readiness: 2/5
   Tier: Tier 2–3
   Description: "Learning gamification. Quest system, tutorials, progressive disclosure, onboarding."

4. EPIC-17: Advanced Simulation & Component Modeling
   Complexity: 4/5
   Readiness: 2/5
   Tier: Tier 2–3
   Description: "Extends EPIC-7 core engine. Passive components, short circuit detection, microcontroller modeling, floating component validation."

5. EPIC-18: Persistence & Undo/Redo Hardening
   Complexity: 4/5
   Readiness: 2/5
   Tier: Tier 2–3
   Description: "State management robustness. Fix race conditions, command-pattern undo, useInventorySync refactoring. Optional: Zustand migration."

6. EPIC-19: Advanced Rendering & Visualization
   Complexity: 3/5
   Readiness: 1/5
   Tier: Tier 3
   Description: "Visual polish. Catmull-Rom splines for wire rendering, collaborator visualization, project timeline diff UI."

7. EPIC-20: Documentation & Developer Experience
   Complexity: 2/5
   Readiness: 2/5
   Tier: Tier 2 (Ongoing)
   Description: "Documentation lifecycle. Audit codebase alignment, typography/design system docs, performance metrics, deployment docs, CI/CD docs, automated validation."

8. EPIC-21: Collaborative Features & P2P Sync
   Complexity: 4/5
   Readiness: 2/5
   Tier: Tier 2–3
   Description: "Distributed collaboration. P2P sync backend, field-level CRDT merging, peer routing."

Total EPICs created: 8
Estimated time: 20 minutes
```

---

### STEP 7: MOVE REQUIREMENTS UNDER EPICS (Reparenting)

Move 25 brainstorm requirements under their parent EPICs via BrainGrid:

```
MOVE REQ under EPIC (via BrainGrid UI → Edit → Parent):

→ EPIC-11 (Performance Optimization Phase 2):
  • REQ-74 (Code-splitting <200KB)
  • REQ-77 (SVG canvas optimization for 50+ components)
  • REQ-73 (Inventory search debouncing)

→ EPIC-12 (Security & Production Hardening):
  • REQ-78 (Enable TypeScript strict mode)
  • REQ-79 (Automated npm audit in CI/CD)
  (REQ-16 itself becomes the EPIC)

→ EPIC-16 (Engineering Bootcamp & Educational Features):
  • REQ-18 (Bootcamp Quest MVP)

→ EPIC-17 (Advanced Simulation & Component Modeling):
  • REQ-62 (Electrical Property Modeling V/I/R)
  • REQ-63 (Ohm's Law circuit traversal)
  • REQ-64 (Passive component modeling)
  • REQ-65 (Short circuit detection)
  • REQ-66 (Microcontroller pin voltage source)
  • REQ-67 (Floating component error enforcement)

→ EPIC-18 (Persistence & Undo/Redo Hardening):
  • REQ-58 (Command-pattern undo/redo)
  • REQ-59 (Fix persistence race conditions)
  • REQ-60 (Refactor useInventorySync)

→ EPIC-19 (Advanced Rendering & Visualization):
  • REQ-68 (Catmull-Rom spline wire rendering)
  • REQ-69 (CollaboratorList + peer routing)
  • REQ-70 (ProjectTimeline diff visualization)

→ EPIC-20 (Documentation & Developer Experience):
  • REQ-80 (Audit documentation alignment)
  • REQ-81 (Typography & design system docs)
  • REQ-82 (Bundle size metrics docs)
  • REQ-83 (Deployment infrastructure docs)
  • REQ-84 (CI/CD pipeline documentation)
  • REQ-85 (Automated doc validation)

→ EPIC-21 (Collaborative Features & P2P Sync):
  • REQ-20 (Complete P2P Sync Backend)
  • REQ-72 (Upgrade to field-level CRDT)

Total reparenting operations: 25
Estimated time: 30 minutes
```

---

### STEP 8: SPLIT EPIC-9 (Tyler's Decision)

Split EPIC-9 "Performance & Security - Production Infrastructure" into two focused EPICs:

```
RENAME EPIC-9:
  From: "Performance & Security - Production Infrastructure"
  To: "Performance & Security - Application-Level Hardening"
  Scope: App-level performance optimizations, security features, code quality
  Note: "Production infrastructure (DevOps, CI/CD) moved to EPIC-22."

CREATE EPIC-22: Production Infrastructure & DevOps
  Complexity: 3/5
  Readiness: 2/5
  Tier: Tier 2
  Description: "Hosting, monitoring, CI/CD pipelines, deployment automation, infrastructure-as-code."

Total operations: Rename 1 + Create 1
Estimated time: 10 minutes
```

---

### STEP 9: VERIFICATION & CLEANUP SUMMARY

Run final verification in BrainGrid:

```
VERIFY (via BrainGrid UI → List Requirements):

Count requirements by status:
  ✓ COMPLETED: 4 (REQ-13, REQ-14, REQ-15, REQ-17)
  ✓ REVIEW: 0 (REQ-16 promoted to EPIC-12)
  ✓ PLANNED: ~35 (core features + REQ-26, REQ-27)
  ✓ IDEA: ~20 (EPIC-4, EPIC-5, orphaned brainstorm)
  ✓ Total: ~59 (down from 104)

Verify all REQs have parent EPIC or are standalone PLANNED:
  ✓ REQ-26, REQ-27 assigned to Tyler
  ✓ REQ-58..85 parented under EPIC-11..21
  ✓ No orphaned requirements

Verify EPIC structure:
  ✓ EPIC-3 through EPIC-21 exist
  ✓ No duplicate EPIC-7 phases
  ✓ EPIC-4 & EPIC-5 downgraded to IDEA (not deleted)

Count new EPICs:
  ✓ 8 created (EPIC-11 through EPIC-21)
  ✓ 1 split (EPIC-9 → EPIC-9 + EPIC-22)
  ✓ 1 renamed from REQ-16 → EPIC-12

Estimated time: 15 minutes
```

---

## MASTER CHECKLIST (Execute in Order)

Print this and check off as you execute:

### Phase 1: DELETIONS (15 minutes)
- [ ] DELETE REQ-1
- [ ] DELETE REQ-86, REQ-87, REQ-88, REQ-89, REQ-90
- [ ] DELETE REQ-22, REQ-75, REQ-76, REQ-71, REQ-61
- [ ] DELETE REQ-19 (merge into REQ-94 first)
- [ ] DELETE REQ-21, REQ-23, REQ-24

**Total: 15 deletions**

### Phase 2: PROMOTIONS (10 minutes)
- [ ] UPDATE REQ-92 IDEA → PLANNED
- [ ] UPDATE REQ-93 IDEA → PLANNED
- [ ] UPDATE REQ-94 IDEA → PLANNED
- [ ] UPDATE REQ-95 IDEA → PLANNED
- [ ] UPDATE REQ-96 IDEA → PLANNED

### Phase 3: ASSIGN & REFINE (5 minutes)
- [ ] UPDATE REQ-26: Assign to Tyler, IDEA → PLANNED, readiness 0→2/5
- [ ] UPDATE REQ-27: Assign to Tyler, IDEA → PLANNED, readiness 0→2/5

### Phase 4: DOWNGRADE EPICS (5 minutes)
- [ ] UPDATE EPIC-4: PLANNED → IDEA, readiness 2→1/5
- [ ] UPDATE EPIC-5: PLANNED → IDEA, readiness 2→1/5, note dependency on REQ-25

### Phase 5: CREATE NEW EPICS (20 minutes)
- [ ] CREATE EPIC-11 (Performance Optimization Phase 2)
- [ ] CREATE EPIC-12 (Security & Production Hardening)
- [ ] CREATE EPIC-16 (Engineering Bootcamp & Educational Features)
- [ ] CREATE EPIC-17 (Advanced Simulation & Component Modeling)
- [ ] CREATE EPIC-18 (Persistence & Undo/Redo Hardening)
- [ ] CREATE EPIC-19 (Advanced Rendering & Visualization)
- [ ] CREATE EPIC-20 (Documentation & Developer Experience)
- [ ] CREATE EPIC-21 (Collaborative Features & P2P Sync)

### Phase 6: REPARENT REQUIREMENTS (30 minutes)
- [ ] Move REQ-74, REQ-77, REQ-73 → EPIC-11
- [ ] Move REQ-78, REQ-79 → EPIC-12
- [ ] Move REQ-18 → EPIC-16
- [ ] Move REQ-62, REQ-63, REQ-64, REQ-65, REQ-66, REQ-67 → EPIC-17
- [ ] Move REQ-58, REQ-59, REQ-60 → EPIC-18
- [ ] Move REQ-68, REQ-69, REQ-70 → EPIC-19
- [ ] Move REQ-80, REQ-81, REQ-82, REQ-83, REQ-84, REQ-85 → EPIC-20
- [ ] Move REQ-20, REQ-72 → EPIC-21

### Phase 7: SPLIT EPIC-9 (10 minutes)
- [ ] RENAME EPIC-9 to "Performance & Security - Application-Level Hardening"
- [ ] CREATE EPIC-22 (Production Infrastructure & DevOps)

### Phase 8: VERIFICATION (15 minutes)
- [ ] Verify requirement count: ~59 total
- [ ] Verify all REQs parented or standalone
- [ ] Verify EPIC structure
- [ ] Verify REQ-26, REQ-27 assigned to Tyler

---

## TOTAL EXECUTION TIME

| Phase | Time |
|---|---|
| Phase 1: Deletions | 15 min |
| Phase 2: Promotions | 10 min |
| Phase 3: Assign & Refine | 5 min |
| Phase 4: Downgrade EPICs | 5 min |
| Phase 5: Create new EPICs | 20 min |
| Phase 6: Reparent REQs | 30 min |
| Phase 7: Split EPIC-9 | 10 min |
| Phase 8: Verification | 15 min |
| **TOTAL** | **110 min (~2 hours)** |

---

## POST-CLEANUP METRICS

After all operations complete:

| Metric | Before | After | Change |
|---|---|---|---|
| **Total Requirements** | 104 | ~59 | –45 (consolidation) |
| **Active PLANNED REQs** | 45 | ~35 | Clearer focus |
| **IDEA Pool** | 50+ | ~20 | Heavily curated |
| **Duplicates** | 6 | 0 | ✅ Eliminated |
| **Unassigned** | 2 | 0 | ✅ Assigned (REQ-26, REQ-27 → Tyler) |
| **Orphaned Items** | Many | 0 | ✅ All parented under EPICs |
| **Total EPICs** | 10 | 22 | Organized by strategic tier |

---

## ROADMAP CLARITY (Post-Cleanup)

### ✅ TIER 1 (COMPLETED)
- REQ-13: Performance & Bundle Optimization
- REQ-14: Code Complexity Refactoring
- REQ-15: WCAG Accessibility
- REQ-17: Export Functionality

### 🔥 TIER 1 (NEXT PRIORITY)
- REQ-7: PWA Icon Generation & Manifest
- REQ-25: AI-Verified Component Addition Workflow
- EPIC-7: Physics-Based Circuit Simulation (5 phases)

### 📋 TIER 2 (NEXT WAVE)
- EPIC-11: Performance Optimization Phase 2
- EPIC-12: Security & Production Hardening
- EPIC-18: Persistence & Undo/Redo Hardening
- EPIC-21: Collaborative Features & P2P Sync
- EPIC-20: Documentation & Developer Experience

### 🎯 TIER 3 (STRATEGIC FUTURE)
- EPIC-16: Engineering Bootcamp & Educational Features
- EPIC-17: Advanced Simulation & Component Modeling
- EPIC-19: Advanced Rendering & Visualization
- EPIC-4: AI Component Wizard (downgraded from PLANNED)
- EPIC-5: AI Visual Generation (downgraded from PLANNED, blocked on REQ-25)
- EPIC-22: Production Infrastructure & DevOps

---

## HOW TO EXECUTE

1. Open BrainGrid: https://braingrid.ai (or your deployment)
2. Navigate to CircuitMind-AI project (PROJ-4)
3. Work through MASTER CHECKLIST above systematically
4. For each operation, follow the BrainGrid UI steps (Edit → Delete/Update/Create)
5. Take breaks between phases to avoid typos
6. After Phase 8, review final counts to confirm cleanup succeeded

---

## NOTES FOR TYLER

- **REQ-26 & REQ-27 now assigned to you.** When ready, write acceptance criteria + move to specs.
- **EPIC-4 & EPIC-5 downgraded but NOT deleted.** They'll stay as coherent feature sets in IDEA status. When specs mature, promote back to PLANNED.
- **EPIC-9 split for clarity.** App-level stuff in EPIC-9, infrastructure/DevOps in EPIC-22.
- **REQ-62 & REQ-63 moved under EPIC-17.** These are core electrical property engine items — they're pre-EPIC-7 Phase 1 prerequisites, but logically group with EPIC-17 for now.

You can start the cleanup whenever ready. The operations are straightforward — mostly clickety-click in BrainGrid UI.

---

**END OF EXECUTION PLAN**
