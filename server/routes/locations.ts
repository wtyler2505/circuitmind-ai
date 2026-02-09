import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { validateBody } from '../middleware/validation.js';

const router = Router();

// --- Zod Schemas ---

const locationCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parent_id: z.string().nullable().default(null),
  description: z.string().default(''),
  qr_code: z.string().default(''),
});

const locationUpdateSchema = locationCreateSchema.partial();

// --- Helpers ---

interface LocationRow {
  id: string;
  parent_id: string | null;
  name: string;
  description: string;
  qr_code: string;
  path: string;
  created_at: string;
}

interface LocationTree extends LocationRow {
  children: LocationTree[];
}

function buildTree(rows: LocationRow[], parentId: string | null = null): LocationTree[] {
  return rows
    .filter((r) => r.parent_id === parentId)
    .map((r) => ({
      ...r,
      children: buildTree(rows, r.id),
    }));
}

function computePath(parentId: string | null): string {
  if (!parentId) return '/';
  const parent = db.prepare('SELECT path, name FROM location WHERE id = ?').get(parentId) as
    | { path: string; name: string }
    | undefined;
  if (!parent) return '/';
  const parentPath = parent.path === '/' ? '' : parent.path;
  return `${parentPath}/${parent.name}`;
}

// --- Routes ---

// GET /api/locations — Tree structure
router.get('/', (req, res) => {
  try {
    const flat = req.query.flat === '1';
    const rows = db
      .prepare('SELECT * FROM location ORDER BY path, name')
      .all() as LocationRow[];

    if (flat) {
      res.json({ locations: rows });
    } else {
      res.json({ locations: buildTree(rows) });
    }
  } catch (err) {
    console.error('[locations] list error:', err);
    res.status(500).json({ error: 'Failed to list locations' });
  }
});

// GET /api/locations/:id
router.get('/:id', (req, res) => {
  try {
    const location = db.prepare('SELECT * FROM location WHERE id = ?').get(req.params.id);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    // Include inventory count
    const lotCount = db
      .prepare('SELECT COUNT(*) as count FROM inventory_lot WHERE location_id = ?')
      .get(req.params.id) as { count: number };

    res.json({ ...(location as Record<string, unknown>), lot_count: lotCount.count });
  } catch (err) {
    console.error('[locations] get error:', err);
    res.status(500).json({ error: 'Failed to get location' });
  }
});

// POST /api/locations
router.post('/', validateBody(locationCreateSchema), (req, res) => {
  try {
    const data = req.body as z.infer<typeof locationCreateSchema>;

    // Verify parent exists if provided
    if (data.parent_id) {
      const parent = db.prepare('SELECT id FROM location WHERE id = ?').get(data.parent_id);
      if (!parent) {
        res.status(400).json({ error: 'Parent location does not exist' });
        return;
      }
    }

    const id = uuid();
    const path = computePath(data.parent_id);

    db.prepare(
      'INSERT INTO location (id, parent_id, name, description, qr_code, path) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, data.parent_id, data.name, data.description, data.qr_code, path);

    const location = db.prepare('SELECT * FROM location WHERE id = ?').get(id);
    res.status(201).json(location);
  } catch (err) {
    console.error('[locations] create error:', err);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// PUT /api/locations/:id
router.put('/:id', validateBody(locationUpdateSchema), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM location WHERE id = ?').get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    const data = req.body as Partial<z.infer<typeof locationCreateSchema>>;

    // Validate parent exists if being changed
    if (data.parent_id !== undefined && data.parent_id !== null) {
      const parent = db.prepare('SELECT id FROM location WHERE id = ?').get(data.parent_id);
      if (!parent) {
        res.status(400).json({ error: 'Parent location does not exist' });
        return;
      }
      // Prevent circular reference (setting parent to self)
      if (data.parent_id === req.params.id) {
        res.status(400).json({ error: 'Location cannot be its own parent' });
        return;
      }
    }

    // Whitelist allowed fields to prevent SQL injection via dynamic field names
    const ALLOWED_FIELDS = ['name', 'parent_id', 'description', 'qr_code'] as const;
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
      if ((ALLOWED_FIELDS as readonly string[]).includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    // Recompute path if parent changed
    if (data.parent_id !== undefined) {
      const newPath = computePath(data.parent_id);
      fields.push('path = ?');
      values.push(newPath);
    }

    if (fields.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE location SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM location WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('[locations] update error:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// DELETE /api/locations/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM location WHERE id = ?').get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    // Check for child locations
    const children = db
      .prepare('SELECT COUNT(*) as count FROM location WHERE parent_id = ?')
      .get(req.params.id) as { count: number };
    if (children.count > 0) {
      res.status(400).json({
        error: 'Cannot delete location with child locations. Remove children first.',
      });
      return;
    }

    db.prepare('DELETE FROM location WHERE id = ?').run(req.params.id);
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    console.error('[locations] delete error:', err);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;
