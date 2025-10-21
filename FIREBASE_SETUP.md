# Firebase & Google Cloud Setup Guide

This guide will walk you through setting up Firebase Authentication, Google Cloud Platform, and all required environment variables.

## Prerequisites

- ✅ Firebase project created
- ✅ Firebase web app created
- ⏳ GCP project to be created
- Node.js 18+ installed
- Access to Firebase Console and GCP Console

---

## Part 1: Firebase Authentication Setup

### Step 1: Enable Google Sign-In

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** in the left sidebar
4. Click **Get Started** (if first time)
5. Go to **Sign-in method** tab
6. Click on **Google** provider
7. Toggle **Enable**
8. Set a support email (your email)
9. Click **Save**

### Step 2: Get Firebase Web App Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Find your web app
4. Copy the Firebase config object - you'll need:
   - `apiKey`
   - `authDomain`
   - `projectId`

**Save these for later** - you'll need them in your frontend.

### Step 3: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a location (choose closest to your users, e.g., `us-central1`)
5. Click **Enable**

### Step 4: Create Service Account for Backend

1. In Firebase Console, go to **Project Settings** → **Service Accounts** tab
2. Click **Generate new private key**
3. Click **Generate key**
4. A JSON file will download - **KEEP THIS SECURE!**
5. Open the downloaded JSON file

**Extract these values:**
```json
{
  "project_id": "your-project-id",           ← FIREBASE_PROJECT_ID
  "private_key": "-----BEGIN PRIVATE...",    ← FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-..."    ← FIREBASE_CLIENT_EMAIL
}
```

---

## Part 2: Google Cloud Platform Setup

### Step 1: Create/Link GCP Project

**Option A: If your Firebase project auto-created a GCP project:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. You should see a project named same as your Firebase project
3. Select it from the project dropdown

**Option B: If you need to create a new GCP project:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown → **New Project**
3. Name it (e.g., "PreplyAI")
4. Click **Create**
5. Link it to your Firebase project (Firebase Console → Project Settings → General → Google Cloud Platform)

### Step 2: Enable Required APIs

1. In GCP Console, go to **APIs & Services** → **Library**
2. Enable these APIs (search and click Enable for each):
   - ✅ **Google Calendar API**
   - ✅ **Google+ API** (for OAuth)
   - ✅ **Cloud Firestore API** (should already be enabled)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**

**First time setup: Configure OAuth Consent Screen**
3. If prompted, click **Configure Consent Screen**
4. Choose **External** (unless you have Google Workspace)
5. Click **Create**

**Fill in OAuth Consent Screen:**
- **App name**: PreplyAI
- **User support email**: (your email)
- **App logo**: (optional)
- **App domain**: Leave blank for now
- **Authorized domains**: Leave blank for development
- **Developer contact**: (your email)
- Click **Save and Continue**

**Scopes:**
- Click **Add or Remove Scopes**
- Add: `https://www.googleapis.com/auth/calendar.readonly`
- Click **Update** → **Save and Continue**

**Test users (for development):**
- Click **+ Add Users**
- Add your email and any test users
- Click **Save and Continue**
- Click **Back to Dashboard**

**Now create the OAuth client:**
6. Go back to **Credentials** → **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
7. Application type: **Web application**
8. Name: "PreplyAI Backend"
9. **Authorized redirect URIs** - Add these:
   - `http://localhost:3000/google/callback` (development)
   - Add production URL later (e.g., `https://api.preplyai.com/google/callback`)
10. Click **Create**
11. **Copy the Client ID and Client Secret** - you'll need these!

---

## Part 3: OpenAI API Setup

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create account
3. Go to **API Keys** (in left sidebar or top-right menu)
4. Click **+ Create new secret key**
5. Name it: "PreplyAI Backend"
6. Click **Create secret key**
7. **Copy the key immediately** (you won't see it again!)

### Step 2: Set Up Billing (Required)

1. Go to **Settings** → **Billing**
2. Add payment method
3. Set usage limits (recommended: $20-50/month to start)

---

## Part 4: Redis Setup

### Option A: Docker (Recommended for Development)

```bash
docker run -d \
  --name preplyai-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify it's running
docker ps
redis-cli ping  # Should return PONG
```

### Option B: Homebrew (macOS)

```bash
brew install redis
brew services start redis
redis-cli ping  # Should return PONG
```

### Option C: Cloud Redis (Production)

- **Google Cloud**: Cloud Memorystore
- **AWS**: ElastiCache
- **Redis Cloud**: Managed Redis

For now, use local Redis for development.

---

## Part 5: Configure Environment Variables

Now let's set up your `.env` files with all the credentials you've collected.

### Step 1: Create API Environment File

```bash
cd apps/api
cp env.example.txt .env
```

Edit `apps/api/.env`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Admin SDK (from Step 4 of Part 1)
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"
# IMPORTANT: Keep the quotes and \n characters in the private key!

# Google OAuth (from Step 3 of Part 2)
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YourSecretHere
GOOGLE_REDIRECT_URI=http://localhost:3000/google/callback
GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar.readonly

# OpenAI (from Part 3)
OPENAI_API_KEY=sk-proj-YourKeyHere

# Redis (local for development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security
SESSION_SECRET=generate-a-random-string-here

# Optional: Leave empty for now
ENRICHMENT_API_KEY=
ENRICHMENT_PROVIDER=
```

### Step 2: Create Worker Environment File

```bash
cd ../worker
cp env.example.txt .env
```

Edit `apps/worker/.env`:

```bash
# Environment
NODE_ENV=development

# Firebase Admin SDK (SAME as API)
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"

# OpenAI (SAME as API)
OPENAI_API_KEY=sk-proj-YourKeyHere

# Redis (SAME as API)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Optional
ENRICHMENT_API_KEY=
ENRICHMENT_PROVIDER=
```

---

## Part 6: Verify Setup

### Step 1: Install Dependencies

```bash
cd /Users/eladgolan/Documents/workspace/PreplyAI/apps

# Install API dependencies
cd api
npm install

# Install Worker dependencies
cd ../worker
npm install
```

### Step 2: Start Redis

```bash
# If using Docker
docker start preplyai-redis

# If using Homebrew
brew services start redis

# Verify
redis-cli ping  # Should return PONG
```

### Step 3: Test API Server

```bash
cd apps/api
npm run dev
```

You should see:
```
✔ Firebase Admin initialized
✔ Redis client connected
✔ Server started on port 3000
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
# Should return: {"ok":true,"timestamp":"..."}
```

### Step 4: Test Worker

In a new terminal:

```bash
cd apps/worker
npm run dev
```

You should see:
```
✔ Firebase Admin initialized
✔ Worker started
```

### Step 5: Test Firebase Auth (Optional)

You'll need a Firebase ID token from your frontend. For now, you can test with:

```bash
# This will fail with "Missing idToken" but confirms the endpoint works
curl -X POST http://localhost:3000/auth/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'

# Expected: {"error":"Unauthorized","message":"Invalid or expired token"}
# This is correct! It means the endpoint is working.
```

---

## Part 7: Frontend Integration (Optional)

When you're ready to integrate with your frontend (`new UI/`):

### Firebase Web Config

In your frontend, initialize Firebase:

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIza...",                          // From Firebase Console
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add Calendar scope for backend OAuth
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
```

---

## Troubleshooting

### Issue: "Invalid private key"

**Solution:** Make sure FIREBASE_PRIVATE_KEY is properly formatted:
- Wrapped in double quotes
- Contains literal `\n` characters (not actual newlines)
- Starts with `"-----BEGIN PRIVATE KEY-----\n`
- Ends with `\n-----END PRIVATE KEY-----\n"`

Example:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Issue: Redis connection failed

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not, start it
docker start preplyai-redis
# OR
brew services start redis
```

### Issue: "Calendar API not enabled"

**Solution:**
1. Go to GCP Console → APIs & Services → Library
2. Search "Google Calendar API"
3. Click it and click "Enable"

### Issue: OAuth consent screen issues

**Solution:**
- Make sure you added yourself as a test user
- OAuth app is in "Testing" mode (allows test users)
- For production, you'll need to verify your app

---

## Security Checklist

- [ ] `.env` files are in `.gitignore` (already done)
- [ ] Never commit service account JSON file
- [ ] Store production secrets in GitHub Secrets or GCP Secret Manager
- [ ] Use separate Firebase projects for dev/staging/production
- [ ] Set Firestore security rules (see below)

### Recommended Firestore Security Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    match /meetings/{userId}/items/{meetingId} {
      allow read, write: if isOwner(userId);
      
      match /ai/{document=**} {
        allow read, write: if isOwner(userId);
      }
    }
    
    match /connections/{userId}/providers/{provider} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

Click **Publish** to activate the rules.

---

## Next Steps

1. ✅ Verify all services are running (API, Worker, Redis)
2. Test the full OAuth flow with your frontend
3. Create a test meeting in Google Calendar
4. Try generating a briefing!
5. Check worker logs to see the AI pipeline in action

---

## Summary of Credentials Needed

| Variable | Where to Get It | Used In |
|----------|----------------|---------|
| FIREBASE_PROJECT_ID | Firebase Console → Project Settings | api, worker |
| FIREBASE_CLIENT_EMAIL | Service account JSON file | api, worker |
| FIREBASE_PRIVATE_KEY | Service account JSON file | api, worker |
| GOOGLE_CLIENT_ID | GCP Console → Credentials | api |
| GOOGLE_CLIENT_SECRET | GCP Console → Credentials | api |
| OPENAI_API_KEY | OpenAI Platform → API Keys | api, worker |

---

**Need help?** Check the [SETUP.md](./SETUP.md) troubleshooting section or the logs in your terminal.

