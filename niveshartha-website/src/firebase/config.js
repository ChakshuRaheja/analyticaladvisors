// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBChsAj6J79N7JtrS7-51xzxPlAhSPyxiU",
  authDomain: "aerobic-acronym-466116-e1.firebaseapp.com",
  projectId: "aerobic-acronym-466116-e1",
  storageBucket: "aerobic-acronym-466116-e1.firebasestorage.app",
  messagingSenderId: "725764883240",
  appId: "1:725764883240:web:638b6870cf7b04b530861d",
  measurementId: "G-9KVV5RFHF8"
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Authentication
const auth = getAuth(app);
auth.useDeviceLanguage(); // Use the device's preferred language

// Function to send welcome email (implementation moved to emailService.js)

// Set up Google provider
const googleProvider = new GoogleAuthProvider();
// Add scopes for profile and email
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
// Set custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Functions
const functions = getFunctions(app);

export { auth, googleProvider, db, functions, storage };
export default app; 