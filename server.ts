import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes';
import { liveRouter } from './server/live-routes';
import { mandiRouter } from './server/mandi';

// Load .env.local first (what the README tells you to create), then .env.
dotenv.config({ path: ['.env.local', '.env'] });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON & extended payloads for base64 leaf & harvest image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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
      timestamp: new Date().toISOString()
    });
  });

  // Vite dev middleware vs Production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
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
