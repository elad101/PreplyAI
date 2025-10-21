# PreplyAI Backend Implementation Summary

## Overview

This document summarizes the complete backend implementation for PreplyAI - a meeting preparation AI system that generates intelligent briefings for upcoming meetings using Google Calendar integration and OpenAI.

## What Was Built

### Core Applications

1. **`apps/api`** - REST API Server
   - Express + TypeScript server
   - Firebase Authentication (ID token verification)
   - Google OAuth 2.0 flow for Calendar access
   - BullMQ job queue orchestration
   - Firestore data persistence
   - Redis caching (15-minute TTL)

2. **`apps/worker`** - Background Worker
   - BullMQ consumer for AI generation jobs
   - OpenAI integration for enrichment pipeline
   - Company information enrichment
   - Attendee profile enrichment
   - Talking points & icebreakers generation
   - Cost-optimized AI usage

## Architecture

```
Client (Firebase Auth)
    ↓
API Server (Express + TypeScript)
    ↓
Google Calendar API ← OAuth 2.0
    ↓
Redis (Cache + Queue) ← BullMQ
    ↓
Worker Process
    ↓
OpenAI API + Clearbit + Web Scraping
    ↓
Firestore (Persistence)
```

## Key Features

### Authentication & Authorization
- Firebase ID token verification on every request
- Middleware-based auth (`requireAuth`)
- User-scoped data access in Firestore

### Google Calendar Integration
- OAuth 2.0 flow with offline access
- Automatic token refresh
- Event list caching (15 minutes)
- Meeting detail fetching
- Connection status tracking

### AI Briefing Generation Pipeline

**1. Company Enrichment**
- Domain inference from meeting organizer/attendees
- Logo fetching via Clearbit API
- Homepage snippet extraction (compliant, no scraping violations)
- OpenAI summary generation

**2. Attendee Enrichment**
- LinkedIn URL extraction from meeting description
- Compliant enrichment (no direct scraping)
- AI-generated professional summaries
- Confidence scoring

**3. Talking Points & Icebreakers**
- Context-aware generation using meeting + company + attendees
- 5-7 tactical talking points with rationale
- 5-7 icebreakers with "why it works" explanation
- Source attribution and confidence scores

### Cost Optimization

The system implements aggressive cost controls:

- **Model Selection**: `gpt-4o-mini` for most tasks (compact/standard), `gpt-4o` only for "deep"
- **Token Limits**: Conservative `max_tokens` based on quality setting
- **Temperature**: 0.18-0.35 for deterministic extraction
- **Batching**: Processes up to 5 attendees per meeting
- **Caching**: 15-minute Calendar data cache, 24-72h AI response cache keys
- **Rate Limiting**: Worker processes max 10 jobs/minute
- **Prompt Efficiency**: Uses JSON output format, concise system messages

### Job Queue Architecture

**Why BullMQ?**
- Avoids Cloud Run/serverless timeouts
- Enables horizontal scaling
- Provides retry logic with exponential backoff
- Job deduplication prevents duplicate work
- Progress tracking and status updates

**Worker Configuration**
- Concurrency: 5 jobs in parallel
- Rate limit: 10 jobs per minute
- Retries: 5 attempts with exponential backoff
- Job persistence: 100 completed jobs kept for 24h

## API Endpoints

### Authentication
```
POST /auth/firebase
Body: { idToken: string }
Returns: { ok: true, uid: string }
```

### Google OAuth
```
POST /google/connect
Headers: Authorization: Bearer <firebase-token>
Returns: { authUrl: string }

POST /google/connection
Body: { code: string }
Returns: { ok: true }

GET /google/status
Returns: { connected: boolean, scopes: string[] }
```

### Meetings
```
GET /meetings?from=<ISO>&to=<ISO>
Returns: { meetings: Meeting[], cached: boolean, cachedAt: string }

GET /meetings/:id
Returns: { meeting: Meeting, ai: AIBriefing | null }

POST /meetings/:id/generate
Returns: 202 Accepted { ok: true, jobId: string }
```

### User Settings
```
GET /me
Returns: { uid, email, settings: UserSettings }

PATCH /settings
Body: Partial<UserSettings>
Returns: { ok: true, settings: UserSettings }
```

### Settings Schema
```typescript
{
  briefingQuality: 'compact' | 'standard' | 'deep',
  enableLinkedInEnrichment: boolean,
  notificationsEnabled: boolean
}
```

## Data Models (Firestore)

### Collections Structure

```
users/{uid}
  - settings: UserSettings
  - createdAt, updatedAt

connections/{uid}/providers/google
  - accessToken, refreshToken, expiryDate
  - scopes, createdAt, updatedAt

meetings/{uid}/items/{meetingId}
  - id, summary, description, location
  - startTime, endTime, organizer, attendees
  - conferenceData, htmlLink
  - cachedAt, lastFetchedAt

meetings/{uid}/items/{meetingId}/ai/briefing
  - status: 'processing' | 'completed' | 'failed'
  - jobId, lastGeneratedAt, model
  - company: { domain, name, logo, summary, confidence }
  - attendees: [{ email, displayName, linkedInUrl, summary, confidence }]
  - talkingPoints: [{ point, rationale, confidence, sources }]
  - icebreakers: [{ icebreaker, rationale, confidence, sources }]
```

## Security & Compliance

### Implemented Safeguards

✅ **No LinkedIn Scraping**: Only uses user-provided LinkedIn URLs from meeting descriptions
✅ **Robots.txt Respect**: Homepage fetching includes proper User-Agent and limits
✅ **Rate Limiting**: Built-in rate limits to prevent abuse
✅ **Firebase Security**: All data scoped to authenticated user's UID
✅ **CORS**: Configurable allowed origins for production
✅ **Helmet**: Security headers on all responses
✅ **Token Expiry**: Automatic Google token refresh
✅ **Error Handling**: Structured error responses with trace IDs

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Use managed Redis (Cloud Memorystore, ElastiCache)
- [ ] Enable Firestore security rules
- [ ] Set up health checks (Cloud Run, K8s)
- [ ] Monitor OpenAI usage and costs
- [ ] Configure log aggregation
- [ ] Set up auto-scaling for worker
- [ ] Enable HTTPS/SSL
- [ ] Review error alerting

## Technology Stack

### API Server
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Auth**: Firebase Admin SDK
- **Validation**: Zod schemas
- **Logging**: Pino (structured JSON logs)
- **Queue**: BullMQ
- **Cache**: Redis
- **Security**: Helmet, CORS
- **HTTP Client**: Axios

### Worker
- **Runtime**: Node.js 18+
- **Language**: TypeScript (strict mode)
- **Queue**: BullMQ (consumer)
- **AI**: OpenAI SDK (GPT-4o-mini, GPT-4o)
- **Database**: Firestore (Firebase Admin)
- **Logging**: Pino

### Infrastructure
- **Database**: Cloud Firestore
- **Cache/Queue**: Redis 7+
- **Auth**: Firebase Authentication
- **Calendar**: Google Calendar API v3
- **AI**: OpenAI GPT-4o family
- **Enrichment**: Clearbit Logo API

## Testing

### Test Coverage

- Unit tests for utilities (prompts, enrichment, fingerprinting)
- Integration test placeholders for services
- Type checking via `tsc --noEmit`
- Linting via ESLint

### Running Tests

```bash
# API tests
cd apps/api
npm test

# Worker tests
cd apps/worker
npm test

# All tests
cd apps
npm run test:all
```

## Deployment

### Development

```bash
# Terminal 1: Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Terminal 2: Start API
cd apps/api
npm run dev

# Terminal 3: Start Worker
cd apps/worker
npm run dev
```

### Production

**Build**
```bash
cd apps
npm run build:all
```

**Deploy**
- API: Cloud Run, App Engine, K8s, EC2, etc.
- Worker: Cloud Run Jobs, K8s CronJob, ECS Task, etc.
- Redis: Cloud Memorystore, ElastiCache, Redis Cloud

**Environment Variables**
- See `apps/api/env.example.txt`
- See `apps/worker/env.example.txt`

## Monitoring & Observability

### Logs
- Structured JSON logs via Pino
- Request/response logging with pino-http
- Error logs with stack traces and trace IDs
- Job lifecycle events (started, completed, failed)

### Metrics (Recommended)
- Job queue depth (BullMQ metrics)
- Job success/failure rates
- OpenAI token usage
- API response times
- Cache hit/miss rates

### Alerting (Recommended)
- Failed jobs exceeding threshold
- OpenAI API errors
- Redis connection failures
- High queue depth

## Cost Estimates

### OpenAI Usage (per briefing)

**Compact Quality** (default)
- Model: gpt-4o-mini
- Company summary: ~200 tokens → $0.0003
- Attendee summaries (5): ~750 tokens → $0.0011
- Talking points: ~450 tokens → $0.0007
- **Total: ~$0.0021 per briefing**

**Standard Quality**
- Model: gpt-4o-mini
- **Total: ~$0.0040 per briefing**

**Deep Quality**
- Model: gpt-4o
- **Total: ~$0.02-0.03 per briefing**

### Other Costs
- Redis: Minimal (cache + queue)
- Firestore: Read/write operations, storage
- Cloud Run: Per-request + CPU time
- Google Calendar API: Free (quota limits)

## Customization Guide

### Adding New Prompt Templates

1. Create JSON file in `prompts/`
2. Follow existing format with `messages`, `model`, `max_tokens`, `temperature`
3. Use `{{variable}}` syntax for interpolation
4. Load via `promptLoader.load('template-name')`

### Adjusting Cost/Quality Tradeoffs

Edit `apps/worker/src/config/openai.ts`:
```typescript
export function getModelForQuality(quality: 'compact' | 'standard' | 'deep'): string {
  switch (quality) {
    case 'compact':
      return 'gpt-4o-mini'; // Change model here
    // ...
  }
}
```

### Adding New Enrichment Providers

1. Create service in `apps/worker/src/services/`
2. Add API key to environment config
3. Update enrichment logic in `briefingWorker.ts`
4. Add feature flag in user settings

## Known Limitations

1. **Attendee Limit**: Processes max 5 attendees per meeting (cost control)
2. **LinkedIn**: Only uses URLs from meeting description (no scraping)
3. **Company Detection**: Limited to email domain inference
4. **Cache TTL**: 15-minute Calendar cache may miss very recent changes
5. **Job Deduplication**: One active briefing job per meeting at a time

## Future Enhancements

- [ ] Bull Board UI for job monitoring
- [ ] Redis caching for AI responses (with TTL)
- [ ] Support for recurring meeting templates
- [ ] Webhook notifications when briefing completes
- [ ] Multi-language support
- [ ] Custom prompt templates per user
- [ ] Integration with CRM systems (Salesforce, HubSpot)
- [ ] Meeting notes summarization (post-meeting)

## Support & Troubleshooting

See [apps/SETUP.md](./apps/SETUP.md) for detailed setup instructions and troubleshooting guide.

### Common Issues

**Redis Connection Errors**
- Ensure Redis is running: `redis-cli ping`
- Check REDIS_HOST/PORT in .env

**Firebase Auth Errors**
- Verify private key has proper `\n` newlines
- Check project ID matches
- Ensure Firestore is enabled

**OpenAI Rate Limits**
- Worker has 10 jobs/min limit built-in
- Check API quota in OpenAI dashboard
- Consider upgrading OpenAI plan

## License

See LICENSE file in repository root.

---

**Built with**: Node.js, TypeScript, Express, Firebase, OpenAI, BullMQ, Redis, Firestore
**Date**: October 2025
**Version**: 1.0.0

