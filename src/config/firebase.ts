import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD1Rr9qUzSMJKapC3DndA0cR8RHcsHumuI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dataguard-sentinel.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dataguard-sentinel",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dataguard-sentinel.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "535425699372",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:535425699372:web:6981734dba1dd43da0cb89",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4VC8RKC1ZV",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://dataguard-sentinel-default-rtdb.firebaseio.com",
};

let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export default firebaseApp;
