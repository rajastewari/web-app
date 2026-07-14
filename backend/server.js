const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// if no users.json file exists, create one
const DB_PATH = path.join(__dirname, 'users.json');
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
}


// helper functions to read/write users to the JSON file
function getUsers() {
  return JSON.parse(fs.readFileSync(DB_PATH));
}
function saveUsers(users) {
    fs.writeFileSync(DB_PATH, JSON.stringify(users));
}

// register endpoint
app.post('/register', async (req, res) => {

    // take input from frontend
    const { username, password } = req.body;
    const users = getUsers();
    const exists = users.find(u => u.username === username);

    // check if user exists
    if (exists) {
        return res.json({ success: false, message: 'Username already taken' });
    }

    // hash password and save user
    const hashed = await bcrypt.hash(password, 10);
    users.push({ username, password: hashed });
    saveUsers(users);
    res.json({ success: true, message: 'Account created' });
});

// login endpoint
app.post('/login', async (req, res) => {

    // take input from frontend
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    // check if user exists
    if (!user) {
        return res.json({ success: false, message: 'User not found' });
    }

    // check if password matches
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        res.json({ success: true, username });
    } else {
        res.json({ success: false, message: 'Incorrect password' });
    }
});

// start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});