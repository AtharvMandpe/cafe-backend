import { createClient } from 'redis';

const redisClient = createClient({
  username: 'default',
  password: 'JGIgXtB0IKA7nJJ37zTJryCoa6FMBPis',
  socket: {
    host: 'redis-10028.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 10028,
    tls: true   // Redis Cloud requires TLS
  }
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('🔵 Redis connected');
  } catch (err) {
    console.error('❌ Redis connection failed', err);
    throw err;
  }
};

export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    console.log('🔴 Redis disconnected');
  } catch (err) {
    console.error('❌ Redis disconnection failed', err);
  }
};

export { redisClient };
