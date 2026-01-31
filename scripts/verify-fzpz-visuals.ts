import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE_URL = process.env.CIRCUITMIND_BASE_URL ?? 'http://localhost:3000';
const OUTPUT_DIR = './docs/screenshots/fzpz-verification';

test.describe('FZPZ Visual Verification', () => {
  test('Render FZPZ components on canvas', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Ensure output dir exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Get the first 4 components from the new manifest
    const components = [
      { id: 'Arduino_Uno_R3_a88cc83c', name: 'Arduino Uno R3', x: 100, y: 100 },
      { id: 'DHT11_28081550', name: 'DHT11', x: 400, y: 100 },
      { id: 'LED_5mm_Red_f7efb7de', name: 'LED 5mm Red', x: 100, y: 400 },
      { id: 'Resistor_220_Ohm_81020ded', name: 'Resistor 220 Ohm', x: 300, y: 400 }
    ];

    for (const comp of components) {
      console.log(`Adding ${comp.name} to canvas...`);
      // We'll use a hack to drop the component by dispatching a custom event 
      // or calling the drop handler directly if we can access context.
      // But simpler: just click the "Add" button if we can find it in the inventory.
      
      // Open inventory
      const inventoryBtn = page.locator('button[aria-label="Open inventory"]');
      if (await inventoryBtn.isVisible()) {
        await inventoryBtn.click();
        await page.waitForTimeout(500);
      }

      // Find the component card and click its "Add" button
      // InventoryItem has a button with title "Add to Canvas"
      const card = page.locator(`div:has-text("${comp.name}")`).first();
      const addBtn = card.locator('button[title="Add to Canvas"]');
      
      if (await addBtn.isVisible({ timeout: 5000 })) {
        await addBtn.click({ force: true });
        console.log(`✓ Added ${comp.name}`);
      } else {
        console.warn(`Could not find Add button for ${comp.name}`);
      }
      
      await page.waitForTimeout(1000);
    }

    // Zoom out to see everything
    await page.keyboard.press('Control+-');
    await page.keyboard.press('Control+-');
    await page.waitForTimeout(500);

    // Take screenshot of the canvas
    const canvas = page.locator('svg').first();
    await canvas.screenshot({ path: path.join(OUTPUT_DIR, 'canvas-fzpz-render.png') });
    
    console.log('✓ Visual audit complete. See docs/screenshots/fzpz-verification/canvas-fzpz-render.png');
  });
});
