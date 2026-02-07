/**
 * PWA Icon Generation Script
 *
 * Generates all required PWA icon sizes from the source logo.
 * Uses sharp for high-quality image resizing.
 *
 * Usage:
 *   npx tsx scripts/generate-icons.ts
 *
 * Prerequisites:
 *   npm install -D sharp @types/sharp
 */

import fs from 'fs';
import path from 'path';

const SOURCE_ICON = path.resolve(__dirname, '../public/assets/ui/logo.png');
const OUTPUT_DIR = path.resolve(__dirname, '../public/assets/icons');

interface IconConfig {
  size: number;
  filename: string;
  purpose?: string;
}

const ICON_CONFIGS: IconConfig[] = [
  // Standard PWA icons
  { size: 72, filename: 'icon-72x72.png' },
  { size: 96, filename: 'icon-96x96.png' },
  { size: 128, filename: 'icon-128x128.png' },
  { size: 144, filename: 'icon-144x144.png' },
  { size: 152, filename: 'icon-152x152.png' },
  { size: 192, filename: 'icon-192x192.png' },
  { size: 384, filename: 'icon-384x384.png' },
  { size: 512, filename: 'icon-512x512.png' },
  // Maskable icons (with safe zone padding)
  { size: 192, filename: 'icon-192x192-maskable.png', purpose: 'maskable' },
  { size: 512, filename: 'icon-512x512-maskable.png', purpose: 'maskable' },
  // Apple touch icons
  { size: 180, filename: 'apple-touch-icon.png' },
  // Favicon sizes
  { size: 32, filename: 'favicon-32x32.png' },
  { size: 16, filename: 'favicon-16x16.png' },
];

async function generateIcons() {
  // Dynamic import for sharp (dev dependency)
  let sharp: typeof import('sharp');
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error(
      'Error: sharp is not installed. Run: npm install -D sharp @types/sharp'
    );
    process.exit(1);
  }

  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`Error: Source icon not found at ${SOURCE_ICON}`);
    process.exit(1);
  }

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Generating icons from ${SOURCE_ICON}...`);

  for (const config of ICON_CONFIGS) {
    const outputPath = path.join(OUTPUT_DIR, config.filename);
    const pipeline = sharp(SOURCE_ICON).resize(config.size, config.size, {
      fit: 'contain',
      background: { r: 5, g: 5, b: 8, alpha: 1 }, // #050508
    });

    if (config.purpose === 'maskable') {
      // Maskable icons need 10% safe zone padding
      const innerSize = Math.round(config.size * 0.8);
      const padding = Math.round(config.size * 0.1);

      const resizedBuffer = await sharp(SOURCE_ICON)
        .resize(innerSize, innerSize, { fit: 'contain', background: { r: 5, g: 5, b: 8, alpha: 1 } })
        .toBuffer();

      await sharp({
        create: {
          width: config.size,
          height: config.size,
          channels: 4,
          background: { r: 5, g: 5, b: 8, alpha: 1 },
        },
      })
        .composite([{ input: resizedBuffer, left: padding, top: padding }])
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
    } else {
      await pipeline.png({ quality: 90, compressionLevel: 9 }).toFile(outputPath);
    }

    const stat = fs.statSync(outputPath);
    console.log(
      `  ${config.filename.padEnd(30)} ${config.size}x${config.size}  ${(stat.size / 1024).toFixed(1)}KB`
    );
  }

  console.log(`\nGenerated ${ICON_CONFIGS.length} icons in ${OUTPUT_DIR}`);
}

generateIcons().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
