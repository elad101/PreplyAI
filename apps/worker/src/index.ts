import { Worker, Job } from 'bullmq';
import { logger } from './config/logger';
import { env } from './config/environment';
import { processBriefingGeneration } from './workers/briefingWorker';
import type { GenerateBriefingJobData } from './types';

const redisConnection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  ...(env.REDIS_PASSWORD && env.REDIS_PASSWORD.trim() !== '' && { password: env.REDIS_PASSWORD }),
};

async function start() {
  try {
    logger.info('Starting worker...');

    // Create BullMQ worker
    const worker = new Worker<GenerateBriefingJobData>(
      'briefing-generation',
      async (job: Job<GenerateBriefingJobData>) => {
        return processBriefingGeneration(job);
      },
      {
        connection: redisConnection,
        concurrency: 5, // Process up to 5 jobs concurrently
        limiter: {
          max: 10, // Max 10 jobs
          duration: 60000, // per minute (to control OpenAI rate limits)
        },
      }
    );

    // Event listeners
    worker.on('completed', (job) => {
      logger.info(
        { jobId: job.id, uid: job.data.uid, meetingId: job.data.meetingId },
        'Job completed successfully'
      );
    });

    worker.on('failed', (job, err) => {
      logger.error(
        {
          jobId: job?.id,
          uid: job?.data.uid,
          meetingId: job?.data.meetingId,
          error: err.message,
          stack: err.stack,
        },
        'Job failed'
      );
    });

    worker.on('error', (err) => {
      logger.error({ error: err }, 'Worker error');
    });

    logger.info(
      {
        queue: 'briefing-generation',
        concurrency: 5,
        redis: `${env.REDIS_HOST}:${env.REDIS_PORT}`,
      },
      'Worker started'
    );

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, closing worker...');
      await worker.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, closing worker...');
      await worker.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start worker');
    process.exit(1);
  }
}

start();

