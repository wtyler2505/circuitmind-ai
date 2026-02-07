/**
 * PWA Icon Validation Script
 *
 * Validates that all required PWA icons exist with correct sizes.
 *
 * Usage:
 *   npx tsx scripts/validate-icons.ts
 */

import fs from 'fs';
import path from 'path';

const ICONS_DIR = path.resolve(__dirname, '../public/assets/icons');
const MANIFEST_PATH = path.resolve(__dirname, '../dist/manifest.webmanifest');

interface ValidationResult {
  file: string;
  exists: boolean;
  sizeOk: boolean;
  details: string;
}

const REQUIRED_ICONS = [
  { filename: 'icon-72x72.png', maxSizeKB: 20 },
  { filename: 'icon-96x96.png', maxSizeKB: 30 },
  { filename: 'icon-128x128.png', maxSizeKB: 50 },
  { filename: 'icon-144x144.png', maxSizeKB: 60 },
  { filename: 'icon-152x152.png', maxSizeKB: 70 },
  { filename: 'icon-192x192.png', maxSizeKB: 100 },
  { filename: 'icon-384x384.png', maxSizeKB: 300 },
  { filename: 'icon-512x512.png', maxSizeKB: 500 },
  { filename: 'icon-192x192-maskable.png', maxSizeKB: 100 },
  { filename: 'icon-512x512-maskable.png', maxSizeKB: 500 },
  { filename: 'apple-touch-icon.png', maxSizeKB: 100 },
  { filename: 'favicon-32x32.png', maxSizeKB: 5 },
  { filename: 'favicon-16x16.png', maxSizeKB: 3 },
];

function validateIcons(): boolean {
  console.log('PWA Icon Validation');
  console.log('='.repeat(60));

  let allPassed = true;
  const results: ValidationResult[] = [];

  // Check icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    console.log(`\nIcons directory not found: ${ICONS_DIR}`);
    console.log('Run: npm run generate:icons\n');
    return false;
  }

  for (const icon of REQUIRED_ICONS) {
    const filePath = path.join(ICONS_DIR, icon.filename);
    const exists = fs.existsSync(filePath);

    if (!exists) {
      results.push({
        file: icon.filename,
        exists: false,
        sizeOk: false,
        details: 'MISSING',
      });
      allPassed = false;
      continue;
    }

    const stat = fs.statSync(filePath);
    const sizeKB = stat.size / 1024;
    const sizeOk = sizeKB <= icon.maxSizeKB;

    if (!sizeOk) allPassed = false;

    results.push({
      file: icon.filename,
      exists: true,
      sizeOk,
      details: `${sizeKB.toFixed(1)}KB${sizeOk ? '' : ` (max: ${icon.maxSizeKB}KB)`}`,
    });
  }

  // Print results
  for (const result of results) {
    const status = !result.exists
      ? 'MISS'
      : result.sizeOk
        ? ' OK '
        : 'SIZE';
    const color = !result.exists ? '\x1b[31m' : result.sizeOk ? '\x1b[32m' : '\x1b[33m';
    console.log(
      `  ${color}[${status}]\x1b[0m ${result.file.padEnd(35)} ${result.details}`
    );
  }

  // Validate manifest if it exists
  console.log('\nManifest Validation:');
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
      const icons = manifest.icons || [];
      console.log(`  Icons in manifest: ${icons.length}`);

      const hasMaskable = icons.some(
        (i: { purpose?: string }) => i.purpose?.includes('maskable')
      );
      const has192 = icons.some((i: { sizes?: string }) => i.sizes === '192x192');
      const has512 = icons.some((i: { sizes?: string }) => i.sizes === '512x512');

      console.log(`  Has 192x192: ${has192 ? 'YES' : 'NO'}`);
      console.log(`  Has 512x512: ${has512 ? 'YES' : 'NO'}`);
      console.log(`  Has maskable: ${hasMaskable ? 'YES' : 'NO'}`);

      if (!has192 || !has512 || !hasMaskable) allPassed = false;
    } catch (err) {
      console.log(`  Error reading manifest: ${err}`);
      allPassed = false;
    }
  } else {
    console.log('  Manifest not found (run build first)');
  }

  console.log('\n' + '='.repeat(60));
  console.log(allPassed ? '\x1b[32mAll validations passed!\x1b[0m' : '\x1b[31mSome validations failed.\x1b[0m');

  return allPassed;
}

const passed = validateIcons();
process.exit(passed ? 0 : 1);
