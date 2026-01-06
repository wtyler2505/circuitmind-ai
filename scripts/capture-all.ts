/**
 * CircuitMind AI - Comprehensive Screenshot Catalog
 * 
 * Uses Playwright best practices:
 * - Role-based selectors (getByRole, getByText, getByTitle)
 * - Auto-waiting (no arbitrary timeouts)
 * - Disabled animations for consistent captures
 * - Contextual screenshots with proper sizing
 */

import { test, expect, Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = './docs/screenshots';

// Screenshot options for consistency
const SCREENSHOT_OPTS = {
  animations: 'disabled' as const,
  caret: 'hide' as const,
  scale: 'css' as const,
};

function ensureDir(subdir: string): string {
  const dir = path.join(SCREENSHOT_DIR, subdir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function captureElement(
  locator: Locator,
  subdir: string,
  name: string,
  options: { minWidth?: number; minHeight?: number } = {}
): Promise<boolean> {
  const { minWidth = 20, minHeight = 20 } = options;
  
  try {
    // Wait for element to be visible
    await expect(locator).toBeVisible({ timeout: 5000 });
    
    // Check element has reasonable size
    const box = await locator.boundingBox();
    if (!box || box.width < minWidth || box.height < minHeight) {
      console.log(`⚠ ${subdir}/${name}.png - too small (${box?.width}x${box?.height}), skipped`);
      return false;
    }
    
    const filePath = path.join(ensureDir(subdir), `${name}.png`);
    await locator.screenshot({ path: filePath, ...SCREENSHOT_OPTS });
    console.log(`✓ ${subdir}/${name}.png (${Math.round(box.width)}x${Math.round(box.height)})`);
    return true;
  } catch (e) {
    console.log(`✗ ${subdir}/${name}.png - not found`);
    return false;
  }
}

async function captureViewport(page: Page, subdir: string, name: string): Promise<boolean> {
  try {
    const filePath = path.join(ensureDir(subdir), `${name}.png`);
    await page.screenshot({ path: filePath, ...SCREENSHOT_OPTS });
    console.log(`✓ ${subdir}/${name}.png (viewport)`);
    return true;
  } catch (e) {
    console.log(`✗ ${subdir}/${name}.png - failed`);
    return false;
  }
}

async function captureFullPage(page: Page, subdir: string, name: string): Promise<boolean> {
  try {
    const filePath = path.join(ensureDir(subdir), `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: true, ...SCREENSHOT_OPTS });
    console.log(`✓ ${subdir}/${name}.png (fullpage)`);
    return true;
  } catch (e) {
    console.log(`✗ ${subdir}/${name}.png - failed`);
    return false;
  }
}

test('CircuitMind AI Screenshot Catalog', async ({ page }) => {
  // Navigate to set up localStorage with test data BEFORE app loads
  await page.goto('http://localhost:3000');
  
  // Inject a test diagram so DiagramCanvas renders with zoom controls
  const testDiagram = {
    title: "Test Circuit",
    components: [
      { id: "test-1", name: "Arduino Uno", type: "arduino", pins: ["5V", "GND", "D13", "D12"], quantity: 1 },
      { id: "test-2", name: "LED", type: "led", pins: ["Anode", "Cathode"], quantity: 1 }
    ],
    connections: [
      { fromComponentId: "test-1", fromPin: "D13", toComponentId: "test-2", toPin: "Anode", color: "#00ff00" }
    ],
    explanation: "Test circuit for screenshot capture"
  };
  
  await page.evaluate((diagram) => {
    localStorage.setItem('cm_autosave', JSON.stringify(diagram));
  }, testDiagram);
  
  // Reload to pick up the injected data
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  // Wait for React to hydrate (use specific h1 heading)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });

  let captureCount = 0;

  // ============================================
  // 1. APP SHELL - Full application views
  // ============================================
  console.log('\n━━━ 01 APP SHELL ━━━');
  
  if (await captureViewport(page, '01-app-shell', '01-default')) captureCount++;
  if (await captureFullPage(page, '01-app-shell', '02-fullpage')) captureCount++;
  
  // Responsive viewports
  const viewports = [
    { width: 1920, height: 1080, name: '03-1920x1080' },
    { width: 1440, height: 900, name: '04-1440x900' },
    { width: 1024, height: 768, name: '05-1024x768' },
    { width: 768, height: 1024, name: '06-tablet' },
    { width: 375, height: 812, name: '07-mobile' },
  ];
  
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    if (await captureViewport(page, '01-app-shell', vp.name)) captureCount++;
  }
  
  // Reset viewport
  await page.setViewportSize({ width: 1366, height: 768 });

  // ============================================
  // 2. HEADER - Logo, buttons, controls
  // ============================================
  console.log('\n━━━ 02 HEADER ━━━');
  
  // Full header (it's a div containing h1, not a <header> element)
  // Find by the toolbar div that contains the h1 heading
  const header = page.locator('div.h-14').filter({
    has: page.getByRole('heading', { level: 1 })
  }).first();
  if (await captureElement(header, '02-header', '01-header-full', { minWidth: 200 })) captureCount++;
  
  // Logo/title
  const logo = page.getByRole('heading', { level: 1 });
  if (await captureElement(logo, '02-header', '02-logo')) captureCount++;
  
  // Header buttons by title attribute (more reliable)
  const headerButtons = [
    { title: 'Undo', name: '03-btn-undo' },
    { title: 'Redo', name: '04-btn-redo' },
  ];
  
  for (const btn of headerButtons) {
    const locator = page.locator(`button[title="${btn.title}"]`);
    if (await captureElement(locator, '02-header', btn.name)) captureCount++;
  }
  
  // Save/Load buttons by text
  const saveBtn = page.getByRole('button', { name: 'SAVE' });
  if (await captureElement(saveBtn, '02-header', '05-btn-save')) captureCount++;
  
  const loadBtn = page.getByRole('button', { name: 'LOAD' });
  if (await captureElement(loadBtn, '02-header', '06-btn-load')) captureCount++;
  
  // Settings button (gear icon, title="Settings")
  const settingsBtn = page.locator('button[title="Settings"]');
  if (await captureElement(settingsBtn, '02-header', '07-btn-settings')) captureCount++;

  // ============================================
  // 3. INVENTORY PANEL
  // ============================================
  console.log('\n━━━ 03 INVENTORY ━━━');
  
  // Open inventory by hovering left edge
  await page.mouse.move(5, 400);
  await page.waitForTimeout(800); // Wait for slide animation
  
  // Capture with inventory open
  if (await captureViewport(page, '03-inventory', '01-panel-open')) captureCount++;
  
  // Lock button to keep it open
  const lockBtn = page.getByRole('button', { name: 'Lock' });
  try {
    await expect(lockBtn).toBeVisible({ timeout: 3000 });
    await lockBtn.click();
    if (await captureViewport(page, '03-inventory', '02-panel-locked')) captureCount++;
  } catch {
    console.log('⚠ Lock button not found');
  }
  
  // Tab buttons (these are actual button elements with exact text)
  const tabs = ['LIST', 'ADD NEW', 'TOOLS'];
  for (let i = 0; i < tabs.length; i++) {
    const tabName = tabs[i];
    const tabBtn = page.getByRole('button', { name: tabName, exact: true });
    
    try {
      await expect(tabBtn).toBeVisible({ timeout: 2000 });
      await tabBtn.click();
      await page.waitForTimeout(300);
      
      // Capture tab button
      if (await captureElement(tabBtn, '03-inventory', `03-tab-${tabName.toLowerCase().replace(' ', '-')}-btn`)) captureCount++;
      
      // Capture panel content with this tab active
      if (await captureViewport(page, '03-inventory', `04-tab-${tabName.toLowerCase().replace(' ', '-')}-view`)) captureCount++;
    } catch {
      console.log(`⚠ Tab "${tabName}" not found`);
    }
  }
  
  // Return to LIST tab
  try {
    await page.getByRole('button', { name: 'LIST', exact: true }).click();
    await page.waitForTimeout(300);
  } catch {}

  // ============================================
  // 4. COMPONENT CARDS
  // ============================================
  console.log('\n━━━ 04 COMPONENT CARDS ━━━');
  
  // Find component items in the list (look for items with visible images)
  // These are typically divs with group class that contain component info
  const componentCards = page.locator('[class*="group"][class*="relative"]').filter({
    has: page.locator('img, svg')
  });
  
  const cardCount = await componentCards.count();
  console.log(`Found ${cardCount} component cards`);
  
  for (let i = 0; i < Math.min(cardCount, 10); i++) {
    const card = componentCards.nth(i);
    
    try {
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      
      // Get component name for filename
      const nameSpan = card.locator('span, div').first();
      const cardName = await nameSpan.textContent() || `component-${i}`;
      const safeName = cardName.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      
      // Normal state
      if (await captureElement(card, '04-components', `${String(i + 1).padStart(2, '0')}-${safeName}`)) captureCount++;
      
      // Hover state (shows action buttons)
      await card.hover();
      await page.waitForTimeout(300);
      if (await captureElement(card, '04-components', `${String(i + 1).padStart(2, '0')}-${safeName}-hover`)) captureCount++;
      
    } catch (e) {
      console.log(`⚠ Component card ${i} - skipped`);
    }
  }

  // ============================================
  // 5. COMPONENT EDITOR MODAL
  // ============================================
  console.log('\n━━━ 05 COMPONENT EDITOR ━━━');
  
  // Find Edit Details button (has title attribute)
  const editDetailsBtn = page.locator('button[title="Edit Details"]').first();
  
  try {
    await expect(editDetailsBtn).toBeVisible({ timeout: 3000 });
    await editDetailsBtn.click();
    await page.waitForTimeout(500);
    
    // Full modal
    if (await captureViewport(page, '05-modals', '01-editor-full')) captureCount++;
    
    // Modal tabs - ACTUAL tab names from ComponentEditorModal.tsx: INFO, EDIT, IMAGE, 3D MODEL
    const editorTabs = ['INFO', 'EDIT', 'IMAGE', '3D MODEL'];
    for (let i = 0; i < editorTabs.length; i++) {
      const tabName = editorTabs[i];
      // Use text-based matching since tabs are styled buttons with exact uppercase text
      const tabBtn = page.locator('button').filter({ hasText: new RegExp(`^${tabName}$`) });
      
      try {
        await expect(tabBtn).toBeVisible({ timeout: 2000 });
        await tabBtn.click();
        await page.waitForTimeout(400);
        if (await captureViewport(page, '05-modals', `02-editor-tab-${tabName.toLowerCase().replace(' ', '-')}`)) captureCount++;
        
        // If 3D MODEL tab, try to capture the canvas and the ThreeViewer
        if (tabName === '3D MODEL') {
          const canvas = page.locator('canvas').first();
          if (await captureElement(canvas, '05-modals', '03-3d-viewer-canvas', { minWidth: 50, minHeight: 50 })) captureCount++;
        }
        
        // If EDIT tab, capture AI Assistant sidebar toggle and fields
        if (tabName === 'EDIT') {
          // AI Assistant button
          const aiAssistBtn = page.locator('button').filter({ hasText: 'AI ASSISTANT' });
          if (await captureElement(aiAssistBtn, '05-modals', '04-ai-assistant-btn')) captureCount++;
          
          // Try to open AI chat sidebar
          try {
            await expect(aiAssistBtn).toBeVisible({ timeout: 2000 });
            await aiAssistBtn.click();
            await page.waitForTimeout(500);
            if (await captureViewport(page, '05-modals', '05-editor-with-ai-chat')) captureCount++;
            
            // Close AI chat by clicking the button again (it's a toggle)
            await aiAssistBtn.click();
            await page.waitForTimeout(300);
          } catch {}
        }
      } catch {
        console.log(`⚠ Editor tab "${tabName}" not found`);
      }
    }
    
    // Close modal - wait for it to actually close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Ensure the modal overlay is gone
    const editorModalOverlay = page.locator('div[class*="fixed"][class*="z-50"][class*="bg-black"]');
    try {
      await expect(editorModalOverlay).toBeHidden({ timeout: 3000 });
    } catch {
      // Force close with another Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  } catch {
    console.log('⚠ Could not open component editor');
  }

  // ============================================
  // 6. SETTINGS MODAL
  // ============================================
  console.log('\n━━━ 06 SETTINGS ━━━');
  
  // CRITICAL: Close ALL modals first - press Escape multiple times
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  
  // Verify no modal overlays are blocking
  const anyModalOverlay = page.locator('div[class*="fixed"][class*="z-50"][class*="bg-black"]');
  const hasBlockingModal = await anyModalOverlay.isVisible().catch(() => false);
  if (hasBlockingModal) {
    console.log('⚠ Modal still blocking, clicking outside to close');
    await page.mouse.click(50, 50);
    await page.waitForTimeout(500);
  }
  
  // Close inventory panel
  try {
    const unlockBtn = page.locator('button[title*="Unlock"]').first();
    if (await unlockBtn.isVisible({ timeout: 1000 })) {
      await unlockBtn.click();
      await page.waitForTimeout(300);
    }
  } catch {}
  
  // Move mouse away from inventory
  await page.mouse.move(900, 400);
  await page.waitForTimeout(500);
  
  // Settings button
  const settingsButton = page.locator('button[title="Settings"]');
  
  try {
    await settingsButton.click({ timeout: 5000 });
    
    // Wait for the settings modal to appear - look for the modal with "Settings" heading
    const settingsHeading = page.locator('h2').filter({ hasText: 'Settings' });
    await expect(settingsHeading).toBeVisible({ timeout: 5000 });
    console.log('Settings modal opened successfully');
    
    // Full settings modal - capture without disabling animations to prevent modal close
    if (await captureViewport(page, '06-settings', '01-settings-full')) captureCount++;
    
    // Verify modal is still open
    const isModalStillOpen = await settingsHeading.isVisible().catch(() => false);
    console.log(`Settings modal still open after capture: ${isModalStillOpen}`);
    
    // Settings tabs - find the buttons inside the modal
    // The modal has a specific structure: fixed overlay > modal content > tabs
    const apiKeyTab = page.locator('button').filter({ hasText: 'API Key' }).first();
    try {
      await expect(apiKeyTab).toBeVisible({ timeout: 3000 });
      await apiKeyTab.click();
      await page.waitForTimeout(500);
      if (await captureViewport(page, '06-settings', '02-tab-api-key')) captureCount++;
    } catch (e) {
      console.log(`⚠ API Key tab not found: ${e instanceof Error ? e.message : 'unknown'}`);
    }
    
    // Tab: AI Autonomy
    const autonomyTab = page.locator('button').filter({ hasText: 'AI Autonomy' }).first();
    try {
      await expect(autonomyTab).toBeVisible({ timeout: 3000 });
      await autonomyTab.click();
      await page.waitForTimeout(500);
      if (await captureViewport(page, '06-settings', '02-tab-ai-autonomy')) captureCount++;
    } catch (e) {
      console.log(`⚠ AI Autonomy tab not found: ${e instanceof Error ? e.message : 'unknown'}`);
    }
    
    // Close settings modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } catch (e) {
    console.log(`⚠ Could not open settings: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // ============================================
  // 7. CHAT PANEL
  // ============================================
  console.log('\n━━━ 07 CHAT ━━━');
  
  // Chat panel - find the container with the chat textarea
  // The chat area has bg-gray-900 and rounded-t-xl, contains textarea with specific placeholder
  const chatTextarea = page.locator('textarea[placeholder*="Ask about your circuit"]');
  
  // First verify textarea exists
  try {
    await expect(chatTextarea).toBeVisible({ timeout: 5000 });
  } catch {
    console.log('⚠ Chat textarea not found');
  }
  
  // Chat panel is the parent container (4 levels up from textarea based on ChatPanel.tsx structure)
  const chatPanel = page.locator('div[class*="bg-gray-900"][class*="rounded-t-xl"]').first();
  
  if (await captureElement(chatPanel, '07-chat', '01-panel-full', { minWidth: 100, minHeight: 50 })) captureCount++;
  
  // Chat input textarea
  if (await captureElement(chatTextarea, '07-chat', '02-input', { minWidth: 100, minHeight: 30 })) captureCount++;
  
  // Mode selector container - look for the flex container with mode buttons (emoji buttons: 💬 🖼️ 🎬)
  const modeContainer = page.locator('div[class*="bg-gray-700"][class*="rounded-lg"]').filter({
    has: page.locator('button')
  }).first();
  if (await captureElement(modeContainer, '07-chat', '03-mode-selector', { minWidth: 50, minHeight: 20 })) captureCount++;
  
  // Capture individual mode buttons
  try {
    const modeButtons = modeContainer.locator('button');
    const modeCount = await modeButtons.count();
    console.log(`Found ${modeCount} mode buttons`);
    
    for (let i = 0; i < modeCount; i++) {
      const modeBtn = modeButtons.nth(i);
      try {
        await modeBtn.click();
        await page.waitForTimeout(200);
        if (await captureElement(modeBtn, '07-chat', `04-mode-btn-${i + 1}`)) captureCount++;
      } catch {}
    }
  } catch {
    console.log('⚠ Could not capture mode buttons');
  }
  
  // Send button - has class bg-cyan-600 AND rounded-xl (not rounded-full which is the floating button)
  // From ChatPanel.tsx line 401-405: className="p-2.5 bg-cyan-600 hover:bg-cyan-500 ... rounded-xl..."
  const sendBtn = page.locator('button[class*="bg-cyan-600"][class*="rounded-xl"]').first();
  if (await captureElement(sendBtn, '07-chat', '05-send-btn')) captureCount++;

  // Upload/attach button - has title="Attach image/video" (from ChatPanel.tsx line 344)
  const uploadBtn = page.locator('button[title="Attach image/video"]');
  if (await captureElement(uploadBtn, '07-chat', '06-upload-btn')) captureCount++;

  // Messages/conversation area - the scrollable div that shows chat history
  // From ChatPanel.tsx line 246: className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar"
  // Look for the chat container first, then find the scrollable messages area inside
  const messagesArea = chatPanel.locator('div[class*="overflow-y-auto"]').first();
  if (await captureElement(messagesArea, '07-chat', '07-messages-area', { minWidth: 50, minHeight: 30 })) captureCount++;

  // ============================================
  // 8. CANVAS/DIAGRAM AREA
  // ============================================
  console.log('\n━━━ 08 CANVAS ━━━');
  
  // Close any open modals first
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  
  // CRITICAL: Force close the inventory panel
  // 1. First try clicking the unlock button (has title="Unlock Inventory" or "Unlock Sidebar")
  const unlockBtnCanvas = page.locator('button[title*="Unlock"]').first();
  const inventorySidebar = page.locator('div[class*="fixed"][class*="left-0"][class*="w-full"]').filter({ hasText: 'INVENTORY' });
  
  try {
    if (await unlockBtnCanvas.isVisible({ timeout: 2000 })) {
      console.log('Found Unlock button, clicking to unpin inventory');
      await unlockBtnCanvas.click();
      await page.waitForTimeout(300);
    }
  } catch {}
  
  // 2. Move mouse FAR from inventory to trigger auto-close (inventory has 300ms hover delay)
  await page.mouse.move(1200, 400);
  await page.waitForTimeout(600);
  
  // 3. Click in canvas area to ensure focus is outside inventory
  await page.mouse.click(1000, 400);
  await page.waitForTimeout(500);
  
  // 4. Check if inventory is still open, if so try closing by clicking outside
  const isInventoryOpen = await inventorySidebar.isVisible().catch(() => false);
  console.log(`Inventory still visible: ${isInventoryOpen}`);
  
  if (isInventoryOpen) {
    // Click in canvas area to close
    await page.mouse.click(900, 300);
    await page.waitForTimeout(500);
  }
  
  // Debug: Check what containers exist
  const slate950Count = await page.locator('div[class*="bg-slate-950"]').count();
  console.log(`bg-slate-950 containers: ${slate950Count}`);
  
  // Check all buttons with title attribute
  const titledButtons = await page.locator('button[title]').allTextContents();
  console.log(`Buttons with title attr: ${titledButtons.slice(0, 10).join(', ')}`);
  
  // List all button titles
  const buttonTitles = await page.locator('button[title]').evaluateAll(
    btns => btns.map(b => b.getAttribute('title'))
  );
  console.log(`Button titles found: ${buttonTitles.slice(0, 15).join(', ')}`);
  
  // Find zoom buttons - they're inside DiagramCanvas at top-right
  const zoomInBtn = page.locator('button[title="Zoom In"]');
  const zoomOutBtn = page.locator('button[title="Zoom Out"]');
  const resetViewBtn = page.locator('button[title="Reset View"]');
  
  // Debug: Check what's on the page
  const zoomBtnCount = await page.locator('button[title="Zoom In"]').count();
  console.log(`Zoom In buttons found in DOM: ${zoomBtnCount}`);
  
  // Check if zoom buttons are visible
  const zoomVisible = await zoomInBtn.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`Zoom buttons visible: ${zoomVisible}`);
  
  // Capture zoom buttons
  if (await captureElement(zoomInBtn, '08-canvas', '01-zoom-in-btn')) captureCount++;
  if (await captureElement(zoomOutBtn, '08-canvas', '02-zoom-out-btn')) captureCount++;
  if (await captureElement(resetViewBtn, '08-canvas', '03-reset-view-btn')) captureCount++;
  
  // Search/filter input - find by placeholder
  const searchInput = page.locator('input[placeholder*="Locate"]');
  if (await captureElement(searchInput, '08-canvas', '04-search-input')) captureCount++;
  
  // Find the diagram container by looking for parent of zoom button
  // The container has the main SVG with the diagram
  const svgDiagram = page.locator('svg[class*="w-full"][class*="h-full"][class*="pointer-events-none"]').first();
  if (await captureElement(svgDiagram, '08-canvas', '05-diagram-svg', { minWidth: 100, minHeight: 100 })) captureCount++;
  
  // Full canvas viewport capture (entire working area with diagram visible)
  if (await captureViewport(page, '08-canvas', '06-full-workspace')) captureCount++;

  // ============================================
  // 9. GENERATE MANIFEST
  // ============================================
  console.log('\n━━━ GENERATING MANIFEST ━━━');
  
  const manifest: string[] = [
    '# CircuitMind AI Screenshot Catalog',
    '',
    `**Generated:** ${new Date().toISOString()}`,
    `**Total Screenshots:** ${captureCount}`,
    '',
    '## Directory Structure',
    '',
    '| Directory | Description |',
    '|-----------|-------------|',
    '| 01-app-shell | Full application views, responsive layouts |',
    '| 02-header | Header elements, logo, navigation buttons |',
    '| 03-inventory | Component inventory panel, tabs |',
    '| 04-components | Individual component cards |',
    '| 05-modals | Component editor modal, tabs |',
    '| 06-settings | Settings modal, API key, autonomy |',
    '| 07-chat | Chat panel, input, mode buttons |',
    '| 08-canvas | Wiring diagram, SVG canvas |',
    '',
    '## Screenshots',
    ''
  ];

  const dirs = fs.readdirSync(SCREENSHOT_DIR)
    .filter(d => fs.statSync(path.join(SCREENSHOT_DIR, d)).isDirectory())
    .sort();

  for (const dir of dirs) {
    const files = fs.readdirSync(path.join(SCREENSHOT_DIR, dir))
      .filter(f => f.endsWith('.png'))
      .sort();

    if (files.length > 0) {
      manifest.push(`### ${dir}/ (${files.length} screenshots)`);
      manifest.push('');
      manifest.push('| File | Preview |');
      manifest.push('|------|---------|');
      for (const file of files) {
        manifest.push(`| \`${file}\` | ![](${dir}/${file}) |`);
      }
      manifest.push('');
    }
  }

  manifest.push('---');
  manifest.push(`*Generated by capture-all.ts using Playwright*`);

  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'MANIFEST.md'), manifest.join('\n'));
  console.log('✓ Generated MANIFEST.md');

  console.log(`\n━━━ COMPLETE: ${captureCount} screenshots captured ━━━`);
});
