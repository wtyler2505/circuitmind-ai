# UI Tokens Reference

A fast, human-readable map of the visual system. Treat this as the single source of truth
for colors, surfaces, blur levels, and density rules.

## Color Palette (Core)
- Void Black: #020204 (background base)
- Panel Black: rgba(6, 8, 12, 0.84)
- Panel Edge: rgba(55, 70, 90, 0.55)
- Slate Text: #e2e8f0
- Dim Text: #94a3b8

## Accent Colors
- Cyan Focus: #00f3ff (primary energy)
- Purple AI: #a855f7 (assistant context)
- Red Live: #ef4444 (live/alert)
- Emerald Success: #10b981

## Glass Surface Mix
- panel-surface
  - Blur: 14px, Saturation: 130%
  - Gradient: linear(180deg, rgba(12,16,24,0.88) -> rgba(6,8,12,0.84))
- panel-header
  - Blur: 12px, Saturation: 140%
  - Sheen: subtle cyan/orange sliver
- panel-rail
  - Blur: 10px, Saturation: 135%

## Typography Rules
- Micro labels: 7–10px, uppercase, tracking 0.2–0.24em
- Core labels: 11–12px, semi-bold
- Readable body: 13–14px, medium contrast

## Spacing + Density
- Main toolbar height: 44px (hit target compliance)
- Bottom status rail height: 12px (thin status line)
- Minimum icon target: 44x44px
- Small button padding: 6–10px x 10–12px

## Borders + Frames
- panel-frame: 1px inner hairline + cyan corner accent
- cut-corner-sm: 6px chamfer
- cut-corner-md: 12px chamfer
