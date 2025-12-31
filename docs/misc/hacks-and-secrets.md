# Hacks, Math & Trade Secrets

This file documents the implementation details that might make a purist cry, but make the app work.

## 1. The "Smart Path" Algorithm (`DiagramCanvas.tsx`)
We needed wires to look like circuit traces, not spiderwebs.
- **The Math**: We calculate a control point (`midX`) between the start and end nodes.
- **The Hack**: If the target component is *to the left* or vertically aligned in a specific way (`x2 < x1 + 60`), the Bezier curve looks awful (loops back on itself).
- **The Fix**: We detect this condition and switch to a manual SVG path string (`M... L... L...`) that forces the wire to go OUT, DOWN, ACROSS, and IN. It's a hardcoded "zig-zag" that solves 90% of layout collisions.

## 2. Dynamic 3D Code Execution (`ThreeViewer.tsx`)
We want the AI to generate 3D models. Gemini can't output a GLB file directly in real-time text streams.
- **The Trick**: We ask Gemini to write **JavaScript code** that builds the mesh using Three.js primitives.
- **The Execution**: We use `new Function('THREE', code)`.
- **Why**: `eval()` is dangerous, but `new Function` provides a slightly more isolated scope (though still dangerous). We pass the `THREE` instance into it so the AI code doesn't need to import anything.
- **Safety**: If the AI writes valid JS that creates an infinite loop, the browser tab will freeze. This is a known trade-off for the feature.

## 3. The "Missing Pin" Indicator
Generative AI hallucinates. It often invents pins like "D5" on a component that the user only defined as having "VCC" and "GND".
- **The Logic**: The `DiagramCanvas` checks `node.pins.indexOf(link.toPin)`.
- **The Fallback**: If index is `-1`, we don't crash. We set the coordinate to `height + 10` (bottom center) and render a **Red Pulsing Dot**. This visually indicates to the user "The AI thinks this pin exists, but your inventory says otherwise."

## 4. API Key Injection in Veo
The `veo` model returns a video URI in the format `https://.../video.mp4`.
- **The Problem**: Fetching this directly yields a 403 Forbidden.
- **The Hack**: You must append `&key=YOUR_API_KEY` to the URL. This is handled in `services/geminiService.ts` before passing the URL to the frontend state.

## 5. Live Audio "NextStartTime"
Web Audio API clocks are precise. If you just play chunks as they arrive, you get robotic gaps.
- **The Secret**: Variable `nextStartTime`.
- `nextStartTime = Math.max(ctx.currentTime, nextStartTime)`.
- We always schedule the *next* chunk to start exactly when the *previous* chunk ends. If the network lags, `ctx.currentTime` overtakes `nextStartTime`, and we reset to `currentTime` (causing a gap, but preserving sync).
