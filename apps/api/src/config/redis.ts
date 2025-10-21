import { createClient } from 'redis';
import { env } from './environment';
import { logger } from './logger';

export const redisClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT, 10),
  },
  password: env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis client error');
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export function getRedis() {
  return redisClient;
}

