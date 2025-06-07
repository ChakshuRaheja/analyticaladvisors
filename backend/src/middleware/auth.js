const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin if not already initialized and if enabled
if (!admin.apps.length && process.env.FIREBASE_ENABLED !== 'false') {
  try {
    // Check if we can require the service account file
    let credential = null;
    try {
      const serviceAccount = require('../config/firebase-service-account.json');
      credential = admin.credential.cert(serviceAccount);
    } catch (e) {
      // If service account file doesn't exist or is invalid, use application default credentials
      console.warn('Firebase service account file not found or invalid, using application default credentials');
      credential = admin.credential.applicationDefault();
    }
    
    admin.initializeApp({
      credential: credential
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.warn('Continuing without Firebase authentication. Some features may not work.');
  }
} else if (process.env.FIREBASE_ENABLED === 'false') {
  console.log('Firebase authentication disabled by configuration');
}

const authenticateUser = async (req, res, next) => {
  // For development, bypass authentication
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Bypassing authentication');
    req.user = {
      uid: 'test-user-id',
      email: 'test@example.com'
    };
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Only verify token if Firebase Admin is initialized
    if (admin.apps.length) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
    } else {
      console.warn('Firebase Admin not initialized, using token as user ID');
      req.user = {
        uid: token,
        email: 'unknown@example.com'
      };
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
};

module.exports = {
  authenticateUser
}; 