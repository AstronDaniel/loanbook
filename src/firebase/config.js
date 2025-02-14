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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Pass app instance explicitly
const auth = getAuth(app);     // Pass app instance explicitly

export { db, auth };
