import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import appletFirebaseConfig from '../../firebase-applet-config.json';

export type FirebaseConnectionState = 'connecting' | 'connected' | 'offline' | 'error';

export interface FirebaseStatusInfo {
  state: FirebaseConnectionState;
  message?: string;
}

type StatusListener = (info: FirebaseStatusInfo) => void;
const statusListeners = new Set<StatusListener>();
let currentStatus: FirebaseStatusInfo = { state: 'connecting' };

export function getFirebaseStatus(): FirebaseStatusInfo {
  return currentStatus;
}

export function reportFirebaseStatus(state: FirebaseConnectionState, message?: string): void {
  currentStatus = { state, message };
  statusListeners.forEach((listener) => {
    try {
      listener(currentStatus);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function subscribeFirebaseStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  listener(currentStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

const resolvedConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletFirebaseConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletFirebaseConfig.appId
};

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let storageInstance: FirebaseStorage | null = null;

try {
  if (!resolvedConfig.apiKey || !resolvedConfig.projectId || !resolvedConfig.appId) {
    throw new Error('Missing required Firebase project configuration fields.');
  }

  app = getApps().length === 0 ? initializeApp(resolvedConfig) : getApps()[0];
  const databaseId = appletFirebaseConfig.firestoreDatabaseId || '(default)';

  try {
    dbInstance = initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true
      },
      databaseId
    );
  } catch {
    dbInstance = getFirestore(app, databaseId);
  }

  authInstance = getAuth(app);
  storageInstance = getStorage(app);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Firebase failed to initialize.';
  console.error('[Firebase Init Error]', message, error);
  reportFirebaseStatus('error', message);
}

export const db: Firestore | null = dbInstance;
export const auth: Auth | null = authInstance;
export const storage: FirebaseStorage | null = storageInstance;
export const isFirebaseInitialized = Boolean(app && dbInstance && authInstance);

export default app;

