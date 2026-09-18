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
    await pool.query(`
        CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            role_name VARCHAR(50) UNIQUE NOT NULL
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_roles (
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            role_id INT REFERENCES roles(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, role_id)
        )
    `);
    await pool.query(`
        INSERT INTO roles (role_name) VALUES ('free'), ('premium'), ('admin')
        ON CONFLICT (role_name) DO NOTHING
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS watchlists (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            symbol VARCHAR(10) NOT NULL,
            added_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, symbol)
        )
    `);
    console.log('Database ready');
}

module.exports = { pool, initDB }