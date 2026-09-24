import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes';
import { liveRouter } from './server/live-routes';
import { mandiRouter } from './server/mandi';
import { initStore } from './server/store';

// Load .env.local first (what the README tells you to create), then .env.
dotenv.config({ path: ['.env.local', '.env'] });

async function startServer() {
  // Load accounts, batches and orders (from Postgres when DATABASE_URL is set).
  await initStore();
  const app = express();
  // Hosts such as Render / Railway / Cloud Run tell us the port to use.
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for JSON & extended payloads for base64 leaf & harvest image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', String(req.headers['access-control-request-headers'] || 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Role'));
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Self-hosted OCR engine + Marathi/English models for the 7/12 land record
  // check, so scanning doesn't depend on the jsDelivr CDN being reachable.
  const nodeModules = path.join(process.cwd(), 'node_modules');
  const ocrStatic = { maxAge: '30d', immutable: true };
  app.use('/ocr/worker.min.js', express.static(path.join(nodeModules, 'tesseract.js/dist/worker.min.js'), ocrStatic));
  app.use('/ocr/core', express.static(path.join(nodeModules, 'tesseract.js-core'), ocrStatic));
  app.use('/ocr/lang', express.static(path.join(nodeModules, '@tesseract.js-data/eng/4.0.0_best_int'), ocrStatic));
  app.use('/ocr/lang', express.static(path.join(nodeModules, '@tesseract.js-data/mar/4.0.0_best_int'), ocrStatic));

  // On-device object/face detection (MediaPipe) used to reject non-produce
  // photos such as selfies before grading. Models live in public/models.
  app.use('/mediapipe/wasm', express.static(path.join(nodeModules, '@mediapipe/tasks-vision/wasm'), ocrStatic));

  // Mount API routes before Vite middleware
  app.use('/api', mandiRouter);
  app.use('/api', liveRouter);
  app.use('/api', apiRouter);

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Agronauts Agriculture Ecosystem API',
      version: (process.env.RENDER_GIT_COMMIT || 'local').slice(0, 7),
      mandiKey: process.env.DATA_GOV_API_KEY ? 'own' : 'demo',
      timestamp: new Date().toISOString()
    });
  });

  // Vite dev middleware vs Production static serving
  // The built bundle (npm start -> dist/server.cjs) always serves the built
  // site, even if NODE_ENV wasn't set on the host.
  const isProduction = process.env.NODE_ENV === 'production' || /server\.cjs$/.test(process.argv[1] || '');
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Also serve a build made with the GitHub Pages base path (/AGRONAUTS/).
    app.use('/AGRONAUTS', express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Agronauts full-stack server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Agronauts server:', err);
});
