import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database (PostgreSQL via Prisma)
  DATABASE_URL: z.string(),
  
  // Firebase (for authentication only)
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  GOOGLE_CALENDAR_SCOPES: z.string().default('https://www.googleapis.com/auth/calendar.readonly'),
  
  // OpenAI
  OPENAI_API_KEY: z.string(),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // Optional
  ENRICHMENT_API_KEY: z.string().optional(),
  ENRICHMENT_PROVIDER: z.string().optional(),
  SESSION_SECRET: z.string().min(32).refine(
    (val) => val !== 'change-me-in-production',
    { message: 'SESSION_SECRET must be changed from default value' }
  ),
});

export type Environment = z.infer<typeof envSchema>;

let env: Environment;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach(err => {
      console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export { env };

