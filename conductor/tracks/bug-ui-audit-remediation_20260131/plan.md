# Implementation Plan: UI Audit Remediation

## Phase 1: Asset Restoration (Quick Wins)
- [x] **Task:** Check `public/` directory for `logo.png` and `favicon.ico`.
- [x] **Task:** If missing, generate new "Cyberpunk/Sci-Fi" themed assets using `nanobanana` or move existing assets to correct paths.

## Phase 2: Settings Modal Debugging
- [x] **Task:** Analyze `MainLayout.tsx` structure. Check where `<SettingsPanel />` is rendered relative to `<AssistantSidebar />` and `z-index` values.
- [x] **Task:** Verify `useLayout` context updates for `setSettingsOpen`.
- [/] **Task:** Fix z-index stacking context or move `SettingsPanel` to a React Portal if necessary.

## Phase 3: Chat Interaction Fix
- [x] **Task:** Inspect `components/ChatPanel.tsx`.
- [ ] **Task:** Review `onChange` handler and state binding for the textarea.
- [ ] **Task:** Correct the `disabled` condition on the Send button.

## Phase 4: Inventory & Verification
- [x] **Task:** Inspect `components/Inventory.tsx` and `InventoryItem.tsx` click handlers.
- [x] **Task:** **Verify:** Run a targeted manual verification or mini-script to confirm all fixes.
