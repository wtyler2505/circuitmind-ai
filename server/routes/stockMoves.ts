import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { validateBody, validateQuery } from '../middleware/validation.js';

const router = Router();

// --- Zod Schemas ---

const stockMoveCreateSchema = z.object({
  lot_id: z.string().min(1, 'lot_id is required'),
  delta: z.number().int().refine((v) => v !== 0, 'delta cannot be zero'),
  reason: z.string().default(''),
  note: z.string().default(''),
});

const stockMoveListQuerySchema = z.object({
  lot_id: z.string().min(1, 'lot_id query parameter is required'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// --- Transaction ---

const createStockMove = db.transaction(
  (lotId: string, delta: number, reason: string, note: string) => {
    // Verify lot exists and check resulting quantity
    const lot = db.prepare('SELECT quantity FROM inventory_lot WHERE id = ?').get(lotId) as
      | { quantity: number }
      | undefined;
    if (!lot) {
      throw Object.assign(new Error('Inventory lot not found'), { status: 404 });
    }

    const newQty = lot.quantity + delta;
    if (newQty < 0) {
      throw Object.assign(
        new Error(`Insufficient stock: have ${lot.quantity}, tried to remove ${Math.abs(delta)}`),
        { status: 400 }
      );
    }

    const moveId = uuid();
    db.prepare(
      'INSERT INTO stock_move (id, lot_id, delta, reason, note) VALUES (?, ?, ?, ?, ?)'
    ).run(moveId, lotId, delta, reason, note);

    db.prepare(
      'UPDATE inventory_lot SET quantity = quantity + ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).run(delta, lotId);

    return { moveId, newQuantity: newQty };
  }
);

// --- Routes ---

// GET /api/stock-moves — History for a lot
router.get('/', validateQuery(stockMoveListQuerySchema), (req, res) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as z.infer<
      typeof stockMoveListQuerySchema
    >;
    const { lot_id: lotId, page, limit } = query;
    const offset = (page - 1) * limit;

    const countRow = db
      .prepare('SELECT COUNT(*) as total FROM stock_move WHERE lot_id = ?')
      .get(lotId) as { total: number };

    const moves = db
      .prepare(
        'SELECT * FROM stock_move WHERE lot_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
      )
      .all(lotId, limit, offset);

    res.json({
      moves,
      page,
      limit,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / limit),
    });
  } catch (err) {
    console.error('[stock-moves] list error:', err);
    res.status(500).json({ error: 'Failed to list stock moves' });
  }
});

// POST /api/stock-moves — Create move + update lot quantity
router.post('/', validateBody(stockMoveCreateSchema), (req, res) => {
  try {
    const data = req.body as z.infer<typeof stockMoveCreateSchema>;
    const result = createStockMove(data.lot_id, data.delta, data.reason, data.note);

    const move = db.prepare('SELECT * FROM stock_move WHERE id = ?').get(result.moveId);
    res.status(201).json({
      move,
      new_quantity: result.newQuantity,
    });
  } catch (err) {
    const error = err as Error & { status?: number };
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      console.error('[stock-moves] create error:', err);
      res.status(500).json({ error: 'Failed to create stock move' });
    }
  }
});

export default router;
