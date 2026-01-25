# Implementation Plan: User Profile Management

## 📋 Todo Checklist
- [x] **Infrastructure: Profile Storage**
    - [x] Create `services/userProfileService.ts` for IndexedDB/LocalStorage management.
    - [x] Implement `createProfile`, `switchProfile`, and `updatePreferences`.
- [x] **Context: Application State**
    - [x] Create `contexts/UserContext.tsx` and `useUser` hook.
    - [x] Synchronize `UserContext` with `LayoutContext` and `AssistantStateContext`.
- [x] **UI: Profile Editor**
    - [x] Build `ProfileTab` in `SettingsPanel.tsx`.
    - [x] Add fields for "Engineering Level", "Preferred Wiring Colors", and "AI Tone".
    - [x] Implement a "Persona Switcher" in the Sidebar or Header.
- [ ] **AI Integration: Persona Awareness**
    - [ ] Update `aiContextBuilder.ts` to include user metadata in the system prompt.
    - [ ] Refactor `geminiService.ts` to adjust "Eve's" personality based on the `sassLevel` preference.
- [ ] **Refinement: Defaults & Sync**
    - [ ] Implement automatic wiring color application based on profile.
    - [ ] Add "Export/Import Profile" functionality.

## Testing Strategy
- **Unit Tests:** Verify profile switching logic and data persistence.
- **Integration Tests:** Ensure AI responses change tone when the persona level is updated.
