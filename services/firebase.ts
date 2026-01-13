
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

/**
 * Robust environment variable lookup.
 * Tries Vite's import.meta.env, then process.env, then window.process.env.
 */
const getEnvValue = (key: string): string | undefined => {
  // 1. Try import.meta.env (Vite standard)
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[key]) return viteEnv[key];
  } catch (e) {}

  // 2. Try process.env (Node standard / Playground injection)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  // 3. Try window.process.env (Some browser-based IDEs)
  try {
    if (typeof window !== 'undefined' && (window as any).process?.env?.[key]) {
      return (window as any).process.env[key];
    }
  } catch (e) {}

  return undefined;
};

/**
 * Finds a Firebase-related environment variable by checking common naming conventions.
 * Checks: VITE_FIREBASE_[KEY], FIREBASE_[KEY], and then just [KEY] as a fallback.
 */
const findFirebaseVar = (baseName: string): string | undefined => {
  return (
    getEnvValue(`VITE_FIREBASE_${baseName}`) || 
    getEnvValue(`FIREBASE_${baseName}`) || 
    getEnvValue(baseName)
  );
};

const firebaseConfig = {
  apiKey: findFirebaseVar('API_KEY'),
  authDomain: findFirebaseVar('AUTH_DOMAIN'),
  projectId: findFirebaseVar('PROJECT_ID'),
  storageBucket: findFirebaseVar('STORAGE_BUCKET'),
  messagingSenderId: findFirebaseVar('MESSAGING_SENDER_ID'),
  appId: findFirebaseVar('APP_ID')
};

// Log warning if the core API key is missing
if (!firebaseConfig.apiKey) {
  console.warn(
    "Firebase API Key is missing. " +
    "The app expects VITE_FIREBASE_API_KEY or FIREBASE_API_KEY to be set in the environment. " +
    "Check your environment variable configuration."
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

export default app;
