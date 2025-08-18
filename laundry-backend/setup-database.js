const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Setting up database tables...');
    
    // Read and execute schema.sql file
    const fs = require('fs');
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    
    await client.query(schema);
    console.log('✅ Database tables created successfully!');
    
    // Verify tables are created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 Created tables:', tablesResult.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

setupDatabase();
