import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { validateBody } from '../middleware/validation.js';

const router = Router();

// --- Zod Schemas ---

const inventoryCreateSchema = z.object({
  catalog_id: z.string().min(1, 'catalog_id is required'),
  location_id: z.string().nullable().default(null),
  quantity: z.number().int().min(0).default(0),
  low_stock_threshold: z.number().int().min(0).default(5),
  notes: z.string().default(''),
  voice_note_url: z.string().default(''),
});

const inventoryUpdateSchema = inventoryCreateSchema.partial();

// --- Routes ---

// GET /api/inventory — List with catalog join
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const catalogId = req.query.catalog_id as string | undefined;
    const locationId = req.query.location_id as string | undefined;
    const lowStock = req.query.low_stock as string | undefined;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (catalogId) {
      where += ' AND il.catalog_id = ?';
      params.push(catalogId);
    }
    if (locationId) {
      where += ' AND il.location_id = ?';
      params.push(locationId);
    }
    if (lowStock === '1') {
      where += ' AND il.quantity <= il.low_stock_threshold';
    }

    const countRow = db
      .prepare(`SELECT COUNT(*) as total FROM inventory_lot il ${where}`)
      .get(...(params as [unknown])) as { total: number } | undefined;
    const total = countRow?.total ?? 0;

    const items = db
      .prepare(
        `SELECT il.*, ci.name as catalog_name, ci.type as catalog_type,
                ci.manufacturer, ci.mpn, ci.image_url as catalog_image,
                l.name as location_name, l.path as location_path
         FROM inventory_lot il
         LEFT JOIN catalog_item ci ON il.catalog_id = ci.id
         LEFT JOIN location l ON il.location_id = l.id
         ${where}
         ORDER BY il.updated_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(...(params as [unknown]), limit, offset);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[inventory] list error:', err);
    res.status(500).json({ error: 'Failed to list inventory' });
  }
});

// GET /api/inventory/:id
router.get('/:id', (req, res) => {
  try {
    const item = db
      .prepare(
        `SELECT il.*, ci.name as catalog_name, ci.type as catalog_type,
                ci.manufacturer, ci.mpn, ci.pins, ci.specs,
                l.name as location_name, l.path as location_path
         FROM inventory_lot il
         LEFT JOIN catalog_item ci ON il.catalog_id = ci.id
         LEFT JOIN location l ON il.location_id = l.id
         WHERE il.id = ?`
      )
      .get(req.params.id);

    if (!item) {
      res.status(404).json({ error: 'Inventory lot not found' });
      return;
    }

    res.json(item);
  } catch (err) {
    console.error('[inventory] get error:', err);
    res.status(500).json({ error: 'Failed to get inventory lot' });
  }
});

// POST /api/inventory — Create lot
router.post('/', validateBody(inventoryCreateSchema), (req, res) => {
  try {
    const data = req.body as z.infer<typeof inventoryCreateSchema>;

    // Verify catalog item exists
    const catalogItem = db.prepare('SELECT id FROM catalog_item WHERE id = ?').get(data.catalog_id);
    if (!catalogItem) {
      res.status(400).json({ error: 'Referenced catalog item does not exist' });
      return;
    }

    // Verify location exists if provided
    if (data.location_id) {
      const location = db.prepare('SELECT id FROM location WHERE id = ?').get(data.location_id);
      if (!location) {
        res.status(400).json({ error: 'Referenced location does not exist' });
        return;
      }
    }

    const id = uuid();
    db.prepare(
      `INSERT INTO inventory_lot (id, catalog_id, location_id, quantity, low_stock_threshold, notes, voice_note_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, data.catalog_id, data.location_id, data.quantity, data.low_stock_threshold, data.notes, data.voice_note_url);

    const item = db.prepare('SELECT * FROM inventory_lot WHERE id = ?').get(id);
    res.status(201).json(item);
  } catch (err) {
    console.error('[inventory] create error:', err);
    res.status(500).json({ error: 'Failed to create inventory lot' });
  }
});

// PUT /api/inventory/:id
router.put('/:id', validateBody(inventoryUpdateSchema), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM inventory_lot WHERE id = ?').get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Inventory lot not found' });
      return;
    }

    const data = req.body as Partial<z.infer<typeof inventoryCreateSchema>>;
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length > 0) {
      fields.push('updated_at = datetime(\'now\')');
      values.push(req.params.id);
      db.prepare(`UPDATE inventory_lot SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM inventory_lot WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('[inventory] update error:', err);
    res.status(500).json({ error: 'Failed to update inventory lot' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM inventory_lot WHERE id = ?').get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Inventory lot not found' });
      return;
    }

    db.prepare('DELETE FROM inventory_lot WHERE id = ?').run(req.params.id);
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    console.error('[inventory] delete error:', err);
    res.status(500).json({ error: 'Failed to delete inventory lot' });
  }
});

export default router;
