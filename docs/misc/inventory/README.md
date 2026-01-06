# Electronics Inventory Bundle (Tier 1–5)

This bundle contains:

1) `inventory.production.json` — a comprehensive Tier 5 superset JSON.  In addition to the original component definitions, this version expands cross‑references to **every** part, adds a detailed contributor guide, and populates documentation categories (purchase orders, receipts and adjustments) with example entries.  The `inventory_metadata` section now carries a version history and the file is dated 2026‑01‑01.

2) `wiring_ruleset/` — the extracted wiring‑engine constraints together with a TypeScript validator skeleton.  These rules enforce power‑budget limits, pin‑allocation rules, wire‑color standards and protection requirements across all tiers.

3) `examples_library/` — the Tier 5 “complete circuits” library, exported into ready‑to‑run folders.  Each example includes a bill of materials, wiring tables, Arduino sketches, diagram prompts and troubleshooting notes.  The library now includes an additional **Relay Control** example for the 5 V relay module (see `circuit_011_relay_control`).

Generated on: 2026-01-01T00:00:00

### Contributor Guide

Guidelines for extending or modifying the inventory are embedded in the JSON itself (see the `contributor_guide` top‑level property).  Follow these rules when adding new parts, cross‑references, example circuits or documentation entries to keep the data model consistent.
