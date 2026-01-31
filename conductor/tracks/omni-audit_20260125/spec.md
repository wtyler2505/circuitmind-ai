# Specification: Omni-Audit (Full System Diagnostic)

## 1. Overview
The **Omni-Audit** is a comprehensive, deep-level diagnostic suite designed to validate every aspect of the CircuitMind AI ecosystem. It provides a "Black Box" snapshot of system health, security, performance, and operational readiness.

## 2. Goals
- **Total Visibility:** Audit hardware (via Web Serial simulators), software, security, and data.
- **Performance Baseline:** Establish quantitative metrics for latency, throughput, and resource utilization.
- **Risk Neutralization:** Identify CVEs, circuit safety violations, and data corruption before they impact the user.
- **Operational Readiness:** Ensure the project is stable for production-like local-first workflows (RTO/RPO validation).

## 3. Audit Scope
| Domain | Metrics / Checks | Tools |
| :--- | :--- | :--- |
| **Integrity** | Unit tests, Component-Canvas sync validation | `vitest`, `componentValidator.ts` |
| **Performance** | FPS, AI Latency, DOM Reflow latency | `healthMonitor.ts`, `lighthouse` |
| **Security** | Dependency CVEs, Circuit shorts, Code injection | `npm audit`, `securityAuditor.ts` |
| **Network** | Connectivity to Google GenAI API, P2P Sync readiness | `ping`, `traceroute`, `connectivityService.ts` |
| **Resources** | JS Heap usage, Disk space (IndexedDB) | `performance.memory`, `navigator.storage` |
| **Data** | Corruption check, Duplicate component IDs | `componentValidator.ts`, `storage.ts` |

## 4. Technical Requirements
- **Output:** A unified `audit_report.json` containing all findings.
- **Format:** Machine-readable with severity levels (`healthy`, `warning`, `critical`).
- **Automation:** A central `OmniAuditService` that orchestrates individual domain scans.

## 5. Security & Privacy
- All local paths in logs must be sanitized (e.g., `/home/wtyler/` -> `~/`).
- No telemetry is sent externally; the report is strictly for the local environment.
