const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL || 'redis://localhost:6379';

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 5) {
      console.warn('⚠️ Redis connection retries exceeded limit. Running in local fallback mode without Redis.');
      return null; // Stop retrying after 5 failed attempts
    }
    const delay = Math.min(times * 200, 2000);
    return delay;
  }
};

const redisClient = new Redis(redisUrl, redisOptions);
const pubClient = new Redis(redisUrl, redisOptions);
const subClient = new Redis(redisUrl, redisOptions);

redisClient.on('connect', () => {
  console.log('✅ Redis Connected');
});

redisClient.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    // Suppress spammy connection refused errors in dev
  } else {
    console.error('❌ Redis Error:', err.message);
  }
});

pubClient.on('error', () => {});
subClient.on('error', () => {});

// Connect lazily without unhandled rejections
const connectRedis = async () => {
  try {
    await Promise.all([
      redisClient.connect(),
      pubClient.connect(),
      subClient.connect()
    ]);
  } catch (err) {
    console.warn('⚠️ Redis not available or connection refused. Continuing without Redis cluster adapter.');
  }
};

connectRedis();

module.exports = {
  redisClient,
  pubClient,
  subClient
};
