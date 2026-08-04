// Firebase app initialisation.
// This is the ONLY file that imports from 'firebase/*'.
// All other modules import from here.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent re-initialisation during hot-module reloads in development
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key';

let _auth: ReturnType<typeof getAuth>;
try {
  _auth = getAuth(app);
} catch (error) {
  console.warn('Firebase Auth initialization failed. Is your API key set?');
  _auth = {} as any; // Mock to prevent immediate destructuring crashes
}
export const auth = _auth;

// Use persistent local cache for offline support (multi-tab safe).
// initializeFirestore must be called before any getFirestore() calls.
let _db: ReturnType<typeof getFirestore>;
try {
  _db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  // initializeFirestore throws if called more than once (e.g. HMR) — fall back
  _db = getFirestore(app);
}

export const db = _db;

// Firebase Cloud Messaging — only available in browser contexts with SW support.
// Wrapped in a try/catch because messaging is not available in all environments
// (e.g., Node, service workers without the proper registration).
let _messaging: ReturnType<typeof getMessaging> | null = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    _messaging = getMessaging(app);
  }
} catch {
  // Messaging is not supported in this environment
  _messaging = null;
}
export const messaging = _messaging;
