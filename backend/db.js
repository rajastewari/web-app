const { Pool } = require('pg');
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/webapp' 
});

async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    `);

    console.log('Database ready');
}

module.exports = { pool, initDB }