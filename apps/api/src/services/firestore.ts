import { getFirestore } from '../config/firebase';
import { logger } from '../config/logger';
import type {
  GoogleConnection,
  Meeting,
  AIBriefing,
  UserSettings,
} from '../types';

export class FirestoreService {
  private db = getFirestore();

  // Google Connections
  async getGoogleConnection(uid: string): Promise<GoogleConnection | null> {
    try {
      const doc = await this.db.collection('connections').doc(uid).collection('providers').doc('google').get();
      if (!doc.exists) {
        return null;
      }
      return doc.data() as GoogleConnection;
    } catch (error) {
      logger.error({ error, uid }, 'Failed to get Google connection');
      throw error;
    }
  }

  async saveGoogleConnection(uid: string, connection: GoogleConnection): Promise<void> {
    try {
      await this.db.collection('connections').doc(uid).collection('providers').doc('google').set(connection);
    } catch (error) {
      logger.error({ error, uid }, 'Failed to save Google connection');
      throw error;
    }
  }

  // Meetings
  async getMeeting(uid: string, meetingId: string): Promise<Meeting | null> {
    try {
      const doc = await this.db.collection('meetings').doc(uid).collection('items').doc(meetingId).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data() as Meeting;
    } catch (error) {
      logger.error({ error, uid, meetingId }, 'Failed to get meeting');
      throw error;
    }
  }

  async saveMeeting(uid: string, meeting: Meeting): Promise<void> {
    try {
      await this.db.collection('meetings').doc(uid).collection('items').doc(meeting.id).set(meeting);
    } catch (error) {
      logger.error({ error, uid, meetingId: meeting.id }, 'Failed to save meeting');
      throw error;
    }
  }

  async getMeetings(uid: string, meetingIds: string[]): Promise<Meeting[]> {
    try {
      if (meetingIds.length === 0) {
        return [];
      }

      const chunks = this.chunkArray(meetingIds, 10); // Firestore 'in' limit is 10
      const allMeetings: Meeting[] = [];

      for (const chunk of chunks) {
        const snapshot = await this.db
          .collection('meetings')
          .doc(uid)
          .collection('items')
          .where('id', 'in', chunk)
          .get();

        snapshot.forEach(doc => {
          allMeetings.push(doc.data() as Meeting);
        });
      }

      return allMeetings;
    } catch (error) {
      logger.error({ error, uid }, 'Failed to get meetings');
      throw error;
    }
  }

  // AI Briefings
  async getAIBriefing(uid: string, meetingId: string): Promise<AIBriefing | null> {
    try {
      const doc = await this.db
        .collection('meetings')
        .doc(uid)
        .collection('items')
        .doc(meetingId)
        .collection('ai')
        .doc('briefing')
        .get();

      if (!doc.exists) {
        return null;
      }
      return doc.data() as AIBriefing;
    } catch (error) {
      logger.error({ error, uid, meetingId }, 'Failed to get AI briefing');
      throw error;
    }
  }

  async saveAIBriefing(uid: string, meetingId: string, briefing: AIBriefing): Promise<void> {
    try {
      await this.db
        .collection('meetings')
        .doc(uid)
        .collection('items')
        .doc(meetingId)
        .collection('ai')
        .doc('briefing')
        .set(briefing, { merge: true });
    } catch (error) {
      logger.error({ error, uid, meetingId }, 'Failed to save AI briefing');
      throw error;
    }
  }

  // User Settings
  async getUserSettings(uid: string): Promise<UserSettings | null> {
    try {
      const doc = await this.db.collection('users').doc(uid).get();
      if (!doc.exists) {
        return null;
      }
      const data = doc.data();
      return data?.settings as UserSettings | null;
    } catch (error) {
      logger.error({ error, uid }, 'Failed to get user settings');
      throw error;
    }
  }

  async saveUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      await this.db.collection('users').doc(uid).set(
        { settings, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (error) {
      logger.error({ error, uid }, 'Failed to save user settings');
      throw error;
    }
  }

  async getUser(uid: string): Promise<Record<string, unknown> | null> {
    try {
      const doc = await this.db.collection('users').doc(uid).get();
      if (!doc.exists) {
        return null;
      }
      const data = doc.data();
      return data || null;
    } catch (error) {
      logger.error({ error, uid }, 'Failed to get user');
      throw error;
    }
  }

  // Utility
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

export const firestoreService = new FirestoreService();

