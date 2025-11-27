// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import config from "./config";

/**
 * Firebase Configuration
 * Credentials are loaded from .env file (see services/config.ts)
 * NEVER hardcode credentials in this file!
 */
const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
};

// Initialize Firebase only if config is complete
let db = null;
let app = null;

if (firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
  }
} else {
  console.warn("⚠️  Firebase not initialized - missing configuration in .env");
}

export { db, app };
