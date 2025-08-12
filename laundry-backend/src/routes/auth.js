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

  try {
    // Find user from database
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
    
    // Direct password comparison
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

// Use GET request - via query parameters (keep original method for backward compatibility)
router.get('/login', async (req, res) => {
  // Get data from query parameters, not body
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
    // Find user from database
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
    
    // Simple plaintext password comparison - directly check if equals "demo"
    console.log('Comparing passwords...');
    console.log('Input password:', password);
    
    // Direct password comparison to check if equals "demo"
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

// POST register new user
router.post('/register', async (req, res) => {
  const { student_id, password, name, email, phone } = req.body;
  
  console.log('=== REGISTER DEBUG ===');
  console.log('Received registration data:', {
    student_id,
    name,
    email,
    phone: phone || 'not provided'
  });

  // Validate required fields
  if (!student_id || !password || !name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Student ID, password, name, and email are required'
    });
  }

  try {
    // Check if student ID already exists
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

    // Check if email already exists
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

    // Insert new user
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