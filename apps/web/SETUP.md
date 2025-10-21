# Setup Guide for SalesPrep.AI Web App

## Quick Start

### 1. Install Dependencies

```bash
cd apps/web
npm install
```

### 2. Configure Environment Variables

Copy the `.env` file and update with your credentials:

```bash
# The .env file is already created, just update the values:
# - Get Firebase credentials from https://console.firebase.google.com
# - Update VITE_API_BASE_URL to point to your backend API
```

**Required Firebase Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable Google Authentication:
   - Navigate to Authentication → Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains
4. Get your config values from Project Settings → General

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## API Integration

The app expects the backend API to be running at the URL specified in `VITE_API_BASE_URL`.

### Required API Endpoints:

**Authentication:**
- `POST /auth/firebase` - Exchange Firebase ID token for session
- `POST /auth/signout` - Sign out user
- `GET /auth/profile` - Get user profile

**Meetings:**
- `GET /meetings` - List all meetings
- `GET /meetings/:id` - Get meeting details with briefing
- `POST /meetings/:id/generate` - Generate/regenerate AI briefing

**Settings:**
- `GET /settings` - Get user settings
- `PATCH /settings` - Update user settings

## Project Structure

```
apps/web/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (40+ components)
│   │   ├── figma/           # Custom components (ImageWithFallback)
│   │   └── AuthGate.tsx     # Route protection component
│   ├── pages/
│   │   ├── LoginPage.tsx    # Google Sign-In
│   │   ├── Dashboard.tsx    # Meeting list
│   │   ├── MeetingDetail.tsx # Briefing view
│   │   └── Settings.tsx     # User preferences
│   ├── hooks/
│   │   ├── useAuth.tsx      # Firebase auth hook
│   │   └── useApi.ts        # SWR data fetching hooks
│   ├── lib/
│   │   ├── firebase.ts      # Firebase initialization
│   │   └── api.ts           # API client with interceptors
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── tests/               # Test files
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Features Implemented

✅ **Authentication**
- Firebase Google Sign-In
- Session management with HTTP-only cookies
- Auto-redirect for authenticated users
- Protected routes with AuthGate

✅ **Dashboard**
- List of upcoming meetings
- Quick stats (today's meetings, AI briefings)
- Meeting status badges (Ready/Prep needed)
- Loading skeletons
- Error handling

✅ **Meeting Detail**
- Company summary with logo
- Attendee profiles with LinkedIn integration
- AI-generated talking points
- Conversation icebreakers
- Generate/Regenerate briefing button
- Optimistic UI updates

✅ **Settings**
- User profile display
- Subscription information
- Notification preferences
- AI preferences (auto-generate, company research, competitive insights)
- Real-time settings updates

✅ **UI/UX**
- Mobile-first responsive design
- Beautiful gradient backgrounds
- Smooth animations
- Loading states
- Error states with retry
- Toast notifications
- Skeleton loaders

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Type check
npm run type-check

# Lint (add to package.json if needed)
npm run lint
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123:web:abc` |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

## Deployment

### Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy to Cloud Run (Recommended)

1. Build Docker image:
```bash
docker build -t salesprep-web .
```

2. Push to Google Container Registry:
```bash
docker tag salesprep-web gcr.io/[PROJECT-ID]/salesprep-web
docker push gcr.io/[PROJECT-ID]/salesprep-web
```

3. Deploy to Cloud Run:
```bash
gcloud run deploy salesprep-web \
  --image gcr.io/[PROJECT-ID]/salesprep-web \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Environment Variables in Production

Set environment variables in Cloud Run:
```bash
gcloud run services update salesprep-web \
  --set-env-vars VITE_FIREBASE_API_KEY=xxx,VITE_FIREBASE_AUTH_DOMAIN=xxx,...
```

## Troubleshooting

### Firebase Auth Issues

**Error: "auth/popup-blocked"**
- Solution: Ensure popups are not blocked in browser settings
- Alternative: Use redirect flow instead of popup

**Error: "auth/unauthorized-domain"**
- Solution: Add your domain to authorized domains in Firebase Console

### API Connection Issues

**Error: "Network Error" or "No response from server"**
- Check that backend API is running
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings on backend

**Error: 401 Unauthorized**
- Firebase token may be expired - try signing out and back in
- Check backend token verification

### Build Issues

**Error: "Cannot find module '@/...'"**
- Check `vite.config.ts` has correct path alias
- Verify `tsconfig.json` has correct `paths` configuration

**Error: Module import errors**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Testing

Run tests with:
```bash
npm test
```

Tests are located in `src/tests/` and use:
- Vitest for test runner
- React Testing Library for component testing
- jsdom for DOM simulation

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Type check: `npm run type-check`
5. Build: `npm run build`
6. Create a pull request

## Support

For issues or questions:
- Check the main README.md
- Review AGENTS.md for project guidelines
- Contact the development team

