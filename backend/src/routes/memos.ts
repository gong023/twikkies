import { Router } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const memosRouter = Router();
memosRouter.use(requireAuth);

// Must come before '/:id' to avoid routing conflict
memosRouter.get('/archived', async (req: AuthRequest, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM memos WHERE user_id = $1 AND archived = TRUE ORDER BY archived_at DESC NULLS LAST',
      [req.userId]
    );
    res.json(rows.map(toMemo));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

memosRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM memos WHERE user_id = $1 AND archived = FALSE ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows.map(toMemo));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

memosRouter.post('/', async (req: AuthRequest, res) => {
  const { text, image, stats } = req.body as { text?: string; image?: unknown; stats?: unknown };
  try {
    const { rows } = await db.query(
      'INSERT INTO memos (user_id, text, image, stats) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, text ?? '', image ?? null, stats ?? null]
    );
    res.status(201).json(toMemo(rows[0]));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

memosRouter.put('/:id', async (req: AuthRequest, res) => {
  const { text, image, stats } = req.body as { text?: string; image?: unknown; stats?: unknown };
  try {
    const { rows } = await db.query(
      `UPDATE memos SET text = $1, image = $2, stats = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [text ?? '', image ?? null, stats ?? null, req.params.id, req.userId]
    );
    if (!rows[0]) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(toMemo(rows[0]));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

memosRouter.post('/:id/archive', async (req: AuthRequest, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE memos SET archived = TRUE, archived_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.userId]
    );
    if (!rows[0]) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(toMemo(rows[0]));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

memosRouter.post('/:id/restore', async (req: AuthRequest, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE memos SET archived = FALSE, archived_at = NULL, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.userId]
    );
    if (!rows[0]) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(toMemo(rows[0]));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

memosRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await db.query('DELETE FROM memos WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

function toMemo(row: Record<string, unknown>) {
  return {
    id: row.id,
    text: row.text,
    image: row.image ?? undefined,
    stats: row.stats ?? undefined,
    archived: row.archived,
    archivedAt: row.archived_at ? (row.archived_at as Date).toISOString() : undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}
