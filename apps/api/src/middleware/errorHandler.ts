import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const traceId = randomUUID();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  logger.error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      traceId,
      method: req.method,
      path: req.path,
    },
    'Request error'
  );

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: error.errors,
      traceId,
    });
    return;
  }

  // Default error response - sanitize for production
  const statusCode = (error as { statusCode?: number }).statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;
  
  res.status(statusCode).json({
    error: error.name || 'Internal Server Error',
    message: isClientError || isDevelopment 
      ? (error.message || 'An unexpected error occurred')
      : 'An unexpected error occurred',
    ...(isDevelopment && { traceId }),
  });
}

export function notFoundHandler(
  req: Request,
  res: Response
): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}

