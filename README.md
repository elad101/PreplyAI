# PreplyAI

AI-powered meeting preparation platform that generates intelligent briefings using Google Calendar integration and OpenAI.

## Overview

PreplyAI automatically enriches your upcoming meetings with:
- 🏢 **Company Intelligence**: Logo, domain, AI-generated summary
- 👥 **Attendee Profiles**: Professional summaries with confidence scores
- 💬 **Talking Points**: Context-aware discussion topics with rationale
- 🎯 **Icebreakers**: Thoughtful conversation starters

## Quick Links

- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Complete technical overview
- **[Setup Guide](./apps/SETUP.md)** - Step-by-step setup instructions
- **[API Documentation](./apps/README.md)** - API reference and usage
- **[Agent Guidelines](./AGENTS.md)** - Repository conventions for AI coding agents

## Project Structure

```
PreplyAI/
├── apps/                       # Backend services
│   ├── api/                   # Express REST API server
│   │   ├── src/
│   │   │   ├── config/       # Environment, Firebase, Redis, Logger
│   │   │   ├── middleware/   # Auth, error handling
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── services/     # Business logic (Google, Firestore, Queue)
│   │   │   ├── types/        # TypeScript types
│   │   │   └── utils/        # Helpers (cache, prompts, fingerprint)
│   │   └── package.json
│   │
│   ├── worker/                # BullMQ background worker
│   │   ├── src/
│   │   │   ├── config/       # Environment, Firebase, OpenAI, Logger
│   │   │   ├── services/     # AI, enrichment, Firestore
│   │   │   ├── workers/      # Job processors
│   │   │   └── types/        # TypeScript types
│   │   └── package.json
│   │
│   ├── README.md             # Apps documentation
│   ├── SETUP.md              # Detailed setup guide
│   └── package.json          # Monorepo scripts
│
├── prompts/                   # OpenAI prompt templates
│   ├── compay_summary.json
│   ├── attendee_summaries.json
│   └── talkingpoints_icebreakers.json
│
├── new UI/                    # Frontend (React + Vite)
│   └── src/
│
├── AGENTS.md                  # AI agent guidelines
├── IMPLEMENTATION_SUMMARY.md  # Technical summary
└── README.md                  # This file
```

## Technology Stack

### Backend
- **Node.js 18+** with TypeScript (strict mode)
- **Express.js** - REST API framework
- **Firebase Admin** - Authentication & Firestore
- **Google APIs** - Calendar OAuth & integration
- **OpenAI SDK** - GPT-4o, GPT-4o-mini
- **BullMQ** - Job queue with Redis
- **Pino** - Structured logging

### Infrastructure
- **Firestore** - Primary database
- **Redis** - Cache & job queue
- **Firebase Auth** - User authentication
- **Google Calendar API** - Event data
- **OpenAI API** - AI generation
- **Clearbit API** - Company logos

## Getting Started

### Prerequisites

- Node.js 18+
- Redis 7+
- Firebase project
- Google Cloud project (Calendar API enabled)
- OpenAI API key

### Installation

```bash
# Clone repository
git clone <repo-url>
cd PreplyAI

# Install dependencies
cd apps
npm run install:all

# Configure environment
cp apps/api/env.example.txt apps/api/.env
cp apps/worker/env.example.txt apps/worker/.env
# Edit .env files with your credentials
```

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

API runs on `http://localhost:3000`

### Testing

```bash
cd apps
npm run test:all      # Run all tests
npm run lint:all      # Lint all code
npm run type-check:all # Type check all code
```

## API Usage Example

```bash
# 1. Authenticate with Firebase
curl -X POST http://localhost:3000/auth/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken":"<firebase-token>"}'

# 2. Connect Google Calendar
curl -X POST http://localhost:3000/google/connect \
  -H "Authorization: Bearer <firebase-token>"
# Follow returned authUrl, then:
curl -X POST http://localhost:3000/google/connection \
  -H "Authorization: Bearer <firebase-token>" \
  -H "Content-Type: application/json" \
  -d '{"code":"<oauth-code>"}'

# 3. Fetch meetings
curl http://localhost:3000/meetings?from=2025-10-01T00:00:00Z&to=2025-10-31T23:59:59Z \
  -H "Authorization: Bearer <firebase-token>"

# 4. Generate briefing
curl -X POST http://localhost:3000/meetings/<meeting-id>/generate \
  -H "Authorization: Bearer <firebase-token>"

# 5. Get briefing result
curl http://localhost:3000/meetings/<meeting-id> \
  -H "Authorization: Bearer <firebase-token>"
```

## Architecture

```
┌──────────┐
│  Client  │ (Firebase Auth)
└────┬─────┘
     │ HTTPS + ID Token
     ▼
┌──────────────┐      ┌──────────────┐
│  API Server  │─────▶│  Firestore   │
│  (Express)   │      │  (Database)  │
└──────┬───────┘      └──────────────┘
       │
       │ Enqueue Job
       ▼
┌──────────────┐      ┌──────────────┐
│    Redis     │◀────▶│    Worker    │
│   (BullMQ)   │      │   Process    │
└──────────────┘      └──────┬───────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Google Cal   │    │   OpenAI     │    │  Clearbit    │
│     API      │    │     API      │    │     API      │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Features

### Completed ✅
- Firebase authentication & user management
- Google Calendar OAuth 2.0 flow
- Meeting list & detail endpoints with caching
- BullMQ job queue with Redis
- Background worker for AI generation
- Company enrichment (logo, summary)
- Attendee enrichment (LinkedIn-aware)
- Talking points & icebreakers generation
- Cost-optimized OpenAI usage
- Structured logging & error handling
- TypeScript strict mode
- Unit tests

### Roadmap 🚀
- Bull Board UI for job monitoring
- Redis-based AI response caching
- Webhook notifications
- Multi-language support
- Custom prompt templates per user
- CRM integrations (Salesforce, HubSpot)
- Post-meeting notes summarization

## Configuration

### User Settings

Users can customize their experience:

```typescript
{
  briefingQuality: 'compact' | 'standard' | 'deep',  // AI model & token budget
  enableLinkedInEnrichment: boolean,                 // Extract LinkedIn URLs
  notificationsEnabled: boolean                      // Future: webhook alerts
}
```

### Cost Control

- **Compact**: ~$0.002/briefing (gpt-4o-mini, 500 tokens)
- **Standard**: ~$0.004/briefing (gpt-4o-mini, 1000 tokens)
- **Deep**: ~$0.02/briefing (gpt-4o, 2000 tokens)

Worker limits:
- Max 5 attendees per meeting
- 10 jobs per minute
- 5 concurrent workers

## Security & Compliance

- ✅ No LinkedIn web scraping (only user-provided URLs)
- ✅ Respects robots.txt on homepage fetching
- ✅ Firebase authentication on all endpoints
- ✅ User-scoped data access (Firestore rules)
- ✅ CORS & Helmet security headers
- ✅ Structured error logging with trace IDs
- ✅ Environment-based secrets (no hardcoded keys)

## Documentation

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Full technical docs
- **[apps/SETUP.md](./apps/SETUP.md)** - Setup & troubleshooting
- **[apps/README.md](./apps/README.md)** - API reference
- **[apps/api/README.md](./apps/api/README.md)** - API server docs
- **[apps/worker/README.md](./apps/worker/README.md)** - Worker docs
- **[AGENTS.md](./AGENTS.md)** - Repo conventions

## Contributing

This repository follows the conventions in [AGENTS.md](./AGENTS.md):

- TypeScript with strict typing
- No mock data (always fetch real data)
- Early returns and explicit error handling
- Structured logging (Pino)
- Tests required for new features
- Lint & type-check before committing

## Support

For setup issues, see [apps/SETUP.md](./apps/SETUP.md) troubleshooting section.

For API questions, refer to [apps/README.md](./apps/README.md).

## License

See [LICENSE](./LICENSE) file.

---

**Built with** ❤️ using Node.js, TypeScript, Firebase, OpenAI, and BullMQ.
