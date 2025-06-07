import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const SubscriptionInfo = () => {
  const { currentUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Query subscriptions collection for user's subscriptions
        const subscriptionsRef = collection(db, 'subscriptions');
        const q = query(subscriptionsRef, where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const userSubscriptions = [];
        querySnapshot.forEach((doc) => {
          // Convert Firestore timestamp to JS Date if needed
          const data = doc.data();
          userSubscriptions.push({
            id: doc.id,
            ...data,
            startDate: data.startDate instanceof Date ? data.startDate : data.startDate.toDate(),
            endDate: data.endDate instanceof Date ? data.endDate : data.endDate.toDate()
          });
        });
        
        setSubscriptions(userSubscriptions);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        setError('Failed to load subscription information');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600">{error}</div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscriptions</h3>
        <p className="text-gray-600">You don't have any active subscriptions. Please subscribe to access premium features.</p>
      </div>
    );
  }

  // Sort subscriptions: active first, then by most recent end date
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const today = new Date();
    const aIsActive = new Date(a.endDate) >= today && a.status === 'active';
    const bIsActive = new Date(b.endDate) >= today && b.status === 'active';
    
    // If one is active and the other isn't, active comes first
    if (aIsActive !== bIsActive) {
      return aIsActive ? -1 : 1;
    }
    
    // If both are active or both are inactive, sort by end date (most recent first)
    return b.endDate - a.endDate;
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Subscriptions</h3>
      
      <div className="space-y-6">
        {sortedSubscriptions.map((subscription) => {
          // Calculate days remaining
          const endDate = new Date(subscription.endDate);
          const today = new Date();
          const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={subscription.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div key={`${subscription.id}-header`} className="flex items-center justify-between mb-4 border-b pb-2">
                <h4 key={`${subscription.id}-title`} className="text-lg font-medium text-gray-900">
                  {subscription.planName} Plan
                </h4>
                <span 
                  key={`${subscription.id}-status`}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    daysRemaining > 0 
                      ? (subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {daysRemaining > 0 
                    ? (subscription.status === 'active' ? 'Active' : 'Pending')
                    : 'Expired'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div key={`${subscription.id}-price`} className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium text-gray-900">{subscription.price}</span>
                </div>

                <div key={`${subscription.id}-start-date`} className="flex justify-between items-center">
                  <span className="text-gray-600">Started On</span>
                  <span className="font-medium text-gray-900">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </span>
                </div>

                <div key={`${subscription.id}-end-date`} className="flex justify-between items-center">
                  <span className="text-gray-600">Expires On</span>
                  <span className="font-medium text-gray-900">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div key={`${subscription.id}-status`}>
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    daysRemaining <= 0 
                      ? 'text-red-600' 
                      : daysRemaining <= 7 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                  }`}>
                    {daysRemaining > 0 
                      ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                      : 'Expired'}
                  </span>
                </div>

                <div key={`${subscription.id}-payment-id`}>
                  <span className="text-gray-600">Payment ID</span>
                  <span className="font-medium text-gray-900 text-sm truncate max-w-[120px]">
                    {subscription.paymentId}
                  </span>
                </div>
              </div>

              {daysRemaining <= 7 && daysRemaining > 0 && (
                <div key={`${subscription.id}-expiration-warning`} className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    Your {subscription.planName} subscription will expire in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Please renew to continue accessing premium features.
                  </p>
                </div>
              )}
              {daysRemaining <= 0 && (
                <div key={`${subscription.id}-expired-warning`} className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    Your {subscription.planName} subscription has expired on {new Date(subscription.endDate).toLocaleDateString()}. 
                    Please renew to continue accessing premium features.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionInfo; 