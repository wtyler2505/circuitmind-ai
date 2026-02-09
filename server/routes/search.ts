import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// GET /api/search?q= — Full-text search using FTS5
router.get('/', (req, res) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    // FTS5 query — escape special characters and append wildcard for prefix matching
    const safeQuery = q.replace(/['"]/g, '').replace(/\s+/g, ' ');
    const ftsQuery = safeQuery
      .split(' ')
      .filter(Boolean)
      .map((term) => `"${term}"*`)
      .join(' AND ');

    const results = db
      .prepare(
        `SELECT ci.*, rank
         FROM catalog_fts
         JOIN catalog_item ci ON catalog_fts.rowid = ci.rowid
         WHERE catalog_fts MATCH ?
         ORDER BY rank
         LIMIT ?`
      )
      .all(ftsQuery, limit);

    // Parse JSON fields (safe: invalid JSON falls back to raw value)
    const parsed = (results as Record<string, unknown>[]).map((item) => {
      let pins = item.pins;
      let specs = item.specs;
      if (typeof pins === 'string') {
        try { pins = JSON.parse(pins); } catch { /* keep raw */ }
      }
      if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch { /* keep raw */ }
      }
      return { ...item, pins, specs };
    });

    res.json({ results: parsed, query: q });
  } catch (err) {
    console.error('[search] error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
