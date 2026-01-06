---
description: Collect official product pages, datasheets, pinouts, and image links for a list of components with short key specs.
argument-hint: [ITEMS="..."] [URLS_PER_ITEM=3]
allowed-tools: Read, Write, Edit, Bash
---

# Component Datasheet + Links Pack

Goal: build a quick-reference pack of authoritative links for each item.

## Steps

1. Normalize part names and revisions.
2. For each item, return:
   - official/brand product page
   - datasheet or pinout
   - representative image
   - 1-line key specs (voltage, interfaces, size, etc.)
3. Provide URLS_PER_ITEM direct URLs.

## Output Format

### Item: <name>

- Product page:
- Datasheet/pinout:
- Image:
- Key specs: ...
