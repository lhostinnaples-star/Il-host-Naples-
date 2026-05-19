import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAd9vrujbm7IT8qy0LwVNA6CmUq6W-YjsY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ilhost-naples.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ilhost-naples",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ilhost-naples.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "641411549338",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:641411549338:web:a7c1c76b044b995cff3723",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NVVXK5HJZR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
