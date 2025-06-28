import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB34TkApBgqMogitZmUT0m2ox8dnfXzz7M",
  authDomain: "lod-crm-systems.firebaseapp.com",
  projectId: "lod-crm-systems",
  storageBucket: "lod-crm-systems.firebasestorage.app",
  messagingSenderId: "213617984462",
  appId: "1:213617984462:web:3c13d7b4a8d5663ec0619f"
};

// Check if config is properly set up
const isConfigValid = firebaseConfig.apiKey !== "your-api-key" && 
                     firebaseConfig.projectId !== "your-project-id";

if (!isConfigValid) {
  console.error('Firebase configuration not set up properly. Please update src/firebase.js with your actual Firebase config values.');
}

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create a mock db object that will throw helpful errors
  db = {
    collection: () => {
      throw new Error('Firebase not properly configured. Please update src/firebase.js with your actual Firebase config values.');
    }
  };
}

export { db };
export default app; 