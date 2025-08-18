const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function addMissingMachines() {
  try {
    console.log('🔧 Starting to add missing machines...');
    
    // First check how many machines currently exist
    const currentMachines = await pool.query('SELECT * FROM machines ORDER BY id');
    console.log('Current machine count:', currentMachines.rows.length);
    console.log('Existing machines:', currentMachines.rows);
    
    // Add missing machines (if they don't exist)
    const newMachines = [
      { machine_number: 'Machine 4', location: 'Dorm A', status: 'available' },
      { machine_number: 'Machine 5', location: 'Dorm B', status: 'available' },
      { machine_number: 'Machine 6', location: 'Dorm B', status: 'available' },
      { machine_number: 'Machine 7', location: 'Community Center', status: 'available' },
      { machine_number: 'Machine 8', location: 'Community Center', status: 'available' }
    ];
    
    for (const machine of newMachines) {
      try {
        await pool.query(
          'INSERT INTO machines (machine_number, location, status) VALUES ($1, $2, $3) ON CONFLICT (machine_number) DO NOTHING',
          [machine.machine_number, machine.location, machine.status]
        );
        console.log(`✅ Added machine: ${machine.machine_number}`);
      } catch (err) {
        console.log(`⚠️ Machine ${machine.machine_number} may already exist:`, err.message);
      }
    }
    
    // Update locations of existing machines
    await pool.query("UPDATE machines SET location = 'Basement' WHERE machine_number = 'Machine 1'");
    await pool.query("UPDATE machines SET location = 'Basement' WHERE machine_number = 'Machine 2'");
    await pool.query("UPDATE machines SET location = 'Dorm A' WHERE machine_number = 'Machine 3'");
    
    // Verify final results
    const finalMachines = await pool.query('SELECT * FROM machines ORDER BY id');
    console.log('\n🎉 Final machine list:');
    finalMachines.rows.forEach(machine => {
      console.log(`  ${machine.machine_number}: ${machine.location} (${machine.status})`);
    });
    
    console.log(`\n✅ Complete! Now have ${finalMachines.rows.length} machines`);
    
  } catch (error) {
    console.error('❌ Failed to add machines:', error);
  } finally {
    await pool.end();
  }
}

// Run script
addMissingMachines();
