import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaSync, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';

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
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
              <button 
                onClick={() => window.location.reload()} 
                className="ml-2 text-sm font-medium text-red-700 underline hover:text-red-600"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          <FaClock className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscriptions</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You don't have any active subscriptions. Use the 'Upgrade Plan' button above to access premium features and insights.
        </p>
      </div>
    );
  }

  // Sort subscriptions: active first, then by most recent end date
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const today = new Date();
    const aEndDate = a.endDate.toDate ? a.endDate.toDate() : new Date(a.endDate);
    const bEndDate = b.endDate.toDate ? b.endDate.toDate() : new Date(b.endDate);
    
    const aIsActive = aEndDate >= today && a.status === 'active';
    const bIsActive = bEndDate >= today && b.status === 'active';
    
    // If one is active and the other isn't, active comes first
    if (aIsActive !== bIsActive) {
      return aIsActive ? -1 : 1;
    }
    
    // If both are active or both are inactive, sort by end date (most recent first)
    return bEndDate - aEndDate;
  });
  
  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount === 'number') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    return amount; // Return as is if it's not a number
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Subscriptions</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your active and past subscriptions</p>
        </div>
        <button
          onClick={() => window.location.href = '/subscription'}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Upgrade Plan
        </button>
      </div>
      
      <div className="space-y-6">
        {sortedSubscriptions.map((subscription) => {
          // Calculate days remaining
          const endDate = new Date(subscription.endDate);
          const today = new Date();
          const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={subscription.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {subscription.planName} Plan
                    </h3>
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {subscription.planId || 'Standard'}
                    </span>
                  </div>
                  <span 
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      daysRemaining > 0 
                        ? (subscription.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800')
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {daysRemaining > 0 
                      ? (subscription.status === 'active' 
                          ? <><FaCheckCircle className="mr-1.5 h-4 w-4" /> Active</> 
                          : <><FaClock className="mr-1.5 h-4 w-4" /> Pending</>)
                      : 'Expired'}
                  </span>
                </div>
              </div>

              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Subscription ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{subscription.subscriptionId || 'N/A'}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatCurrency(subscription.price)} {subscription.planType === 'yearly' ? '/year' : subscription.planType === 'monthly' ? '/month' : ''}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Billing Cycle</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {subscription.planType || 'One-time'}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Started On</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(subscription.startDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Expires On</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(subscription.endDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        daysRemaining <= 0 
                          ? 'bg-red-100 text-red-800' 
                          : daysRemaining <= 7 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {daysRemaining > 0 
                          ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                          : 'Expired'}
                      </span>
                    </dd>
                  </div>
                  
                  {subscription.paymentId && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                        {subscription.paymentId}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              
              {(daysRemaining <= 7 || daysRemaining <= 0) && (
                <div className={`px-6 py-4 ${
                  daysRemaining <= 0 
                    ? 'bg-red-50 border-t border-red-200' 
                    : 'bg-yellow-50 border-t border-yellow-200'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {daysRemaining <= 0 ? (
                        <FaExclamationTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                      ) : (
                        <FaClock className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm ${
                        daysRemaining <= 0 ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        {daysRemaining <= 0 ? (
                          <>
                            Your {subscription.planName} subscription expired on {new Date(subscription.endDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}. 
                            <a href="/subscription" className="font-medium underline ml-1">Renew now</a> to continue accessing premium features.
                          </>
                        ) : (
                          <>
                            Your {subscription.planName} subscription will expire in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. 
                            <a href="/subscription" className="font-medium underline ml-1">Renew early</a> to avoid any interruption.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
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