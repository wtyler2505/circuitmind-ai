# CircuitMind AI - Design System

> Documented from `index.css`, `tailwind.config.js` (now Tailwind v4 `@theme`), and component usage patterns.

## Typography

| Role | Font | CSS Variable |
|------|------|-------------|
| Body / Headings | IBM Plex Sans Condensed, IBM Plex Sans | `--font-sans` |
| Code / Monospace | IBM Plex Mono | `--font-mono` |

**Note**: The CLAUDE.md references Space Grotesk / JetBrains Mono, but the actual `index.css @theme` block uses IBM Plex Sans Condensed and IBM Plex Mono. The codebase is the source of truth.

### Text Size Rules (WCAG)

Minimum text sizes enforced via CSS `@layer base`:
```css
p, li, td, th, dd, dt, figcaption {
  font-size: max(0.6875rem, 11px);
}
```

## Color Palette

### Core Colors (from `@theme` in `index.css`)

| Token | CSS Variable | Value | Use |
|-------|-------------|-------|-----|
| Cyber Black | `--color-cyber-black` | `#050508` | App background |
| Cyber Dark | `--color-cyber-dark` | `#0a0a12` | Canvas surface |
| Cyber Card | `--color-cyber-card` | `#12121f` | Card backgrounds |
| Neon Cyan | `--color-neon-cyan` | `#00f3ff` | Primary energy, focus rings |
| Neon Purple | `--color-neon-purple` | `#bd00ff` | AI/assistant context |
| Neon Green | `--color-neon-green` | `#00ff9d` | Success, telemetry |
| Neon Amber | `--color-neon-amber` | `#ffaa00` | Warnings, debug mode |

### Component-Specific Colors

| Token | Value | Use |
|-------|-------|-----|
| `--color-arduino` | `#00979D` | Arduino-branded components |
| `--color-pcb` | `#1D5C4B` | PCB board surfaces |
| `--color-breadboard-white` | `#F8F8F8` | Breadboard body |
| `--color-breadboard-rail-blue` | `#3B82F6` | Power rail (negative) |
| `--color-breadboard-rail-red` | `#EF4444` | Power rail (positive) |
| `--color-chip` | `#1E1E1E` | IC chip body |
| `--color-copper` | `#9A916C` | Copper traces |
| `--color-lcd-green` | `#9ACD32` | LCD display |
| `--color-sensor-blue` | `#2563EB` | Sensor components |
| `--color-sensor-purple` | `#6D28D9` | Special sensors |

### Dynamic Mode Accents

The app supports mode-specific accent colors via `--mode-accent`:

```css
.mode-design { --mode-accent: #00ff9d; } /* neon-green */
.mode-wiring { --mode-accent: #00f3ff; } /* neon-cyan */
.mode-debug  { --mode-accent: #ffaa00; } /* neon-amber */
```

Tailwind class: `text-mode-accent`, `border-mode-accent`

## Z-Index Layers

| Layer | Z-Index | Components |
|-------|---------|------------|
| Canvas | z-0 | DiagramCanvas, Diagram3DView |
| Header | z-10 | AppHeader |
| Chat | z-20 | ChatPanel |
| Inventory | z-40 | Inventory sidebar |
| Modals | z-50 | ComponentEditorModal, SettingsPanel |
| Skip Link | z-[9999] | `.skip-link` (accessibility) |

## Glass Surface System

The app uses a multi-layered glass/industrial surface system:

### Surface Classes

| Class | Use | Key Properties |
|-------|-----|----------------|
| `.panel-surface` | Main panels | gradient bg, blur(20px), `rgba(10,12,16,0.95)` |
| `.panel-header` | Top bars | gradient bg, blur(12px), bottom border |
| `.panel-rail` | Thin separators | cyber-black bg, top border shadow |
| `.panel-toggle` | Toggle buttons | cyber-dark bg, hover accent glow |
| `.panel-frame` | Framing accents | corner decorations (8x8px) |
| `.panel-title` | Section titles | text-shadow with mode-accent, `letter-spacing: 0.15em` |

### Texture Overlays

Applied via `::before` pseudo-elements:

| Class | Pattern | Opacity |
|-------|---------|---------|
| `.panel-carbon` | `/assets/ui/pattern-carbon.webp` | 0.05 |
| `.panel-brushed` | `/assets/ui/pattern-brushed.webp` | 0.04 |
| `.panel-circuit` | `/assets/ui/pattern-circuit.webp` | 0.08 |
| `.panel-loading` | `/assets/ui/loading.webp` | 0.15, animated |

### Glass Refraction

`.panel-frame` includes a light-sweep hover effect via `::before` with `skewX(-25deg)` transform that slides left-to-right on hover.

## Geometry & Corners

**Hard edges are enforced globally**:
```css
*, *::before, *::after {
  border-radius: 0 !important;
}
```

### Cut-Corner Chamfers (clip-path)

| Class | Cut Size |
|-------|----------|
| `.cut-corner-sm` | 4px diagonal cut on all corners |
| `.cut-corner-md` | 8px diagonal cut on all corners |

## Interactive Elements

### Hit Targets

All interactive controls should maintain 44px minimum hit targets (WCAG 2.5.5).

### Button Patterns

| Class | Use | Visual |
|-------|-----|--------|
| `.control-tile` | Standard button | Dark bg, subtle border, hover brightens |
| `.chip-square` | Tag/chip button | cyber-black bg, hover cyan accent |
| `.panel-toggle` | Toggle control | Dark bg, hover glow + accent color |

### Quick Action Variants

| Class | Accent Color |
|-------|-------------|
| `.quick-action--cyan` | `rgba(0, 243, 255, 0.5)` left border |
| `.quick-action--amber` | `rgba(255, 170, 0, 0.5)` left border |
| `.quick-action--emerald` | `rgba(0, 255, 157, 0.5)` left border |
| `.quick-action--purple` | `rgba(189, 0, 255, 0.5)` left border |

## Chat Bubbles

| Class | Use | Visual |
|-------|-----|--------|
| `.message-slab` | Base message | Dark bg, subtle border |
| `.message-user` | User messages | Cyan tint gradient, cyan left border |
| `.message-assistant` | AI messages | Darker bg, slate left border |

## Animations

### Standard Animations (from `@theme`)

| Variable | Animation |
|----------|-----------|
| `--animate-pulse-slow` | 3s pulse, ease-in-out, infinite |
| `--animate-scan` | 2s vertical scan, linear, infinite |

### AI Highlight Animations

| Class | Purpose | Duration |
|-------|---------|----------|
| `.component-highlighted` | Component highlight pulse | 1.5s |
| `.telemetry-active` | Telemetry heartbeat (green) | 2s |
| `.logic-error` | Error flicker (red) | 0.5s |
| `.wire-highlighted` | Wire glow | 1s |
| `.wire-flow-ants` | Marching ants on wire | 1s |
| `.attention-ring` | AI action attention ring | 1s |
| `.shimmer-loading` | AI processing shimmer | 1.5s |
| `.slide-in-right` | AI suggestion slide-in | 0.3s |
| `.fade-up` | Action button fade-up | 0.2s |

### Typing Indicator

`.typing-dot` with staggered animation (nth-child delays: 0s, 0.2s, 0.4s).

## Canvas

### Grid Pattern

`.canvas-grid` uses layered backgrounds:
- Radial gradient glow (cyan top-left, amber top-right)
- 24px repeating grid lines (horizontal + vertical)
- 60px diagonal accent lines

### Canvas Surface

`.canvas-surface` uses `--color-cyber-dark` (`#0a0a12`) as base.

## Accessibility

### Focus Indicators (WCAG 2.4.7)

Global focus-visible rule for all interactive elements:
```css
button:focus-visible,
a:focus-visible,
[role="button"]:focus-visible,
[role="tab"]:focus-visible,
[tabindex]:not([tabindex="-1"]):focus-visible {
  outline: 2px solid var(--color-neon-cyan);
  outline-offset: 2px;
}
```

SVG elements use drop-shadow instead of outline.

### Tailwind Focus Utility

```css
.focus-visible-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60
         focus-visible:ring-offset-2 focus-visible:ring-offset-cyber-black;
}
```

### Reduced Motion (WCAG 2.3.3)

All animations are disabled when `prefers-reduced-motion: reduce` is active. Includes component-highlighted, wire animations, typing dots, panel transitions, and canvas grid effects.

### Forced Colors / High Contrast

Windows High Contrast support via `@media (forced-colors: active)`:
- All panels get `border: 1px solid CanvasText`
- Text shadows removed
- Buttons get `border: 1px solid ButtonText`
- Focus indicators use system `Highlight` color

### Skip Navigation (WCAG 2.4.1)

`.skip-link` provides a hidden link that appears on focus at z-9999, with cyan background and black text.

## Performance Modes

### Low Performance Mode

`.low-performance` class on body disables all:
- Animations (duration: 0s)
- Transitions (duration: 0s)
- Backdrop filters (none)
- Canvas grid radial gradients (simplified to basic grid)
- Component/wire highlight animations

### High Contrast Theme

`.theme-high-contrast` overrides:
- `--mode-accent`: white
- `--panel-bg`: black
- `--text-primary`: white
- `--text-secondary`: yellow
- `--border-color`: white

## Scrollbar Styling

### Custom Scrollbar

`.custom-scrollbar`:
- Track: cyber-black
- Thumb: slate-800 with slate-900 border
- Thumb hover: slate-700 with mode-accent border
- Width: 4px

### Hidden Scrollbar

`.scrollbar-hide` completely hides scrollbars (webkit + firefox).
