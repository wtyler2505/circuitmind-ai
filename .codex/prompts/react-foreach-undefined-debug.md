---
description: Debug React/TS runtime error "Cannot read properties of undefined (reading 'forEach')" and propose fixes with tests.
argument-hint: [FILE="components/DesignAssistant.tsx"] [SYMBOL="modeMap"] [STACK_TRACE="..."]
allowed-tools: Read, Write, Edit, Bash
---

# React forEach Undefined Debug

Goal: identify root cause and fix without regression.

## Steps

1. Locate the failing forEach call and identify the variable source.
2. Check initialization, props, async loads, optional chaining, default values.
3. Propose a fix (guard, default empty array, type refinement).
4. Add or adjust tests for undefined and empty cases.
5. Summarize changes and why they are safe.

## Output

- Root cause:
- Fix:
- Tests:
- Files touched:
