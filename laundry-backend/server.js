// server.js

// Load .env only in local development (Azure uses portal App Settings)
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (_) {
    console.warn('dotenv not available, skipping .env loading');
  }
}

const http = require('http');
const app = require('./src/app');
// If ./src/config/database.js exports close(), we can call it on shutdown
let db = null;
try {
  db = require('./src/config/database');
} catch (_) {
  // Database module not required at this stage
}

const PORT = Number(process.env.PORT) || 3000;

// Create HTTP server explicitly
const server = http.createServer(app);

// Adjust keep-alive / headers timeout for Azure load balancer
server.keepAliveTimeout = 65 * 1000;   // 65s
server.headersTimeout   = 66 * 1000;   // must be > keepAliveTimeout

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

/* ---------------- Graceful shutdown handling ---------------- */
const GRACEFUL_MS = 10_000;

function shutdown(signal) {
  console.log(`${signal} received, starting graceful shutdown...`);
  server.close(async (err) => {
    if (err) {
      console.error('Error while closing server:', err);
      process.exit(1);
    }
    try {
      if (db && typeof db.close === 'function') {
        await db.close();
        console.log('Database connections closed');
      }
    } catch (e) {
      console.error('Error closing DB pool:', e);
    }
    console.log('Shutdown complete, exiting.');
    process.exit(0);
  });

  // Force exit if not closed in time
  setTimeout(() => {
    console.warn(`Force shutdown after ${GRACEFUL_MS}ms`);
    process.exit(1);
  }, GRACEFUL_MS).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Fallback error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  shutdown('unhandledRejection');
});
