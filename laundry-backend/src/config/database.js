// src/config/database.js
const { Pool } = require('pg');

// Load .env only for local development; Azure uses App Settings.
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (_) {
    // dotenv is optional in production
  }
}

// Azure Database for PostgreSQL (Flexible Server) enforces SSL (TLS 1.2).
// Use a permissive SSL config that works in containerized environments.
const ssl = { rejectUnauthorized: false };

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
  // Reasonable pool settings for App Service
  max: Number(process.env.DB_POOL_MAX) || 10,   // max clients in pool
  idleTimeoutMillis: 30_000,                    // release idle clients
  connectionTimeoutMillis: 5_000,               // fail fast if cannot connect
});

// Basic pool diagnostics (never log secrets)
pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected');
});
pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

// Simple query helper (recommended to use in routes/services)
async function query(text, params) {
  return pool.query(text, params);
}

// Readiness check: trivial query; pair with GET /readyz
async function ping() {
  await pool.query('SELECT 1');
  return true;
}

// Graceful shutdown: close pool before process exit
async function close() {
  await pool.end();
  console.log('PostgreSQL pool ended');
}

// Backward-compatible test function (optional)
async function testConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW() as now');
    console.log('🔍 Database test query successful:', rows[0]);
    return true;
  } catch (err) {
    console.error('❌ Database test failed:', err);
    return false;
  }
}

module.exports = { pool, query, ping, close, testConnection };
