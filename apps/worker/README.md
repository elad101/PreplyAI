# PreplyAI Worker

Background worker for AI briefing generation using BullMQ, OpenAI, and Firestore.

## Features

- 🤖 Orchestrates AI enrichment pipeline
- 🏢 Company enrichment (logo, summary)
- 👥 Attendee enrichment (LinkedIn-aware, compliant)
- 💬 Talking points & icebreakers generation
- 📊 Job progress tracking and retry logic
- 💰 Cost-optimized OpenAI usage
- 🔒 Compliant: No LinkedIn scraping

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template from API or configure manually
# Edit .env with your credentials

# Start in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## How It Works

The worker listens to the `briefing-generation` queue and processes jobs:

1. Fetch meeting from Firestore
2. Enrich company info (logo, homepage, AI summary)
3. Enrich attendees (LinkedIn URLs from description, AI summaries)
4. Generate talking points and icebreakers
5. Save complete briefing to Firestore

## Job Configuration

- **Concurrency**: 5 jobs in parallel
- **Rate Limit**: 10 jobs per minute
- **Retries**: 5 attempts with exponential backoff
- **Timeout**: OpenAI requests have 30s timeout

## Cost Optimization

- Uses `gpt-4o-mini` for most tasks
- Conservative token limits
- Batches attendee processing
- Caches AI responses (handled by API)

## Monitoring

Worker emits structured logs for:
- Job started/completed/failed
- Enrichment steps
- OpenAI API calls
- Errors and retries

Use any log aggregation tool (e.g., Datadog, CloudWatch) to monitor.

## Production

Deploy as a separate service (container, K8s pod, Cloud Run job, etc.) and ensure:
- Redis connection is stable
- Firebase credentials are set
- OpenAI API key is valid
- Worker can scale horizontally

