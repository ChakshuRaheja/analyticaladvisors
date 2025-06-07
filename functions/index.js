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

/**
 * Function to update subscription status when endDate is reached
 * This is a callable function that can be triggered from the client side
 */
exports.updateSubscriptionStatus = functions.https.onCall(async (data, context) => {
  try {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to update subscription status.'
      );
    }

    const userId = context.auth.uid;
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
    
    return { 
      updated: true, 
      message: `Updated ${updates.length} subscription(s) to expired status`,
      updatedIds: updates
    };
    
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update subscription status',
      error.message
    );
  }
});
