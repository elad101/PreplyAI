import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import type { Meeting, AIBriefing } from '../types';

// Use the shared Prisma client from the API
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
  // Use the same DATABASE_URL as the API
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export class DatabaseService {
  async getMeeting(uid: string, googleEventId: string): Promise<Meeting | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { firebaseUid: uid },
        select: { id: true },
      });

      if (!user) {
        return null;
      }

      const meeting = await prisma.meeting.findUnique({
        where: {
          userId_googleEventId: {
            userId: user.id,
            googleEventId,
          },
        },
      });

      if (!meeting) {
        return null;
      }

      return this.prismaToMeeting(meeting);
    } catch (error) {
      logger.error({ error, uid, googleEventId }, 'Failed to get meeting');
      throw error;
    }
  }

  async saveAIBriefing(uid: string, googleEventId: string, briefing: Partial<AIBriefing>): Promise<void> {
    try {
      const meeting = await prisma.meeting.findFirst({
        where: {
          user: { firebaseUid: uid },
          googleEventId,
        },
        select: { id: true },
      });

      if (!meeting) {
        throw new Error(`Meeting ${googleEventId} not found for user ${uid}`);
      }

      await prisma.aIBriefing.upsert({
        where: { meetingId: meeting.id },
        update: {
          status: briefing.status || undefined,
          jobId: briefing.jobId || undefined,
          model: briefing.model || undefined,
          company: briefing.company || undefined,
          attendees: briefing.attendees || undefined,
          talkingPoints: briefing.talkingPoints || undefined,
          icebreakers: briefing.icebreakers || undefined,
          errorMessage: briefing.error || undefined,
          lastGeneratedAt: new Date(),
        },
        create: {
          meetingId: meeting.id,
          status: briefing.status || 'processing',
          jobId: briefing.jobId,
          model: briefing.model,
          company: briefing.company as any,
          attendees: briefing.attendees || [],
          talkingPoints: briefing.talkingPoints || [],
          icebreakers: briefing.icebreakers || [],
          errorMessage: briefing.error,
        },
      });

      logger.debug({ uid, googleEventId }, 'Saved AI briefing');
    } catch (error) {
      logger.error({ error, uid, googleEventId }, 'Failed to save AI briefing');
      throw error;
    }
  }

  // Helper: Convert Prisma model to Meeting type
  private prismaToMeeting(meeting: any): Meeting {
    return {
      id: meeting.googleEventId,
      summary: meeting.summary,
      description: meeting.description,
      location: meeting.location,
      startTime: meeting.startTime.toISOString(),
      endTime: meeting.endTime.toISOString(),
      organizer: meeting.organizer,
      attendees: meeting.attendees,
      conferenceData: meeting.conferenceData,
      htmlLink: meeting.htmlLink,
      cachedAt: meeting.cachedAt.toISOString(),
      lastFetchedAt: meeting.lastFetchedAt.toISOString(),
    };
  }
}

export const databaseService = new DatabaseService();
