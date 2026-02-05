# Code Quality Audit Report
**Project:** CircuitMind AI  
**Date:** 2026-01-31  
**Auditor:** Claude Opus 4.5  

---

## Executive Summary

| Severity | Count |
|----------|-------|
| **Critical** | 35 |
| **High** | 48 |
| **Medium** | 79 |
| **Low** | 1 |
| **Total** | 163 |

---

## 1. Code Metrics Overview (scc)

### Total Lines of Code
- **Total Files:** 194 TypeScript files
- **Total Lines:** 32,041
- **Code Lines:** 26,268
- **Comments:** 2,089
- **Blanks:** 3,684
- **Complexity Score:** 4,546

### Estimated Development Cost
- **COCOMO Organic:** $835,590
- **Schedule Effort:** 12.85 months
- **Team Size:** 5.78 developers

### Top 10 Largest Files

| File | Lines | Code | Complexity |
|------|-------|------|------------|
| `components/diagram/Diagram3DView.tsx` | 1946 | 1437 | 294 |
| `components/DiagramCanvas.tsx` | 1380 | 1226 | 359 |
| `components/ComponentEditorModal.tsx` | 1315 | 1235 | 195 |
| `services/threePrimitives.ts` | 1258 | 882 | 100 |
| `components/MainLayout.tsx` | 1021 | 870 | 240 |
| `components/diagram/DiagramNode.tsx` | 1009 | 855 | 177 |
| `components/SettingsPanel.tsx` | 1003 | 921 | 144 |
| `components/Inventory.tsx` | 976 | 861 | 153 |
| `components/ChatPanel.tsx` | 866 | 774 | 155 |
| `components/diagram/componentShapes.ts` | 697 | 544 | 74 |

---

## 2. Complexity Analysis (lizard)

### Functions with CCN > 15 (Critical)

| Severity | File:Line | Function | CCN | NLOC |
|----------|-----------|----------|-----|------|
| **Critical** | `services/fzpzLoader.ts:160` | anonymous | 22 | 40 |
| **Critical** | `components/diagram/diagramState.ts:91` | clampZoom | 21 | 93 |
| **Critical** | `services/gemini/features/media.ts:102` | generateConceptImage | 18 | 26 |
| **Critical** | `services/componentValidator.ts:53` | validateDiagramInventoryConsistency | 16 | 107 |

### Functions with CCN 11-15 (High)

| File:Line | Function | CCN | NLOC |
|-----------|----------|-----|------|
| `services/aiContextBuilder.ts:134` | buildContextPrompt | 14 | 48 |
| `services/threePrimitives.ts:545` | createPinRow | 14 | 48 |
| `services/aiContextBuilder.ts:68` | buildAIContext | 11 | 47 |
| `services/threeCodeRunner.worker.ts:65` | bakeTextures | 11 | 42 |

**Recommendation:** Refactor functions with CCN > 15. Extract sub-functions, use strategy patterns, or break into smaller units.

---

## 3. TypeScript Errors (35 Critical)

### Type Safety Issues

| Severity | File:Line | Error |
|----------|-----------|-------|
| Critical | `components/diagram/Diagram3DView.tsx:1151` | Property 'isGroup' missing in InstancedMesh |
| Critical | `components/diagram/index.ts:3` | No exported member 'WireHighlightState' |
| Critical | `components/layout/CollaboratorList.tsx:22` | Type mismatch: missing 'user' property |
| Critical | `components/layout/OmniSearch.tsx:53,70,71,75,77,81,83,86` | 8 errors: 'unknown' type issues |
| Critical | `components/layout/ProjectTimeline.tsx:68,75,78,84,89` | 5 errors: 'oid'/'commit' on unknown |
| Critical | `services/api/apiGateway.ts:37` | Type mismatch for ActionIntent |
| Critical | `services/gemini/features/chat.ts:122,288` | 'error' property not in AIMetric |
| Critical | `services/gemini/features/components.ts:44,83,125,151,178,527` | 6 errors: 'error' not in AIMetric |
| Critical | `services/gemini/features/media.ts:27,143` | 'error' not in AIMetric |
| Critical | `services/gemini/features/suggestions.ts:23,56` | 'error' not in AIMetric |
| Critical | `services/gemini/features/wiring.ts:58` | 'error' not in AIMetric |
| Critical | `services/liveAudio.ts:309` | 'getCanvasSnapshot' missing on LiveSession |
| Critical | `services/search/searchIndexer.ts:42` | Filter type incompatible |
| Critical | `services/storage.ts:306` | 'id' on unknown type |

**Root Cause Analysis:**
- **AIMetric type missing 'error' field:** 12 occurrences across gemini features
- **'unknown' type not narrowed:** 13 occurrences in OmniSearch, ProjectTimeline
- **Missing exports/properties:** 3 occurrences

**Fix Priority:** Update `types.ts` to add `error?: string` to `AIMetric` interface. Add proper type guards for unknown types.

---

## 4. 'any' Type Usage (22 High)

| Severity | File:Line | Context |
|----------|-----------|---------|
| High | `services/storage.ts:100` | `item: any` in map |
| High | `services/standardsService.ts:22` | `params?: any` |
| High | `services/gesture/GestureEngine.ts:10` | `handedness: any[][]` |
| High | `services/datasheetProcessor.ts:41` | `data: any` param |
| High | `services/componentValidator.ts:506` | `model: any` (Three.js) |
| High | `services/liveAudio.ts:216` | `mediaParts: any[]` |
| High | `hooks/useNeuralLink.ts:94` | `e: any` catch |
| High | `hooks/useConversations.ts:155` | `isPrimaryArg: any` |
| High | `contexts/DashboardContext.tsx:15` | `props?: any` |
| High | `services/fzpzLoader.ts:160` | `c: any` in forEach |
| High | `services/gemini/features/components.ts:309,373` | `deepSpec: any`, `imagePart: any` |
| High | `services/gemini/features/predictions.ts:28` | `p: any` in map |
| High | `services/gemini/features/media.ts:118` | `config: any` |
| High | `tests/setup.tsx:9,14,62,65` | Test mocks |
| High | `scripts/run-omni-audit.ts:8,28,40` | Audit scripts |
| High | `scripts/build-parts-manifest.ts:55,65` | Build scripts |

**Recommendation:** Replace `any` with proper types or `unknown` with type guards. Scripts/tests are lower priority.

---

## 5. console.log Statements (43 Medium)

### Production Code (Must Remove)

| File:Line | Context |
|-----------|---------|
| `components/MainLayout.tsx:247,252,297,304,312,327` | Gesture debugging |
| `components/settings/SyncPanel.tsx:48` | Pulled data debug |
| `contexts/DiagramContext.tsx:55` | Migration log |
| `hooks/useInventorySync.ts:112,229,231` | Sync debugging |
| `hooks/useNeuralLink.ts:33,39,54,68` | Neural Link init |
| `services/gesture/GestureEngine.ts:24,42` | Worker init |
| `services/componentValidator.ts:483,488,489,493,494,495` | Validation output |
| `services/webRTCService.ts:46,47,49` | WebRTC events |
| `services/gitService.ts:50` | Git init |
| `services/ragService.ts:34` | Bootstrap |
| `services/syncService.ts:27,42,56` | Sync operations |
| `services/error/diagnosticsHub.ts:45` | Init |
| `services/gemini/features/components.ts:217,269,298,312,367,416` | Deep spec search |
| `services/collabService.ts:28` | Room join |

### Scripts (Lower Priority)
- 40+ console.log in `scripts/` directory (acceptable for CLI tools)

**Recommendation:** Replace with proper logging service or remove entirely.

---

## 6. TODO/FIXME Comments (1 Low)

| Severity | File:Line | Comment |
|----------|-----------|---------|
| Low | `components/diagram/wiring/BezierWire.tsx:49` | TODO: Implement Catmull-Rom for smooth path |

**Note:** Surprisingly low TODO count indicates either good completion or missed documentation.

---

## 7. ESLint Warnings (79 Medium)

### By Category

| Category | Count | Examples |
|----------|-------|----------|
| `no-unused-vars` | 18 | dropZone, thumbnail, WireConnection, viewBox |
| `react-refresh/only-export-components` | 20 | All context files exporting hooks |
| `no-explicit-any` | 23 | Various any usage |
| `react-hooks/exhaustive-deps` | 4 | Missing/unnecessary dependencies |
| `prefer-const` | 1 | `services/fzpzLoader.ts:78` |

### Notable Issues

| File | Warning | Impact |
|------|---------|--------|
| `components/diagram/DiagramNode.tsx:751` | Unnecessary useMemo dependency | Performance |
| `contexts/TutorialContext.tsx:57` | Missing 'completeQuest' dependency | Potential bug |
| `contexts/UserContext.tsx:45` | Missing 'user' dependency | Potential stale closure |
| `hooks/useAIActions.ts:112,130` | Multiple dep issues | Stale closures |

---

## 8. Top 5 Worst Files

| Rank | File | Issues | Severity |
|------|------|--------|----------|
| 1 | `components/diagram/Diagram3DView.tsx` | 1946 LOC, 294 complexity, TS error | Critical |
| 2 | `components/DiagramCanvas.tsx` | 1380 LOC, 359 complexity | High |
| 3 | `services/gemini/features/components.ts` | 8 TS errors, 3 any, 6 console.log | Critical |
| 4 | `components/layout/OmniSearch.tsx` | 8 TS errors (unknown types) | Critical |
| 5 | `services/componentValidator.ts` | CCN 16, any usage, 6 console.log | High |

---

## 9. Key Recommendations

### Immediate Actions (This Sprint)

1. **Fix AIMetric type** - Add `error?: string` field
   - Fixes 12 TypeScript errors across gemini features
   
2. **Type OmniSearch results** - Add proper IndexedDocument typing
   - Fixes 8 TypeScript errors
   
3. **Export WireHighlightState** - Fix index.ts export
   - Fixes 1 TypeScript error

### Short-Term (Next 2 Weeks)

4. **Refactor high-CCN functions:**
   - `fzpzLoader.ts:160` (CCN 22) - Extract parsing logic
   - `diagramState.ts:clampZoom` (CCN 21) - Break into smaller units
   - `componentValidator.ts` (CCN 16) - Extract sub-validators

5. **Replace console.log with logging service:**
   - Create `services/logger.ts` with levels (debug/info/warn/error)
   - Replace 43 console.log calls

6. **Add type guards for 'unknown' types:**
   - `ProjectTimeline.tsx` - Type git commits
   - `CollaboratorList.tsx` - Type peer state

### Medium-Term (Next Month)

7. **Break down large components:**
   - `Diagram3DView.tsx` (1946 LOC) - Extract sub-components
   - `DiagramCanvas.tsx` (1380 LOC) - Extract handlers
   - `ComponentEditorModal.tsx` (1315 LOC) - Extract tabs

8. **Eliminate `any` types:**
   - Replace 22 `any` usages with proper types
   - Use `unknown` with type guards where needed

9. **Fix React hook dependencies:**
   - `useAIActions.ts` - Add missing deps or memoize
   - `TutorialContext.tsx` - Add completeQuest dep
   - `UserContext.tsx` - Add user dep

---

## Appendix: File-by-File Issue Summary

### Critical Files (35+ issues)
- `services/gemini/features/components.ts`: 11 issues
- `components/layout/OmniSearch.tsx`: 8 issues
- `components/layout/ProjectTimeline.tsx`: 5 issues

### High Priority Files (10-34 issues)
- `hooks/useAIActions.ts`: 2 hook issues
- `services/componentValidator.ts`: 7 console.log + CCN 16
- `components/MainLayout.tsx`: 6 console.log

### Full TypeScript error count: 35
### Full ESLint warning count: 79
### Total console.log statements: 43 (production code)
### Total any usage: 22

---

*Report generated by extreme-audit Phase 1*
