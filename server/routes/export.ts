import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

interface CatalogRow {
  id: string;
  name: string;
  type: string;
  description: string;
  manufacturer: string;
  mpn: string;
  package_type: string;
  datasheet_url: string;
  image_url: string;
  pins: string;
  specs: string;
  ai_confidence: number;
  ai_provider: string;
  needs_review: number;
  created_at: string;
  updated_at: string;
}

interface InventoryRow {
  id: string;
  catalog_id: string;
  location_id: string | null;
  quantity: number;
  low_stock_threshold: number;
  notes: string;
  voice_note_url: string;
  created_at: string;
  updated_at: string;
}

interface LocationRow {
  id: string;
  parent_id: string | null;
  name: string;
  description: string;
  qr_code: string;
  path: string;
  created_at: string;
}

// GET /api/export/json — Full database dump as JSON
router.get('/json', (_req, res) => {
  try {
    const catalog = db.prepare('SELECT * FROM catalog_item ORDER BY name').all() as CatalogRow[];
    const inventory = db.prepare('SELECT * FROM inventory_lot').all() as InventoryRow[];
    const locations = db.prepare('SELECT * FROM location ORDER BY path').all() as LocationRow[];

    // Parse JSON fields in catalog items (safe: invalid JSON falls back to raw value)
    const parsedCatalog = catalog.map((item) => {
      let pins: unknown = item.pins;
      let specs: unknown = item.specs;
      try { pins = JSON.parse(item.pins); } catch { /* keep raw */ }
      try { specs = JSON.parse(item.specs); } catch { /* keep raw */ }
      return { ...item, pins, specs };
    });

    res.json({
      exported_at: new Date().toISOString(),
      catalog: parsedCatalog,
      inventory,
      locations,
    });
  } catch (err) {
    console.error('[export] json error:', err);
    res.status(500).json({ error: 'Failed to export JSON' });
  }
});

// GET /api/export/csv — BOM-style CSV export
router.get('/csv', (_req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT ci.name, ci.type, ci.manufacturer, ci.mpn, ci.package_type,
                ci.description, ci.datasheet_url,
                il.quantity, il.low_stock_threshold,
                l.name as location_name, l.path as location_path
         FROM inventory_lot il
         JOIN catalog_item ci ON il.catalog_id = ci.id
         LEFT JOIN location l ON il.location_id = l.id
         ORDER BY ci.name`
      )
      .all() as Record<string, unknown>[];

    // Build CSV manually (no external dependency)
    const headers = [
      'Name',
      'Type',
      'Manufacturer',
      'MPN',
      'Package',
      'Description',
      'Datasheet URL',
      'Quantity',
      'Low Stock Threshold',
      'Location',
      'Location Path',
    ];

    const csvLines = [headers.join(',')];
    for (const row of rows) {
      const values = [
        row.name,
        row.type,
        row.manufacturer,
        row.mpn,
        row.package_type,
        row.description,
        row.datasheet_url,
        row.quantity,
        row.low_stock_threshold,
        row.location_name || '',
        row.location_path || '',
      ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
      csvLines.push(values.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="circuitmind-inventory.csv"');
    res.send(csvLines.join('\n'));
  } catch (err) {
    console.error('[export] csv error:', err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export default router;
