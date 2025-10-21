# PreplyAI Apps

This directory contains the PreplyAI backend services.

## Structure

- `api/` - REST API server with Firebase auth, Google Calendar integration, and job queue management
- `worker/` - Background worker for AI briefing generation using OpenAI

## Prerequisites

- Node.js >= 18
- Redis (for BullMQ job queue)
- Firebase project with Firestore enabled
- Google Cloud project with Calendar API enabled
- OpenAI API key

## Setup

### 1. Install Dependencies

```bash
# API
cd apps/api
npm install

# Worker
cd apps/worker
npm install
```

### 2. Environment Configuration

Both `api` and `worker` require environment variables. Create `.env` files in each directory:

**apps/api/.env**
```env
PORT=3000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/google/callback
GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar.readonly

# OpenAI
OPENAI_API_KEY=sk-...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

**apps/worker/.env**
```env
NODE_ENV=development

# Firebase (same as API)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OpenAI
OPENAI_API_KEY=sk-...

# Redis (same as API)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or using Homebrew (macOS)
brew install redis
brew services start redis
```

## Development

### Start API Server

```bash
cd apps/api
npm run dev
```

API will be available at `http://localhost:3000`

### Start Worker

```bash
cd apps/worker
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/firebase` - Validate Firebase ID token

### Google OAuth
- `POST /google/connect` - Generate Google OAuth URL
- `GET /google/callback` - OAuth callback (handled by client)
- `POST /google/connection` - Store OAuth tokens after callback
- `GET /google/status` - Check connection status

### Meetings
- `GET /meetings?from=<ISO>&to=<ISO>` - List meetings (with 15min cache)
- `GET /meetings/:id` - Get meeting details with AI briefing
- `POST /meetings/:id/generate` - Enqueue briefing generation (202 Accepted)

### User Settings
- `GET /me` - Get user profile and settings
- `PATCH /settings` - Update user settings

### Settings Options
```json
{
  "briefingQuality": "compact" | "standard" | "deep",
  "enableLinkedInEnrichment": boolean,
  "notificationsEnabled": boolean
}
```

## AI Briefing Pipeline

The worker performs these steps:

1. **Company Enrichment**
   - Infer domain from organizer/attendees
   - Fetch logo via Clearbit
   - Fetch homepage snippet (for context)
   - Generate AI summary using OpenAI

2. **Attendee Enrichment**
   - Extract LinkedIn URLs from meeting description (if enabled)
   - Generate AI summaries for each attendee
   - Label confidence scores

3. **Talking Points & Icebreakers**
   - Combine meeting context, company, and attendees
   - Generate 5-7 talking points with rationale
   - Generate 5-7 icebreakers with rationale
   - Include confidence and sources

## Cost Optimization

The system implements several strategies to minimize OpenAI costs:

- **Model Selection**: Uses `gpt-4o-mini` for compact/standard quality, `gpt-4o` only for deep
- **Token Limits**: Conservative `max_tokens` based on quality setting
- **Temperature**: Low (0.2) for extraction, moderate (0.6) for creative tasks
- **Batching**: Processes multiple attendees efficiently
- **Caching**: 15-minute cache on Calendar data to avoid redundant API calls
- **Job Deduplication**: Prevents duplicate briefing generation jobs
- **Rate Limiting**: Worker processes max 10 jobs per minute

## Testing

```bash
# API tests
cd apps/api
npm test

# Worker tests
cd apps/worker
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## Production Deployment

### Build

```bash
# API
cd apps/api
npm run build

# Worker
cd apps/worker
npm run build
```

### Run

```bash
# API
cd apps/api
npm start

# Worker
cd apps/worker
npm start
```

## Monitoring

- Worker logs job completion/failure with structured logging (pino)
- Job progress is tracked in BullMQ and stored in Firestore
- Failed jobs are retried with exponential backoff (up to 5 attempts)

## Security & Compliance

- ✅ No direct LinkedIn scraping
- ✅ LinkedIn URLs must be user-provided (in meeting description)
- ✅ Homepage fetching respects robots.txt and rate limits
- ✅ All sensitive data stored in Firestore with Firebase security rules
- ✅ API authenticated via Firebase ID tokens
- ✅ CORS configured for production origins

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP + Firebase Token
       ▼
┌─────────────┐      ┌──────────────┐
│  API Server │─────▶│  Firestore   │
└──────┬──────┘      └──────────────┘
       │ Enqueue Job
       ▼
┌─────────────┐      ┌──────────────┐
│  Redis      │◀─────│   Worker     │
│  (BullMQ)   │      │   Process    │
└─────────────┘      └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   OpenAI     │
                     │  Clearbit    │
                     └──────────────┘
```

## Troubleshooting

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping`
- Check connection settings in `.env`

### Firebase Auth Errors
- Verify service account credentials
- Check Firebase project ID
- Ensure Firestore is enabled

### OpenAI Rate Limits
- Worker has built-in rate limiting (10 jobs/min)
- Adjust worker concurrency if needed
- Monitor usage in OpenAI dashboard

## License

See LICENSE file in repository root.

