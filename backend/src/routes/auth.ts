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

async function verifyCredentials(username: string, password: string): Promise<{ id: string } | null> {
  const { rows } = await db.query<{ id: string; password_hash: string }>(
    'SELECT id, password_hash FROM users WHERE username = $1',
    [username]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return null;
  return { id: user.id };
}

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username?.trim() || !password) {
    res.status(400).json({ message: 'Username and password required' });
    return;
  }
  try {
    const uname = username.trim();
    const user = await verifyCredentials(uname, password);
    if (!user) { res.status(401).json({ message: 'IDまたはパスワードが正しくありません' }); return; }
    const token = jwt.sign({ userId: user.id, username: uname }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('token', token, { ...COOKIE_OPTS, secure });
    res.cookie(`sess_${uname}`, token, { ...COOKIE_OPTS, secure });
    res.json({ id: user.id, username: uname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// アクティブセッションを変えずに別アカウントのセッションを保存する
authRouter.post('/add-session', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username?.trim() || !password) {
    res.status(400).json({ message: 'Username and password required' });
    return;
  }
  try {
    const uname = username.trim();
    const user = await verifyCredentials(uname, password);
    if (!user) { res.status(401).json({ message: 'IDまたはパスワードが正しくありません' }); return; }
    const token = jwt.sign({ userId: user.id, username: uname }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    const secure = process.env.NODE_ENV === 'production';
    res.cookie(`sess_${uname}`, token, { ...COOKIE_OPTS, secure });
    res.json({ id: user.id, username: uname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

authRouter.get('/sessions', (req, res) => {
  const cookies = req.cookies as Record<string, string>;
  let currentUserId: string | null = null;
  if (cookies.token) {
    try {
      const p = jwt.verify(cookies.token, process.env.JWT_SECRET!) as { userId: string };
      currentUserId = p.userId;
    } catch { /* ignore */ }
  }
  const sessions: { id: string; username: string }[] = [];
  for (const [key, value] of Object.entries(cookies)) {
    if (!key.startsWith('sess_')) continue;
    const username = key.slice(5);
    try {
      const payload = jwt.verify(value, process.env.JWT_SECRET!) as { userId: string };
      if (payload.userId !== currentUserId) sessions.push({ id: payload.userId, username });
    } catch { /* expired or invalid */ }
  }
  res.json(sessions);
});

authRouter.post('/switch', (req, res) => {
  const { username } = req.body as { username?: string };
  if (!username) { res.status(400).json({ message: 'username required' }); return; }
  const savedToken = req.cookies?.[`sess_${username}`] as string | undefined;
  if (!savedToken) { res.status(401).json({ message: 'No saved session' }); return; }
  try {
    const payload = jwt.verify(savedToken, process.env.JWT_SECRET!) as { userId: string; username?: string };
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('token', savedToken, { ...COOKIE_OPTS, secure });
    res.json({ id: payload.userId, username: payload.username ?? username });
  } catch {
    res.clearCookie(`sess_${username}`);
    res.status(401).json({ message: 'セッションの有効期限が切れています。再ログインしてください' });
  }
});

authRouter.post('/logout', (req, res) => {
  const token = req.cookies?.token as string | undefined;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; username?: string };
      if (payload.username) res.clearCookie(`sess_${payload.username}`);
    } catch { /* ignore */ }
  }
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
