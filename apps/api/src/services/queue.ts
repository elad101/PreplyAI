import { Queue } from 'bullmq';
import { env } from '../config/environment';
import { logger } from '../config/logger';
import type { GenerateBriefingJobData } from '../types';

const redisConnection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  ...(env.REDIS_PASSWORD && env.REDIS_PASSWORD.trim() !== '' && { password: env.REDIS_PASSWORD }),
};

export const briefingQueue = new Queue<GenerateBriefingJobData>('briefing-generation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 500,
    },
  },
});

briefingQueue.on('error', (error) => {
  logger.error({ error }, 'Briefing queue error');
});

export async function enqueueBriefingGeneration(
  jobData: GenerateBriefingJobData
): Promise<string> {
  try {
    console.log('🔗 Queue service: About to add job to queue...');
    console.log('🔗 Queue service: Redis connection:', redisConnection);
    
    // Deduplication key to prevent duplicate jobs
    const jobId = `${jobData.uid}:${jobData.meetingId}:briefing`;
    
    console.log('🔗 Queue service: Job ID:', jobId);
    console.log('🔗 Queue service: Job data:', jobData);
    
    const job = await briefingQueue.add('generate-briefing', jobData, {
      jobId,
      // Remove any existing job with same ID before adding
      removeOnComplete: true,
      removeOnFail: false,
    });

    console.log('✅ Queue service: Job added successfully:', job.id);
    logger.info({ jobId: job.id, uid: jobData.uid, meetingId: jobData.meetingId }, 'Enqueued briefing generation');
    
    return job.id!;
  } catch (error) {
    console.error('❌ Queue service: Failed to enqueue job:', error);
    logger.error({ error, jobData }, 'Failed to enqueue briefing generation');
    throw error;
  }
}

