
import { getApp, getApps, initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;

// This function ensures that we initialize Firebase only once.
// It's safe to call this multiple times, which is important for Next.js's
// hot-reloading feature in development and server-side rendering.
function initializeFirebaseServices() {
  if (!getApps().length) {
    // If no app is initialized, create a new one.
    app = initializeApp(firebaseConfig);
  } else {
    // Otherwise, get the already initialized app.
    app = getApp();
  }
  db = getFirestore(app);
}

// Initialize the services right away.
initializeFirebaseServices();

// Export the initialized instances.
export { app, db };
