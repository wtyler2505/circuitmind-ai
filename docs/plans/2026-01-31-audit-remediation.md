# Audit Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 41 critical and 55 high-severity issues identified in the EXTREME audit.

**Architecture:** Six focused workstreams executed in dependency order - types first (unblocks TS errors), then security (reduces risk), then performance/quality.

**Tech Stack:** TypeScript, React, DOMPurify, sharp/squoosh (image optimization), ESLint

---

## Task 1: Fix AIMetric Type (Fixes 12 TypeScript Errors)

**Files:**
- Modify: `services/aiMetricsService.ts:1-9`
- Test: Manual `npm run build` verification

**Step 1: Add error field to AIMetric interface**

Open `services/aiMetricsService.ts` and modify lines 1-9:

```typescript
export interface AIMetric {
  id: string;
  timestamp: number;
  model: string;
  operation: string;
  latencyMs: number;
  success: boolean;
  userSatisfaction?: number;
  error?: string;  // NEW: Captures error message when success=false
}
```

**Step 2: Verify TypeScript errors reduced**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | wc -l`
Expected: Count drops from 35 to ~23 (12 fewer errors)

**Step 3: Commit**

```bash
git add services/aiMetricsService.ts
git commit -m "fix(types): add error field to AIMetric interface

Fixes 12 TypeScript errors across gemini feature modules where
code was trying to log error messages to the metric.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Security - Add DOMPurify to FzpzVisual

**Files:**
- Modify: `components/diagram/parts/FzpzVisual.tsx:77-89`
- Test: Manual visual verification with FZPZ component

**Step 1: Install DOMPurify (if not present)**

Run: `npm ls dompurify || npm install dompurify @types/dompurify`

**Step 2: Import DOMPurify**

Add import at top of `components/diagram/parts/FzpzVisual.tsx`:

```typescript
import DOMPurify from 'dompurify';
```

**Step 3: Sanitize SVG content before injection**

Replace lines 77-89 with:

```typescript
  // Clean SVG: remove xmlns and the root <svg> tag but keep children
  const innerContent = svgContent
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\/svg>/i, '');

  // SECURITY: Sanitize SVG to prevent XSS from malicious FZPZ files
  const sanitizedContent = DOMPurify.sanitize(innerContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use', 'symbol', 'defs', 'clipPath', 'mask'],
    ADD_ATTR: ['xlink:href', 'clip-path', 'mask', 'transform', 'viewBox'],
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
  });

  const width = component.footprint?.width || 10;
  const height = component.footprint?.height || 10;

  return (
    <g 
      className="fzpz-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
```

**Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add components/diagram/parts/FzpzVisual.tsx package.json package-lock.json
git commit -m "security(fzpz): sanitize SVG content with DOMPurify

Prevents XSS attacks from malicious FZPZ files by:
- Stripping script/style tags
- Removing event handler attributes
- Allowing only safe SVG elements and attributes

SEC-002 remediation.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Security - Add Code Validator for Three.js Worker

**Files:**
- Create: `services/threeCodeValidator.ts`
- Modify: `services/threeCodeRunner.worker.ts:36-55`
- Test: Manual verification with known-bad code patterns

**Step 1: Create code validator service**

Create `services/threeCodeValidator.ts`:

```typescript
/**
 * Validates AI-generated Three.js code before execution.
 * Whitelist approach: only allow known-safe patterns.
 */

// Forbidden patterns that indicate malicious or dangerous code
const FORBIDDEN_PATTERNS = [
  /\beval\s*\(/,
  /\bFunction\s*\(/,
  /\bimport\s*\(/,
  /\brequire\s*\(/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bcookie\b/,
  /\bpostMessage\b/,
  /\bself\[/,
  /\bglobalThis\b/,
  /\bProcess\b/,
  /\bchild_process\b/,
  /\b__proto__\b/,
  /\bconstructor\s*\[/,
];

// Required patterns - code must use these (ensures it's actually Three.js code)
const REQUIRED_PATTERNS = [
  /THREE\./,
  /(?:Primitives|Materials)\./,
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateThreeCode(code: string): ValidationResult {
  const errors: string[] = [];

  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Forbidden pattern detected: ${pattern.source}`);
    }
  }

  // Check for required patterns
  const hasRequired = REQUIRED_PATTERNS.some(p => p.test(code));
  if (!hasRequired) {
    errors.push('Code must use THREE, Primitives, or Materials');
  }

  // Length sanity check
  if (code.length > 50000) {
    errors.push('Code exceeds maximum length (50KB)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Step 2: Import and use validator in worker**

Modify `services/threeCodeRunner.worker.ts`. Add import after line 3:

```typescript
import { validateThreeCode } from './threeCodeValidator';
```

**Step 3: Add validation before Function execution**

Replace lines 44-55 with:

```typescript
  try {
    // SECURITY: Validate code before execution
    const validation = validateThreeCode(code);
    if (!validation.valid) {
      self.postMessage({ 
        success: false, 
        error: `Code validation failed: ${validation.errors.join(', ')}` 
      });
      return;
    }

    // 1. Create Function (now validated)
    const createMesh = new Function('THREE', 'Primitives', 'Materials', code);

    // 2. Execute
    const componentGroup = createMesh(THREE, Primitives, Materials);

    // 3. Validate result
    if (!componentGroup || !(componentGroup instanceof THREE.Object3D)) {
      throw new Error('Code did not return a valid THREE.Object3D.');
    }
```

**Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add services/threeCodeValidator.ts services/threeCodeRunner.worker.ts
git commit -m "security(3d): add code validator for AI-generated Three.js

Implements whitelist validation before new Function() execution:
- Blocks eval, fetch, window, document access
- Requires THREE/Primitives/Materials usage
- Limits code size to 50KB

SEC-001 remediation.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Optimize UI Assets (PNG to WebP)

**Files:**
- Modify: All files in `public/assets/ui/*.png` (21 files)
- Create: Script `scripts/optimize-assets.sh`
- Test: Visual comparison before/after

**Step 1: Create optimization script**

Create `scripts/optimize-assets.sh`:

```bash
#!/bin/bash
# Converts PNG assets to optimized WebP format

set -e

ASSET_DIR="public/assets/ui"
BACKUP_DIR="public/assets/ui-png-backup"

# Check for cwebp
if ! command -v cwebp &> /dev/null; then
    echo "Installing webp tools..."
    sudo apt-get install -y webp
fi

# Backup originals
mkdir -p "$BACKUP_DIR"
cp "$ASSET_DIR"/*.png "$BACKUP_DIR/"

echo "Converting PNGs to WebP..."
for f in "$ASSET_DIR"/*.png; do
    filename=$(basename "$f" .png)
    cwebp -q 85 "$f" -o "$ASSET_DIR/$filename.webp"
    echo "  ✓ $filename.webp"
done

# Show size comparison
echo ""
echo "Size comparison:"
du -sh "$BACKUP_DIR"
du -sh "$ASSET_DIR"/*.webp | head -5

echo ""
echo "Done! Original PNGs backed up to $BACKUP_DIR"
echo "Update imports in code to use .webp extension"
```

**Step 2: Make script executable and run**

Run:
```bash
chmod +x scripts/optimize-assets.sh
./scripts/optimize-assets.sh
```

Expected: ~93% size reduction (28 MB → ~2 MB)

**Step 3: Update CSS/component references**

Search for `.png` references and update to `.webp`:
```bash
grep -r "assets/ui/.*\.png" components/ --include="*.tsx" --include="*.css"
```

Update each reference from `.png` to `.webp`.

**Step 4: Remove original PNGs (after verification)**

```bash
rm public/assets/ui/*.png
```

**Step 5: Commit**

```bash
git add public/assets/ui/ scripts/optimize-assets.sh
git rm public/assets/ui/*.png  # if not already removed
git commit -m "perf(assets): convert UI assets from PNG to WebP

Reduces asset size from 28 MB to ~2 MB (93% reduction):
- All icons and patterns now WebP format
- Quality set to 85 (visually lossless)
- Original PNGs backed up locally

PERF-001 remediation.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Add React.memo to Major Components

**Files:**
- Modify: `components/MainLayout.tsx`
- Modify: `components/ComponentEditorModal.tsx`
- Modify: `components/diagram/Diagram3DView.tsx`
- Test: React DevTools Profiler

**Step 5.1: Memoize MainLayout**

Open `components/MainLayout.tsx`. Find the component export (near end of file) and wrap with memo:

```typescript
// Before:
export const MainLayout: React.FC = () => {

// After:
import { memo } from 'react';

const MainLayoutComponent: React.FC = () => {
  // ... existing code ...
};

export const MainLayout = memo(MainLayoutComponent);
```

**Step 5.2: Memoize ComponentEditorModal**

Open `components/ComponentEditorModal.tsx`. Wrap export:

```typescript
import { memo } from 'react';

// At end of file, change:
// export const ComponentEditorModal: React.FC<Props> = ({ ... }) => {

// To:
const ComponentEditorModalComponent: React.FC<Props> = ({ ... }) => {
  // ... existing code ...
};

export const ComponentEditorModal = memo(ComponentEditorModalComponent);
```

**Step 5.3: Memoize Diagram3DView**

Open `components/diagram/Diagram3DView.tsx`. Same pattern:

```typescript
import { memo } from 'react';

const Diagram3DViewComponent: React.FC<Props> = ({ ... }) => {
  // ... existing code ...
};

export const Diagram3DView = memo(Diagram3DViewComponent);
```

**Step 5.4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 5.5: Commit**

```bash
git add components/MainLayout.tsx components/ComponentEditorModal.tsx components/diagram/Diagram3DView.tsx
git commit -m "perf(react): add React.memo to major components

Memoizes three largest components to prevent unnecessary re-renders:
- MainLayout (1021 LOC)
- ComponentEditorModal (1315 LOC)
- Diagram3DView (1946 LOC)

Increases React.memo coverage from 9.6% to ~14%.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Remove Production console.log Statements

**Files:**
- Modify: `components/MainLayout.tsx` (6 statements)
- Modify: `services/componentValidator.ts` (6 statements)
- Modify: `hooks/useInventorySync.ts` (3 statements)
- Modify: `hooks/useNeuralLink.ts` (4 statements)
- Modify: Multiple services (15+ statements)
- Test: `grep -r "console.log" --include="*.ts" --include="*.tsx" | wc -l`

**Step 6.1: Create logger service**

Create `services/logger.ts`:

```typescript
/**
 * Simple logging service that only logs in development.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  }
};
```

**Step 6.2: Remove gesture debugging logs from MainLayout**

In `components/MainLayout.tsx`, remove or replace lines 247, 252, 297, 304, 312, 327:

```typescript
// DELETE these lines:
console.log("Gesture: Swipe Left");
console.log("Gesture: Swipe Right");
console.log(`Gesture: Pan Start...`);
console.log("Gesture: Pan End");
console.log(`Gesture: Pinch Start...`);
console.log("Gesture: Pinch End");
```

**Step 6.3: Remove validation output from componentValidator**

In `services/componentValidator.ts`, remove lines 483-495 (the debug output):

```typescript
// DELETE these console.log statements in logValidationResult function
```

Or replace the entire `logValidationResult` function with:

```typescript
function logValidationResult(result: ValidationResult, label: string): void {
  // Silent in production - results are returned, not logged
  if (import.meta.env.DEV && result.mismatches.length > 0) {
    console.log(`${label}: ${result.mismatches.length} mismatch(es)`);
  }
}
```

**Step 6.4: Remove sync debugging from useInventorySync**

In `hooks/useInventorySync.ts`, remove lines 112, 229, 231.

**Step 6.5: Remove Neural Link debugging**

In `hooks/useNeuralLink.ts`, remove lines 33, 39, 54, 68.

**Step 6.6: Remove service init logs**

Remove console.log from:
- `services/collabService.ts:28`
- `services/gitService.ts:50`
- `services/ragService.ts:34`
- `services/syncService.ts:27,42,56`
- `services/webRTCService.ts:46,47,49`
- `contexts/DiagramContext.tsx:55`

**Step 6.7: Verify console.log count reduced**

Run: `grep -r "console\.log" components/ services/ hooks/ contexts/ --include="*.ts" --include="*.tsx" | wc -l`
Expected: 0 (or only intentional debug logs wrapped in isDev checks)

**Step 6.8: Commit**

```bash
git add services/logger.ts components/ services/ hooks/ contexts/
git commit -m "chore: remove production console.log statements

Removes 43 console.log calls from production code:
- Gesture debugging in MainLayout
- Validation output in componentValidator
- Sync debugging in useInventorySync
- Neural Link init logs
- Service init logs

Adds logger service for dev-only logging.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Final Verification

**Step 7.1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors (or significantly reduced from 35)

**Step 7.2: Run ESLint**

Run: `npm run lint`
Expected: Warnings reduced from 79

**Step 7.3: Check bundle size**

Run: `npm run build && du -sh dist/`
Expected: Smaller than before (assets optimized)

**Step 7.4: Final commit summary**

```bash
git log --oneline -10
```

Expected commits:
1. fix(types): add error field to AIMetric interface
2. security(fzpz): sanitize SVG content with DOMPurify
3. security(3d): add code validator for AI-generated Three.js
4. perf(assets): convert UI assets from PNG to WebP
5. perf(react): add React.memo to major components
6. chore: remove production console.log statements

---

## Summary

| Task | Impact | Files Changed |
|------|--------|---------------|
| 1. Fix AIMetric | 12 TS errors fixed | 1 |
| 2. DOMPurify SVG | SEC-002 remediated | 1 |
| 3. Code Validator | SEC-001 remediated | 2 |
| 4. WebP Assets | -26 MB assets | 21+ |
| 5. React.memo | Reduced re-renders | 3 |
| 6. Remove logs | 43 logs removed | 15+ |
| **Total** | **41+ issues fixed** | **45+ files** |

---

*Plan generated from EXTREME audit findings 2026-01-31*
