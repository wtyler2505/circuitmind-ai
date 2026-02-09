import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { validateBody } from '../middleware/validation.js';

const router = Router();

// Schema matching the frontend ElectronicComponent type
const electronicComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['microcontroller', 'sensor', 'actuator', 'power', 'other']).default('other'),
  description: z.string().default(''),
  pins: z.array(z.string()).default([]),
  quantity: z.number().int().min(0).default(0),
  datasheetUrl: z.string().default(''),
  imageUrl: z.string().default(''),
});

const migrateSchema = z.object({
  components: z.array(electronicComponentSchema).min(1, 'At least one component is required'),
});

// POST /api/migrate — Import ElectronicComponent[] from frontend
const migrateTx = db.transaction((components: z.infer<typeof electronicComponentSchema>[]) => {
  const results: Array<{ catalog_id: string; lot_id: string; name: string }> = [];

  for (const comp of components) {
    const catalogId = uuid();
    const lotId = uuid();
    const moveId = uuid();

    // Create catalog item
    db.prepare(
      `INSERT INTO catalog_item (id, name, type, description, datasheet_url, image_url, pins, specs, needs_review)
       VALUES (?, ?, ?, ?, ?, ?, ?, '{}', 0)`
    ).run(
      catalogId,
      comp.name,
      comp.type,
      comp.description,
      comp.datasheetUrl,
      comp.imageUrl,
      JSON.stringify(comp.pins)
    );

    // Create inventory lot
    db.prepare(
      `INSERT INTO inventory_lot (id, catalog_id, quantity, notes)
       VALUES (?, ?, ?, 'Migrated from frontend inventory')`
    ).run(lotId, catalogId, comp.quantity);

    // Create initial stock move for audit trail
    if (comp.quantity > 0) {
      db.prepare(
        'INSERT INTO stock_move (id, lot_id, delta, reason, note) VALUES (?, ?, ?, ?, ?)'
      ).run(moveId, lotId, comp.quantity, 'migration', `Initial import of ${comp.name}`);
    }

    results.push({ catalog_id: catalogId, lot_id: lotId, name: comp.name });
  }

  return results;
});

// POST /api/migrate
router.post('/', validateBody(migrateSchema), (req, res) => {
  try {
    const { components } = req.body as z.infer<typeof migrateSchema>;
    const results = migrateTx(components);

    res.status(201).json({
      migrated: results.length,
      items: results,
    });
  } catch (err) {
    console.error('[migrate] error:', err);
    res.status(500).json({ error: 'Migration failed' });
  }
});

export default router;
