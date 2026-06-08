import { Router } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const accountsRouter = Router();
accountsRouter.use(requireAuth);

accountsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM social_accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [req.userId]
    );
    res.json(rows.map(toAccount));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

accountsRouter.post('/', async (req: AuthRequest, res) => {
  const { platform, name, handle } = req.body as { platform?: string; name?: string; handle?: string };
  if (!platform || !name?.trim() || !handle?.trim()) {
    res.status(400).json({ message: 'platform, name, handle required' });
    return;
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO social_accounts (user_id, platform, name, handle) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, platform, name.trim(), handle.trim().replace(/^@/, '')]
    );
    res.status(201).json(toAccount(rows[0]));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

accountsRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await db.query('DELETE FROM social_accounts WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

function toAccount(row: Record<string, unknown>) {
  return { id: row.id, platform: row.platform, name: row.name, handle: row.handle };
}
