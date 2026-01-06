---
description: Look up mounting hole coordinates and dimensions for a PCB/module and return a precise coordinate table with sources.
argument-hint: [ITEM="Arduino Mega 2560 R3"] [UNITS=mm] [ORIGIN="lower-left corner"] [URLS=3]
allowed-tools: Read, Write, Edit, Bash
---

# Mounting Hole Pattern Lookup

Goal: produce a precise mounting hole map for ITEM.

## Steps

1. Confirm the exact board/module variant and revision.
2. Prefer authoritative sources (datasheet, CAD, official drawings). Use community drawings only if official sources are missing and note confidence.
3. Return board size (L/W), hole count, hole diameters, and X/Y coordinates from ORIGIN in UNITS.
4. Provide URLS direct links.

## Output Format

Board size: L x W (UNITS)
Origin: ORIGIN

| Hole | X   | Y   | Dia |
| ---- | --- | --- | --- |
| H1   | ... | ... | ... |

Sources:

- ...
