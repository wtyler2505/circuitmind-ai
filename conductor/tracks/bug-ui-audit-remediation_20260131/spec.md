# Specification: UI Audit Remediation

## Context
A full UI/UX audit (2026-01-31) identified critical failures in core navigation (Settings Modal), interaction (Chat Input), and basic assets (Logo/Favicon). These issues prevent users from accessing configuration and effectively using the AI assistant.

## Requirements

### 1. Settings Modal Visibility
- **Issue:** Clicking the "Settings" button in `AppHeader` updates the state but the modal does not appear.
- **Requirement:** The `SettingsPanel` must render visibly on top of all other content (z-index check) when `isSettingsOpen` is true.
- **Root Cause Hypothesis:** Z-index conflict with `AssistantSidebar` or `MainLayout` overflow settings.

### 2. Chat Send Button State
- **Issue:** The "Send" button in `ChatPanel` remains disabled even after typing text.
- **Requirement:** The button must enable immediately when the input field contains non-whitespace characters.
- **Root Cause Hypothesis:** `ChatPanel`'s internal state (`inputValue`) might not be syncing with the parent `handleSend` validator or the `disabled` prop logic is flawed.

### 3. Missing Assets
- **Issue:** 404 errors for `/assets/ui/logo.png` and `/favicon.ico`.
- **Requirement:** These files must exist in `public/`.
- **Action:** Restore assets or generate high-quality placeholders if missing.

### 4. Inventory Interaction (Investigation)
- **Issue:** Inventory items timed out on click during audit.
- **Requirement:** Verify if `InventoryItem` supports `onClick` or if it's strictly drag-and-drop. If strict, add visual feedback or a "click for details" mode.

## Acceptance Criteria
- [ ] Settings modal opens and closes reliably.
- [ ] Chat "Send" button enables/disables correctly based on input.
- [ ] No 404 errors in the console on boot.
- [ ] Inventory items respond to user interaction (click or drag).
