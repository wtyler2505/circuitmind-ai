# Implementation Plan: Accessibility Features (Inclusive Engineering)

## 📋 Todo Checklist
- [ ] **Infrastructure: Baseline Audit**
    - [x] Run a full application audit using `axe-core` and Lighthouse.
    - [x] Document all current WCAG violations.
- [ ] **Core: Canvas Accessibility**
    - [x] Implement "Keyboard Interaction Mode" for `DiagramCanvas.tsx` (Arrow keys move components, Tab cycles pins).
    - [x] Add `aria-live` regions for simulation status and AI responses.
    - [x] Ensure the 3D viewer has meaningful alt-text and keyboard controls.
- [ ] **Data: Meaningful Labels**
    - [ ] Audit every icon and custom button for `aria-label` or `aria-describedby`.
    - [ ] Add technical descriptions to diagram components for screen readers.
- [ ] **UI: Visual Accessibility**
    - [x] Create a "High Contrast" cyberpunk theme variant.
    - [x] Implement support for `prefers-reduced-motion` (replacing glitches with simple fades).
    - [x] Ensure all focus states are clearly visible with high-contrast neon borders.
- [ ] **AI Integration: Spatial Narrator**
    - [x] Create `describeDiagram` tool in `geminiService.ts`.
    - [x] Prompt Gemini to provide spatial summaries (e.g., "The microcontroller is in the center, with a sensor connected to the top-right pin").
- [ ] **Refinement: Hands-Free Tuning**
    - [ ] Improve voice command accuracy for selecting and moving components.

## Testing Strategy
- **A11y Tests**: Use `playwright-axe` to automate accessibility checks in CI.
- **Keyboard Tests**: Verify 100% of app features are reachable without a mouse.
- **Screen Reader Tests**: Manually verify audio navigation using VoiceOver/NVDA.
