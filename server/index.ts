import express from 'express';
import multer from 'multer';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { close as closeDb } from './db/database.js';

import catalogRoutes from './routes/catalog.js';
import inventoryRoutes from './routes/inventory.js';
import locationRoutes from './routes/locations.js';
import stockMoveRoutes from './routes/stockMoves.js';
import searchRoutes from './routes/search.js';
import exportRoutes from './routes/export.js';
import migrateRoutes from './routes/migrate.js';
import identifyRoutes from './routes/identify.js';
import sttRoutes from './routes/stt.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);

// Ensure upload and data directories exist
const uploadsDir = join(__dirname, 'uploads');
const dataDir = join(__dirname, 'data');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = file.originalname.split('.').pop() || 'bin';
    cb(null, `${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
});

// Create Express app
const app = express();

// Global middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/catalog', catalogRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/stock-moves', stockMoveRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/migrate', migrateRoutes);
app.use('/api/identify', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'voiceNote', maxCount: 1 },
]), identifyRoutes);
app.use('/api/stt', upload.single('audio'), sttRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`CircuitMind Server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    closeDb();
    console.log('Server stopped');
    process.exit(0);
  });
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
