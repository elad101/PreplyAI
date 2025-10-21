import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase';
import { logger } from '../config/logger';
import type { AuthenticatedRequest } from '../types';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing ID token',
      });
      return;
    }

    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Attach user info to request
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = decodedToken;
    authenticatedReq.uid = decodedToken.uid;
    
    logger.debug({ uid: decodedToken.uid }, 'User authenticated');
    next();
  } catch (error) {
    logger.warn({ error }, 'Authentication failed');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

