import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username?.trim() || !password) {
    res.status(400).json({ message: 'Username and password required' });
    return;
  }
  try {
    const { rows } = await db.query<{ id: string; password_hash: string }>(
      'SELECT id, password_hash FROM users WHERE username = $1',
      [username.trim()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ message: 'IDまたはパスワードが正しくありません' });
      return;
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('token', token, { ...COOKIE_OPTS, secure });
    res.json({ id: user.id, username: username.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await db.query<{ id: string; username: string }>(
      'SELECT id, username FROM users WHERE id = $1',
      [req.userId]
    );
    if (!rows[0]) { res.status(401).json({ message: 'User not found' }); return; }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
