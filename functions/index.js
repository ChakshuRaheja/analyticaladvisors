const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

/**
 * Scheduled function that runs every 60 minutes to check for and expire subscriptions
 */
exports.checkAndExpireSubscriptions = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async (context) => {
    try {
      console.log('Checking for expired subscriptions...');
      
      // Get current timestamp
      const now = admin.firestore.Timestamp.now();
      
      // Query all active subscriptions that have an endDate in the past
      const expiredSubscriptions = await db
        .collection('subscriptions')
        .where('status', '==', 'active')
        .where('endDate', '<', now)
        .get();
      
      console.log(`Found ${expiredSubscriptions.size} expired subscriptions to update`);
      
      // Update each expired subscription
      const batch = db.batch();
      const updates = [];
      
      expiredSubscriptions.forEach((doc) => {
        const subscriptionRef = db.collection('subscriptions').doc(doc.id);
        batch.update(subscriptionRef, { status: 'expired' });
        updates.push(doc.id);
      });
      
      // Commit the batch update
      if (updates.length > 0) {
        await batch.commit();
        console.log(`Successfully updated ${updates.length} subscriptions to expired status`);
      }
      
      return null;
    } catch (error) {
      console.error('Error in checkAndExpireSubscriptions:', error);
      throw error;
    }
  });

// CORS configuration
const cors = require('cors')({ 
  origin: [
    'https://analyticaladvisors.web.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

/**
 * Function to update subscription status when endDate is reached
 * This is a callable function that can be triggered from the client side
 */
exports.updateSubscriptionStatus = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  return cors(req, res, async () => {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    try {

      // Verify authentication from headers for HTTP requests
      const authHeader = req.headers.authorization || '';
      if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const idToken = authHeader.split('Bearer ')[1];
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

    const userId = decodedToken.uid;
    const now = admin.firestore.Timestamp.now();
    
    // Get the user's active subscription
    const subscriptions = await db
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .where('endDate', '<', now)
      .get();
    
    if (subscriptions.empty) {
      return { updated: false, message: 'No expired subscriptions found' };
    }
    
    // Update all expired subscriptions
    const batch = db.batch();
    const updates = [];
    
    subscriptions.forEach((doc) => {
      const subscriptionRef = db.collection('subscriptions').doc(doc.id);
      batch.update(subscriptionRef, { status: 'expired' });
      updates.push(doc.id);
    });
    
    await batch.commit();
    
    res.status(200).json({ 
      updated: true, 
      message: `Updated ${updates.length} subscription(s) to expired status`,
      updatedIds: updates
    });
      
    } catch (error) {
      console.error('Error updating subscription status:', error);
      res.status(500).json({ error: error.message });
    }
  });
});
