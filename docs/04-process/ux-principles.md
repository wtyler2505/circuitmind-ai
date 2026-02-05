# CircuitMind UX Principles

These principles keep the product coherent as it grows. If a change breaks these, redesign it.

## Core Philosophy: "Measure Twice, Cut Once"
- Prioritize technical correctness and electrical safety over aesthetic fluff.
- Every visual effect MUST serve a functional purpose (hierarchy, state, or validation).

## User Persona: The Practical Tinkerer
- **User:** Tyler
- **Background:** Hands-on experience with physical electronics; self-taught.
- **Communication:** Prefers plain language and concrete examples.
- **Expectation:** Needs tool parity with physical reality (pinouts, grid spacing, visual accuracy).

## 1) Instrument-Panel Mentality
- The app behaves like a cockpit, not a chat app.
- Users should feel in control, not “inside” a UI toy.

## 2) Clarity Over Decoration
- Effects must clarify hierarchy or interaction.
- No visual noise that competes with wiring or content.

## 3) Density With Purpose
- Desktop-first. Controls must be easy to find.
- Dense does not mean cramped. Every pixel earns its place.

## 4) Predictable Interactions
- Buttons behave the same across panels.
- Hover actions must also exist for keyboard users.
## 5) The Quiet Center
- The canvas is the star.
- Sidebars support the mission, never steal it.

## 6) Strong First-Use Guidance
- Empty states teach the next action.
- Every blank screen should help the user move.

## 7) Inclusive Engineering
- Meet or exceed WCAG 2.1 AA standards for all graphical tools.
- **Semantic DOM:** Every custom SVG component (Wires, Nodes) is mapped to WAI-ARIA roles.
- **Spatial Narration:** Translate canvas coordinates into relative positions (e.g., "MCU at Center-Left") for screen readers.
- **Adaptive Visuals:** System reacts to local preferences for reduced motion and high contrast.

## 8) Fidelity Over Approximation
- Components represent physical reality.
- Use manufacturer-accurate SVGs and pin metadata.
- Technical correctness is the foundation of trust.

## 9) Consistency Wins
- The UI should feel like one system.
- If it looks like a one-off, rework it.
