const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const { pool, initDB } = require('./db');
const crypto = require('crypto');
const { client: redis, connectRedis } = require('./cache');

const app = express();
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
    const newUser = await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id', [username, hashed]);
    const userId = newUser.rows[0].id;

    // assign default role to new user (Free)
    const freeRole = await pool.query("SELECT id FROM roles WHERE role_name = 'free'");
    const roleId = freeRole.rows[0].id;
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);

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

// symbols shown in the ticker tape header
// indices don't trade directly, so we use their tracking ETFs instead
const TICKER_SYMBOLS = [
    { symbol: 'SPY', name: 'S&P 500' },
    { symbol: 'DIA', name: 'DOW' },
    { symbol: 'QQQ', name: 'NASDAQ' },
    { symbol: 'GLD', name: 'GOLD' },
];

// market summary endpoint
app.get('/api/market-summary', async (req, res) => {
    try {
        const quotes = await Promise.all(TICKER_SYMBOLS.map(async (t) => {
            const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${t.symbol}&token=${process.env.FINNHUB_API_KEY}`);
            const data = await response.json();

            // check to ensure API returns valid data
            if (typeof data.c !== 'number' || typeof data.dp !== 'number') {
                return { name: t.name, price: null, changePercent: null, up: false };
            }

            return {
                name: t.name,
                price: data.c,
                changePercent: data.dp,
                up: data.dp >= 0
            };
        }));
        res.json({ success: true, data: quotes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch market data' });
    }
});

// function to start server
async function start() {
    await connectRedis(); // connect to Redis first
    await initDB(); // initialize database
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}

start();