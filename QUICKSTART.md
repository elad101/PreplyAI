# Quick Start Guide

Get PreplyAI running in 15 minutes with **PostgreSQL** and **Redis** in Docker!

## 1. Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check Docker
docker --version
docker-compose --version
```

## 2. Get Your Credentials

You need 3 things:

### A. Firebase (for Auth Only)
1. Go to [Firebase Console](https://console.firebase.google.com/) → Your Project
2. **Project Settings** → **Service Accounts** → **Generate new private key**
3. Download the JSON file

### B. Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Create OAuth 2.0 Client ID (Web application)
4. Add redirect URI: `http://localhost:3000/google/callback`
5. Copy Client ID and Secret

### C. OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. **API Keys** → **Create new secret key**
3. Copy the key

### D. Enable Required APIs
1. In Google Cloud Console → **APIs & Services** → **Library**
2. Enable: **Google Calendar API**

## 3. Start Database & Redis

```bash
# Start PostgreSQL and Redis containers
docker-compose up -d

# Verify they're running
docker-compose ps

# Check PostgreSQL
docker exec -it preplyai-postgres psql -U preplyai -d preplyai -c '\dt'

# Check Redis
docker exec -it preplyai-redis redis-cli ping
```

## 4. Install Dependencies

```bash
cd apps
npm run install:all
```

## 5. Configure Environment

### Create API .env file

```bash
cd apps/api
cp env.example.txt .env
```

Edit `apps/api/.env`:

```bash
PORT=3000
NODE_ENV=development

# PostgreSQL (Docker)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=preplyai
DATABASE_USER=preplyai
DATABASE_PASSWORD=preplyai_dev_password

# Firebase (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google OAuth
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/google/callback
GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar.readonly

# OpenAI
OPENAI_API_KEY=sk-proj-xxx

# Redis (Docker)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security
SESSION_SECRET=$(openssl rand -hex 64)
```

### Create Worker .env file

```bash
cd ../worker
cp env.example.txt .env
```

Edit `apps/worker/.env` (same values as API):

```bash
NODE_ENV=development

# PostgreSQL (Docker - same as API)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=preplyai
DATABASE_USER=preplyai
DATABASE_PASSWORD=preplyai_dev_password

# Firebase (same as API)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OpenAI (same as API)
OPENAI_API_KEY=sk-proj-xxx

# Redis (Docker - same as API)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 6. Initialize Database

```bash
cd apps/api

# Build first
npm run build

# Run migrations
npm run db:migrate
```

You should see: `✅ Database schema created successfully`

## 7. Test Configuration

```bash
cd apps
npm run test:env:api      # Test API config
npm run test:env:worker    # Test Worker config
```

You should see all ✅ checkmarks!

## 8. Start the Services

**Terminal 1 - API:**
```bash
cd apps/api
npm run dev
```

You should see:
```
✔ Firebase Admin initialized
✔ Database connected
✔ Redis client connected
✔ Server started on port 3000
```

**Terminal 2 - Worker:**
```bash
cd apps/worker
npm run dev
```

You should see:
```
✔ Firebase Admin initialized
✔ Database connected
✔ Worker started
```

## 9. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Should return: {"ok":true,"timestamp":"..."}
```

## 10. Enable Firebase Authentication

1. Firebase Console → **Authentication** → **Get Started**
2. **Sign-in method** → Enable **Google**
3. Set support email → **Save**

## ✅ You're Done!

Your backend is now running:
- 🐘 PostgreSQL: localhost:5432 (Docker)
- 🔴 Redis: localhost:6379 (Docker)
- 🔥 API Server: http://localhost:3000
- 🤖 Worker: Processing jobs in background

## Database Management

### View Data

```bash
# Connect to PostgreSQL
docker exec -it preplyai-postgres psql -U preplyai -d preplyai

# List tables
\dt

# Query users
SELECT * FROM users;

# Exit
\q
```

### Reset Database

```bash
# Stop containers
docker-compose down -v

# Restart (will recreate database)
docker-compose up -d

# Re-run migrations
cd apps/api
npm run db:migrate
```

## Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart a service
docker-compose restart postgres
```

## Troubleshooting

### "Database connection failed"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### "Redis connection failed"
```bash
# Check if Redis is running
docker exec -it preplyai-redis redis-cli ping

# Should return: PONG
```

### "Invalid private key" error
Make sure your `FIREBASE_PRIVATE_KEY` in .env:
- Is wrapped in double quotes
- Has `\n` (not real newlines)
- Looks like: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

## Next Steps

1. **Test the full flow:**
   - Use your frontend to sign in with Google
   - Connect Google Calendar
   - Fetch meetings
   - Generate a briefing!

2. **Monitor your database:**
   - Use tools like pgAdmin, TablePlus, or DBeaver
   - Connect to: localhost:5432, database: preplyai

3. **Check costs:**
   - OpenAI Dashboard: https://platform.openai.com/usage
   - Each briefing costs ~$0.002-0.004 (gpt-4o-mini)

## Need More Help?

- 📖 Full documentation: [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)
- 🔧 Database schema: [apps/api/src/database/schema.sql](./apps/api/src/database/schema.sql)
- 💡 API reference: [apps/README.md](./apps/README.md)

---

**Happy building! 🚀**
