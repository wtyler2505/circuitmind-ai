# 07 - UX Design System and Styling

> Complete design system documentation for CircuitMind AI.
> Covers every CSS rule, color token, animation, z-index layer, typography decision,
> accessibility feature, component shape, and responsive pattern in the codebase.

---

## 1. Global Styles (`index.css`)

The entire stylesheet is organized in this order:

1. Tailwind CSS v4 import and `@theme` block (custom properties)
2. Mode accent overrides (`.mode-design`, `.mode-wiring`, `.mode-debug`)
3. Keyframe definitions
4. Body base styles
5. Hard-edge mode (global border-radius reset)
6. Custom scrollbar
7. Glass System 2.0 (panel classes)
8. Texture overlays
9. Geometric clipping
10. UI element classes
11. Chat bubble styles
12. Animation utility classes
13. AI highlight animations
14. Canvas surface and grid
15. High-contrast theme layer
16. Focus-visible utility layer
17. Low-performance mode
18. WCAG accessibility rules (reduced motion, focus indicators, text size, skip nav, forced colors)

### 1.1 Tailwind CSS v4 `@theme` Block

All custom design tokens are declared inside `@theme { ... }` at the top of `index.css`. This replaces the old `tailwind.config.js` extend block. The tokens are:

```css
@theme {
  --font-sans: 'IBM Plex Sans Condensed', 'IBM Plex Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  --animate-pulse-slow: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-scan: scan 2s linear infinite;

  /* Cyber backgrounds */
  --color-cyber-black: #050508;
  --color-cyber-dark: #0a0a12;
  --color-cyber-card: #12121f;

  /* Neon accents */
  --color-neon-cyan: #00f3ff;
  --color-neon-purple: #bd00ff;
  --color-neon-green: #00ff9d;
  --color-neon-amber: #ffaa00;

  /* Component-specific: arduino, pcb, breadboard, chip, copper, lcd, sensor */
  --color-arduino: #00979D;
  --color-arduino-dark: #005C5F;
  --color-arduino-light: #00B5B8;
  --color-pcb: #1D5C4B;
  --color-pcb-dark: #0F3D2F;
  --color-pcb-light: #2A7A64;
  --color-breadboard-white: #F8F8F8;
  --color-breadboard-rail-blue: #3B82F6;
  --color-breadboard-rail-red: #EF4444;
  --color-chip: #1E1E1E;
  --color-chip-highlight: #3D3D3D;
  --color-copper: #9A916C;
  --color-copper-highlight: #C4B896;
  --color-lcd-green: #9ACD32;
  --color-lcd-dark: #556B2F;
  --color-sensor-blue: #2563EB;
  --color-sensor-dark: #1D4ED8;
  --color-sensor-purple: #6D28D9;

  /* Accessibility contrast overrides */
  --color-slate-500: #94a3b8;
  --color-slate-600: #cbd5e1;

  /* Dynamic mode accent system */
  --mode-accent: var(--color-neon-cyan);
  --color-mode-accent: var(--mode-accent);
}
```

### 1.2 Body Base Styles

```css
body {
  background-color: theme('colors.cyber-black');        /* #050508 */
  color: theme('colors.slate.200');
  background-image:
    radial-gradient(circle at 50% 0%, rgba(20, 25, 35, 0.4), transparent 60%),
    linear-gradient(180deg, rgba(2, 2, 4, 0) 0%, rgba(2, 2, 4, 1) 100%),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.01) 0px, rgba(255, 255, 255, 0.01) 1px, transparent 1px, transparent 100px);
}
```

The body uses a three-layer background: a subtle top-center radial highlight, a bottom-to-top vignette, and a 45-degree micro-line grid for industrial texture.

### 1.3 Hard-Edge Mode

All border-radius values are globally forced to zero:

```css
*, *::before, *::after {
  border-radius: 0 !important;
}
```

This is a deliberate design choice. The cyberpunk aesthetic uses sharp corners everywhere. Rounded corners are replaced by geometric clip-paths (see section 1.7).

### 1.4 Custom Scrollbar

```css
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: theme('colors.cyber-black'); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: theme('colors.slate.800'); border: 1px solid theme('colors.slate.900'); }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: theme('colors.slate.700'); border-color: var(--mode-accent); }
```

A separate `.scrollbar-hide` class fully hides scrollbars (webkit + Firefox + IE).

---

## 2. Color System

### 2.1 Central Color Token File (`styles/colors.ts`)

All design tokens are defined as a TypeScript constant in `styles/colors.ts` and exported for use across components:

```typescript
export const COLORS = {
  cyber: { black: '#050508', dark: '#0a0a12', card: '#12121f' },
  neon: { cyan: '#00f3ff', purple: '#bd00ff', green: '#00ff9d', amber: '#ffaa00' },
  arduino: { base: '#00979D', dark: '#005C5F', light: '#00B5B8' },
  pcb: { green: '#1D5C4B', dark: '#0F3D2F', light: '#2A7A64' },
  breadboard: { white: '#F8F8F8', railBlue: '#3B82F6', railRed: '#EF4444' },
  materials: {
    copper: '#9A916C', copperHighlight: '#C4B896',
    chip: '#1E1E1E', chipHighlight: '#3D3D3D',
    resistorBody: '#C4A484', resistorBand: '#1E293B',
    headerFill: '#374151', pinStroke: '#6B6B6B',
    goldPin: '#7A7152', legs: '#8C8C8C'
  },
  display: { lcdGreen: '#9ACD32', lcdDark: '#556B2F', ledRed: '#E62C2E', ledGreen: '#22C55E', ledYellow: '#FACC15' },
  sensor: { blue: '#2563EB', blueDark: '#1D4ED8', purple: '#6D28D9' },
  ui: { text: '#E2E8F0', subtleText: '#94A3B8', stroke: '#D1D5DB', selection: '#00f3ff', white: '#F5F5F5' }
};
```

These tokens are consumed by `componentShapes.ts` for SVG rendering. The CSS `@theme` block mirrors these values for Tailwind class usage.

### 2.2 Neon Accent System

Four primary neon accents serve distinct semantic purposes:

| Token | Hex | Usage |
|-------|-----|-------|
| `neon-cyan` | `#00f3ff` | Primary accent, selection, focus, interactive elements |
| `neon-purple` | `#bd00ff` | AI/generative features, mentor tips, pro-level indicators |
| `neon-green` | `#00ff9d` | Success states, design mode, safe actions, telemetry active |
| `neon-amber` | `#ffaa00` | Warnings, checkpoints, timeline, debug mode, branch indicators |

### 2.3 Adaptive Mode Accents

The `--mode-accent` CSS custom property changes based on the active editing mode:

```css
.mode-design { --mode-accent: #00ff9d; }   /* neon-green */
.mode-wiring { --mode-accent: #00f3ff; }   /* neon-cyan */
.mode-debug  { --mode-accent: #ffaa00; }   /* neon-amber */
```

This variable is used by: `.panel-title` text-shadow, `.panel-toggle:hover` border/color/glow, scrollbar thumb hover color, logo drop-shadow, and the brand wordmark "MIND" color.

### 2.4 High-Contrast Theme

Defined in `@layer base`:

```css
.theme-high-contrast {
  --mode-accent: #ffffff;
  --panel-bg: #000000;
  --text-primary: #ffffff;
  --text-secondary: #ffff00;
  --border-color: #ffffff;
}
```

---

## 3. Glass System 2.0 - Panel Classes

The "Industrial Slab" glass system provides a consistent surface treatment across all panels, sidebars, modals, and cards.

### 3.1 `.panel-surface`

The foundation class for any container surface:

- Background: 160-degree linear gradient from `rgba(10, 12, 16, 0.95)` to `rgba(4, 5, 8, 0.98)`
- Border: 1px white at 8% opacity, top border at 12% for top-light illusion
- Backdrop filter: `blur(20px)` (both `-webkit-` and standard)
- Box shadow: `0 4px 20px rgba(0, 0, 0, 0.8)` outer + `inset 0 1px 0 rgba(255, 255, 255, 0.05)` inner highlight
- Overflow: hidden, position: relative
- Pseudo-element `::before` reserved for texture overlay (opacity 0.03)

### 3.2 Texture Overlays

Applied via additional classes on elements that already have `.panel-surface`:

| Class | Asset | Opacity | Size |
|-------|-------|---------|------|
| `.panel-carbon` | `pattern-carbon.webp` | 0.05 | 256px |
| `.panel-brushed` | `pattern-brushed.webp` | 0.04 | 256px |
| `.panel-circuit` | `pattern-circuit.webp` | 0.08 | 512px |
| `.panel-loading` | `loading.webp` | 0.15 | 256px, animated with `scan 4s linear infinite` |

### 3.3 `.panel-header`

Horizontal gradient header bar: `linear-gradient(90deg, rgba(15, 20, 30, 0.95), rgba(10, 12, 16, 0.98))`. Bottom border at 8% white, backdrop blur 12px.

### 3.4 `.panel-rail`

Footer/status bar: `background: theme('colors.cyber-black')`, top border 6% white, inset shadow.

### 3.5 `.panel-toggle`

Sidebar toggle buttons: dark background, 10% white border, slate-500 text. On hover: slate-900 background, accent border, accent text color, 15px glow shadow.

### 3.6 `.panel-frame`

Adds corner accent marks (8x8px white borders at top-left `::before` and bottom-right `::after`).

### 3.7 `.panel-flourish`

Adds a 16x16px decorative flourish image at top-right corner (30% opacity).

### 3.8 `.panel-title`

Text styling: `text-shadow: 0 0 10px var(--mode-accent)`, weight 700, letter-spacing 0.15em.

---

## 4. Geometric Clipping

Instead of `border-radius`, the design uses CSS `clip-path` for angular corners:

```css
.cut-corner-sm {
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
}
.cut-corner-md {
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}
```

These clip top-right and bottom-left corners at 4px (sm) or 8px (md) creating a "chamfered" look. Applied to: buttons, badges, panels, modals, inputs, code blocks, images, and video elements.

---

## 5. Typography

### 5.1 Font Stack

| Role | Font Family | Weight Range | Source |
|------|-------------|-------------|--------|
| Sans (headings, body) | IBM Plex Sans Condensed, IBM Plex Sans | 300-700 | Google Fonts CDN |
| Mono (code, labels, data) | IBM Plex Mono | 400, 600 | Google Fonts CDN |

Declared in `@theme`:
```css
--font-sans: 'IBM Plex Sans Condensed', 'IBM Plex Sans', sans-serif;
--font-mono: 'IBM Plex Mono', monospace;
```

Note: The CLAUDE.md documentation references "Space Grotesk" and "JetBrains Mono" but the actual implementation uses IBM Plex fonts. The `index.html` loads IBM Plex via Google Fonts.

### 5.2 Font Loading Strategy

Fonts are loaded via Google Fonts CSS link in `index.html` with `display=swap`:
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
```

The PWA Service Worker caches Google Fonts with `CacheFirst` strategy (365-day expiration, max 10 entries).

### 5.3 Text Size Conventions

All UI text uses explicit pixel or rem sizing. Common sizes found across components:

| Size | Usage |
|------|-------|
| `text-[8px]` | Timestamps, secondary metadata, keyboard shortcut hints |
| `text-[9px]` | Status labels, tracking-widest uppercase labels, button text |
| `text-[10px]` | Primary UI labels, conversation titles, HUD data, panel titles |
| `text-[11px]` | HUD content, notification messages, secondary body text |
| `text-[12px]` / `text-xs` | Chat message markdown content, settings labels |
| `text-sm` | Modal headings, step titles |
| `text-lg` | Search input |
| `text-2xl` | PIN entry input |
| `text-3xl` | Security score number |

### 5.4 WCAG Minimum Text Size

```css
@layer base {
  p, li, td, th, dd, dt, figcaption { font-size: max(0.6875rem, 11px); }
}
```

### 5.5 Text Style Patterns

All interface text follows these patterns:
- **Labels**: `uppercase tracking-[0.2em]` to `tracking-[0.4em]`, `font-bold`, font-mono
- **Titles**: `uppercase tracking-widest`, panel-title class for glow
- **Data values**: `font-mono`, often with `text-neon-*` color
- **Placeholder text**: `text-slate-600 uppercase tracking-widest`
- **Terminal/code feel**: All-caps with wide letter-spacing emulates hardware UI labels

---

## 6. Animation System

### 6.1 CSS Keyframe Animations

All CSS keyframes defined in `index.css`:

| Keyframe Name | Duration | Effect | Used By |
|---------------|----------|--------|---------|
| `scan` | 2s linear infinite | `translateY(-100%)` to `translateY(100%)` | `.panel-loading::before` |
| `rotate-tech` | 3s linear infinite | `rotate(0deg)` to `rotate(360deg)` | `.loading-tech` spinner |
| `component-pulse` | 1.5s ease-in-out infinite | Drop-shadow oscillates 5px to 20px | `.component-highlighted` |
| `telemetry-heartbeat` | 2s ease-in-out infinite | Green glow pulse 2px to 8px | `.telemetry-active` |
| `error-flicker` | 0.5s ease-in-out infinite | Red glow pulse 4px to 12px | `.logic-error` |
| `wire-glow` | 1s ease-in-out infinite | Opacity 0.3-0.6, stroke-width 6-10px | `.wire-highlighted` |
| `marching-ants` | 1s linear infinite | `stroke-dashoffset: 24` to `0` | `.wire-flow-ants` |
| `attention-ring` | 1s ease-out infinite | Scale 1 to 1.5, opacity 1 to 0 | `.attention-ring` |
| `slideInFromRight` | 0.3s ease-out | `translateX(100%)` to `0` | `.slide-in-right` |
| `fadeInRight` | 0.2s ease-out | `opacity:0, translateX(20px)` to visible | `.animate-fade-in-right` |
| `fadeUp` | 0.2s ease-out | `opacity:0, translateY(10px)` to visible | `.fade-up` |
| `shimmer` | 1.5s infinite | Gradient background slides left-to-right | `.shimmer-loading` |
| `typing-dot` | 1.4s infinite (staggered) | Opacity/scale pulse for chat typing indicator | `.typing-dot:nth-child(n)` |
| `checkmark` | 0.5s ease-out | SVG stroke-dashoffset animation | `.checkmark-animated` |
| `boot-pulse` | 2s infinite | Scale 0.95-1, opacity 0.4-1 | Boot loader logo |
| `boot-scan` | 1.5s linear infinite | Progress bar sweep | Boot loader bar |

### 6.2 Animation Delay Utilities

```css
.delay-75 { animation-delay: 75ms; }
.delay-150 { animation-delay: 150ms; }
```

### 6.3 Framer Motion Patterns

11 components use framer-motion. Common patterns:

**Entry/Exit Animations (AnimatePresence)**:
- `CyberToast`: Slide in from left with 3D rotation (`x: -100, rotateX: -20` to `0`)
- `TacticalHUD`: Spring-based positioning (`stiffness: 400, damping: 30`) with blur exit
- `MentorOverlay`: Fade up with scale (`y: 20, scale: 0.95` to `0, 1`)
- `MismatchMarker`: Scale and opacity entrance

**Spring Physics**:
- `NeuralCursor`: `useSpring` with `damping: 25, stiffness: 200, restDelta: 0.001` for smooth hand-tracking cursor
- `TelemetryOverlay` (DiagramNode): Animated data bubbles with `duration: 0.2` transitions

**Dialog/Modal Entry**:
- `OmniSearch`: `y: -20, opacity: 0` to `0, 1`
- `Gatekeeper`: `scale: 0.9, opacity: 0` to `1, 1`

**Progress Indicators**:
- `MentorOverlay` progress bar: `width: 0` to `width: ${progress}%` with 0.5s duration
- `TacticalHUD` scanning line: `top: -100%` to `top: 200%`, 1.5s repeat infinite

**Pin Telemetry**:
- `DiagramNode > TelemetryOverlay`: AnimatePresence with `mode="wait"`, slides in from the side

### 6.4 Loading Spinner

```css
.loading-tech {
  width: 40px; height: 40px;
  background-image: url('/assets/ui/loading.webp');
  background-size: contain;
  animation: rotate-tech 3s linear infinite;
  filter: drop-shadow(0 0 8px rgba(0, 243, 255, 0.5));
}
```

Used in: ProjectTimeline (loading state), Gatekeeper (decorative), MentorOverlay (decorative).

---

## 7. Z-Index Layer System

Comprehensive z-index values used across all components:

| Z-Index | Layer | Components |
|---------|-------|-----------|
| 0 | Canvas base | `DiagramCanvas` SVG, `.canvas-surface` |
| 5 | Panel refraction beam | `.panel-frame::before` |
| 10 | Canvas toolbar, panel corner accents | `CanvasToolbar`, `CanvasMinimap`, `.panel-frame::after`, ThreeViewer controls |
| 15 | Panel flourish | `.panel-flourish::before` |
| 20 | Header, status rail, wire label editor | `AppHeader` (`z-20`), `StatusRail` (`z-20`), `WireLabelEditor` (`z-20`), `Diagram3DView` toolbar |
| 30 | Floating controls, ThreeViewer error | `MainLayout` mode indicator, `ChatPanel` FAB, ThreeViewer error overlay |
| 40 | Sidebars, mentor overlay | `AssistantSidebar` (`z-40`), `MentorOverlay` (`z-40`) |
| 50 | Modals, inventory, HUD, settings, context menus | `SettingsPanel` (`z-50`), `ComponentEditorModal` (`z-50`), `Inventory` (`z-50`), `TacticalHUD` (`z-50`), `ConversationSwitcher` dropdown (`z-50`), `ContextMenuOverlay` (`z-50`), `ErrorBoundary` (`z-50`), `RemoteCursor` (`z-50`) |
| 100 | Overlay modals, toasts, neural cursor | `BOMModal` (`z-[100]`), `SyncPanel` alert (`z-[100]`), `NeuralCursor` (`z-[100]`), `useToast` container (`z-[100]`) |
| 150 | Dropdown menus above modals | `AppHeader` widget library dropdown (`z-[150]`) |
| 200 | Critical modals | `ConflictResolver` (`z-[200]`), `SecurityReport` (`z-[200]`) |
| 300 | CyberToast notifications | `CyberToast` (`z-[300]`) |
| 500 | OmniSearch command palette | `OmniSearch` (`z-[500]`) |
| 1000 | Authentication gate | `Gatekeeper` (`z-[1000]`) |
| 9999 | Skip navigation link | `.skip-link:focus` |

---

## 8. UI Element Classes

### 8.1 Control Tile

```css
.control-tile {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}
.control-tile:hover {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
}
```

### 8.2 Quick Action Borders

Color-coded left borders for action categories:
```css
.quick-action--cyan    { border-left: 2px solid rgba(0, 243, 255, 0.5); }
.quick-action--amber   { border-left: 2px solid rgba(255, 170, 0, 0.5); }
.quick-action--emerald { border-left: 2px solid rgba(0, 255, 157, 0.5); }
.quick-action--purple  { border-left: 2px solid rgba(189, 0, 255, 0.5); }
```

### 8.3 Chip Square

Small interactive tags/badges:
```css
.chip-square { background: #050508; border: 1px solid slate-800; color: slate-400; }
.chip-square:hover { border-color: neon-cyan; color: slate-200; }
```

### 8.4 Chat Bubble Classes

Three message types with distinct visual treatments:

| Class | Style | Usage |
|-------|-------|-------|
| `.message-slab` | Dark background, white/8% border, 2px shadow | Base for all messages |
| `.message-user` | Cyan gradient left, 2px cyan left border | User messages |
| `.message-assistant` | Darker background, 2px slate-500 left border | AI responses |

---

## 9. Canvas Surface and Grid

```css
.canvas-surface { background-color: theme('colors.cyber-dark'); }

.canvas-grid {
  background-image:
    radial-gradient(circle at 20% 15%, rgba(0, 243, 255, 0.18), transparent 38%),
    radial-gradient(circle at 85% 20%, rgba(255, 170, 0, 0.14), transparent 40%),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 24px),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 24px),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 60px);
  background-size: 100% 100%, 100% 100%, 24px 24px, 24px 24px, 60px 60px;
}
```

Five layers:
1. Cyan radial spotlight (top-left area)
2. Amber radial spotlight (top-right area)
3. Vertical grid lines (24px spacing, 6% white)
4. Horizontal grid lines (24px spacing, 5% white)
5. 45-degree diagonal lines (60px spacing, 3% white)

---

## 10. Component Shape Registry (`components/diagram/componentShapes.ts`)

### 10.1 Overview

697 lines defining Fritzing-style realistic breadboard visuals. All components are rendered as SVG paths with sharp corners (no rounded edges).

### 10.2 SVG Gradient Definitions

8 gradient definitions for 3D depth effects:

| Gradient ID | Type | Usage |
|-------------|------|-------|
| `gradient-arduino-pcb` | Linear vertical | Arduino board body (teal-blue) |
| `gradient-pcb-green` | Linear vertical | Sensor/LCD PCB (green) |
| `gradient-chip-black` | Radial | IC chip body (dark highlight) |
| `gradient-metallic` | Linear diagonal | Metal parts (silver gradient) |
| `gradient-copper` | Linear vertical | Pin contacts (copper to gold) |
| `gradient-dht11-blue` | Linear vertical | DHT sensor housing (blue) |
| `gradient-lcd-screen` | Linear vertical | LCD display screen (green) |
| `gradient-breadboard` | Linear vertical | Breadboard body (white to gray) |
| `gradient-led-glow` | Radial | LED glow effect (white fade) |

### 10.3 SVG Filter Definitions

3 drop-shadow filters:

| Filter ID | Effect |
|-----------|--------|
| `filter-component-shadow` | dx:2 dy:3 blur:4 opacity:0.4 |
| `filter-component-shadow-sm` | dx:1 dy:2 blur:2 opacity:0.3 |
| `filter-inset-shadow` | dx:0 dy:1 blur:2 opacity:0.5 |

### 10.4 Base Component Shapes

5 base shapes in `COMPONENT_SHAPES`:

| Type | Dimensions | Fill | Description |
|------|-----------|------|-------------|
| `microcontroller` | 180x100 | Arduino PCB gradient | Standard microcontroller board |
| `sensor` | 90x70 | Green PCB gradient | Small sensor module |
| `actuator` | 50x80 | Red LED color (#E62C2E) | LED dome with legs |
| `power` | 100x50 | Dark gray (#1F2937) | Battery pack with terminals |
| `other` | 80x60 | Chip black gradient | Generic DIP IC |

### 10.5 Specific Component Shapes

| Shape Constant | Dimensions | Visual |
|----------------|-----------|--------|
| `ARDUINO_UNO_SHAPE` | 280x200 | Full Arduino Uno R3 with 30+ pin positions |
| `RESISTOR_SHAPE` | 100x30 | Axial resistor with leads and body |
| `CAPACITOR_SHAPE` | 40x60 | Electrolytic capacitor with polarity |
| `DHT11_SHAPE` | 80x60 | Blue plastic housing with vent grid |
| `LCD1602_SHAPE` | 160x80 | Green PCB with LCD screen window |
| `BREADBOARD_SHAPE` | 180x120 | Solderless breadboard with rails |

### 10.6 Shape Matching System

A `SHAPE_MATCHERS` array maps component names (case-insensitive) to shapes using predicate functions. Priority order:
1. Passive components (resistor, capacitor by name or value patterns like `10kΩ`, `100μF`)
2. DHT sensors
3. Displays (LCD, 1602, 2004)
4. Breadboards
5. LEDs, diodes, motors, servos, relays
6. Power supplies, batteries, regulators
7. Specific microcontrollers (Arduino Uno by name)
8. General microcontrollers (Arduino, ESP, Raspberry Pi, etc.)
9. General sensors (thermistor, photoresistor, accelerometer, etc.)
10. Fallback: type-based matching, then `COMPONENT_SHAPES.other`

### 10.7 Pin Color Coding System (DiagramNode)

Smart pin colors based on function (`getPinColor` in DiagramNode.tsx):

| Pin Category | Color | Text | Example Pins |
|-------------|-------|------|--------------|
| Power (VCC/5V/3V3) | Red `#DC2626` | `#FECACA` | VCC, VIN, 5V, 3V3, +5V, RAW |
| Ground | Dark `#1F2937` | `#9CA3AF` | GND, GROUND, VSS, V-, 0V |
| I2C | Blue `#2563EB` | `#BFDBFE` | SDA, SCL |
| SPI | Purple `#7C3AED` | `#DDD6FE` | MOSI, MISO, SCK, SS, CS |
| TX (Serial) | Green `#059669` | `#A7F3D0` | TX, TXD, TX0, TX1 |
| RX (Serial) | Orange `#D97706` | `#FDE68A` | RX, RXD, RX0, RX1 |
| Analog | Teal `#0891B2` | `#A5F3FC` | A0-A5 (regex: `/^A\d+$/`) |
| Digital/Default | Copper gradient | `#FDE68A` | D0-D13, any unmatched |

### 10.8 Detailed Component Visuals (DiagramNode sub-components)

Each component type has a React sub-component rendering realistic SVG details:

- **MicrocontrollerDetails**: USB port, ATmega chip, crystal, reset button, power/TX/RX LEDs, pin header strips
- **ArduinoUnoDetails**: Full-fidelity: USB-B port, barrel jack, reset button, ICSP header, ATmega328P + 16U2 chips, crystal oscillators, status LEDs (ON, L, TX, RX), pin labels, mounting holes, voltage regulator, capacitors, silkscreen text
- **SensorDetails**: Sensing element circle, chip, trim potentiometer, pin header
- **DHT11Details**: Blue housing, ventilation grid pattern (horizontal + vertical lines), sensor element, temperature/humidity icons, model label, pin labels
- **LCD1602Details**: LCD bezel, green backlight screen, 16x2 character grid, sample text, I2C backpack chip, contrast pot, backlight LED, pin header strip
- **BreadboardDetails**: Top/bottom power rails (red +, blue -), connection holes (5-row sections), center divider channel, row labels (A-H)
- **ActuatorDetails**: LED lens highlight, glow circle, cathode flat spot, lead wires
- **PowerDetails**: Battery cells, positive terminal, polarity labels
- **ResistorDetails**: Lead wires, 4 color bands (red, purple, brown, gold)
- **CapacitorDetails**: Polarity stripe, plus symbol, value label, lead wires
- **GenericDetails**: DIP chip body, pin-1 notch, pin rows

---

## 11. Accessibility (WCAG 2.1 AA)

REQ-15 was completed, making the application WCAG 2.1 AA compliant. The following features are implemented:

### 11.1 Skip Navigation (SC 2.4.1)

```css
.skip-link {
  position: absolute; top: -100%; left: 0; z-index: 9999;
  padding: 0.5rem 1rem; background: var(--color-neon-cyan);
  color: #000; font-weight: 700; font-size: 0.875rem;
}
.skip-link:focus { top: 0; }
```

In `index.html`: `<a href="#main-content" class="skip-link">Skip to main content</a>`

### 11.2 Focus Indicators (SC 2.4.7)

All interactive elements get a visible 2px neon-cyan outline on `:focus-visible`:

```css
button:focus-visible, a:focus-visible, input:focus-visible,
select:focus-visible, textarea:focus-visible,
[role="button"]:focus-visible, [role="tab"]:focus-visible,
[role="option"]:focus-visible, [role="separator"]:focus-visible,
[role="menuitem"]:focus-visible, [tabindex]:not([tabindex="-1"]):focus-visible {
  outline: 2px solid var(--color-neon-cyan);
  outline-offset: 2px;
}
```

SVG elements use `filter: drop-shadow(...)` instead of outline.

A Tailwind utility is also defined:
```css
.focus-visible-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60
         focus-visible:ring-offset-2 focus-visible:ring-offset-cyber-black;
}
```

### 11.3 Reduced Motion (SC 2.3.3)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  /* Specific overrides for highlight, glow, shimmer, typing, slide, fade animations */
}
```

All CSS animations are disabled. Elements that normally animate instead show their final state (`opacity: 1`, `transform: none`).

### 11.4 Forced Colors / High Contrast (Windows)

```css
@media (forced-colors: active) {
  .panel-surface, .panel-header, .panel-rail, .control-tile,
  .message-slab, .message-user, .message-assistant {
    border: 1px solid CanvasText;
  }
  .panel-title { text-shadow: none; }
  button, [role="button"] { border: 1px solid ButtonText; }
  /* Focus indicator uses system Highlight color */
}
```

### 11.5 Focus Trap Hook (`hooks/useFocusTrap.ts`)

A custom React hook for trapping keyboard focus within modal containers:

- **WCAG SC 2.4.3** (Focus Order) compliant
- Tab/Shift+Tab cycles through focusable elements within container
- Escape key triggers `onClose` callback
- Restores focus to previously focused element on unmount
- Auto-focuses first focusable element (configurable)
- Filters out `display:none` and `visibility:hidden` elements
- Focusable selector includes: `a[href]`, `button:not([disabled])`, `input:not([disabled])`, `select:not([disabled])`, `textarea:not([disabled])`, `[tabindex]:not([tabindex="-1"])`, `[contenteditable]`

Used by: `OmniSearch`, `ConflictResolver`, `SecurityReport`, `SettingsPanel`, `ComponentEditorModal`

### 11.6 ARIA Patterns

| Component | ARIA Usage |
|-----------|-----------|
| `AppHeader` | `role="banner"` |
| `DiagramNode` | `role="button"`, `aria-label` with name, type, selection state, error state |
| `OmniSearch` | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| `ConflictResolver` | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` |
| `SecurityReport` | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| `ConversationSwitcher` | `aria-expanded`, `aria-haspopup="listbox"`, `role="listbox"`, `role="option"`, `aria-selected`, `aria-label` |
| `TacticalHUD` close button | `aria-label="Remove HUD fragment"` |
| All `IconButton` instances | `aria-label` prop required |
| `SyncPanel` alert | `role="alert"`, `aria-live="assertive"` |
| Overlay containers | `role="presentation"` for backdrop divs |

### 11.7 Keyboard Navigation (DiagramNode)

DiagramNode supports full keyboard interaction:
- `Enter` / `Space`: Select component
- `Escape`: Blur/deselect
- `ArrowUp/Down/Left/Right`: Nudge component position by 1px (or 10px with Shift)

### 11.8 Keyboard Navigation (ConversationSwitcher)

- `Enter/Space/ArrowDown` opens dropdown when closed
- `Escape` closes dropdown
- `ArrowDown/ArrowUp` navigates between `[role="option"]` items
- `Enter/Space` selects focused option

---

## 12. Low Performance Mode

When the `.low-performance` class is applied to a container:

```css
.low-performance {
  --animate-pulse-slow: none;
  --animate-scan: none;
}
.low-performance * {
  animation-duration: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
.low-performance .canvas-grid {
  /* Simplified grid: only horizontal + vertical lines, no radial gradients or diagonals */
}
.low-performance .component-highlighted,
.low-performance .telemetry-active,
.low-performance .logic-error,
.low-performance .wire-highlighted,
.low-performance .wire-flow-ants {
  animation: none !important;
  filter: none !important;
}
```

This mode disables all animations, transitions, and backdrop filters for better frame rates. The canvas grid is simplified to a basic 24px crosshatch with no spotlight effects.

---

## 13. Wire Rendering System

### 13.1 BezierWire Component

Wires are rendered as three-layer SVG paths:

1. **Selection highlight**: 8px wide, white at 50% opacity (only when selected, otherwise transparent)
2. **Core wire**: 3px wide, colored stroke with `drop-shadow(0 1px 2px rgba(0,0,0,0.5))`
3. **Insulation shine**: 1px wide, white at 30% opacity, offset -0.5px vertically (Fritzing-style highlight)

Path calculation uses cubic Bezier curves with control points that extend 50px vertically from start/end pins (capped at 150px slack based on distance).

### 13.2 Wire State Classes

| Class | Visual |
|-------|--------|
| `.wire-highlighted` | Pulsing opacity (0.3-0.6) and stroke-width (6-10px) |
| `.wire-flow-ants` | Marching ants dash animation (24px offset per second) |
| `.wire-error` | Red stroke with red drop-shadow glow |

---

## 14. Visual Effect Components

### 14.1 NeuralCursor

Hand-tracking cursor rendered as:
- A 24x24px neon-cyan glow dot with `mix-blend-screen` and 15px cyan box-shadow
- Animated ping ring (Tailwind `animate-ping`)
- SVG hand skeleton overlay showing MediaPipe landmark connections at 30% opacity
- Positioned via framer-motion `useSpring` for smooth interpolation

### 14.2 PredictiveGhost

AI-suggested connections shown as:
- Dashed cubic Bezier paths (stroke-dasharray 4,4) in cyan at 50% opacity
- Pulsing animation (Tailwind `animate-pulse`)
- Floating label with reasoning text in cut-corner badge
- Accept/Reject buttons with cyan/slate styling

### 14.3 TacticalHUD

Contextual information fragments rendered via React Portal:
- Spring-based positioning (stiffness 400, damping 30)
- Type-based color coding (info=cyan, warning=amber, tip=green)
- Scanning line effect (animated div moving top to bottom, repeating)
- Exit animation with blur filter
- Labels: `/// DATA_SCAN`, `/// ALERT`, `/// SUGGESTION`

### 14.4 MentorOverlay

Tutorial step overlay:
- Fixed positioning (bottom-right)
- Panel surface with cyan border and 30px shadow
- Animated progress bar (framer-motion width animation)
- Mentor tips with purple left border and italic styling

### 14.5 CyberToast Notifications

Notification toasts with:
- Left slide-in with 3D rotation (rotateX: -20)
- Severity-based border/text/glow colors (cyan/green/amber/red)
- Critical severity: pinging red dot indicator
- Action button with conditional styling
- Group hover reveals close button

---

## 15. Boot Loader

In `index.html`, an inline boot animation plays while React loads:

- `.boot-logo`: 64x64px logo with 2s pulse animation (scale 0.95-1, opacity 0.4-1) and cyan drop-shadow
- `.boot-bar`: 160x1px progress bar container
- `.boot-progress`: 60% width cyan bar sweeping left-to-right with 8px cyan glow
- `.boot-text`: 9px IBM Plex Mono, cyan, 0.4em letter-spacing, "System Boot Sequence"
- Background: solid `#050508` (cyber-black)
- Full-viewport fixed overlay at z-9999

---

## 16. PWA Theme

From `vite.config.ts` PWA manifest:

```javascript
theme_color: '#050508',
background_color: '#050508',
display: 'standalone'
```

Service Worker cache limits:
- Max file size: 3MB per file
- Google Fonts: CacheFirst, 365 days, 10 entries
- Images: CacheFirst, 30 days, 60 entries
- JS/CSS: StaleWhileRevalidate, 7 days, 50 entries

---

## 17. Build-Time Optimizations

### 17.1 Code Splitting

Vendor chunks defined in `vite.config.ts`:

| Chunk | Packages |
|-------|----------|
| `vendor-react` | react, react-dom |
| `vendor-three` | three |
| `vendor-ai` | @google/genai |
| `vendor-ui` | framer-motion |
| `vendor-markdown` | react-markdown, remark-gfm, remark-breaks |
| `vendor-collab` | yjs, y-webrtc |
| `vendor-git` | isomorphic-git, @isomorphic-git/lightning-fs |
| `vendor-charts` | recharts |
| `vendor-i18n` | i18next, i18next-browser-languagedetector, i18next-http-backend, react-i18next |
| `vendor-pdf` | jspdf |

Chunk size warning: 400KB.

### 17.2 Tailwind Purge

Tailwind CSS v4 uses `@import "tailwindcss"` which automatically purges unused styles at build time based on content scanning.

### 17.3 Production Alias

In production builds, `axe-core` is aliased to an empty module to eliminate it from the bundle:
```javascript
resolve: {
  alias: {
    ...(mode === 'production' ? { 'axe-core': path.resolve(__dirname, 'scripts/empty-module.js') } : {})
  }
}
```

---

## 18. Responsive Design

### 18.1 Breakpoint Usage

The codebase uses Tailwind's responsive prefixes:

- `max-md:w-full` on sidebars (Inventory, AssistantSidebar) -- full width on mobile
- `md:flex` on sidebar toggle buttons (hidden on mobile)
- `md:top-4 md:right-4` on CanvasToolbar -- adjusted positioning for desktop
- `md:max-w-[220px]` vs `max-w-[170px]` on canvas mode indicator
- `md:p-4` vs `p-2` on ComponentEditorModal padding

### 18.2 Layout CSS Variables

Sidebar widths are controlled via CSS custom properties:
- `--inventory-width` on Inventory sidebar
- `--assistant-width` on AssistantSidebar

### 18.3 Sidebar Behavior

Both sidebars use fixed positioning with transform-based show/hide:
- Inventory: `translate-x-0` (open) / `-translate-x-full` (closed), left-anchored
- AssistantSidebar: `translate-x-0` (open) / `translate-x-full` (closed), right-anchored
- Both use `transition-transform duration-300`

### 18.4 Modal Responsiveness

Modals use flexible max-width constraints (`max-w-sm`, `max-w-2xl`, `max-w-4xl`) with responsive padding.
