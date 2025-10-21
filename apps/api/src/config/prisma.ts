import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn']
        : ['error'],
    });
  }

  return prisma;
}

export async function connectPrisma(): Promise<void> {
  const client = getPrisma();
  await client.$connect();
  logger.info('Prisma connected to database');
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  }
}

