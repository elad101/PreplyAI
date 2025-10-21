# SalesPrep.AI Web App

Production-ready, mobile-first React application for AI-powered sales meeting briefings.

## Features

- 🔐 Firebase Authentication (Google Sign-In)
- 📱 Mobile-first responsive design
- 🎨 Beautiful UI with Tailwind CSS v4
- ⚡ Fast data fetching with SWR
- 🎯 Type-safe with TypeScript
- 🧪 Testing with Vitest & React Testing Library
- 🚀 Optimized builds with Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Google Auth enabled
- Backend API running (see server/ directory)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your Firebase credentials and API URL.

### Development

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Testing

Run tests:

```bash
npm test
```

Type check:

```bash
npm run type-check
```

## Project Structure

```
apps/web/
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── figma/      # Custom figma components
│   │   └── AuthGate.tsx
│   ├── pages/          # Page components
│   │   ├── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MeetingDetail.tsx
│   │   └── Settings.tsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.tsx
│   │   └── useApi.ts
│   ├── lib/            # Core libraries
│   │   ├── firebase.ts
│   │   └── api.ts
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── tests/          # Test files
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Routes

- `/login` - Google Sign-In page
- `/` - Dashboard with upcoming meetings
- `/m/:id` - Meeting detail with AI briefing
- `/settings` - User settings and preferences

## Environment Variables

Required environment variables:

- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8000)

## Technologies

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router v7
- **Data Fetching**: SWR
- **HTTP Client**: Axios
- **Auth**: Firebase Authentication
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Testing**: Vitest, React Testing Library

## License

MIT

