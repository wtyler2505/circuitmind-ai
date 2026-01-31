# Spec: Performance Optimization (Lighthouse Remediation)

## 1. Goal
Improve core web vitals and Lighthouse performance scores to ensure a "buttery smooth" engineering experience, specifically targeting TBT, TTI, and Speed Index.

## 2. Problem Statement
The current implementation suffers from:
- **Main-Thread Blocking:** 8.5s of TBT during initialization.
- **Expensive Rendering:** `InventoryItem` components mount in bulk (280+ timings), freezing the UI.
- **Cascading Updates:** Context changes in `DiagramContext` and `InventoryContext` trigger global re-renders (averaging 400ms+ per update).
- **Chat Overhead:** `Markdown` parsing and `ChatMessage` rendering for long conversation histories are synchronous and expensive.

## 3. Success Criteria
- **Total Blocking Time (TBT):** < 300ms.
- **Time to Interactive (TTI):** < 3.5s.
- **Lighthouse Performance Score:** > 85.
- **Zero Visual Drift:** Optimizations must not change the "Cyberpunk" aesthetic.

## 4. Technical Requirements
- **Virtualization:** Implement `react-window` or `virtua` for the Inventory and Chat lists.
- **Memoization Strategy:** Rigorous use of `React.memo` for `InventoryItem` and `ChatMessage`.
- **Context Splitting:** Decouple "Selection State" from "Structural State" in contexts to minimize re-renders.
- **Deferred Rendering:** Use `useDeferredValue` or `Transitions` for search filtering to keep the input responsive.
