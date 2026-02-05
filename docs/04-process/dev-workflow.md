# Development Workflow

## Hybrid Dev Loop (Human + LLM)
1. **Track Creation:** Use `conductor` to define a new track (feature/bug).
2. **Deep Focus:** Activate `deep-focus` for large components or complex audits.
3. **Iterative Build:**
   - LLM writes code/tests.
   - Human verifies visually and via CLI tools.
   - Run `npm run test` and `npm run lint` before completion.
4. **Validation:** Use `verification-before-completion` to ensure all acceptance criteria are met.

## Track Standards
- Every feature MUST have a `spec.md` and `plan.md` in its track folder.
- Status changes MUST be reflected in the central `tracks.md` registry.

## Quality Assurance
- **Visual Audits:** Perform visual regression tests using Playwright after any change to the 2D engine or core components.
- **Complexity:** Use `lizard` to monitor cyclomatic complexity in services.
- **Git Logs:** Keep commit messages concise and focused on "Why" not "What".
