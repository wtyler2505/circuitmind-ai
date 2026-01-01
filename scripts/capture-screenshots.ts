/**
 * Comprehensive Screenshot Catalog Script
 * Captures EVERY UI element, state, and interaction in CircuitMind AI
 *
 * Run with: npx playwright test scripts/capture-screenshots.ts --headed
 */

import { test, expect, Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.CIRCUITMIND_BASE_URL ?? 'http://localhost:3000';
const SCREENSHOT_DIR = './docs/screenshots';
const SCREENSHOT_TIMEOUT_MS = 8000;

// Ensure directories exist
const dirs = [
  '01-app-shell',
  '02-header',
  '03-panels',
  '04-modals',
  '05-chat',
  '06-canvas',
  '07-inventory-components',
  '08-buttons',
  '09-icons',
  '10-forms',
  '11-states',
  '12-typography',
  '13-colors'
];

function ensureDir(dir: string) {
  const fullPath = path.join(SCREENSHOT_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
}

async function screenshot(page: Page, category: string, name: string, element?: Locator) {
  const dir = ensureDir(category);
  const filePath = path.join(dir, `${name}.png`);

  try {
    if (element) {
      await element.waitFor({ state: 'visible', timeout: SCREENSHOT_TIMEOUT_MS });
      await element.screenshot({ path: filePath, timeout: SCREENSHOT_TIMEOUT_MS });
    } else {
      await page.screenshot({ path: filePath, fullPage: false });
    }
    console.log(`✓ Captured: ${category}/${name}.png`);
  } catch (error) {
    console.warn(`WARN: Skipped ${category}/${name}.png (${String(error)})`);
  }
}

async function screenshotFullPage(page: Page, category: string, name: string) {
  const dir = ensureDir(category);
  const filePath = path.join(dir, `${name}.png`);
  try {
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`✓ Captured (full): ${category}/${name}.png`);
  } catch (error) {
    console.warn(`WARN: Skipped ${category}/${name}.png (${String(error)})`);
  }
}

async function safeClick(locator: Locator, label: string) {
  try {
    if (await locator.isVisible()) {
      try {
        await locator.click({ timeout: SCREENSHOT_TIMEOUT_MS, force: true });
        return true;
      } catch (error) {
        try {
          await locator.evaluate((el) => (el as HTMLElement).click());
          return true;
        } catch (evalError) {
          console.warn(`WARN: Skipped click for ${label} (${String(error)})`);
        }
      }
      return false;
    }
    console.warn(`WARN: Skipped click for ${label} (not visible)`);
  } catch (error) {
    console.warn(`WARN: Skipped click for ${label} (${String(error)})`);
  }
  return false;
}

async function safeHover(locator: Locator, label: string) {
  try {
    if (await locator.isVisible()) {
      try {
        await locator.scrollIntoViewIfNeeded({ timeout: SCREENSHOT_TIMEOUT_MS });
      } catch (error) {
        console.warn(`WARN: Scroll skipped for ${label} (${String(error)})`);
      }
      await locator.hover({ timeout: SCREENSHOT_TIMEOUT_MS, force: true });
      return true;
    }
    console.warn(`WARN: Skipped hover for ${label} (not visible)`);
  } catch (error) {
    console.warn(`WARN: Skipped hover for ${label} (${String(error)})`);
  }
  return false;
}

test.describe('CircuitMind AI Screenshot Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    // Wait for React to render
    await page.waitForTimeout(1000);
  });

  test('01 - App Shell & Layout', async ({ page }) => {
    // Full app views
    await screenshot(page, '01-app-shell', 'app-default-state');
    await screenshotFullPage(page, '01-app-shell', 'app-full-page');

    // Viewport at different sizes
    await page.setViewportSize({ width: 1920, height: 1080 });
    await screenshot(page, '01-app-shell', 'app-1920x1080');

    await page.setViewportSize({ width: 1440, height: 900 });
    await screenshot(page, '01-app-shell', 'app-1440x900');

    await page.setViewportSize({ width: 1280, height: 720 });
    await screenshot(page, '01-app-shell', 'app-1280x720');

    // Reset
    await page.setViewportSize({ width: 1366, height: 768 });
  });

  test('02 - Header Elements', async ({ page }) => {
    const header = page.locator('div').filter({ has: page.locator('h1:has-text("CIRCUIT")') }).first();
    await screenshot(page, '02-header', 'header-full', header);

    // Logo
    const logo = page.locator('h1:has-text("CIRCUIT")').first();
    await screenshot(page, '02-header', 'logo', logo);

    // Undo/Redo buttons
    const undoBtn = page.locator('button[aria-label="Undo"]');
    const redoBtn = page.locator('button[aria-label="Redo"]');
    if (await undoBtn.isVisible()) {
      await screenshot(page, '02-header', 'undo-button-disabled', undoBtn);
    }
    if (await redoBtn.isVisible()) {
      await screenshot(page, '02-header', 'redo-button-disabled', redoBtn);
    }

    // Save/Load buttons
    const saveBtn = page.locator('button:has-text("SAVE")');
    const loadBtn = page.locator('button:has-text("LOAD")');
    await screenshot(page, '02-header', 'save-button', saveBtn);
    await screenshot(page, '02-header', 'load-button', loadBtn);

    // Voice mode button
    const voiceBtn = page.locator('button[aria-label="Toggle live voice mode"]');
    if (await voiceBtn.isVisible()) {
      await screenshot(page, '02-header', 'voice-mode-button', voiceBtn);
    }

    // Settings button (gear icon)
    const settingsBtn = page.locator('button[aria-label="Open settings"]');
    if (await settingsBtn.isVisible()) {
      await screenshot(page, '02-header', 'settings-button', settingsBtn);
    }
  });

  test('03 - Inventory Panel', async ({ page }) => {
    // Toggle inventory open
    const inventoryTrigger = page.locator(
      'button[aria-label="Open inventory"], button[aria-label="Unlock inventory"], button[title="Inventory"], button[title="Unlock Inventory"]'
    );
    const inventoryOpened = await safeClick(inventoryTrigger, 'inventory toggle');
    if (!inventoryOpened) {
      console.warn('WARN: Inventory toggle unavailable. Skipping inventory capture.');
      return;
    }
    await page.waitForTimeout(500);

    // Inventory sidebar
    await screenshot(page, '03-panels', 'inventory-panel-open');

    // Lock button
    const lockBtn = page.locator('button[aria-label*="sidebar"]');
    if (await lockBtn.isVisible()) {
      await safeClick(lockBtn, 'inventory lock');
      await page.waitForTimeout(300);
      await screenshot(page, '03-panels', 'inventory-panel-locked');
    }

    // Header section
    const assetHeader = page.locator('h2:has-text("ASSET MANAGER")');
    await screenshot(page, '03-panels', 'inventory-header', assetHeader);

    // Tab buttons (LIST, ADD NEW, TOOLS)
    const listTab = page.locator('button:has-text("LIST")');
    const addNewTab = page.locator('button:has-text("ADD NEW")');
    const toolsTab = page.locator('button:has-text("TOOLS")');

    await screenshot(page, '03-panels', 'inventory-tab-list', listTab);
    await screenshot(page, '03-panels', 'inventory-tab-addnew', addNewTab);
    await screenshot(page, '03-panels', 'inventory-tab-tools', toolsTab);

    // Filter input
    const filterInput = page.locator('input[placeholder*="Filter"]');
    if (await filterInput.isVisible()) {
      await screenshot(page, '03-panels', 'inventory-filter-input', filterInput);

      // Filter with text
      await filterInput.fill('Arduino');
      await page.waitForTimeout(300);
      await screenshot(page, '03-panels', 'inventory-filter-active');
      await filterInput.clear();
    }

    // Category headers
    const categories = ['MICROCONTROLLER', 'SENSOR', 'ACTUATOR', 'POWER', 'OTHER'];
    for (const cat of categories) {
      const catHeader = page.locator(`h3:has-text("${cat}")`).first();
      if (await catHeader.isVisible()) {
        await screenshot(page, '03-panels', `inventory-category-${cat.toLowerCase()}`, catHeader);
      }
    }

    // ADD NEW tab
    await safeClick(addNewTab, 'inventory add tab');
    await page.waitForTimeout(300);
    await screenshot(page, '03-panels', 'inventory-addnew-panel');

    // TOOLS tab
    await safeClick(toolsTab, 'inventory tools tab');
    await page.waitForTimeout(300);
    await screenshot(page, '03-panels', 'inventory-tools-panel');

    // Back to LIST
    await safeClick(listTab, 'inventory list tab');
    await page.waitForTimeout(300);
  });

  test('04 - Settings Modal', async ({ page }) => {
    // Open settings
    const settingsBtn = page.locator('button[aria-label="Open settings"]');
    const settingsOpened = await safeClick(settingsBtn, 'settings button');
    if (!settingsOpened) {
      console.warn('WARN: Settings button not found. Skipping settings capture.');
      return;
    }
    await page.waitForTimeout(500);

    // Full modal
    await screenshot(page, '04-modals', 'settings-modal-full');

    // Close button
    const closeBtn = page.locator('button:has-text("×")').first();
    if (await closeBtn.isVisible()) {
      await screenshot(page, '04-modals', 'settings-close-button', closeBtn);
    }

    // API Key tab (should be default)
    await screenshot(page, '04-modals', 'settings-apikey-tab');

    // AI Autonomy tab
    const autonomyTab = page.locator('button:has-text("AI Autonomy")');
    if (await autonomyTab.isVisible()) {
      await safeClick(autonomyTab, 'settings autonomy tab');
      await page.waitForTimeout(300);
      await screenshot(page, '04-modals', 'settings-autonomy-tab');
    }

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('05 - Component Editor Modal', async ({ page }) => {
    // Open inventory and click Edit Details
    const inventoryTrigger = page.locator(
      'button[aria-label="Open inventory"], button[aria-label="Unlock inventory"], button[title="Inventory"], button[title="Unlock Inventory"]'
    );
    const inventoryOpened = await safeClick(inventoryTrigger, 'inventory toggle');
    if (!inventoryOpened) {
      console.warn('WARN: Inventory toggle unavailable. Skipping component editor capture.');
      return;
    }
    await page.waitForTimeout(500);

    // Lock sidebar
    const lockBtn = page.locator('button[aria-label*="sidebar"]');
    if (await lockBtn.isVisible()) {
      await safeClick(lockBtn, 'inventory lock');
      await page.waitForTimeout(300);
    }

    // Find and click Edit Details button
    const editDetailsBtn = page.locator('button[aria-label="Edit details"]').first();
    if (await editDetailsBtn.isVisible()) {
      await safeClick(editDetailsBtn, 'edit details');
      await page.waitForTimeout(500);

      // Full component editor modal
      await screenshot(page, '04-modals', 'component-editor-full');

      // Tab navigation - look for tabs
      const tabs = ['INFO', 'EDIT', 'IMAGE', '3D MODEL'];
      for (const tabName of tabs) {
        const tab = page.locator(`button:has-text("${tabName}")`);
        if (await tab.isVisible()) {
          await safeClick(tab, `component editor tab ${tabName}`);
          await page.waitForTimeout(300);
          await screenshot(page, '04-modals', `component-editor-tab-${tabName.toLowerCase().replace(' ', '-')}`);
        }
      }

      // Close modal
      await page.keyboard.press('Escape');
    }
  });

  test('06 - Chat Panel', async ({ page }) => {
    // Chat panel elements
    const chatPanel = page.locator('button:has-text("New Chat")').locator('..');

    // Session switcher
    const sessionBtn = page.locator('button:has-text("New Chat")');
    if (await sessionBtn.isVisible()) {
      await screenshot(page, '05-chat', 'chat-session-button', sessionBtn);
    }

    // Deep thinking toggle
    const deepThinkingBtn = page.locator('button[aria-label*="deep thinking"]');
    if (await deepThinkingBtn.isVisible()) {
      await screenshot(page, '05-chat', 'chat-deep-thinking-toggle', deepThinkingBtn);
    }

    // Minimize button
    const minimizeBtn = page.locator('button[aria-label="Minimize chat"]');
    if (await minimizeBtn.isVisible()) {
      await screenshot(page, '05-chat', 'chat-minimize-button', minimizeBtn);
    }

    // Mode buttons (chat, image, video)
    const chatModeBtn = page.locator('button:has-text("💬")');
    const imageModeBtn = page.locator('button:has-text("🖼")');
    const videoModeBtn = page.locator('button:has-text("🎬")');

    if (await chatModeBtn.isVisible()) {
      await screenshot(page, '05-chat', 'chat-mode-button', chatModeBtn);
    }
    if (await imageModeBtn.isVisible()) {
      await screenshot(page, '05-chat', 'image-mode-button', imageModeBtn);
    }
    if (await videoModeBtn.isVisible()) {
      await screenshot(page, '05-chat', 'video-mode-button', videoModeBtn);
    }

    // Input field
    const chatInput = page.locator('textarea[placeholder*="circuit"]');
    if (await chatInput.isVisible()) {
      await screenshot(page, '05-chat', 'chat-input-empty', chatInput);

      // With text
      await chatInput.fill('Generate a simple LED blink circuit with Arduino');
      await screenshot(page, '05-chat', 'chat-input-with-text', chatInput);
      await chatInput.clear();
    }

    // Attachment button
    const attachBtn = page.locator('button[aria-label="Attach image or video"]');
    if (await attachBtn.isVisible()) {
      await screenshot(page, '05-chat', 'chat-attach-button', attachBtn);
    }

    // Chat messages (if any exist)
    const messages = page.locator('[class*="message"]');
    const msgCount = await messages.count();
    if (msgCount > 0) {
      await screenshot(page, '05-chat', 'chat-messages-area');
    }

    // Minimized state
    if (await minimizeBtn.isVisible()) {
      await safeClick(minimizeBtn, 'chat minimize');
      await page.waitForTimeout(300);
      await screenshot(page, '05-chat', 'chat-minimized');

      // Restore
      const restoreBtn = page.locator('button[aria-label="Open chat"]');
      if (await restoreBtn.isVisible()) {
        await safeClick(restoreBtn, 'chat restore');
        await page.waitForTimeout(300);
      }
    }
  });

  test('07 - Canvas Area', async ({ page }) => {
    // Main canvas area
    const canvas = page.locator('svg').first();
    if (await canvas.isVisible()) {
      await screenshot(page, '06-canvas', 'canvas-empty');
    }

    // "Awaiting Circuit Generation" message
    const awaitingMsg = page.locator('h3:has-text("Awaiting")');
    if (await awaitingMsg.isVisible()) {
      await screenshot(page, '06-canvas', 'canvas-awaiting-message', awaitingMsg);
    }

    // Drag & drop hint
    const dragDropHint = page.locator('text=Drag & Drop');
    if (await dragDropHint.isVisible()) {
      await screenshot(page, '06-canvas', 'canvas-dragdrop-hint');
    }
  });

  test('08 - Individual Inventory Components', async ({ page }) => {
    // Open and lock inventory
    const inventoryTrigger = page.locator(
      'button[aria-label="Open inventory"], button[aria-label="Unlock inventory"], button[title="Inventory"], button[title="Unlock Inventory"]'
    );
    const inventoryOpened = await safeClick(inventoryTrigger, 'inventory toggle');
    if (!inventoryOpened) {
      console.warn('WARN: Inventory toggle unavailable. Skipping inventory component capture.');
      return;
    }
    await page.waitForTimeout(500);

    const lockBtn = page.locator('button[aria-label*="sidebar"]');
    if (await lockBtn.isVisible()) {
      await safeClick(lockBtn, 'inventory lock');
      await page.waitForTimeout(300);
    }

    // Screenshot each component card
    // Get all component items (they have images and descriptions)
    const componentCards = page.locator('[class*="component"], [class*="item"]').filter({
      has: page.locator('img')
    });

    const cardCount = await componentCards.count();
    console.log(`Found ${cardCount} component cards`);

    // Screenshot first 20 components (most important ones)
    for (let i = 0; i < Math.min(cardCount, 20); i++) {
      const card = componentCards.nth(i);
      if (await card.isVisible()) {
        const safeName = `component-${i}`;
        await screenshot(page, '07-inventory-components', safeName, card);
      }
    }
  });

  test('09 - All Buttons (hover and active states)', async ({ page }) => {
    // Collect all buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    const seen = new Set<string>();
    const maxUniqueButtons = 80;
    let unnamedCount = 0;

    for (let i = 0; i < buttonCount; i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const text = (await btn.textContent()) || '';
        const ariaLabel = (await btn.getAttribute('aria-label')) || '';
        const title = (await btn.getAttribute('title')) || '';
        const labelSource = ariaLabel || title || text || '';
        const dedupeKey = labelSource.trim().toLowerCase();

        if (!dedupeKey) {
          unnamedCount += 1;
          if (unnamedCount > 10) continue;
        } else if (seen.has(dedupeKey)) {
          continue;
        }

        if (dedupeKey) {
          seen.add(dedupeKey);
        }
        if (seen.size >= maxUniqueButtons) break;

        const safeName = (labelSource || `btn-${i}`)
          .replace(/[^a-zA-Z0-9]/g, '-')
          .toLowerCase()
          .substring(0, 30);

        // Normal state
        try {
          await btn.scrollIntoViewIfNeeded({ timeout: SCREENSHOT_TIMEOUT_MS });
        } catch (error) {
          console.warn(`WARN: Scroll skipped for ${safeName}-normal (${String(error)})`);
        }
        await screenshot(page, '08-buttons', `${safeName}-normal`, btn);

        // Hover state
        const hovered = await safeHover(btn, `button ${safeName}`);
        if (hovered) {
          await page.waitForTimeout(100);
          await screenshot(page, '08-buttons', `${safeName}-hover`, btn);
        }
      }
    }
  });

  test('10 - Form Elements', async ({ page }) => {
    // All inputs
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const placeholder = await input.getAttribute('placeholder') || '';
        const safeName = placeholder.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 30) || `input-${i}`;

        // Empty state
        await screenshot(page, '10-forms', `${safeName}-empty`, input);

        // Focus state
        await input.focus();
        await screenshot(page, '10-forms', `${safeName}-focus`, input);

        // With content (if it's a text input)
        const type = await input.getAttribute('type');
        if (type !== 'checkbox' && type !== 'radio' && type !== 'file') {
          await input.fill('Sample text');
          await screenshot(page, '10-forms', `${safeName}-filled`, input);
          await input.clear();
        }
      }
    }

    // Checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const cbCount = await checkboxes.count();
    const seenCheckboxes = new Set<string>();
    const maxCheckboxes = 10;
    for (let i = 0; i < cbCount; i++) {
      const cb = checkboxes.nth(i);
      if (await cb.isVisible()) {
        const label = (await cb.getAttribute('aria-label')) || `checkbox-${i}`;
        const dedupeKey = label.trim().toLowerCase();
        if (seenCheckboxes.has(dedupeKey)) continue;
        seenCheckboxes.add(dedupeKey);
        if (seenCheckboxes.size > maxCheckboxes) break;

        // Unchecked
        await screenshot(page, '10-forms', `checkbox-${i}-unchecked`, cb);

        // Checked
        try {
          await cb.scrollIntoViewIfNeeded({ timeout: SCREENSHOT_TIMEOUT_MS });
        } catch (error) {
          console.warn(`WARN: Scroll skipped for checkbox-${i} (${String(error)})`);
        }
        try {
          await cb.check({ force: true });
          await screenshot(page, '10-forms', `checkbox-${i}-checked`, cb);
          await cb.uncheck({ force: true });
        } catch (error) {
          console.warn(`WARN: Skipped checkbox toggle for checkbox-${i} (${String(error)})`);
        }
      }
    }
  });

  test('11 - Typography Samples', async ({ page }) => {
    // Headings
    const h1s = page.locator('h1');
    const h2s = page.locator('h2');
    const h3s = page.locator('h3');

    for (let i = 0; i < await h1s.count(); i++) {
      const h = h1s.nth(i);
      if (await h.isVisible()) {
        await screenshot(page, '12-typography', `h1-${i}`, h);
      }
    }

    for (let i = 0; i < await h2s.count(); i++) {
      const h = h2s.nth(i);
      if (await h.isVisible()) {
        await screenshot(page, '12-typography', `h2-${i}`, h);
      }
    }

    for (let i = 0; i < await h3s.count(); i++) {
      const h = h3s.nth(i);
      if (await h.isVisible()) {
        await screenshot(page, '12-typography', `h3-${i}`, h);
      }
    }
  });

  test('12 - Generate Manifest', async ({ page }) => {
    // After all screenshots, generate a manifest
    const manifest: string[] = ['# Screenshot Catalog Manifest\n'];
    manifest.push(`Generated: ${new Date().toISOString()}\n`);
    manifest.push('## Directory Structure\n');

    for (const dir of dirs) {
      const fullDir = path.join(SCREENSHOT_DIR, dir);
      if (fs.existsSync(fullDir)) {
        const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.png'));
        manifest.push(`\n### ${dir}/\n`);
        for (const file of files) {
          manifest.push(`- ${file}`);
        }
      }
    }

    const manifestPath = path.join(SCREENSHOT_DIR, 'MANIFEST.md');
    fs.writeFileSync(manifestPath, manifest.join('\n'));
    console.log('✓ Generated MANIFEST.md');
  });
});
