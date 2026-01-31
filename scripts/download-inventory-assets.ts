import fs from 'fs';
import path from 'path';
import https from 'https';

/**
 * download-inventory-assets.ts
 * Localizes external inventory images to satisfy ORB policies and ensure offline reliability.
 */

const ASSET_DIR = path.join(process.cwd(), 'public/assets/inventory');

if (!fs.existsSync(ASSET_DIR)) {
  fs.mkdirSync(ASSET_DIR, { recursive: true });
}

const INVENTORY_IMAGES = [
  { 
    name: 'mcu-arduino.jpg', 
    url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    name: 'mcu-generic.jpg', 
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400' 
  }
];

async function downloadImage(url: string, filename: string): Promise<void> {
  const dest = path.join(ASSET_DIR, filename);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`[DOWNLOADED] ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  console.log('--- Starting Inventory Asset Localization ---');
  
  for (const img of INVENTORY_IMAGES) {
    try {
      await downloadImage(img.url, img.name);
    } catch (err) {
      console.error(`[ERROR] Failed to download ${img.name}:`, (err as Error).message);
    }
  }
  
  console.log('--- Done ---');
}

main().catch(console.error);
