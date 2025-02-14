import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD6SYd8P5KXBNHHRt5ghpG6NZv9lSbkdX4",
  authDomain: "loanbook-8f8ef.firebaseapp.com",
  projectId: "loanbook-8f8ef",
  storageBucket: "loanbook-8f8ef.firebasestorage.app",
  messagingSenderId: "596133435755",
  appId: "1:596133435755:web:dbb483887ea9b7891b942e",
  measurementId: "G-E4EZZMYL1R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export { app };
