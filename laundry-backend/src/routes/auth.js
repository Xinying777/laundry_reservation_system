// routes/auth.js
const express = require('express');
const router = express.Router();

let pool = null;
// Try to load DB pool; if not present, we will fall back to in-memory users
try { ({ pool } = require('../config/database')); } catch (_) {
  console.warn('[auth] No DB module found. Using in-memory users as a fallback.');
}

const bcrypt = require('bcryptjs');

/** Demo users (fallback when DB is not configured) */
const localUsers = [
  { id: 1, student_id: 'demo',   password: 'demo',     name: 'Demo User',    email: 'demo@university.edu' },
  { id: 2, student_id: '123123', password: 'password', name: 'Student One',  email: 'student1@university.edu' }
];

const isBcryptHash = (s = '') => /^\$2[aby]\$/.test(s);

/** -------------------- LOGIN -------------------- */
router.post('/login', async (req, res) => {
  const { student_id, password } = req.body || {};
  if (!student_id || !password) {
    return res.status(400).json({ success: false, message: 'Student ID and password are required' });
  }

  // 1) Try database if available
  if (pool) {
    try {
      const q = 'SELECT id, student_id, name, email, password FROM users WHERE student_id = $1 LIMIT 1';
      const { rows } = await pool.query(q, [student_id]);

      if (rows.length > 0) {
        const user = rows[0];
        const stored = user.password || '';
        const ok = isBcryptHash(stored) ? await bcrypt.compare(password, stored) : (password === stored);
        if (ok) {
          return res.json({
            success: true,
            message: 'Login successful',
            data: {
              token: 'mock-jwt-token',
              user: { id: user.id, student_id: user.student_id, name: user.name }
            }
          });
        }
        // If DB user found but password mismatch, fall through to local users for dev accounts
      }
    } catch (e) {
      console.error('[auth] Login DB error:', e);
      // fall through to local users
    }
  }

  // 2) Fallback to local demo users
  const u = localUsers.find(x => x.student_id === student_id && x.password === password);
  if (u) {
    return res.json({
      success: true,
      message: 'Login successful',
      data: { token: 'mock-jwt-token', user: { id: u.id, student_id: u.student_id, name: u.name } }
    });
  }

  // 3) Neither matched
  return res.status(401).json({ success: false, message: 'Invalid student ID or password' });
});

/** -------------------- REGISTER -------------------- */
router.post('/register', async (req, res) => {
  const { student_id, password, name, email, phone } = req.body || {};
  if (!student_id || !password || !name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Student ID, password, name and email are required'
    });
  }

  // Prefer DB when available
  if (pool) {
    try {
      const exists = await pool.query('SELECT 1 FROM users WHERE student_id = $1', [student_id]);
      if (exists.rowCount > 0) {
        return res.status(409).json({ success: false, message: 'Student ID already exists' });
      }

      const hash = await bcrypt.hash(password, 10);
      const ins = await pool.query(
        'INSERT INTO users (student_id, password, name, email, phone) VALUES ($1,$2,$3,$4,$5) RETURNING id, student_id, name',
        [student_id, hash, name, email, phone ?? null]
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user: ins.rows[0] }
      });
    } catch (e) {
      console.error('[auth] Registration DB error:', e);
      return res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }

  // Fallback: in-memory (dev/demo only; lost after restart)
  if (localUsers.some(u => u.student_id === student_id)) {
    return res.status(409).json({ success: false, message: 'Student ID already exists' });
  }
  const id = localUsers.reduce((m, u) => Math.max(m, u.id), 0) + 1;
  localUsers.push({ id, student_id, password, name, email, phone: phone ?? null });

  return res.status(201).json({
    success: true,
    message: 'User registered (in-memory)',
    data: { user: { id, student_id, name } }
  });
});

module.exports = router;
