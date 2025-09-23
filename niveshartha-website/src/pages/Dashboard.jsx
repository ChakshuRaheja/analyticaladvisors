import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user's subscriptions
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
        
        // Debug: Log raw subscription data
        console.log('Raw subscription data:', userSubscriptions);
        
        // Create a new array with proper date objects
        const subscriptionsWithDates = userSubscriptions.map(sub => ({
          ...sub,
          startDateObj: sub.startDate instanceof Date ? sub.startDate : new Date(sub.startDate),
          endDateObj: sub.endDate instanceof Date ? sub.endDate : new Date(sub.endDate)
        }));
        
        // Sort by start date (most recent first)
        const sortedSubscriptions = [...subscriptionsWithDates].sort((a, b) => {
          return b.startDateObj - a.startDateObj; // Newest first
        });
        
        console.log('Sorted subscriptions:', sortedSubscriptions);
        setSubscriptions(sortedSubscriptions);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          
          {loading ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {/* Welcome Card */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome, {currentUser?.displayName || currentUser?.email || 'User'}
                </h2>
                <p className="text-gray-600">
                  {subscriptions.length > 0 
                    ? 'Here\'s an overview of your subscriptions and account details.' 
                    : 'Get started by subscribing to one of our plans.'}
                </p>
              </div>

              {/* Subscription Summary Card */}
              <div className="bg-white shadow rounded-lg p-6 border-t-4 border-teal-500">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                  Account Information
                </h2>
                
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">You don't have any active subscriptions.</p>
                    <Link 
                      to="/subscription" 
                      className="inline-block px-5 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      View Subscription Plans
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {subscriptions.map((subscription) => {
                      // Calculate days remaining and check if plan is expired
                      const endDate = new Date(subscription.endDate);
                      const today = new Date();
                      const timeDifference = endDate - today;
                      const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
                      const isExpired = timeDifference < 0;
                      const subscriptionStatus = isExpired ? 'expired' : subscription.status;
                      
                      return (
                        <div key={subscription.id} className="border border-gray-200 rounded-lg p-5">
                          <div className="flex flex-wrap justify-between items-center mb-4 pb-2 border-b">
                            <h3 className="text-lg font-medium text-gray-900">{subscription.planName} Plan</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 
                                subscriptionStatus === 'expired' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {subscriptionStatus === 'active' ? 'Active' : 
                                 subscriptionStatus === 'expired' ? 'Expired' : 'Pending'}
                              </span>
                              {!isExpired && (
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  daysRemaining <= 7 ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                                </span>
                              )}
                              {isExpired && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                  Expired
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium">{subscription.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Purchased:</span>
                              <span className="font-medium">
                                {new Date(subscription.startDate).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expires:</span>
                              <span className="font-medium">{new Date(subscription.endDate).toLocaleDateString('en-GB')}</span>
                            </div>

                          </div>
                          
                          {!isExpired && daysRemaining <= 7 && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-yellow-800 text-sm">
                                <span className="font-medium">Expiring soon: </span>
                                Your {subscription.planName} plan will expire in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
                                Please renew to continue accessing premium features.
                              </p>
                            </div>
                          )}
                          {isExpired && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-800 text-sm">
                                <span className="font-medium">Subscription expired: </span>
                                Your {subscription.planName} plan has expired on {endDate.toLocaleDateString('en-GB')}.
                                Please renew to continue accessing premium features.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-gray-600">
                        You have {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
                      </span>
                      <Link 
                        to="/subscription" 
                        className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Add Another Plan
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick Links Section */}
              <div className="bg-white shadow rounded-lg p-6 border-t-4 border-teal-500">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <Link to="/settings?section=profile" className="p-4 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-colors">
                    <h3 className="font-medium text-teal-600 mb-1">Profile Settings</h3>
                    <p className="text-sm text-gray-600">Update your personal information</p>
                  </Link>
                  <Link to="/subscription" className="p-4 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-colors">
                    <h3 className="font-medium text-teal-600 mb-1">Subscription Plans</h3>
                    <p className="text-sm text-gray-600">Explore available subscription options</p>
                  </Link>
                  <Link to="/settings?section=kyc" className="p-4 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-colors">
                    <h3 className="font-medium text-teal-600 mb-1">KYC Verification</h3>
                    <p className="text-sm text-gray-600">Complete your identity verification</p>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 