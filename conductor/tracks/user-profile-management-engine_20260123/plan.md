# Implementation Plan: User Profile Management

## 📋 Todo Checklist
- [ ] **Infrastructure: Profile Storage**
    - [ ] Create `services/userProfileService.ts` for IndexedDB/LocalStorage management.
    - [ ] Implement `createProfile`, `switchProfile`, and `updatePreferences`.
- [ ] **Context: Application State**
    - [ ] Create `contexts/UserContext.tsx` and `useUser` hook.
    - [ ] Synchronize `UserContext` with `LayoutContext` and `AssistantStateContext`.
- [ ] **UI: Profile Editor**
    - [ ] Build `ProfileTab` in `SettingsPanel.tsx`.
    - [ ] Add fields for "Engineering Level", "Preferred Wiring Colors", and "AI Tone".
    - [ ] Implement a "Persona Switcher" in the Sidebar or Header.
- [ ] **AI Integration: Persona Awareness**
    - [ ] Update `aiContextBuilder.ts` to include user metadata in the system prompt.
    - [ ] Refactor `geminiService.ts` to adjust "Eve's" personality based on the `sassLevel` preference.
- [ ] **Refinement: Defaults & Sync**
    - [ ] Implement automatic wiring color application based on profile.
    - [ ] Add "Export/Import Profile" functionality.

## Testing Strategy
- **Unit Tests:** Verify profile switching logic and data persistence.
- **Integration Tests:** Ensure AI responses change tone when the persona level is updated.
