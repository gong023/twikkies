import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { memosRouter } from './routes/memos';
import { accountsRouter } from './routes/accounts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/memos', memosRouter);
app.use('/api/accounts', accountsRouter);

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`twikkies on :${PORT} [${process.env.NODE_ENV ?? 'development'}]`));
