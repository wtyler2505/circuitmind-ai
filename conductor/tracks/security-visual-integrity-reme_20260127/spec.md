# Specification: Security & Visual Integrity

## Goal
Resolve all critical security flags and visual asset failures identified in the 2026-01-27 audit.

## Requirements
- **Gitleaks**: Whitelist or rename the 3 "secret" snippet keys in `docs/misc/inventory/examples_library/`.
- **ORB Assets**: Download and localize all external images in `data/initialInventory.ts` that are being blocked by Opaque Response Blocking.
- **404 Errors**: Fix the missing resource paths identified in the console logs (`msgid=7`).

## Scope
- `data/initialInventory.ts`
- `docs/misc/inventory/`
- `.gitleaks.toml`