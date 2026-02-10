/**
 * Certificate Automation Platform - Express server.
 * Serves REST API for single and bulk certificate generation + email.
 */
import fs from 'fs/promises';
import express from 'express';
import cors from 'cors';
import path from 'path';
import env from './config/env.js';
import certificateRoutes from './routes/certificateRoutes.js';
import log from './utils/logger.js';

// Ensure temp, uploads, and assets dirs exist
async function ensureDirs() {
  await fs.mkdir(env.paths.temp, { recursive: true });
  await fs.mkdir(path.join(env.paths.temp, 'uploads'), { recursive: true });
  await fs.mkdir(env.paths.assets, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check for dashboard/ops
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'certificate-automation-api' });
});

app.use('/api', certificateRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler for Multer and others (ensure message is always a safe string)
app.use((err, _req, res, _next) => {
  log.error('Request error', err);
  const status = Number(err.status) || 500;
  const raw = err && typeof err.message === 'string' ? err.message : '';
  const message = String(raw || 'Internal server error').slice(0, 500);
  res.status(status).json({ success: false, message });
});

const port = env.port;
ensureDirs().then(() => {
  const server = app.listen(port, () => {
    log.info(`Server running at http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      log.error(`Port ${port} is already in use. Stop the other process or set PORT in server/.env (e.g. PORT=5002).`, err);
    } else {
      log.error('Server error', err);
    }
    process.exit(1);
  });
}).catch((err) => {
  log.error('Failed to create temp directories', err);
  process.exit(1);
});
