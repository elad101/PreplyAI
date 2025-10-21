import { createApp } from './app';
import { initializeFirebase } from './config/firebase';
import { connectPrisma } from './config/prisma';
import { connectRedis } from './config/redis';
import { logger } from './config/logger';
import { env } from './config/environment';

async function start() {
  try {
    // Initialize Firebase (for auth only)
    logger.info('Initializing Firebase Admin...');
    initializeFirebase();
    logger.info('Firebase Admin initialized');

    // Connect to PostgreSQL via Prisma
    logger.info('Connecting to PostgreSQL via Prisma...');
    await connectPrisma();
    logger.info('Prisma connected to PostgreSQL');

    // Connect to Redis
    logger.info('Connecting to Redis...');
    await connectRedis();
    logger.info('Redis connected');

    // Create Express app
    const app = createApp();

    // Start server
    const port = parseInt(env.PORT, 10);
    app.listen(port, () => {
      logger.info({ port, env: env.NODE_ENV }, 'Server started');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

start();

