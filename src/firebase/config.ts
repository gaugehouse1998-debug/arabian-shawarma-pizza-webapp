import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../services/firebase';
import appletFirebaseConfig from '../../firebase-applet-config.json';

/**
 * Firebase Client Configuration & Storage Uploader
 * Supports authenticated Firebase Storage uploads with automatic
 * browser-safe Data URL compression fallback for offline/static deployments.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletFirebaseConfig.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletFirebaseConfig.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletFirebaseConfig.projectId || '',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletFirebaseConfig.storageBucket || '',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    appletFirebaseConfig.messagingSenderId ||
    '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletFirebaseConfig.appId || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'MY_FIREBASE_API_KEY'
);

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to encode image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToStorage(
  file: File,
  folder = 'payment_screenshots'
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file must be an image (JPG, PNG, or WebP).');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be under 5MB.');
  }

  // Attempt Firebase Storage upload when authenticated and online
  if (typeof window !== 'undefined' && auth.currentUser && navigator.onLine !== false) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `${folder}/${Date.now()}-${safeName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      if (url) return url;
    } catch {
      // Fallback gracefully to Data URL so static/GitHub Pages or offline mode never blocks saving
    }
  }

  return fileToDataUrl(file);
}
