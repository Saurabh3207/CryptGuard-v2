const Redis = require('ioredis');
const { REDIS_URL } = require('./serverConfig');

// Create Redis client for Upstash
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis (Upstash)');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

module.exports = redis;
