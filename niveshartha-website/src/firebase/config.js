// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCD-_RYC4BhLUfq9mPRCG8MvTPnmDQjgI",
  authDomain: "analyticaladvisors.firebaseapp.com",
  projectId: "analyticaladvisors",
  storageBucket: "analyticaladvisors.firebasestorage.app",
  messagingSenderId: "26353873124",
  appId: "1:26353873124:web:5c26b313da036943ed3cf1"
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

// Initialize Firebase Functions
const functions = getFunctions(app);

export { auth, googleProvider, db, functions };
export default app; 