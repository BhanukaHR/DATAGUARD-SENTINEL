// Initialize Firebase client SDK and export helpers.
// Replace the config values with those from your Firebase console or
// store them in environment variables (e.g. in a .env file).

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dataguard-sentinel.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dataguard-sentinel",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dataguard-sentinel.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// guard against re-initialization in dev/hot reload
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
