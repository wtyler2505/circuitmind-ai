import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';

const router = Router();

// --- Zod Schemas ---

const catalogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.string().optional(),
  needs_review: z.coerce.number().int().min(0).max(1).optional(),
});

const catalogCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['microcontroller', 'sensor', 'actuator', 'power', 'other']).default('other'),
  description: z.string().default(''),
  manufacturer: z.string().default(''),
  mpn: z.string().default(''),
  package_type: z.string().default(''),
  datasheet_url: z.string().default(''),
  image_url: z.string().default(''),
  pins: z.array(z.string()).default([]),
  specs: z.record(z.string()).default({}),
  ai_confidence: z.number().min(0).max(1).default(0),
  ai_provider: z.string().default(''),
  needs_review: z.number().int().min(0).max(1).default(0),
});

const catalogUpdateSchema = catalogCreateSchema.partial();

const idParamSchema = z.object({
  id: z.string().uuid('Invalid catalog id'),
});

// Batch sync schema: returns items modified since a timestamp
const batchSyncSchema = z.object({
  since: z.string().min(1, 'since timestamp is required'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(500).default(100),
});

// Changes detection schema: client sends known item states, server reports what changed
const changesSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    updated_at: z.string(),
  })).min(1, 'At least one item required').max(1000, 'Maximum 1000 items per request'),
});

// Deduplication query schema
const deduplicateQuerySchema = z.object({
  autoMerge: z.enum(['true', 'false']).optional(),
});

// --- Routes ---

// GET /api/catalog — List with pagination and filters
router.get('/', validateQuery(catalogQuerySchema), (req, res) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as z.infer<
      typeof catalogQuerySchema
    >;
    const { page, limit, type, needs_review } = query;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (type) {
      where += ' AND type = ?';
      params.push(type);
    }
    if (needs_review !== undefined) {
      where += ' AND needs_review = ?';
      params.push(needs_review);
    }

    const countRow = db
      .prepare(`SELECT COUNT(*) as total FROM catalog_item ${where}`)
      .get(...(params as [unknown])) as { total: number } | undefined;
    const total = countRow?.total ?? 0;

    const items = db
      .prepare(`SELECT * FROM catalog_item ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`)
      .all(...(params as [unknown]), limit, offset);

    // Parse JSON fields
    const parsed = (items as Record<string, unknown>[]).map(parseJsonFields);

    res.json({
      items: parsed,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[catalog] list error:', err);
    res.status(500).json({ error: 'Failed to list catalog items' });
  }
});

// POST /api/catalog/batch-sync — Get items modified since a timestamp
router.post('/batch-sync', validateBody(batchSyncSchema), (req, res) => {
  try {
    const { since, page, limit } = req.body as z.infer<typeof batchSyncSchema>;
    const offset = (page - 1) * limit;

    const countRow = db
      .prepare('SELECT COUNT(*) as total FROM catalog_item WHERE updated_at > ?')
      .get(since) as { total: number } | undefined;
    const total = countRow?.total ?? 0;

    const items = db
      .prepare(
        `SELECT * FROM catalog_item WHERE updated_at > ?
         ORDER BY updated_at ASC LIMIT ? OFFSET ?`
      )
      .all(since, limit, offset);

    const parsed = (items as Record<string, unknown>[]).map(parseJsonFields);

    res.json({
      items: parsed,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      since,
    });
  } catch (err) {
    console.error('[catalog] batch-sync error:', err);
    res.status(500).json({ error: 'Failed to fetch batch sync' });
  }
});

// POST /api/catalog/changes — Detect which items changed server-side vs client versions
router.post('/changes', validateBody(changesSchema), (req, res) => {
  try {
    const { items } = req.body as z.infer<typeof changesSchema>;

    const getItem = db.prepare('SELECT id, updated_at FROM catalog_item WHERE id = ?');

    const changed: Array<{ id: string; serverUpdatedAt: string; clientUpdatedAt: string }> = [];
    const deleted: string[] = [];
    const unchanged: string[] = [];

    for (const clientItem of items) {
      const serverItem = getItem.get(clientItem.id) as { id: string; updated_at: string } | undefined;
      if (!serverItem) {
        deleted.push(clientItem.id);
      } else if (serverItem.updated_at !== clientItem.updated_at) {
        changed.push({
          id: clientItem.id,
          serverUpdatedAt: serverItem.updated_at,
          clientUpdatedAt: clientItem.updated_at,
        });
      } else {
        unchanged.push(clientItem.id);
      }
    }

    res.json({
      changed,
      deleted,
      unchanged: unchanged.length,
      total: items.length,
    });
  } catch (err) {
    console.error('[catalog] changes error:', err);
    res.status(500).json({ error: 'Failed to detect changes' });
  }
});

// POST /api/catalog/deduplicate — Find and optionally merge duplicate catalog items
router.post('/deduplicate', validateQuery(deduplicateQuerySchema), (req, res) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as z.infer<
      typeof deduplicateQuerySchema
    > | undefined;
    const autoMerge = query?.autoMerge === 'true';

    // Find duplicates by manufacturer part number (mpn)
    const duplicateGroups = db
      .prepare(
        `SELECT mpn, GROUP_CONCAT(id) as ids, COUNT(*) as cnt
         FROM catalog_item
         WHERE mpn != ''
         GROUP BY mpn
         HAVING cnt > 1`
      )
      .all() as Array<{ mpn: string; ids: string; cnt: number }>;

    if (!autoMerge) {
      // Return duplicate report without merging
      const groups = duplicateGroups.map(group => {
        const ids = group.ids.split(',');
        const items = ids.map(id => {
          const item = db.prepare('SELECT * FROM catalog_item WHERE id = ?').get(id);
          return item ? parseJsonFields(item as Record<string, unknown>) : null;
        }).filter(Boolean);

        return {
          mpn: group.mpn,
          count: group.cnt,
          items,
          suggestedKeep: ids[0], // Keep the first (oldest) entry
          suggestedRemove: ids.slice(1),
        };
      });

      res.json({
        duplicateGroups: groups.length,
        totalDuplicates: duplicateGroups.reduce((sum, g) => sum + g.cnt - 1, 0),
        groups,
        autoMerged: false,
      });
      return;
    }

    // Auto-merge: keep the first entry, reassign inventory lots, delete others
    const mergeTx = db.transaction(() => {
      let merged = 0;
      for (const group of duplicateGroups) {
        const ids = group.ids.split(',');
        const keepId = ids[0];
        const removeIds = ids.slice(1);

        for (const removeId of removeIds) {
          // Reassign inventory lots from duplicate to primary
          db.prepare('UPDATE inventory_lot SET catalog_id = ? WHERE catalog_id = ?')
            .run(keepId, removeId);
          // Delete the duplicate catalog entry
          db.prepare('DELETE FROM catalog_item WHERE id = ?').run(removeId);
          merged++;
        }
      }
      return merged;
    });

    const merged = mergeTx();

    res.json({
      duplicateGroups: duplicateGroups.length,
      totalMerged: merged,
      autoMerged: true,
    });
  } catch (err) {
    console.error('[catalog] deduplicate error:', err);
    res.status(500).json({ error: 'Failed to deduplicate catalog' });
  }
});

// GET /api/catalog/:id — Single item
router.get('/:id', validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = (req as unknown as Record<string, unknown>).validatedParams as z.infer<
      typeof idParamSchema
    >;
    const item = db.prepare('SELECT * FROM catalog_item WHERE id = ?').get(id);
    if (!item) {
      res.status(404).json({ error: 'Catalog item not found' });
      return;
    }
    res.json(parseJsonFields(item as Record<string, unknown>));
  } catch (err) {
    console.error('[catalog] get error:', err);
    res.status(500).json({ error: 'Failed to get catalog item' });
  }
});

// POST /api/catalog — Create
router.post('/', validateBody(catalogCreateSchema), (req, res) => {
  try {
    const data = req.body as z.infer<typeof catalogCreateSchema>;
    const id = uuid();

    db.prepare(
      `INSERT INTO catalog_item (id, name, type, description, manufacturer, mpn, package_type, datasheet_url, image_url, pins, specs, ai_confidence, ai_provider, needs_review)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      data.name,
      data.type,
      data.description,
      data.manufacturer,
      data.mpn,
      data.package_type,
      data.datasheet_url,
      data.image_url,
      JSON.stringify(data.pins),
      JSON.stringify(data.specs),
      data.ai_confidence,
      data.ai_provider,
      data.needs_review
    );

    const item = db.prepare('SELECT * FROM catalog_item WHERE id = ?').get(id);
    res.status(201).json(parseJsonFields(item as Record<string, unknown>));
  } catch (err) {
    console.error('[catalog] create error:', err);
    res.status(500).json({ error: 'Failed to create catalog item' });
  }
});

// PUT /api/catalog/:id — Update
router.put('/:id', validateParams(idParamSchema), validateBody(catalogUpdateSchema), (req, res) => {
  try {
    const { id } = (req as unknown as Record<string, unknown>).validatedParams as z.infer<
      typeof idParamSchema
    >;
    const existing = db.prepare('SELECT * FROM catalog_item WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ error: 'Catalog item not found' });
      return;
    }

    const data = req.body as Partial<z.infer<typeof catalogCreateSchema>>;
    const allowedFields = new Set([
      'name', 'type', 'description', 'manufacturer', 'mpn', 'package_type',
      'datasheet_url', 'image_url', 'pins', 'specs', 'ai_confidence', 'ai_provider', 'needs_review',
    ]);
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (!allowedFields.has(key)) continue;
      if (key === 'pins' || key === 'specs') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = datetime(\'now\')');
      const sql = `UPDATE catalog_item SET ${fields.join(', ')} WHERE id = ?`;
      db.prepare(sql).run(...values, id);
    }

    const updated = db.prepare('SELECT * FROM catalog_item WHERE id = ?').get(id);
    res.json(parseJsonFields(updated as Record<string, unknown>));
  } catch (err) {
    console.error('[catalog] update error:', err);
    res.status(500).json({ error: 'Failed to update catalog item' });
  }
});

// DELETE /api/catalog/:id
router.delete('/:id', validateParams(idParamSchema), (req, res) => {
  try {
    const { id } = (req as unknown as Record<string, unknown>).validatedParams as z.infer<
      typeof idParamSchema
    >;
    const existing = db.prepare('SELECT * FROM catalog_item WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ error: 'Catalog item not found' });
      return;
    }

    db.prepare('DELETE FROM catalog_item WHERE id = ?').run(id);
    res.json({ deleted: true, id });
  } catch (err) {
    console.error('[catalog] delete error:', err);
    res.status(500).json({ error: 'Failed to delete catalog item' });
  }
});

// --- Helpers ---

function safeJsonParse(value: unknown, fallback: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseJsonFields(item: Record<string, unknown>): Record<string, unknown> {
  return {
    ...item,
    pins: safeJsonParse(item.pins, []),
    specs: safeJsonParse(item.specs, {}),
  };
}

export default router;
