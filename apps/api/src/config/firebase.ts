import admin from 'firebase-admin';
import { env } from './environment';

let firebaseApp: admin.app.App;

export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Use service account credentials from env or GCP default credentials
  if (env.FIREBASE_PRIVATE_KEY && env.FIREBASE_CLIENT_EMAIL) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Use Application Default Credentials (GCP)
    firebaseApp = admin.initializeApp({
      projectId: env.FIREBASE_PROJECT_ID,
    });
  }

  return firebaseApp;
}

export function getFirestore(): admin.firestore.Firestore {
  const app = firebaseApp || initializeFirebase();
  return admin.firestore(app);
}

export function getAuth(): admin.auth.Auth {
  const app = firebaseApp || initializeFirebase();
  return admin.auth(app);
}

