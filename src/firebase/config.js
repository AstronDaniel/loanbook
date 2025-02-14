import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD6SYd8P5KXBNHHRt5ghpG6NZv9lSbkdX4",
  authDomain: "loanbook-8f8ef.firebaseapp.com",
  projectId: "loanbook-8f8ef",
  storageBucket: "loanbook-8f8ef.appspot.com",
  messagingSenderId: "596133435755",
  appId: "1:596133435755:web:dbb483887ea9b7891b942e",
  measurementId: "G-E4EZZMYL1R"
};

let app;
let db;
let auth;

const initializeFirebase = async () => {
    try {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApps()[0];
        }
        
        db = getFirestore(app);
        auth = getAuth(app);
        
        return { app, db, auth };
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
    }
};

// Initialize Firebase immediately
const firebaseInstance = initializeFirebase();

// Export promise-based instances
export const getFirebaseInstances = async () => await firebaseInstance;
export { app, db, auth };
