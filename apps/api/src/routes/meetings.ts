import { Router, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate, sanitizeInput, meetingQuerySchema, meetingIdSchema } from '../middleware/validation';
import { googleService } from '../services/google';
import { databaseService } from '../services/database';
import { cacheService } from '../utils/cache';
import { enqueueBriefingGeneration } from '../services/queue';
import { logger } from '../config/logger';
import { UserSettingsSchema } from '../types';
import type { AuthenticatedRequest } from '../types';

export const meetingsRouter = Router();

const CACHE_TTL_MINUTES = 15;
const CACHE_TTL_SECONDS = CACHE_TTL_MINUTES * 60;

meetingsRouter.get('/', requireAuth, sanitizeInput, validate(meetingQuerySchema, 'query'), async (req, res: Response, _next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { from, to } = authReq.query;

    if (!from || !to) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required query parameters: from, to',
      });
      return;
    }

    const cacheKey = cacheService.buildKey('meetings', authReq.uid, from as string, to as string);
    
    // Check cache
    const cached = await cacheService.get<{ meetings: any[]; cachedAt: string }>(cacheKey);
    
    if (cached) {
      const cacheAge = Date.now() - new Date(cached.cachedAt).getTime();
      const cacheAgeMinutes = cacheAge / 1000 / 60;
      
      if (cacheAgeMinutes <= CACHE_TTL_MINUTES) {
        logger.debug({ uid: authReq.uid, cacheAgeMinutes }, 'Returning cached meetings');
        res.json({
          meetings: cached.meetings,
          cached: true,
          cachedAt: cached.cachedAt,
        });
        return;
      }
    }

    // Fetch from Google Calendar
    logger.debug({ uid: authReq.uid, from, to }, 'Fetching meetings from Google Calendar');
    const meetings = await googleService.listCalendarEvents(
      authReq.uid,
      from as string,
      to as string
    );

    // Store each meeting in database
    await Promise.all(
      meetings.map(meeting => databaseService.saveMeeting(authReq.uid, meeting))
    );

    // Fetch AI briefing data for each meeting
    const meetingsWithBriefing = await Promise.all(
      meetings.map(async (meeting) => {
        try {
          const briefing = await databaseService.getAIBriefing(authReq.uid, meeting.id);
          return {
            ...meeting,
            briefing: briefing || null,
          };
        } catch (error) {
          logger.warn({ error, uid: authReq.uid, meetingId: meeting.id }, 'Failed to fetch briefing for meeting');
          return {
            ...meeting,
            briefing: null,
          };
        }
      })
    );

    // Cache the list
    const now = new Date().toISOString();
    await cacheService.set(
      cacheKey,
      { meetings: meetingsWithBriefing, cachedAt: now },
      CACHE_TTL_SECONDS
    );

    res.json({
      meetings: meetingsWithBriefing,
      cached: false,
      cachedAt: now,
    });
  } catch (error) {
    logger.error({ 
      error: error instanceof Error ? error.message : error,
      errorStack: error instanceof Error ? error.stack : undefined,
      uid: authReq.uid 
    }, 'Failed to get meetings');
    
    if (error instanceof Error && error.message.includes('not connected')) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Google account not connected',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch meetings',
    });
  }
});

meetingsRouter.get('/:id', requireAuth, sanitizeInput, validate(meetingIdSchema, 'params'), async (req, res: Response, _next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { id } = authReq.params;

    // Check cached/stored meeting
    let meeting = await databaseService.getMeeting(authReq.uid, id);

    if (meeting) {
      const cacheAge = Date.now() - new Date(meeting.lastFetchedAt).getTime();
      const cacheAgeMinutes = cacheAge / 1000 / 60;

      // If cache is stale, refresh from Calendar
      if (cacheAgeMinutes > CACHE_TTL_MINUTES) {
        logger.debug({ uid: authReq.uid, meetingId: id }, 'Refreshing stale meeting from Calendar');
        try {
          meeting = await googleService.getCalendarEvent(authReq.uid, id);
          await databaseService.saveMeeting(authReq.uid, meeting);
        } catch (error) {
          logger.warn({ error, uid: authReq.uid, meetingId: id }, 'Failed to refresh meeting, using cached');
          // Use cached version if refresh fails
        }
      }
    } else {
      // Fetch from Calendar if not cached
      logger.debug({ uid: authReq.uid, meetingId: id }, 'Fetching meeting from Calendar');
      meeting = await googleService.getCalendarEvent(authReq.uid, id);
      await databaseService.saveMeeting(authReq.uid, meeting);
    }

    // Get AI briefing if exists
    const aiBriefing = await databaseService.getAIBriefing(authReq.uid, id);

    res.json({
      meeting,
      ai: aiBriefing,
    });
  } catch (error) {
    logger.error({ error, uid: authReq.uid, meetingId: authReq.params.id }, 'Failed to get meeting');

    if (error instanceof Error && error.message.includes('not connected')) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Google account not connected',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch meeting',
    });
  }
});

meetingsRouter.post('/:id/generate', requireAuth, async (req, res: Response, _next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { id } = authReq.params;

    // Get user settings
    let settings = await databaseService.getUserSettings(authReq.uid);
    if (!settings) {
      settings = UserSettingsSchema.parse({});
    }

    // Enqueue briefing generation job
    console.log('🚀 About to enqueue briefing generation job...');
    const jobId = await enqueueBriefingGeneration({
      uid: authReq.uid,
      meetingId: id,
      settings,
    });
    console.log('✅ Job enqueued successfully with ID:', jobId);

    // Mark briefing as processing
    await databaseService.saveAIBriefing(authReq.uid, id, {
      status: 'processing',
      jobId,
      lastGeneratedAt: new Date().toISOString(),
    });

    logger.info({ uid: authReq.uid, meetingId: id, jobId }, 'Briefing generation enqueued');

    res.status(202).json({
      ok: true,
      jobId,
      message: 'Briefing generation started',
    });
  } catch (error) {
    logger.error({ error, uid: authReq.uid, meetingId: authReq.params.id }, 'Failed to enqueue briefing generation');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to start briefing generation',
    });
  }
});

