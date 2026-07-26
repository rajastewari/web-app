const { createClient } = require('redis');
const client = createClient({ 
    url: process.env.REDIS_URL || 'redis://localhost:6379' 
});
async function connectRedis() {
    await client.connect();
    console.log('Redis ready');
}

module.exports = { client, connectRedis };
