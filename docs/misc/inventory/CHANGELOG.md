# Changelog

## 2025-12-31

- Generated `inventory.production.json` from Tier 5 JSON (superset).
- Reconciled `inventory_metadata.last_updated` to match Tier 5 MD headers (2025-12-31).
- Exported wiring ruleset (Tier 4/5) into `wiring_ruleset/`.
- Exported complete circuits into `examples_library/` with sketches and wiring tables.

## 2026-01-01

- Expanded cross‑references for **all** components: added `application_notes`, `example_circuits`, `substitute_parts`, `compatibility_notes` and `project_tags` wherever they were missing.
- Populated `documentation_categories` with example purchase orders, receipts and adjustment logs to demonstrate procurement tracking.
- Added a **Contributor Guide** explaining naming conventions, mandatory fields, cross‑reference criteria, stock adjustment workflows and changelog practices. The guide lives in the JSON as a top‑level `contributor_guide` property and is referenced in the README.
- Added `circuit_011_relay_control` to `examples_library/` to showcase the 5 V relay module; includes wiring, code, plan and troubleshooting notes.
- Updated `inventory.production.json` to version `3.5-tier5-crossref-expansion` and `last_updated` to 2026‑01‑01. Added a version history (`changelog`) within the JSON.
