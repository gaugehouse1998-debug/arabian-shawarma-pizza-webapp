/**
 * Firebase Client Configuration for GitHub Pages & Production
 *
 * To connect to Firebase:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password)
 * 3. Enable Cloud Firestore
 * 4. Enable Firebase Storage
 * 5. Add a Web App and copy your config keys to .env or GitHub Repository Secrets:
 *    VITE_FIREBASE_API_KEY
 *    VITE_FIREBASE_AUTH_DOMAIN
 *    VITE_FIREBASE_PROJECT_ID
 *    VITE_FIREBASE_STORAGE_BUCKET
 *    VITE_FIREBASE_MESSAGING_SENDER_ID
 *    VITE_FIREBASE_APP_ID
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'MY_FIREBASE_API_KEY'
);

// Helper for image upload simulation or Cloud Storage upload
export async function uploadImageToStorage(file: File, folder = 'payment_screenshots'): Promise<string> {
  return new Promise((resolve) => {
    // When using GitHub Pages without active backend, convert to data URL for immediate local storage and preview
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
