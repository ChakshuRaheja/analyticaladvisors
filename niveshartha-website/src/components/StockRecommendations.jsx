import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { initiateEsign as initiateEsignService, verifyEsignStatus } from '../services/esign.service';
import { toast } from 'react-toastify';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in StockRecommendations:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded m-4">
          <h3 className="font-bold">Something went wrong</h3>
          <p className="text-sm">{this.state.error?.message || 'Unknown error occurred'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Retry utility for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`[Retry ${i + 1}/${retries}] Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error('Max retries reached');
};

// Track column order for each plan based on first data row
const useColumnOrder = () => {
  const [columnOrder, setColumnOrder] = React.useState({});

  const updateColumnOrder = (plan, data) => {
    if (data && data.length > 0) {
      const firstRow = data[0];
      if (firstRow) {
        // Get column order from the first row of data
        const columns = Object.keys(firstRow);
        console.log(`[${plan}] Detected columns:`, columns);
        
        setColumnOrder(prev => {
          // Only update if columns have changed
          if (JSON.stringify(prev[plan]) !== JSON.stringify(columns)) {
            console.log(`[${plan}] Updating column order to:`, columns);
            return {
              ...prev,
              [plan]: columns
            };
          }
          return prev;
        });
      }
    }
  };

  return { columnOrder, updateColumnOrder };
};

// API Configuration
const API_CONFIG = {
  baseUrl: 'https://analytics-advisor-backend-1-583205731005.us-central1.run.app',
  endpoints: {
    swing_equity: '/get_swingtrading_equity',
    swing_commodity: '/get_swingtrading_commodity',
    equity_investing: '/get_equityinvesting',
    stock_of_month: '/get_stockofthemonth'
  }
};

// Subscription configuration
const SUBSCRIPTION_CONFIG = {
  swing_equity: {
    name: 'Swing Trading - Equity',
    endpoint: API_CONFIG.endpoints.swing_equity,
    color: 'blue',
    instructions:{
      title: 'Principles of Trading',
      points:[
        'Always use a stop-loss — no exceptions.',
        'Diversify. Never risk more than 4-5% of your capital per instrument.',
        'Book your losses quickly. Let your winners run using trailing stops so you protect profits while still giving the trade room to grow.',
        'Winners manage risk — losers manage hope. Hope has no place on a trading screen.'
      ]
    },
    columns: [
      // { id: 'srNo', label: 'Sr. No', sortable: true },
      { id: 'stock', label: 'Stock', sortable: true },
      { id: 'action', label: 'Action', sortable: true },
      { id: 'entryDate', label: 'Entry Date', sortable: true },
      { id: 'price', label: 'Price', sortable: true },
      { id: 'exitDate', label: 'Exit Date', sortable: true },
      { id: 'target', label: 'Target', sortable: true },
      { id: 'exitPrice', label: 'Exit Price', sortable: true },
      { id: 'stopLoss', label: 'Stop Loss', sortable: true },
      { id: 'pl', label: 'P/L', sortable: true },
      { id: 'update', label: 'Update', sortable: true },
      { id: 'status', label: 'Status', sortable: true }
    ]
  },
  swing_commodity: {
    name: 'Swing Trading - Commodity',
    endpoint: API_CONFIG.endpoints.swing_commodity,
    color: 'green',
    instructions:{
      title: 'Principles of Trading',
      points:[
        'Always use a stop-loss — no exceptions.',
        'Diversify. Never risk more than 4-5% of your capital per instrument.',
        'Book your losses quickly. Let your winners run using trailing stops so you protect profits while still giving the trade room to grow.',
        'Winners manage risk — losers manage hope. Hope has no place on a trading screen.'
      ]
    },
    columns: [
      // { id: 'srNo', label: 'Sr. No', sortable: true },
      { id: 'commodity', label: 'Commodity', sortable: true },
      { id: 'action', label: 'Action', sortable: true },
      { id: 'entryDate', label: 'Entry Date', sortable: true },
      { id: 'price', label: 'Price', sortable: true },
      { id: 'exitDate', label: 'Exit Date', sortable: true },
      { id: 'target', label: 'Target', sortable: true },
      { id: 'exitPrice', label: 'Exit Price', sortable: true },
      { id: 'stopLoss', label: 'Stop Loss', sortable: true },
      { id: 'pl', label: 'P/L', sortable: true },
      { id: 'margin', label: 'Margin', sortable: true },
      { id: 'update', label: 'Update', sortable: true },
      { id: 'status', label: 'Status', sortable: true }
    ]
  },
  equity_investing: {
    name: 'Equity Investing',
    endpoint: API_CONFIG.endpoints.equity_investing,
    color: 'purple',
    instructions:{
      title: 'Client Instructions – Please Read Before Taking Any Action',
      points:[
        'Buy only those stocks which are marked as Buy.',
        'Maintain portfolio allocation as per the advised levels.',
        'The remaining funds may be kept as cash or parked in the Stock of the Month.',
        'Allocation is based on the total capital you plan to invest over the next year.'
      ]
    },
    columns: [
      // { id: 'srNo', label: 'Sr. No', sortable: true },
      { id: 'stockName', label: 'Stock Name', sortable: true },
      { id: 'nseBseCode', label: 'NSE/ BSE Code', sortable: true },
      { id: 'type', label: 'Type', sortable: true },
      { id: 'sector', label: 'Sector', sortable: true },
      { id: 'preferredAllocation', label: 'Preferred Allocation (%)', sortable: true },
      { id: 'recommendation', label: 'Recommendation', sortable: true },
      { id: 'researchReport', label: 'Research Report', sortable: true }
    ]
  },
  stock_of_month: {
    name: 'Stock of the Month',
    endpoint: API_CONFIG.endpoints.stock_of_month,
    color: 'red',
    instructions:{
      title: 'Principles of Trading',
      points:[
        'Always use a stop-loss — no exceptions.',
        'Diversify. Never risk more than 4-5% of your capital per instrument.',
        'Book your losses quickly. Let your winners run using trailing stops so you protect profits while still giving the trade room to grow.',
        'Winners manage risk — losers manage hope. Hope has no place on a trading screen.'
      ]
    },
    columns: [
      // { id: 'srNo', label: 'Sr. No', sortable: true },
      { id: 'stockName', label: 'Stock Name', sortable: true },
      { id: 'nseBseCode', label: 'NSE/ BSE Code', sortable: true },
      { id: 'type', label: 'Type', sortable: true },
      { id: 'sector', label: 'Sector', sortable: true },
      { id: 'preferredAllocation', label: 'Preferred Allocation (%)', sortable: true },
      { id: 'recommendation', label: 'Recommendation', sortable: true },
      { id: 'researchReport', label: 'Research Report', sortable: true }
    ]
  }
};

const colorConfig = {
  blue: {
    active: 'bg-white text-blue-700 border-t-2 border-l-2 border-r-2 border-blue-200',
    inactive: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
  },
  green: {
    active: 'bg-white text-green-700 border-t-2 border-l-2 border-r-2 border-green-200',
    inactive: 'bg-green-100 text-green-600 hover:bg-green-200',
  },
  purple: {
    active: 'bg-white text-purple-700 border-t-2 border-l-2 border-r-2 border-purple-200',
    inactive: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
  },
  red: {
    active: 'bg-white text-red-700 border-t-2 border-l-2 border-r-2 border-red-200',
    inactive: 'bg-red-100 text-red-600 hover:bg-red-200',
  },
};

const planSelectorColorConfig = {
  blue: {
    active: 'bg-blue-100 text-blue-700 border-blue-500',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  },
  green: {
    active: 'bg-green-100 text-green-700 border-green-500',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  },
  purple: {
    active: 'bg-purple-100 text-purple-700 border-purple-500',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  },
  red: {
    active: 'bg-red-100 text-red-700 border-red-500',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
  },
};

const planBadgeColorConfig = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  red: 'bg-red-100 text-red-800',
};

const StockRecommendations = ({ activeSubscriptions = [] }) => {
  const { currentUser } = useAuth();
  const { columnOrder, updateColumnOrder } = useColumnOrder();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [kycStatus, setKycStatus] = useState(null);
  const [isCheckingKyc, setIsCheckingKyc] = useState(true);
  const [showKycPopup, setShowKycPopup] = useState(false);
  const [esignStatus, setEsignStatus] = useState(null);
  const [isCheckingEsign, setIsCheckingEsign] = useState(false);
  const [showEsignPopup, setShowEsignPopup] = useState(false);
  const [kycStatusMessage, setKycStatusMessage] = useState('');
  const [showKycStatusPopup, setShowKycStatusPopup] = useState(false);
  const [esignStatusMessage, setEsignStatusMessage] = useState('');
  const [showEsignStatusPopup, setShowEsignStatusPopup] = useState(false);
  const [kycEsignCompleted, setKycEsignCompleted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [eSignLoading, setESignLoading] = useState(false);

  const handleDigioCancel = () => {
    setShowKycPopup(false);
    setShowEsignPopup(false);
    setKycStatus('not_started');
    setEsignStatus('not_started');
    setKycEsignCompleted(false);
    setKycLoading(false);
    setESignLoading(false);
    toast.info("Process was cancelled. You can try again.");
  };


  const getDigioOptions = (user, callback, onCancelCallback) => ({
    environment: 'sandbox',
    logo: "https://analyticaladvisors.in/logo1.png",
    theme: {
      primaryColor: '#0052cc',
      secondaryColor: '#000000'
    },
    is_iframe: true,
    callback,
    cancel_callback: onCancelCallback
  });

  const hasActiveTrial = async () => {
    if (!currentUser?.uid) return false;
    try {
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(
        subscriptionsRef, 
        where('userId', '==', currentUser.uid),
        where('isTrial', '==', true),
        where('endDate', '>', new Date().toISOString())
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking for active trial:', error);
      return false;
    }
  };
  const getActivePaidSubscriptions = async (currentUser) => {
    if (!currentUser?.uid) return [];
  
    try {
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(
        subscriptionsRef,
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active'),   // only active subscriptions
        where('endDate', '>', new Date())  // still valid
      );
  
      const snapshot = await getDocs(q);
  
      const plans = new Set();
  
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.planId) {
          const normalizedPlanId = data.planId.replace(/-/g, '_');
          if (SUBSCRIPTION_CONFIG[normalizedPlanId]) {
            plans.add(data.planId); // add original plan name
          }
        }
      });
  
      // Convert Set to array and return
      return Array.from(plans);
    } catch (error) {
      console.error("Error fetching active paid subscriptions:", error);
      return [];
    }
  };
  
  

  // Use the activeSubscriptions prop passed from the parent component
  // ✅ Replace this entire section (lines 247-320)
const [activeSubs, setActiveSubs] = useState([]);

useEffect(() => {
// In the detectSubscriptions function, modify it like this:
const detectSubscriptions = async () => {
  if (!currentUser) {
    setActiveSubs([]);
    return;
  }

  try {
    // First check for active subscriptions from props (for paid plans)
    if (activeSubscriptions && activeSubscriptions.length > 0) {
      console.log('Using activeSubscriptions from props:', activeSubscriptions);
      setActiveSubs(activeSubscriptions);
      // Set the first subscription as active tab if none is set
      if (!activeTab && activeSubscriptions.length > 0) {
        setActiveTab(activeSubscriptions[0]);
      }
      return;
    }

    // If no active subscriptions from props, check for trial
    const isTrialActive = await hasActiveTrial();
    if (isTrialActive) {
      console.log('✅ Active trial found, activating all plans');
      const allPlans = [
        'swing_equity',
        'swing_commodity',
        'equity_investing',
      ];
      setActiveSubs(allPlans);
      if (!activeTab && allPlans.length > 0) {
        setActiveTab(allPlans[0]);
      }
      return;
    }

    // Fallback to checking currentUser.subscriptionData if needed
    const paidSubs = await getActivePaidSubscriptions(currentUser);
    if (paidSubs.length > 0) {
      setActiveSubs(paidSubs);
      if (!activeTab) setActiveTab(paidSubs[0]);
      return;
    }
    

    // No active subscriptions found
    console.log('No active subscriptions or trial found');
    setActiveSubs([]);
    
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    setActiveSubs([]);
  }
};

  detectSubscriptions();
}, [currentUser]);

  // Effect to set the initial active tab when component mounts or activeSubs changes
  useEffect(() => {
    if (activeSubs.length > 0 && !activeTab) {
      console.log('Setting initial active tab to first subscription:', activeSubs[0]);
      setActiveTab(activeSubs[0]);
    } else if (activeTab && !activeSubs.includes(activeTab)) {
      // If current activeTab is not in activeSubs, set it to first available subscription
      console.log('Current tab not in active subscriptions, resetting to first available');
      setActiveTab(activeSubs[0] || '');
    }
  }, [activeSubs]); // Only run when activeSubs changes

  // Handle tab change
  const handleTabChange = (plan) => {
    console.log('Tab changed to:', plan);
    if (activeSubs.includes(plan)) {
      setActiveTab(plan);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Check KYC status when component mounts or user changes
  useEffect(() => {
    const checkKycStatus = async () => {
    if (!currentUser) {
      setIsCheckingKyc(false);
      return;
    }

    const isTrialActive = await hasActiveTrial();
    if (activeSubs.length === 0 && !isTrialActive) {
      setIsCheckingKyc(false);
      setKycStatus('no_subscriptions');
      return;
    }
    
    // Only check KYC if user has active subscriptions
    if (activeSubs.length === 0) {
      setIsCheckingKyc(false);
      setKycStatus('no_subscriptions');
      return;
    }
    
  try {
  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};
  
  // More robust completion check - check both flag and timestamp
  const hasCompletedKycEsign = userData.kycEsignCompleted === true && 
                              userData.kycEsignCompletedAt && 
                              new Date(userData.kycEsignCompletedAt).getTime() > 0;
  
  if (hasCompletedKycEsign) {
    console.log('✅ User has already completed KYC/eSign process, skipping...');
    setKycStatus('verified');
    setEsignStatus('verified');
    setKycEsignCompleted(true);
    setIsCheckingKyc(false);
    setIsCheckingEsign(false);
    return;
  }
} catch (error) {
  console.error('Error checking completion status:', error);
}
    try {
      const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : "http://localhost:3001";
      const response = await fetch(`${API_BASE_URL}/api/kyc/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference_id: `KYC_${Date.now()}_${currentUser.uid}` }),
        credentials: 'include'
      });
      
      const result = await response.json();
      setKycStatus(result.status === 'SUCCESS' ? 'verified' : 'pending');
    } catch (error) {
      console.error('KYC status check failed:', error);
      setKycStatus('pending');
    } finally {
      setIsCheckingKyc(false);
    }
  };

  checkKycStatus();
}, [currentUser, activeSubs]);
// Add this new useEffect to sync kycEsignCompleted state with user document changes
useEffect(() => {
  const syncCompletionStatus = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const hasCompleted = userData.kycEsignCompleted === true && 
                          userData.kycEsignCompletedAt && 
                          new Date(userData.kycEsignCompletedAt).getTime() > 0;
      
      setKycEsignCompleted(hasCompleted);
    } catch (error) {
      console.error('Error syncing completion status:', error);
    }
  };

  syncCompletionStatus();
}, [currentUser?.uid]); // Only depend on user ID change


// Check eSign status when KYC is verified
useEffect(() => {
  if (kycStatus === 'verified' && currentUser) {
    const checkEsignStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        const esignData = userData.esignData;

        if (esignData && esignData.requestId) {
          const result = await verifyEsignStatus(esignData.requestId);
          const isVerified = result.agreement_status === 'completed' && 
                            result.signing_parties?.some(party => 
                              party.status === 'signed' && 
                              party.identifier === currentUser.email
                            );
          setEsignStatus(isVerified ? 'verified' : 'pending');
        } else {
          setEsignStatus('not_started');
        }
      } catch (error) {
        console.error('eSign status check failed:', error);
        setEsignStatus('not_started');
      }
    };

    checkEsignStatus();
  }
}, [kycStatus, currentUser]);
// Add this useEffect to ensure completion status is properly synchronized
useEffect(() => {
  const ensureCompletionStatus = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Check if both KYC and eSign are verified in Firebase
      const kycVerified = userData.kycStatus === 'approved' || userData.kycData?.status === 'approved';
      const esignVerified = userData.esignStatus === 'verified' || userData.esignData?.status === 'verified';
      
      if (kycVerified && esignVerified) {
        // Both are verified, update completion status if not already set
        if (!userData.kycEsignCompleted) {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            kycEsignCompleted: true,
            kycEsignCompletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        setKycEsignCompleted(true);
        setKycStatus('verified');
        setEsignStatus('verified');
      }
    } catch (error) {
      console.error('Error ensuring completion status:', error);
    }
  };

  // Run this check after a delay to ensure other status checks have completed
  const timer = setTimeout(ensureCompletionStatus, 2000);
  return () => clearTimeout(timer);
}, [currentUser?.uid]);
const checkKycStatusFromFirebase = async () => {
  try {
    setIsCheckingKyc(true);

    // Get KYC data from Firebase
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    const kycData = userData.kycData;

    if (!kycData || !kycData.requestId) {
      console.log('No KYC data found in Firebase');
      setKycStatus('not_started');
      setIsCheckingKyc(false);
      return;
    }

//     console.log('🔍 [DEBUG] Firebase KYC status:', userData.kycStatus);
//     console.log('🔍 [DEBUG] Firebase KYC data status:', kycData.status);

//     // If Firebase already has approved status, use it directly
//     if (kycData.status === 'approved' || userData.kycStatus === 'approved') {
//       console.log('🔍 [DEBUG] Using Firebase approved status directly');
//       setKycStatus('verified');
//       setIsCheckingKyc(false);
//       return;
//     }
//     // Add this code when both KYC and eSign are verified
// if (kycStatus === 'verified' && esignStatus === 'verified') {
//   const userRef = doc(db, 'users', currentUser.uid);
//   await updateDoc(userRef, {
//     kycEsignCompleted: true,
//     kycEsignCompletedAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   });
//   setKycEsignCompleted(true);

// }

//     // Only call backend API if Firebase doesn't have a proper status
//     console.log('🔍 [DEBUG] Calling backend API for status check');
//     const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : "http://localhost:3001";
//     const response = await fetch(`${API_BASE_URL}/api/kyc/verify`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ requestID: kycData.requestId }),
//       credentials: 'include'
//     });

    // 1. First, call the backend API to verify KYC status
    console.log('🔍 [DEBUG] Calling backend API for status check');
    const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : "http://localhost:3001";
    
    const response = await fetch(`${API_BASE_URL}/api/kyc/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        requestID: kycData.requestId,
        reference_id: kycData.referenceId || `KYC_${currentUser.uid}`
      }),
      credentials: 'include'
    });

    const result = await response.json();
    console.log('🔍 [DEBUG] Backend API response:', result);

    // 2. Update Firebase with the latest status from backend
    const newStatus = (result.status === 'verified' || result.status === 'approved' || result.status === 'SUCCESS') 
      ? 'approved' 
      : 'pending';

    await updateDoc(doc(db, 'users', currentUser.uid), {
      'kycData.status': newStatus,
      'kycStatus': newStatus,
      'kycData.lastChecked': new Date().toISOString(),
      'updatedAt': new Date().toISOString()
    });

    // 3. Update local state
    const displayStatus = newStatus === 'approved' ? 'verified' : 'pending';
    setKycStatus(displayStatus);

    // 4. If approved, check eSign status
    if (newStatus === 'approved') {
      checkEsignStatusFromFirebase();
    }

    return displayStatus;
  }catch (error) {
    console.error('KYC status check failed:', error);
    setKycStatus('pending');
  } finally {
    setIsCheckingKyc(false);
  }
};
// KYC Verification Functions
const initiateKYC = async () => {

  setKycLoading(true);

  try {
    console.log('Initiating KYC for user:', currentUser.email);
    
    const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : "http://localhost:3001";
    // Adjust based on your backend URL
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
    const kycData = {
      customer_identifier: currentUser.email,
      customer_name: userName,
      reference_id: `KYC_${Date.now()}_${currentUser.uid}`,
      request_details: {
        user_id: currentUser.uid 
      }
    };
    console.log('Sending KYC request with data:', kycData);

    const response = await fetch(`${API_BASE_URL}/api/kyc/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kycData)
    });
    
    const result = await response.json();
    if (result.success) {
      // Store KYC data in Firebase
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        kycData: {
          requestId: result.requestId,
          referenceId: result.referenceId,
          status: 'pending',
          initiatedAt: new Date().toISOString(),
          customerIdentifier: currentUser.email
        },
        kycStatus: 'pending',
        updatedAt: new Date().toISOString()
      });
      
      // Refresh user data
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
      
      const digio = new window.Digio(getDigioOptions(currentUser, async () => {
        await checkKycStatusFromFirebase();
        console.log("KYC updated");
      }), handleDigioCancel);
      digio.init(); // Required to initialize the popup/iframe

      if (result.token_id) {
        digio.submit(result.requestId, currentUser.email, result.token_id);
      } else {
        digio.submit(result.requestId, currentUser.email);
      }
    } else {
      toast.error('KYC failed: ' + result.message);
    }

  } catch (error) {
    console.error('Error initiating KYC:', error);
    toast.error('Something went wrong while initiating KYC.');
  }
};

// eSign Verification Functions
const handleInitiateEsign = async () => {

  setESignLoading(true);
  try {
    if (!currentUser?.email) {
      console.error('No user email available');
      toast.success('Please sign in to initiate eSign');
      return;
    }
    console.log('Initiating eSign for user:', currentUser.email);
    const esignData = {
      customer_identifier: currentUser.email
    };
    console.log('Sending eSign request with data:', esignData);
    const result = await initiateEsignService(esignData);
    if (result.success) {
      // Store eSign data in Firebase
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        esignData: {
          requestId: result.requestId,
          status: 'pending',
          initiatedAt: new Date().toISOString(),
          customerIdentifier: currentUser.email
        },
        esignStatus: 'pending',
        updatedAt: new Date().toISOString()
      });

      // Refresh user data
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }

      const digio = new window.Digio(getDigioOptions(currentUser, async (response) => {
        console.log('🔁 eSign callback response:', response);

        if (response.error_code) {
          toast.error('eSign failed: ' + response.message);
        } else {
          toast.success('eSign completed successfully!');
          await checkEsignStatusFromFirebase();
        }
      }), handleDigioCancel);

      digio.init(); // Required
      if (result.token_id) {
        digio.submit(result.requestId, currentUser.email, result.token_id);
      } else {
        digio.submit(result.requestId, currentUser.email);
      }

      console.log('eSign initiated and stored in Firebase:', result.requestId);
    } else {
      toast.error('eSign failed: ' + result.message);
    }
  } catch (error) {
    console.error('Error initiating eSign:', error);
    toast.error('Something went wrong while initiating eSign.');
  }
};

const checkEsignStatusFromFirebase = async () => {
  try {
    setIsCheckingEsign(true);

    // Get eSign data from Firebase
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    const esignData = userData.esignData;

    if (!esignData || !esignData.requestId) {
      console.log('No eSign data found in Firebase');
      setEsignStatus('not_started');
      setIsCheckingEsign(false);
      return 'not_started';
    }

    // Use stored requestId for verification
    const result = await verifyEsignStatus(esignData.requestId);
    console.log('eSign verification result:', result);

    // Check if agreement is completed and signed
    const isVerified = result.agreement_status === 'completed' && 
                      result.signing_parties?.some(party => 
                        party.status === 'signed' && 
                        party.identifier === currentUser.email
                      );

    // Determine the status to save
    const status = isVerified ? 'verified' : 'pending';

    // Update Firebase with new status
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      esignData: {
        ...esignData,
        status: status,
        lastChecked: new Date().toISOString(),
        lastResponse: result
      },
      esignStatus: status,
      updatedAt: new Date().toISOString()
    });

    setEsignStatus(status);
    
    // Set the status message
    if (status === 'verified') {
      setEsignStatusMessage('eSign verification completed successfully! Your stock recommendations are now unlocked.');
      // Update KYC eSign completion status if both are verified
      if (kycStatus === 'verified') {
        await updateDoc(userRef, {
          kycEsignCompleted: true,
          kycEsignCompletedAt: new Date().toISOString()
        });
        setKycEsignCompleted(true);
      }
    } else {
      setEsignStatusMessage('Your eSign verification is still pending. Please check your email and complete the signing process using the link we sent you.');
    }
    
    console.log('eSign status updated to:', status);
    return status;

  } catch (error) {
    console.error('eSign status check failed:', error);
    setEsignStatus('pending');
    setEsignStatusMessage('Unable to check eSign status. Please try again.');
    return 'error';
  } finally {
    setIsCheckingEsign(false);
  }
};

    
   

  // Test function to fetch and log raw API response
  const testApiEndpoint = async () => {
    try {
      const endpoint = API_CONFIG.baseUrl + API_CONFIG.endpoints.swing_equity;
      console.log('Testing API endpoint:', endpoint);
      
      const response = await fetchWithRetry(endpoint, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      
      const data = await response.json();
      console.log('Raw API Response (test):', JSON.stringify(data, null, 2));
      
      // Log response structure
      if (Array.isArray(data)) {
        console.log('Response is an array with length:', data.length);
        if (data.length > 0) {
          console.log('First item keys:', Object.keys(data[0]));
          console.log('First item values:', data[0]);
        }
      } else if (data && typeof data === 'object') {
        console.log('Response is an object with keys:', Object.keys(data));
        // Check for common data containers
        const possibleKeys = ['data', 'results', 'items', 'stocks', 'recommendations'];
        for (const key of possibleKeys) {
          if (Array.isArray(data[key])) {
            console.log(`Found array in key '${key}' with ${data[key].length} items`);
            if (data[key].length > 0) {
              console.log(`First ${key} item:`, data[key][0]);
            }
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error testing API endpoint:', error);
      return null;
    }
  };

  // Call the test function when component mounts
  useEffect(() => {
    testApiEndpoint();
  }, []);

  // Consolidated effect to fetch data when activeTab or kycStatus changes
 // Consolidated effect to fetch data when activeTab, kycStatus, and esignStatus change
useEffect(() => {
  if (activeTab && kycStatus === 'verified' && esignStatus === 'verified') {
    const alreadyLoaded = stocks[activeTab] && stocks[activeTab].length > 0;
    const isLoading = loading[activeTab];

    

    if (!alreadyLoaded && !isLoading) {
      fetchSubscriptionData(activeTab);
    }
  }
}, [activeTab, kycStatus, esignStatus]);

  const fetchSubscriptionData = async (plan) => {
    console.log(`[${plan}] Starting optimized data fetch`);
    setLoading((prev) => ({ ...prev, [plan]: true }));
    setErrors((prev) => ({ ...prev, [plan]: '' }));

    try {
      const normalizedPlan = plan.replace(/-/g, '_');
      const endpoint = API_CONFIG.endpoints[normalizedPlan];
      if (!endpoint) {
        throw new Error(`No endpoint configured for plan: ${plan}`);
      }
      const fullUrl = `${API_CONFIG.baseUrl}${endpoint}`;
      
      console.log(`[${plan}] Fetching data from: ${fullUrl}`);

      // Make the API request with retry logic
      const response = await fetchWithRetry(fullUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });

      // Parse the response
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.group(`[${plan}] Response Analysis`);
        console.log('Response Type:', Array.isArray(data) ? 'Array' : 'Object');
        
        if (Array.isArray(data)) {
          console.log(`Array length:`, data.length);
          if (data.length > 0) {
            console.log('First item:', data[0]);
            console.log('First item keys:', Object.keys(data[0]));
          }
        } else if (data && typeof data === 'object') {
          console.log('Top-level keys:', Object.keys(data));
          
          // Check common response structures
          const possibleDataKeys = ['data', 'results', 'items', 'stocks', 'recommendations'];
          for (const key of possibleDataKeys) {
            if (data[key] !== undefined) {
              console.log(`Found data in key: ${key}`, Array.isArray(data[key]) ? 
                `(Array of ${data[key].length} items)` : 
                `(Type: ${typeof data[key]})`);
              
              if (Array.isArray(data[key]) && data[key].length > 0) {
                console.log(`First ${key} item:`, data[key][0]);
                console.log(`${key} item keys:`, Object.keys(data[key][0]));
              }
            }
          }
        }
        console.groupEnd();
        
      } catch (e) {
        console.error(`[${plan}] Error parsing JSON:`, e);
        console.error('Raw response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${e.message}`);
      }

      // Extract the data array from the response
      let stockData = [];
      
      // First, try to find the data array in common response structures
      const possibleDataKeys = ['data', 'results', 'items', 'stocks', 'recommendations'];
      
      if (Array.isArray(data)) {
        stockData = data; // Response is already an array
      } else if (data && typeof data === 'object') {
        // Look for common data container keys
        for (const key of possibleDataKeys) {
          if (data[key] && Array.isArray(data[key])) {
            stockData = data[key];
            console.log(`[${plan}] Found data in key: ${key} (${stockData.length} items)`);
            break;
          }
        }
        
        // If no array found but the object has properties that look like stock data
        if (stockData.length === 0 && Object.keys(data).length > 0) {
          console.log(`[${plan}] No array found in response, treating top-level object as single item`);
          stockData = [data];
        }
      }
      
      console.log(`[${plan}] Extracted ${stockData.length} items for processing`);

      // Log the first item to see its structure
      if (stockData.length > 0) {
        console.log(`[${plan}] First item structure:`, stockData[0]);
        console.log(`[${plan}] First item keys:`, Object.keys(stockData[0]));
      }

      // Log the raw data before processing
      console.log(`[${plan}] Raw stock data before processing:`, stockData);

      // Log the raw data structure for debugging
      console.log(`[${plan}] Raw data structure:`, JSON.stringify(stockData, null, 2));

      // Map the API response to match our column structure
      stockData = stockData.map((item, index) => {
        if (!item || typeof item !== 'object') {
          console.warn(`[${plan}] Invalid item at index ${index}:`, item);
          return null;
        }

        console.log(`[${plan}] Processing item ${index}:`, item);
        
        // Get all available keys from the item
        const itemKeys = Object.keys(item);
        console.log(`[${plan}] Available keys in item:`, itemKeys);

        // Define field mappings for each subscription type
        const fieldMappings = {
          // Stock of the Month mapping
          stock_of_month: {
            'Sr. No.': 'srNo',
            'Stock Name': 'stockName',
            'NSE/ BSE Code': 'nseBseCode',
            'Type':'type',
            'Sector':'sector',
            'Preferred Allocation (%)': 'preferredAllocation',
            'Recommendation': 'recommendation',
            'Research Report': 'researchReport'
          },
          // Swing Equity mapping
          swing_equity: {
            'Stock': 'stock',
            'Action (Buy / Sell)': 'action',
            'Entry Date': 'entryDate',
            'Exit Date': 'exitDate',
            'Exit Price': 'exitPrice',
            'P/L %': 'pl',
            'Recommended Price': 'price',
            'Sr. No.': 'srNo',
            'Status': 'status',
            'Stop Loss': 'stopLoss',
            'Target Price': 'target',
            'Update on Recommenation': 'update'
          },
          // Swing Commodity mapping
          swing_commodity: {
            'Commodity': 'commodity',
            'Action (Buy / Sell)': 'action',
            'Entry Date': 'entryDate',
            'Exit Date': 'exitDate',
            'Exit Price': 'exitPrice',
            'Margin': 'margin',
            'P/L %': 'pl',
            'Recommended Price': 'price',
            'Sr. No.': 'srNo',
            'Status': 'status',
            'Stop Loss': 'stopLoss',
            'Target Price': 'target',
            'Upate on Recommenation': 'update'
          },
          // Equity Investing mapping
          equity_investing: {
            'Sr. No.': 'srNo',
            'Stock Name': 'stockName',
            'NSE/ BSE Code': 'nseBseCode',
            'Type':'type',
            'Sector':'sector',
            'Preferred Allocation (%)': 'preferredAllocation',
            'Recommendation': 'recommendation',
            'Research Report': 'researchReport'
          },
          // Default mapping (fallback)
          default: {
            'Stock': 'stock',
            'Entry Date': 'entryDate',
            'Exit Date': 'exitDate',
            'Exit Price': 'exitPrice',
            'P/L %': 'pl',
            'Recommended Price': 'price',
            'Sr. No.': 'srNo',
            'Status': 'status',
            'Stop Loss': 'stopLoss',
            'Target Price': 'target'
          }
        };

        // Get the appropriate mapping for the current plan
        const fieldMapping = fieldMappings[normalizedPlan] || fieldMappings.default;

        // Create mapped item with proper field names
        const mappedItem = {};
        for (const [apiField, ourField] of Object.entries(fieldMapping)) {
          mappedItem[ourField] = item[apiField] !== undefined ? item[apiField] : 'N/A';
        }

        // // Handle plan-specific fields and data formatting
        // if (plan === 'swing_equity' || plan === 'swing_commodity') {
        //   // Ensure action is properly formatted
        //   if (mappedItem.action === 'N/A' && item['Action (Buy / Sell)']) {
        //     mappedItem.action = item['Action (Buy / Sell)'];
        //   }
          
        //   // Format numbers to 2 decimal places
        //   if (mappedItem.price && mappedItem.price !== 'N/A') {
        //     mappedItem.price = parseFloat(mappedItem.price).toFixed(2);
        //   }
        //   if (mappedItem.target && mappedItem.target !== 'N/A') {
        //     mappedItem.target = parseFloat(mappedItem.target).toFixed(2);
        //   }
        //   if (mappedItem.stopLoss && mappedItem.stopLoss !== 'N/A') {
        //     mappedItem.stopLoss = parseFloat(mappedItem.stopLoss).toFixed(2);
        //   }
        //   if (mappedItem.exitPrice && mappedItem.exitPrice !== 'N/A') {
        //     mappedItem.exitPrice = parseFloat(mappedItem.exitPrice).toFixed(2);
        //   }
        //   if (mappedItem.pl && mappedItem.pl !== 'N/A') {
        //     mappedItem.pl = parseFloat(mappedItem.pl).toFixed(2);
        //   }
        // }
        
        // Special handling for commodity tab
        if (plan === 'swing_commodity') {
          // Use stock name as commodity if commodity is not available
          if ((!mappedItem.commodity || mappedItem.commodity === 'N/A') && mappedItem.stock) {
            mappedItem.commodity = mappedItem.stock;
          }
          
          // Set default margin if not provided
          if (!mappedItem.margin || mappedItem.margin === 'N/A') {
            // Calculate margin as 10% of the price if price is available
            if (mappedItem.price && mappedItem.price !== 'N/A') {
              const price = parseFloat(mappedItem.price);
              mappedItem.margin = (price * 0.10).toFixed(2); // 10% margin
            } else {
              mappedItem.margin = 'N/A';
            }
          }
        }

        console.log(`[${plan}] Mapped item ${index}:`, mappedItem);
        return mappedItem;
      }).filter(Boolean); // Remove any null items

      console.log(`[${plan}] Processed Stock Data:`, stockData);

      if (stockData.length > 0) {
        stockData.sort((a, b) => {
          const srNoA = parseInt(a.srNo) || 0;
          const srNoB = parseInt(b.srNo) || 0;
          return srNoB - srNoA; // Descending order
        });
        console.log(`[${plan}] Data sorted by Sr. No. in descending order`);
        console.log(`[${plan}] Updating UI with ${stockData.length} items`);
        updateColumnOrder(plan, stockData);
        setStocks((prev) => ({
          ...prev,
          [plan]: stockData,
        }));
      } else {
        console.warn(`[${plan}] No data in the response`);
        setStocks((prev) => ({
          ...prev,
          [plan]: [],
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${plan} stocks:`, error);
      let errorMessage;
      if (error.message.includes('Failed to fetch')) {
        errorMessage =
          'Unable to connect to the server. Please check your internet connection or try again later.';
      } else if (error.message.includes('API Error')) {
        errorMessage = error.message;
      } else {
        errorMessage = `Failed to load ${plan} recommendations: ${error.message}`;
      }

      setErrors((prev) => ({
        ...prev,
        [plan]: errorMessage,
      }));

      setStocks((prev) => ({
        ...prev,
        [plan]: [],
      }));
    } finally {
      setLoading((prev) => ({
        ...prev,
        [plan]: false,
      }));
    }
  };

  const renderTab = (plan) => {
    const latestNormalizedPlan = plan.replace(/-/g, '_');
    const config = SUBSCRIPTION_CONFIG[latestNormalizedPlan] || {};
    const color = config.color || 'blue';
    const isActive = activeTab === plan;
    const colorClasses = colorConfig[color] || colorConfig.blue;
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors duration-200';
    const activeClasses = isActive ? colorClasses.active : colorClasses.inactive;
    const disabledClasses = !activeSubs.includes(plan) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return (
      <button
        key={plan}
        onClick={() => handleTabChange(plan)}
        disabled={!activeSubs.includes(plan)}
        className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {config.name || plan.replace(/_/g, ' ')}
      </button>
    );
  };

  const renderContent = () => {
    if (!activeTab) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Loading recommendations...</p>
        </div>
      );
    }
    const normalizedTab = activeTab.replace(/-/g, '_');
    const config = SUBSCRIPTION_CONFIG[normalizedTab];
    const tabStocks = stocks[activeTab] || [];
    const isLoading = loading[activeTab];
    const error = errors[activeTab];

    // If we don't have a valid config for the active tab, show an error
    if (!config || !config.columns) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Unable to load recommendations for the selected plan. Please try again or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white shadow overflow-hidden  sm:rounded-b-lg sm:rounded-tr-lg min-h-96">
        {/* Instructions Section */}
        {config.instructions && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 m-6 rounded-r-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              {config.instructions.title}
            </h3>
            <ol className="list-decimal list-inside space-y-2">
              {config.instructions.points.map((point, index) => (
                <li key={index} className="text-sm text-blue-800">
                  {point}
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {config.columns.map((column) => (
                  <th 
                    key={column.id} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tabStocks && tabStocks.length > 0 ? (
                tabStocks.map((stock, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {config.columns.map((column) => {
                      const value = stock[column.id]
                      const stringValue = value !== undefined && value !== null ? value.toString() : 'N/A';
                      // Handle case-insensitive "buy" or "sell"
                      const lowerValue = stringValue.trim().toLowerCase();
                      const isBuy = lowerValue === 'buy';
                      const isSell = lowerValue === 'sell';
                      return (
                        <td 
                          key={column.id} 
                          className= {`px-6 py-4 whitespace-nowrap text-sm ${
                                      isBuy
                                        ? 'text-green-600 font-medium'
                                        : isSell
                                        ? 'text-red-600 font-medium'
                                        : 'text-gray-500'
                                    }`}
                        >
                          {
                          /^https?:\/\//.test(stringValue) ? (
                            <a href={stringValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              Research Report
                            </a>
                          ) : (
                            stringValue
                          )
                        }
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={config.columns.length} 
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No  recommendations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  // If no active tab is selected but we have subscriptions, set the first one as active
  useEffect(() => {
    if (!activeTab && activeSubs.length > 0) {
      setActiveTab(activeSubs[0]);
    }
  }, [activeTab, activeSubs]);

  // Show loading state while checking KYC status
  if (isCheckingKyc) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
// Show KYC verification UI if not verified AND has active subscriptions AND not completed before
if (kycStatus !== 'verified' && activeSubs.length > 0 && !kycEsignCompleted) {
  return (
    <div className="container mx-auto px-4 py-16 pt-24 min-h-screen">
      <div className="text-base leading-relaxed text-gray-800">
        <h2 className="text-lg font-semibold mb-4">🔔 Mandatory KYC & eSign for Research Analyst Services</h2>

        <p className="mb-4">
          As per the Securities and Exchange Board of India (SEBI) regulations, all customers are required to complete the following before availing Research Analyst services:
        </p>

        <ol className="list-decimal list-inside space-y-4">
          <li>
            <strong>KYC Verification</strong>
            <p className="mt-1">
              In accordance with SEBI Master Circular No. SEBI/HO/MIRSD/SECFATF/P/CIR/2023/169 (dated October 12, 2023), KYC completion is mandatory before you can access research services.
              <br />
              👉 During KYC verification, an OTP will be sent to your registered mobile number for authentication.
            </p>
          </li>

          <li>
            <strong>eSign – Terms & Conditions</strong>
            <p className="mt-1">
              As per SEBI (Research Analysts) (Third Amendment) Regulations, 2024 – Regulation 24(6), customers must electronically sign and consent to the Terms & Conditions before services are activated.
              <br />
              👉 For eSign, an OTP will be sent to your registered email address to securely complete the signature.
            </p>
          </li>
        </ol>

        <ul className="list-disc list-inside mt-6 mb-6 space-y-2 text-green-700 font-medium">
          <li>✅ These steps ensure compliance with SEBI standards and protect investor interests.</li>
          <li>⚡ Please complete both steps promptly to activate uninterrupted access to our research services.</li>
        </ul>
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <p className='text-red-500'> Please read above instructions carefully before starting KYC </p>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-12">
            <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4"> <p className='text-red-500'> step-1 </p>Complete KYC Verification</h2>
          <p className="text-gray-600 mb-12">
            To access your recommendations, please complete the KYC (Know Your Customer) verification process.
          </p>
          
          <div className="space-y-4">
            {!userData?.kycData?.requestId || kycLoading || kycStatus === 'pending' ? (
              <button
                onClick={initiateKYC}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start KYC Verification
              </button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    console.log('🔍 [DEBUG] Check Verification Status clicked');
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    const kycData = userData.kycData;
                    
                    console.log('🔍 [DEBUG] Full user data:', userData);
                    console.log('🔍 [DEBUG] KYC data:', kycData);
                    await checkKycStatusFromFirebase();
                    
                    if (kycStatus === 'pending') {
                      setKycStatusMessage('Your KYC verification is still in progress. Please complete the verification process using the link sent to your email.');
                      setShowKycStatusPopup(true);
                    } else if (kycStatus === 'verified') {
                      setKycStatusMessage('KYC verification completed successfully! Please complete eSign verification to access your recommendations.');
                      setShowKycStatusPopup(true);
                      // Trigger eSign status check
                      setTimeout(() => {
                        checkEsignStatusFromFirebase();
                      }, 2000);
                    }
                  } catch (error) {
                    console.error('🔍 [DEBUG] Error in status check:', error);
                    setKycStatusMessage('Unable to check KYC status. Please try again.');
                    setShowKycStatusPopup(true);
                  }
                }}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Proceed to Esign verification 
              </button>
            )}
            
          </div>
          
          {/* {userData?.kycData?.requestId && (
            <p className="text-sm text-gray-500 mt-6">
              KYC verification link has been sent to your email. Please check your inbox and complete the process.
            </p>
          )} */}
        </div>
      </div>
      
      {/* KYC Success Popup */}
      {/* {showKycPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">KYC Request Sent!</h3>
              <p className="text-sm text-gray-500 mb-6">
                We've sent a verification link to your email. Please check your inbox and complete the KYC process to unlock recommendations.
              </p>
              <button
                onClick={() => setShowKycPopup(false)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )} */}
      {/* KYC Status Popup */}
      {showKycStatusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">KYC Status Update</h3>
              <p className="text-sm text-gray-500 mb-6">
                {kycStatusMessage}
              </p>
              <button
                onClick={() => setShowKycStatusPopup(false)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* eSign Status Popup - Removed duplicate popup */}
    </div>
  );
}


// Show eSign verification UI if KYC is verified but eSign is not AND not completed before
if (kycStatus === 'verified' && esignStatus !== 'verified' && !kycEsignCompleted)  {
  return (
    <div className="container mx-auto px-4 py-16 pt-24 min-h-screen">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-12">
            <svg className="mx-auto h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">  <p className='text-red-500'> step-2 </p>Complete eSign Verification</h2>
          <p className="text-gray-600 mb-12">
            Your KYC is verified! Please complete the eSign process to access your stock recommendations.
          </p>
          
          <div className="space-y-4">
            {!userData?.esignData?.requestId || !eSignLoading ? (
              <button
                onClick={handleInitiateEsign}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start eSign Verification
              </button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    console.log('Button clicked. Current state before check:', { 
                      showEsignStatusPopup, 
                      esignStatus,
                      esignStatusMessage 
                    });
                    console.log('Calling checkEsignStatusFromFirebase...');
                    const status = await checkEsignStatusFromFirebase();
                    console.log('Received status from checkEsignStatusFromFirebase:', status);
                    
                    // Set appropriate status message based on the returned status
                    if (status === 'verified') {
                      setEsignStatusMessage('eSign verification completed successfully! Your stock recommendations are now unlocked.');
                    } else if (status === 'pending') {
                      setEsignStatusMessage('Your eSign verification is still pending. Please check your email and complete the signing process using the link we sent you.');
                    } else {
                      setEsignStatusMessage('Please complete the eSign verification to access your recommendations.');
                    }
                    
                    // Make sure the popup is shown
                    console.log('Status from checkEsignStatusFromFirebase:', status);
                    console.log('Current state before update:', {
                      currentEsignStatus: esignStatus,
                      currentMessage: esignStatusMessage,
                      currentShowPopup: showEsignStatusPopup
                    });
                    
                    // Force update the state to ensure the popup is shown
                    console.log('Setting showEsignStatusPopup to true and updating message');
                    setShowEsignStatusPopup(true);
                    
                    // Log after state update (this will show in the next render)
                    setTimeout(() => {
                      console.log('State after update (in timeout):', {
                        esignStatus,
                        esignStatusMessage,
                        showEsignStatusPopup
                      });
                    }, 0);
                  } catch (error) {
                    console.error('Error checking eSign status:', error);
                    setEsignStatusMessage('Unable to check eSign status. Please try again.');
                    setShowEsignStatusPopup(true);
                  }
                }}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Proceed to Recommendations
              </button>
            )}
            
          </div>
          
          {/* {userData?.esignData?.requestId && (
            <p className="text-sm font-semibold text-red-500 mt-6">
              eSign verification link has been sent to your email. Please check your inbox and complete the process.
            </p>
          )} */}
        </div>
      </div>
      
      {/* eSign Success Popup */}
      {/* {showEsignPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">eSign Request Sent!</h3>
              <p className="text-sm text-gray-500 mb-6">
                We've sent an eSign link to your email. Please check your inbox and complete the eSign process to unlock recommendations.
              </p>
              <button
                onClick={() => setShowEsignPopup(false)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
    
  );
}


  const subsToDisplay = activeSubs.length > 0 ? activeSubs : (activeTab ? [activeTab] : []);

  if (subsToDisplay.length > 0 && !subsToDisplay.includes("stock-of-month")) {
    subsToDisplay.push("stock-of-month");
  }

  console.log('Rendering component. showEsignStatusPopup:', showEsignStatusPopup, 'esignStatusMessage:', esignStatusMessage);
  
  return (
    <>
      {showEsignStatusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">eSign Status Update</h3>
              <p className="text-sm text-gray-500 mb-6">
                {esignStatusMessage}
              </p>
              <button
                onClick={() => setShowEsignStatusPopup(false)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-72 pt-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommendations</h1>
          <p className="text-gray-600 mt-2">
            View and analyze recommendations across your subscription plans.
          </p>
        </div>

        {subsToDisplay.length > 0 ? (
          <div>
            <div className="flex border-b border-gray-200">
              {subsToDisplay.map(plan => renderTab(plan))}
            </div>
            <div className="mt-0">
              {renderContent()}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Active Recommendations</h3>
            <p className="mt-1 text-sm text-gray-500">You do not have any active subscription plans with recommendations.</p>
            <button
              onClick={() => navigate('/subscription')}
              className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              View Subscription Plans
            </button>
          </div>
        )}

        {activeTab === 'basic' && (
          <div className="mt-8 rounded-md bg-indigo-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">Upgrade Your Plan</h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <p>You're currently viewing basic  recommendations. Upgrade to access premium features and more detailed analysis.</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/subscription')}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    View Plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StockRecommendations;