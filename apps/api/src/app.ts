import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger';
import { env } from './config/environment';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { googleRouter } from './routes/google';
import { meetingsRouter } from './routes/meetings';
import { settingsRouter } from './routes/settings';
import { healthRouter } from './routes/health';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
    message: {
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // CORS
  app.use(cors({
    origin: env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://localhost:5173'] // Specific dev origins
      : (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Logging
  app.use(pinoHttp({ logger }));

  // Health checks
  app.use('/health', healthRouter);

  // Routes
  app.use('/auth', authRouter);
  app.use('/google', googleRouter);
  app.use('/meetings', meetingsRouter);
  app.use('/', settingsRouter); // /me and /settings

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

