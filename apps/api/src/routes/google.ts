import { Router, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { googleService } from '../services/google';
import { databaseService } from '../services/database';
import { logger } from '../config/logger';
import type { AuthenticatedRequest } from '../types';

export const googleRouter = Router();

googleRouter.post('/connect', requireAuth, async (req, res: Response, _next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const authUrl = googleService.generateAuthUrl(authReq.uid);

    logger.info({ uid: authReq.uid }, 'Generated Google OAuth URL');

    res.json({
      authUrl,
    });
  } catch (error) {
    logger.error({ error, uid: authReq.uid }, 'Failed to generate auth URL');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate authorization URL',
    });
  }
});

googleRouter.get('/callback', async (req, res: Response, _next: NextFunction) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing authorization code',
      });
      return;
    }

    // Extract uid from state parameter (passed during /connect)
    let uid: string;
    if (state && typeof state === 'string') {
      uid = state;
    } else {
      // Fallback: if no state, we can't determine which user this is for
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing state parameter - cannot determine user',
      });
      return;
    }

    // Exchange code for tokens
    const connection = await googleService.exchangeCode(code);
    
    // Store the connection in database
    await databaseService.saveGoogleConnection(uid, connection);

    logger.info({ uid }, 'Google Calendar connection stored successfully');

    res.json({
      ok: true,
      message: 'Google account connected successfully',
    });
  } catch (error) {
    logger.error({ error, code: req.query.code, state: req.query.state }, 'Failed to handle OAuth callback');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to complete OAuth flow',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper endpoint to store connection after callback
googleRouter.post('/connection', requireAuth, async (req, res: Response, _next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { code } = authReq.body;

    if (!code) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing authorization code',
      });
      return;
    }

    const connection = await googleService.exchangeCode(code);
    await databaseService.saveGoogleConnection(authReq.uid, connection);

    logger.info({ uid: authReq.uid }, 'Google account connected');

    res.json({
      ok: true,
      message: 'Google account connected successfully',
    });
  } catch (error) {
    logger.error({ error, uid: authReq.uid }, 'Failed to save Google connection');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to connect Google account',
    });
  }
});

googleRouter.get('/status', requireAuth, async (req, res: Response, _next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const connection = await databaseService.getGoogleConnection(authReq.uid);

    res.json({
      connected: !!connection,
      scopes: connection?.scopes || [],
    });
  } catch (error) {
    logger.error({ error, uid: authReq.uid }, 'Failed to get connection status');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get connection status',
    });
  }
});

