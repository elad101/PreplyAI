import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';

// Common validation schemas
export const meetingQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export const meetingIdSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
});

export const userSettingsSchema = z.object({
  briefingQuality: z.enum(['compact', 'standard', 'deep']).optional(),
  enableLinkedInEnrichment: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  notifications: z.object({
    meetingReminders: z.boolean().optional(),
    briefingReady: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
  }).optional(),
  aiPreferences: z.object({
    autoGenerate: z.boolean().optional(),
    includeCompanyResearch: z.boolean().optional(),
    includeCompetitiveInsights: z.boolean().optional(),
  }).optional(),
});

// Generic validation middleware factory
export function validate(schema: z.ZodSchema, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = target === 'body' ? req.body : 
                   target === 'query' ? req.query : req.params;
      
      const validatedData = schema.parse(data);
      
      // Replace the original data with validated data
      if (target === 'body') req.body = validatedData;
      else if (target === 'query') req.query = validatedData;
      else req.params = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({ 
          error: error.errors, 
          target,
          path: req.path,
          method: req.method 
        }, 'Validation failed');
        
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
        return;
      }
      
      logger.error({ error }, 'Validation middleware error');
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation failed',
      });
    }
  };
}

// Input sanitization
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  try {
    // Sanitize string inputs to prevent XSS
    const sanitizeString = (str: string): string => {
      return str
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
    };

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') {
          return sanitizeString(obj);
        } else if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        } else if (obj && typeof obj === 'object') {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
          }
          return sanitized;
        }
        return obj;
      };
      
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          (req.query as any)[key] = sanitizeString(value);
        }
      }
    }

    next();
  } catch (error) {
    logger.error({ error }, 'Input sanitization error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Request processing failed',
    });
  }
}
