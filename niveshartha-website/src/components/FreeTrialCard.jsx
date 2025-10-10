import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp, getDoc, doc, updateDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { initiateKYC } from '../services/kyc.service';

const FreeTrialCard = ({isTrialActive}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [isCheckingKyc, setIsCheckingKyc] = useState(true);
  const [showKycPopup, setShowKycPopup] = useState(false);
  const [kycStatusMessage, setKycStatusMessage] = useState('');
  const [kycEsignCompleted, setKycEsignCompleted] = useState(false);

  // Check KYC status when component mounts or user changes
  useEffect(() => {
    const checkKycStatus = async () => {
      if (!currentUser) {
        setIsCheckingKyc(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        // Check if KYC/eSign is already completed
        const hasCompletedKycEsign = userData.kycEsignCompleted === true && 
                                    userData.kycEsignCompletedAt && 
                                    new Date(userData.kycEsignCompletedAt).getTime() > 0;
        
        if (hasCompletedKycEsign) {
          setKycStatus('verified');
          setKycEsignCompleted(true);
          setIsCheckingKyc(false);
          return;
        }

        // Check KYC status from user document
        if (userData.kycStatus === 'approved' || (userData.kycData && userData.kycData.status === 'approved')) {
          setKycStatus('verified');
        } else {
          setKycStatus(userData.kycStatus || 'not_started');
        }
        
      } catch (error) {
        console.error('Error checking KYC status:', error);
        setKycStatus('error');
      } finally {
        setIsCheckingKyc(false);
      }
    };

    checkKycStatus();
  }, [currentUser]);

  const handleStartTrial = async () => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          from: '/subscription', 
          message: 'Please sign in to start your free trial' 
        } 
      });
      return;
    }
  
    setIsLoading(true);
    
    try {
      // 1. Check if user already has an active trial
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(
        subscriptionsRef, 
        where("userId", "==", currentUser.uid),
        where("isTrial", "==", true),
        where("endDate", ">", new Date().toISOString())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // User already has an active trial, just redirect
        navigate('/stock-recommendations');
        return;
      }
  
      // 2. Create a single 28-day trial subscription with all plans included
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 28); // 28-day trial
      
      // Define all included plan IDs
      const includedPlans = [
        'swing_equity',
        'swing_commodity',
        'equity_investing',
        'stock_of_month',
        'diy_screener' // Add DIY Screener to the included plans
      ];
  
      // Create a single subscription document with all plans
      await addDoc(collection(db, 'subscriptions'), {
        subscriptionId: `trial_all_${Date.now()}`,
        userId: currentUser.uid,
        planId: 'free_trial_all',
        planName: '28-Day Free Trial (All Plans)',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: trialEndDate.toISOString(),
        isTrial: true,
        trialStartDate: new Date().toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        includedPlans: includedPlans, // Store all included plans in an array
        price: 0,
        createdAt: new Date().toISOString()
      });
  
      // 3. Update user's document to include trial information
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        activeSubscriptions: includedPlans, // Update with all included plans
        trialActive: true,
        trialStartDate: new Date().toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 4. Redirect to stock recommendations
      navigate('/stock-recommendations');
  
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Failed to start free trial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to create trial subscription
  const createTrialSubscription = async () => {
    // Set trial period (28 days from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 28);

    // Create trial subscription
    await addDoc(collection(db, 'subscriptions'), {
      subscriptionId: `trial_${Date.now()}`,
      userId: currentUser.uid,
      planId: 'free-trial',
      planName: '28-Day Free Trial',
      duration: '28 days',
      price: 0,
      status: 'active',
      startDate: startDate,
      endDate: endDate,
      isTrial: true,
      createdAt: serverTimestamp()
    });
  };
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-800 text-white text-center text-sm font-semibold">
          Start your 28-day FREE trial — all features included
        </div>
        
        <div className="p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Trial</h3>
          <p className="text-gray-600 mb-6">Experience all features for 28 days, no credit card required</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex flex-col items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="block">Full access to all features</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="block">No credit card required</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="block">Cancel anytime</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="block">No hidden fees</span>
            </div>
          </div>
          
          <button
            onClick={handleStartTrial}
            disabled={isLoading || isTrialActive}
            className={`w-full py-3 px-6 ${isTrialActive ? 'bg-gray-500 cursor-not-allowed' : isLoading ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'} text-white font-medium rounded-lg transition-colors duration-200`}
          >
            {isLoading ? 'Processing...' : isTrialActive ? 'Trial Already Used' : 'Start Free Trial'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default FreeTrialCard;
