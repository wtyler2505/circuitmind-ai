# Feature Implementation Plan: replace-inventory-with-fzpz

## 📋 Todo Checklist
- [ ] Set up `.fzpz` asset hosting infrastructure
- [ ] Generate/Sourcing high-quality FZPZ parts for the Starter Kit
- [ ] Refactor `InventoryContext` for asynchronous FZPZ loading
- [ ] Update `DiagramNode` to render FZPZ SVG views
- [ ] Align `calculatePinPositions` with FZPZ footprint data
- [ ] Final Review and Testing

## 🔍 Analysis & Investigation

### Codebase Structure
- `data/initialInventory.ts`: Currently contains a static array of `ElectronicComponent` objects with manual pin lists and image URLs.
- `services/fzpzLoader.ts`: A recently implemented service capable of parsing `.fzpz` (ZIP) files, extracting XML metadata (FZP), and retrieving SVG views (breadboard, schematic, etc.).
- `contexts/InventoryContext.tsx`: Manages the application's inventory state. Currently initializes synchronously from `localStorage` or `INITIAL_INVENTORY`.
- `components/diagram/DiagramNode.tsx`: Renders components on the canvas using manual SVG paths defined in `componentShapes.ts`.

### Current Architecture
- The app uses a React-based 2D engine where components are SVG groups on a canvas.
- Components are identified by IDs and mapped to shapes based on their `type` or `name`.
- Persistence is handled via `localStorage` for metadata and `IndexedDB` (via `storage.ts`) for heavier objects.

### Dependencies & Integration Points
- **JSZip**: Used for decompressing `.fzpz` files.
- **xml-js**: Used for parsing Fritzing's FZP XML files.
- **IndexedDB**: Essential for storing binary `.fzpz` data to avoid `localStorage` quota limits.

### Considerations & Challenges
- **Loading Performance**: Parsing multiple ZIP files on startup can be slow. We need a caching strategy (IndexedDB) and potentially a manifest file.
- **SVG Coordinate Systems**: Fritzing SVGs use various unit systems (mil, mm, in). `FzpzLoader` must accurately normalize these to our 10px = 0.1" grid.
- **Backwards Compatibility**: Existing diagrams might reference old component IDs or manual pin layouts. We need a mapping layer or a clean break for the new engine.

## 📝 Implementation Plan

### Prerequisites
- Create `public/parts/` directory for hosting bundled `.fzpz` files.
- Ensure `JSZip` and `xml-js` are properly configured in the project.

### Step-by-Step Implementation

1. **Step 1: Setup FZPZ Asset Hosting**
   - Create `public/parts/` directory.
   - Populate it with core parts (Arduino Uno R3, Resistor, LED, Breadboard, etc.) in `.fzpz` format.
   - Files to modify: None (create directory and add binary files).

2. **Step 2: Refactor `initialInventory.ts`**
   - Replace the full `ElectronicComponent` objects with a lightweight manifest.
   - Each item should have `id`, `name`, and `fzpzUrl`.
   - Files to modify: `data/initialInventory.ts`

3. **Step 3: Update `InventoryContext` for Async Loading**
   - Modify `InventoryProvider` to handle an `isLoading` state.
   - Implement an `initializeInventory` function that:
     - Checks `IndexedDB` for cached FZPZ data.
     - Fetches missing FZPZ files from `fzpzUrl`.
     - Uses `FzpzLoader.load()` to parse files and populate `footprint` and SVG data.
   - Files to modify: `contexts/InventoryContext.tsx`

4. **Step 4: Enhance `DiagramNode` for FZPZ Rendering**
   - Update `renderDetails()` in `DiagramNode.tsx` to check for `component.fzpzSource`.
   - If present, render the extracted breadboard SVG view directly into the `<g>` element.
   - Ensure the SVG is scaled to match our grid units.
   - Files to modify: `components/diagram/DiagramNode.tsx`

5. **Step 5: Align Pin Logic with FZPZ Footprints**
   - Update `calculatePinPositions` in `componentShapes.ts` to accept the full `component` object.
   - If `component.footprint.pins` exists, use those coordinates instead of manual heuristics.
   - Files to modify: `components/diagram/componentShapes.ts`, `components/diagram/DiagramNode.tsx`

6. **Step 6: Update `InventoryItem` UI**
   - Update the icon renderer to use the `icon` or `breadboard` SVG from FZPZ as a data URL in the thumbnail.
   - Files to modify: `components/inventory/InventoryItem.tsx`

### Testing Strategy
- **Unit Tests**: Update `FzpzLoader` tests to verify coordinate normalization for various Fritzing parts.
- **Visual Regression**: Compare rendered FZPZ parts against manual shapes to ensure scaling and pin alignment are correct.
- **Persistence Test**: Verify that refreshing the app loads parts from IndexedDB without re-fetching from the server.

## 🎯 Success Criteria
- The inventory sidebar displays components sourced from `.fzpz` files.
- Dragging a component onto the canvas renders its official Fritzing breadboard SVG view.
- Pins on the FZPZ-rendered components are interactive and correctly aligned with the 10px grid.
- No "manual" drawings are required for the Starter Kit components.
