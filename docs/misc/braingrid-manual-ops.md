# BrainGrid Project Cleanup & Reorganization — COMPLETED

**Generated:** 2026-02-09
**Completed:** 2026-02-09
**Method:** All operations completed via BrainGrid MCP server tools (v0.9.3)
**BrainGrid REQ:** REQ-98 (COMPLETED)

> **Note:** The `update_project_requirement` MCP tool has a cosmetic bug — it returns
> "Cannot read properties of undefined (reading 'id')" but the mutation actually succeeds.
> All updates were verified via `get_project_requirement` after each call.

---

## Final Stats

| Metric | Value |
|--------|-------|
| Total requirements | 118 |
| Active (non-cancelled) | 76 |
| Cancelled | 42 |
| Completed | 4 (REQ-13, 14, 15, 17) |
| In Review | 1 (REQ-16) |
| Tasks created under EPICs | 26 |

### Why 76 instead of ~65?
- 3 superseded EPIC entities (EPIC-4, EPIC-5, EPIC-9) cannot be modified via MCP (400 error on EPIC-XXX IDs)
- EPIC-10 kept separate (could merge into REQ-105 later)
- REQ-97 (token limit errors) kept as valid standalone requirement

---

## EPIC Creation Mapping

| Logical Name | BrainGrid ID | Tasks | Status |
|---|---|---|---|
| EPIC-11: Performance Optimization Phase 2 | REQ-99 | 3 | PLANNED |
| EPIC-12: Security & Production Hardening | REQ-100 | 2 | PLANNED |
| EPIC-16: Engineering Bootcamp & Educational | REQ-101 | 1 | PLANNED |
| EPIC-17: Advanced Simulation & Component Modeling | REQ-102 | 6 | PLANNED |
| EPIC-18: Persistence & Undo/Redo Hardening | REQ-103 | 3 | PLANNED |
| EPIC-19: Advanced Rendering & Visualization | REQ-104 | 3 | PLANNED |
| EPIC-20: Documentation & Developer Experience | REQ-105 | 6 | PLANNED |
| EPIC-21: Collaborative Features & P2P Sync | REQ-106 | 2 | PLANNED |
| EPIC-22: Production Infrastructure & DevOps | REQ-107 | 0 | PLANNED |

### Replacement Requirements (for EPIC entities that couldn't be modified)

| Replaces | New ID | Name | Readiness |
|----------|--------|------|-----------|
| EPIC-4 | REQ-108 | AI Component Wizard - Verified Inventory Management [DEFERRED] | 1/5 |
| EPIC-5 | REQ-109 | AI Visual Generation & Pin-Perfect Accuracy System [DEFERRED] | 1/5 |
| EPIC-9 | REQ-110 | Performance & Security - Application-Level Hardening | 3/5 |

---

## Phase Execution Log

### Phase 1: Cancel 15 Duplicate/Out-of-Scope Requirements
- [x] REQ-86, 87, 88, 89, 90 (duplicate EPIC-7 phases)
- [x] REQ-1, 22, 75, 76, 71, 61 (duplicates + out-of-scope)
- [x] REQ-21, 23, 24 (speculative features)
- [x] REQ-19 (merged Web Worker spec into REQ-94, then cancelled)

### Phase 2: Promote EPIC-7 Phases to PLANNED
- [x] REQ-92, 93, 94, 95, 96 (all IDEA -> PLANNED)

### Phase 3: Assign REQ-26 & REQ-27
- [x] Both set to PLANNED, readiness 2/5
- Note: `assignee_id` requires user UUID; shows "Unassigned" in listing

### Phase 4: Downgrade EPIC-4 & EPIC-5
- [x] Created REQ-108 (replaces EPIC-4) with readiness 1/5, [DEFERRED]
- [x] Created REQ-109 (replaces EPIC-5) with readiness 1/5, [DEFERRED]
- Note: Original EPIC-4/EPIC-5 entities cannot be modified (400 on EPIC-XXX IDs)

### Phase 5: Create 9 EPICs (REQ-99 through REQ-107)
- [x] All created via `capture_project_requirement`

### Phase 6: Reparent 25 Requirements Under EPICs
- [x] Strategy: Created tasks under parent EPICs via `create_project_task`, then cancelled old standalone REQs
- [x] 26 tasks created, 25 REQs cancelled (REQ-19 was merged first)

### Phase 7: Split EPIC-9 + Create EPIC-22
- [x] REQ-107 (EPIC-22) already created in Phase 5
- [x] REQ-110 created as renamed EPIC-9 replacement
- Note: Original EPIC-9 entity cannot be modified (400 on EPIC-XXX IDs)

### Phase 8: Verification
- [x] 118 total requirements listed and analyzed
- [x] 42 cancelled (41 from cleanup + REQ-91 orphan)
- [x] 0 duplicates remaining
- [x] REQ-26, REQ-27 set to PLANNED with readiness 2/5
- [x] REQ-108, REQ-109 created as DEFERRED replacements for EPIC-4/5

### Also Considered
- [x] REQ-91 (PWA fun fact) — CANCELLED (not a real requirement)
- [ ] REQ-97 (token limit errors) — KEPT as valid standalone requirement
- [ ] EPIC-10 — kept separate from REQ-105 (may merge later)
- [ ] EPIC-4, EPIC-5, EPIC-9 — orphaned but superseded; cannot cancel via MCP

---

## MCP Limitations Discovered

1. **`update_project_requirement` response parsing bug** — returns error but mutation succeeds
2. **EPIC-XXX IDs return 400** — requirement CRUD tools only accept REQ-XXX format
3. **No IDEA status in update enum** — only PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
4. **No parent/reparent field** — neither update nor create supports parent EPIC assignment
5. **Parallel MCP calls fail** — when one errors, siblings get cancelled; must execute sequentially
6. **`assignee_id` requires user UUID** — can't assign by email; shows "Unassigned"
