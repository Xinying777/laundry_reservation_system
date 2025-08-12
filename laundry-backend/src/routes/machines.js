const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // Correct syntax

// Get all washing machines
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM machines');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Database query failed', error: err.message });
  }
});

// Get single washing machine information
router.get('/:id', async (req, res) => {
  try {
    const machineId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM machines WHERE id = $1', [machineId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Washing machine not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database query failed', error: err.message });
  }
});

// ...existing code for availability...

module.exports = router;