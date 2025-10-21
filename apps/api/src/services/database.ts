import { getPrisma } from '../config/prisma';
import { logger } from '../config/logger';
import type {
  GoogleConnection,
  Meeting,
  AIBriefing,
  UserSettings,
} from '../types';

export class DatabaseService {
  private prisma = getPrisma();

  // Users
  async ensureUser(firebaseUid: string, email?: string, displayName?: string): Promise<string> {
    try {
      const user = await this.prisma.user.upsert({
        where: { firebaseUid },
        update: {
          email: email || undefined,
          displayName: displayName || undefined,
        },
        create: {
          firebaseUid,
          email: email || `${firebaseUid}@unknown.com`,
          displayName: displayName || null,
        },
      });

      return user.id;
    } catch (error) {
      logger.error({ error, firebaseUid }, 'Failed to ensure user');
      throw error;
    }
  }

  async getUser(firebaseUid: string): Promise<Record<string, unknown> | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { firebaseUid },
      });

      return user as Record<string, unknown> | null;
    } catch (error) {
      logger.error({ error, firebaseUid }, 'Failed to get user');
      throw error;
    }
  }

  // Google Connections
  async getGoogleConnection(firebaseUid: string): Promise<GoogleConnection | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { firebaseUid },
        include: { googleConnection: true },
      });

      if (!user?.googleConnection) {
        return null;
      }

      const conn = user.googleConnection;
      return {
        accessToken: conn.accessToken,
        refreshToken: conn.refreshToken,
        expiryDate: Number(conn.expiryDate),
        scopes: conn.scopes,
        createdAt: conn.createdAt.toISOString(),
        updatedAt: conn.updatedAt.toISOString(),
      };
    } catch (error) {
      logger.error({ error, firebaseUid }, 'Failed to get Google connection');
      throw error;
    }
  }

  async saveGoogleConnection(firebaseUid: string, connection: GoogleConnection): Promise<void> {
    try {
      const userId = await this.ensureUser(firebaseUid);

      await this.prisma.googleConnection.upsert({
        where: { userId },
        update: {
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
          expiryDate: BigInt(connection.expiryDate),
          scopes: connection.scopes,
        },
        create: {
          userId,
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
          expiryDate: BigInt(connection.expiryDate),
          scopes: connection.scopes,
        },
      });

      logger.debug({ firebaseUid }, 'Saved Google connection');
    } catch (error) {
      logger.error({ error, firebaseUid }, 'Failed to save Google connection');
      throw error;
    }
  }

  // Meetings
  async getMeeting(firebaseUid: string, googleEventId: string): Promise<Meeting | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { firebaseUid },
        select: { id: true },
      });

      if (!user) {
        return null;
      }

      const meeting = await this.prisma.meeting.findUnique({
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
      logger.error({ error, firebaseUid, googleEventId }, 'Failed to get meeting');
      throw error;
    }
  }

  async saveMeeting(firebaseUid: string, meeting: Meeting): Promise<void> {
    try {
      const userId = await this.ensureUser(firebaseUid);

      await this.prisma.meeting.upsert({
        where: {
          userId_googleEventId: {
            userId,
            googleEventId: meeting.id,
          },
        },
        update: {
          summary: meeting.summary,
          description: meeting.description,
          location: meeting.location,
          startTime: new Date(meeting.startTime),
          endTime: new Date(meeting.endTime),
          organizer: meeting.organizer as any,
          attendees: meeting.attendees as any,
          conferenceData: meeting.conferenceData as any,
          htmlLink: meeting.htmlLink,
          lastFetchedAt: new Date(meeting.lastFetchedAt),
        },
        create: {
          userId,
          googleEventId: meeting.id,
          summary: meeting.summary,
          description: meeting.description,
          location: meeting.location,
          startTime: new Date(meeting.startTime),
          endTime: new Date(meeting.endTime),
          organizer: meeting.organizer as any,
          attendees: meeting.attendees as any,
          conferenceData: meeting.conferenceData as any,
          htmlLink: meeting.htmlLink,
          cachedAt: new Date(meeting.cachedAt),
          lastFetchedAt: new Date(meeting.lastFetchedAt),
        },
      });

      logger.debug({ firebaseUid, googleEventId: meeting.id }, 'Saved meeting');
    } catch (error) {
      logger.error({ error, firebaseUid, meetingId: meeting.id }, 'Failed to save meeting');
      throw error;
    }
  }

  // AI Briefings
  async getAIBriefing(firebaseUid: string, googleEventId: string): Promise<AIBriefing | null> {
    try {
      const meeting = await this.prisma.meeting.findFirst({
        where: {
          user: { firebaseUid },
          googleEventId,
        },
        include: { aiBriefing: true },
      });

      if (!meeting?.aiBriefing) {
        return null;
      }

      const briefing = meeting.aiBriefing;
      
      // Parse attendees if it's a JSON string
      let parsedAttendees = briefing.attendees;
      if (typeof briefing.attendees === 'string') {
        try {
          parsedAttendees = JSON.parse(briefing.attendees);
        } catch (error) {
          parsedAttendees = [];
        }
      }
      
      return {
        status: briefing.status as 'processing' | 'completed' | 'failed',
        jobId: briefing.jobId || undefined,
        lastGeneratedAt: briefing.lastGeneratedAt.toISOString(),
        model: briefing.model || undefined,
        company: briefing.company as any,
        attendees: parsedAttendees as any[],
        talkingPoints: briefing.talkingPoints as any[],
        icebreakers: briefing.icebreakers as any[],
        error: briefing.errorMessage || undefined,
      };
    } catch (error) {
      logger.error({ error, firebaseUid, googleEventId }, 'Failed to get AI briefing');
      throw error;
    }
  }

  async saveAIBriefing(firebaseUid: string, googleEventId: string, briefing: Partial<AIBriefing>): Promise<void> {
    try {
      const meeting = await this.prisma.meeting.findFirst({
        where: {
          user: { firebaseUid },
          googleEventId,
        },
        select: { id: true },
      });

      if (!meeting) {
        throw new Error(`Meeting ${googleEventId} not found for user ${firebaseUid}`);
      }

      await this.prisma.aIBriefing.upsert({
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

      logger.debug({ firebaseUid, googleEventId }, 'Saved AI briefing');
    } catch (error) {
      logger.error({ error, firebaseUid, googleEventId }, 'Failed to save AI briefing');
      throw error;
    }
  }

  // User Settings
  async getUserSettings(firebaseUid: string): Promise<UserSettings | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { firebaseUid },
        select: { settings: true },
      });

      if (!user) {
        return null;
      }

      return user.settings as UserSettings;
    } catch (error) {
      logger.error({ error, firebaseUid }, 'Failed to get user settings');
      throw error;
    }
  }

  async saveUserSettings(firebaseUid: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      await this.ensureUser(firebaseUid);

      const user = await this.prisma.user.findUnique({
        where: { firebaseUid },
        select: { settings: true },
      });

      const currentSettings = (user?.settings as UserSettings) || {};
      const mergedSettings = { ...currentSettings, ...settings };

      await this.prisma.user.update({
        where: { firebaseUid },
        data: { settings: mergedSettings },
      });

      logger.debug({ firebaseUid, settings }, 'Saved user settings');
    } catch (error) {
      logger.error({ error, firebaseUid }, 'Failed to save user settings');
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
