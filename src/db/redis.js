import { createClient } from 'redis';


// const redisClient = createClient({ url: process.env.REDIS_URL });
// const redisClient = createClient({ url: "redis://localhost:6378" });
const redisClient = createClient({
  username: 'default',
  password: 'nkR1dGx5FfhFcz7KslR2lPAC5L0tEoY5',
  socket: {
      host: 'redis-17153.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
      port: 17153
  }
});


export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('🔵 Redis connected');
  } catch (err) {
    console.error({ err }, '❌ Redis connection failed');
    throw err;
  }
};

export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    console.log('🔴 Redis disconnected');
  } catch (err) {
    console.error({ err }, '❌ Redis disconnection failed');
  }
};

export { redisClient };