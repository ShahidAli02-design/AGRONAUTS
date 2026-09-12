import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes';

dotenv.config();

async function startServer() {
  const app = express();
  const preferredPort = Number(process.env.PORT || 3000);
  const portsToTry = Array.from({ length: 10 }, (_, index) => preferredPort + index);

  const listenOnPort = (portIndex: number) => {
    const port = portsToTry[portIndex];
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`Agronauts full-stack server running on port ${port}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' && portIndex < portsToTry.length - 1) {
        console.warn(`Port ${port} is busy. Retrying on port ${portsToTry[portIndex + 1]}...`);
        listenOnPort(portIndex + 1);
        return;
      }

      console.error('Failed to start Agronauts server:', error);
      process.exit(1);
    });
  };

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

  // Mount API routes before Vite middleware
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

  listenOnPort(0);
}

startServer().catch((err) => {
  console.error('Failed to start Agronauts server:', err);
});
