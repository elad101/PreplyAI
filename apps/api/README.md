# PreplyAI API

Node.js + Express + TypeScript API server with Firebase authentication, Google Calendar integration, and AI briefing generation orchestration.

## Features

- 🔐 Firebase Authentication with ID token verification
- 📅 Google Calendar OAuth flow and event fetching
- 🤖 AI briefing generation job queue (BullMQ)
- 💾 Firestore persistence
- ⚡ Redis caching (15min TTL for meetings)
- 🔒 Security: Helmet, CORS, rate limiting
- 📊 Structured logging with Pino

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your credentials

# Start in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## API Reference

See [apps/README.md](../README.md) for full API documentation.

## Environment Variables

See `.env.example` for required configuration.

## Development

The API server runs on port 3000 by default. Hot reload is enabled with `tsx watch`.

## Production

Set `NODE_ENV=production` and configure:
- `ALLOWED_ORIGINS` for CORS
- Secure Redis connection
- Production Firebase credentials
- Health checks for Cloud Run / K8s

