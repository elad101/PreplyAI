# Environment Variables Setup Guide

Complete guide for configuring all `.env` files across the PreplyAI project.

## Project Structure

```
PreplyAI/
├── apps/
│   ├── api/          # Backend API (.env)
│   ├── worker/       # Background worker (.env)
│   └── web/          # Frontend (.env)
```

## Quick Setup

### 1. Copy Example Files

```bash
# API
cd apps/api
cp env.example.txt .env

# Worker
cd ../worker
cp env.example.txt .env

# Web
cd ../web
cp .env.example .env
```

### 2. Fill in Your Credentials

Edit each `.env` file with your actual values (see sections below).

### 3. Test Configuration

```bash
cd apps
npm run test:env:api     # Test API config
npm run test:env:worker  # Test Worker config
```

---

## API Environment Variables

File: `apps/api/.env`

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# FIREBASE ADMIN SDK
# ============================================
# From Firebase Console → Project Settings → Service Accounts → Generate Private Key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

# ⚠️ IMPORTANT: 
# - Wrap in double quotes
# - Use \n for newlines (not actual newlines)
# - In production on GCP, you can omit CLIENT_EMAIL and PRIVATE_KEY to use default credentials

# ============================================
# GOOGLE OAUTH (Calendar API)
# ============================================
# From Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YourSecretHere
GOOGLE_REDIRECT_URI=http://localhost:3000/google/callback
GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar.readonly

# ⚠️ For production, update GOOGLE_REDIRECT_URI to your deployed URL

# ============================================
# OPENAI
# ============================================
# From OpenAI Platform → API Keys
OPENAI_API_KEY=sk-proj-YourOpenAIKeyHere

# ============================================
# REDIS (Cache & Queue)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# For production (Cloud Memorystore, ElastiCache, etc.):
# REDIS_HOST=10.x.x.x
# REDIS_PASSWORD=your-redis-password

# ============================================
# SECURITY
# ============================================
# Generate with: node ../scripts/generate-session-secret.js
SESSION_SECRET=your-random-session-secret-here

# ============================================
# OPTIONAL: Third-party Enrichment
# ============================================
ENRICHMENT_API_KEY=
ENRICHMENT_PROVIDER=

# ============================================
# PRODUCTION ONLY
# ============================================
# Uncomment for production:
# ALLOWED_ORIGINS=https://app.preplyai.com,https://app-staging.preplyai.com
```

---

## Worker Environment Variables

File: `apps/worker/.env`

```bash
# ============================================
# ENVIRONMENT
# ============================================
NODE_ENV=development

# ============================================
# FIREBASE ADMIN SDK
# ============================================
# Same as API - from Firebase Console → Project Settings → Service Accounts
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

# ============================================
# OPENAI
# ============================================
# Same as API - from OpenAI Platform → API Keys
OPENAI_API_KEY=sk-proj-YourOpenAIKeyHere

# ============================================
# REDIS (Same as API)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# OPTIONAL: Third-party Enrichment
# ============================================
ENRICHMENT_API_KEY=
ENRICHMENT_PROVIDER=
```

---

## Web (Frontend) Environment Variables

File: `apps/web/.env`

```bash
# ============================================
# FIREBASE WEB SDK
# ============================================
# From Firebase Console → Project Settings → Your apps → Web app config
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# API CONFIGURATION
# ============================================
# Local development
VITE_API_BASE_URL=http://localhost:3000

# For production, update to your deployed API URL:
# VITE_API_BASE_URL=https://preplyai-api-xxxxx.run.app
```

---

## Where to Get Each Value

### Firebase Service Account (API & Worker)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. **Project Settings** (gear icon) → **Service Accounts** tab
4. Click **Generate new private key**
5. Download JSON file
6. Extract values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep `\n` characters!)

### Firebase Web Config (Web)

1. Firebase Console → **Project Settings**
2. Scroll to **Your apps** section
3. Find your web app (or create one)
4. Copy the config values

### Google OAuth (API)

1. [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID**
4. Copy Client ID and Client Secret

### OpenAI (API & Worker)

1. [OpenAI Platform](https://platform.openai.com/)
2. **API Keys** → **Create new secret key**
3. Copy the key immediately (you won't see it again!)

---

## Environment-Specific Configurations

### Development (.env files)

```bash
NODE_ENV=development
PORT=3000
GOOGLE_REDIRECT_URI=http://localhost:3000/google/callback
VITE_API_BASE_URL=http://localhost:3000
REDIS_HOST=localhost
```

### Staging (GitHub Secrets)

```bash
NODE_ENV=staging
PORT=8080
GOOGLE_REDIRECT_URI=https://preplyai-api-staging-xxx.run.app/google/callback
VITE_API_BASE_URL=https://preplyai-api-staging-xxx.run.app
REDIS_HOST=10.x.x.x (Cloud Memorystore)
ALLOWED_ORIGINS=https://preplyai-staging-xxx.run.app
```

### Production (GitHub Secrets)

```bash
NODE_ENV=production
PORT=8080
GOOGLE_REDIRECT_URI=https://api.preplyai.com/google/callback
VITE_API_BASE_URL=https://api.preplyai.com
REDIS_HOST=10.x.x.x (Cloud Memorystore)
ALLOWED_ORIGINS=https://app.preplyai.com
```

---

## Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] Never commit service account JSON files
- [ ] Use GitHub Secrets for CI/CD (see `.github/SECRETS_SETUP.md`)
- [ ] Rotate secrets regularly
- [ ] Use different Firebase projects for dev/staging/prod
- [ ] Set Firestore security rules
- [ ] Enable CORS only for your domains in production
- [ ] Use strong SESSION_SECRET (64+ random characters)

---

## Testing Your Configuration

### API

```bash
cd apps/api
npm run test:env:api

# Should show all ✅ for required variables
```

### Worker

```bash
cd apps/worker
npm run test:env:worker

# Should show all ✅ for required variables
```

### Web

```bash
cd apps/web
npm run dev

# Should start without errors
# Check browser console for Firebase connection
```

---

## Troubleshooting

### "Invalid FIREBASE_PRIVATE_KEY format"

**Problem**: Private key has incorrect escaping

**Solution**:
```bash
# Correct format (in .env):
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"

# NOT:
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBA...
-----END PRIVATE KEY-----
```

### "Redis connection failed"

**Problem**: Redis not running

**Solution**:
```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Or
brew services start redis

# Verify
redis-cli ping  # Should return: PONG
```

### "OpenAI API key invalid"

**Problem**: Key format incorrect or expired

**Solution**:
- Ensure key starts with `sk-` or `sk-proj-`
- Check key hasn't been revoked
- Create new key if needed

### "CORS error in frontend"

**Problem**: API not allowing frontend origin

**Solution**:
- In development: API should allow all origins
- Check `ALLOWED_ORIGINS` in production
- Verify `VITE_API_BASE_URL` matches actual API URL

---

## Quick Reference

| Variable | Used In | Required | Where to Get |
|----------|---------|----------|--------------|
| FIREBASE_PROJECT_ID | api, worker, web | ✅ | Firebase Console → Project Settings |
| FIREBASE_PRIVATE_KEY | api, worker | ✅ | Service Account JSON |
| GOOGLE_CLIENT_ID | api | ✅ | GCP Console → Credentials |
| OPENAI_API_KEY | api, worker | ✅ | OpenAI Platform |
| VITE_FIREBASE_API_KEY | web | ✅ | Firebase Console → Web App Config |
| VITE_API_BASE_URL | web | ✅ | Your API URL |
| REDIS_HOST | api, worker | ✅ | localhost or Cloud Memorystore IP |

---

## Next Steps

1. ✅ Fill in all `.env` files
2. ✅ Test configuration with `npm run test:env:*`
3. ✅ Start services (Redis, API, Worker, Web)
4. ✅ Set up GitHub Secrets for production (see `.github/SECRETS_SETUP.md`)
5. ✅ Configure Firestore security rules
6. ✅ Test full authentication flow

**Need help?** See [QUICKSTART.md](./QUICKSTART.md) or [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

