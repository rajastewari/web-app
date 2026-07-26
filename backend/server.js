const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const { pool, initDB } = require('./db');
const crypto = require('crypto');
const { client: redis, connectRedis } = require('./cache');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// register endpoint
app.post('/register', async (req, res) => {

    // take input from frontend
    const { username, password } = req.body;
    const result = await pool.query('SELECT id, password_hash FROM users WHERE username = $1', [username]);

    // check if user exists
    if (result.rows.length > 0) {
        return res.json({ success: false, message: 'Username already taken' });
    }

    // hash password and save user
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hashed]);
    res.json({ success: true, message: 'Account created' });
});

// login endpoint
app.post('/login', async (req, res) => {

    // take input from frontend
    const { username, password } = req.body;
    const result = await pool.query('SELECT id, password_hash FROM users WHERE username = $1', [username]);

    // check if user exists
    if (result.rows.length === 0) {
        return res.json({ success: false, message: 'User not found' });
    }
    const user = result.rows[0];
    // check if password matches
    const match = await bcrypt.compare(password, user.password_hash);
    if (match) {
        const token = crypto.randomUUID();
        await redis.set('session:' + token, username, { EX: 86400 });
        res.json({ success: true, username, token });
    } else {
        res.json({ success: false, message: 'Incorrect password' });
    }
});

// welcome endpoint
app.get('/welcome', async (req, res) => {
    // load token from request header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {  // if hitting welcome endpoint without token
        return res.status(401).json({ success: false, message: 'No active session' });
    }
    const token = authHeader.replace('Bearer ', '');

    // check if token exists and is valid in Redis
    const username = await redis.get('session:' + token);
    if (!username) {
        return res.status(401).json({ success: false, message: 'Session expired' });
    }
    res.json({ success: true, username });
});

// function to start server
async function start() {
    await connectRedis(); // connect to Redis first
    await initDB(); // initialize database first
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}

start();