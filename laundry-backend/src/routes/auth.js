const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// POST login method - via request body
router.post('/login', async (req, res) => {
  // Get data from request body
  const { student_id, password } = req.body;
  
  console.log('=== POST LOGIN DEBUG ===');
  console.log('Received student_id:', student_id);
  console.log('Received password:', password);

  if (!student_id || !password) {
    return res.status(400).json({
      success: false,
      message: 'Student ID and password are required'
    });
  }

  // 临时用户列表 - 硬编码一些用户，不依赖数据库
  const localUsers = [
    {
      id: 1,
      student_id: 'demo',
      password: 'demo',
      name: 'Demo User',
      email: 'demo@university.edu'
    },
    {
      id: 2,
      student_id: '123123',
      password: 'password',
      name: 'Student One',
      email: 'student1@university.edu'
    },
    {
      id: 3,
      student_id: '456789',
      password: 'student123',
      name: 'Student Two',
      email: 'student2@university.edu'
    }
  ];

  try {
    console.log('Using local user validation instead of database...');
    const foundUser = localUsers.find(u => u.student_id === student_id);
    
    if (!foundUser) {
      console.log('❌ User not found in local users');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid student ID or password' 
      });
    }

    console.log('✅ User found:', {
      id: foundUser.id,
      student_id: foundUser.student_id,
      name: foundUser.name
    });
    
    // Direct password comparison
    console.log('Comparing passwords...');
    const passwordMatch = (password === foundUser.password);
    console.log('Password match result:', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Login successful');
      return res.json({ 
        success: true,
        message: 'Login successful', 
        data: {
          token: 'mock-jwt-token',
          user: {
            id: foundUser.id,
            student_id: foundUser.student_id,
            name: foundUser.name
          }
        }
      });
    } else {
      console.log('❌ Password does not match');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid student ID or password' 
      });
    }

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// 注册路由
router.post('/register', async (req, res) => {
  const { student_id, password, name, email, phone } = req.body;

  // 验证必填字段
  if (!student_id || !password || !name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Student ID, password, name, and email are required'
    });
  }

  try {
    // 检查用户是否已存在
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE student_id = $1',
      [student_id]
    );

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    // 创建新用户
    const insertResult = await pool.query(
      'INSERT INTO users (student_id, password, name, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [student_id, password, name, email, phone || null]
    );

    const newUser = insertResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          student_id: newUser.student_id,
          name: newUser.name
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// 获取用户信息路由
router.get('/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT id, student_id, name, email, phone, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user information',
      error: error.message
    });
  }
});

module.exports = router;
