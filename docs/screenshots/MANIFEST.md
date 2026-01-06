# UI Screenshot Catalog - CircuitMind AI

**Generated**: 2026-01-02
**App Version**: 0.0.0
**Base URL**: http://localhost:3001

## Summary

| Category | Count | Status |
|----------|-------|--------|
| App Shell | 2 | Pending |
| Canvas Views | 2 | ✅ Saved |
| Sidebars | 2 | Pending |
| Settings Modal | 3 | Pending |
| Component Editor | 2 | Pending |
| Interactive States | 2 | Pending |
| Responsive Viewports | 7 | ✅ Saved |
| **Total** | **20** | **9 Saved** |

## Screenshot Inventory

### 01 - App Shell

| Screenshot ID | Description | Viewport | State |
|---------------|-------------|----------|-------|
| ss_2869hrpyq | Empty state - No diagram yet | 1920x1080 | Default |
| ss_8636pb6ba | 2D Diagram view with Arduino LED circuit | 1920x1080 | Active |

### 02 - Canvas Views

| File | Description | Viewport | State |
|------|-------------|----------|-------|
| `02-canvas-views/001_2d-diagram-generated_1920x1080.png` | 2D Wiring Diagram - Arduino Uno LED Blink | 1920x1080 | Default |
| `02-canvas-views/002_3d-view_1920x1080.png` | 3D View - Procedural geometry with LOD + MISSING 3D MODELS panel | 1920x1080 | 3D Mode |

### 03 - Sidebars

| Screenshot ID | Description | Viewport | State |
|---------------|-------------|----------|-------|
| ss_37081ixk6 | Inventory Panel - Full component library (142 items) | 1920x1080 | Open |
| ss_9720fzn49 | Inventory with 2D canvas visible | 1920x1080 | Open |

### 04 - Settings Modal

| Screenshot ID | Description | Viewport | State |
|---------------|-------------|----------|-------|
| ss_5152jd29w | Settings - API Key Tab | 1920x1080 | Modal Open |
| ss_28171jrpb | Settings - AI Autonomy Tab (action permissions) | 1920x1080 | Modal Open |
| ss_9720d2485 | Settings - Layout Tab (sidebar config) | 1920x1080 | Modal Open |

### 05 - Component Editor Modal

| Screenshot ID | Description | Viewport | State |
|---------------|-------------|----------|-------|
| ss_1622utip7 | Component Editor - INFO Tab (Arduino Uno R3 pinout) | 1920x1080 | Modal Open |
| ss_1588ppny3 | Component Editor - EDIT Tab (editable fields) | 1920x1080 | Modal Open |

### 06 - Interactive States

| Screenshot ID | Description | Viewport | State |
|---------------|-------------|----------|-------|
| ss_280721lp6 | Conversation Switcher dropdown open | 1920x1080 | Dropdown |
| ss_1972h1e8m | Full UI with all panels visible | 1920x1080 | Complete |

### 07 - Responsive Viewports

| File | Description | Viewport | Device |
|------|-------------|----------|--------|
| `07-responsive/001_2d-diagram_1440x900.png` | 2D Diagram - Medium desktop | 1440x900 | MacBook Pro 15" |
| `07-responsive/002_2d-diagram_1024x768.png` | 2D Diagram - Small desktop | 1024x768 | iPad Landscape |
| `07-responsive/003_2d-diagram_768x1024_tablet.png` | 2D Diagram - Tablet portrait | 768x1024 | iPad Portrait |
| `07-responsive/004_2d-diagram_430x932_mobile.png` | 2D Diagram - Large mobile | 430x932 | iPhone 14 Pro Max |
| `07-responsive/005_2d-diagram_393x852_mobile.png` | 2D Diagram - Standard mobile | 393x852 | Pixel 7 |
| `07-responsive/006_2d-diagram_375x667_mobile-se.png` | 2D Diagram - Small mobile | 375x667 | iPhone SE |
| `07-responsive/007_2d-diagram_320x568_mobile-legacy.png` | 2D Diagram - Legacy mobile | 320x568 | iPhone 5/SE |

## UI Components Documented

### Layout Structure
- **Header**: CIRCUIT MIND branding, Save/Load, Voice toggle, Settings
- **Left Sidebar**: Asset Manager (Inventory) with 142 components
- **Center Canvas**: 2D/3D wiring diagram view
- **Right Sidebar**: Assistant panel with chat, quick actions
- **Status Bar**: SYS status, inventory count, network status, mode, session

### Inventory Panel
- **Tabs**: ASSETS, NEW, TOOLS
- **Filters**: ALL, MICROCONTROLLER, SENSOR, ACTUATOR, POWER, OTHER
- **Component Categories**:
  - Microcontrollers: Arduino Uno R3, Mega 2560, ESP32, NodeMCU, etc.
  - Sensors: Ultrasonic, PIR, DHT11, MPU6050, etc.
  - And more...

### Canvas Tools
- Search components
- Type filter dropdown
- Grid toggle (ON/OFF)
- 2D/3D view toggle
- SVG/PNG export
- Zoom controls
- Minimap

### Settings Panel (3 tabs)
1. **API Key**: Gemini API configuration with test connection
2. **AI Autonomy**: Auto-execute toggle, per-action permissions (Canvas, Navigation, Diagram, Inventory)
3. **Layout**: Sidebar defaults (open on launch, pinned, width sliders)

### Component Editor (4 tabs)
1. **INFO**: Description, pinout diagram, datasheet link, typical use cases
2. **EDIT**: Name, type, quantity, description, pins, media URLs
3. **IMAGE**: Component thumbnail
4. **3D MODEL**: GLB/GLTF model URL

### Assistant Panel
- Session switcher dropdown
- Mode indicators (CHAT, DEEP, VIEW)
- Quick Actions cards
- Chat history with AI responses
- Diagram info cards with component tags
- Action suggestions
- Input modes: Chat, Image, Video
- Attach file, Voice input

## Technical Details

- **Framework**: React 19 + Vite + TailwindCSS 4
- **3D Engine**: Three.js with LOD system
- **AI Integration**: Gemini API (gemini-2.5-pro/flash)
- **State Management**: Centralized in App.tsx
- **Responsive**: Fluid layout with resizable sidebars

## Notes

- Screenshots captured via Chrome DevTools MCP (`take_screenshot` with `filePath`)
- Saved screenshots use PNG format for lossless quality
- Responsive viewports tested from 1920x1080 down to 320x568
- Dark theme only (default)
- Previous session used wrong tool (Claude in Chrome MCP - inline only, no file save)
- This session correctly saves files to disk in `/docs/screenshots/` subdirectories

---

*Generated by UI Screenshot Cataloger - CircuitMind AI*
