import { createClient } from 'redis';


// const redisClient = createClient({ url: process.env.REDIS_URL });
// const redisClient = createClient({ url: "redis://localhost:6378" });
const redisClient = createClient({
  username: 'default',
  password: 'IWX7DegIe6CDoOsDTqU5clcpJNb8ynyj',
  socket: {
      host: 'http://redis-18282.c273.us-east-1-2.ec2.redns.redis-cloud.com',
      port: 18282
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
