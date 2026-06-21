import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { env } from './config/env';

const app = express();

app.use(cors({ origin: env.NODE_ENV === 'production' ? false : 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use('/api/v1', routes);

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

if (env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

export default app;
