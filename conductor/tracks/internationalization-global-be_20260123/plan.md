# Implementation Plan: Internationalization (Global Bench)

## 📋 Todo Checklist
- [ ] **Infrastructure: i18next Setup**
    - [x] Install `i18next`, `react-i18next`, and `i18next-browser-languagedetector`.
    - [x] Configure `i18n.ts` with local JSON backends.
    - [x] Wrap the application in `I18nextProvider`.
- [ ] **Core: Unit Localization**
    - [x] Create `services/localization/unitConverter.ts`.
    - [x] Implement logic to toggle between Imperial (mils/inches) and Metric (mm).
    - [x] Add support for "Regional Symbol Standards" (IEEE vs. IEC).
- [ ] **Data: String Extraction**
    - [x] Audit the codebase and move all hardcoded strings to `public/locales/en.json`.
    - [x] Implement a `t()`-wrapper for common technical terms (e.g., "Resistor", "Pin").
- [ ] **UI: Localization Settings**
    - [x] Build "Localization" tab in `SettingsPanel.tsx`.
    - [x] Add dropdowns for "Language", "Measurement System", and "Symbol Style".
- [ ] **AI Integration: Multilingual Persona**
    - [/] Update `aiContextBuilder.ts` to include the user's preferred language in the system prompt.
    - [ ] Ensure the "Eve" persona translates correctly without losing its sarcastic tone.
- [ ] **Refinement: Formats & Dates**
    - [ ] Use the `Intl` browser API for localized date strings in `ChatPanel` and `ProjectTimeline`.

## Testing Strategy
- **Unit Tests**: Verify mathematical accuracy of unit conversions.
- **Extraction Tests**: Ensure no hardcoded strings remain in the `components/` directory (regex check).
