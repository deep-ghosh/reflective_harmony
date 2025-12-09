import redis from 'redis';

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  },
  password: process.env.REDIS_PASSWORD
  // Note: db selection is done via SELECT command in redis v4+
});

redisClient.on('error', (err: Error) => {
  console.error('Redis Client Error', err);
});

redisClient.connect();

export { redisClient };
