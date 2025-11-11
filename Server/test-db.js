// Test database connection
require('dotenv').config();
const pool = require('./config/database');

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW(), version()');
    console.log('✅ Database connected successfully!');
    console.log('Server time:', result.rows[0].now);
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // Test tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\n📋 Tables created:');
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
