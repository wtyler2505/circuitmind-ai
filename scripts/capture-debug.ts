/**
 * Debug script to inspect actual DOM structure
 * Run with: npx playwright test scripts/debug-selectors.ts --headed
 */

import { test, expect } from '@playwright/test';

test('Debug DOM selectors', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });

  console.log('\n═══════════════════════════════════════');
  console.log('🔍 DOM STRUCTURE INVESTIGATION');
  console.log('═══════════════════════════════════════\n');

  // ========== SETTINGS MODAL INVESTIGATION ==========
  console.log('━━━ SETTINGS MODAL ━━━');

  // Close any modal and inventory
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.mouse.move(1200, 400);
  await page.waitForTimeout(500);

  // Find and click settings button
  const settingsBtn = page.locator('button[title="Settings"]');
  console.log('Settings button exists:', await settingsBtn.count());

  await settingsBtn.click({ force: true });
  await page.waitForTimeout(800);

  // Check what's visible in the modal
  const modalButtons = await page.locator('button:visible').allTextContents();
  console.log('All visible buttons in modal:', modalButtons);

  // Check for buttons containing "API" or "Autonomy"
  const apiButtons = await page.locator('button').filter({ hasText: 'API' }).count();
  const autonomyButtons = await page.locator('button').filter({ hasText: 'Autonomy' }).count();
  console.log('Buttons with "API":', apiButtons);
  console.log('Buttons with "Autonomy":', autonomyButtons);

  // Check text content of all buttons
  const allButtons = page.locator('button');
  const buttonCount = await allButtons.count();
  console.log(`\nAll ${buttonCount} buttons in DOM:`);
  for (let i = 0; i < Math.min(buttonCount, 20); i++) {
    const btn = allButtons.nth(i);
    const text = await btn.textContent();
    const isVisible = await btn.isVisible();
    if (isVisible) {
      console.log(`  [${i}] "${text?.trim().slice(0, 50)}"`);
    }
  }

  // Try different selectors for settings tabs
  console.log('\n🔎 Testing tab selectors:');

  const sel1 = page.getByRole('button', { name: 'API Key' });
  console.log('getByRole(button, name="API Key"):', await sel1.count());

  const sel2 = page.locator('button').filter({ hasText: 'API Key' });
  console.log('locator(button).filter(hasText="API Key"):', await sel2.count());

  const sel3 = page.getByText('API Key');
  console.log('getByText("API Key"):', await sel3.count());

  const sel4 = page.locator('button:has-text("API Key")');
  console.log('locator("button:has-text(API Key)"):', await sel4.count());

  // Check if modal has proper structure
  const modalOverlay = page.locator('div[class*="fixed"][class*="inset-0"]');
  console.log('\nModal overlay exists:', await modalOverlay.count());

  const modalContent = page.locator('div[class*="bg-gray-900"][class*="rounded-xl"]');
  console.log('Modal content exists:', await modalContent.count());

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // ========== CANVAS INVESTIGATION ==========
  console.log('\n━━━ CANVAS/DIAGRAM ━━━');

  // Check SVG elements
  const allSvgs = page.locator('svg');
  const svgCount = await allSvgs.count();
  console.log(`Total SVGs on page: ${svgCount}`);

  for (let i = 0; i < Math.min(svgCount, 10); i++) {
    const svg = allSvgs.nth(i);
    const box = await svg.boundingBox();
    const classes = await svg.getAttribute('class');
    console.log(`  SVG[${i}]: ${box?.width}x${box?.height} - classes: "${classes?.slice(0, 60)}"`);
  }

  // Look for the main diagram container
  console.log('\n🔎 Looking for diagram container:');

  const diag1 = page.locator('div[class*="bg-slate-950"]');
  console.log('div[class*="bg-slate-950"]:', await diag1.count());

  const diag2 = page.locator('div[class*="overflow-hidden"]').filter({ has: page.locator('svg') });
  console.log('div[class*="overflow-hidden"] with svg:', await diag2.count());

  // Look for zoom buttons
  console.log('\n🔎 Looking for zoom controls:');

  const zoomIn = page.locator('button[title="Zoom In"]');
  const zoomOut = page.locator('button[title="Zoom Out"]');
  const resetView = page.locator('button[title="Reset View"]');

  console.log('Zoom In button:', await zoomIn.count(), '- visible:', await zoomIn.isVisible().catch(() => false));
  console.log('Zoom Out button:', await zoomOut.count(), '- visible:', await zoomOut.isVisible().catch(() => false));
  console.log('Reset View button:', await resetView.count(), '- visible:', await resetView.isVisible().catch(() => false));

  // Check if zoom buttons are inside a specific container
  const zoomContainer = page.locator('div').filter({ has: page.locator('button[title="Zoom In"]') }).first();
  const zoomBox = await zoomContainer.boundingBox().catch(() => null);
  console.log('Zoom container box:', zoomBox);

  // ========== 3D CANVAS INVESTIGATION ==========
  console.log('\n━━━ 3D VIEWER ━━━');

  // Open component editor
  await page.mouse.move(5, 400);
  await page.waitForTimeout(800);

  const editDetailsBtn = page.locator('button[title="Edit Details"]').first();
  if (await editDetailsBtn.count() > 0) {
    await editDetailsBtn.click();
    await page.waitForTimeout(500);

    // Go to 3D MODEL tab
    const threeDTab = page.locator('button').filter({ hasText: '3D MODEL' });
    console.log('3D MODEL tab exists:', await threeDTab.count());

    if (await threeDTab.count() > 0) {
      await threeDTab.click();
      await page.waitForTimeout(500);

      // Check for canvas element
      const canvasElements = page.locator('canvas');
      console.log('Canvas elements:', await canvasElements.count());

      for (let i = 0; i < await canvasElements.count(); i++) {
        const canvas = canvasElements.nth(i);
        const box = await canvas.boundingBox();
        console.log(`  Canvas[${i}]: ${box?.width}x${box?.height}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('🔍 INVESTIGATION COMPLETE');
  console.log('═══════════════════════════════════════\n');
});
