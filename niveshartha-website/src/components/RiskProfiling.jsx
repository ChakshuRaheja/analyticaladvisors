import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ErrorBoundary from './ErrorBoundary';

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
  return getEnv('REACT_APP_API_BASE_URL', 'http://localhost:3001');
};

// Error boundary for form sections
const FormSection = ({ title, children }) => (
  <ErrorBoundary fallback={<div className="text-red-600 p-4 bg-red-50 rounded-md">An error occurred in the {title} section.</div>}>
    {children}
  </ErrorBoundary>
);

const RiskProfiling = () => {
  const { currentUser } = useAuth();
  
  // Combined loading, error, success states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Risk Profiling States
  const [riskFormData, setRiskFormData] = useState({
    fullName: '',
    age: '',
    occupation: '',
    annualIncome: '',
    investmentExperience: 'Beginner',
    investmentGoals: '1-3 years',
    riskTolerance: 'low',
    investmentObjectives: 'growth',
  });

  // KYC States
  const [kycStatus, setKycStatus] = useState(null); // pending, verified, failed
  const [kycFormData, setKycFormData] = useState({
    kycFullName: '', // As per PAN
    dateOfBirth: '',
    panNumber: ''
  });
  const [kycFormErrors, setKycFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
      setError('');
      try {
        // Fetch Risk Profile Data
        const userProfileDocRef = doc(db, 'userProfiles', currentUser.uid);
        const profileSnap = await getDoc(userProfileDocRef);
        if (profileSnap.exists() && profileSnap.data().riskProfile) {
          setRiskFormData(prev => ({
            ...prev,
            ...profileSnap.data().riskProfile
          }));
        }

        // Fetch KYC Data and Status
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setKycStatus(userData.kycStatus || 'pending');
          if (userData.kycData) {
            setKycFormData(prev => ({
              ...prev,
              kycFullName: userData.kycData.fullName || '',
              dateOfBirth: userData.kycData.dateOfBirth || '',
              panNumber: userData.kycData.panNumber || ''
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your data. Please try again.');
      }
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  const handleRiskChange = (e) => {
    const { name, value } = e.target;
    setRiskFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKycChange = (e) => {
    const { name, value } = e.target;
    // Convert PAN to uppercase
    if (name === 'panNumber') {
      setKycFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setKycFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateKycForm = () => {
    const errors = {};
    if (!kycFormData.kycFullName?.trim()) errors.kycFullName = 'Full name is required';
    if (!kycFormData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!kycFormData.panNumber?.trim()) {
      errors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(kycFormData.panNumber)) {
      errors.panNumber = 'Invalid PAN number format (e.g., ABCDE1234F)';
    }
    setKycFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRiskForm = () => {
    if (parseInt(riskFormData.age, 10) < 18) {
      setError('Age must be 18 or older.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!currentUser) {
        throw new Error('You must be logged in to submit this form.');
      }

      // Validate both forms
      const isRiskValid = validateRiskForm();
      const isKycValid = kycStatus === 'verified' || validateKycForm();

      if (!isRiskValid || !isKycValid) {
        return;
      }

      setLoading(true);

      try {
        // 1. Save Risk Profile Data
        const userProfileDocRef = doc(db, 'userProfiles', currentUser.uid);
        await setDoc(userProfileDocRef, { riskProfile: riskFormData }, { merge: true });
        
        // 2. Process KYC if not already verified
        if (kycStatus !== 'verified') {
          console.log('Attempting KYC verification...');
          
          // First, save KYC data to Firestore
          await updateDoc(doc(db, 'users', currentUser.uid), {
            kycData: {
              fullName: kycFormData.kycFullName,
              dateOfBirth: kycFormData.dateOfBirth,
              panNumber: kycFormData.panNumber,
              submittedAt: new Date().toISOString()
            }
          });
          
          // Try to call the KYC verification API
          try {
            const response = await fetch(`${getApiBaseUrl()}/api/kyc/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.uid,
                fullName: kycFormData.kycFullName,
                dateOfBirth: kycFormData.dateOfBirth,
                panNumber: kycFormData.panNumber
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || 'KYC verification failed');
            }

            const kycApiResult = await response.json();
            
            // Update user's KYC status in Firestore
            await updateDoc(doc(db, 'users', currentUser.uid), {
              kycStatus: 'verified',
              'kycData.verifiedAt': new Date().toISOString()
            });
            
            setKycStatus('verified');
            setSuccess('Your profile and KYC have been successfully verified!');
            
          } catch (apiError) {
            console.error('KYC API Error:', apiError);
            // Don't fail the entire submission if KYC API fails
            // Just log the error and continue with a warning
            setSuccess('Your profile has been saved, but KYC verification is pending.');
            setError('Note: KYC verification is pending. ' + (apiError.message || 'Please try again later.'));
          }
        } else {
          // If KYC is already verified, just show success
          setSuccess('Your profile has been updated successfully!');
        }
        
      } catch (err) {
        console.error('Submission error:', err);
        throw new Error(`Failed to save your data: ${err.message}`);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !success && !error) {
    return <div className="text-center p-10">Loading your profile information...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Complete Your Profile</h2>
      
      {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
      {success && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{success}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Risk Profiling Section --- */}
        <FormSection title="Investor Information">
        <section className="border border-gray-200 p-4 rounded-md">
          <h3 className="text-xl font-medium text-gray-700 mb-4">Investor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                id="fullName" 
                value={riskFormData.fullName} 
                onChange={handleRiskChange} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age (18+)</label>
              <input 
                type="number" 
                name="age" 
                id="age" 
                value={riskFormData.age} 
                onChange={handleRiskChange} 
                required 
                min="18" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">Occupation</label>
              <input 
                type="text" 
                name="occupation" 
                id="occupation" 
                value={riskFormData.occupation} 
                onChange={handleRiskChange} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700">Approximate Annual Income (INR)</label>
              <input 
                type="number" 
                name="annualIncome" 
                id="annualIncome" 
                value={riskFormData.annualIncome} 
                onChange={handleRiskChange} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="investmentExperience" className="block text-sm font-medium text-gray-700">Investment Experience</label>
              <select 
                name="investmentExperience" 
                id="investmentExperience" 
                value={riskFormData.investmentExperience} 
                onChange={handleRiskChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="investmentGoals" className="block text-sm font-medium text-gray-700">Investment Goals</label>
              <select 
                name="investmentGoals" 
                id="investmentGoals" 
                value={riskFormData.investmentGoals} 
                onChange={handleRiskChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="1-3 years">1–3 years</option>
                <option value="3-5 years">3–5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
            <div>
              <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700">Risk Tolerance</label>
              <select 
                name="riskTolerance" 
                id="riskTolerance" 
                value={riskFormData.riskTolerance} 
                onChange={handleRiskChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="investmentObjectives" className="block text-sm font-medium text-gray-700">Investment Objectives</label>
              <select 
                name="investmentObjectives" 
                id="investmentObjectives" 
                value={riskFormData.investmentObjectives} 
                onChange={handleRiskChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="growth">Growth</option>
                <option value="capital preservation">Capital Preservation</option>
                <option value="income">Income Generation</option>
                <option value="speculation">Speculation</option>
              </select>
            </div>
          </div>
        </section>
        </FormSection>

        {/* --- KYC Section --- */}
        <FormSection title="KYC Verification">
        {kycStatus === 'verified' ? (
          <section className="border border-green-200 bg-green-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-green-700 mb-2">✓ KYC Verification Complete</h3>
            <p className="text-green-600">Your KYC details are verified. You're all set!</p>
          </section>
        ) : (
          <section className="border border-gray-200 p-4 rounded-md">
            <h3 className="text-xl font-medium text-gray-700 mb-4">KYC Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="kycFullName" className="block text-sm font-medium text-gray-700">Full Name (as per PAN card)</label>
                <input 
                  type="text" 
                  name="kycFullName" 
                  id="kycFullName" 
                  value={kycFormData.kycFullName} 
                  onChange={handleKycChange} 
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${kycFormErrors.kycFullName ? 'border-red-500' : ''}`} 
                />
                {kycFormErrors.kycFullName && (
                  <p className="mt-1 text-sm text-red-600">{kycFormErrors.kycFullName}</p>
                )}
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  id="dateOfBirth" 
                  value={kycFormData.dateOfBirth} 
                  onChange={handleKycChange} 
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${kycFormErrors.dateOfBirth ? 'border-red-500' : ''}`} 
                />
                {kycFormErrors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{kycFormErrors.dateOfBirth}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">PAN Number</label>
                <input 
                  type="text" 
                  name="panNumber" 
                  id="panNumber" 
                  placeholder="ABCDE1234F" 
                  value={kycFormData.panNumber} 
                  onChange={handleKycChange} 
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${kycFormErrors.panNumber ? 'border-red-500' : ''}`} 
                />
                {kycFormErrors.panNumber && (
                  <p className="mt-1 text-sm text-red-600">{kycFormErrors.panNumber}</p>
                )}
              </div>
            </div>
          </section>
        )}
        </FormSection>
        
        {/* --- Submit Button --- */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Unlock My Investment Dashboard'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RiskProfiling;
