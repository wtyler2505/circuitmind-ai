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

// Schema for idempotent sync
const syncComponentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['microcontroller', 'sensor', 'actuator', 'power', 'other']).default('other'),
  description: z.string().default(''),
  manufacturer: z.string().default(''),
  mpn: z.string().default(''),
  pins: z.array(z.string()).default([]),
  specs: z.record(z.string()).default({}),
  quantity: z.number().int().min(0).default(0),
  datasheetUrl: z.string().default(''),
  imageUrl: z.string().default(''),
  packageType: z.string().default(''),
  aiConfidence: z.number().min(0).max(1).default(0),
  aiProvider: z.string().default(''),
});

const syncSchema = z.object({
  components: z.array(syncComponentSchema).min(1, 'At least one component is required').max(500, 'Maximum 500 components per batch'),
});

// POST /api/migrate — Import ElectronicComponent[] from frontend (legacy)
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

// POST /api/migrate/sync — Idempotent upsert of ElectronicComponent[] into catalog
// Deduplicates by mpn (manufacturer part number) when non-empty, otherwise by name+type
const syncTx = db.transaction((components: z.infer<typeof syncComponentSchema>[]) => {
  const mapping: Array<{
    localId: string;
    catalogId: string;
    action: 'created' | 'updated';
    name: string;
  }> = [];

  const findByMpn = db.prepare('SELECT id FROM catalog_item WHERE mpn = ? AND mpn != \'\'');
  const findByNameType = db.prepare('SELECT id FROM catalog_item WHERE name = ? AND type = ?');

  const insertCatalog = db.prepare(
    `INSERT INTO catalog_item (id, name, type, description, manufacturer, mpn, package_type, datasheet_url, image_url, pins, specs, ai_confidence, ai_provider, needs_review)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
  );

  const updateCatalog = db.prepare(
    `UPDATE catalog_item SET name = ?, type = ?, description = ?, manufacturer = ?, mpn = ?,
     package_type = ?, datasheet_url = ?, image_url = ?, pins = ?, specs = ?,
     ai_confidence = ?, ai_provider = ?, updated_at = datetime('now')
     WHERE id = ?`
  );

  for (const comp of components) {
    // Try to find existing by mpn first, then by name+type
    let existing: { id: string } | undefined;
    if (comp.mpn) {
      existing = findByMpn.get(comp.mpn) as { id: string } | undefined;
    }
    if (!existing) {
      existing = findByNameType.get(comp.name, comp.type) as { id: string } | undefined;
    }

    const pinsJson = JSON.stringify(comp.pins);
    const specsJson = JSON.stringify(comp.specs);

    if (existing) {
      // Update existing catalog item
      updateCatalog.run(
        comp.name, comp.type, comp.description, comp.manufacturer, comp.mpn,
        comp.packageType, comp.datasheetUrl, comp.imageUrl, pinsJson, specsJson,
        comp.aiConfidence, comp.aiProvider, existing.id
      );
      mapping.push({ localId: comp.id, catalogId: existing.id, action: 'updated', name: comp.name });
    } else {
      // Insert new catalog item
      const catalogId = uuid();
      insertCatalog.run(
        catalogId, comp.name, comp.type, comp.description, comp.manufacturer, comp.mpn,
        comp.packageType, comp.datasheetUrl, comp.imageUrl, pinsJson, specsJson,
        comp.aiConfidence, comp.aiProvider
      );

      // Create inventory lot for new items
      const lotId = uuid();
      db.prepare(
        `INSERT INTO inventory_lot (id, catalog_id, quantity, notes)
         VALUES (?, ?, ?, 'Synced from frontend')`
      ).run(lotId, catalogId, comp.quantity);

      if (comp.quantity > 0) {
        db.prepare(
          'INSERT INTO stock_move (id, lot_id, delta, reason, note) VALUES (?, ?, ?, ?, ?)'
        ).run(uuid(), lotId, comp.quantity, 'sync', `Initial sync of ${comp.name}`);
      }

      mapping.push({ localId: comp.id, catalogId, action: 'created', name: comp.name });
    }
  }

  return mapping;
});

// POST /api/migrate (legacy import)
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

// POST /api/migrate/sync (idempotent upsert)
router.post('/sync', validateBody(syncSchema), (req, res) => {
  try {
    const { components } = req.body as z.infer<typeof syncSchema>;
    const mapping = syncTx(components);

    const created = mapping.filter(m => m.action === 'created').length;
    const updated = mapping.filter(m => m.action === 'updated').length;

    res.json({
      total: mapping.length,
      created,
      updated,
      mapping,
    });
  } catch (err) {
    console.error('[migrate/sync] error:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

export default router;
