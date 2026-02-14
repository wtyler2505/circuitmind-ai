# 06 - Build System, Configuration, and Infrastructure

## Table of Contents

1. [Overview](#overview)
2. [Vite Configuration](#vite-configuration)
3. [TypeScript Configuration](#typescript-configuration)
4. [Package.json - Scripts](#packagejson---scripts)
5. [Dependencies (Runtime)](#dependencies-runtime)
6. [DevDependencies](#devdependencies)
7. [Code Splitting Strategy](#code-splitting-strategy)
8. [PWA Configuration](#pwa-configuration)
9. [ESLint Configuration](#eslint-configuration)
10. [Prettier Configuration](#prettier-configuration)
11. [Test Infrastructure](#test-infrastructure)
12. [Entry Points and Bootstrap](#entry-points-and-bootstrap)
13. [Environment Variables](#environment-variables)
14. [Scripts Directory](#scripts-directory)
15. [Public Directory and Static Assets](#public-directory-and-static-assets)
16. [HTML Entry Point](#html-entry-point)
17. [Bundle Optimization History](#bundle-optimization-history)

---

## Overview

CircuitMind AI uses a modern JavaScript build pipeline centered on **Vite 6.x** as the build tool and dev server, **TypeScript 5.8** for type safety, and a flat project layout (no `src/` directory). The build system produces a Progressive Web App (PWA) with aggressive code splitting across 10 vendor chunks, lazy-loaded feature modules, and a service worker with tiered caching strategies. The production bundle has been optimized from 414KB down to approximately 150KB gzipped.

**Key Build Facts:**
- Build tool: Vite 6.2+ (Rollup under the hood for production)
- Dev server: localhost:3000, HMR enabled, all network interfaces (`0.0.0.0`)
- Module system: ES Modules (`"type": "module"` in package.json)
- Target: ES2022
- CSS: Tailwind CSS v4 with PostCSS
- Testing: Vitest 4.x with jsdom environment
- Visual testing: Playwright
- PWA: vite-plugin-pwa with Workbox service worker
- Chunk size warning threshold: 400KB

---

## Vite Configuration

**File:** `vite.config.ts`

The Vite configuration uses a function form (`defineConfig(({ mode }) => {...})`) to access the build mode and load environment variables.

### Plugins

| Plugin | Package | Purpose |
|--------|---------|---------|
| `react()` | `@vitejs/plugin-react` v5.0 | React Fast Refresh for HMR, JSX transform (automatic runtime), Babel integration for development |
| `nodePolyfills()` | `vite-plugin-node-polyfills` v0.25 | Provides Node.js polyfills for browser environment. Enables `Buffer`, `global`, and `process` globals. Required by `isomorphic-git` which expects Node.js Buffer API |
| `VitePWA()` | `vite-plugin-pwa` v1.2 | Generates service worker (Workbox), web app manifest, handles asset precaching, enables offline support. Auto-update registration |

### Dev Server Configuration

```typescript
server: {
  port: 3000,        // Fixed development port
  host: '0.0.0.0',   // Listen on all network interfaces (enables LAN access for mobile testing)
}
```

- No HTTPS configuration (development only)
- No proxy configuration (API calls go directly to external services)
- HMR is enabled by default through `@vitejs/plugin-react`

### Build Configuration

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: { /* 10 vendor chunks */ }
    }
  },
  chunkSizeWarningLimit: 400,  // 400KB warning threshold
}
```

The `chunkSizeWarningLimit` of 400KB means Vite will warn during build if any output chunk exceeds this size. This acts as a guardrail against bundle bloat regression.

### Path Resolution and Aliases

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, '.'),
    // Production-only: replace axe-core with empty stub
    ...(mode === 'production' ? { 'axe-core': path.resolve(__dirname, 'scripts/empty-module.js') } : {}),
  }
}
```

- `@/*` maps to the project root (e.g., `@/components/Foo` resolves to `./components/Foo`)
- In production builds, `axe-core` is aliased to `scripts/empty-module.js` -- a 3-line stub that exports a no-op `run()` method. This eliminates the ~400KB axe-core library from production bundles since it is only used for development-time accessibility auditing

### Environment Variable Injection

```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

The `GEMINI_API_KEY` from `.env.local` (loaded via `loadEnv(mode, '.', '')`) is injected as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` at build time via Vite's `define` option. These become string literals in the output bundle.

### Vitest Configuration (Inline)

```typescript
test: {
  environment: 'jsdom',      // Browser-like DOM environment
  setupFiles: './tests/setup.tsx',  // Global test setup
  globals: true,              // Vitest globals (describe, it, expect, vi) available without imports
  clearMocks: true,           // Auto-clear mock state between tests
}
```

---

## TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "types": ["node", "vite/client", "vitest/globals"],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": { "@/*": ["./*"] },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

### Compiler Options Explained

| Option | Value | Purpose |
|--------|-------|---------|
| `target` | `ES2022` | Output ES2022 JavaScript. Enables top-level await, class fields, `Array.at()`, `Object.hasOwn()`. All modern browsers support this |
| `module` | `ESNext` | Use latest ESM module syntax. Vite handles module bundling |
| `lib` | `ES2022, DOM, DOM.Iterable` | Include type definitions for ES2022 language features plus full browser DOM API |
| `moduleResolution` | `bundler` | Use bundler-style resolution (follows Vite/esbuild/Rollup conventions). Supports package.json `exports` field |
| `jsx` | `react-jsx` | Use React 17+ automatic JSX transform (no need for `import React` in every file) |
| `isolatedModules` | `true` | Ensures each file can be independently transpiled (required by Vite's esbuild transpilation) |
| `moduleDetection` | `force` | Treat all files as modules (even without import/export statements) |
| `skipLibCheck` | `true` | Skip type checking of `.d.ts` files for faster compilation |
| `allowJs` | `true` | Allow importing JavaScript files alongside TypeScript |
| `allowImportingTsExtensions` | `true` | Allow imports with `.ts`/`.tsx` extensions (Vite resolves these at build time) |
| `noEmit` | `true` | TypeScript is used only for type checking, not code generation. Vite/esbuild handles transpilation |
| `experimentalDecorators` | `true` | Enable TypeScript decorator syntax (may be used by some libraries) |
| `useDefineForClassFields` | `false` | Use legacy class field initialization (compatibility with some decorator patterns) |
| `paths` | `@/* -> ./*` | Path alias for project root imports. Mirrors Vite's `resolve.alias` configuration |
| `types` | `node, vite/client, vitest/globals` | Include type definitions for Node.js APIs, Vite client types (`import.meta.env`), and Vitest global test functions |

### Notable Absences

- **No `strict: true`** -- The project does not enable TypeScript strict mode. Individual strict checks like `strictNullChecks`, `strictFunctionTypes`, etc. are at their default values (off)
- **No `include`/`exclude` arrays** -- All `.ts`/`.tsx` files in the project root are included by default
- **No `outDir`** -- Since `noEmit` is true, no output directory is needed
- **No `baseUrl`** -- The `paths` configuration handles import resolution

---

## Package.json - Scripts

**File:** `package.json`

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start Vite dev server on port 3000 with HMR. Serves TypeScript directly via esbuild transformation |
| `build` | `vite build` | Production build using Rollup. Outputs to `dist/`. Applies code splitting, tree shaking, minification, and PWA asset generation |
| `preview` | `vite preview` | Serve the production build locally for testing. Uses `dist/` output from `build` |
| `test` | `vitest run` | Run all tests once (non-watch mode). Uses jsdom environment with `tests/setup.tsx` as global setup |
| `test:watch` | `vitest` | Run Vitest in watch mode. Re-runs affected tests on file changes |
| `lint` | `eslint . --ext .ts,.tsx` | Run ESLint on all TypeScript files in the project. Uses flat config from `eslint.config.js` |
| `lint:fix` | `eslint . --ext .ts,.tsx --fix` | Run ESLint with auto-fix enabled. Automatically corrects fixable issues |
| `format` | `prettier --write "**/*.{ts,tsx,json,css,md}"` | Format all source files in-place using Prettier. Covers TypeScript, JSON, CSS, and Markdown |
| `format:check` | `prettier --check "**/*.{ts,tsx,json,css,md}"` | Check formatting without modifying files. Returns non-zero exit code if any files are unformatted (suitable for CI) |
| `test:visual` | `playwright test scripts/capture-screenshots.ts` | Run Playwright visual tests that capture screenshots of the application UI at various states and viewport sizes |

---

## Dependencies (Runtime)

These are the production dependencies shipped to users in the browser bundle.

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.3 | UI framework. Version 19 with automatic JSX transform, concurrent features |
| `react-dom` | ^19.2.3 | React DOM renderer for web browser targets |

### AI Integration

| Package | Version | Purpose |
|---------|---------|---------|
| `@google/genai` | ^1.34.0 | Official Google Generative AI SDK. Provides access to Gemini 2.5 Pro/Flash, Imagen 3, Veo 2, TTS models. Core AI integration for chat, wiring generation, image analysis, code generation |
| `@google/gemini-cli` | ^0.26.0 | Google Gemini CLI tools |

### 3D Graphics

| Package | Version | Purpose |
|---------|---------|---------|
| `three` | ^0.182.0 | Three.js WebGL library for 3D component visualization. Lazy-loaded via `ThreeViewer` component in a separate chunk |

### Real-Time Collaboration

| Package | Version | Purpose |
|---------|---------|---------|
| `yjs` | ^13.6.29 | CRDT (Conflict-free Replicated Data Type) library for real-time collaborative editing. Manages shared document state |
| `y-webrtc` | ^10.3.0 | WebRTC transport provider for Yjs. Enables peer-to-peer real-time sync between collaborators without a central server |

### Internationalization

| Package | Version | Purpose |
|---------|---------|---------|
| `i18next` | ^25.8.0 | Core internationalization framework. Manages translation loading, interpolation, and language detection |
| `i18next-browser-languagedetector` | ^8.2.0 | Detects user's preferred language from browser settings (navigator.language, cookies, localStorage) |
| `i18next-http-backend` | ^3.0.2 | Loads translation JSON files from the server (`/locales/en.json`, `/locales/es.json`) on demand |
| `react-i18next` | ^16.5.3 | React bindings for i18next. Provides `useTranslation` hook and `Trans` component |

### UI / Animation

| Package | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | ^12.29.0 | Animation library for React. Powers component transitions, page animations, gesture interactions, and layout animations throughout the UI |
| `react-grid-layout` | ^2.2.2 | Grid layout system for dashboard widgets. Enables drag-and-drop widget rearrangement in DashboardView |
| `virtua` | ^0.48.3 | Virtualized list rendering. Used for efficient rendering of long component inventories and chat message lists |
| `qrcode.react` | ^4.2.0 | QR code generation component. Used for sharing circuit designs or collaboration links |

### Data Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | ^3.7.0 | Chart library built on React and D3. Used for analytics dashboards, AI metrics visualization, and data plots |

### Document / Content

| Package | Version | Purpose |
|---------|---------|---------|
| `react-markdown` | ^10.1.0 | Renders Markdown content in React. Used in chat messages, component descriptions, and documentation panels |
| `remark-gfm` | ^4.0.1 | Remark plugin for GitHub Flavored Markdown. Adds support for tables, strikethrough, task lists, autolinks in Markdown rendering |
| `remark-breaks` | ^4.0.1 | Remark plugin that converts newlines in Markdown to `<br>` elements. Makes chat messages display line breaks as written |
| `jspdf` | ^4.0.0 | PDF generation library. Used for exporting circuit documentation, BOM (Bill of Materials) reports |
| `jszip` | ^3.10.1 | ZIP file creation/extraction. Used for handling FZPZ part files (which are ZIP archives containing XML metadata and SVG assets) |

### Search

| Package | Version | Purpose |
|---------|---------|---------|
| `minisearch` | ^7.2.0 | Lightweight full-text search engine. Powers the OmniSearch feature for searching components, commands, and settings |
| `client-vector-search` | ^0.2.0 | Client-side vector similarity search. Used for semantic search capabilities alongside MiniSearch's keyword search |

### Data Processing

| Package | Version | Purpose |
|---------|---------|---------|
| `papaparse` | ^5.5.3 | CSV parser. Used for importing/exporting BOM data and component lists in CSV format |
| `xml-js` | ^1.6.11 | XML to JSON converter. Used for parsing FZPZ part file XML metadata |
| `js-yaml` | ^4.1.1 | YAML parser/serializer. Used for parsing configuration and data files |

### Security

| Package | Version | Purpose |
|---------|---------|---------|
| `dompurify` | ^3.3.1 | HTML sanitization library. Sanitizes user-generated content and AI responses before rendering to prevent XSS attacks |

### Git Integration

| Package | Version | Purpose |
|---------|---------|---------|
| `isomorphic-git` | ^1.36.2 | Pure JavaScript Git implementation. Enables in-browser Git operations (commit, diff, branch) for circuit design version control |
| `@isomorphic-git/lightning-fs` | ^4.6.2 | In-memory filesystem for isomorphic-git. Provides a virtual filesystem backed by IndexedDB for Git repository storage |

### Computer Vision / Gesture

| Package | Version | Purpose |
|---------|---------|---------|
| `@mediapipe/tasks-vision` | ^0.10.32 | Google MediaPipe vision tasks. Enables hand landmark detection for gesture-based interaction with the circuit canvas |

### Polyfills

| Package | Version | Purpose |
|---------|---------|---------|
| `buffer` | ^6.0.3 | Node.js Buffer polyfill for the browser. Required by `isomorphic-git`. Attached to `window.Buffer` at startup in `index.tsx` |

### Type Definitions (Misplaced in Dependencies)

| Package | Version | Note |
|---------|---------|------|
| `@types/js-yaml` | ^4.0.9 | Type definitions for js-yaml. Should ideally be in devDependencies |
| `@types/react-grid-layout` | ^1.3.6 | Type definitions for react-grid-layout. Should ideally be in devDependencies |

---

## DevDependencies

These are development-only packages not included in the production bundle.

### Build Tools

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^6.2.0 | Build tool and dev server. Uses esbuild for development transpilation, Rollup for production bundling |
| `@vitejs/plugin-react` | ^5.0.0 | Vite plugin for React. Enables Fast Refresh HMR and automatic JSX transform via Babel |
| `vite-plugin-node-polyfills` | ^0.25.0 | Vite plugin providing Node.js polyfills (Buffer, global, process) for browser builds |
| `vite-plugin-pwa` | ^1.2.0 | Vite plugin for PWA generation. Creates service worker with Workbox, generates web app manifest |
| `typescript` | ~5.8.2 | TypeScript compiler. Used only for type checking (`noEmit: true`); actual transpilation done by esbuild/Rollup |

### CSS / Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4.1.18 | Utility-first CSS framework v4. Processes CSS using `@import "tailwindcss"` directive. Purges unused styles at build time |
| `@tailwindcss/postcss` | ^4.1.18 | PostCSS plugin for Tailwind CSS v4. Integrates Tailwind processing into the PostCSS pipeline |
| `postcss` | ^8.5.6 | CSS transformation tool. Runs Tailwind CSS and Autoprefixer as PostCSS plugins |
| `autoprefixer` | ^10.4.23 | PostCSS plugin that adds vendor prefixes to CSS rules based on browser support data (Can I Use) |

### Linting

| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^9.39.2 | JavaScript/TypeScript linter. Version 9 with flat config format |
| `@eslint/js` | ^9.39.2 | ESLint core JavaScript rules (recommended preset) |
| `@typescript-eslint/parser` | ^8.51.0 | ESLint parser for TypeScript. Enables ESLint to understand TypeScript syntax |
| `@typescript-eslint/eslint-plugin` | ^8.51.0 | ESLint rules specific to TypeScript. Provides `no-explicit-any`, `no-unused-vars`, and other TS-specific checks |
| `eslint-plugin-react` | ^7.37.5 | ESLint rules for React. Checks JSX syntax, prop types, component patterns |
| `eslint-plugin-react-hooks` | ^7.0.1 | ESLint rules for React Hooks. Enforces Rules of Hooks and dependency arrays |
| `eslint-plugin-react-refresh` | ^0.4.26 | ESLint rules for React Refresh (Vite HMR). Warns about exports that break Fast Refresh |
| `eslint-config-prettier` | ^10.1.8 | Disables ESLint rules that conflict with Prettier formatting. Applied as the last config entry |

### Formatting

| Package | Version | Purpose |
|---------|---------|---------|
| `prettier` | ^3.7.4 | Code formatter. Enforces consistent style across all source files |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | ^4.0.16 | Unit test framework. Vite-native, compatible with Jest API. Uses jsdom for DOM simulation |
| `jsdom` | ^27.4.0 | JavaScript DOM implementation. Provides browser-like environment for unit tests |
| `@testing-library/react` | ^16.3.1 | React testing utilities. Provides `render`, `screen`, `fireEvent`, `waitFor` for component testing |
| `@testing-library/jest-dom` | ^6.9.1 | Custom Jest/Vitest matchers for DOM assertions (`toBeVisible`, `toHaveClass`, `toBeInTheDocument`, etc.) |
| `@testing-library/user-event` | ^14.6.1 | Simulates realistic user interactions (typing, clicking, tabbing) in tests |
| `@playwright/test` | ^1.57.0 | End-to-end testing framework. Used for visual screenshot tests and DOM structure verification |
| `axe-core` | ^4.11.1 | Accessibility testing engine. Used in development mode for runtime a11y auditing and in tests via jest-axe |
| `jest-axe` | ^10.0.0 | Vitest/Jest matcher for axe-core. Provides `toHaveNoViolations` assertion for accessibility testing |

### Type Definitions

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/react` | ^19.2.7 | TypeScript types for React 19 |
| `@types/react-dom` | ^19.2.3 | TypeScript types for ReactDOM |
| `@types/three` | ^0.182.0 | TypeScript types for Three.js |
| `@types/node` | ^22.14.0 | TypeScript types for Node.js APIs |
| `@types/dompurify` | ^3.0.5 | TypeScript types for DOMPurify |
| `@types/papaparse` | ^5.5.2 | TypeScript types for PapaParse |
| `@types/jest-axe` | ^3.5.9 | TypeScript types for jest-axe matchers |

---

## Code Splitting Strategy

### Manual Chunks (Vendor Splitting)

The build configuration defines 10 vendor chunks to optimize caching and parallel loading:

| Chunk Name | Packages Included | Approximate Size | Caching Rationale |
|------------|-------------------|------------------|-------------------|
| `vendor-react` | `react`, `react-dom` | ~140KB | Core framework, changes rarely. Long cache lifetime |
| `vendor-three` | `three` | ~600KB raw | 3D engine, only loaded when ThreeViewer is opened. Lazy-loadable |
| `vendor-ai` | `@google/genai` | ~150KB | AI SDK, updates with API changes. Separate from core UI |
| `vendor-ui` | `framer-motion` | ~120KB | Animation library, relatively stable |
| `vendor-markdown` | `react-markdown`, `remark-gfm`, `remark-breaks` | ~80KB | Markdown rendering, loaded when chat messages display |
| `vendor-collab` | `yjs`, `y-webrtc` | ~100KB | Real-time collab CRDT, only needed in multiplayer mode |
| `vendor-git` | `isomorphic-git`, `@isomorphic-git/lightning-fs` | ~200KB | Git operations, only loaded when version control features are used |
| `vendor-charts` | `recharts` | ~300KB | Chart library, only needed for dashboard/analytics views |
| `vendor-i18n` | `i18next`, `i18next-browser-languagedetector`, `i18next-http-backend`, `react-i18next` | ~50KB | Internationalization, relatively stable |
| `vendor-pdf` | `jspdf` | ~300KB | PDF generation, only needed for export operations |

### Lazy Loading Boundaries

Two major components use React `lazy()` with dynamic `import()` for code splitting:

1. **ComponentEditorModal** -- Loaded when a user opens the component editor. Contains multi-tab form, AI assistant integration, and image handling. This prevents the editor's code from loading on initial page render.

2. **ThreeViewer** -- Loaded when the 3D MODEL tab is activated in the component editor. Pulls in the entire `vendor-three` chunk. This is the largest lazy boundary, keeping ~600KB of Three.js out of the initial load.

### Bundle Size History

| Milestone | Bundle Size (gzip) | What Changed |
|-----------|--------------------|--------------|
| Initial | ~414KB | Monolithic bundle, all dependencies loaded eagerly |
| After code splitting | ~200KB initial | Manual chunks separated vendor code; lazy loading for ThreeViewer and editor |
| After Tailwind v4 purge | ~170KB initial | Build-time CSS purging eliminated unused utility classes |
| After axe-core removal | ~150KB initial | axe-core replaced with empty stub in production via Vite alias |
| Current | ~150KB initial | Optimized with WebP assets, font subsetting, efficient tree shaking |

---

## PWA Configuration

### Web App Manifest

```typescript
manifest: {
  name: 'CircuitMind AI',
  short_name: 'CircuitMind',
  description: 'Intelligent Engineering OS for Electronics Prototyping',
  theme_color: '#050508',
  background_color: '#050508',
  display: 'standalone',
  icons: [
    { src: '/assets/ui/logo.png', sizes: '192x192', type: 'image/png' },
    { src: '/assets/ui/logo.png', sizes: '512x512', type: 'image/png' }
  ]
}
```

- `display: 'standalone'` -- App runs in its own window without browser chrome when installed
- Icons use PNG format for maximum PWA manifest compatibility across devices (WebP support in manifests is limited on older Android/iOS)
- Theme and background colors match the cyberpunk dark theme (`#050508`)

### Service Worker Configuration (Workbox)

```typescript
registerType: 'autoUpdate'  // Service worker updates automatically without user prompt
```

#### Precaching

```typescript
globPatterns: ['**/*.{js,css,html,ico,png,webp,svg}']
maximumFileSizeToCacheInBytes: 3 * 1024 * 1024  // 3MB per-file limit
navigateFallback: 'index.html'  // SPA fallback for all navigation requests
```

- All JS, CSS, HTML, and image assets are precached on first visit
- 3MB per-file ceiling prevents caching excessively large chunks (e.g., source maps or unoptimized assets)
- `navigateFallback` ensures SPA routing works offline by serving `index.html` for all navigation requests

#### Runtime Caching Strategies

| URL Pattern | Strategy | Cache Name | Max Entries | Max Age | Purpose |
|-------------|----------|------------|-------------|---------|---------|
| `https://fonts.googleapis.com/*` | CacheFirst | `google-fonts-cache` | 10 | 365 days | Google Fonts are immutable once loaded; cache aggressively |
| `*.png, *.jpg, *.jpeg, *.svg, *.gif, *.webp` | CacheFirst | `images-cache` | 60 | 30 days | Static images rarely change; serve from cache, limit to 60 entries to manage storage |
| `*.js, *.css` | StaleWhileRevalidate | `static-resources` | 50 | 7 days | Serve cached version immediately while fetching update in background. Balances freshness with performance |

### Included Static Assets

```typescript
includeAssets: ['favicon.ico', 'assets/ui/*.webp', 'assets/ui/*.png', 'assets/ui/*.svg']
```

These assets are added to the precache manifest to ensure they are available offline.

---

## ESLint Configuration

**File:** `eslint.config.js` (ESLint 9 flat config format)

### Config Structure

The configuration is an array of config objects applied in order:

1. **Ignore patterns** -- Excludes `dist/`, `node_modules/`, `public/`, config files, `docs/`, `ref/`, and `scripts/` from linting
2. **Base JS recommended** -- `@eslint/js` recommended rules
3. **TypeScript files** -- Main rule set for `.ts` and `.tsx` files
4. **Test files** -- Relaxed rules for test files
5. **Prettier config** -- Disables formatting-related ESLint rules (must be last)

### Plugins Used

| Plugin | Purpose |
|--------|---------|
| `@typescript-eslint` | TypeScript-specific linting rules |
| `react` | React JSX and component pattern rules |
| `react-hooks` | Rules of Hooks enforcement and exhaustive-deps checking |
| `react-refresh` | Vite HMR compatibility warnings |

### Key Rules

| Rule | Severity | Configuration |
|------|----------|---------------|
| `@typescript-eslint/no-explicit-any` | warn | Discourages `any` usage but does not block builds |
| `@typescript-eslint/no-unused-vars` | warn | Allows underscore-prefixed vars (`_foo`), args (`_e`), and caught errors (`_err`) |
| `react/react-in-jsx-scope` | off | Not needed with React 17+ automatic JSX transform |
| `react/prop-types` | off | TypeScript interfaces replace PropTypes |
| `react-hooks/rules-of-hooks` | error | Enforces hooks are called at top level and from React functions only |
| `react-hooks/exhaustive-deps` | warn | Warns about missing dependencies in useEffect/useMemo/useCallback |
| `react-refresh/only-export-components` | warn | Warns about non-component exports that break Fast Refresh. Allows constant exports |
| `no-console` | off | Console logging is permitted (development tool) |
| `no-debugger` | warn | Warns about debugger statements |
| `prefer-const` | warn | Prefers const over let when variable is never reassigned |
| `no-var` | error | Disallows var declarations |
| `eqeqeq` | warn | Requires strict equality (`===`) except for null comparisons |

### Test File Overrides

For files matching `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `**/*.spec.tsx`, and `**/tests/**/*.ts`:

- `@typescript-eslint/no-explicit-any` is set to `off` (any usage is acceptable in tests)
- Additional globals are declared: `describe`, `it`, `test`, `expect`, `vi`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll`, `JSX`, `XMLHttpRequest`

### Browser Globals

The ESLint config declares an extensive list of browser globals (~100+) as `readonly` to prevent "no-undef" errors. This includes:
- Standard DOM APIs (window, document, localStorage, sessionStorage)
- Media APIs (MediaRecorder, MediaStream, AudioContext)
- Observer APIs (MutationObserver, IntersectionObserver, ResizeObserver)
- Event types (MouseEvent, KeyboardEvent, DragEvent, PointerEvent)
- WebRTC APIs (RTCPeerConnection, RTCSessionDescription)
- Web Workers (Worker, OffscreenCanvas)
- IndexedDB APIs
- Encoding utilities (btoa, atob, TextEncoder, TextDecoder)
- Node.js globals for config files (process, __dirname, module, require)

---

## Prettier Configuration

**File:** `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": false
}
```

| Option | Value | Effect |
|--------|-------|--------|
| `semi` | `true` | Semicolons at end of statements |
| `singleQuote` | `true` | Single quotes for strings (except JSX) |
| `tabWidth` | `2` | 2-space indentation |
| `trailingComma` | `es5` | Trailing commas in objects, arrays, function parameters (ES5-compatible positions) |
| `printWidth` | `100` | Line wrap at 100 characters |
| `bracketSpacing` | `true` | Spaces inside object literals: `{ foo: bar }` |
| `bracketSameLine` | `false` | JSX closing bracket on new line |
| `arrowParens` | `always` | Always parenthesize arrow function parameters: `(x) => x` |
| `endOfLine` | `lf` | Unix-style line endings |
| `jsxSingleQuote` | `false` | Double quotes in JSX attributes: `<div className="foo">` |

### Prettier Ignore

**File:** `.prettierignore`

```
dist
node_modules
*.min.js
*.min.css
package-lock.json
```

---

## Test Infrastructure

### Test Framework: Vitest

Vitest is configured inline in `vite.config.ts` and integrates seamlessly with Vite's module resolution and transformation pipeline.

**Test environment:** jsdom (browser DOM simulation)
**Global setup file:** `tests/setup.tsx`

### Global Test Setup (`tests/setup.tsx`)

The setup file runs before every test file and configures:

1. **Jest-DOM matchers** -- Imports `@testing-library/jest-dom` for assertions like `toBeInTheDocument()`, `toHaveClass()`, `toBeVisible()`

2. **Axe accessibility matchers** -- Extends Vitest's `expect` with `toHaveNoViolations` from `jest-axe` for automated accessibility testing

3. **IndexedDB mock** -- Provides a mock `indexedDB` implementation with:
   - `open()` returns a mock request with `result`, `onupgradeneeded`, `onsuccess` handlers
   - Mock transactions with `objectStore()` returning stubs for `get`, `put`, `delete`, `getAll`, `openCursor`, `createIndex`
   - Async callbacks via `setTimeout` to simulate real IndexedDB behavior

4. **DOM API mocks:**
   - `HTMLElement.prototype.scrollIntoView` -- mocked as no-op
   - `HTMLElement.prototype.scrollTo` -- mocked as no-op
   - `ResizeObserver` -- mocked with `observe`, `unobserve`, `disconnect` stubs

5. **Library mocks:**
   - `virtua` -- Mocked to render simple `<div>` wrappers instead of virtualized lists (VList, VGrid)

6. **Cleanup (afterEach):**
   - `cleanup()` from testing-library (unmounts rendered components)
   - `vi.clearAllMocks()` (resets all mock implementations and call history)
   - `localStorage.clear()` and `sessionStorage.clear()` (prevents test pollution)

### Accessibility Tests

**File:** `tests/accessibility.test.tsx`

Dedicated test file for WCAG compliance. Uses `jest-axe` to run axe-core against rendered components and assert zero violations. 10 tests currently passing.

### Visual Tests (Playwright)

**Script:** `npm run test:visual` runs `playwright test scripts/capture-screenshots.ts`

The Playwright tests navigate to the running dev server and capture screenshots of every major UI state:
- App shell at multiple viewport sizes (1920x1080, 1440x900, 1280x720, 768x1024, 375x812)
- Header elements (logo, buttons, controls)
- Inventory panel (tabs, filters, component cards, hover states)
- Settings modal (tabs: API Key, AI Autonomy)
- Component editor modal (tabs: INFO, EDIT, IMAGE, 3D MODEL)
- Chat panel (input, mode buttons, messages)
- Canvas/diagram area (SVG, zoom controls)
- All buttons (normal and hover states)
- Form elements (empty, focused, filled states)
- Typography samples (h1, h2, h3)

Screenshots are saved to `docs/screenshots/` and a `MANIFEST.md` is auto-generated.

---

## Entry Points and Bootstrap

### HTML Entry Point (`index.html`)

The HTML file serves as the Vite entry point and provides:

1. **Meta tags:** UTF-8 charset, responsive viewport meta tag
2. **Favicon:** PNG favicon at `/favicon.png`
3. **Google Fonts:** Preloads IBM Plex Sans Condensed (300-700 weights) and IBM Plex Mono (400, 600) via Google Fonts CDN
4. **Import map:** Provides browser-native import map for ESM resolution (React, ReactDOM, Three.js, Google GenAI from esm.sh CDN). This import map is primarily for development; the production build bundles all dependencies via Rollup
5. **CSS:** Links to `/index.css` which contains Tailwind CSS directives and custom theme variables
6. **Skip link:** Accessibility skip-to-content link (`<a href="#main-content" class="skip-link">`)
7. **Loading screen:** Inline CSS and HTML for a boot animation (pulsing logo, scanning progress bar, "System Boot Sequence" text) displayed inside `<div id="root">` before React hydrates
8. **Script tag:** `<script type="module" src="/index.tsx">` loads the TypeScript entry point (Vite transforms this on the fly)

### JavaScript Entry Point (`index.tsx`)

The JavaScript bootstrap sequence:

1. **Buffer polyfill:** Attaches Node.js `Buffer` to `window.Buffer` for `isomorphic-git` compatibility
2. **GlobalErrorBoundary:** Class component that catches uncaught React errors and displays a red-themed crash screen with error message, stack trace, and a "REBOOT SYSTEM" button
3. **Axe-core development auditing:** Conditionally imports `axe-core` only in development mode (`import.meta.env.DEV`). Runs accessibility audit on `document.body` 2 seconds after initial render, logging violations to the console with severity-colored grouping
4. **React rendering:** Creates a React root on `<div id="root">`, renders the app wrapped in:
   - `React.StrictMode` (enables development warnings and double-rendering checks)
   - `GlobalErrorBoundary` (catches and displays fatal errors)
   - `ToastProvider` (notification context)
   - `App` (main application component with 17 nested context providers)

---

## Environment Variables

| Variable | Source | Required | Purpose |
|----------|--------|----------|---------|
| `GEMINI_API_KEY` | `.env.local` file | Yes | Google Gemini API key for all AI features. Loaded by Vite's `loadEnv()` and injected via `define` as `process.env.GEMINI_API_KEY` and `process.env.API_KEY` |
| `import.meta.env.DEV` | Vite (automatic) | N/A | Boolean flag, `true` in development. Gates axe-core accessibility auditing (dev-only) |
| `import.meta.env.MODE` | Vite (automatic) | N/A | Build mode string ('development' or 'production'). Used internally by Vite |
| `CIRCUITMIND_BASE_URL` | Process env | No | Override base URL for Playwright tests. Defaults to `http://localhost:3000` |

### API Key Storage at Runtime

The Gemini API key is stored in `localStorage` under the key `cm_gemini_api_key`. Users can set it via the Settings modal API Key tab. The build-time injection via `process.env.GEMINI_API_KEY` provides a default value from `.env.local`, but users can override it in the UI.

---

## Scripts Directory

**Path:** `scripts/`

| Script | Language | Purpose |
|--------|----------|---------|
| `empty-module.js` | JavaScript | 3-line stub module that replaces `axe-core` in production builds. Exports `{ run: () => Promise.resolve({ violations: [] }) }` |
| `optimize-assets.sh` | Bash | Converts PNG assets in `public/assets/ui/` to WebP format using ImageMagick (`convert` command) at quality 85. Backs up originals to `public/assets/ui-png-backup/`. Reports size savings |
| `build-parts-manifest.ts` | TypeScript | Reads all `.fzpz` files from `public/parts/`, extracts metadata (module ID, name, type, pins) from the FZP XML inside each ZIP, and writes `public/parts/parts-manifest.json` |
| `generate-starter-kit.py` | Python | Generates Fritzing-compatible `.fzpz` part files from scratch. Creates Arduino Uno R3, Resistor 220 Ohm, LED 5mm Red, DHT11 sensor, Breadboard Large, and ESP32 DevKit V1 with proper FZP XML, breadboard/schematic/PCB SVGs, all packaged as ZIP files |
| `capture-screenshots.ts` | TypeScript (Playwright) | Comprehensive UI screenshot catalog. Captures every UI element, state, and interaction across 13 categories. Generates `MANIFEST.md` index |
| `capture-all.ts` | TypeScript (Playwright) | Enhanced version of capture-screenshots with Playwright best practices: role-based selectors, auto-waiting, disabled animations, contextual sizing. Injects test data for realistic captures |
| `capture-debug.ts` | TypeScript (Playwright) | Debug script for inspecting actual DOM structure. Logs button inventories, modal structures, SVG elements, zoom controls, and 3D viewer canvas elements |
| `download-inventory-assets.ts` | TypeScript | Downloads external inventory images (from Unsplash) to `public/assets/inventory/` for offline use. Localizes assets to satisfy ORB policies |
| `run-omni-audit.ts` | TypeScript | System health audit script. Runs test suite, npm security audit, network connectivity checks (Gemini API, signaling server), and resource usage (disk, memory). Outputs scored readiness report to `audit_report.json` |
| `verify_fzpz_complex.py` | Python | Verification script for FZPZ part file integrity |
| `verify_fzpz_skill.py` | Python | FZPZ skill verification script |
| `verify-fzpz-visuals.ts` | TypeScript (Playwright) | Visual verification of FZPZ components. Adds parts to canvas via UI automation and captures screenshots for visual diff |

---

## Public Directory and Static Assets

**Path:** `public/`

### Directory Structure

```
public/
  favicon.ico                   # Browser tab icon (ICO format)
  favicon.png                   # Browser tab icon (PNG format)
  locales/
    en.json                     # English translations
    es.json                     # Spanish translations
  assets/
    inventory/                  # Component thumbnail images
      mcu-arduino.jpg           # Arduino board photo
      mcu-blynk.png             # Blynk board photo
      mcu-generic.jpg           # Generic MCU photo
      sensor-encoder.jpg        # Rotary encoder photo
      sensor-flame.png          # Flame sensor photo
      sensor-ldr.jpg            # Light-dependent resistor photo
      sensor-obstacle.jpg       # Obstacle sensor photo
      sensor-soil.png           # Soil moisture sensor photo
      sensor-sound.jpg          # Sound sensor photo
    mediapipe/                  # MediaPipe vision model files (self-hosted)
      gestureWorker.js          # Web Worker for gesture processing
      hand_landmarker.task      # Hand landmark detection model
      tasks-vision.js           # MediaPipe tasks-vision bundle
      vision_bundle_classic.js  # Classic vision bundle
      vision_bundle.js          # Main vision bundle
      vision_wasm_internal.js   # WASM module loader
      vision_wasm_internal.wasm # WASM binary (~5MB)
    ui/                         # Application UI assets (WebP optimized)
      logo.png                  # App logo (PNG for PWA manifest)
      logo.webp                 # App logo (WebP for in-app use)
      flourish.webp             # Decorative flourish
      action-*.webp             # Toolbar action icons (2d, 3d, grid, load, redo, save, settings, undo, voice, zoom-in, zoom-out)
      icon-*.webp               # Component type icons (actuator, microcontroller, power, sensor)
      loading.webp              # Loading indicator
      pattern-*.webp            # Background patterns (brushed, carbon, circuit)
    ui-png-backup/              # Original PNG versions of UI assets (backup from WebP conversion)
  parts/                        # Fritzing FZPZ part files
    Arduino_Uno_R3.fzpz         # Arduino Uno R3 part definition
    Breadboard_Large.fzpz       # 830-point breadboard
    DHT11.fzpz                  # DHT11 temperature/humidity sensor
    ESP32_DevKit_V1.fzpz        # ESP32 development board
    LED_5mm_Red.fzpz            # 5mm red LED
    Resistor_220_Ohm.fzpz       # 220 Ohm resistor
    parts-manifest.json         # Auto-generated manifest indexing all FZPZ files with metadata (IDs, names, types, pins)
```

### Asset Optimization

- UI assets are stored in WebP format (converted from PNG via `scripts/optimize-assets.sh`) at quality 85 for significant size reduction
- Original PNG files are preserved in `ui-png-backup/` for reference
- The PWA manifest uses PNG icons for maximum device compatibility
- MediaPipe model files are self-hosted rather than loaded from CDN, ensuring offline availability and reducing external dependencies
- FZPZ parts are ZIP archives containing FZP XML metadata and SVG views (breadboard, schematic, PCB)

### Localization Files

Two translation files are served from `public/locales/`:
- `en.json` -- English (primary language)
- `es.json` -- Spanish

These are loaded by `i18next-http-backend` at runtime based on browser language detection.

---

## HTML Entry Point

**File:** `index.html`

### Import Map

The HTML includes a browser-native import map pointing to esm.sh CDN:

```html
<script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "@google/genai": "https://esm.sh/@google/genai@^1.34.0",
    "three": "https://esm.sh/three@0.173.0",
    "three/addons/": "https://esm.sh/three@0.173.0/examples/jsm/",
    "three/": "https://esm.sh/three@^0.182.0/"
  }
}
</script>
```

This import map is used by the browser's native ES module loader in development. In production, Vite bundles everything via Rollup and the import map is not used.

### Boot Loading Screen

The HTML includes an inline loading animation inside `<div id="root">` that displays while React loads:
- Pulsing logo animation (`boot-pulse`: scales between 0.95-1.0 with opacity cycling)
- Scanning progress bar (`boot-scan`: cyan bar sweeping left to right)
- "System Boot Sequence" text in IBM Plex Mono, uppercase, cyan colored
- Dark background (`#050508`) matching the app theme

This inline content is replaced when React's `createRoot()` takes over the root element.

---

## Bundle Optimization History

### Techniques Applied

1. **Manual vendor chunking** -- 10 vendor chunks separate framework code (React), heavy libraries (Three.js, Recharts), and feature-specific dependencies (i18n, collab, git, PDF) so that unchanged chunks benefit from browser caching

2. **Lazy loading** -- ComponentEditorModal and ThreeViewer are loaded via React.lazy() with dynamic imports, keeping them out of the critical path

3. **axe-core production elimination** -- In production builds, `axe-core` is aliased to a 3-line empty stub (`scripts/empty-module.js`), saving approximately 400KB from the bundle. The conditional import in `index.tsx` (`if (import.meta.env.DEV)`) ensures the import is tree-shaken, but the alias provides a belt-and-suspenders guarantee

4. **Tailwind CSS v4 purge** -- Tailwind v4's build-time purging eliminates unused CSS utility classes, keeping the stylesheet minimal

5. **WebP asset conversion** -- All UI PNG assets converted to WebP at quality 85 via `scripts/optimize-assets.sh`, reducing image payload by approximately 70%

6. **Font loading strategy** -- Google Fonts loaded with `display=swap` to prevent FOIT (Flash of Invisible Text). Only required weights are loaded

7. **Tree shaking** -- Vite/Rollup's production build eliminates dead code and unused exports across all modules

8. **Service worker caching** -- Workbox precaches all assets and uses tiered runtime caching (CacheFirst for fonts/images, StaleWhileRevalidate for JS/CSS) to minimize repeat downloads
