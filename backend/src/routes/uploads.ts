import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'image/webp', 'image/heic', 'image/heif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ALLOWED_MIMES.has(file.mimetype) || /\.hei[cf]$/i.test(file.originalname);
    cb(null, ok);
  },
});

// POST /api/uploads
export const uploadsRouter = Router();
uploadsRouter.use(requireAuth);

uploadsRouter.post('/', upload.single('file'), async (req: AuthRequest, res) => {
  const file = req.file;
  if (!file) { res.status(400).json({ message: 'No file uploaded' }); return; }

  try {
    let buffer = file.buffer;
    let mime = file.mimetype;
    const isHeic = mime === 'image/heic' || mime === 'image/heif' || /\.hei[cf]$/i.test(file.originalname);

    if (isHeic) {
      const { default: heicConvert } = await import('heic-convert');
      const { Jimp } = await import('jimp');

      // Buffer → standalone ArrayBuffer (avoid pooled buffer offset issues)
      const ab: ArrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
      const jpegAb = await heicConvert({ buffer: ab, format: 'JPEG', quality: 0.85 });
      buffer = Buffer.from(jpegAb);
      mime = 'image/jpeg';

      const img = await Jimp.fromBuffer(buffer);
      img.resize({ w: Math.floor(img.width / 2) });
      buffer = await img.getBuffer('image/jpeg');
    }

    const ext = mime === 'image/png' ? 'png'
      : mime === 'image/gif' ? 'gif'
      : mime === 'image/webp' ? 'webp'
      : 'jpg';

    const { rows } = await db.query(
      'INSERT INTO uploads (user_id, mime) VALUES ($1, $2) RETURNING id',
      [req.userId, mime]
    );
    const id: string = rows[0].id;
    const filename = `${id}.${ext}`;

    await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), buffer);
    await db.query('UPDATE uploads SET filename = $1 WHERE id = $2', [filename, id]);

    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// GET /api/images/:id
export const imagesRouter = Router();
imagesRouter.use(requireAuth);

imagesRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { rows } = await db.query(
      'SELECT filename, mime FROM uploads WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!rows[0]) { res.status(404).json({ message: 'Not found' }); return; }

    // path.basename prevents directory traversal
    const filePath = path.resolve(UPLOAD_DIR, path.basename(rows[0].filename as string));
    res.setHeader('Content-Type', rows[0].mime as string);
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
