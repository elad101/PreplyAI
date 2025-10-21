import { Router, Response } from 'express';
import { getAuth } from '../config/firebase';
import { logger } from '../config/logger';
import { requireAuth } from '../middleware/auth';
import type { AuthenticatedRequest } from '../types';

export const authRouter = Router();

authRouter.post('/firebase', async (req, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing idToken in request body',
      });
      return;
    }

    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    logger.info({ uid: decodedToken.uid }, 'User authenticated via Firebase');

    res.json({
      ok: true,
      uid: decodedToken.uid,
      user: {
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
      },
    });
  } catch (error) {
    logger.warn({ error }, 'Firebase authentication failed');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid Firebase ID token',
    });
  }
});

// Signout endpoint (client-side only - just returns success)
authRouter.post('/signout', async (_req, res: Response) => {
  try {
    logger.info('User signed out');
    res.json({
      ok: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    logger.warn({ error }, 'Signout failed');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to sign out',
    });
  }
});

// Get current user info (requires authentication)
authRouter.get('/me', requireAuth, async (req, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    res.json({
      ok: true,
      uid: authReq.uid,
      user: {
        email: authReq.user.email,
        name: authReq.user.name,
        picture: authReq.user.picture,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get user info');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user info',
    });
  }
});

