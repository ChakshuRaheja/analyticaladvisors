import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollAnimation from '../components/ScrollAnimation';
import { doc, setDoc, collection, addDoc, getDoc, getDocs,updateDoc, query, where, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createOrder, verifyPayment, loadRazorpayScript } from '../services/payment.service';
import { initiateKYC } from '../services/kyc.service';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FreeTrialCard from '../components/FreeTrialCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag, FaTimes } from "react-icons/fa";

// Helper function to safely get environment variables
const getEnv = (key, fallback = '') => {
  // First try Vite's import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  // Then try window.env (set in public/env.js)
  if (typeof window !== 'undefined' && window.env && window.env[key]) {
    return window.env[key];
  }
  // Fallback to process.env (for Create React App)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};
// Get API base URL with fallback
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
};


// Use the API base URL
const API_BASE_URL = getApiBaseUrl();

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
  const [selectedDuration, setSelectedDuration] = useState('Monthly');
  const location = useLocation();
  const [showKycPopup, setShowKycPopup] = useState(false);
  const isSubscriptionPage = location.pathname === '/subscription';
  const [hasActiveTrial, setHasActiveTrial] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponCodeTag, setCouponCodeTag] = useState('');
  const [couponError, setCouponError] = useState('');
  const [priceAfterDiscount, setPriceAfterDiscount] = useState(null);
  const [priceBeforeDiscount, setPriceBeforeDiscount] = useState(null);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [couponUsedCount, setCouponUsedCount] = useState(null);


  useEffect(() => {
    if (showCouponModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCouponModal]);

  // Close handler
  const closeModal = () => {
    setShowCouponModal(false);
    setIsDiscountApplied(false);
    setDiscountValue(0);
    setCouponCodeTag('');
    setCouponCode('');
    setCouponError('');
  };

  const CouponTag = ({ code, onRemove }) => {
    return (
      <div className="flex items-center bg-blue-700 text-white px-4 py-2 rounded-full space-x-2 w-fit">
        <FaTag className="text-white" />
        <span className="uppercase font-medium tracking-wide">{code}</span>
        <button onClick={onRemove} className="focus:outline-none hover:opacity-80">
          <FaTimes />
        </button>
      </div>
    );
  }

  const checkIsTrialActive = async() => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      if (userData?.trialActive !== undefined) {
        setIsTrialActive(userData.trialActive);
      }
    } catch (err) {
      console.error('Failed to check trial status:', err);
    }
  }

  useEffect(() => {
    if (currentUser?.uid) {
      checkIsTrialActive();
    }
  }, [currentUser]);

// Check if user has an active trial
useEffect(() => {
  const checkTrialStatus = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(
        subscriptionsRef,
        where("userId", "==", currentUser.uid),
        where("isTrial", "==", true),
        where("endDate", ">", new Date().toISOString())
      );
      
      const querySnapshot = await getDocs(q);
      const hasTrial = !querySnapshot.empty;
      setHasActiveTrial(hasTrial);
      
      if (hasTrial && querySnapshot.docs[0]?.data()?.endDate) {
        setTrialEndDate(querySnapshot.docs[0].data().endDate);
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  };

  checkTrialStatus();
}, [currentUser]);

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

        const subscriptionsRef = collection(db, 'subscriptions');
        const q = query(subscriptionsRef, where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const subscriptions = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const startDate = data.startDate 
            ? (typeof data.startDate.toDate === 'function' 
                ? data.startDate.toDate() 
                : (data.startDate instanceof Date 
                    ? data.startDate 
                    : new Date(data.startDate)))
            : null;
          
          const endDate = data.endDate 
            ? (typeof data.endDate.toDate === 'function' 
                ? data.endDate.toDate() 
                : (data.endDate instanceof Date 
                    ? data.endDate 
                    : new Date(data.endDate)))
            : null;

          subscriptions.push({
            id: doc.id,
            ...data,
            startDate: startDate,
            endDate: endDate
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
      id: 'equity-investing',
      name: 'Equity Investing',
      subtitle: 'For long-term wealth creation',
      description: 'In-depth research for serious investors',
      originalPrice: 4999,
      price: 4999,
      period: 'month',
      features: [
        'Fewer, but more in-depth, long-term investment recommendations',
        'Emphasize a longer holding period (years or more)',
        'Detailed fundamental analysis, valuation, and long-term growth prospects',
        'Clear entry zones',
        'Less frequent alerts, primarily for significant news, rebalancing, or exit signals',
        'Stock of Month: Research report on one stock recommended by analysts'
      ],
      buttonText: 'Start Investing',
      pricing: [
        { duration: 'Monthly', price: '₹2,499'},
        { duration: 'Quarterly', price: '₹6,499'},
        { duration: 'Half-Yearly', price: '₹11,999'}
      ]
    },
    {
      id: 'swing-equity',
      name: 'Swing Trading – Equity',
      subtitle: 'For active traders looking for short to medium-term opportunities',
      description: 'High-probability trade ideas with clear entry and exit points',
      originalPrice: 4999,
      price: 4999,
      period: 'month',
      features: [
        '7-10 high-probability recommendations per month',
        '2–6 week trade duration',
        'Real-time alerts via Whatsapp',
        'Monthly performance report',
        'Segments: Cash, Derivates, Index, ETF',
        'Stock of Month: Research report on one stock recommended by analysts'
      ],
      buttonText: 'Start Trading',
      pricing: [
        { duration: 'Monthly', price: '₹2,499'},
        { duration: 'Quarterly', price: '₹6,499'},
        { duration: 'Half-Yearly', price: '₹11,999'}
      ]
    },
    {
      id: 'swing-commodity',
      name: 'Swing Trading – Commodity',
      subtitle: 'For traders interested in commodity markets',
      description: 'Expert analysis and signals for commodity trading',
      originalPrice: 4999,
      price: 4999,
      period: 'month',
      features: [
        '7-10 high-probability recommendations per month',
        '2–6 week trade duration',
        'Real-time alerts via Whatsapp',
        'Monthly performance report',
        'Commodity Specifics: Gold, Silver, Copper, Zinc, Aluminium, Lead, Crude Oil and Natural Gas',
        'Stock of Month: Research report on one stock recommended by analysts'
      ],
      buttonText: 'Trade Commodities',
      pricing: [
        { duration: 'Monthly', price: '₹2,499' },
        { duration: 'Quarterly', price: '₹6,499'},
        { duration: 'Half-Yearly', price: '₹11,999'}
      ]
    },
    {
      id: 'stock-of-month',
      name: 'Stock of the Month',
      subtitle: 'For investors who want quality over quantity',
      description: 'One carefully researched stock pick every month',
      // originalPrice: 299,
      // price: 299,
      period: 'month',
      features: [
        'One premium research report per month',
        'Covers fundamentals, valuation, growth, and entry levels',
        'Ideal for beginners & DIY investors',
        'Actionable insights backed by analyst research',
        'Save more with quarterly or half-yearly plans'
      ],
      buttonText: 'Get Started',
      pricing: [
        { duration: 'Monthly', price: '₹99'},
        { duration: 'Quarterly', price: '₹249'},
        { duration: 'Half-Yearly', price: '₹449'},
      ]
    },
    {
      id: 'diy-screener',
      name: 'DIY Stock Screener',
      subtitle: 'For self-directed investors who want to find their own opportunities',
      description: 'Powerful stock screening and analysis tools at your fingertips',
      originalPrice: 99,
      price: 99,
      period: 'month',
      features: [
        'Advanced stock screener with custom parameters',
        'Access to fundamental analysis metrics',
        'Real-time market data and price updates',
        'User-friendly interface for easy navigation',
        'Filter by market cap, P/E ratio, dividend yield, and growth rates',
        'Save and track your favorite stocks',
        'Full access to analysis page with detailed insights',
        'Export data for your personal research',
        'Regular updates and new features',
        'Save more with quarterly or half-yearly plans'
      ],
      buttonText: 'Access Analysis Tools',
      pricing: [
        { duration: 'Monthly', price: '₹99'},
        { duration: 'Quarterly', price: '₹249'},
        { duration: 'Half-Yearly', price: '₹449'},
        // { duration: 'Quarterly', price: '₹250', save: 'Save 16%' },
        // { duration: 'Half-Yearly', price: '₹450', save: 'Save 24%' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  // Helper function to get the price for the selected duration
  const getPriceForDuration = (plan, duration) => {

    const pricing = plan.pricing.find(p => p.duration === duration);
    if (!pricing) return plan.price;
    // Extract number from price string (e.g., '₹3,000' -> 3000)
    return parseInt(pricing.price.replace(/[^0-9]/g, ''));
  };

  // Function to calculate end date based on duration
  const calculateEndDate = (duration, startDate) => {

    let endDate = new Date();  
    if(startDate?.toDate && typeof startDate.toDate === 'function'){
      endDate = new Date(startDate.toDate());
    }else{
      endDate = new Date(startDate);
    }

    switch(duration) {
      case 'Quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'Half-Yearly':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'Monthly':
      default:
        endDate.setMonth(endDate.getMonth() + 1);
        break;
    }

    // Subtract 1 day
    endDate.setDate(endDate.getDate() - 1);

    // Set time to 23:59:59.999
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  };

  const calculateDiscount = (discountPercentage, subscriptionPrice) => {
    if(discountPercentage && !Number.isNaN(subscriptionPrice) && subscriptionPrice > 0){
        const discountAmount = (subscriptionPrice * discountPercentage) / 100;
        const roundedOfDiscountAmount = Number((discountAmount).toFixed(2));
        setDiscountValue(roundedOfDiscountAmount);
        return subscriptionPrice - roundedOfDiscountAmount
      }
  }

  const validateCouponCode = async () => {

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const couponsUsed = Array.isArray(userData.couponsUsed) ? userData.couponsUsed : [];

      const hasUsedCoupon = couponsUsed.some(code => code.trim() === couponCode.trim())
      if (hasUsedCoupon){
        setCouponError('You have already used this coupon.');
        return 0;
      }
      
      const couponDoc = await getDoc(doc(db, 'coupons', couponCode));
        let discount = 0;

        if (couponDoc.exists()) {
          const couponData = couponDoc.data();

          if(!couponData.isActive){
            setCouponError('Invalid coupon code.');
            return discount;
          }

          discount = couponData?.discountPercentage ?? 0;
          setCouponUsedCount(couponData?.usedCount ?? 0)        
        }
        else{
          setCouponError('Invalid coupon code.');
        }
        if(discount > 0){
          const Price = calculateDiscount(discount, priceBeforeDiscount);
          const finalPrice = Number((Price).toFixed(2));

          setPriceAfterDiscount(finalPrice);
          setIsDiscountApplied(true);
          setCouponCodeTag(couponCode)  
        }
        
        return discount;  
    } catch (error) {
      setCouponError('Something went wrong while applying the coupon.');
      return 0;
    }
  }

  const isUserLoogedin = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }

  const handleSubscribe = async (plan) => {
    isUserLoogedin();

    // Set loading state only for the selected plan
    setLoadingPlans(prev => ({ ...prev, [plan.id]: true }));
    setError('');
    setSelectedPlan(plan);
    
    let userData = {};
    let userPhone = '';
    
    try {
      // First, fetch the user's profile data from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        userData = userDoc.data();
        userPhone = userData.phoneNumber || '';
      }

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setError('Failed to load payment gateway. Please refresh the page and try again.');
          setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
          return;
        }
      }

      // Get price for the selected duration
      const finalPriceAfterDiscount = priceAfterDiscount;

      try {
        // First, create order through backend
        const order = await createOrder(
          finalPriceAfterDiscount, // Use the price for selected duration
          'INR',
          `order_${Date.now()}`,
          {
            planId: plan.id,
            userId: currentUser.uid,
          }
        );

        console.log('Order created successfully:', order);

        // Prepare checkout options with user data
        const options = {
          key: razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          name: "Analytical Advisors",
          description: `${plan.name} Plan`,
          order_id: order.id,
          prefill: {
            name: (userData.displayName || currentUser.displayName || '').trim(),
            email: (userData.email || currentUser.email || '').trim(),
            contact: userPhone.replace(/\D/g, '') // Remove any non-digit characters
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
              setError(`Payment verification failed: ${error.message || 'Please try again or contact support.'}`);
              setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
            }
          },
          theme: {
            color: "#3399cc"
          }
        };

        console.log("Opening Razorpay with options", {...options, key: "***hidden***"});

        // Initialize Razorpay
        const paymentObject = new window.Razorpay({
          ...options,
          modal: {
            ...options.modal,
            // This handler is called when the user closes the modal without completing the payment
            ondismiss: () => {
              console.log('Payment modal was closed by user');
              setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
            }
          }
        });
        
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
      
      const getActiveSubscriptions = async () => {
        const subscriptionsRef = collection(db, 'subscriptions');
        const q  = query(
          subscriptionsRef,
          where('userId', '==', currentUser.uid),
          where('status', '==', 'active'),
          where('planId', '==',plan.id)
        );

        const now = new Date();
        const querySnapshotForSubscriptions = await getDocs(q);
        const activeSubscriptions = querySnapshotForSubscriptions.docs
          .map(d => d.data())
          .filter(sub => sub?.planId === plan.id && sub?.endDate.toDate() > now)
          .sort((a, b) => b?.endDate.toDate() - a?.endDate.toDate());
        
        console.log('activeSubscriptions: ' + activeSubscriptions[0]);
        return activeSubscriptions;
      }

      const latestActiveSubscription = await getActiveSubscriptions();
      const now = new Date();
      // Generate a unique subscription ID
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get price for the selected duration
      const finalPriceAfterDiscount = priceAfterDiscount;

      // Start date
      const latestStartDate = latestActiveSubscription[0] ? latestActiveSubscription[0].endDate : new Date();

      // Calculate end date based on selected duration
      const endDate = calculateEndDate(selectedDuration, latestStartDate);
      
      // Add subscription to the subscriptions collection
      await addDoc(collection(db, 'subscriptions'), {
        subscriptionId,
        userId: currentUser.uid,
        planId: plan.id,
        planName: plan.name,
        duration: selectedDuration,
        price: finalPriceAfterDiscount,
        status: 'active',
        startDate: typeof latestStartDate?.toDate === 'function' ? latestStartDate.toDate() : latestStartDate,
        endDate: endDate,
        couponUsed: couponCode
        // paymentId: paymentResponse.razorpay_payment_id,
        // orderId: paymentResponse.razorpay_order_id,
        // signature: paymentResponse.razorpay_signature,
        // timestamp: new Date(),
      });

      console.log('Subscription saved successfully');

      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          couponsUsed: arrayUnion(couponCode)
        });

        //update coupon used count
        if(isDiscountApplied && couponUsedCount > -1){
          await updateDoc(doc(db, 'coupons', couponCode), {
            usedCount: couponUsedCount +1
          });
        }
        
        
        // Map plan IDs to template IDs
        const templateMap = {
          'swing-equity': 3,        // Swing Trading Equity
          'swing-commodity': 4,     // Swing Trading Commodity
          'equity-investing': 5,    // Equity Investing
          'stock-of-month': 6,      // Stock of the Month
          'diy-screener': 7,        // DIY Stock Screener
        };
      
        // Get the template ID for the plan, default to 2 (Free Trial) if not found
        const templateId = templateMap[plan.id] || 2;
      
        // Prepare email data
        const emailData = {
          to: currentUser.email,
          name: currentUser.displayName || 'Valued Customer',
          templateId: templateId,
          additionalParams: {
            planName: plan.name,
          }
        };
      
        // Send the email using the email service
        await fetch('https://asia-south1-aerobic-acronym-466116-e1.cloudfunctions.net/sendSubscriptionEmailHTTP', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: emailData.to,
            name: emailData.name,
            templateId: emailData.templateId,
            params: emailData.additionalParams
          })
        });
      
        console.log('Subscription confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send subscription email:', emailError);
        // Don't fail the subscription if email sending fails
      }
      
      // Refresh user subscriptions
      await fetchUserSubscriptions();

      
      // Redirect to stock recommendations page after successful payment
              // Redirect based on plan type
      if (plan.id === 'diy-screener') {
        console.log('Payment successful, redirecting to Analysis page...');
        navigate('/analysis');
      } else {
        console.log('Payment successful, redirecting to stock recommendations...');
        navigate('/stock-recommendations');
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
      setError('Payment successful but failed to activate subscription. Please contact support.');
    } finally {
      setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  return (
    
    <div className={isSubscriptionPage ? "min-h-screen bg-gray-50 py-20" : "bg-teal-50 py-20"}>
      <div className="container mx-auto px-4">
        <ScrollAnimation animation="from-bottom" delay={0.2}>
          <div className="text-center mt-6 mb-12">
            {isSubscriptionPage ?
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
              </h1>
              :
              <h1 className="text-3xl font-bold text-center border-t-4 border-teal-600 inline-block pt-3">
                Our Services
              </h1>
            }
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
          {<FreeTrialCard isTrialActive={isTrialActive}/>}




          <div className="text-center mb-8">
            {/* <div className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full mb-2">
              🎉 Limited Time Offer: 50% OFF on all plans! 🎉
            </div> */}
            <p className="text-gray-600">Hurry! This special introductory offer won't last long.</p>
          </div>

          <div className="space-y-12 w-full px-4 sm:px-6 lg:px-8">
            {/* Duration Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                {['Monthly', 'Quarterly', 'Half-Yearly'].map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-6 py-3 text-sm font-medium ${
                      selectedDuration === duration
                        ? 'bg-teal-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border border-gray-200 ${duration === 'Monthly' ? 'rounded-l-lg' : ''} ${
                      duration === 'Half-Yearly' ? 'rounded-r-lg' : 'border-r-0'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Plans Row - Full width with centered content */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[2000px] px-4">
                {/* First row - Main plans */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mb-8">
                  {plans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl w-full h-full flex flex-col ${
                    selectedPlan === plan.id ? 'ring-2 ring-blue-500 transform scale-105' : 'hover:-translate-y-2'
                  } ${plan.comingSoon ? 'opacity-75' : ''} flex flex-col`}
                >
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                    <p className="text-gray-600 text-sm mb-3">{plan.subtitle}</p>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{plan.description}</p>
                    
                    <div className="mb-6 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-gray-900">
                              {plan.pricing.find(p => p.duration === selectedDuration)?.price || plan.pricing[0].price}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">/{selectedDuration}</span>
                          </div>
                          {plan.pricing.find(p => p.duration === selectedDuration)?.save && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {plan.pricing.find(p => p.duration === selectedDuration)?.save}
                            </span>
                          )}
                        </div>
                        {plan.originalPrice && (
                          <div className="text-sm">
                            <span className="text-gray-500 line-through">
                              ₹{plan.originalPrice * (selectedDuration === 'Monthly' ? 1 : selectedDuration === 'Quarterly' ? 3 : 6)}
                            </span>
                            <span className="ml-2 text-green-600 font-semibold">
                              {(() => {
                                const selectedPrice = getPriceForDuration(plan, selectedDuration);
                                const originalPrice = plan.originalPrice * (selectedDuration === 'Monthly' ? 1 : selectedDuration === 'Quarterly' ? 3 : 6);
                                return Math.round((1 - selectedPrice / originalPrice) * 100) + '% OFF';
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <svg
                            className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
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
                  </div>

                  <button
                    onClick={() => {
                      isUserLoogedin();
                      const price = getPriceForDuration(plan, selectedDuration);
                      setPriceBeforeDiscount(price);
                      setPriceAfterDiscount(price);
                      setShowCouponModal(true);
                      setSelectedPlanForPayment(plan); 
                    }}
                    disabled={loadingPlans[plan.id] || plan.comingSoon}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all duration-200 mt-auto ${
                      loadingPlans[plan.id] || plan.comingSoon
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 hover:shadow-md transform hover:scale-[1.02]'
                    }`}
                  >
                    {loadingPlans[plan.id] 
                      ? 'Processing...' 
                      : plan.comingSoon 
                        ? 'Coming Soon' 
                        : plan.buttonText || 'Subscribe Now'}
                  </button>
                </div>
              ))}
                </div>
              </div>
            </div>
            
            {/* Stock of the Month and DIY Screener - Side by side */}
            <div className="w-full">
              {plans.length > 3 && (
                <div className="w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto px-4">
                    {plans.slice(3).map((plan) => (
                      <div key={plan.id} className="bg-white rounded-2xl shadow-xl p-5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full">
                        <div className="flex-grow">
                          <div className="mb-3">
                            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                            <p className="text-gray-500 text-xs">{plan.subtitle}</p>
                          </div>
                          <div className="mt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">What's Included:</h3>
                            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start text-sm">
                                  <svg
                                    className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                                  <span className="text-gray-600">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-baseline">
                                <span className="text-2xl font-bold text-gray-900">
                                  {plan.pricing.find(p => p.duration === selectedDuration)?.price || plan.pricing[0].price}
                                </span>
                                <span className="text-gray-500 ml-1 text-sm">/{selectedDuration === 'Half-Yearly' ? '6 months' : selectedDuration.toLowerCase()}</span>
                              </div>
                              {(() => {
                                const selectedPricing = plan.pricing.find(p => p.duration === selectedDuration) || plan.pricing[0];
                                const originalPrice = plan.originalPrice * (selectedDuration === 'Monthly' ? 1 : selectedDuration === 'Quarterly' ? 3 : 6);
                                const selectedPrice = parseInt(selectedPricing.price.replace(/[^0-9]/g, ''));
                                
                                return selectedPricing.save ? (
                                  <div className="text-right">
                                    <span className="text-sm text-gray-500 line-through">
                                      ₹{originalPrice}
                                    </span>
                                    <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                      {selectedPricing.save}
                                    </span>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                            
                            <div className="flex space-x-4">
                              <button
                                onClick={() => {
                                  isUserLoogedin();
                                  const price = getPriceForDuration(plan, selectedDuration);
                                  setPriceBeforeDiscount(price);
                                  setPriceAfterDiscount(price);
                                  setShowCouponModal(true);
                                  setSelectedPlanForPayment(plan);
                                }}
                                disabled={loadingPlans[plan.id]}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                                  loadingPlans[plan.id]
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-teal-600 hover:bg-teal-700 hover:shadow-md transform hover:scale-[1.02]'
                                }`}
                              >
                                {loadingPlans[plan.id] ? 'Processing...' : plan.buttonText || 'Get Started'}
                              </button>
                              {plan.id === 'diy-screener' && (
                                <button
                                  onClick={() => navigate('/analysis')}
                                  className="flex-1 py-2.5 px-4 rounded-lg font-medium text-teal-600 border-2 border-teal-600 bg-white hover:bg-teal-50 transition-all duration-200"
                                >
                                  Learn More
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollAnimation>
      </div>
            <AnimatePresence>
              {showCouponModal && (
                <div>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeModal}
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-20"
                  >
                    {/* Modal */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      onClick={(e) => e.stopPropagation()}
                      className="relative w-full max-w-4xl bg-white rounded-xl p-6 shadow-xl overflow-y-auto max-h-4xl"
                    >
                      <h1 className="text-2xl text-teal-600 font-bold mb-4 text-center">Payment Summary</h1>
                      <h3 className="text-xl font-semibold mt-8 mb-12 flex flex-row justify-between">
                        <span className='flex flex-col'>{selectedPlanForPayment.name}: <span className='text-xs'>(One time payment)</span></span> 
                        <span>₹ {priceBeforeDiscount}<span className="text-sm text-gray-500 ml-1">/{selectedDuration}</span></span>
                      </h3> 
                      <h2 className="text-xl font-semibold mb-4 text-center">Apply Coupon</h2>

                      <div className='flex flex-row'>
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          className="w-full border border-gray-300 px-4 py-2 rounded mb-3 mr-5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.trim())
                            setIsDiscountApplied(false)
                            setCouponError('')
                          }}
                          maxLength={10}
                        />
                        <button 
                        className={`px-4 py-2 mb-3 rounded text-white ${isDiscountApplied || couponError ? "bg-gray-600 cursor-not-allowed opacity-60" : "bg-teal-600 hover:bg-teal-700"}`}
                        onClick={ () => {
                          validateCouponCode()
                        }}
                        disabled={isDiscountApplied || couponError}
                        > Apply </button>
                      </div>

                      {/* {coupon code error} */}
                      {couponError && <p className="text-red-500 text-sm mb-2">{couponError}</p>}
                      {couponCodeTag && <CouponTag code={couponCodeTag}
                      onRemove={() => {
                        setPriceAfterDiscount(priceBeforeDiscount); //resting the discount value
                        setCouponCode('')
                        setCouponCodeTag('')
                        setIsDiscountApplied(false)
                        setDiscountValue(0)
                        setCouponCode('')
                        setCouponError('')
                        }} />}

                      <h2 className="text-xl font-semibold mt-4 mb-4 flex flex-row justify-between">Discount: 
                        <span className='text-red-600'>-  ₹ {discountValue}</span>
                      </h2> 
                      <h3 className="text-xl font-semibold mb-8 flex flex-row justify-between">
                        <span className='flex flex-col'>Payable Amount: <span className='text-xs'>(inclusive all the tax)</span></span>
                        <span className='text-green-600'>₹ {priceAfterDiscount}</span>
                      </h3>
                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          onClick={closeModal}
                          className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubscribe(selectedPlanForPayment)}
                          className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
                        >
                          {loadingPlans[selectedPlanForPayment.id] ? 'Processing...' : 'Continue to Payment'}
                        </button>
                      </div>

                      {/* Close button top-right */}
                      <button
                        onClick={closeModal}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-white rounded-full  hover:bg-red-500 transition-colors"
                        aria-label="Close popup"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 hover:text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
    </div>
  );
};

export default Subscription;