# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "salesprep-ai")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click "Google" provider
5. Toggle "Enable"
6. Enter your project support email
7. Click "Save"

## Step 3: Add Web App

1. In Firebase Console, click the web icon (</>) to add a web app
2. Enter app nickname (e.g., "salesprep-web")
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase config object

## Step 4: Get Config Values

From the Firebase config object, extract these values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // ← VITE_FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com",  // ← VITE_FIREBASE_AUTH_DOMAIN
  projectId: "project-id",     // ← VITE_FIREBASE_PROJECT_ID
  storageBucket: "project.appspot.com",  // ← VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",  // ← VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"       // ← VITE_FIREBASE_APP_ID
};
```

## Step 5: Update .env File

Edit `apps/web/.env` and replace the placeholder values:

```bash
VITE_FIREBASE_API_KEY=AIzaSyC...your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

## Step 6: Configure Authorized Domains

1. In Firebase Console → Authentication → Settings
2. Scroll down to "Authorized domains"
3. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `your-app.com`)

## Step 7: Test the Setup

1. Restart your development server:
   ```bash
   cd apps/web
   npm run dev
   ```

2. Go to `http://localhost:3000`
3. Click "Continue with Google"
4. You should see the Google Sign-In popup

## Troubleshooting

### Error: "auth/invalid-api-key"
- Double-check your API key in the .env file
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing .env

### Error: "auth/unauthorized-domain"
- Add `localhost` to authorized domains in Firebase Console
- For production, add your actual domain

### Error: "auth/popup-blocked"
- Allow popups in your browser
- Or use redirect flow instead of popup

### Still having issues?
- Check browser console for detailed error messages
- Verify all environment variables are loaded: `console.log(import.meta.env)`
- Make sure your Firebase project has Google Auth enabled
