# Implementation Plan: Omni-Audit (Stabilization & Validation)

## Phase 1: Test Remediation (Integrity)
- [x] Analyze `tmp/audit_tests.log` to identify root causes of the 23 failing tests.
- [x] Fix regressions in `DiagramContext` and `componentValidator` that are causing sync test failures.
- [x] Ensure `npm run test` passes 100%.

## Phase 2: Security & Dependency Hardening
- [x] Parse `tmp/audit_deps.json` and fix all High/Critical vulnerabilities.
- [x] Verify `securityAuditor.ts` correctly identifies the "VCC-GND Short" scenario in current diagrams.

## Phase 3: Network & API Pathing
- [x] Investigate why `generativelanguage.googleapis.com` is unresponsive to ICMP.
- [x] Implement a `connectivityService` check using a simple `HEAD` fetch to bypass ICMP blocks and verify actual API availability.
- [x] Validate P2P sync signaling server connection.

## Phase 4: Performance & Resource Optimization
- [x] Monitor JS Heap during 3D Stress Test (50+ components).
- [x] Mitigate main-thread violations ([Violation] handlers) in `DiagramCanvas`.
- [x] Verify `sanitizeForDB` successfully prevents circular structure errors during high-frequency auto-saves.

## Phase 5: Synthesis & Reporting
- [x] Create `scripts/run-omni-audit.ts` to generate the final `audit_report.json`.
- [x] Perform a final operational readiness assessment.
