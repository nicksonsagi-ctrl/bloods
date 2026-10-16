import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { router as apiRouter } from './server/routes.js';
import { initSupabaseData } from './server/supabaseStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Mount API router
  app.use('/api', apiRouter);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LifeLink] Express server running on http://0.0.0.0:${PORT}`);
    // Sync with Supabase asynchronously in background without blocking server startup
    initSupabaseData().catch((err) => {
      console.error('[Supabase] Background sync warning:', err.message);
    });
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
