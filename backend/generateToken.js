// // generateToken.js
// const axios = require('axios');

// // Test user details for local development
// const testUser = {
//   uid: 'test-user-id',
//   email: 'test@example.com',
//   name: 'Test User'
// };

// const kycData = {
//   userId: testUser.uid,
//   email: testUser.email,
//   name: testUser.name,
//   subscriptionId: 'sub_123456'
// };

// // URL for the local server (default port is 3001)
// const url = 'http://localhost:3001/api/kyc/init';

// console.log('Attempting to initiate KYC with the following data:');
// console.log(JSON.stringify(kycData, null, 2));

// axios.post(url, kycData, {
//   headers: {
//     'Content-Type': 'application/json'
//   }
// })
// .then(response => {
//   console.log('\nKYC Initiation Successful:');
//   console.log(JSON.stringify(response.data, null, 2));
// })
// .catch(error => {
//   console.error('\nKYC Initiation Failed:');
//   if (error.response) {
//     console.error('Data:', error.response.data);
//     console.error('Status:', error.response.status);
//     console.error('Headers:', error.response.headers);
//   } else if (error.request) {
//     console.error('Could not connect to the server. Is it running?');
const axios = require('axios');
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');

// Initialize Firebase Admin with your service account
const serviceAccount = require('./src/config/firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialize Firebase client with all required config
const firebaseConfig = {
  apiKey: 'AIzaSyBChsAj6J79N7JtrS7-51xzxPlAhSPyxiU',
  authDomain: 'aerobic-acronym-466116-e1.firebaseapp.com',
  projectId: 'aerobic-acronym-466116-e1',
  databaseURL: 'https://aerobic-acronym-466116-e1-default-rtdb.asia-south1.firebasedatabase.app',
  storageBucket: 'aerobic-acronym-466116-e1.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef123456'
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

async function testKYC() {
  try {
    const testUser = {
      uid: 'Dheeraj Gupta',
      email: 'dgupta.iet@gmail.com',
      name: 'Dheeraj Gupta'
    };

    // Create a custom token
    const customToken = await admin.auth().createCustomToken(testUser.uid);

    // Sign in with custom token to get ID token
    console.log('Signing in with custom token...');
    const userCredential = await signInWithCustomToken(auth, customToken);
    console.log('Successfully signed in with custom token');
    
    // Get ID token
    console.log('Getting ID token...');
    const idToken = await userCredential.user.getIdToken();
    console.log('Successfully obtained ID token');
    console.log('Token length:', idToken ? idToken.length : 'No token');

    const kycData = {
      "customer_identifier": "dgupta.iet@gmail.com",
      "customer_name": "Dheeraj Gupta",
      "reference_id": "ref_123456",  // generate a unique ID for each request
      "subscriptionId": "sub_123456"
    }

    const url = 'https://omkara-backend-725764883240.asia-south1.run.app/api/kyc/init';

    console.log('Attempting to initiate KYC with the following data:');
    console.log(JSON.stringify(kycData, null, 2));

    const response = await axios.post(url, kycData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    });

    console.log('\nKYC Initiation Successful:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\nKYC Initiation Failed:');
    if (error.response) {
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
    } else {
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    }
  }
}

testKYC();