import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Firebase Configuration for Smart Home Realtime Database & Firestore
 * Project: smart-home-automation-b6825
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD1RggZS3Oh4hOSHtP2_VV8d3bU7Tv70",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-home-automation-b6825.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://smart-home-automation-b6825-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smart-home-automation-b6825",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smart-home-automation-b6825.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "385404957306",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:385404957306:web:adc9e259aea0d2b02681c3"
};

// Initialize Firebase once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Realtime Database instance
export const database = getDatabase(app);

// Firestore instance
export const firestore = getFirestore(app);

// Authentication instance
export const auth = getAuth(app);

export default app;

