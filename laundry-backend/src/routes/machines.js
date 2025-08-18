const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // Correct syntax

// Add a database initialization route
router.get('/init', async (req, res) => {
  try {
    // Execute machine table reset and initialization
    await pool.query(`
      -- First clear machines table (if records exist)
      TRUNCATE machines RESTART IDENTITY CASCADE;
      
      -- Re-insert all 8 washing machine data
      INSERT INTO machines (machine_number, location, status) VALUES 
      ('Machine 1', 'Basement', 'available'),
      ('Machine 2', 'Basement', 'available'),
      ('Machine 3', 'Dorm A', 'available'),
      ('Machine 4', 'Dorm A', 'available'),
      ('Machine 5', 'Dorm B', 'available'),
      ('Machine 6', 'Dorm B', 'available'),
      ('Machine 7', 'Community Center', 'available'),
      ('Machine 8', 'Community Center', 'available');
    `);
    
    // Query results to confirm successful initialization
    const result = await pool.query('SELECT * FROM machines ORDER BY id');
    
    res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      machines: result.rows
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Database initialization failed',
      error: error.message
    });
  }
});

// Get all washing machines
router.get('/', async (req, res) => {
  // DIAGNOSTIC LOGS: Print environment variables to check Azure configuration
  console.log('--- DIAGNOSTIC LOGS ---');
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_PORT: ${process.env.DB_PORT}`);
  console.log(`DB_NAME: ${process.env.DB_NAME}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
  console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? 'SET' : 'NOT SET'}`);
  console.log('-----------------------');

  try {
    const result = await pool.query('SELECT * FROM machines');
    res.json(result.rows);
  } catch (err) {
    // DIAGNOSTIC LOGS: Print the full error object for detailed debugging
    console.error('!!!!!! DATABASE QUERY FAILED !!!!!!');
    console.error('Full error object:', err);
    res.status(500).json({ message: 'Database query failed', error: err.message, stack: err.stack });
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