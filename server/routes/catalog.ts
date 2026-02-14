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
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
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

function parseJsonFields(item: Record<string, unknown>): Record<string, unknown> {
  return {
    ...item,
    pins: typeof item.pins === 'string' ? JSON.parse(item.pins) : item.pins,
    specs: typeof item.specs === 'string' ? JSON.parse(item.specs) : item.specs,
  };
}

export default router;
