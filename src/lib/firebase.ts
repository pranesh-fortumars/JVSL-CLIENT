import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBYMf1pOwRWWrWoUvc0rtcymbHnKqGmoeM",
  authDomain: "jvsl-60177.firebaseapp.com",
  projectId: "jvsl-60177",
  storageBucket: "jvsl-60177.firebasestorage.app",
  messagingSenderId: "405497932160",
  appId: "1:405497932160:web:b88cfd7bec1fc34a15f965",
  measurementId: "G-ESKN01E38L"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics initialization for browser environments
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {});
}

