const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Create new reservation
router.post('/', async (req, res) => {
  const { start_time, end_time, student_id, date, time } = req.body;
  let { user_id, machine_id } = req.body;
  
  console.log('Received reservation body:', req.body);
  
  let finalStartTime, finalEndTime;
  
  // Process different input formats
  if (start_time && end_time) {
    // Direct format
    finalStartTime = start_time;
    finalEndTime = end_time;
  } else if (date && time && student_id && machine_id) {
    // Calculate start_time and end_time based on date and time
    console.log('📅 Processing date/time format:', { date, time, student_id, machine_id });
    
    const timeIn24h = convertTo24Hour(time);
    console.log('🕐 Converted time:', time, '->', timeIn24h);
    
    // Use local date time format directly, no UTC conversion
    finalStartTime = `${date} ${timeIn24h}:00`;
    
    // Calculate end time (2 hours later)
    const [hours, minutes] = timeIn24h.split(':');
    let endHour = parseInt(hours) + 2;
    let endDate = date;
    
    // Handle cross-day scenarios
    if (endHour >= 24) {
      endHour -= 24;
      const currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() + 1);
      endDate = currentDate.toISOString().split('T')[0];
    }
    
    const endTime24h = `${endHour.toString().padStart(2, '0')}:${minutes}`;
    finalEndTime = `${endDate} ${endTime24h}:00`;
    
    console.log(`🔄 Calculated times: start=${finalStartTime}, end=${finalEndTime}`);
  } else {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields. Please provide either (student_id, machine_id, date, time) or (user_id, machine_id, start_time, end_time)' 
    });
  }

  // If student_id is provided, need to find user_id first
  if (student_id) {
    try {
      // First try to find in local user list (same logic as in auth.js)
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
      
      const foundUser = localUsers.find(u => u.student_id === student_id);
      if (foundUser) {
        user_id = foundUser.id;
        console.log(`Found user_id ${user_id} for student_id ${student_id} in local users`);
      } else {
        // If not found in local user list, try database
        const userResult = await pool.query(
          'SELECT id FROM users WHERE student_id = $1',
          [student_id]
        );
        if (userResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Student not found. Please check your student ID.'
          });
        }
        user_id = userResult.rows[0].id;
        console.log(`Found user_id ${user_id} for student_id ${student_id} in database`);
      }
    } catch (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({
        success: false,
        message: 'Error validating student ID',
        error: err.message
      });
    }
  }

  if (!user_id || !machine_id || !finalStartTime || !finalEndTime) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields after processing' 
    });
  }
  
  try {
    // Check if the machine_id from frontend is a number
    const numericMachineId = parseInt(machine_id, 10);
    if (isNaN(numericMachineId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid machine ID format. Must be a number.'
      });
    }
    
    // Don't query machine ID directly, map frontend ID to database ID
    // Frontend ID is simple 1-8, always in order
    // Get all machines, ordered by ID
    const allMachines = await pool.query('SELECT id FROM machines ORDER BY id');
    console.log('Available machines in database:', allMachines.rows);
    
    // Check if the requested machine ID is within valid range
    if (numericMachineId < 1 || numericMachineId > allMachines.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found. Please select a valid machine number (1-' + allMachines.rows.length + ').'
      });
    }
    
    // Map by index position, array index starts from 0, so subtract 1
    const mappedMachineId = allMachines.rows[numericMachineId - 1].id;
    console.log(`Mapped frontend machine_id ${numericMachineId} to database id ${mappedMachineId}`);
    
    // Update machine_id to mapped value
    machine_id = mappedMachineId;
    
    // Check for time conflicts
    console.log('🔍 Checking conflicts for:', { machine_id, finalStartTime, finalEndTime });
    
    const conflictCheck = await pool.query(
      `SELECT * FROM reservations 
       WHERE machine_id = $1 
       AND status IN ('pending', 'confirmed')
       AND (
         (start_time <= $2 AND end_time > $2) OR
         (start_time < $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [machine_id, finalStartTime, finalEndTime]
    );

    console.log('🔍 Found conflicts:', conflictCheck.rows.length, conflictCheck.rows);

    if (conflictCheck.rows.length > 0) {
      console.log('❌ Conflict detected, rejecting reservation');
      return res.status(409).json({
        success: false,
        message: 'This time slot is already reserved. Please choose a different time.'
      });
    }

    const result = await pool.query(
      `INSERT INTO reservations (user_id, machine_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [user_id, machine_id, finalStartTime, finalEndTime]
    );
    
    res.status(201).json({ 
      success: true,
      message: 'Reservation created successfully', 
      data: { reservation: result.rows[0] }
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Database error', 
      error: err.message 
    });
  }
});

// Helper function: Convert 12-hour to 24-hour format
function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  
  if (modifier === 'AM') {
    if (hours === 12) {
      hours = 0; // 12 AM = 00:00
    }
  } else if (modifier === 'PM') {
    if (hours !== 12) {
      hours += 12; // 1 PM = 13:00, but 12 PM = 12:00
    }
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Get all reservations (augmented with machine_no for frontend matching)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Getting all reservations request');
    
    // build mapping: db id -> 1..N (frontend number by order)
    const machines = await pool.query('SELECT id FROM machines ORDER BY id');
    const idToNo = new Map(machines.rows.map((r, i) => [r.id, i + 1]));
    console.log('🔢 Machine ID mapping:', Object.fromEntries(idToNo));

    const result = await pool.query('SELECT * FROM reservations ORDER BY created_at DESC');
    console.log('📦 Raw reservation data:', result.rows);

    const rows = result.rows.map(r => ({
      ...r,
      machine_no: idToNo.get(r.machine_id) ?? null, // add frontend number
    }));

    console.log('✨ Enhanced reservation data (with machine_no):', rows);

    res.json({
      success: true,
      data: { reservations: rows },
    });
  } catch (err) {
    console.error('❌ Error getting reservation data:', err);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: err.message,
    });
  }
});

// Delete reservation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM reservations WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Reservation deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reservation'
    });
  }
});

// Batch cleanup incorrect reservation records
router.post('/cleanup', async (req, res) => {
  try {
    // Delete all reservations that are not 2 hours duration
    const result = await pool.query(`
      DELETE FROM reservations 
      WHERE EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 != 2
      RETURNING id, start_time, end_time, 
              EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 as duration_hours
    `);
    
    res.json({
      success: true,
      message: `Cleaned up ${result.rows.length} invalid reservations`,
      deletedReservations: result.rows
    });
  } catch (error) {
    console.error('Error cleaning up reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup reservations'
    });
  }
});

// Confirm reservation
router.post('/confirm', async (req, res) => {
  const { reservation_id } = req.body;
  
  if (!reservation_id) {
    return res.status(400).json({
      success: false,
      message: 'Reservation ID is required'
    });
  }
  
  try {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [reservation_id]
    );
    
    if (result.rows.length > 0) {
      res.json({ 
        success: true,
        message: 'Reservation confirmed successfully', 
        data: { reservation: result.rows[0] }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
  } catch (err) {
    console.error('Confirm reservation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error occurred while confirming reservation', 
      error: err.message 
    });
  }
});

module.exports = router;