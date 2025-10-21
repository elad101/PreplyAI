import { getFirestore } from '../config/firebase';
import { logger } from '../config/logger';
import type { Meeting, AIBriefing } from '../types';

export class FirestoreService {
  private db = getFirestore();

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

  async saveAIBriefing(uid: string, meetingId: string, briefing: Partial<AIBriefing>): Promise<void> {
    try {
      await this.db
        .collection('meetings')
        .doc(uid)
        .collection('items')
        .doc(meetingId)
        .collection('ai')
        .doc('briefing')
        .set(briefing, { merge: true });
      
      logger.debug({ uid, meetingId }, 'Saved AI briefing');
    } catch (error) {
      logger.error({ error, uid, meetingId }, 'Failed to save AI briefing');
      throw error;
    }
  }

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
}

export const firestoreService = new FirestoreService();

