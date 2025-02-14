import { initializeApp } from 'firebase/app';
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

let firebaseInstance = null;
let dbInstance = null;
let authInstance = null;

try {
    firebaseInstance = initializeApp(firebaseConfig);
    dbInstance = getFirestore(firebaseInstance);
    authInstance = getAuth(firebaseInstance);
} catch (error) {
    if (!/already exists/.test(error.message)) {
        console.error('Firebase initialization error', error.stack);
    }
}

export const app = firebaseInstance;
export const db = dbInstance;
export const auth = authInstance;
