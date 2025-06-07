import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScrollAnimation from '../components/ScrollAnimation';
import { doc, setDoc, collection, addDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createOrder, verifyPayment, loadRazorpayScript } from '../services/payment.service';

// Backend API URL for error messages
const API_BASE_URL = 'http://localhost:3001';

// Add a separate direct API call function for testing
const makeDirectApiCall = async (url, method, data) => {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { text: responseText };
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      data: responseData
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
      stack: error.stack
    };
  }
};

const Subscription = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loadingPlans, setLoadingPlans] = useState({});
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get Razorpay key from environment variables with fallback to test key
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_OoxElqgmaEVe1I'; // Fallback to test key

  // Validate Razorpay configuration
  useEffect(() => {
    if (!razorpayKeyId) {
      setError('Razorpay configuration error. Please contact support.');
      setLoading(false);
      return;
    }

    // Validate key format
    if (!razorpayKeyId.startsWith('rzp_') || razorpayKeyId.length < 10) {
      setError('Invalid Razorpay key format. Please contact support.');
      setLoading(false);
      return;
    }

    // Load Razorpay script
    const loadRazorpay = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          setRazorpayLoaded(true);
          setLoading(false);
        };
        script.onerror = (err) => {
          setError('Failed to load Razorpay. Please check your internet connection.');
          setLoading(false);
          console.error('Razorpay script error:', err);
        };
        document.body.appendChild(script);
      } catch (err) {
        setError('Failed to initialize Razorpay. Please try again later.');
        setLoading(false);
        console.error('Razorpay initialization error:', err);
      }
    };

    loadRazorpay();
  }, [razorpayKeyId]);

  // Fetch user subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch subscriptions from Firestore
        const subscriptionsRef = collection(db, 'subscriptions');
        const q = query(subscriptionsRef, where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const subscriptions = [];
        querySnapshot.forEach((doc) => {
          subscriptions.push({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate?.toDate(),
            endDate: doc.data().endDate?.toDate()
          });
        });
        
        setUserSubscriptions(subscriptions);
      } catch (err) {
        setError('Failed to fetch subscription information. Please try again.');
        console.error('Subscription fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchSubscriptions();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // This effect is now combined with the first one to maintain hooks order

  // Function to fetch user's subscriptions
  const fetchUserSubscriptions = async () => {
    try {
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(subscriptionsRef, where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const subscriptions = [];
      querySnapshot.forEach((doc) => {
        subscriptions.push({ id: doc.id, ...doc.data() });
      });
      
      setUserSubscriptions(subscriptions);
      console.log('User subscriptions:', subscriptions);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 999, // in INR (₹999)
      displayPrice: '₹999',
      period: 'month',
      features: [
        'Basic market analysis',
        'Daily stock recommendations',
        'Email alerts',
        'Basic technical analysis',
        'Market news updates'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 2999, // in INR (₹2,999)
      displayPrice: '₹2,999',
      period: 'month',
      features: [
        'Advanced market analysis',
        'Real-time stock recommendations',
        'Priority email alerts',
        'Advanced technical analysis',
        'Market news updates',
        'Portfolio tracking',
        'Expert support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 4999, // in INR (₹4,999)
      displayPrice: '₹4,999',
      period: 'month',
      features: [
        'Premium market analysis',
        'Real-time stock recommendations',
        'Instant alerts',
        'Premium technical analysis',
        'Market news updates',
        'Portfolio tracking',
        'Priority expert support',
        'Custom reports',
        'API access'
      ]
    }
  ];

  const handleSubscribe = async (plan) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Set loading state only for the selected plan
    setLoadingPlans(prev => ({ ...prev, [plan.id]: true }));
    setError('');
    setSelectedPlan(plan);

    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setError('Failed to load payment gateway. Please refresh the page and try again.');
          setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
          return;
        }
      }

      console.log(`Creating order for plan: ${plan.name}, price: ${plan.price}`);

      try {
        // First, create order through backend
        const order = await createOrder(
          plan.price, // Price in INR
          'INR',
          `order_${Date.now()}`,
          {
            planId: plan.id,
            userId: currentUser.uid,
          }
        );

        console.log('Order created successfully:', order);

        // Prepare checkout options
        const options = {
          key: razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          name: "Analytical Advisors",
          description: `${plan.name} Plan`,
          order_id: order.id,
          prefill: {
            name: currentUser.displayName || "Test User",
            email: currentUser.email || "test@example.com",
            contact: currentUser.phoneNumber || "9999999999"
          },
          notes: {
            address: "India"
          },
          config: {
            display: {
              blocks: {
                international: {
                  countries: ['IN'], // Restrict to India
                },
              },
              sequence: ['block.international'],
              preferences: {
                show_default_blocks: true
              }
            }
          },
          handler: async function(response) {
            // Payment successful, verify with backend
            try {
              console.log('Payment successful, verifying:', response);
              
              // Verify payment with backend
              const paymentDetails = await verifyPayment(response);
              console.log("Payment verified successfully", paymentDetails);
              
              // Save subscription to Firestore
              await saveSubscription(plan, response);
            } catch (error) {
              console.error("Payment verification failed:", error);
              setError(`Payment verification failed: ${error.message}`);
              setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
            }
          },
          modal: {
            ondismiss: function() {
              setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
              console.log("Payment modal dismissed");
            }
          },
          theme: {
            color: "#3399cc"
          }
        };

        console.log("Opening Razorpay with options", {...options, key: "***hidden***"});

        // Initialize Razorpay
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function(response) {
          console.error('Payment failed:', response.error);
          setError(`Payment failed: ${response.error.description}`);
          setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
        });
        paymentObject.open();
      } catch (error) {
        console.error('Error creating order:', error);
        
        // If it's a connection error, show a more helpful message
        if (error.message.includes('connect to payment server')) {
          setError(`Backend connection error: ${error.message}. Please check that the backend server is running at ${API_BASE_URL}`);
        } else {
          setError(`Order creation failed: ${error.message}`);
        }
        setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError(`Failed to initiate payment: ${error.message}`);
      setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  const saveSubscription = async (plan, paymentResponse) => {
    try {
      console.log('Saving subscription to Firestore:', { plan, paymentResponse });
      
      // Check if user has completed their profile
      const userProfileRef = doc(db, 'userProfiles', currentUser.uid);
      const userProfileSnap = await getDoc(userProfileRef);
      const hasCompletedProfile = userProfileSnap.exists() && userProfileSnap.data().riskProfile;
      
      // Generate a unique subscription ID
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add subscription to the subscriptions collection
      await addDoc(collection(db, 'subscriptions'), {
        subscriptionId,
        userId: currentUser.uid,
        planId: plan.id,
        planName: plan.name,
        price: plan.displayPrice,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
        timestamp: new Date()
      });

      console.log('Subscription saved successfully');
      
      // Refresh user subscriptions
      await fetchUserSubscriptions();

      // Show success message
      setError(`Payment successful for ${plan.name}! Your subscription is now active.`);
      
      // Redirect based on profile completion status
      if (hasCompletedProfile) {
        // If profile is already completed, go to dashboard
        navigate('/control-panel?section=dashboard');
      } else {
        // If profile is not completed, go to profile section
        navigate('/control-panel?section=profile');
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
      setError('Payment successful but failed to activate subscription. Please contact support.');
    } finally {
      setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <ScrollAnimation animation="from-bottom" delay={0.2}>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600">Select the perfect plan for your investment needs</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
              {error.includes('connect to payment server') && (
                <div className="mt-2 text-sm text-red-700">
                  <p className="font-semibold">Troubleshooting:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Check that the backend server is running</li>
                    <li>Make sure the server is running on port 3001</li>
                    <li>Check for CORS or network connectivity issues</li>
                  </ul>
                </div>
              )}
            </div>
          )}


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 ${
                  selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h2>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.displayPrice}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlans[plan.id]}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                    loadingPlans[plan.id]
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loadingPlans[plan.id] ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default Subscription;