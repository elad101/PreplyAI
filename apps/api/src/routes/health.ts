import { Router } from 'express';
import { getPrisma } from '../config/prisma';
import { getRedis } from '../config/redis';
import { logger } from '../config/logger';

const router = Router();

interface HealthStatus {
  ok: boolean;
  timestamp: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
  };
  uptime: number;
  version: string;
}

async function checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error({ error }, 'Database health check failed');
    
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkRedis(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const redis = getRedis();
    await redis.ping();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error({ error }, 'Redis health check failed');
    
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Health check endpoint
router.get('/', async (_req, res) => {
  try {
    const [database, redis] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    const allHealthy = database.status === 'healthy' && redis.status === 'healthy';
    
    const healthStatus: HealthStatus = {
      ok: allHealthy,
      timestamp: new Date().toISOString(),
      services: {
        database,
        redis,
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    
    const healthStatus: HealthStatus = {
      ok: false,
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'unhealthy', error: 'Health check failed' },
        redis: { status: 'unhealthy', error: 'Health check failed' },
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    res.status(503).json(healthStatus);
  }
});

// Simple liveness probe (for Kubernetes)
router.get('/live', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (_req, res) => {
  try {
    const [database, redis] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    const isReady = database.status === 'healthy' && redis.status === 'healthy';
    const statusCode = isReady ? 200 : 503;
    
    res.status(statusCode).json({
      ok: isReady,
      timestamp: new Date().toISOString(),
      ready: isReady,
    });
  } catch (error) {
    logger.error({ error }, 'Readiness check failed');
    res.status(503).json({
      ok: false,
      timestamp: new Date().toISOString(),
      ready: false,
    });
  }
});

export { router as healthRouter };
