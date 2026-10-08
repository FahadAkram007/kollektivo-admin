import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserSessionPersistence, getAuth, initializeAuth, type Auth } from 'firebase/auth';

let auth: Auth | undefined;

/**
 * Firebase only holds the session: the API issues a custom token after email code + authenticator code.
 * Admin sessions live only in this browser tab (closing it signs out) and end after 12 hours (API).
 * Browser only; call it from effects and event handlers, never while rendering on the server.
 */
export function firebaseAuth(): Auth {
  if (auth) return auth;
  const existing = getApps().length > 0;
  const app = existing
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
  auth = existing ? getAuth(app) : initializeAuth(app, { persistence: browserSessionPersistence });
  return auth;
}
