# Spec: Consistency Fix (Inventory-Canvas Sync)

## 1. Goal
Resolve the "Inventory-Canvas Sync" errors where diagram components are flagged as "orphaned" due to missing `sourceInventoryId` and mismatched legacy IDs.

## 2. Problem Statement
The current `INITIAL_INVENTORY` uses numeric string IDs ('1', '2', etc.), but the existing diagram state (autosaved) uses legacy semantic IDs (`mcu1`, `pot1`). This prevents the `useInventorySync` hook from finding the source item, causing warnings and preventing global style/pin updates from propagating.

## 3. Success Criteria
- **Zero Orphaned Components:** The console should show "✅ Inventory-Canvas Sync: All components in sync".
- **Stable References:** Every component in the diagram must have a `sourceInventoryId` that exists in the current inventory.
- **Backward Compatibility:** Existing user diagrams must be automatically repaired without data loss.

## 4. Technical Requirements
- **ID Overhaul:** Refactor `initialInventory.ts` to use semantic IDs.
- **Self-Healing Logic:** Implement a migration function that patches the diagram state in IndexedDB/LocalStorage.
