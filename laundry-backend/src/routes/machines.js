const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // Correct syntax

// 添加一个初始化数据库的路由
router.get('/init', async (req, res) => {
  try {
    // 执行机器表的重置和初始化
    await pool.query(`
      -- 首先清空machines表（如果已有记录）
      TRUNCATE machines RESTART IDENTITY CASCADE;
      
      -- 重新插入所有8个洗衣机数据
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
    
    // 查询结果以确认初始化成功
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