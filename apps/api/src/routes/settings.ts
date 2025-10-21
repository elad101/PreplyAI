import { Router, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate, sanitizeInput, userSettingsSchema } from '../middleware/validation';
import { databaseService } from '../services/database';
import { logger } from '../config/logger';
import { UserSettingsSchema } from '../types';
import type { AuthenticatedRequest } from '../types';

export const settingsRouter = Router();

settingsRouter.get('/me', requireAuth, async (req, res: Response, _next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const user = await databaseService.getUser(authReq.uid);
    
    if (!user) {
      // Create default user record
      const defaultSettings = UserSettingsSchema.parse({});
      await databaseService.saveUserSettings(authReq.uid, defaultSettings);
      
      res.json({
        uid: authReq.uid,
        email: authReq.user.email,
        settings: defaultSettings,
      });
      return;
    }

    res.json({
      uid: authReq.uid,
      email: authReq.user.email,
      ...user,
    });
  } catch (error) {
    logger.error({ error, uid: authReq.uid }, 'Failed to get user profile');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user profile',
    });
  }
});

settingsRouter.patch('/settings', requireAuth, sanitizeInput, validate(userSettingsSchema), async (req, res: Response, _next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    // Validate settings
    const validatedSettings = UserSettingsSchema.partial().parse(authReq.body);

    await databaseService.saveUserSettings(authReq.uid, validatedSettings);

    logger.info({ uid: authReq.uid, settings: validatedSettings }, 'User settings updated');

    res.json({
      ok: true,
      settings: validatedSettings,
    });
  } catch (error) {
    logger.error({ error, uid: authReq.uid }, 'Failed to update settings');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update settings',
    });
  }
});

