# PreplyAI Setup Guide

This guide will help you set up the PreplyAI backend services from scratch.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Redis installed and running
- [ ] Firebase project created
- [ ] Google Cloud project created
- [ ] OpenAI API key obtained

## Step-by-Step Setup

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode (configure security rules later)
4. Generate service account credentials:
   - Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
5. Extract credentials from JSON for `.env`:
   ```
   FIREBASE_PROJECT_ID=<project_id from JSON>
   FIREBASE_CLIENT_EMAIL=<client_email from JSON>
   FIREBASE_PRIVATE_KEY=<private_key from JSON> (keep the \n newlines)
   ```

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or use existing Firebase project
3. Enable Google Calendar API:
   - APIs & Services → Library
   - Search "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/google/callback` (dev)
   - Save Client ID and Client Secret for `.env`
5. Configure OAuth consent screen (if prompted)

### 3. OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key:
   - Settings → API Keys
   - Create new secret key
   - Copy and save securely
3. Set up billing (required for API usage)
4. Note: `gpt-4o-mini` is recommended for cost efficiency

### 4. Redis Setup

#### Option A: Docker (Recommended for development)

```bash
docker run -d --name preplyai-redis -p 6379:6379 redis:7-alpine
```

#### Option B: Homebrew (macOS)

```bash
brew install redis
brew services start redis
```

#### Option C: Linux

```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

#### Verify Redis is running

```bash
redis-cli ping
# Should return: PONG
```

### 5. Install Dependencies

```bash
# Install API dependencies
cd apps/api
npm install

# Install Worker dependencies
cd apps/worker
npm install
```

### 6. Configure Environment Variables

#### API (.env)

```bash
cd apps/api
cp env.example.txt .env
```

Edit `apps/api/.env` and fill in all values from steps 1-4.

#### Worker (.env)

```bash
cd apps/worker
cp env.example.txt .env
```

Edit `apps/worker/.env` with the same Firebase, OpenAI, and Redis credentials.

### 7. Test Configuration

#### Test API

```bash
cd apps/api
npm run type-check  # Should pass with no errors
npm run dev         # Should start on port 3000
```

Visit `http://localhost:3000/health` - should return `{"ok":true}`

#### Test Worker

```bash
cd apps/worker
npm run type-check  # Should pass with no errors
npm run dev         # Should connect to Redis and start listening
```

### 8. Optional: Set Up Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /meetings/{userId}/items/{meetingId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /ai/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    match /connections/{userId}/providers/{provider} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 9. Verify Full Pipeline

1. Start Redis
2. Start API: `cd apps/api && npm run dev`
3. Start Worker: `cd apps/worker && npm run dev`
4. Use a tool like Postman or curl to test:

```bash
# Get a Firebase ID token first (from your frontend or Firebase Auth SDK)
export TOKEN="your-firebase-id-token"

# Test auth
curl -X POST http://localhost:3000/auth/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken":"'$TOKEN'"}'

# Connect Google account (returns auth URL)
curl -X POST http://localhost:3000/google/connect \
  -H "Authorization: Bearer $TOKEN"

# After OAuth flow, fetch meetings
curl http://localhost:3000/meetings?from=2025-01-01T00:00:00Z&to=2025-12-31T23:59:59Z \
  -H "Authorization: Bearer $TOKEN"

# Generate briefing
curl -X POST http://localhost:3000/meetings/<meeting-id>/generate \
  -H "Authorization: Bearer $TOKEN"

# Check worker logs to see job processing
```

## Troubleshooting

### Redis connection errors
- Ensure Redis is running: `redis-cli ping`
- Check REDIS_HOST and REDIS_PORT in .env

### Firebase auth errors
- Verify FIREBASE_PRIVATE_KEY has proper newlines (\n)
- Check Firebase project ID matches
- Ensure Firestore is enabled

### Google Calendar "not connected" errors
- Complete OAuth flow first via `/google/connect`
- Store tokens using `/google/connection`
- Check Calendar API is enabled in Google Cloud Console

### OpenAI rate limit errors
- Worker has 10 jobs/min rate limit by default
- Check OpenAI billing and quota
- Consider using gpt-4o-mini for cost savings

### TypeScript errors
- Run `npm install` in both api and worker
- Run `npm run type-check` to see specific errors

## Production Checklist

Before deploying to production:

- [ ] Change NODE_ENV to `production`
- [ ] Set strong SESSION_SECRET
- [ ] Configure ALLOWED_ORIGINS for CORS
- [ ] Use managed Redis (e.g., Cloud Memorystore, ElastiCache)
- [ ] Set up proper Firebase security rules
- [ ] Enable Cloud Run health checks or K8s probes
- [ ] Monitor OpenAI usage and costs
- [ ] Set up log aggregation (Datadog, CloudWatch, etc.)
- [ ] Configure auto-scaling for worker
- [ ] Enable HTTPS and SSL/TLS
- [ ] Review and test error handling
- [ ] Set up alerting for failed jobs

## Next Steps

- Review [apps/README.md](./README.md) for API documentation
- Check [prompts/](../prompts/) directory for AI prompt templates
- Customize prompts for your use case
- Build frontend integration (React, Next.js, etc.)

## Support

For issues or questions, refer to:
- API logs (pino structured logs)
- Worker logs (job processing logs)
- Firestore console (data inspection)
- BullMQ UI (e.g., Bull Board) for job monitoring

