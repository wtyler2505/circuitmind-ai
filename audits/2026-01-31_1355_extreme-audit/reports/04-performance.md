# Performance Audit Report

**Date:** 2026-01-31
**Project:** CircuitMind AI
**Auditor:** Claude Opus 4.5

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Bundle Size | 4.33 MB | CRITICAL |
| Main Chunk | 2.0 MB | CRITICAL |
| node_modules | 1.3 GB | WARNING |
| Total Source Lines | 34,384 | OK |
| Dependencies | 33 prod + 29 dev | OK |
| React.memo Usage | 7 of 73 components (9.6%) | CRITICAL |
| Console.log Calls | 41 | WARNING |
| Files >1000 LOC | 7 | WARNING |

---

## Critical Performance Issues

### P1: Massive Bundle Size (4.33 MB uncompressed)

**Impact:** HIGH  
**Location:** `dist/assets/`

| Chunk | Size | % of Total |
|-------|------|------------|
| index-D5a2-Coc.js (main) | 2.0 MB | 46.2% |
| threeCodeRunner.worker | 719 KB | 16.2% |
| vendor-three | 635 KB | 14.3% |
| vendor-ai | 248 KB | 5.6% |
| html2canvas.esm | 198 KB | 4.5% |
| vendor-markdown | 154 KB | 3.5% |
| vendor-ui | 121 KB | 2.7% |
| SettingsPanel | 88 KB | 2.0% |
| ThreeViewer | 54 KB | 1.2% |

**Issue:** Main chunk is 2.0 MB - far exceeds the 400KB warning limit set in vite.config.ts.

**Recommendations:**
1. Enable aggressive code splitting for routes/features
2. Lazy load Diagram3DView component (1945 LOC)
3. Consider dynamic imports for heavy features
4. Analyze main chunk with `vite-bundle-visualizer`

---

### P2: UI Assets Are Unoptimized (28 MB total)

**Impact:** HIGH  
**Location:** `public/assets/ui/`

| File | Size | Issue |
|------|------|-------|
| pattern-carbon.png | 1.9 MB | MASSIVELY oversized |
| loading.png | 1.6 MB | MASSIVELY oversized |
| action-zoom-in.png | 1.5 MB | MASSIVELY oversized |
| icon-sensor.png | 1.5 MB | MASSIVELY oversized |
| action-3d.png | 1.5 MB | MASSIVELY oversized |
| logo.png | 1.4 MB | MASSIVELY oversized |
| action-grid.png | 1.4 MB | MASSIVELY oversized |
| pattern-brushed.png | 1.4 MB | MASSIVELY oversized |
| action-voice.png | 1.3 MB | MASSIVELY oversized |
| action-undo.png | 1.3 MB | MASSIVELY oversized |

**Issue:** These are UI icons/patterns that should be 5-50 KB each, not 1+ MB.

**Recommendations:**
1. **URGENT**: Convert all PNGs to optimized WebP/AVIF (90%+ size reduction)
2. Use SVG for icons where possible
3. Compress patterns with lossy compression
4. Consider CSS-generated patterns instead of images
5. Expected savings: ~26 MB (93% reduction)

---

### P3: Low React.memo Adoption (9.6%)

**Impact:** HIGH  
**Location:** `components/`

Only 7 of 73 components use `React.memo`:
- Components with memo: 7
- Components without memo: 66
- **Adoption rate: 9.6%**

**High-priority components needing React.memo:**

| Component | Lines | useEffect Count | Priority |
|-----------|-------|-----------------|----------|
| MainLayout.tsx | 1021 | 12 | CRITICAL |
| ComponentEditorModal.tsx | 1315 | 7 | HIGH |
| DiagramCanvas.tsx | 1379 | 5 | HIGH |
| ChatPanel.tsx | 865 | 3 | HIGH |
| Inventory.tsx | 976 | 3 | MEDIUM |

**Recommendations:**
1. Add React.memo to all pure functional components
2. Prioritize components with frequent parent re-renders
3. Use React DevTools Profiler to identify wasted renders

---

### P4: Inline Arrow Functions in JSX (30+ instances)

**Impact:** MEDIUM  
**Location:** Multiple components

Found 30+ inline arrow functions that create new function references on every render:

```tsx
// Examples of problematic patterns:
onClick={() => setActiveTab('info')}
onClick={() => setShowAiChat(!showAiChat)}
onClick={() => dispatch({ type: 'ZOOM_IN', payload: 0.2 })}
```

**Files with most inline handlers:**
- ComponentEditorModal.tsx: 20+ instances
- DiagramCanvas.tsx: 10+ instances

**Recommendations:**
1. Extract handlers to useCallback hooks
2. For simple state toggles, use updater functions
3. Consider event delegation for lists

---

### P5: MediaPipe WASM Bundle (20 MB)

**Impact:** MEDIUM  
**Location:** `public/assets/mediapipe/`

- Total size: 20 MB
- WASM files: 1

**Issue:** Large WASM bundle loaded even when hand tracking not used.

**Recommendations:**
1. Lazy-load MediaPipe only when hand tracking feature activated
2. Consider CDN hosting for WASM files
3. Add loading indicator during WASM initialization

---

## Warning Level Issues

### W1: Large Source Files (7 files > 1000 LOC)

**Impact:** MEDIUM  
**Location:** Various

| File | Lines | Recommendation |
|------|-------|----------------|
| Diagram3DView.tsx | 1945 | Split into Scene, Controls, Rendering modules |
| DiagramCanvas.tsx | 1379 | Extract toolbar, minimap, export features |
| ComponentEditorModal.tsx | 1315 | Split tabs into separate components |
| threePrimitives.ts | 1257 | Split by primitive type |
| MainLayout.tsx | 1021 | Extract keyboard handlers, predictions |
| DiagramNode.tsx | 1009 | Split pin rendering, drag handling |
| SettingsPanel.tsx | 1002 | Already lazy-loaded, consider tab splitting |

---

### W2: High Cyclomatic Complexity

**Impact:** MEDIUM  
**Location:** `components/diagram/diagramState.ts`

```
clampZoom: 93 NLOC, 21 CCN, 558 tokens
```

**Issue:** CCN of 21 indicates highly complex branching logic.

**Recommendations:**
1. Break into smaller, focused functions
2. Use early returns to reduce nesting
3. Extract validation logic

---

### W3: Console.log Statements (41 found)

**Impact:** LOW  
**Location:** Various production files

41 console.log/debug/info calls found in production code.

**Recommendations:**
1. Use conditional logging (development only)
2. Replace with proper logging service
3. Add ESLint rule: `no-console`

---

### W4: JSON Parse/Stringify Calls (96 found)

**Impact:** LOW  
**Location:** Various

96 JSON operations found. Could be expensive for large objects.

**Recommendations:**
1. Cache parsed results where possible
2. Use streaming JSON for large datasets
3. Consider binary formats for performance-critical paths

---

### W5: Three.js Wildcard Import

**Impact:** MEDIUM  
**Location:** Multiple files

```typescript
import * as THREE from 'three';  // Prevents tree-shaking
```

Files using wildcard import:
- Diagram3DView.tsx
- ThreeViewer.tsx
- threePrimitives.ts
- threeCodeRunner.worker.ts

**Recommendations:**
1. Use named imports: `import { Scene, Mesh, BoxGeometry } from 'three'`
2. This enables tree-shaking of unused Three.js modules
3. Expected savings: ~100-200 KB

---

## Positive Findings

### Code Splitting Already Implemented

```typescript
// Good: Lazy loading is used
const ThreeViewer = lazy(() => import('./ThreeViewer'));
const ComponentEditorModal = lazy(() => import('./ComponentEditorModal'));
```

### Cleanup Patterns Followed

Event listeners and intervals properly cleaned up:
- 15+ removeEventListener calls found
- 8+ clearInterval/clearTimeout calls found

### Debouncing Implemented

- useInventorySync uses 300ms debounce
- MainLayout uses 1500ms debounce for predictions

### Vendor Chunking Configured

```typescript
manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'vendor-three': ['three'],
  'vendor-ai': ['@google/genai'],
  'vendor-ui': ['framer-motion'],
  'vendor-markdown': ['react-markdown', ...]
}
```

---

## Performance Optimization Roadmap

### Phase 1: Quick Wins (1-2 days)

| Task | Expected Impact | Effort |
|------|-----------------|--------|
| Optimize UI assets to WebP | -26 MB assets | Low |
| Remove console.log calls | Minor perf boost | Low |
| Add React.memo to top 5 components | Reduce re-renders | Low |

### Phase 2: Bundle Optimization (3-5 days)

| Task | Expected Impact | Effort |
|------|-----------------|--------|
| Replace `* as THREE` with named imports | -150 KB bundle | Medium |
| Lazy-load Diagram3DView | -500 KB initial load | Medium |
| Lazy-load MediaPipe | -20 MB deferred | Medium |
| Split main chunk further | Better caching | Medium |

### Phase 3: Component Refactoring (1-2 weeks)

| Task | Expected Impact | Effort |
|------|-----------------|--------|
| Split 7 large files | Maintainability | High |
| Add React.memo comprehensively | Reduce re-renders | Medium |
| Extract inline handlers to useCallback | Stable references | Medium |
| Reduce clampZoom complexity | Better testability | Medium |

---

## Top 5 Performance Recommendations

1. **URGENT: Optimize UI assets** - 28 MB of PNGs should be ~2 MB as WebP. This is the single biggest win with minimal effort.

2. **Increase React.memo usage** - From 9.6% to 50%+ for components that don't need to re-render on every parent update. Start with MainLayout, ComponentEditorModal, DiagramCanvas.

3. **Lazy-load heavy features** - Diagram3DView (1945 LOC) and MediaPipe (20 MB) should only load when needed.

4. **Use named Three.js imports** - Replace `import * as THREE` with specific imports to enable tree-shaking.

5. **Split main bundle** - 2.0 MB main chunk needs aggressive code splitting. Target < 250 KB initial JS.

---

## Metrics Targets

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Initial JS | 2.0 MB | 250 KB | 87.5% |
| Total Assets | 28 MB | 2 MB | 93% |
| Components with memo | 9.6% | 60% | 6x |
| Files >1000 LOC | 7 | 3 | 57% |
| Bundle (gzip) | ~1.4 MB | ~150 KB | 89% |

---

*Report generated by EXTREME Audit Phase 4*
