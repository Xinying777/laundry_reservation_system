const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// POST 方法登录 - 通过 request body
router.post('/login', async (req, res) => {
  // 从 request body 获取数据
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

  try {
    // 从数据库查找用户
    console.log('Querying database for user...');
    const result = await pool.query(
      'SELECT * FROM users WHERE student_id = $1',
      [student_id]
    );
    
    console.log('Database query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid student ID or password' 
      });
    }

    const user = result.rows[0];
    console.log('✅ User found:', {
      id: user.id,
      student_id: user.student_id,
      name: user.name
    });
    
    // 直接比较密码
    console.log('Comparing passwords...');
    const passwordMatch = (password === user.password);
    console.log('Password match result:', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Login successful');
      return res.json({ 
        success: true,
        message: 'Login successful', 
        data: {
          token: 'mock-jwt-token',
          user: {
            id: user.id,
            student_id: user.student_id,
            name: user.name
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

// 使用 GET 请求 - 通过 query parameters (保留原有方法兼容旧代码)
router.get('/login', async (req, res) => {
  // 从 query parameters 获取数据，不是 body
  const { student_id, password } = req.query;
  
  console.log('=== LOGIN DEBUG ===');
  console.log('Received student_id:', student_id);
  console.log('Received password:', password);

  if (!student_id || !password) {
    return res.status(400).json({
      success: false,
      message: 'Student ID and password are required'
    });
  }

  try {
    // 从数据库查找用户
    console.log('Querying database for user...');
    const result = await pool.query(
      'SELECT * FROM users WHERE student_id = $1',
      [student_id]
    );
    
    console.log('Database query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid student ID or password' 
      });
    }

    const user = result.rows[0];
    console.log('✅ User found:', {
      id: user.id,
      student_id: user.student_id,
      name: user.name
    });
    
    // 简单的明文密码比较 - 直接检查是否等于 "demo"
    console.log('Comparing passwords...');
    console.log('Input password:', password);
    
    // 直接比较密码是否为 "demo"
    const passwordMatch = (password === 'demo');
    console.log('Password match result (checking if password === "demo"):', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Login successful');
      return res.json({ 
        success: true,
        message: 'Login successful', 
        data: {
          token: 'mock-jwt-token',
          user: {
            id: user.id,
            student_id: user.student_id,
            name: user.name
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

// POST 注册新用户
router.post('/register', async (req, res) => {
  const { student_id, password, name, email, phone } = req.body;
  
  console.log('=== REGISTER DEBUG ===');
  console.log('Received registration data:', {
    student_id,
    name,
    email,
    phone: phone || 'not provided'
  });

  // 验证必需字段
  if (!student_id || !password || !name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Student ID, password, name, and email are required'
    });
  }

  try {
    // 检查学号是否已存在
    console.log('Checking if student_id already exists...');
    const existingUser = await pool.query(
      'SELECT student_id FROM users WHERE student_id = $1',
      [student_id]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('❌ Student ID already exists');
      return res.status(409).json({ 
        success: false,
        message: 'Student ID already exists. Please use a different Student ID.' 
      });
    }

    // 检查邮箱是否已存在
    console.log('Checking if email already exists...');
    const existingEmail = await pool.query(
      'SELECT email FROM users WHERE email = $1',
      [email]
    );
    
    if (existingEmail.rows.length > 0) {
      console.log('❌ Email already exists');
      return res.status(409).json({ 
        success: false,
        message: 'Email already exists. Please use a different email address.' 
      });
    }

    // 插入新用户
    console.log('Creating new user...');
    const result = await pool.query(
      'INSERT INTO users (student_id, password, name, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, student_id, name, email',
      [student_id, password, name, email, phone || null]
    );
    
    const newUser = result.rows[0];
    console.log('✅ User created successfully:', {
      id: newUser.id,
      student_id: newUser.student_id,
      name: newUser.name,
      email: newUser.email
    });

    return res.status(201).json({ 
      success: true,
      message: 'Registration successful! You can now log in with your credentials.',
      data: {
        user: {
          id: newUser.id,
          student_id: newUser.student_id,
          name: newUser.name,
          email: newUser.email
        }
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.',
      error: error.message
    });
  }
});

module.exports = router;