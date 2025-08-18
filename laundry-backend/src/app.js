// src/app.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
// CORS is optional; only enable when you truly need cross-origin
const cors = require('cors');

const app = express();

/* ----------------------- Core hardening & basics ----------------------- */
// Azure sits behind a reverse proxy; trust the first hop so req.secure etc. work
app.set('trust proxy', 1);

// Helmet default protections (CSP not enabled by default here)
app.use(helmet());

// Log requests
app.use(morgan('combined'));

// JSON / form parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Only enable CORS when ALLOWED_ORIGINS is provided (production same-origin needs no CORS)
if (process.env.ALLOWED_ORIGINS) {
  const allowed = process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
  app.use(cors({ origin: allowed, credentials: true }));
}

// Gzip/Brotli where supported
app.use(compression());

/* -------------------- Health / readiness / debug routes -------------------- */
app.get('/healthz', (_req, res) => res.status(200).type('text').send('OK'));
app.get('/health', (_req, res) => res.json({ status: 'OK', message: 'Laundry Backend is running!' }));

// Optional DB readiness check if ./config/database exports ping()
let dbPing = null;
try {
  ({ ping: dbPing } = require('./config/database'));
} catch (_) {
  /* no db module, keep /readyz but mark as not ready */
}
app.get('/readyz', async (_req, res) => {
  if (typeof dbPing !== 'function') return res.status(503).json({ ready: false, error: 'DB ping not available' });
  try {
    await dbPing();
    return res.status(200).json({ ready: true });
  } catch (e) {
    return res.status(503).json({ ready: false, error: e.message });
  }
});

// Debug env (disable in production)
if (process.env.NODE_ENV !== 'production') {
  app.get('/debug/env', (_req, res) => {
    res.json({
      DB_HOST: process.env.DB_HOST || 'NOT_SET',
      DB_PORT: process.env.DB_PORT || 'NOT_SET',
      DB_NAME: process.env.DB_NAME || 'NOT_SET',
      DB_USER: process.env.DB_USER || 'NOT_SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      WEBSITE_HOSTNAME: process.env.WEBSITE_HOSTNAME || 'NOT_SET'
    });
  });
}

// Some probes hit this path; respond 200 fast
app.get('/robots933456.txt', (_req, res) => {
  res
    .status(200)
    .type('text')
    .set('Cache-Control', 'no-store')
    .send('User-agent: *\nDisallow:\n');
});

/* ------------------------------ API routes ------------------------------ */
/**
 * Some route files might be authored with ESM `export default router`
 * while others use CommonJS `module.exports = router`.
 * The unwrap() utility normalizes both to the actual router function.
 */
const unwrap = (m) => (m && m.default ? m.default : m);

let authRoutes, machineRoutes, reservationRoutes, lostAndFoundRoutes;
try { authRoutes         = unwrap(require('./routes/auth')); } catch (_) {}
try { machineRoutes      = unwrap(require('./routes/machines')); } catch (_) {}
try { reservationRoutes  = unwrap(require('./routes/reservations')); } catch (_) {}
try { lostAndFoundRoutes = unwrap(require('./routes/lostandfound')); } catch (_) {}

if (authRoutes)         app.use('/api/auth',         authRoutes);
if (machineRoutes)      app.use('/api/machines',     machineRoutes);
if (reservationRoutes)  app.use('/api/reservations', reservationRoutes);
if (lostAndFoundRoutes) app.use('/api/lostandfound', lostAndFoundRoutes);

// Lightweight API index
app.get('/api', (_req, res) => {
  res.json({
    message: 'Laundry Reservation System API',
    version: '1.0.0',
    status: 'All routes active'
  });
});

/* ---------------- Static hosting for the frontend build ---------------- */
const frontendBuildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(frontendBuildPath)) {
  // Cache static assets; never cache index.html
  const ONE_HOUR_MS = 60 * 60 * 1000;
  app.use(express.static(frontendBuildPath, {
    maxAge: ONE_HOUR_MS,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  /**
   * SPA fallback: any non-API/non-health path should serve index.html
   * so that React Router can handle it on the client.
   */
  app.get('*', (req, res, next) => {
    const u = req.originalUrl || '';
    if (
      u.startsWith('/api') ||
      u === '/health' ||
      u === '/healthz' ||
      u === '/readyz' ||
      u === '/robots933456.txt' ||
      u.startsWith('/debug')
    ) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

/* ------------------- API 404 and global error handling ------------------- */
// If we reached here and it's an /api/* path, the endpoint wasn't found
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requested_url: req.originalUrl
  });
});

// Global error handler (keep last)
app.use((err, _req, res, _next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
